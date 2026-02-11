import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single campaign
export async function GET(
  req: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.campaignId },
      include: {
        event: {
          include: {
            organization: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        },
        completions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campagne niet gevonden' },
        { status: 404 }
      )
    }

    return NextResponse.json(campaign)
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json(
      { error: 'Interne serverfout' },
      { status: 500 }
    )
  }
}

// PATCH update campaign
export async function PATCH(
  req: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const body = await req.json()
    const { title, notificationTitle, notificationMessage, whatsappMessage, sendWhatsApp, sendAppNotification, sendInApp, description, startDate, endDate, rewardPoints, status } = body

    const campaign = await prisma.campaign.update({
      where: { id: params.campaignId },
      data: {
        ...(title && { title }),
        ...(notificationTitle !== undefined && { notificationTitle: notificationTitle || null }),
        ...(notificationMessage !== undefined && { notificationMessage: notificationMessage || null }),
        ...(whatsappMessage !== undefined && { whatsappMessage: whatsappMessage || null }),
        ...(sendWhatsApp !== undefined && { sendWhatsApp: !!sendWhatsApp }),
        ...(sendAppNotification !== undefined && { sendAppNotification: !!sendAppNotification }),
        ...(sendInApp !== undefined && { sendInApp: !!sendInApp }),
        ...(description && { description }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(rewardPoints !== undefined && { rewardPoints: parseInt(rewardPoints) }),
        ...(status && { status })
      },
      include: {
        event: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json(campaign)
  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json(
      { error: 'Interne serverfout' },
      { status: 500 }
    )
  }
}

// DELETE campaign
export async function DELETE(
  req: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    await prisma.campaign.delete({
      where: { id: params.campaignId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json(
      { error: 'Interne serverfout' },
      { status: 500 }
    )
  }
}
