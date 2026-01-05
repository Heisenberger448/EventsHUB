import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'PLATFORM_ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { name, slug } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existing = await prisma.organization.findUnique({
      where: { slug }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Organization with this slug already exists' },
        { status: 400 }
      )
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        slug
      }
    })

    return NextResponse.json(organization, { status: 201 })
  } catch (error) {
    console.error('Error creating organization:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'PLATFORM_ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const organizations = await prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { users: true, events: true }
        }
      }
    })

    return NextResponse.json(organizations)
  } catch (error) {
    console.error('Error fetching organizations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
