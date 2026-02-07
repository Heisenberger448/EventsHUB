import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    // If email query param is provided, fetch ambassadors for that email (for mobile app)
    if (email) {
      const user = await prisma.user.findUnique({
        where: { email }
      })
      
      if (!user) {
        return NextResponse.json([])
      }
      
      const ambassadorEvents = await prisma.ambassadorEvent.findMany({
        where: {
          userId: user.id
        },
        include: {
          event: {
            include: {
              organization: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      
      return NextResponse.json(ambassadorEvents)
    }
    
    // Otherwise, require authentication and fetch for organization
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

    // Build filter
    const status = searchParams.get('status')
    const where: any = {
      event: {
        organizationId: session.user.organizationId
      }
    }

    if (status && ['PENDING', 'ACCEPTED', 'REJECTED'].includes(status)) {
      where.status = status
    }

    // Fetch ambassador event registrations for events belonging to the user's organization
    const ambassadorEvents = await prisma.ambassadorEvent.findMany({
      where,
      select: {
        id: true,
        status: true,
        createdAt: true,
        instagram: true,
        tiktok: true,
        phone: true,
        birthDate: true,
        gender: true,
        address: true,
        ticketsSold: true,
        trackerCode: true,
        trackerUrl: true,
        lastSyncedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        event: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(ambassadorEvents)
  } catch (error) {
    console.error('Error fetching ambassadors:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
