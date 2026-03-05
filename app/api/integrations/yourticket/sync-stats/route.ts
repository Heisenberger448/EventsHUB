import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getYourticketApiKey, yourticketHeaders, YOURTICKET_API_BASE } from '@/lib/yourticket'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/integrations/yourticket/sync-stats
 *
 * Fetches purchases from the YTP Ticketing API for each event that has
 * ambassadors with trackers, and updates ticket sales stats.
 *
 * YTP API: GET /Events(<id>)/Purchases?$expand=PurchaseItems
 * Purchases contain PurchaseItems with ticket details.
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

    // Get Yourticket API key
    const creds = await getYourticketApiKey(organizationId)
    if (!creds) {
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

    const headers = yourticketHeaders(creds.apiKey)
    const now = new Date()
    let synced = 0
    const debugInfo: any[] = []

    // Group ambassador events by their event's ticketShopId (which stores the YTP event ID)
    const eventIds = new Set<string>()
    for (const ae of ambassadorEvents) {
      if (ae.event.ticketShopId) {
        eventIds.add(ae.event.ticketShopId)
      }
    }

    // Map of trackerCode -> ticketsSold / revenue
    const codeToTickets = new Map<string, number>()
    const codeToRevenue = new Map<string, number>()

    // Fetch purchases for each event ID
    for (const eventId of Array.from(eventIds)) {
      try {
        // Use OData $expand to include PurchaseItems, and $filter for paid purchases
        const res = await fetch(
          `${YOURTICKET_API_BASE}/Events(${eventId})/Purchases?$filter=Paid eq true&$expand=PurchaseItems`,
          { headers }
        )

        if (!res.ok) {
          const errText = await res.text()
          console.error(`[sync-stats] Purchases fetch failed for event ${eventId}:`, res.status, errText)
          continue
        }

        const data = await res.json()
        const purchases = data.value ?? data ?? []

        // Process purchases — count tickets and revenue
        for (const purchase of purchases) {
          // Check if this purchase has a reference/tracking code matching one of our trackers
          const reference = purchase.Reference || ''
          const items = purchase.PurchaseItems ?? []
          const ticketCount = items.length || 1
          const totalAmount = purchase.TotalAmount || 0

          // Try to match by reference code (this is how tracking typically works in YTP)
          if (reference) {
            const current = codeToTickets.get(reference) || 0
            codeToTickets.set(reference, current + ticketCount)

            const currentRevenue = codeToRevenue.get(reference) || 0
            codeToRevenue.set(reference, currentRevenue + Math.round(totalAmount * 100)) // store in cents
          }
        }
      } catch (e) {
        console.error(`[sync-stats] Error fetching purchases for event ${eventId}:`, e)
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
