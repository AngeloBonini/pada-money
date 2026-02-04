'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Loader2, Sparkles, Chrome, Lock, Eye, EyeOff } from 'lucide-react'

type AuthMode = 'login' | 'signup' | 'magic-link' | 'forgot-password'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [isLoading, setIsLoading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const supabase = createClient()

  const handleEmailPasswordAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage(null)

    console.log('[CLIENT] Form submitted, authMode:', authMode)

    if (authMode === 'signup') {
      // Signup
      if (password.length < 6) {
        setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres.' })
        return
      }

      if (password !== confirmPassword) {
        setMessage({ type: 'error', text: 'As senhas não coincidem.' })
        return
      }

      startTransition(async () => {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) {
          setMessage({ type: 'error', text: error.message })
        } else {
          setMessage({
            type: 'success',
            text: 'Conta criada! Verifique seu email para confirmar o cadastro.',
          })
          setEmail('')
          setPassword('')
          setConfirmPassword('')
        }
      })
    } else {
      // Login - handle client-side for proper cookie handling
      console.log('[CLIENT] Attempting login...')
      setIsLoading(true)

      const loginAsync = async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          console.log('[CLIENT] Login failed:', error.message)
          setIsLoading(false)
          if (error.message.includes('Invalid login credentials')) {
            setMessage({ type: 'error', text: 'Email ou senha incorretos.' })
          } else {
            setMessage({ type: 'error', text: error.message })
          }
        } else {
          console.log('[CLIENT] Login successful!')
          console.log('[CLIENT] Session:', data.session ? 'EXISTS' : 'NULL')
          console.log('[CLIENT] User:', data.user?.id)

          // Check cookies
          console.log('[CLIENT] All cookies:', document.cookie)

          // Wait a moment for cookies to be written
          await new Promise(resolve => setTimeout(resolve, 500))

          console.log('[CLIENT] Cookies after wait:', document.cookie)
          console.log('[CLIENT] Now redirecting...')

          // Force a full page reload
          window.location.href = '/dashboard'
        }
      }

      loginAsync()
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    startTransition(async () => {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: true,
        },
      })

      if (error) {
        if (error.message.includes('rate limit')) {
          setMessage({ type: 'error', text: 'Muitas tentativas. Aguarde alguns minutos.' })
        } else {
          setMessage({ type: 'error', text: error.message })
        }
      } else {
        setMessage({
          type: 'success',
          text: 'Link mágico enviado! Verifique seu email para fazer login.',
        })
        setEmail('')
      }
    })
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setIsGoogleLoading(false)
      setMessage({ type: 'error', text: error.message })
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    startTransition(async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({
          type: 'success',
          text: 'Link de recuperação enviado! Verifique seu email para redefinir sua senha.',
        })
        setEmail('')
      }
    })
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setMessage(null)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Efeito de gradiente decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md space-y-8 animate-fade-in relative z-10">
        {/* Logo e Título */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Zero-Input Finance
          </h1>
          <p className="text-muted-foreground">
            Suas finanças organizadas automaticamente pela IA
          </p>
        </div>

        {/* Card de Login */}
        <Card className="border-border/50 backdrop-blur-sm bg-card/80">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center">
              {authMode === 'signup'
                ? 'Criar conta'
                : authMode === 'forgot-password'
                ? 'Recuperar senha'
                : 'Bem-vindo de volta'}
            </CardTitle>
            <CardDescription className="text-center">
              {authMode === 'signup'
                ? 'Preencha os dados para criar sua conta'
                : authMode === 'magic-link'
                ? 'Receba um link de acesso no seu email'
                : authMode === 'forgot-password'
                ? 'Digite seu email para receber o link de recuperação'
                : 'Entre com seu email e senha'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google Login - Ocultar em forgot-password */}
            {authMode !== 'forgot-password' && (
              <>
                <Button
                  variant="outline"
                  className="w-full h-11 gap-2"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading || isPending || isLoading}
                >
                  {isGoogleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Chrome className="w-4 h-4" />
                  )}
                  Continuar com Google
                </Button>

                {/* Divisor */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      ou continue com email
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Form */}
            <form onSubmit={
              authMode === 'magic-link'
                ? handleMagicLink
                : authMode === 'forgot-password'
                ? handleForgotPassword
                : handleEmailPasswordAuth
            } className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isPending || isGoogleLoading}
                  className="h-11"
                />
              </div>

              {authMode !== 'magic-link' && authMode !== 'forgot-password' && (
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isPending || isGoogleLoading}
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {authMode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar senha</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isPending || isGoogleLoading}
                    className="h-11"
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 gap-2"
                disabled={isPending || isGoogleLoading || isLoading || !email || (authMode !== 'magic-link' && authMode !== 'forgot-password' && !password)}
              >
                {(isPending || isLoading) ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : authMode === 'magic-link' || authMode === 'forgot-password' ? (
                  <Mail className="w-4 h-4" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                {authMode === 'signup'
                  ? 'Criar conta'
                  : authMode === 'magic-link'
                  ? 'Enviar link mágico'
                  : authMode === 'forgot-password'
                  ? 'Enviar link de recuperação'
                  : 'Entrar'}
              </Button>
            </form>

            {/* Mensagens de Feedback */}
            {message && (
              <div
                className={`p-3 rounded-lg text-sm text-center ${
                  message.type === 'success'
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Toggle entre modos */}
            <div className="space-y-2 pt-2">
              {authMode === 'login' && (
                <>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('forgot-password'); resetForm() }}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Esqueceu sua senha? <span className="text-blue-400 underline">Recuperar agora</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('magic-link'); resetForm() }}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Prefere login sem senha? <span className="text-blue-400 underline">Usar link mágico</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('signup'); resetForm() }}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Não tem uma conta? <span className="text-blue-400 underline">Criar agora</span>
                  </button>
                </>
              )}
              {authMode === 'signup' && (
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); resetForm() }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Já tem uma conta? <span className="text-blue-400 underline">Fazer login</span>
                </button>
              )}
              {authMode === 'magic-link' && (
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); resetForm() }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Prefere usar senha? <span className="text-blue-400 underline">Voltar ao login</span>
                </button>
              )}
              {authMode === 'forgot-password' && (
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); resetForm() }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Lembrou sua senha? <span className="text-blue-400 underline">Voltar ao login</span>
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Ao continuar, você concorda com nossos{' '}
          <a href="#" className="underline hover:text-foreground transition-colors">
            Termos de Serviço
          </a>{' '}
          e{' '}
          <a href="#" className="underline hover:text-foreground transition-colors">
            Política de Privacidade
          </a>
        </p>
      </div>
    </div>
  )
}
