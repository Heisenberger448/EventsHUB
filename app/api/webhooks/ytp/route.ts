import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/webhooks/ytp
 *
 * Public webhook endpoint called by YTP after a successful purchase payment.
 * Query params (injected by YTP): tracker, purchaseId, secret
 *
 * YTP replaces placeholders in PurchaseSuccessWebhookUrl:
 *   %purchaseId% → the purchase ID
 *   %secret%     → the purchase secret
 *
 * We validate the secret, mark the purchase as paid, and update
 * the ambassador's ticket stats.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const trackerCode = searchParams.get('tracker')
    const purchaseIdStr = searchParams.get('purchaseId')
    const secret = searchParams.get('secret')

    console.log('[webhook/ytp] Received:', { trackerCode, purchaseIdStr, secret })

    if (!purchaseIdStr || !trackerCode) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const ytpPurchaseId = parseInt(purchaseIdStr, 10)
    if (isNaN(ytpPurchaseId)) {
      return NextResponse.json(
        { error: 'Invalid purchaseId' },
        { status: 400 }
      )
    }

    // Find the tracker purchase record
    const trackerPurchase = await prisma.trackerPurchase.findUnique({
      where: { ytpPurchaseId },
      include: {
        ambassadorEvent: true,
      },
    })

    if (!trackerPurchase) {
      console.error('[webhook/ytp] TrackerPurchase not found for ytpPurchaseId:', ytpPurchaseId)
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      )
    }

    // Validate secret if we have one stored
    if (trackerPurchase.secret && secret && trackerPurchase.secret !== secret) {
      console.error('[webhook/ytp] Secret mismatch for purchase:', ytpPurchaseId)
      return NextResponse.json(
        { error: 'Secret mismatch' },
        { status: 403 }
      )
    }

    // Already processed?
    if (trackerPurchase.paid) {
      console.log('[webhook/ytp] Purchase already marked as paid:', ytpPurchaseId)
      return NextResponse.json({ status: 'already_processed' })
    }

    // Mark purchase as paid
    await prisma.trackerPurchase.update({
      where: { ytpPurchaseId },
      data: {
        paid: true,
        paidAt: new Date(),
      },
    })

    // Recalculate ambassador totals from all paid TrackerPurchases
    const totals = await prisma.trackerPurchase.aggregate({
      where: {
        ambassadorEventId: trackerPurchase.ambassadorEventId,
        paid: true,
      },
      _sum: {
        totalAmount: true,
        ticketCount: true,
      },
    })

    await prisma.ambassadorEvent.update({
      where: { id: trackerPurchase.ambassadorEventId },
      data: {
        ticketsSold: totals._sum.ticketCount || 0,
        ticketRevenue: totals._sum.totalAmount || 0,
        lastSyncedAt: new Date(),
      },
    })

    console.log('[webhook/ytp] Purchase confirmed:', {
      ytpPurchaseId,
      ambassadorEventId: trackerPurchase.ambassadorEventId,
      ticketsSold: totals._sum.ticketCount,
      revenue: totals._sum.totalAmount,
    })

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('[webhook/ytp] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Also support POST in case YTP sends POST instead of GET
export { GET as POST }
