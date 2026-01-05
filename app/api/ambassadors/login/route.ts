import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    console.log('Ambassador login attempt:', email)

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
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

    console.log('User found:', user ? 'yes' : 'no')
    console.log('Has password:', user?.passwordHash ? 'yes' : 'no')

    if (!user || !user.passwordHash) {
      console.log('Login failed: No user or no password')
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    console.log('Password valid:', isPasswordValid)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Return user info with all ambassador events
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
