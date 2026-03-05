import { prisma } from '@/lib/prisma'

const CM_TICKETING_BASE = 'https://api.ticketing.cm.com/partnerapi/v1.0'

/**
 * Sign in to the CM.com Ticketing API and obtain a bearer token.
 * Returns the access token or null if sign-in failed.
 */
export async function signInYourticket(
  email: string,
  password: string
): Promise<{ token: string; expiresAt: Date } | null> {
  try {
    const res = await fetch(`${CM_TICKETING_BASE}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Yourticket sign-in failed:', res.status, errText)
      return null
    }

    const data = await res.json()

    // The API returns a bearer token — typically valid for 24 hours
    const token = data.token || data.access_token || data.accessToken
    if (!token) {
      console.error('Yourticket sign-in: no token in response', data)
      return null
    }

    // Default expiry to 23 hours to be safe (re-auth before actual expiry)
    const expiresIn = data.expires_in || data.expiresIn || 82800 // 23h in seconds
    const expiresAt = new Date(Date.now() + expiresIn * 1000)

    return { token, expiresAt }
  } catch (error) {
    console.error('Error signing in to Yourticket:', error)
    return null
  }
}

/**
 * Refresh the Yourticket access token by re-authenticating.
 * CM.com Ticketing uses email/password auth, so we just sign in again.
 */
export async function refreshYourticketToken(
  organizationId: string
): Promise<string | null> {
  const integration = await prisma.yourticketIntegration.findUnique({
    where: { organizationId },
  })

  if (!integration?.email || !integration.password) {
    return null
  }

  const result = await signInYourticket(integration.email, integration.password)
  if (!result) {
    console.error('Yourticket token refresh failed, credentials might be invalid')
    return null
  }

  await prisma.yourticketIntegration.update({
    where: { organizationId },
    data: {
      accessToken: result.token,
      accessTokenExpiresAt: result.expiresAt,
    },
  })

  return result.token
}

/**
 * Get a valid Yourticket access token for the given organization.
 * Automatically refreshes (re-authenticates) if the current token is expired.
 */
export async function getYourticketToken(
  organizationId: string
): Promise<string | null> {
  const integration = await prisma.yourticketIntegration.findUnique({
    where: { organizationId },
  })

  if (!integration?.accessToken) {
    // No token at all, try to sign in
    if (integration?.email && integration.password) {
      return refreshYourticketToken(organizationId)
    }
    return null
  }

  // Check if access token is still valid (with 5-min buffer)
  const isExpired =
    integration.accessTokenExpiresAt &&
    new Date(integration.accessTokenExpiresAt).getTime() - 5 * 60 * 1000 <
      Date.now()

  if (isExpired) {
    const newToken = await refreshYourticketToken(organizationId)
    return newToken
  }

  return integration.accessToken
}

/**
 * Build authorization headers for the CM.com Ticketing API.
 */
export function yourticketHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
}

/**
 * CM.com Ticketing API base URL
 */
export const YOURTICKET_API_BASE = CM_TICKETING_BASE
