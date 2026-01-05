import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Platform admin routes
    if (path.startsWith('/admin')) {
      if (token?.role !== 'PLATFORM_ADMIN') {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    // Organization admin routes
    if (path.startsWith('/org/')) {
      const orgSlug = path.split('/')[2]
      if (!['ORG_ADMIN', 'ORG_USER'].includes(token?.role as string)) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
      if (token?.organizationSlug !== orgSlug) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: ['/admin/:path*', '/org/:path*']
}
