import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getWeeztixToken } from '@/lib/weeztix'

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
        event: { select: { id: true, name: true, slug: true, startDate: true, endDate: true, ticketProvider: true, ticketShopId: true, ticketShopName: true } }
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
      trackerGuid: ambassadorEvent.trackerGuid,
      trackerCode: ambassadorEvent.trackerCode,
      trackerUrl: ambassadorEvent.trackerUrl,
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
      data: { status },
      include: { user: true }
    })

    // When accepting an ambassador, create a Weeztix tracker if the event has a ticketShopId
    if (status === 'ACCEPTED' && !updatedAmbassadorEvent.trackerGuid) {
      try {
        // Load the event to check for ticketShopId
        const event = await prisma.event.findUnique({
          where: { id: ambassadorEvent.eventId },
        })

        if (event?.ticketProvider === 'weeztix' && event.ticketShopId) {
          const credentials = await getWeeztixToken(ambassadorEvent.event.organizationId)

          if (credentials) {
            const ambassadorName =
              [updatedAmbassadorEvent.user.firstName, updatedAmbassadorEvent.user.lastName]
                .filter(Boolean)
                .join(' ') ||
              updatedAmbassadorEvent.user.name ||
              updatedAmbassadorEvent.user.email.split('@')[0]

            const headers: Record<string, string> = {
              Authorization: `Bearer ${credentials.token}`,
              'Content-Type': 'application/json',
            }
            if (credentials.companyGuid) {
              headers['Company'] = credentials.companyGuid
            }

            const trackerRes = await fetch('https://api.weeztix.com/trackers', {
              method: 'POST',
              headers,
              body: JSON.stringify({
                shop_id: event.ticketShopId,
                name: `Ambassador - ${ambassadorName}`,
                type: 'other',
              }),
            })

            if (trackerRes.ok) {
              const trackerData = await trackerRes.json()
              const trackerGuid = trackerData.guid || trackerData.data?.guid
              const trackerCode = trackerData.code || trackerData.data?.code
              const trackerUrl = trackerCode
                ? `https://weeztix.shop/${trackerCode}`
                : null

              await prisma.ambassadorEvent.update({
                where: { id: params.ambassadorId },
                data: { trackerGuid, trackerCode, trackerUrl },
              })
            } else {
              console.error(
                'Failed to create Weeztix tracker:',
                trackerRes.status,
                await trackerRes.text()
              )
            }
          }
        }
      } catch (trackerErr) {
        // Don't fail the accept if tracker creation fails
        console.error('Error creating tracker:', trackerErr)
      }
    }

    return NextResponse.json(updatedAmbassadorEvent)
  } catch (error) {
    console.error('Error updating ambassador:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Verify the ambassador event belongs to the user's organization
    const ambassadorEvent = await prisma.ambassadorEvent.findUnique({
      where: { id: params.ambassadorId },
      include: { event: true },
    })

    if (!ambassadorEvent) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (ambassadorEvent.event.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Only delete the AmbassadorEvent record (not the user)
    await prisma.ambassadorEvent.delete({
      where: { id: params.ambassadorId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting ambassador event:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
