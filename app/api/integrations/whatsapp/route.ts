import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET — get the current WhatsApp integration status
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId || session.user.role !== 'ORG_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const integration = await prisma.whatsAppIntegration.findUnique({
      where: { organizationId: session.user.organizationId },
      select: {
        id: true,
        phoneNumberId: true,
        whatsappBusinessId: true,
        displayPhoneNumber: true,
        verifiedName: true,
        connectedAt: true,
      },
    })

    return NextResponse.json({ connected: !!integration, integration })
  } catch (error) {
    console.error('Error fetching WhatsApp integration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST — connect an existing WhatsApp Business number
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId || session.user.role !== 'ORG_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { phoneNumberId, whatsappBusinessId, accessToken } = body

    if (!phoneNumberId || !whatsappBusinessId || !accessToken) {
      return NextResponse.json(
        { error: 'Phone Number ID, WhatsApp Business Account ID en Access Token zijn verplicht' },
        { status: 400 }
      )
    }

    // Verify the credentials by calling the WhatsApp Cloud API
    let displayPhoneNumber: string | null = null
    let verifiedName: string | null = null

    try {
      const verifyRes = await fetch(
        `https://graph.facebook.com/v21.0/${phoneNumberId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )

      if (!verifyRes.ok) {
        const errData = await verifyRes.json().catch(() => ({}))
        const message = errData?.error?.message || 'Ongeldige credentials'
        return NextResponse.json(
          { error: `Verificatie mislukt: ${message}` },
          { status: 400 }
        )
      }

      const phoneData = await verifyRes.json()
      displayPhoneNumber = phoneData.display_phone_number || null
      verifiedName = phoneData.verified_name || null
    } catch (fetchError) {
      return NextResponse.json(
        { error: 'Kon geen verbinding maken met de WhatsApp API. Controleer je gegevens.' },
        { status: 400 }
      )
    }

    // Upsert the integration
    const integration = await prisma.whatsAppIntegration.upsert({
      where: { organizationId: session.user.organizationId },
      create: {
        organizationId: session.user.organizationId,
        phoneNumberId,
        whatsappBusinessId,
        accessToken,
        displayPhoneNumber,
        verifiedName,
      },
      update: {
        phoneNumberId,
        whatsappBusinessId,
        accessToken,
        displayPhoneNumber,
        verifiedName,
        connectedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      integration: {
        id: integration.id,
        phoneNumberId: integration.phoneNumberId,
        whatsappBusinessId: integration.whatsappBusinessId,
        displayPhoneNumber: integration.displayPhoneNumber,
        verifiedName: integration.verifiedName,
        connectedAt: integration.connectedAt,
      },
    })
  } catch (error) {
    console.error('Error connecting WhatsApp:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE — disconnect the WhatsApp integration
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId || session.user.role !== 'ORG_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const existing = await prisma.whatsAppIntegration.findUnique({
      where: { organizationId: session.user.organizationId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Geen WhatsApp integratie gevonden' }, { status: 404 })
    }

    await prisma.whatsAppIntegration.delete({
      where: { organizationId: session.user.organizationId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error disconnecting WhatsApp:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
