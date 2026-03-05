import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/yourticket'

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
        organiserId: true,
        organiserName: true,
        connectedAt: true,
        createdAt: true,
      },
    })

    if (!integration) {
      return NextResponse.json({ connected: false })
    }

    return NextResponse.json({
      connected: !!integration.connectedAt,
      organiserName: integration.organiserName,
      organiserId: integration.organiserId,
      connectedAt: integration.connectedAt,
    })
  } catch (error) {
    console.error('Error fetching Yourticket status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST — save API key, validate and connect
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { apiKey } = await req.json()

    if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
      return NextResponse.json(
        { error: 'API key is verplicht' },
        { status: 400 }
      )
    }

    // Validate the API key by fetching organisers
    const organiser = await validateApiKey(apiKey.trim())
    if (!organiser) {
      return NextResponse.json(
        { error: 'Ongeldige API key. Controleer je sleutel en probeer opnieuw.' },
        { status: 401 }
      )
    }

    const organiserName = [organiser.firstName, organiser.lastName].filter(Boolean).join(' ') || organiser.email

    // Upsert the integration record
    const now = new Date()
    await prisma.yourticketIntegration.upsert({
      where: { organizationId: session.user.organizationId },
      create: {
        organizationId: session.user.organizationId,
        apiKey: apiKey.trim(),
        organiserId: organiser.id,
        organiserName,
        connectedAt: now,
      },
      update: {
        apiKey: apiKey.trim(),
        organiserId: organiser.id,
        organiserName,
        connectedAt: now,
      },
    })

    return NextResponse.json({
      success: true,
      connected: true,
      organiserName,
      organiserId: organiser.id,
    })
  } catch (error) {
    console.error('Error saving Yourticket API key:', error)
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
