import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { ambassadorId: string } }
) {
  try {
    // ambassadorId is actually userId now
    const userId = params.ambassadorId
    
    // Get user to verify they exist
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true }
    })

    console.log('User found:', user)

    if (!user) {
      return NextResponse.json(
        { error: 'User niet gevonden' },
        { status: 404 }
      )
    }

    // Get all events this user is ACCEPTED for as ambassador
    const acceptedEvents = await prisma.ambassadorEvent.findMany({
      where: {
        userId: user.id,
        status: 'ACCEPTED'
      },
      select: { eventId: true }
    })

    console.log('Accepted events:', acceptedEvents)

    const eventIds = acceptedEvents.map(ae => ae.eventId)
    console.log('Event IDs:', eventIds)

    // Get all ACTIVE campaigns for these events (no date filter - show all active campaigns)
    const campaigns = await prisma.campaign.findMany({
      where: {
        eventId: {
          in: eventIds
        },
        status: 'ACTIVE'
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        completions: {
          where: {
            userId: user.id
          }
        }
      },
      orderBy: {
        endDate: 'asc'
      }
    })

    // Transform to include completion status
    const campaignsWithStatus = campaigns.map(campaign => ({
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      rewardPoints: campaign.rewardPoints,
      status: campaign.status,
      event: {
        id: campaign.event.id,
        name: campaign.event.name,
        slug: campaign.event.slug
      },
      completed: campaign.completions.length > 0,
      completedAt: campaign.completions[0]?.completedAt || null
    }))

    return NextResponse.json(campaignsWithStatus)
  } catch (error) {
    console.error('Error fetching ambassador campaigns:', error)
    return NextResponse.json(
      { error: 'Interne serverfout' },
      { status: 500 }
    )
  }
}
