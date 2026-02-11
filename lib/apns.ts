import http2 from 'http2'
import jwt from 'jsonwebtoken'

/**
 * Apple Push Notification service (APNs) helper
 * 
 * Required environment variables:
 *   APNS_KEY_ID       - Your Apple Push Notification Key ID (10 chars, from Apple Developer portal)
 *   APNS_TEAM_ID      - Your Apple Developer Team ID (10 chars)
 *   APNS_PRIVATE_KEY   - The .p8 private key contents (with newlines as \n)
 *   APNS_BUNDLE_ID     - Your iOS app bundle identifier (e.g. com.sharedcrowd.ambassador)
 *   APNS_PRODUCTION    - Set to "true" for production, omit or "false" for sandbox
 */

const APNS_HOST_PRODUCTION = 'api.push.apple.com'
const APNS_HOST_SANDBOX = 'api.sandbox.push.apple.com'

interface PushPayload {
  title: string
  body: string
  campaignId?: string
}

function getApnsHost(): string {
  return process.env.APNS_PRODUCTION === 'true'
    ? APNS_HOST_PRODUCTION
    : APNS_HOST_SANDBOX
}

function generateJWT(): string {
  const keyId = process.env.APNS_KEY_ID
  const teamId = process.env.APNS_TEAM_ID
  const privateKey = process.env.APNS_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!keyId || !teamId || !privateKey) {
    throw new Error('APNs environment variables (APNS_KEY_ID, APNS_TEAM_ID, APNS_PRIVATE_KEY) are not configured')
  }

  const token = jwt.sign({}, privateKey, {
    algorithm: 'ES256',
    header: {
      alg: 'ES256',
      kid: keyId,
    },
    issuer: teamId,
    expiresIn: '1h',
  })

  return token
}

function sendSingleNotification(
  deviceToken: string,
  payload: PushPayload,
  jwtToken: string,
  bundleId: string
): Promise<{ deviceToken: string; success: boolean; error?: string }> {
  return new Promise((resolve) => {
    const host = getApnsHost()
    const client = http2.connect(`https://${host}`)

    client.on('error', (err) => {
      console.error(`APNs connection error for ${deviceToken}:`, err.message)
      resolve({ deviceToken, success: false, error: err.message })
      client.close()
    })

    const apnsPayload = JSON.stringify({
      aps: {
        alert: {
          title: payload.title,
          body: payload.body,
        },
        sound: 'default',
        badge: 1,
      },
      campaignId: payload.campaignId,
    })

    const headers = {
      ':method': 'POST',
      ':path': `/3/device/${deviceToken}`,
      'authorization': `bearer ${jwtToken}`,
      'apns-topic': bundleId,
      'apns-push-type': 'alert',
      'apns-priority': '10',
      'content-type': 'application/json',
    }

    const req = client.request(headers)

    let responseData = ''

    req.on('response', (headers) => {
      const status = headers[':status']
      if (status === 200) {
        resolve({ deviceToken, success: true })
      } else {
        req.on('data', (chunk) => {
          responseData += chunk
        })
        req.on('end', () => {
          console.error(`APNs error for ${deviceToken}: status=${status} body=${responseData}`)
          resolve({ deviceToken, success: false, error: `status ${status}: ${responseData}` })
          client.close()
        })
        return
      }
      client.close()
    })

    req.on('error', (err) => {
      resolve({ deviceToken, success: false, error: err.message })
      client.close()
    })

    req.write(apnsPayload)
    req.end()
  })
}

/**
 * Send push notifications to multiple devices
 */
export async function sendPushNotifications(
  deviceTokens: string[],
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  const bundleId = process.env.APNS_BUNDLE_ID
  if (!bundleId) {
    throw new Error('APNS_BUNDLE_ID environment variable is not configured')
  }

  const jwtToken = generateJWT()

  // Send notifications in batches of 50
  const batchSize = 50
  let sent = 0
  let failed = 0

  for (let i = 0; i < deviceTokens.length; i += batchSize) {
    const batch = deviceTokens.slice(i, i + batchSize)
    const results = await Promise.all(
      batch.map((token) => sendSingleNotification(token, payload, jwtToken, bundleId))
    )

    for (const result of results) {
      if (result.success) {
        sent++
      } else {
        failed++
        console.warn(`Push failed for ${result.deviceToken}: ${result.error}`)
      }
    }
  }

  console.log(`Push notifications: ${sent} sent, ${failed} failed out of ${deviceTokens.length} total`)
  return { sent, failed }
}
