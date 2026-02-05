import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendWelcomeEmail } from '@/lib/email'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'PLATFORM_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const {
      organisationName,
      kvkNumber,
      companyAddress,
      firstName,
      lastName,
      phoneNumber,
      mailAddress,
      welcomeMessage
    } = data

    // Validate required fields
    if (!organisationName || !kvkNumber || !companyAddress || !firstName || !lastName || !phoneNumber || !mailAddress || !welcomeMessage) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Generate slug from organisation name
    const slug = organisationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Check if slug already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { slug }
    })

    if (existingOrg) {
      return NextResponse.json({ error: 'An organization with this name already exists' }, { status: 400 })
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: mailAddress }
    })

    let organization

    if (existingUser) {
      // User exists - create organization and link existing user to it
      organization = await prisma.organization.create({
        data: {
          name: organisationName,
          slug,
          kvkNumber,
          companyAddress,
        }
      })

      // Update existing user with new organization and admin role
      await prisma.user.update({
        where: { email: mailAddress },
        data: {
          organizationId: organization.id,
          role: 'ORG_ADMIN',
          firstName,
          lastName,
          phoneNumber,
          resetToken,
          resetTokenExpiry
        }
      })
    } else {
      // User doesn't exist - create organization with new user
      organization = await prisma.organization.create({
        data: {
          name: organisationName,
          slug,
          kvkNumber,
          companyAddress,
          users: {
            create: {
              email: mailAddress,
              passwordHash: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10), // Temporary password
              role: 'ORG_ADMIN',
              firstName,
              lastName,
              phoneNumber,
              resetToken,
              resetTokenExpiry
            }
          }
        }
      })
    }

    // Fetch organization with users for response
    const organizationWithUsers = await prisma.organization.findUnique({
      where: { id: organization.id },
      include: { users: true }
    })

    // Send welcome email with password setup link
    const passwordSetupUrl = `${process.env.NEXTAUTH_URL}/setup-password?token=${resetToken}`
    
    try {
      await sendWelcomeEmail({
        to: mailAddress,
        firstName,
        welcomeMessage,
        passwordSetupUrl
      })
      
      console.log('✅ Welcome email sent to:', mailAddress)
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      organization: organizationWithUsers,
      passwordSetupUrl // Return for testing purposes
    })
  } catch (error) {
    console.error('Create organization API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
