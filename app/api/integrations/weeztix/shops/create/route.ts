import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getWeeztixToken } from '@/lib/weeztix'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST — create a new shop in Weeztix
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { name } = await req.json()
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Shop naam is verplicht' }, { status: 400 })
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
      'Content-Type': 'application/json',
    }
    if (credentials.companyGuid) {
      headers['Company'] = credentials.companyGuid
    }

    const res = await fetch('https://api.weeztix.com/shop', {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: name.trim() }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Weeztix shop create failed:', res.status, errText)
      return NextResponse.json(
        { error: 'Kon shop niet aanmaken in Weeztix' },
        { status: 502 }
      )
    }

    const data = await res.json()

    return NextResponse.json({
      guid: data.guid || data.GUID,
      name: data.name,
    })
  } catch (error) {
    console.error('Error creating Weeztix shop:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
