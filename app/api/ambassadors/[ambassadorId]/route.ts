import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
