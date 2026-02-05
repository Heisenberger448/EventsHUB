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
      return NextResponse.next()
    }

    // Organization admin routes - direct org slug paths
    const pathSegments = path.split('/').filter(Boolean)
    if (pathSegments.length > 0) {
      const orgSlug = pathSegments[0]
      
      // Verify this is an org admin route by checking if it matches org pattern
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
  matcher: [
    '/admin/:path*',
    // Match org slugs but exclude public routes
    '/((?!api|login|e|_next|static|favicon.ico|$).*)'
  ]
}
