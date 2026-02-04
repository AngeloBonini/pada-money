import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { getProfile } from '@/lib/auth/store'
import { supabase } from '@/lib/db'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

export default async function OnboardingPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  // Load existing profile and expenses data for editing
  const profile = await getProfile(session.userId)
  
  const { data: expenses } = await supabase
    .from('recurring_expenses')
    .select('*')
    .eq('user_id', session.userId)

  // Transform expenses to match form format
  const existingExpenses = (expenses || []).map(e => ({
    id: e.id,
    name: e.name,
    amount: e.amount,
    category: e.category || 'fixed',
  }))

  const initialData = profile ? {
    income_type: profile.income_type || undefined,
    payday: profile.payday || undefined,
    estimated_income: profile.estimated_income || undefined,
    main_goal: profile.main_goal || undefined,
    fixed_expenses: existingExpenses,
  } : undefined

  return (
    <main className="min-h-screen bg-background flex flex-col justify-center py-10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Bem-vindo ao <span className="gradient-text">Zero-Input Finance</span>
          </h1>
          <p className="text-muted-foreground">
            {initialData?.income_type 
              ? 'Revise e atualize suas informações.' 
              : 'Vamos configurar seu perfil em menos de 1 minuto.'}
          </p>
        </div>
        
        <OnboardingWizard 
          userId={session.userId} 
          initialData={initialData}
          hasExistingData={!!initialData?.income_type}
        />
      </div>
    </main>
  )
}
