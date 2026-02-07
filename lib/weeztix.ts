import { prisma } from '@/lib/prisma'

/**
 * Refresh the Weeztix access token using the refresh token.
 * Returns the new access token or null if refresh failed.
 */
export async function refreshWeeztixToken(
  organizationId: string
): Promise<string | null> {
  const integration = await prisma.weeztixIntegration.findUnique({
    where: { organizationId },
  })

  if (!integration?.refreshToken || !integration.clientId || !integration.clientSecret) {
    return null
  }

  // Check if refresh token itself is expired (~365 days)
  if (
    integration.refreshTokenExpiresAt &&
    new Date(integration.refreshTokenExpiresAt) < new Date()
  ) {
    console.error('Weeztix refresh token expired, user needs to reconnect')
    // Clear the connection
    await prisma.weeztixIntegration.update({
      where: { organizationId },
      data: {
        accessToken: null,
        refreshToken: null,
        accessTokenExpiresAt: null,
        refreshTokenExpiresAt: null,
        connectedAt: null,
      },
    })
    return null
  }

  try {
    const res = await fetch('https://auth.weeztix.com/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        client_id: integration.clientId,
        client_secret: integration.clientSecret,
        refresh_token: integration.refreshToken,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Weeztix token refresh failed:', errText)
      return null
    }

    const data = await res.json()
    const now = new Date()

    await prisma.weeztixIntegration.update({
      where: { organizationId },
      data: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token, // Refresh token is single-use, store the new one
        accessTokenExpiresAt: new Date(
          now.getTime() + (data.expires_in || 259200) * 1000
        ),
        refreshTokenExpiresAt: new Date(
          now.getTime() + 365 * 24 * 60 * 60 * 1000
        ),
      },
    })

    return data.access_token
  } catch (error) {
    console.error('Error refreshing Weeztix token:', error)
    return null
  }
}

/**
 * Get a valid Weeztix access token for the given organization.
 * Automatically refreshes if the current token is expired.
 */
export async function getWeeztixToken(
  organizationId: string
): Promise<{ token: string; companyGuid: string | null } | null> {
  const integration = await prisma.weeztixIntegration.findUnique({
    where: { organizationId },
  })

  if (!integration?.accessToken) return null

  // Check if access token is still valid (with 5-min buffer)
  const isExpired =
    integration.accessTokenExpiresAt &&
    new Date(integration.accessTokenExpiresAt).getTime() - 5 * 60 * 1000 <
      Date.now()

  if (isExpired) {
    const newToken = await refreshWeeztixToken(organizationId)
    if (!newToken) return null
    return { token: newToken, companyGuid: integration.companyGuid }
  }

  return {
    token: integration.accessToken,
    companyGuid: integration.companyGuid,
  }
}
