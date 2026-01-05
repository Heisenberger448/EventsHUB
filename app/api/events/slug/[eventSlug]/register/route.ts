import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(
  req: NextRequest,
  { params }: { params: { eventSlug: string } }
) {
  console.log('📝 POST /api/events/slug/[eventSlug]/register called')
  console.log('   Slug:', params.eventSlug)
  
  try {
    const body = await req.json()
    console.log('   Body:', body)
    const { name, email, password, userId } = body

    console.log('📝 Register request for slug:', params.eventSlug, { userId, email, hasPassword: !!password })

    // Find event by slug
    const event = await prisma.event.findUnique({
      where: { slug: params.eventSlug }
    })

    if (!event) {
      console.log('❌ Event not found:', params.eventSlug)
      return NextResponse.json(
        { error: 'Evenement niet gevonden' },
        { status: 404 }
      )
    }

    console.log('✅ Event found:', event.id)

    // Mode 1: Existing user (userId provided from login)
    if (userId) {
      console.log('✅ Mode 1: Existing user registration')
      
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        console.log('❌ User not found:', userId)
        return NextResponse.json(
          { error: 'Gebruiker niet gevonden' },
          { status: 404 }
        )
      }

      // Check if already registered for this event using raw SQL
      const existing = await prisma.$queryRaw`
        SELECT * FROM "AmbassadorEvent" WHERE "userId" = ${userId} AND "eventId" = ${event.id} LIMIT 1
      ` as any[]

      if (existing.length > 0) {
        console.log('⚠️ Already registered')
        return NextResponse.json(
          { error: 'Je bent al aangemeld voor dit evenement' },
          { status: 400 }
        )
      }

      // Generate a simple ID for the new record
      const newId = `cm${crypto.randomBytes(10).toString('base64url')}`

      // Create event registration using raw SQL
      await prisma.$executeRaw`
        INSERT INTO "AmbassadorEvent" ("id", "userId", "eventId", "status", "createdAt")
        VALUES (${newId}, ${userId}, ${event.id}, 'PENDING', NOW())
      `

      console.log('✅ Registration created:', userId, event.id, newId)
      return NextResponse.json({ success: true, userId, eventId: event.id }, { status: 201 })
    }

    console.log('⚠️ No userId provided - this flow not yet implemented')
    return NextResponse.json(
      { error: 'userId is verplicht' },
      { status: 400 }
    )
  } catch (error) {
    console.error('❌ Error registering ambassador:', error)
    return NextResponse.json(
      { error: 'Interne serverfout' },
      { status: 500 }
    )
  }
}
