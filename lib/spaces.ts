import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const spacesEndpoint = process.env.DO_SPACES_ENDPOINT || 'https://ams3.digitaloceanspaces.com'
const spacesBucket = process.env.DO_SPACES_BUCKET || ''
const spacesRegion = process.env.DO_SPACES_REGION || 'ams3'
const spacesCdnEndpoint = process.env.DO_SPACES_CDN_ENDPOINT || ''

const s3Client = new S3Client({
  endpoint: spacesEndpoint,
  region: spacesRegion,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY || '',
    secretAccessKey: process.env.DO_SPACES_SECRET || '',
  },
  forcePathStyle: false,
})

/**
 * Upload a file to Digital Ocean Spaces
 */
export async function uploadToSpaces(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: spacesBucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read',
  })

  await s3Client.send(command)

  // Return the public URL (use CDN if configured, otherwise direct Spaces URL)
  if (spacesCdnEndpoint) {
    return `${spacesCdnEndpoint}/${key}`
  }
  return `${spacesEndpoint}/${spacesBucket}/${key}`
}

/**
 * Delete a file from Digital Ocean Spaces
 */
export async function deleteFromSpaces(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: spacesBucket,
    Key: key,
  })

  await s3Client.send(command)
}

/**
 * Extract the Spaces key from a full URL
 */
export function getKeyFromUrl(fileUrl: string): string {
  // Handle CDN URL
  if (spacesCdnEndpoint && fileUrl.startsWith(spacesCdnEndpoint)) {
    return fileUrl.replace(`${spacesCdnEndpoint}/`, '')
  }
  // Handle direct Spaces URL
  const prefix = `${spacesEndpoint}/${spacesBucket}/`
  if (fileUrl.startsWith(prefix)) {
    return fileUrl.replace(prefix, '')
  }
  // Handle old /uploads/ style paths (fallback)
  if (fileUrl.startsWith('/uploads/')) {
    return fileUrl.replace(/^\//, '')
  }
  return fileUrl
}
