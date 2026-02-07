import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Org admins can only fetch their own organization
    if (['ORG_ADMIN', 'ORG_USER'].includes(session.user.role)) {
      if (session.user.organizationSlug !== params.slug) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    const organization = await prisma.organization.findUnique({
      where: { slug: params.slug },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    })

    if (!organization) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(organization)
  } catch (error) {
    console.error('Get organization by slug error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
