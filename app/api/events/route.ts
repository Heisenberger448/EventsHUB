import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    console.log('Session in POST /api/events:', JSON.stringify(session, null, 2))

    if (!session?.user || !['ORG_ADMIN', 'ORG_USER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    if (!session.user.organizationId) {
      console.error('No organizationId in session:', session.user)
      return NextResponse.json(
        { error: 'User not associated with an organization' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { name, slug, description, startDate, endDate } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existing = await prisma.event.findUnique({
      where: { slug }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Event with this slug already exists' },
        { status: 400 }
      )
    }

    const event = await prisma.event.create({
      data: {
        organizationId: session.user.organizationId,
        name,
        slug,
        description: description || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      }
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
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

    const events = await prisma.event.findMany({
      where: { organizationId: session.user.organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { ambassadorEvents: true }
        }
      }
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
