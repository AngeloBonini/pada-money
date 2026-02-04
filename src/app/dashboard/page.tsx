import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { FinancialProvider } from '@/context/FinancialContext'
import { DashboardSummary } from '@/components/features/financial/DashboardSummary'
import { RecurringList } from '@/components/features/financial/RecurringList'
import { TransactionForm } from '@/components/features/financial/TransactionForm'
import { DailyLedger } from '@/components/features/financial/DailyLedger'
import { MigrationDebug } from '@/components/debug/MigrationDebug'

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  // Check if profile is complete (Onboarding check)
  const { data: profile } = await supabase
    .from('profiles')
    .select('income_type, main_goal, full_name')
    .eq('id', session.user.id)
    .single()

  // DEBUGGING: Log profile state
  console.log('Dashboard Profile Check:', profile)

  if (!profile?.income_type || !profile?.main_goal) {
    // Temporary Debug View instead of Redirect
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-lg max-w-md space-y-4">
          <h2 className="text-xl font-bold text-red-500">Debug: Perfil Incompleto</h2>
          <pre className="bg-black/20 p-4 rounded text-xs font-mono overflow-auto">
            {JSON.stringify(profile, null, 2)}
          </pre>
          <p className="text-sm text-muted-foreground">
            O sistema detectou campos faltando. Por favor, verifique o console ou contate o suporte.
          </p>
          <a href="/onboarding" className="block text-center bg-primary text-primary-foreground py-2 rounded hover:opacity-90">
            Voltar para Onboarding
          </a>
        </div>
      </div>
    )
    // redirect('/onboarding')
  }

  return (
    <FinancialProvider>
      <main className="container max-w-6xl mx-auto p-4 space-y-8 pb-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Olá, {profile.full_name?.split(' ')[0] || 'Investidor'}
            </h1>
            <p className="text-muted-foreground">
              Visão geral do seu fluxo de caixa.
            </p>
          </div>
        </header>

        {/* Financial Summary Cards */}
        <MigrationDebug />
        <DashboardSummary />

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Content: 2/3 width */}
          <div className="md:col-span-2 space-y-6">
            <DailyLedger />
          </div>

          {/* Sidebar: 1/3 width */}
          <div className="space-y-6">
            <RecurringList />
            <TransactionForm />
          </div>
        </div>
      </main>
    </FinancialProvider>
  )
}
