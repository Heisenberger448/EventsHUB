import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { ambassadorId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['ORG_ADMIN', 'ORG_USER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (!session.user.organizationId) {
      return NextResponse.json({ error: 'No organization' }, { status: 400 })
    }

    // ambassadorId is AmbassadorEvent.id — find it and load the user + all their events
    const ambassadorEvent = await prisma.ambassadorEvent.findUnique({
      where: { id: params.ambassadorId },
      include: {
        user: true,
        event: {
          include: { organization: true }
        }
      }
    })

    if (!ambassadorEvent) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (ambassadorEvent.event.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Fetch ALL ambassador events for this user within this organization
    const allEvents = await prisma.ambassadorEvent.findMany({
      where: {
        userId: ambassadorEvent.userId,
        event: { organizationId: session.user.organizationId }
      },
      include: {
        event: { select: { id: true, name: true, slug: true, startDate: true, endDate: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Fetch campaign completions
    const campaignCompletions = await prisma.ambassadorCampaign.findMany({
      where: {
        userId: ambassadorEvent.userId,
        campaign: { event: { organizationId: session.user.organizationId } }
      },
      include: {
        campaign: { select: { id: true, title: true, rewardPoints: true, status: true } }
      },
      orderBy: { completedAt: 'desc' }
    })

    const totalPoints = campaignCompletions.reduce((sum, c) => sum + c.campaign.rewardPoints, 0)

    return NextResponse.json({
      id: ambassadorEvent.id,
      user: {
        id: ambassadorEvent.user.id,
        firstName: ambassadorEvent.user.firstName,
        lastName: ambassadorEvent.user.lastName,
        name: ambassadorEvent.user.name,
        email: ambassadorEvent.user.email,
        phoneNumber: ambassadorEvent.user.phoneNumber,
        createdAt: ambassadorEvent.user.createdAt,
      },
      // Use fields from the primary ambassadorEvent record
      instagram: ambassadorEvent.instagram,
      tiktok: ambassadorEvent.tiktok,
      phone: ambassadorEvent.phone,
      birthDate: ambassadorEvent.birthDate,
      gender: ambassadorEvent.gender,
      address: ambassadorEvent.address,
      status: ambassadorEvent.status,
      createdAt: ambassadorEvent.createdAt,
      events: allEvents,
      campaignCompletions,
      totalPoints,
    })
  } catch (error) {
    console.error('Error fetching ambassador profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { ambassadorId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['ORG_ADMIN', 'ORG_USER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    if (!session.user.organizationId) {
      return NextResponse.json(
        { error: 'User not associated with an organization' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { status } = body

    if (!status || !['ACCEPTED', 'REJECTED', 'PENDING'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be ACCEPTED, REJECTED, or PENDING' },
        { status: 400 }
      )
    }

    // Check if ambassador event registration exists and belongs to user's organization
    const ambassadorEvent = await prisma.ambassadorEvent.findUnique({
      where: { id: params.ambassadorId },
      include: {
        event: {
          include: {
            organization: true
          }
        }
      }
    })

    if (!ambassadorEvent) {
      return NextResponse.json(
        { error: 'Ambassador registration not found' },
        { status: 404 }
      )
    }

    if (ambassadorEvent.event.organizationId !== session.user.organizationId) {
      return NextResponse.json(
        { error: 'Unauthorized to update this ambassador' },
        { status: 403 }
      )
    }

    const updatedAmbassadorEvent = await prisma.ambassadorEvent.update({
      where: { id: params.ambassadorId },
      data: { status }
    })

    return NextResponse.json(updatedAmbassadorEvent)
  } catch (error) {
    console.error('Error updating ambassador:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
