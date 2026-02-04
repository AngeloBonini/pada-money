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

function AuthConfirmContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuth = async () => {
      const supabase = createClient()
      
      // Verifica se já existe uma sessão
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

      // Se não tem sessão, tenta pegar dos search params
      const accessToken = searchParams.get('access_token')
      const refreshToken = searchParams.get('refresh_token')

      if (accessToken && refreshToken) {
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (setSessionError) {
          console.error('Set session error:', setSessionError)
          setError(setSessionError.message)
          return
        }

        router.replace('/dashboard')
        return
      }

      setError('Não foi possível completar o login. Tente novamente.')
    }

    handleAuth()
  }, [router, searchParams])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="text-center space-y-4">
          <p className="text-red-400">{error}</p>
          <a href="/login" className="text-blue-400 hover:underline">
            Voltar para o login
          </a>
        </div>
      </div>
    )
  }

  return <LoadingSpinner />
}

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AuthConfirmContent />
    </Suspense>
  )
}
