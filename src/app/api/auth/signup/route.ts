import { NextResponse } from 'next/server'
import { createUser, userExists } from '@/lib/auth/store'
import { hashPassword } from '@/lib/auth/password'
import { createSessionToken, setSessionCookie } from '@/lib/auth/session'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Check if user already exists (now async)
    if (await userExists(email)) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 409 }
      )
    }

    // Hash password and create user (now async)
    const passwordHash = await hashPassword(password)
    const user = await createUser(email, passwordHash, name)

    // Create session and log user in automatically
    const token = createSessionToken(user.id, user.email)
    const cookie = setSessionCookie(token)

    const response = NextResponse.json({
      success: true,
      user,
    })

    response.cookies.set(cookie.name, cookie.value, cookie.options as Parameters<typeof response.cookies.set>[2])

    return response
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
