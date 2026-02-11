import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Register or update device token for push notifications
export async function POST(
  req: NextRequest,
  { params }: { params: { ambassadorId: string } }
) {
  try {
    const { deviceToken } = await req.json()

    if (!deviceToken) {
      return NextResponse.json(
        { error: 'deviceToken is verplicht' },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { id: params.ambassadorId },
      data: { deviceToken },
      select: { id: true, email: true }
    })

    return NextResponse.json({ success: true, userId: user.id })
  } catch (error) {
    console.error('Error saving device token:', error)
    return NextResponse.json(
      { error: 'Interne serverfout' },
      { status: 500 }
    )
  }
}
