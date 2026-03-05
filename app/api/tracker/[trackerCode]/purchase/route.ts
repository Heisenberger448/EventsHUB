import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getYourticketApiKey, yourticketHeaders, YOURTICKET_API_BASE } from '@/lib/yourticket'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/tracker/[trackerCode]/purchase
 *
 * Public endpoint — creates a YTP purchase via POST /Purchases with our
 * PurchaseSuccessWebhookUrl so we can attribute the sale to the ambassador.
 *
 * Body: {
 *   email: string,
 *   firstName: string,
 *   lastName: string,
 *   items: [{ ticketId: number, quantity: number }]
 * }
 *
 * Returns: { paymentUrl: string } — redirect buyer to this URL for payment.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { trackerCode: string } }
) {
  try {
    const { trackerCode } = params
    const body = await req.json()
    const { email, firstName, lastName, items } = body

    if (!email || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'E-mail en minstens 1 ticket zijn verplicht.' },
        { status: 400 }
      )
    }

    // Look up ambassador event
    const ambassadorEvent = await prisma.ambassadorEvent.findFirst({
      where: {
        trackerCode,
        status: 'ACCEPTED',
      },
      include: {
        event: true,
      },
    })

    if (!ambassadorEvent) {
      return NextResponse.json(
        { error: 'Tracker niet gevonden of niet actief.' },
        { status: 404 }
      )
    }

    const { event } = ambassadorEvent

    if (event.ticketProvider !== 'yourticket' || !event.ticketShopId) {
      return NextResponse.json(
        { error: 'Dit evenement gebruikt geen Yourticket Provider.' },
        { status: 400 }
      )
    }

    // Get YTP API credentials
    const creds = await getYourticketApiKey(event.organizationId)
    if (!creds) {
      return NextResponse.json(
        { error: 'Yourticket integratie niet gevonden.' },
        { status: 500 }
      )
    }

    const headers = yourticketHeaders(creds.apiKey)
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || ''

    // Build webhook URL with tracker code embedded
    // YTP replaces %purchaseId%, %email%, %eventId%, %secret% automatically
    const webhookUrl = `${baseUrl}/api/webhooks/ytp?tracker=${trackerCode}&purchaseId=%purchaseId%&secret=%secret%`
    const successRedirectUrl = `${baseUrl}/t/${trackerCode}/success`

    // Build PurchaseItems array for YTP
    // Note: only include TicketHolder info if TicketClaim is NOT enabled on the event.
    // We first try with holder info; if YTP rejects it we retry without.
    const purchaseItems: any[] = []
    for (const item of items) {
      for (let i = 0; i < (item.quantity || 1); i++) {
        purchaseItems.push({
          TicketId: item.ticketId,
        })
      }
    }

    // Create purchase via YTP API
    const purchaseBody = {
      EventId: parseInt(event.ticketShopId, 10),
      Email: email,
      IncludeTicketGuarantee: false,
      PurchaseItems: purchaseItems,
      PurchaseSuccessWebhookUrl: webhookUrl,
      SuccessfulPurchaseRedirectUrl: successRedirectUrl,
    }

    console.log('[tracker/purchase] Creating YTP purchase:', JSON.stringify(purchaseBody, null, 2))

    const purchaseRes = await fetch(`${YOURTICKET_API_BASE}/Purchases`, {
      method: 'POST',
      headers,
      body: JSON.stringify(purchaseBody),
    })

    if (!purchaseRes.ok) {
      const errText = await purchaseRes.text()
      console.error('[tracker/purchase] YTP purchase failed:', purchaseRes.status, errText)
      return NextResponse.json(
        { error: `Bestelling kon niet worden aangemaakt: ${errText}` },
        { status: 502 }
      )
    }

    const purchaseData = await purchaseRes.json()
    const ytpPurchaseId = purchaseData.Id
    const secret = purchaseData.Secret
    const totalAmount = Math.round((purchaseData.TotalAmount || 0) * 100) // store in cents

    console.log('[tracker/purchase] YTP purchase created:', {
      ytpPurchaseId,
      totalAmount,
      secret,
    })

    // Store the purchase in our DB as pending
    await prisma.trackerPurchase.create({
      data: {
        ambassadorEventId: ambassadorEvent.id,
        ytpPurchaseId,
        email,
        totalAmount,
        ticketCount: purchaseItems.length,
        secret,
        paid: false,
      },
    })

    // Step 2: Fetch available payment methods for this event
    let paymentType = 'ideal' // default fallback
    try {
      const pmRes = await fetch(
        `${YOURTICKET_API_BASE}/Events(${event.ticketShopId})/PaymentMethods`,
        { headers }
      )
      if (pmRes.ok) {
        const pmData = await pmRes.json()
        const methods = pmData.value ?? pmData ?? []
        console.log('[tracker/purchase] Available payment methods:', methods.map((m: any) => m.Type))
        if (methods.length > 0) {
          paymentType = methods[0].Type
        }
      }
    } catch (pmErr) {
      console.error('[tracker/purchase] Failed to fetch payment methods:', pmErr)
    }

    // Step 3: Start payment via YTP.StartPayment to get PaymentUrl
    console.log('[tracker/purchase] Starting payment with type:', paymentType)
    const startPaymentRes = await fetch(
      `${YOURTICKET_API_BASE}/Purchases(${ytpPurchaseId})/YTP.StartPayment`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          paymentType,
        }),
      }
    )

    if (!startPaymentRes.ok) {
      const errText = await startPaymentRes.text()
      console.error('[tracker/purchase] StartPayment failed:', startPaymentRes.status, errText)

      // For free tickets, the purchase may already be "paid" — redirect to success
      if (totalAmount === 0) {
        // Mark as paid in our DB
        await prisma.trackerPurchase.update({
          where: { ytpPurchaseId },
          data: { paid: true, paidAt: new Date() },
        })

        // Recalculate ambassador totals
        const totals = await prisma.trackerPurchase.aggregate({
          where: { ambassadorEventId: ambassadorEvent.id, paid: true },
          _sum: { totalAmount: true, ticketCount: true },
        })
        await prisma.ambassadorEvent.update({
          where: { id: ambassadorEvent.id },
          data: {
            ticketsSold: totals._sum.ticketCount || 0,
            ticketRevenue: totals._sum.totalAmount || 0,
            lastSyncedAt: new Date(),
          },
        })

        return NextResponse.json({ paymentUrl: successRedirectUrl })
      }

      return NextResponse.json(
        { error: 'Betaling starten mislukt.' },
        { status: 502 }
      )
    }

    const startPaymentData = await startPaymentRes.json()
    const paymentUrl = startPaymentData.PaymentUrl

    console.log('[tracker/purchase] StartPayment result:', {
      ytpPurchaseId,
      paymentUrl,
    })

    if (!paymentUrl) {
      // If no payment URL (e.g. free ticket already completed), redirect to success
      return NextResponse.json({ paymentUrl: successRedirectUrl })
    }

    return NextResponse.json({ paymentUrl })
  } catch (error) {
    console.error('[tracker/purchase] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
