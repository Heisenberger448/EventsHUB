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

    if (!user) {
      return NextResponse.json(
        { error: 'User niet gevonden' },
        { status: 404 }
      )
    }

    // Get all event IDs where this user has already applied
    const appliedEvents = await prisma.ambassadorEvent.findMany({
      where: { userId: user.id },
      select: { eventId: true }
    })

    const appliedEventIds = appliedEvents.map(ae => ae.eventId)

    // Get all events where user has NOT applied
    const availableEvents = await prisma.event.findMany({
      where: {
        id: {
          notIn: appliedEventIds
        }
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    })

    // Transform to simplified format
    const events = availableEvents.map(event => ({
      id: event.id,
      name: event.name,
      slug: event.slug,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      organization: {
        id: event.organization.id,
        name: event.organization.name,
        slug: event.organization.slug
      }
    }))

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching feed events:', error)
    return NextResponse.json(
      { error: 'Interne serverfout' },
      { status: 500 }
    )
  }
}
