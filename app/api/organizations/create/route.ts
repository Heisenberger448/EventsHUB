import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: mailAddress }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 })
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create organization with contact person
    const organization = await prisma.organization.create({
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
      },
      include: {
        users: true
      }
    })

    // Send welcome email with password setup link
    const passwordSetupUrl = `${process.env.NEXTAUTH_URL}/setup-password?token=${resetToken}`
    
    try {
      // TODO: Integrate with your email service (SendGrid, Resend, etc.)
      // For now, we'll just log it
      console.log('=== WELCOME EMAIL ===')
      console.log('To:', mailAddress)
      console.log('Subject: Welcome to the Platform!')
      console.log('Message:', welcomeMessage)
      console.log('Password Setup URL:', passwordSetupUrl)
      console.log('====================')

      // If you have an email service, call it here:
      // await sendEmail({
      //   to: mailAddress,
      //   subject: 'Welcome to the Platform!',
      //   html: `
      //     <h1>Welcome ${firstName}!</h1>
      //     <p>${welcomeMessage}</p>
      //     <p>Click the link below to set up your password:</p>
      //     <a href="${passwordSetupUrl}">Set Up Password</a>
      //     <p>This link will expire in 24 hours.</p>
      //   `
      // })
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      organization,
      passwordSetupUrl // Return for testing purposes
    })
  } catch (error) {
    console.error('Create organization API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
