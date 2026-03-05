import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getYourticketToken, yourticketHeaders, YOURTICKET_API_BASE } from '@/lib/yourticket'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET — fetch all events from CM.com Ticketing for the current organization
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const token = await getYourticketToken(session.user.organizationId)
    if (!token) {
      return NextResponse.json(
        { error: 'Yourticket is niet gekoppeld of het token is verlopen' },
        { status: 400 }
      )
    }

    const headers = yourticketHeaders(token)

    // Fetch events with pagination — get up to 100 events
    const allEvents: any[] = []
    let skip = 0
    const take = 20
    let hasMore = true

    while (hasMore) {
      const res = await fetch(
        `${YOURTICKET_API_BASE}/events?type=ALL`,
        {
          headers: {
            ...headers,
            'X-TF-PAGINATION-SKIP': String(skip),
          },
        }
      )

      if (!res.ok) {
        const errText = await res.text()
        console.error('Yourticket events fetch failed:', res.status, errText)
        return NextResponse.json(
          { error: 'Kon events niet ophalen van Yourticket' },
          { status: 502 }
        )
      }

      const data = await res.json()
      const events = Array.isArray(data) ? data : data.data ?? data.events ?? []
      allEvents.push(...events)

      // Check pagination headers
      const total = parseInt(res.headers.get('x-tf-pagination-total') || '0', 10)
      skip += take
      hasMore = skip < total && events.length > 0

      // Safety: max 200 events
      if (allEvents.length >= 200) break
    }

    const mapped = allEvents.map((event: any) => ({
      uuid: event.uuid || event.id || event.eventUuid,
      name: event.name || event.title,
      description: event.description || null,
      start: event.startDate || event.start || event.dateStart || null,
      end: event.endDate || event.end || event.dateEnd || null,
      location: event.venue?.name || event.location?.name || event.locationName || null,
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    console.error('Error fetching Yourticket events:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
