import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { signInYourticket } from '@/lib/yourticket'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET — fetch current Yourticket integration status
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const integration = await prisma.yourticketIntegration.findUnique({
      where: { organizationId: session.user.organizationId },
      select: {
        id: true,
        email: true,
        accountName: true,
        connectedAt: true,
        accessTokenExpiresAt: true,
        createdAt: true,
      },
    })

    if (!integration) {
      return NextResponse.json({ connected: false })
    }

    const isTokenValid =
      integration.accessTokenExpiresAt &&
      new Date(integration.accessTokenExpiresAt) > new Date()

    return NextResponse.json({
      connected: !!integration.connectedAt,
      tokenValid: isTokenValid,
      accountName: integration.accountName,
      email: integration.email,
      connectedAt: integration.connectedAt,
    })
  } catch (error) {
    console.error('Error fetching Yourticket status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST — save credentials, sign in and connect
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-mail en wachtwoord zijn verplicht' },
        { status: 400 }
      )
    }

    // Attempt to sign in with the CM.com Ticketing API
    const result = await signInYourticket(email, password)
    if (!result) {
      return NextResponse.json(
        { error: 'Inloggen mislukt. Controleer je e-mail en wachtwoord.' },
        { status: 401 }
      )
    }

    // Upsert the integration record with credentials and token
    const now = new Date()
    await prisma.yourticketIntegration.upsert({
      where: { organizationId: session.user.organizationId },
      create: {
        organizationId: session.user.organizationId,
        email,
        password,
        accessToken: result.token,
        accessTokenExpiresAt: result.expiresAt,
        accountName: email.split('@')[0],
        connectedAt: now,
      },
      update: {
        email,
        password,
        accessToken: result.token,
        accessTokenExpiresAt: result.expiresAt,
        accountName: email.split('@')[0],
        connectedAt: now,
      },
    })

    return NextResponse.json({
      success: true,
      connected: true,
      accountName: email.split('@')[0],
    })
  } catch (error) {
    console.error('Error saving Yourticket credentials:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE — disconnect Yourticket integration
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.yourticketIntegration.deleteMany({
      where: { organizationId: session.user.organizationId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error disconnecting Yourticket:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
