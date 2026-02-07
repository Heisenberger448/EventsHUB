import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getWeeztixToken } from '@/lib/weeztix'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET — fetch all shops from Weeztix for the current organization
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const credentials = await getWeeztixToken(session.user.organizationId)
    if (!credentials) {
      return NextResponse.json(
        { error: 'Weeztix is niet gekoppeld of het token is verlopen' },
        { status: 400 }
      )
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${credentials.token}`,
    }
    if (credentials.companyGuid) {
      headers['Company'] = credentials.companyGuid
    }

    const res = await fetch('https://api.weeztix.com/shop', { headers })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Weeztix shops fetch failed:', res.status, errText)
      return NextResponse.json(
        { error: 'Kon shops niet ophalen van Weeztix' },
        { status: 502 }
      )
    }

    const data = await res.json()

    // Normalize response — Weeztix may return an array or { data: [...] }
    const shops = Array.isArray(data) ? data : data.data ?? data.shops ?? []

    const mapped = shops.map((shop: any) => ({
      guid: shop.guid,
      name: shop.name,
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    console.error('Error fetching Weeztix shops:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
