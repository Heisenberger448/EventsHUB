import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - List all pre-registrations for the organization
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['ORG_ADMIN', 'ORG_USER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (!session.user.organizationId) {
      return NextResponse.json({ error: 'User not associated with an organization' }, { status: 400 })
    }

    const preRegistrations = await prisma.preRegistration.findMany({
      where: { organizationId: session.user.organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        event: { select: { id: true, name: true } },
        _count: { select: { entries: true } },
      },
    })

    return NextResponse.json(preRegistrations)
  } catch (error) {
    console.error('Error fetching pre-registrations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new pre-registration
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['ORG_ADMIN', 'ORG_USER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (!session.user.organizationId) {
      return NextResponse.json({ error: 'User not associated with an organization' }, { status: 400 })
    }

    const body = await req.json()
    const { title, description, salesLiveAt, eventId } = body

    if (!title || !salesLiveAt) {
      return NextResponse.json({ error: 'Title and sales live date are required' }, { status: 400 })
    }

    // Generate slug
    let baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    if (!baseSlug) baseSlug = 'pre-registration'

    let slug = baseSlug
    let counter = 1
    while (await prisma.preRegistration.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const preRegistration = await prisma.preRegistration.create({
      data: {
        organizationId: session.user.organizationId,
        eventId: eventId || null,
        title,
        slug,
        description: description || null,
        salesLiveAt: new Date(salesLiveAt),
        campaignCreated: !!eventId,
      },
      include: {
        event: { select: { id: true, name: true } },
        _count: { select: { entries: true } },
      },
    })

    // Immediately create a scheduled campaign if linked to an event
    if (eventId) {
      const salesDate = new Date(salesLiveAt)
      await prisma.campaign.create({
        data: {
          eventId,
          title: 'Pre-registration sales live',
          description: `De verkoop voor ${title} is nu live! Ga snel naar de ticketshop om je tickets te bemachtigen.`,
          startDate: salesDate,
          endDate: new Date(salesDate.getTime() + 24 * 60 * 60 * 1000),
          rewardPoints: 0,
          status: 'ACTIVE',
          sendAppNotification: true,
          sendWhatsApp: true,
          notificationTitle: 'Pre-registration sales live!',
          notificationMessage: `De verkoop voor ${title} is nu gestart!`,
          whatsappMessage: `🎉 De verkoop voor ${title} is nu live! Ga snel naar de ticketshop om je tickets te bemachtigen.`,
        },
      })
    }

    return NextResponse.json(preRegistration, { status: 201 })
  } catch (error) {
    console.error('Error creating pre-registration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
