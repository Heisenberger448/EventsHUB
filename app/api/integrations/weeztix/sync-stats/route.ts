import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getWeeztixToken } from '@/lib/weeztix'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/integrations/weeztix/sync-stats
 *
 * Weeztix GET /statistics/trackers returns an Elasticsearch aggregation:
 *   {
 *     aggregations: {
 *       trackersPastFortNight: {
 *         doc_count: 116,
 *         "<trackerCode>": {          // e.g. "nqd6qzkm", "ysqmrgbt"
 *           doc_count: 5,             // ← number of orders for this tracker
 *           statistics: { ... }
 *         }
 *       }
 *     }
 *   }
 *
 * We match each tracker by its CODE (not GUID) against our ambassador events.
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
        trackerCode: { not: null },
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

    const now = new Date()
    let synced = 0
    const debugInfo: any[] = []

    // Map of trackerCode -> ticketsSold
    const codeToTickets = new Map<string, number>()

    // --- Fetch GET /statistics/trackers (Elasticsearch aggregation) ---
    try {
      const statsRes = await fetch('https://api.weeztix.com/statistics/trackers', {
        method: 'GET',
        headers,
      })
      console.log('[sync-stats] GET /statistics/trackers =>', statsRes.status)

      if (statsRes.ok) {
        const statsData = await statsRes.json()

        // Navigate into the aggregation: aggregations.trackersPastFortNight
        const agg =
          statsData?.aggregations?.trackersPastFortNight ||
          statsData?.aggregations?.trackers ||
          statsData?.aggregations

        if (agg && typeof agg === 'object') {
          // Build set of our tracker codes for fast lookup
          const ourCodes = new Set(
            ambassadorEvents.map(ae => ae.trackerCode).filter(Boolean) as string[]
          )

          console.log('[sync-stats] Our tracker codes:', Array.from(ourCodes))
          console.log('[sync-stats] Aggregation keys:', Object.keys(agg))

          // Each key in agg that is NOT a meta field is a tracker code
          for (const [key, value] of Object.entries(agg)) {
            // Skip Elasticsearch meta fields
            if (['doc_count', 'doc_count_error_upper_bound', 'sum_other_doc_count', 'key', 'key_as_string'].includes(key)) continue
            if (!value || typeof value !== 'object') continue

            const trackerData = value as any
            const docCount = trackerData.doc_count

            if (typeof docCount === 'number') {
              codeToTickets.set(key, docCount)
              debugInfo.push({
                trackerCode: key,
                docCount,
                isOurs: ourCodes.has(key),
              })
              console.log(`[sync-stats] Tracker "${key}": doc_count=${docCount}, isOurs=${ourCodes.has(key)}`)
            }
          }
        } else {
          console.log('[sync-stats] Could not find aggregation in response. Top-level keys:', Object.keys(statsData))
        }
      } else {
        const errText = await statsRes.text()
        console.error('[sync-stats] Statistics API failed:', statsRes.status, errText.substring(0, 500))
      }
    } catch (e) {
      console.error('[sync-stats] Statistics fetch error:', e)
    }

    // --- Update ambassador events by matching tracker code ---
    for (const ae of ambassadorEvents) {
      if (!ae.trackerCode) continue

      const tickets = codeToTickets.get(ae.trackerCode) ?? 0

      await prisma.ambassadorEvent.update({
        where: { id: ae.id },
        data: {
          ticketsSold: tickets,
          lastSyncedAt: now,
        },
      })
      synced++
      console.log(`[sync-stats] Updated ${ae.trackerCode}: ticketsSold=${tickets}`)
    }

    return NextResponse.json({
      message: `${synced} tracker(s) gesynchroniseerd.`,
      synced,
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
