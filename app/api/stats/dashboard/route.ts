import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organizationId = session.user.organizationId
    const eventId = req.nextUrl.searchParams.get('eventId')

    // Get organization
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    })

    // Get total events count for this organization
    const totalEvents = await prisma.event.count({
      where: { organizationId }
    })

    // Build ambassador event filter
    const ambassadorWhere: any = {
      event: { organizationId }
    }
    if (eventId) {
      ambassadorWhere.eventId = eventId
    }

    // Count ambassadors (filtered by event if provided)
    const totalAmbassadors = await prisma.ambassadorEvent.count({
      where: ambassadorWhere
    })

    const pendingAmbassadors = await prisma.ambassadorEvent.count({
      where: { ...ambassadorWhere, status: 'PENDING' }
    })

    const acceptedAmbassadors = await prisma.ambassadorEvent.count({
      where: { ...ambassadorWhere, status: 'ACCEPTED' }
    })

    return NextResponse.json({
      organizationName: organization?.name || 'Organization',
      totalAmbassadors,
      pendingAmbassadors,
      acceptedAmbassadors,
      totalEvents
    })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
