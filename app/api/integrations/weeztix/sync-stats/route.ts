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

    // The /statistics/trackers endpoint returns Elasticsearch aggregations
    // (global revenue per day), NOT per-tracker ticket counts.
    // So we fetch each tracker individually via GET /trackers/{guid}
    // and also try GET /trackers to list all trackers with their order counts.

    const now = new Date()
    let synced = 0
    const debugInfo: any[] = []
    const statsMap = new Map<string, number>()

    // --- Step 1: Try GET /trackers to list all trackers with stats ---
    try {
      const listRes = await fetch('https://api.weeztix.com/trackers', {
        method: 'GET',
        headers,
      })
      console.log('[sync-stats] GET /trackers =>', listRes.status)

      if (listRes.ok) {
        const listData = await listRes.json()
        const trackers: any[] = Array.isArray(listData)
          ? listData
          : listData.data || listData.trackers || listData.results || []

        console.log('[sync-stats] Trackers list: found', trackers.length, 'trackers')
        if (trackers.length > 0) {
          console.log('[sync-stats] Sample tracker keys:', Object.keys(trackers[0]))
          console.log('[sync-stats] Sample tracker:', JSON.stringify(trackers[0]).substring(0, 500))
        }

        for (const tracker of trackers) {
          const guid = tracker.guid || tracker.id || tracker.uuid
          if (!guid) continue
          const tickets = findTicketCount(tracker)
          statsMap.set(guid, tickets)
          debugInfo.push({
            source: 'list',
            guid,
            tickets,
            keys: Object.keys(tracker),
            raw: Object.fromEntries(
              Object.entries(tracker).filter(([_, v]) => typeof v === 'number' || typeof v === 'string')
            ),
          })
        }
      }
    } catch (e) {
      console.error('[sync-stats] List trackers error:', e)
    }

    // --- Step 2: For any tracker GUIDs we still don't have, fetch individually ---
    const missingGuids = ambassadorEvents.filter(
      ae => ae.trackerGuid && !statsMap.has(ae.trackerGuid)
    )

    if (missingGuids.length > 0) {
      console.log(`[sync-stats] Fetching ${missingGuids.length} individual tracker(s)...`)
    }

    for (const ae of missingGuids) {
      if (!ae.trackerGuid) continue
      try {
        // Try GET /trackers/{guid}
        const trackerRes = await fetch(`https://api.weeztix.com/trackers/${ae.trackerGuid}`, {
          method: 'GET',
          headers,
        })
        console.log(`[sync-stats] GET /trackers/${ae.trackerGuid} =>`, trackerRes.status)

        if (trackerRes.ok) {
          const trackerData = await trackerRes.json()
          const data = trackerData.data || trackerData
          console.log(`[sync-stats] Tracker ${ae.trackerGuid}:`, JSON.stringify(data).substring(0, 1000))
          const tickets = findTicketCount(data)
          statsMap.set(ae.trackerGuid, tickets)
          debugInfo.push({
            source: 'individual',
            guid: ae.trackerGuid,
            tickets,
            keys: Object.keys(data),
            raw: Object.fromEntries(
              Object.entries(data).filter(([_, v]) => typeof v === 'number' || typeof v === 'string')
            ),
          })
        }

        // Also try GET /statistics/trackers/{guid} as alternative
        if (!statsMap.has(ae.trackerGuid) || statsMap.get(ae.trackerGuid) === 0) {
          const statsRes = await fetch(`https://api.weeztix.com/statistics/trackers/${ae.trackerGuid}`, {
            method: 'GET',
            headers,
          })
          console.log(`[sync-stats] GET /statistics/trackers/${ae.trackerGuid} =>`, statsRes.status)

          if (statsRes.ok) {
            const statsBody = await statsRes.json()
            console.log(`[sync-stats] Stats for ${ae.trackerGuid}:`, JSON.stringify(statsBody).substring(0, 1000))
            const sData = statsBody.data || statsBody
            const tickets = findTicketCount(sData)
            if (tickets > 0) {
              statsMap.set(ae.trackerGuid, tickets)
              debugInfo.push({
                source: 'statistics-individual',
                guid: ae.trackerGuid,
                tickets,
                keys: Object.keys(sData),
              })
            }
          }
        }
      } catch (e) {
        console.error(`[sync-stats] Error fetching tracker ${ae.trackerGuid}:`, e)
      }
    }

    // --- Step 3: Update ambassador events ---
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
