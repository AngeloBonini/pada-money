import { useFormContext } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { OnboardingFormData } from './types'
import { ArrowRight, Calendar, DollarSign, Wallet } from 'lucide-react'

export function Step1Income({ onNext }: { onNext: () => void }) {
  const { register, formState: { errors }, watch } = useFormContext<OnboardingFormData>()
  
  // Basic masking for currency display could be added here
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <CardHeader className="px-0">
        <CardTitle className="text-2xl">Vamos falar de dinheiro</CardTitle>
        <CardDescription>
          Para a IA organizar suas finanças, ela precisa entender seu fluxo de caixa.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0 space-y-6">
        {/* Income Type */}
        <div className="space-y-2">
          <Label>Como você recebe seu dinheiro?</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { value: 'salary', label: 'Salário Fixo', icon: Wallet },
              { value: 'freelance', label: 'Freelancer', icon: SparklesIcon }, // Fallback to generic if simplified
              { value: 'mixed', label: 'Misto', icon: DollarSign },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-white/5
                  ${watch('income_type') === option.value 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-border/50 bg-card/50'
                  }
                `}
              >
                <input
                  type="radio"
                  value={option.value}
                  className="sr-only"
                  {...register('income_type')}
                />
                <option.icon className={`w-6 h-6 mb-2 ${watch('income_type') === option.value ? 'text-blue-400' : 'text-muted-foreground'}`} />
                <span className="text-sm font-medium">{option.label}</span>
              </label>
            ))}
          </div>
          {errors.income_type && (
            <p className="text-sm text-red-400">{errors.income_type.message}</p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Payday */}
          <div className="space-y-2">
            <Label htmlFor="payday">Dia do Recebimento (aprox.)</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="payday"
                type="number"
                placeholder="Ex: 05"
                min={1}
                max={31}
                className="pl-10"
                {...register('payday')}
              />
            </div>
            {errors.payday && (
              <p className="text-sm text-red-400">{errors.payday.message}</p>
            )}
          </div>

          {/* Estimated Income */}
          <div className="space-y-2">
            <Label htmlFor="estimated_income">Renda Mensal Média</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground font-semibold">R$</span>
              <Input
                id="estimated_income"
                type="text"
                placeholder="0,00"
                className="pl-10"
                {...register('estimated_income')}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Não precisa ser exato. Você pode ajustar depois.
            </p>
            {errors.estimated_income && (
              <p className="text-sm text-red-400">{errors.estimated_income.message}</p>
            )}
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button onClick={onNext} className="w-full md:w-auto gap-2 group">
            Próximo Passo
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </motion.div>
  )
}

// Icon helper
function SparklesIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  )
}
