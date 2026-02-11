import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPushNotifications } from '@/lib/apns'

// POST /api/campaigns/send-scheduled
// Cron endpoint: finds ACTIVE campaigns past their startDate that haven't been sent yet,
// and sends push notifications to all ambassadors of that event.
export async function POST(req: NextRequest) {
  try {
    // Optional: protect with a secret key
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()

    // Find campaigns that are ACTIVE, have sendAppNotification enabled,
    // startDate has passed, and haven't been sent yet
    const campaignsToSend = await prisma.campaign.findMany({
      where: {
        status: 'ACTIVE',
        sendAppNotification: true,
        sentAt: null,
        startDate: {
          lte: now,
        },
      },
      include: {
        event: {
          include: {
            ambassadorEvents: {
              where: {
                status: 'ACCEPTED',
              },
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    deviceToken: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (campaignsToSend.length === 0) {
      return NextResponse.json({ message: 'Geen campagnes om te versturen', sent: 0 })
    }

    let totalNotificationsSent = 0

    for (const campaign of campaignsToSend) {
      // Collect device tokens from all accepted ambassadors of this event
      const deviceTokens = campaign.event.ambassadorEvents
        .map((ae) => ae.user.deviceToken)
        .filter((token): token is string => !!token)

      if (deviceTokens.length > 0) {
        const title = campaign.notificationTitle || campaign.title
        const body = campaign.notificationMessage || campaign.description

        try {
          await sendPushNotifications(deviceTokens, {
            title,
            body,
            campaignId: campaign.id,
          })
          totalNotificationsSent += deviceTokens.length
          console.log(`✅ Sent ${deviceTokens.length} push notifications for campaign "${campaign.title}"`)
        } catch (err) {
          console.error(`❌ Failed to send push notifications for campaign "${campaign.title}":`, err)
        }
      }

      // Mark campaign as sent regardless (to avoid retrying forever)
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: { sentAt: now },
      })
    }

    return NextResponse.json({
      message: `${campaignsToSend.length} campagne(s) verwerkt`,
      campaigns: campaignsToSend.length,
      notificationsSent: totalNotificationsSent,
    })
  } catch (error) {
    console.error('Error in send-scheduled:', error)
    return NextResponse.json(
      { error: 'Interne serverfout' },
      { status: 500 }
    )
  }
}
