import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import path from 'path'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const asset = await prisma.mediaAsset.findUnique({
      where: { id: params.id }
    })

    if (!asset) {
      return NextResponse.json({ error: 'Media asset not found' }, { status: 404 })
    }

    // Delete file from disk
    try {
      const filePath = path.join(process.cwd(), 'public', asset.fileUrl)
      await unlink(filePath)
    } catch (err) {
      console.warn('Could not delete file from disk:', err)
    }

    // Delete from database
    await prisma.mediaAsset.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting media asset:', error)
    return NextResponse.json({ error: 'Failed to delete media asset' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, category } = body

    const asset = await prisma.mediaAsset.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(category !== undefined && { category })
      }
    })

    return NextResponse.json(asset)
  } catch (error) {
    console.error('Error updating media asset:', error)
    return NextResponse.json({ error: 'Failed to update media asset' }, { status: 500 })
  }
}
