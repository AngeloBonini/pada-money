import { NextResponse, type NextRequest } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth/session'

/**
 * Middleware for session-based auth
 * Redirects unauthenticated users to login
 */
export async function middleware(request: NextRequest) {
  const session = getSessionFromRequest(request)

  // Public routes that don't require auth
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
                      request.nextUrl.pathname.startsWith('/api/auth')
  const isPublicRoute = request.nextUrl.pathname === '/'

  // If not authenticated and trying to access protected route
  if (!session && !isAuthRoute && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If authenticated and trying to access login page
  if (session && request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
