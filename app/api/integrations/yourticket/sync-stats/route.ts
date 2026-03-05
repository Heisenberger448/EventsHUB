import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getYourticketApiKey } from '@/lib/yourticket'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/integrations/yourticket/sync-stats
 *
 * Recalculates ticket sales stats for all Yourticket ambassador events
 * based on confirmed TrackerPurchase records (populated via webhook).
 *
 * This replaces the old Reference-matching approach with our own
 * checkout flow that guarantees ambassador ↔ sale attribution.
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

    // Verify Yourticket is connected
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
        trackerCode: true,
      },
    })

    if (ambassadorEvents.length === 0) {
      return NextResponse.json({
        message: 'Geen trackers gevonden om te synchroniseren.',
        synced: 0,
      })
    }

    const now = new Date()
    let synced = 0
    const debugInfo: any[] = []

    // Recalculate totals from paid TrackerPurchases for each ambassador
    for (const ae of ambassadorEvents) {
      const totals = await prisma.trackerPurchase.aggregate({
        where: {
          ambassadorEventId: ae.id,
          paid: true,
        },
        _sum: {
          totalAmount: true,
          ticketCount: true,
        },
      })

      const tickets = totals._sum.ticketCount || 0
      const revenue = totals._sum.totalAmount || 0

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
