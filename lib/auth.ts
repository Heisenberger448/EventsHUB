import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('🔐 Login attempt:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials');
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { organization: true }
        })

        if (!user) {
          console.log('❌ User not found:', credentials.email);
          return null
        }

        console.log('✅ User found:', user.email, 'role:', user.role);

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        console.log('🔑 Password valid:', isPasswordValid);

        if (!isPasswordValid) {
          return null
        }

        console.log('✅ Login successful for:', user.email);
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
          organizationSlug: user.organization?.slug
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.organizationId = user.organizationId
        token.organizationSlug = user.organizationSlug
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.organizationId = token.organizationId as string | null
        session.user.organizationSlug = token.organizationSlug as string | undefined
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
