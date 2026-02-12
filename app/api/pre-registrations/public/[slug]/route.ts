import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Public: get pre-registration details by slug
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const preRegistration = await prisma.preRegistration.findUnique({
      where: { slug: params.slug },
      select: {
        id: true,
        title: true,
        description: true,
        salesLiveAt: true,
        slug: true,
        event: {
          select: {
            name: true,
          },
        },
        organization: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!preRegistration) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(preRegistration)
  } catch (error) {
    console.error('Error fetching pre-registration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Public: submit a pre-registration entry
export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const preRegistration = await prisma.preRegistration.findUnique({
      where: { slug: params.slug },
    })

    if (!preRegistration) {
      return NextResponse.json({ error: 'Pre-registration not found' }, { status: 404 })
    }

    const body = await req.json()
    const { firstName, lastName, email, phoneNumber, countryCode } = body

    if (!firstName || !lastName || !email || !phoneNumber) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check for duplicate email
    const existing = await prisma.preRegistrationEntry.findFirst({
      where: {
        preRegistrationId: preRegistration.id,
        email: email.toLowerCase(),
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'This email is already registered' },
        { status: 409 }
      )
    }

    const entry = await prisma.preRegistrationEntry.create({
      data: {
        preRegistrationId: preRegistration.id,
        firstName,
        lastName,
        email: email.toLowerCase(),
        phoneNumber,
        countryCode: countryCode || '+31',
      },
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('Error creating pre-registration entry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
