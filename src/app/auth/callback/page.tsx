'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-400" />
        <p className="text-muted-foreground">Autenticando...</p>
      </div>
    </div>
  )
}

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuth = async () => {
      const supabase = createClient()
      
      // Verifica se há erro nos query params
      const errorParam = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')
      
      if (errorParam) {
        setError(errorDescription || errorParam)
        return
      }

      // Tenta obter a sessão - o Supabase client processa automaticamente
      // tanto o code PKCE quanto os tokens no hash
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        setError(sessionError.message)
        return
      }

      if (session) {
        router.replace('/dashboard')
        return
      }

      // Se não tem sessão ainda, aguarda e tenta novamente
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const { data: { session: retrySession } } = await supabase.auth.getSession()
      
      if (retrySession) {
        router.replace('/dashboard')
        return
      }

      setError('Não foi possível completar o login. Por favor, tente novamente.')
    }

    handleAuth()
  }, [router, searchParams])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="text-xl font-semibold">Erro na autenticação</h1>
          <p className="text-red-400 text-sm">{error}</p>
          <a 
            href="/login" 
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Voltar para o login
          </a>
        </div>
      </div>
    )
  }

  return <LoadingSpinner />
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AuthCallbackContent />
    </Suspense>
  )
}
