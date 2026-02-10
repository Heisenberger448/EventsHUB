import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import twilio from 'twilio'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST — provision a new phone number via Twilio for an organization
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId || session.user.role !== 'ORG_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { countryCode = 'NL' } = body

    // Check if org already has a WhatsApp integration
    const existing = await prisma.whatsAppIntegration.findUnique({
      where: { organizationId: session.user.organizationId },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Er is al een WhatsApp nummer gekoppeld aan deze organisatie' },
        { status: 400 }
      )
    }

    // Get platform Twilio credentials
    const twilioConfig = await prisma.twilioConfig.findFirst()
    if (!twilioConfig) {
      return NextResponse.json(
        { error: 'Twilio is niet geconfigureerd door de platform beheerder. Neem contact op met support.' },
        { status: 400 }
      )
    }

    const client = twilio(twilioConfig.accountSid, twilioConfig.authToken)

    // Get organization name for friendly name
    const org = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
      select: { name: true },
    })

    // Step 1: Search for available phone numbers with SMS capability
    let availableNumbers
    try {
      availableNumbers = await client.availablePhoneNumbers(countryCode)
        .local
        .list({
          smsEnabled: true,
          limit: 1,
        })

      // If no local numbers, try mobile
      if (availableNumbers.length === 0) {
        availableNumbers = await client.availablePhoneNumbers(countryCode)
          .mobile
          .list({
            smsEnabled: true,
            limit: 1,
          })
      }
    } catch (searchError: any) {
      console.error('Twilio search error:', searchError)
      return NextResponse.json(
        { error: `Geen beschikbare nummers gevonden voor ${countryCode}. Probeer een ander land.` },
        { status: 400 }
      )
    }

    if (!availableNumbers || availableNumbers.length === 0) {
      return NextResponse.json(
        { error: `Geen beschikbare nummers gevonden voor ${countryCode}. Probeer een ander land.` },
        { status: 400 }
      )
    }

    const selectedNumber = availableNumbers[0]

    // Step 2: Purchase the phone number
    let purchasedNumber
    try {
      purchasedNumber = await client.incomingPhoneNumbers.create({
        phoneNumber: selectedNumber.phoneNumber,
        friendlyName: `SharedCrowd - ${org?.name || 'Organization'}`,
      })
    } catch (purchaseError: any) {
      console.error('Twilio purchase error:', purchaseError)
      return NextResponse.json(
        { error: 'Kon het nummer niet aanschaffen. Controleer het Twilio account saldo.' },
        { status: 400 }
      )
    }

    // Step 3: Save the WhatsApp integration
    const integration = await prisma.whatsAppIntegration.create({
      data: {
        organizationId: session.user.organizationId,
        phoneNumberId: purchasedNumber.sid,
        whatsappBusinessId: twilioConfig.accountSid,
        accessToken: twilioConfig.authToken,
        displayPhoneNumber: purchasedNumber.phoneNumber,
        verifiedName: org?.name || null,
        twilioPhoneNumberSid: purchasedNumber.sid,
        twilioProvisioned: true,
      },
    })

    return NextResponse.json({
      success: true,
      integration: {
        id: integration.id,
        phoneNumberId: integration.phoneNumberId,
        displayPhoneNumber: integration.displayPhoneNumber,
        verifiedName: integration.verifiedName,
        twilioProvisioned: true,
        connectedAt: integration.connectedAt,
      },
    })
  } catch (error) {
    console.error('Error provisioning WhatsApp number:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
