import { z } from 'zod'

export const onboardingSchema = z.object({
  // Step 1: Income
  income_type: z.enum(['salary', 'freelance', 'mixed'], {
    required_error: 'Selecione como você recebe seu dinheiro',
  }),
  payday: z.coerce.number().min(1, 'Dia inválido').max(31, 'Dia inválido'),
  estimated_income: z.string().min(1, 'Informe sua renda aproximada').transform((val) => {
    // Basic currency parsing (removes R$ and dots, keeps comma as decimal)
    const clean = val.replace(/[^\d,]/g, '').replace(',', '.')
    return parseFloat(clean)
  }).or(z.number()), // Allow number input directly too if needed

  // Step 2: Fixed Expenses
  fixed_expenses: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1, 'Nome é obrigatório'),
      amount: z.number().min(0, 'Valor deve ser positivo'),
      category: z.string().optional(),
    })
  ).default([]),

  // Step 3: Main Goal
  main_goal: z.string({
    required_error: 'Selecione seu foco principal',
  }),
})

export type OnboardingFormData = z.infer<typeof onboardingSchema>

export type StepProps = {
  form: any // Typed in usage
  onNext: () => void
  onBack?: () => void
}
