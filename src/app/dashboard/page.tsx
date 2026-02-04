import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut, Upload, TrendingUp, Sparkles } from 'lucide-react'
import type { Profile } from '@/lib/database.types'

async function signOut() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Buscar perfil do usuário
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  const profile = profileData as Profile | null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">Zero-Input Finance</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {profile?.email || user.email}
            </span>
            <form action={signOut}>
              <Button variant="ghost" size="sm" className="gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">
              Olá, {profile?.full_name || 'Usuário'}! 👋
            </h1>
            <p className="text-muted-foreground">
              Bem-vindo ao seu painel financeiro inteligente.
            </p>
          </div>

          {/* Status Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardDescription>Status</CardDescription>
                <CardTitle className="text-lg capitalize">
                  {profile?.subscription_status === 'active' ? '✨ Premium' : '🆓 Gratuito'}
                </CardTitle>
              </CardHeader>
            </Card>
            
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardDescription>Transações</CardDescription>
                <CardTitle className="text-lg">0</CardTitle>
              </CardHeader>
            </Card>
            
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardDescription>Insights</CardDescription>
                <CardTitle className="text-lg">0</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Empty State - Call to Action */}
          <Card className="border-dashed border-2 border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center mb-6">
                <Upload className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Comece importando seus extratos
              </h3>
              <p className="text-muted-foreground max-w-md mb-6">
                Faça upload dos seus extratos bancários em PDF e deixe nossa IA 
                categorizar suas transações automaticamente.
              </p>
              <Button className="gap-2" disabled>
                <Upload className="w-4 h-4" />
                Upload de Extrato (Em breve - Fase 2)
              </Button>
            </CardContent>
          </Card>

          {/* Info Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Fase 2: Upload</CardTitle>
                    <CardDescription>Em desenvolvimento</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Upload de extratos PDF com processamento por IA para 
                  categorização automática de transações.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Fase 3: Insights</CardTitle>
                    <CardDescription>Em desenvolvimento</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Dashboard com gráficos, análises e insights personalizados 
                  gerados pela IA sobre seus hábitos financeiros.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
