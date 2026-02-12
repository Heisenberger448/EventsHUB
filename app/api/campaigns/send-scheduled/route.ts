import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPushNotifications } from '@/lib/apns'

// Auto-create campaigns for pre-registrations whose sales date has passed
async function processPreRegistrationCampaigns(now: Date) {
  try {
    const duePreRegistrations = await prisma.preRegistration.findMany({
      where: {
        campaignCreated: false,
        salesLiveAt: { lte: now },
      },
      include: {
        event: true,
        organization: true,
      },
    })

    for (const preReg of duePreRegistrations) {
      // Only create campaign if linked to an event
      if (!preReg.eventId) {
        // Mark as done so we don't keep checking
        await prisma.preRegistration.update({
          where: { id: preReg.id },
          data: { campaignCreated: true },
        })
        console.log(`⚠️ Pre-registration "${preReg.title}" has no event linked, skipping campaign creation`)
        continue
      }

      try {
        await prisma.campaign.create({
          data: {
            eventId: preReg.eventId,
            title: 'Pre-registration sales live',
            description: `De verkoop voor ${preReg.title} is nu live! Ga snel naar de ticketshop om je tickets te bemachtigen.`,
            startDate: preReg.salesLiveAt,
            endDate: new Date(preReg.salesLiveAt.getTime() + 24 * 60 * 60 * 1000), // 24h after
            rewardPoints: 0,
            status: 'ACTIVE',
            sendAppNotification: true,
            notificationTitle: 'Pre-registration sales live!',
            notificationMessage: `De verkoop voor ${preReg.title} is nu gestart!`,
          },
        })

        await prisma.preRegistration.update({
          where: { id: preReg.id },
          data: { campaignCreated: true },
        })

        console.log(`✅ Auto-created campaign for pre-registration "${preReg.title}"`)
      } catch (err) {
        console.error(`❌ Failed to create campaign for pre-registration "${preReg.title}":`, err)
      }
    }
  } catch (error) {
    console.error('Error processing pre-registration campaigns:', error)
  }
}

// Shared logic for sending scheduled campaigns
async function processScheduledCampaigns() {
  const now = new Date()

  // ── Auto-create campaigns for pre-registrations whose sales date has passed ──
  await processPreRegistrationCampaigns(now)

  // Debug: log all campaigns to understand why none match
  const allCampaigns = await prisma.campaign.findMany({
    select: {
      id: true,
      title: true,
      status: true,
      sendAppNotification: true,
      sentAt: true,
      startDate: true,
    },
  })
  console.log(`🔍 Debug - Current time (UTC): ${now.toISOString()}`)
  console.log(`🔍 Debug - All campaigns:`, JSON.stringify(allCampaigns, null, 2))

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
    return { 
      message: 'Geen campagnes om te versturen', 
      sent: 0, 
      campaigns: 0,
      debug: {
        currentTimeUTC: now.toISOString(),
        totalCampaignsInDB: allCampaigns.length,
        allCampaigns: allCampaigns.map(c => ({
          id: c.id,
          title: c.title,
          status: c.status,
          sendAppNotification: c.sendAppNotification,
          sentAt: c.sentAt,
          startDate: c.startDate,
          startDatePassed: c.startDate ? new Date(c.startDate) <= now : null,
        })),
      },
    }
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
