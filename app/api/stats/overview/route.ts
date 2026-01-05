import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organizationId = session.user.organizationId

    // Get all events for this organization
    const events = await prisma.event.findMany({
      where: { organizationId },
      include: {
        ambassadorEvents: true
      }
    })

    // Calculate audience count (ambassadors)
    const audienceCount = events.reduce((sum: number, event: any) => sum + event.ambassadorEvents.length, 0)

    // For now, community count is the same as accepted ambassadors
    // In future, this could be a separate model
    const communityCount = events.reduce((sum: number, event: any) => 
      sum + event.ambassadorEvents.filter((a: any) => a.status === 'ACCEPTED').length, 0
    )

    return NextResponse.json({
      audienceCount,
      communityCount
    })
  } catch (error) {
    console.error('Overview stats API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
