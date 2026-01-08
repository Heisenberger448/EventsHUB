import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const body = await req.json()
    const { name, email, password, userId, metadata } = body

    console.log('📝 Register request:', { eventId: params.eventId, userId, email, hasPassword: !!password, hasMetadata: !!metadata })

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: params.eventId }
    })

    if (!event) {
      console.log('❌ Event not found:', params.eventId)
      return NextResponse.json(
        { error: 'Evenement niet gevonden' },
        { status: 404 }
      )
    }

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

      // Check if already registered for this event
      const existing = await prisma.ambassadorEvent.findUnique({
        where: {
          userId_eventId: {
            userId: userId,
            eventId: params.eventId
          }
        }
      })

      if (existing) {
        console.log('⚠️ Already registered')
        return NextResponse.json(
          { error: 'Je bent al aangemeld voor dit evenement' },
          { status: 400 }
        )
      }

      // Create event registration
      const registration = await prisma.ambassadorEvent.create({
        data: {
          userId: userId,
          eventId: params.eventId,
          status: 'PENDING'
        }
      })

      console.log('✅ Registration created:', registration.id)
      return NextResponse.json(registration, { status: 201 })
    }

    // Mode 2: New user (password provided)
    console.log('✅ Mode 2: New user registration')

    if (!name || !email || !password) {
      console.log('❌ Missing fields')
      return NextResponse.json(
        { error: 'Naam, email en wachtwoord zijn verplicht' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email')
      return NextResponse.json(
        { error: 'Ongeldig email formaat' },
        { status: 400 }
      )
    }

    // Validate password
    if (password.length < 6) {
      console.log('❌ Password too short')
      return NextResponse.json(
        { error: 'Wachtwoord moet minimaal 6 karakters zijn' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    })

    if (existingUser) {
      // User exists, check if already registered for this event
      const existingRegistration = await prisma.ambassadorEvent.findUnique({
        where: {
          userId_eventId: {
            userId: existingUser.id,
            eventId: params.eventId
          }
        }
      })

      if (existingRegistration) {
        console.log('⚠️ User exists and already registered')
        return NextResponse.json(
          { error: 'Je bent al aangemeld voor dit evenement' },
          { status: 400 }
        )
      }

      // User exists but not registered for this event
      const registration = await prisma.ambassadorEvent.create({
        data: {
          userId: existingUser.id,
          eventId: params.eventId,
          status: 'PENDING',
          instagram: metadata?.instagram || null,
          tiktok: metadata?.tiktok || null,
          phone: metadata?.phone || null,
          birthDate: metadata?.birthDate || null,
          gender: metadata?.gender || null,
          address: metadata?.address || null
        }
      })

      console.log('✅ Existing user registered for new event:', registration.id)
      return NextResponse.json(registration, { status: 201 })
    }

    // Create new user
    const passwordHash = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: 'ORG_USER'
      }
    })

    // Create event registration with social media data
    const registration = await prisma.ambassadorEvent.create({
      data: {
        userId: newUser.id,
        eventId: params.eventId,
        status: 'PENDING',
        instagram: metadata?.instagram || null,
        tiktok: metadata?.tiktok || null,
        phone: metadata?.phone || null,
        birthDate: metadata?.birthDate || null,
        gender: metadata?.gender || null,
        address: metadata?.address || null
      }
    })

    console.log('✅ New user and registration created:', newUser.id, registration.id)
    return NextResponse.json({ user: newUser, registration }, { status: 201 })
  } catch (error) {
    console.error('❌ Error registering ambassador:', error)
    return NextResponse.json(
      { error: 'Interne serverfout' },
      { status: 500 }
    )
  }
}
