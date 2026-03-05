import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getYourticketApiKey, yourticketHeaders, YOURTICKET_API_BASE } from '@/lib/yourticket'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/tracker/[trackerCode]/tickets
 *
 * Public endpoint — fetches available tickets from YTP for the event
 * linked to a specific ambassador tracker code.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { trackerCode: string } }
) {
  try {
    const { trackerCode } = params

    // Look up the ambassador event by tracker code
    const ambassadorEvent = await prisma.ambassadorEvent.findFirst({
      where: {
        trackerCode,
        status: 'ACCEPTED',
      },
      include: {
        event: {
          include: {
            organization: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (!ambassadorEvent) {
      return NextResponse.json(
        { error: 'Tracker niet gevonden of niet actief.' },
        { status: 404 }
      )
    }

    const { event } = ambassadorEvent

    if (event.ticketProvider !== 'yourticket' || !event.ticketShopId) {
      return NextResponse.json(
        { error: 'Dit evenement gebruikt geen Yourticket Provider.' },
        { status: 400 }
      )
    }

    // Get the YTP API key for this organization
    const creds = await getYourticketApiKey(event.organizationId)
    if (!creds) {
      return NextResponse.json(
        { error: 'Yourticket integratie niet gevonden.' },
        { status: 500 }
      )
    }

    // Fetch tickets from YTP API
    const headers = yourticketHeaders(creds.apiKey)
    const ticketsRes = await fetch(
      `${YOURTICKET_API_BASE}/Events(${event.ticketShopId})/Tickets?$filter=Live eq true and SoldOut eq false`,
      { headers }
    )

    if (!ticketsRes.ok) {
      const errText = await ticketsRes.text()
      console.error('[tracker/tickets] Failed to fetch tickets:', ticketsRes.status, errText)
      return NextResponse.json(
        { error: 'Kon tickets niet ophalen.' },
        { status: 502 }
      )
    }

    const ticketsData = await ticketsRes.json()
    const tickets = (ticketsData.value ?? ticketsData ?? []).map((t: any) => ({
      id: t.Id,
      name: t.Name,
      price: t.Price,
      available: t.CurrentAvailable,
      maxPerOrder: t.Amount || 10,
    }))

    // Ambassador display name
    const ambassadorName = [ambassadorEvent.user.firstName, ambassadorEvent.user.lastName]
      .filter(Boolean)
      .join(' ') || 'Ambassador'

    return NextResponse.json({
      event: {
        id: event.id,
        name: event.name,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        organization: event.organization.name,
      },
      ambassador: ambassadorName,
      tickets,
    })
  } catch (error) {
    console.error('[tracker/tickets] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
