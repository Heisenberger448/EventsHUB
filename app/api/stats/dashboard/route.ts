import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organizationId = session.user.organizationId

    // Get organization
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    })

    // Get all events for this organization
    const events = await prisma.event.findMany({
      where: { organizationId },
      include: {
        ambassadorEvents: true
      }
    })

    // Calculate stats
    const totalAmbassadors = events.reduce((sum: number, event: any) => sum + event.ambassadorEvents.length, 0)
    const pendingAmbassadors = events.reduce((sum: number, event: any) => 
      sum + event.ambassadorEvents.filter((a: any) => a.status === 'PENDING').length, 0
    )
    const acceptedAmbassadors = events.reduce((sum: number, event: any) => 
      sum + event.ambassadorEvents.filter((a: any) => a.status === 'ACCEPTED').length, 0
    )
    const totalEvents = events.length

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
