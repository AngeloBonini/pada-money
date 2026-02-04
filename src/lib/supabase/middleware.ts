import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/lib/database.types'

type CookieToSet = {
  name: string
  value: string
  options?: Record<string, unknown>
}

/**
 * Atualiza a sessão do usuário no middleware
 * Isso previne que a sessão expire enquanto o usuário está navegando
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANTE: Evite escrever qualquer lógica entre createServerClient e
  // supabase.auth.getUser(). Uma simples mudança pode causar vazamento de
  // informações de sessão para outros usuários.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Se não há usuário e não está em uma rota pública, redireciona para login
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
                      request.nextUrl.pathname.startsWith('/auth')
  const isPublicRoute = request.nextUrl.pathname === '/'

  if (!user && !isAuthRoute && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Se usuário está logado e tentando acessar login, redireciona para dashboard
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // IMPORTANTE: Você *deve* retornar o objeto supabaseResponse como está.
  // Se você está criando um novo objeto de resposta, certifique-se de:
  // 1. Passar o request nele
  // 2. Copiar os cookies do supabaseResponse
  // 3. Mudar o objeto supabaseResponse para refletir o novo response

  return supabaseResponse
}
