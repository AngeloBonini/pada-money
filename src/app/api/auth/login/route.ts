import { NextResponse } from 'next/server'
import { findUserByEmail, getSafeUser } from '@/lib/auth/store'
import { verifyPassword } from '@/lib/auth/password'
import { createSessionToken, setSessionCookie } from '@/lib/auth/session'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    console.log('[LOGIN] Attempting login for:', email)

    // Find user (now async)
    const user = await findUserByEmail(email)
    console.log('[LOGIN] User found:', user ? 'YES' : 'NO')
    
    if (!user) {
      console.log('[LOGIN] User not found for email:', email)
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      console.log('[LOGIN] Invalid password for:', email)
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    // Create session
    const token = createSessionToken(user.id, user.email)
    const cookie = setSessionCookie(token)

    console.log('[LOGIN] Login successful for:', email)

    // Return response with cookie
    const response = NextResponse.json({
      success: true,
      user: getSafeUser(user),
    })

    response.cookies.set(cookie.name, cookie.value, cookie.options as Parameters<typeof response.cookies.set>[2])

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
