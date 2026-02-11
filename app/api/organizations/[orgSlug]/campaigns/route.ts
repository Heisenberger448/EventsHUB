import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all campaigns for an organization
export async function GET(
  req: NextRequest,
  { params }: { params: { orgSlug: string } }
) {
  try {
    const organization = await prisma.organization.findUnique({
      where: { slug: params.orgSlug }
    })

    if (!organization) {
      return NextResponse.json(
        { error: 'Organisatie niet gevonden' },
        { status: 404 }
      )
    }

    // Get all campaigns for this organization's events
    const url = new URL(req.url)
    const eventId = url.searchParams.get('eventId')

    const campaigns = await prisma.campaign.findMany({
      where: {
        event: {
          organizationId: organization.id
        },
        ...(eventId ? { eventId } : {}),
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            completions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(campaigns)
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { error: 'Interne serverfout' },
      { status: 500 }
    )
  }
}

// POST create new campaign
export async function POST(
  req: NextRequest,
  { params }: { params: { orgSlug: string } }
) {
  try {
    const organization = await prisma.organization.findUnique({
      where: { slug: params.orgSlug }
    })

    if (!organization) {
      return NextResponse.json(
        { error: 'Organisatie niet gevonden' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const { eventId, title, notificationTitle, notificationMessage, description, startDate, endDate, rewardPoints, status } = body

    if (!eventId || !title || !description || !startDate || !endDate || rewardPoints === undefined) {
      return NextResponse.json(
        { error: 'Alle velden zijn verplicht' },
        { status: 400 }
      )
    }

    // Verify event belongs to this organization
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizationId: organization.id
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Evenement niet gevonden of niet van deze organisatie' },
        { status: 404 }
      )
    }

    const campaign = await prisma.campaign.create({
      data: {
        eventId,
        title,
        notificationTitle: notificationTitle || null,
        notificationMessage: notificationMessage || null,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        rewardPoints: parseInt(rewardPoints),
        status: status || 'DRAFT'
      },
      include: {
        event: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json(campaign, { status: 201 })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { error: 'Interne serverfout' },
      { status: 500 }
    )
  }
}
