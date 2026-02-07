import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET — OAuth callback from Weeztix after user approves
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/login?error=weeztix_missing_params', req.url)
    )
  }

  let orgId: string
  try {
    const parsed = JSON.parse(Buffer.from(state, 'base64').toString())
    orgId = parsed.orgId
  } catch {
    return NextResponse.redirect(
      new URL('/login?error=weeztix_invalid_state', req.url)
    )
  }

  // Fetch the stored credentials
  const integration = await prisma.weeztixIntegration.findUnique({
    where: { organizationId: orgId },
    include: { organization: { select: { slug: true } } },
  })

  if (!integration) {
    return NextResponse.redirect(
      new URL('/login?error=weeztix_no_integration', req.url)
    )
  }

  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || ''
  const redirectUri = `${baseUrl}/api/integrations/weeztix/callback`

  try {
    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://auth.weeztix.com/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: integration.clientId,
        client_secret: integration.clientSecret,
        redirect_uri: redirectUri,
        code,
      }),
    })

    if (!tokenRes.ok) {
      const errText = await tokenRes.text()
      console.error('Weeztix token exchange failed:', errText)
      return NextResponse.redirect(
        new URL(
          `/${integration.organization.slug}/integrations?error=token_exchange_failed`,
          baseUrl
        )
      )
    }

    const tokenData = await tokenRes.json()

    // Calculate expiry timestamps
    const now = new Date()
    const accessTokenExpiresAt = new Date(
      now.getTime() + (tokenData.expires_in || 259200) * 1000
    )
    // Refresh token is valid for ~365 days
    const refreshTokenExpiresAt = new Date(
      now.getTime() + 365 * 24 * 60 * 60 * 1000
    )

    // Extract company info from the token response
    let companyGuid: string | null = null
    let companyName: string | null = null
    if (tokenData.info?.companies?.length > 0) {
      companyGuid = tokenData.info.companies[0].guid || null
      companyName = tokenData.info.companies[0].name || null
    }

    // Update the integration with tokens
    await prisma.weeztixIntegration.update({
      where: { organizationId: orgId },
      data: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        accessTokenExpiresAt,
        refreshTokenExpiresAt,
        companyGuid,
        companyName,
        connectedAt: now,
      },
    })

    // Redirect back to integrations page
    return NextResponse.redirect(
      new URL(
        `/${integration.organization.slug}/integrations?connected=weeztix`,
        baseUrl
      )
    )
  } catch (error) {
    console.error('Weeztix callback error:', error)
    return NextResponse.redirect(
      new URL(
        `/${integration.organization.slug}/integrations?error=weeztix_callback_error`,
        baseUrl
      )
    )
  }
}
