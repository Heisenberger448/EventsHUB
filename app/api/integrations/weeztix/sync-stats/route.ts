import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getWeeztixToken } from '@/lib/weeztix'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

    // Fetch tracker statistics from Weeztix
    // The API returns stats per tracker, we need to match them to our ambassador events
    const statsRes = await fetch('https://api.weeztix.com/statistics/trackers', {
      method: 'GET',
      headers,
    })

    if (!statsRes.ok) {
      const errText = await statsRes.text()
      console.error('Weeztix statistics API failed:', statsRes.status, errText)
      return NextResponse.json(
        { error: `Weeztix API fout: ${statsRes.status}` },
        { status: 502 }
      )
    }

    const statsData = await statsRes.json()

    // The response can be an array directly or wrapped in { data: [...] }
    const trackerStats: any[] = Array.isArray(statsData)
      ? statsData
      : statsData.data || statsData.trackers || []

    // Build a map of tracker guid -> tickets sold
    const statsMap = new Map<string, number>()
    for (const stat of trackerStats) {
      const guid = stat.guid || stat.tracker_guid || stat.id
      // Weeztix may return tickets_count, orders_count, or sold_count
      const tickets =
        stat.tickets_count ??
        stat.sold_count ??
        stat.orders_count ??
        stat.count ??
        0
      if (guid) {
        statsMap.set(guid, tickets)
      }
    }

    // Update each ambassador event with the ticket count
    const now = new Date()
    let synced = 0

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
      totalTrackers: trackerStats.length,
      lastSyncedAt: now.toISOString(),
    })
  } catch (error) {
    console.error('Error syncing tracker stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
