import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET — fetch current Weeztix integration status
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const integration = await prisma.weeztixIntegration.findUnique({
      where: { organizationId: session.user.organizationId },
      select: {
        id: true,
        clientId: true,
        companyGuid: true,
        companyName: true,
        connectedAt: true,
        accessTokenExpiresAt: true,
        createdAt: true,
      },
    })

    if (!integration) {
      return NextResponse.json({ connected: false })
    }

    const isTokenValid =
      integration.accessTokenExpiresAt &&
      new Date(integration.accessTokenExpiresAt) > new Date()

    return NextResponse.json({
      connected: !!integration.connectedAt,
      tokenValid: isTokenValid,
      companyName: integration.companyName,
      companyGuid: integration.companyGuid,
      connectedAt: integration.connectedAt,
      clientId: integration.clientId,
    })
  } catch (error) {
    console.error('Error fetching Weeztix status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST — save client credentials and get the authorization URL
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { clientId, clientSecret } = await req.json()

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Client ID and Client Secret are required' },
        { status: 400 }
      )
    }

    // Upsert the integration record with credentials
    await prisma.weeztixIntegration.upsert({
      where: { organizationId: session.user.organizationId },
      create: {
        organizationId: session.user.organizationId,
        clientId,
        clientSecret,
      },
      update: {
        clientId,
        clientSecret,
        accessToken: null,
        refreshToken: null,
        accessTokenExpiresAt: null,
        connectedAt: null,
        companyGuid: null,
        companyName: null,
      },
    })

    // Build the redirect URL for Weeztix OAuth
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || ''
    const redirectUri = `${baseUrl}/api/integrations/weeztix/callback`
    const state = Buffer.from(
      JSON.stringify({ orgId: session.user.organizationId })
    ).toString('base64')

    const authUrl =
      `https://login.weeztix.com/login?` +
      new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        state,
      }).toString()

    return NextResponse.json({ authUrl, redirectUri })
  } catch (error) {
    console.error('Error saving Weeztix credentials:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE — disconnect Weeztix integration
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.weeztixIntegration.deleteMany({
      where: { organizationId: session.user.organizationId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error disconnecting Weeztix:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
