'use client'

import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

import { Card } from '@/components/ui/card'
import { OnboardingProgress } from './OnboardingProgress'
import { Step1Income } from './Step1Income'
import { Step2Expenses } from './Step2Expenses'
import { Step3Goal } from './Step3Goal'
import { Step4Upload } from './Step4Upload'
import { onboardingSchema, type OnboardingFormData } from './types'
import { useProfile } from '@/context/ProfileContext'

export function OnboardingWizard({ userId }: { userId: string }) {
  const [step, setStep] = useState(1)
  const router = useRouter()
  const { refetchProfile } = useProfile()
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const methods = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema) as any,
    defaultValues: {
      income_type: undefined,
      fixed_expenses: [],
    },
    mode: 'onChange'
  })

  const totalSteps = 4

  const handleNext = async () => {
    let fieldsToValidate: any[] = []
    
    if (step === 1) fieldsToValidate = ['income_type', 'payday', 'estimated_income']
    if (step === 3) fieldsToValidate = ['main_goal']

    const isValid = await methods.trigger(fieldsToValidate)
    if (isValid) {
      setStep((prev) => Math.min(prev + 1, totalSteps))
    }
  }

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1))
  }

  const handleFinish = async (file: File | null) => {
    await methods.handleSubmit(async (data) => {
      try {
        console.log('Submitting onboarding data:', data)

        // 1. Update Profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            income_type: data.income_type,
            payday: data.payday,
            estimated_income: data.estimated_income,
            main_goal: data.main_goal,
            // Assuming the trigger or backend handles 'is_onboarded' or it's inferred from these fields
          })
          .eq('id', userId)

        if (profileError) {
          console.error('Profile update error:', profileError)
          throw new Error(`Erro ao atualizar perfil: ${profileError.message}`)
        }

        // 2. Insert Recurring Transactions
        if (data.fixed_expenses.length > 0) {
          const expensesToInsert = data.fixed_expenses.map(exp => ({
            user_id: userId,
            description: exp.name,
            amount: exp.amount,
            category: 'fixed',
            type: 'expense' as const,
            frequency: 'monthly',
            due_day: data.payday || 1,
            is_active: true
          }))

          const { error: expensesError } = await supabase
            .from('recurring_transactions')
            .insert(expensesToInsert)

          if (expensesError) {
            console.error('Expenses insert error:', expensesError)
            throw new Error(`Erro ao salvar despesas recorrentes: ${expensesError.message}`)
          }
        }

        // 3. Handle File Upload (Placeholder)
        if (file) {
          console.log('File to upload:', file.name)
        }

        // 4. Redirect with Optimistic Update
        console.log('Onboarding complete, updating local state...')
        await refetchProfile()
        console.log('State updated, redirecting...')
        router.push('/dashboard')

      } catch (error: any) {
        console.error('Error saving onboarding data:', error)
        alert(error.message || 'Ocorreu um erro ao salvar seus dados. Tente novamente.')
      }
    })()
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-8">
        <OnboardingProgress currentStep={step} totalSteps={totalSteps} />
      </div>

      <Card className="glass-card border-border/50 bg-card/50 backdrop-blur-xl p-6 min-h-[400px] relative overflow-hidden">
        <FormProvider {...methods}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <Step1Income key="step1" onNext={handleNext} />
            )}
            {step === 2 && (
              <Step2Expenses key="step2" onNext={handleNext} onBack={handleBack} />
            )}
            {step === 3 && (
              <Step3Goal key="step3" onNext={handleNext} onBack={handleBack} />
            )}
            {step === 4 && (
              <Step4Upload key="step4" onFinish={handleFinish} onBack={handleBack} />
            )}
          </AnimatePresence>
        </FormProvider>
      </Card>
      
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-background to-background pointer-events-none" />
    </div>
  )
}
