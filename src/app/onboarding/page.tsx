import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

export default async function OnboardingPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen bg-background flex flex-col justify-center py-10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Bem-vindo ao <span className="gradient-text">Zero-Input Finance</span>
          </h1>
          <p className="text-muted-foreground">
            Vamos configurar seu perfil em menos de 1 minuto.
          </p>
        </div>
        
        <OnboardingWizard userId={session.userId} />
      </div>
    </main>
  )
}
