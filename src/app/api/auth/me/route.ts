import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { findUserById, getSafeUser } from '@/lib/auth/store'

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Now async
    const user = await findUserById(session.userId)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: getSafeUser(user),
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
