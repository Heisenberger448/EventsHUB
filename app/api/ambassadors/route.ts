import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')
    
    // If email query param is provided, fetch ambassadors for that email (for mobile app)
    if (email) {
      const ambassadors = await prisma.ambassador.findMany({
        where: {
          email: email
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
      
      return NextResponse.json(ambassadors)
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

    // Fetch all ambassadors for events belonging to the user's organization
    const ambassadors = await prisma.ambassador.findMany({
      where: {
        event: {
          organizationId: session.user.organizationId
        }
      },
      include: {
        event: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(ambassadors)
  } catch (error) {
    console.error('Error fetching ambassadors:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
