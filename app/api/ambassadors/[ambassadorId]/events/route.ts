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

    // Find all ambassador event registrations for this user
    const ambassadorEvents = await prisma.ambassadorEvent.findMany({
      where: {
        userId: user.id
      },
      include: {
        event: {
          include: {
            organization: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform to event format
    const events = ambassadorEvents.map(ae => ({
      id: ae.event.id,
      name: ae.event.name,
      slug: ae.event.slug,
      description: ae.event.description,
      startDate: ae.event.startDate,
      endDate: ae.event.endDate,
      organization: {
        name: ae.event.organization.name,
        slug: ae.event.organization.slug
      },
      ambassadorStatus: ae.status,
      ambassadorEventId: ae.id
    }))

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching user events:', error)
    return NextResponse.json(
      { error: 'Interne serverfout' },
      { status: 500 }
    )
  }
}
