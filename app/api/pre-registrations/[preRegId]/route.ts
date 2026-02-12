import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get a single pre-registration with entries
export async function GET(
  req: NextRequest,
  { params }: { params: { preRegId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['ORG_ADMIN', 'ORG_USER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const preRegistration = await prisma.preRegistration.findUnique({
      where: { id: params.preRegId },
      include: {
        event: { select: { id: true, name: true } },
        entries: { orderBy: { createdAt: 'desc' } },
        _count: { select: { entries: true } },
      },
    })

    if (!preRegistration) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (preRegistration.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json(preRegistration)
  } catch (error) {
    console.error('Error fetching pre-registration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a pre-registration
export async function DELETE(
  req: NextRequest,
  { params }: { params: { preRegId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['ORG_ADMIN', 'ORG_USER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const preRegistration = await prisma.preRegistration.findUnique({
      where: { id: params.preRegId },
    })

    if (!preRegistration) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (preRegistration.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.preRegistration.delete({ where: { id: params.preRegId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting pre-registration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
