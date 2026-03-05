import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getYourticketToken, yourticketHeaders, YOURTICKET_API_BASE } from '@/lib/yourticket'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/integrations/yourticket/sync-stats
 *
 * Fetches orders from the CM.com Ticketing API for each event that has
 * ambassadors with trackers, and updates ticket sales stats.
 *
 * CM.com orders endpoint: GET /events/{event_uuid}/orders
 * Orders contain channel info which we can match to our tracked channels.
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

    // Get Yourticket credentials
    const token = await getYourticketToken(organizationId)
    if (!token) {
      return NextResponse.json(
        { error: 'Yourticket niet verbonden. Verbind eerst via Integraties.' },
        { status: 400 }
      )
    }

    // Find all ambassador events with a tracker in this organization that use Yourticket
    const ambassadorEvents = await prisma.ambassadorEvent.findMany({
      where: {
        trackerCode: { not: null },
        event: {
          organizationId,
          ticketProvider: 'yourticket',
        },
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

    const headers = yourticketHeaders(token)
    const now = new Date()
    let synced = 0
    const debugInfo: any[] = []

    // Group ambassador events by their event's ticketShopId (which is the event UUID in Yourticket)
    const eventUuids = new Set<string>()
    for (const ae of ambassadorEvents) {
      if (ae.event.ticketShopId) {
        eventUuids.add(ae.event.ticketShopId)
      }
    }

    // Map of trackerCode -> ticketsSold / revenue
    const codeToTickets = new Map<string, number>()
    const codeToRevenue = new Map<string, number>()

    // Fetch orders for each event UUID
    for (const eventUuid of Array.from(eventUuids)) {
      try {
        let skip = 0
        const take = 20
        let hasMore = true

        while (hasMore) {
          const res = await fetch(
            `${YOURTICKET_API_BASE}/events/${eventUuid}/orders?status=COMPLETED`,
            {
              headers: {
                ...headers,
                'X-TF-PAGINATION-SKIP': String(skip),
              },
            }
          )

          if (!res.ok) {
            const errText = await res.text()
            console.error(`[sync-stats] Orders fetch failed for event ${eventUuid}:`, res.status, errText)
            break
          }

          const data = await res.json()
          const orders = Array.isArray(data) ? data : data.data ?? data.orders ?? []

          // Process orders — look for tracker/channel references
          for (const order of orders) {
            const channelCode = order.channelCode || order.channel?.code || order.trackingCode || order.utmSource
            if (channelCode) {
              const current = codeToTickets.get(channelCode) || 0
              const ticketCount = order.ticketCount || order.quantity || order.items?.length || 1
              codeToTickets.set(channelCode, current + ticketCount)

              const revenue = order.totalAmount || order.total || order.revenue || 0
              const currentRevenue = codeToRevenue.get(channelCode) || 0
              codeToRevenue.set(channelCode, currentRevenue + Math.round(revenue * 100)) // store in cents
            }
          }

          const total = parseInt(res.headers.get('x-tf-pagination-total') || '0', 10)
          skip += take
          hasMore = skip < total && orders.length > 0

          // Safety: max 1000 orders per event
          if (skip >= 1000) break
        }
      } catch (e) {
        console.error(`[sync-stats] Error fetching orders for event ${eventUuid}:`, e)
      }
    }

    // --- Update ambassador events by matching tracker code ---
    for (const ae of ambassadorEvents) {
      if (!ae.trackerCode) continue

      const tickets = codeToTickets.get(ae.trackerCode) ?? 0
      const revenue = codeToRevenue.get(ae.trackerCode) ?? 0

      await prisma.ambassadorEvent.update({
        where: { id: ae.id },
        data: {
          ticketsSold: tickets,
          ticketRevenue: revenue,
          lastSyncedAt: now,
        },
      })
      synced++
      debugInfo.push({
        trackerCode: ae.trackerCode,
        tickets,
        revenue,
      })
      console.log(`[sync-stats] Updated ${ae.trackerCode}: ticketsSold=${tickets}, revenue=${revenue}`)
    }

    return NextResponse.json({
      message: `${synced} tracker(s) gesynchroniseerd.`,
      synced,
      lastSyncedAt: now.toISOString(),
      debug: debugInfo,
    })
  } catch (error) {
    console.error('Error syncing Yourticket tracker stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
