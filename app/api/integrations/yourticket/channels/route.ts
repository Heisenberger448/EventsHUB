import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getYourticketToken, yourticketHeaders, YOURTICKET_API_BASE } from '@/lib/yourticket'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET — fetch all channels for a given event from CM.com Ticketing
// Channels in Yourticket are equivalent to "shops" in Weeztix
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const eventUuid = req.nextUrl.searchParams.get('event_uuid')
    if (!eventUuid) {
      return NextResponse.json(
        { error: 'event_uuid parameter is verplicht' },
        { status: 400 }
      )
    }

    const token = await getYourticketToken(session.user.organizationId)
    if (!token) {
      return NextResponse.json(
        { error: 'Yourticket is niet gekoppeld of het token is verlopen' },
        { status: 400 }
      )
    }

    const headers = yourticketHeaders(token)

    const res = await fetch(
      `${YOURTICKET_API_BASE}/events/${eventUuid}/channels`,
      { headers }
    )

    if (!res.ok) {
      const errText = await res.text()
      console.error('Yourticket channels fetch failed:', res.status, errText)
      return NextResponse.json(
        { error: 'Kon channels niet ophalen van Yourticket' },
        { status: 502 }
      )
    }

    const data = await res.json()
    const channels = Array.isArray(data) ? data : data.data ?? data.channels ?? []

    const mapped = channels.map((channel: any) => ({
      uuid: channel.uuid || channel.id || channel.channelUuid,
      name: channel.name || channel.title || 'Channel',
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    console.error('Error fetching Yourticket channels:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
