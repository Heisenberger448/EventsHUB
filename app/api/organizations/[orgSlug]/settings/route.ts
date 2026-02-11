import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET organization settings
export async function GET(
  request: Request,
  { params }: { params: { orgSlug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organization = await prisma.organization.findUnique({
      where: { slug: params.orgSlug },
      select: {
        id: true,
        name: true,
        slug: true,
        kvkNumber: true,
        companyAddress: true,
        timezone: true,
      },
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    return NextResponse.json(organization)
  } catch (error) {
    console.error('Get org settings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH organization settings
export async function PATCH(
  request: Request,
  { params }: { params: { orgSlug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only org admins or platform admins can update settings
    if (!['ORG_ADMIN', 'PLATFORM_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { timezone } = body

    const updateData: Record<string, any> = {}
    if (timezone !== undefined) {
      updateData.timezone = timezone
    }

    const organization = await prisma.organization.update({
      where: { slug: params.orgSlug },
      data: updateData,
      select: {
        id: true,
        name: true,
        slug: true,
        kvkNumber: true,
        companyAddress: true,
        timezone: true,
      },
    })

    return NextResponse.json(organization)
  } catch (error) {
    console.error('Update org settings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
