import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getWeeztixToken } from '@/lib/weeztix'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Extract ticket count from a Weeztix stats object.
 * Tries many possible field names since the exact API schema is unknown.
 */
function findTicketCount(obj: any): number {
  if (!obj || typeof obj !== 'object') return 0

  // Direct numeric fields that might represent ticket count
  const candidates = [
    'tickets_count', 'ticketsCount', 'tickets',
    'sold_count', 'soldCount', 'sold',
    'orders_count', 'ordersCount', 'orders',
    'count', 'total', 'quantity',
    'total_tickets', 'totalTickets',
    'number_of_tickets', 'numberOfTickets',
  ]

  for (const key of candidates) {
    if (typeof obj[key] === 'number') return obj[key]
  }

  // Check nested: obj.statistics.tickets, obj.stats.count, etc.
  for (const nested of ['statistics', 'stats', 'summary', 'totals']) {
    if (obj[nested] && typeof obj[nested] === 'object') {
      for (const key of candidates) {
        if (typeof obj[nested][key] === 'number') return obj[nested][key]
      }
    }
  }

  return 0
}

/**
 * POST /api/integrations/weeztix/sync-stats
 * Fetches tracker statistics from Weeztix and updates ticketsSold for each ambassador.
 * 
 * Weeztix API: GET https://api.weeztix.com/statistics/trackers
 * Returns array of tracker stats with orders_count / tickets_count per tracker guid.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['ORG_ADMIN', 'ORG_USER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (!session.user.organizationId) {
      return NextResponse.json({ error: 'No organization' }, { status: 400 })
    }

    const organizationId = session.user.organizationId

    // Get Weeztix credentials
    const credentials = await getWeeztixToken(organizationId)
    if (!credentials) {
      return NextResponse.json(
        { error: 'Weeztix niet verbonden. Verbind eerst via Integraties.' },
        { status: 400 }
      )
    }

    // Find all ambassador events with a tracker in this organization
    const ambassadorEvents = await prisma.ambassadorEvent.findMany({
      where: {
        trackerGuid: { not: null },
        event: { organizationId },
      },
      select: {
        id: true,
        trackerGuid: true,
        trackerCode: true,
        event: {
          select: {
            ticketShopId: true,
          },
        },
      },
    })

    if (ambassadorEvents.length === 0) {
      return NextResponse.json({
        message: 'Geen trackers gevonden om te synchroniseren.',
        synced: 0,
      })
    }

    // Build headers for Weeztix API
    const headers: Record<string, string> = {
      Authorization: `Bearer ${credentials.token}`,
      'Content-Type': 'application/json',
    }
    if (credentials.companyGuid) {
      headers['Company'] = credentials.companyGuid
    }

    // Strategy: query stats per individual tracker to get reliable data
    // Weeztix endpoints we try:
    //  1. GET /statistics/trackers  (global overview)
    //  2. GET /trackers/{guid}      (individual tracker with stats)

    const now = new Date()
    let synced = 0
    const debugInfo: any[] = []

    // --- Approach 1: Try global statistics endpoint first ---
    let globalStats: any = null
    try {
      const statsRes = await fetch('https://api.weeztix.com/statistics/trackers', {
        method: 'GET',
        headers,
      })
      console.log('[sync-stats] GET /statistics/trackers =>', statsRes.status)

      if (statsRes.ok) {
        globalStats = await statsRes.json()
        console.log('[sync-stats] Global stats response:', JSON.stringify(globalStats).substring(0, 2000))
      } else {
        const errText = await statsRes.text()
        console.log('[sync-stats] Global stats failed:', statsRes.status, errText.substring(0, 500))
      }
    } catch (e) {
      console.error('[sync-stats] Global stats error:', e)
    }

    // Try to extract stats from global response
    const statsMap = new Map<string, number>()

    if (globalStats) {
      // Flatten the response: could be array, { data: [] }, { trackers: [] }, or object keyed by guid
      let items: any[] = []
      if (Array.isArray(globalStats)) {
        items = globalStats
      } else if (Array.isArray(globalStats.data)) {
        items = globalStats.data
      } else if (Array.isArray(globalStats.trackers)) {
        items = globalStats.trackers
      } else if (typeof globalStats === 'object') {
        // Could be keyed by guid: { "guid1": { tickets: 5 }, "guid2": { tickets: 3 } }
        for (const [key, val] of Object.entries(globalStats)) {
          if (val && typeof val === 'object') {
            items.push({ guid: key, ...(val as any) })
          }
        }
      }

      for (const stat of items) {
        // Try every possible key for the tracker identifier
        const guid = stat.guid || stat.tracker_guid || stat.tracker_id || stat.id || stat.uuid
        // Try every possible key for the ticket count
        const tickets = findTicketCount(stat)
        if (guid) {
          statsMap.set(guid, tickets)
          debugInfo.push({ guid, tickets, keys: Object.keys(stat) })
        }
      }
    }

    // --- Approach 2: If global didn't give us results, fetch each tracker individually ---
    if (statsMap.size === 0) {
      console.log('[sync-stats] Global stats empty, fetching individual trackers...')
      for (const ae of ambassadorEvents) {
        if (!ae.trackerGuid) continue
        try {
          const trackerRes = await fetch(`https://api.weeztix.com/trackers/${ae.trackerGuid}`, {
            method: 'GET',
            headers,
          })
          if (trackerRes.ok) {
            const trackerData = await trackerRes.json()
            const data = trackerData.data || trackerData
            console.log(`[sync-stats] Tracker ${ae.trackerGuid}:`, JSON.stringify(data).substring(0, 1000))
            const tickets = findTicketCount(data)
            statsMap.set(ae.trackerGuid, tickets)
            debugInfo.push({ guid: ae.trackerGuid, tickets, keys: Object.keys(data) })
          } else {
            console.log(`[sync-stats] Tracker ${ae.trackerGuid} failed:`, trackerRes.status)
          }
        } catch (e) {
          console.error(`[sync-stats] Error fetching tracker ${ae.trackerGuid}:`, e)
        }
      }
    }

    // --- Update ambassador events ---
    for (const ae of ambassadorEvents) {
      if (!ae.trackerGuid) continue

      const tickets = statsMap.get(ae.trackerGuid) ?? 0

      await prisma.ambassadorEvent.update({
        where: { id: ae.id },
        data: {
          ticketsSold: tickets,
          lastSyncedAt: now,
        },
      })
      synced++
    }

    return NextResponse.json({
      message: `${synced} tracker(s) gesynchroniseerd.`,
      synced,
      totalTrackers: statsMap.size,
      lastSyncedAt: now.toISOString(),
      debug: debugInfo,
    })
  } catch (error) {
    console.error('Error syncing tracker stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
