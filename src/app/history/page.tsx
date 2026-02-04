import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { findUserById, getSafeUser, getProfile } from '@/lib/auth/store'
import { supabase } from '@/lib/db'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { HistoryView } from '@/components/history/HistoryView'

export default async function HistoryPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const user = await findUserById(session.userId)
  
  if (!user) {
    redirect('/login')
  }

  const safeUser = getSafeUser(user)
  const profile = await getProfile(session.userId)

  // Redirect to onboarding if profile is incomplete
  if (!profile?.income_type || !profile?.main_goal) {
    redirect('/onboarding')
  }

  // Fetch transactions for history
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', session.userId)
    .order('date', { ascending: false })
    .limit(100)

  // Fetch recurring expenses
  const { data: expenses } = await supabase
    .from('recurring_expenses')
    .select('*')
    .eq('user_id', session.userId)

  return (
    <DashboardLayout userEmail={safeUser.email} userName={profile?.full_name}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Histórico Financeiro</h1>
          <p className="text-muted-foreground">
            Acompanhe a evolução das suas finanças ao longo do tempo.
          </p>
        </div>

        <HistoryView 
          profile={profile}
          transactions={transactions || []} 
          expenses={expenses || []}
        />
      </div>
    </DashboardLayout>
  )
}
