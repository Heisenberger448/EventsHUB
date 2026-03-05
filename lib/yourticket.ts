import { prisma } from '@/lib/prisma'

/**
 * YTP Ticketing API — OData REST API
 * Docs: https://ytpstorage1.blob.core.windows.net/media/YTP%20Ticketing%20API%20Specifications.pdf
 *
 * Authentication: API key sent as plain text in the Authorization header with every request.
 * Base URL: https://api.yourticketprovider.nl
 */
export const YOURTICKET_API_BASE = 'https://api.yourticketprovider.nl'

/**
 * Build authorization headers for the YTP Ticketing API.
 */
export function yourticketHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: apiKey,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
}

/**
 * Validate an API key by calling GET /Organisers.
 * Returns the first organiser or null if the key is invalid.
 */
export async function validateApiKey(
  apiKey: string
): Promise<{ id: number; firstName: string; lastName: string; email: string } | null> {
  try {
    const res = await fetch(`${YOURTICKET_API_BASE}/Organisers`, {
      headers: yourticketHeaders(apiKey),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Yourticket API key validation failed:', res.status, errText)
      return null
    }

    const data = await res.json()
    const organisers = data.value ?? data ?? []

    if (!Array.isArray(organisers) || organisers.length === 0) {
      console.error('Yourticket: no organisers found for this API key')
      return null
    }

    const org = organisers[0]
    return {
      id: org.Id,
      firstName: org.FirstName || '',
      lastName: org.LastName || '',
      email: org.Email || '',
    }
  } catch (error) {
    console.error('Error validating Yourticket API key:', error)
    return null
  }
}

/**
 * Get the API key for a given organization from the database.
 */
export async function getYourticketApiKey(
  organizationId: string
): Promise<{ apiKey: string; organiserId: number | null } | null> {
  const integration = await prisma.yourticketIntegration.findUnique({
    where: { organizationId },
  })

  if (!integration?.apiKey) {
    return null
  }

  return { apiKey: integration.apiKey, organiserId: integration.organiserId }
}
