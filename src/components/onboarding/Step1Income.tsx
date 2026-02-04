import { useFormContext } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { OnboardingFormData } from './types'
import { ArrowRight, Calendar as CalendarIcon, DollarSign, Wallet, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ptBR } from 'date-fns/locale'

export function Step1Income({ onNext }: { onNext: () => void }) {
  const { register, formState: { errors }, watch, setValue } = useFormContext<OnboardingFormData>()
  
  const payday = watch('payday')
  // Construct a date object for the calendar if payday exists (assuming current month for display)
  const dateValue = payday ? new Date(new Date().getFullYear(), new Date().getMonth(), payday) : undefined

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setValue('payday', date.getDate(), { shouldValidate: true })
    }
  }

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
              { value: 'freelance', label: 'Freelancer', icon: Sparkles },
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
          {/* Payday - DatePicker */}
          <div className="space-y-2 flex flex-col">
            <Label>Dia do Recebimento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !payday && "text-muted-foreground"
                  )}
                >
                  {/* Keep hidden input for validation registration if needed, or rely on setValue */}
                  <input type="hidden" {...register('payday')} />
                  
                  {payday ? (
                    <span>Dia {payday}</span>
                  ) : (
                    <span>Selecione o dia</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateValue}
                  onSelect={handleDateSelect}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              Selecione uma data aproximada. Usaremos apenas o dia.
            </p>
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
                type="number"
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
