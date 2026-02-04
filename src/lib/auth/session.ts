import { createHmac } from 'crypto'
import { cookies } from 'next/headers'
import type { Session } from './types'

const SESSION_COOKIE_NAME = 'session'
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-change-in-production'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

/**
 * Create a simple signed session token
 * Format: base64(payload).signature
 */
export function createSessionToken(userId: string, email: string): string {
  const session: Session = {
    userId,
    email,
    expiresAt: Date.now() + SESSION_DURATION,
  }
  
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url')
  const signature = createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url')
  
  return `${payload}.${signature}`
}

/**
 * Verify and decode a session token
 */
export function verifySessionToken(token: string): Session | null {
  try {
    const [payload, signature] = token.split('.')
    
    if (!payload || !signature) {
      return null
    }
    
    // Verify signature
    const expectedSignature = createHmac('sha256', SESSION_SECRET)
      .update(payload)
      .digest('base64url')
    
    if (signature !== expectedSignature) {
      return null
    }
    
    // Decode payload
    const session: Session = JSON.parse(
      Buffer.from(payload, 'base64url').toString()
    )
    
    // Check expiration
    if (session.expiresAt < Date.now()) {
      return null
    }
    
    return session
  } catch {
    return null
  }
}

/**
 * Get session from request cookies (for middleware)
 */
export function getSessionFromRequest(request: Request): Session | null {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null
  
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(c => {
      const [key, ...v] = c.split('=')
      return [key, v.join('=')]
    })
  )
  
  const token = cookies[SESSION_COOKIE_NAME]
  if (!token) return null
  
  return verifySessionToken(token)
}

/**
 * Get session from Next.js cookies (for server components)
 */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  
  if (!token) return null
  
  return verifySessionToken(token)
}

/**
 * Set session cookie in response
 */
export function setSessionCookie(token: string): { name: string; value: string; options: Record<string, unknown> } {
  return {
    name: SESSION_COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_DURATION / 1000, // in seconds
    },
  }
}

/**
 * Clear session cookie
 */
export function clearSessionCookie(): { name: string; value: string; options: Record<string, unknown> } {
  return {
    name: SESSION_COOKIE_NAME,
    value: '',
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    },
  }
}
