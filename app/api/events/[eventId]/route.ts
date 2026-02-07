import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PUT — update an event
export async function PUT(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ORG_ADMIN', 'ORG_USER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (!session.user.organizationId) {
      return NextResponse.json({ error: 'No organization' }, { status: 400 })
    }

    // Verify the event belongs to this organization
    const existing = await prisma.event.findFirst({
      where: { id: params.eventId, organizationId: session.user.organizationId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const body = await req.json()
    const { name, description, startDate, endDate, ticketProvider, ticketShopId, ticketShopName } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const event = await prisma.event.update({
      where: { id: params.eventId },
      data: {
        name,
        description: description || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        ticketProvider: ticketProvider || null,
        ticketShopId: ticketShopId || null,
        ticketShopName: ticketShopName || null,
      },
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE — delete an event
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ORG_ADMIN', 'ORG_USER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (!session.user.organizationId) {
      return NextResponse.json({ error: 'No organization' }, { status: 400 })
    }

    // Verify the event belongs to this organization
    const existing = await prisma.event.findFirst({
      where: { id: params.eventId, organizationId: session.user.organizationId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    await prisma.event.delete({ where: { id: params.eventId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
