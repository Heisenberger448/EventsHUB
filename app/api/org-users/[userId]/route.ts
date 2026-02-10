import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// DELETE — remove an org user
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId || session.user.role !== 'ORG_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Cannot delete yourself
    if (params.userId === session.user.id) {
      return NextResponse.json({ error: 'Je kunt jezelf niet verwijderen' }, { status: 400 })
    }

    // Verify user belongs to same organization
    const user = await prisma.user.findFirst({
      where: {
        id: params.userId,
        organizationId: session.user.organizationId,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 })
    }

    await prisma.user.delete({ where: { id: params.userId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting org user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
