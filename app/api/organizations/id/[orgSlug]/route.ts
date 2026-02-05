import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET single organization
export async function GET(
  request: Request,
  { params }: { params: { orgSlug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'PLATFORM_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organization = await prisma.organization.findUnique({
      where: { id: params.orgSlug },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            role: true
          }
        },
        _count: {
          select: {
            users: true,
            events: true
          }
        }
      }
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    return NextResponse.json(organization)
  } catch (error) {
    console.error('Get organization API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// UPDATE organization
export async function PUT(
  request: Request,
  { params }: { params: { orgSlug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'PLATFORM_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { organisationName, slug, kvkNumber, companyAddress } = data

    // Validate required fields
    if (!organisationName || !slug) {
      return NextResponse.json({ error: 'Organisation name and slug are required' }, { status: 400 })
    }

    // Check if slug is taken by another organization
    const existingOrg = await prisma.organization.findFirst({
      where: {
        slug,
        NOT: {
          id: params.orgSlug
        }
      }
    })

    if (existingOrg) {
      return NextResponse.json({ error: 'This slug is already taken' }, { status: 400 })
    }

    const updatedOrganization = await prisma.organization.update({
      where: { id: params.orgSlug },
      data: {
        name: organisationName,
        slug,
        kvkNumber: kvkNumber || null,
        companyAddress: companyAddress || null
      }
    })

    return NextResponse.json(updatedOrganization)
  } catch (error) {
    console.error('Update organization API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE organization
export async function DELETE(
  request: Request,
  { params }: { params: { orgSlug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'PLATFORM_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete organization (cascade will handle users and events)
    await prisma.organization.delete({
      where: { id: params.orgSlug }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete organization API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
