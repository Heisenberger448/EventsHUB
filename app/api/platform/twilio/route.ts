import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET — get Twilio config status (masked)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'PLATFORM_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const config = await prisma.twilioConfig.findFirst()

    if (!config) {
      return NextResponse.json({ connected: false })
    }

    return NextResponse.json({
      connected: true,
      accountSid: config.accountSid,
      authTokenMasked: config.authToken.slice(0, 4) + '••••••••' + config.authToken.slice(-4),
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    })
  } catch (error) {
    console.error('Error fetching Twilio config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST — save/update Twilio credentials
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'PLATFORM_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { accountSid, authToken } = body

    if (!accountSid || !authToken) {
      return NextResponse.json(
        { error: 'Account SID en Auth Token zijn verplicht' },
        { status: 400 }
      )
    }

    // Verify credentials by calling Twilio API
    try {
      const verifyRes = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`,
        {
          headers: {
            Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          },
        }
      )

      if (!verifyRes.ok) {
        return NextResponse.json(
          { error: 'Ongeldige Twilio credentials. Controleer je Account SID en Auth Token.' },
          { status: 400 }
        )
      }
    } catch {
      return NextResponse.json(
        { error: 'Kon geen verbinding maken met Twilio. Probeer het opnieuw.' },
        { status: 400 }
      )
    }

    // Upsert — only one TwilioConfig row ever
    const existing = await prisma.twilioConfig.findFirst()

    let config
    if (existing) {
      config = await prisma.twilioConfig.update({
        where: { id: existing.id },
        data: { accountSid, authToken },
      })
    } else {
      config = await prisma.twilioConfig.create({
        data: { accountSid, authToken },
      })
    }

    return NextResponse.json({
      success: true,
      accountSid: config.accountSid,
      authTokenMasked: config.authToken.slice(0, 4) + '••••••••' + config.authToken.slice(-4),
    })
  } catch (error) {
    console.error('Error saving Twilio config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE — remove Twilio configuration
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'PLATFORM_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existing = await prisma.twilioConfig.findFirst()
    if (!existing) {
      return NextResponse.json({ error: 'Geen Twilio configuratie gevonden' }, { status: 404 })
    }

    await prisma.twilioConfig.delete({ where: { id: existing.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting Twilio config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
