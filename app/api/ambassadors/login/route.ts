import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        ambassadorEvents: {
          include: {
            event: {
              include: {
                organization: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      events: user.ambassadorEvents.map(ae => ({
        id: ae.id,
        status: ae.status,
        event: {
          id: ae.event.id,
          name: ae.event.name,
          slug: ae.event.slug,
          description: ae.event.description,
          startDate: ae.event.startDate,
          endDate: ae.event.endDate,
          organization: {
            name: ae.event.organization.name,
            slug: ae.event.organization.slug
          }
        }
      }))
    })
  } catch (error) {
    console.error('Ambassador login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
