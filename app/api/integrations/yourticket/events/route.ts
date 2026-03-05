import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getYourticketApiKey, yourticketHeaders, YOURTICKET_API_BASE } from '@/lib/yourticket'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET — fetch all events from YTP Ticketing API for the current organization
// Uses: GET /Organisers(<id>)/Events  (OData)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const creds = await getYourticketApiKey(session.user.organizationId)
    if (!creds) {
      return NextResponse.json(
        { error: 'Yourticket is niet gekoppeld' },
        { status: 400 }
      )
    }

    const headers = yourticketHeaders(creds.apiKey)

    // If we have an organiserId, fetch events for that specific organiser
    // Otherwise fall back to fetching all organisers first
    let organiserId = creds.organiserId

    if (!organiserId) {
      const orgRes = await fetch(`${YOURTICKET_API_BASE}/Organisers`, { headers })
      if (!orgRes.ok) {
        return NextResponse.json(
          { error: 'Kon organisers niet ophalen van Yourticket' },
          { status: 502 }
        )
      }
      const orgData = await orgRes.json()
      const organisers = orgData.value ?? orgData ?? []
      if (organisers.length === 0) {
        return NextResponse.json([])
      }
      organiserId = organisers[0].Id
    }

    // Fetch events for this organiser
    const res = await fetch(
      `${YOURTICKET_API_BASE}/Organisers(${organiserId})/Events`,
      { headers }
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
    const events = data.value ?? data ?? []

    const mapped = events.map((event: any) => ({
      id: event.Id,
      name: event.Name,
      description: event.Description || null,
      start: event.StartDateTime || null,
      end: event.EndDateTime || null,
      location: event.LocationName || null,
      address: event.Address || null,
      live: event.Live ?? false,
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    console.error('Error fetching Yourticket events:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
