import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { findUserById, getSafeUser, getProfile } from '@/lib/auth/store'
import { supabase } from '@/lib/db'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DashboardContent } from '@/components/dashboard/DashboardContent'

export default async function DashboardPage() {
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

  // Fetch real data
  const [expensesResult, transactionsResult, insightsResult] = await Promise.all([
    supabase
      .from('recurring_expenses')
      .select('*')
      .eq('user_id', session.userId),
    supabase
      .from('transactions')
      .select('*')
      .eq('user_id', session.userId)
      .order('date', { ascending: false })
      .limit(10),
    supabase
      .from('insights')
      .select('*')
      .eq('user_id', session.userId)
      .eq('is_read', false)
      .limit(5)
  ])

  return (
    <DashboardLayout userEmail={safeUser.email} userName={profile?.full_name}>
      <DashboardContent 
        profile={profile}
        userName={profile?.full_name || safeUser.name || 'Usuário'}
        expenses={expensesResult.data || []}
        transactions={transactionsResult.data || []}
        insights={insightsResult.data || []}
      />
    </DashboardLayout>
  )
}
