import { NextResponse } from 'next/server'
import { clearSessionCookie } from '@/lib/auth/session'

export async function POST() {
  const cookie = clearSessionCookie()

  // Redirect to login after logout
  const response = NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
  response.cookies.set(cookie.name, cookie.value, cookie.options as Parameters<typeof response.cookies.set>[2])

  return response
}
