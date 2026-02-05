import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { findUserById, getSafeUser, getProfile } from '@/lib/auth/store'
import { supabase } from '@/lib/db'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProfileForm } from '@/components/profile/ProfileForm'

export default async function ProfilePage() {
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

  // Fetch recurring expenses
  const { data: expenses } = await supabase
    .from('recurring_expenses')
    .select('*')
    .eq('user_id', session.userId)
    .order('created_at', { ascending: false })

  return (
    <DashboardLayout userEmail={safeUser.email} userName={profile?.full_name}>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Meu Perfil</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações financeiras e preferências.
          </p>
        </div>

        <ProfileForm 
          profile={profile} 
          expenses={expenses || []} 
          userEmail={safeUser.email}
        />
      </div>
    </DashboardLayout>
  )
}
