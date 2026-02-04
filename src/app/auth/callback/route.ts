import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Route Handler para processar callback de autenticação
 * Usado por Magic Link e OAuth (Google)
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Redireciona para a página desejada após login bem-sucedido
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Redireciona para página de erro em caso de falha
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
