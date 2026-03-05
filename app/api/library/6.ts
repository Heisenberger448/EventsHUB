import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadToSpaces } from '@/lib/spaces'
import { randomUUID } from 'crypto'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const orgSlug = searchParams.get('orgSlug')
    const type = searchParams.get('type') // IMAGE or VIDEO
    const search = searchParams.get('search')
    const category = searchParams.get('category')

    if (!orgSlug) {
      return NextResponse.json({ error: 'Organization slug is required' }, { status: 400 })
    }

    const organization = await prisma.organization.findUnique({
      where: { slug: orgSlug }
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const where: any = {
      organizationId: organization.id,
    }

    if (type) {
      where.type = type
    }

    if (category) {
      where.category = category
    }

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      }
    }

    const assets = await prisma.mediaAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(assets)
  } catch (error) {
    console.error('Error fetching media assets:', error)
    return NextResponse.json({ error: 'Failed to fetch media assets' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const orgSlug = formData.get('orgSlug') as string | null
    const name = formData.get('name') as string | null
    const category = formData.get('category') as string | null

    if (!file || !orgSlug) {
      return NextResponse.json({ error: 'File and organization slug are required' }, { status: 400 })
    }

    const organization = await prisma.organization.findUnique({
      where: { slug: orgSlug }
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Determine media type from MIME type
    const mimeType = file.type
    let mediaType: 'IMAGE' | 'VIDEO'
    if (mimeType.startsWith('image/')) {
      mediaType = 'IMAGE'
    } else if (mimeType.startsWith('video/')) {
      mediaType = 'VIDEO'
    } else {
      return NextResponse.json({ error: 'Only images and videos are supported' }, { status: 400 })
    }

    // Generate unique filename and upload to DO Spaces
    const ext = path.extname(file.name)
    const uniqueName = `${randomUUID()}${ext}`
    const spacesKey = `library/${organization.id}/${uniqueName}`

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fileUrl = await uploadToSpaces(buffer, spacesKey, mimeType)
    const asset = await prisma.mediaAsset.create({
      data: {
        organizationId: organization.id,
        name: name || file.name,
        fileName: file.name,
        fileUrl,
        fileSize: file.size,
        mimeType,
        type: mediaType,
        category: category || 'general'
      }
    })

    return NextResponse.json(asset, { status: 201 })
  } catch (error) {
    console.error('Error uploading media:', error)
    return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 })
  }
}
