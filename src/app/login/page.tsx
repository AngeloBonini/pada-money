'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Sparkles, Lock, Eye, EyeOff } from 'lucide-react'

type AuthMode = 'login' | 'signup'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage(null)
    setIsLoading(true)

    try {
      if (authMode === 'signup') {
        // Validation
        if (password.length < 6) {
          setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres.' })
          setIsLoading(false)
          return
        }

        if (password !== confirmPassword) {
          setMessage({ type: 'error', text: 'As senhas não coincidem.' })
          setIsLoading(false)
          return
        }

        // Signup request
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        })

        const data = await res.json()

        if (!res.ok) {
          setMessage({ type: 'error', text: data.error || 'Erro ao criar conta' })
          setIsLoading(false)
          return
        }

        // Redirect to dashboard
        window.location.href = '/dashboard'
      } else {
        // Login request
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })

        const data = await res.json()

        if (!res.ok) {
          setMessage({ type: 'error', text: data.error || 'Erro ao fazer login' })
          setIsLoading(false)
          return
        }

        // Redirect to dashboard
        window.location.href = '/dashboard'
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro de conexão. Tente novamente.' })
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setName('')
    setMessage(null)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Background decorative gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md space-y-8 animate-fade-in relative z-10">
        {/* Logo and Title */}
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

        {/* Login Card */}
        <Card className="border-border/50 backdrop-blur-sm bg-card/80">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center">
              {authMode === 'signup' ? 'Criar conta' : 'Bem-vindo de volta'}
            </CardTitle>
            <CardDescription className="text-center">
              {authMode === 'signup'
                ? 'Preencha os dados para criar sua conta'
                : 'Entre com seu email e senha'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="name">Nome (opcional)</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>
              )}

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
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

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
                    disabled={isLoading}
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
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 gap-2"
                disabled={isLoading || !email || !password}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                {authMode === 'signup' ? 'Criar conta' : 'Entrar'}
              </Button>
            </form>

            {/* Feedback Messages */}
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

            {/* Toggle between modes */}
            <div className="space-y-2 pt-2">
              {authMode === 'login' && (
                <button
                  type="button"
                  onClick={() => { setAuthMode('signup'); resetForm() }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Não tem uma conta? <span className="text-blue-400 underline">Criar agora</span>
                </button>
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
