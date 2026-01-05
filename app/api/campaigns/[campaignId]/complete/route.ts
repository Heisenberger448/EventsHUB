import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const body = await req.json()
    const { ambassadorId } = body

    if (!ambassadorId) {
      return NextResponse.json(
        { error: 'User ID is verplicht' },
        { status: 400 }
      )
    }

    // Verify campaign exists and is active
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.campaignId }
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campagne niet gevonden' },
        { status: 404 }
      )
    }

    if (campaign.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Deze campagne is niet meer actief' },
        { status: 400 }
      )
    }

    // Check if campaign is within valid date range
    const now = new Date()
    if (now < campaign.startDate) {
      return NextResponse.json(
        { error: 'Deze campagne is nog niet gestart' },
        { status: 400 }
      )
    }

    if (now > campaign.endDate) {
      return NextResponse.json(
        { error: 'Deze campagne is al afgelopen' },
        { status: 400 }
      )
    }

    // Check if user is accepted for this event
    const ambassadorEvent = await prisma.ambassadorEvent.findFirst({
      where: {
        userId: ambassadorId,
        eventId: campaign.eventId,
        status: 'ACCEPTED'
      }
    })

    if (!ambassadorEvent) {
      return NextResponse.json(
        { error: 'Je bent niet geaccepteerd voor dit evenement' },
        { status: 403 }
      )
    }

    // Check if already completed
    const existing = await prisma.ambassadorCampaign.findUnique({
      where: {
        userId_campaignId: {
          userId: ambassadorId,
          campaignId: params.campaignId
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Je hebt deze taak al voltooid' },
        { status: 400 }
      )
    }

    // Mark as completed
    const completion = await prisma.ambassadorCampaign.create({
      data: {
        userId: ambassadorId,
        campaignId: params.campaignId
      }
    })

    return NextResponse.json(completion, { status: 201 })
  } catch (error) {
    console.error('Error completing campaign:', error)
    return NextResponse.json(
      { error: 'Interne serverfout' },
      { status: 500 }
    )
  }
}
