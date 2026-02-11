import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPushNotifications } from '@/lib/apns'

// Shared logic for sending scheduled campaigns
async function processScheduledCampaigns() {
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
    return { message: 'Geen campagnes om te versturen', sent: 0, campaigns: 0 }
  }

  let totalNotificationsSent = 0

  for (const campaign of campaignsToSend) {
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
    } else {
      console.log(`⚠️ Campaign "${campaign.title}" has no ambassadors with device tokens`)
    }

    // Mark campaign as sent regardless (to avoid retrying forever)
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { sentAt: now },
    })
  }

  return {
    message: `${campaignsToSend.length} campagne(s) verwerkt`,
    campaigns: campaignsToSend.length,
    notificationsSent: totalNotificationsSent,
  }
}

function checkAuth(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return true // No secret configured = allow all

  // Check query parameter (for cron-job.org)
  const url = new URL(req.url)
  const querySecret = url.searchParams.get('secret')
  if (querySecret === cronSecret) return true

  // Check Authorization header
  const authHeader = req.headers.get('authorization')
  if (authHeader === `Bearer ${cronSecret}`) return true

  return false
}

// GET /api/campaigns/send-scheduled?secret=xxx
// Used by external cron services like cron-job.org
export async function GET(req: NextRequest) {
  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const result = await processScheduledCampaigns()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in send-scheduled (GET):', error)
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 })
  }
}

// POST /api/campaigns/send-scheduled
// Alternative endpoint for programmatic access
export async function POST(req: NextRequest) {
  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await processScheduledCampaigns()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in send-scheduled (POST):', error)
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 })
  }
}
