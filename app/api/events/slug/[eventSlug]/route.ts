import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(
  req: NextRequest,
  { params }: { params: { eventSlug: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { slug: params.eventSlug },
      include: {
        organization: {
          select: {
            name: true
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { eventSlug: string } }
) {
  try {
    const body = await req.json()
    const { name, email, password, userId } = body

    const event = await prisma.event.findUnique({
      where: { slug: params.eventSlug }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Evenement niet gevonden' },
        { status: 404 }
      )
    }

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        return NextResponse.json(
          { error: 'Gebruiker niet gevonden' },
          { status: 404 }
        )
      }

      const existing = await prisma.$queryRaw`
        SELECT * FROM "AmbassadorEvent" WHERE "userId" = ${userId} AND "eventId" = ${event.id} LIMIT 1
      `

      if (Array.isArray(existing) && existing.length > 0) {
        return NextResponse.json(
          { error: 'Je bent al aangemeld voor dit evenement' },
          { status: 400 }
        )
      }

      await prisma.$executeRaw`
        INSERT INTO "AmbassadorEvent" ("userId", "eventId", "status")
        VALUES (${userId}, ${event.id}, 'PENDING')
      `

      return NextResponse.json({ success: true, userId, eventId: event.id }, { status: 201 })
    }

    return NextResponse.json(
      { error: 'userId is verplicht' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error registering ambassador:', error)
    return NextResponse.json(
      { error: 'Interne serverfout' },
      { status: 500 }
    )
  }
}
