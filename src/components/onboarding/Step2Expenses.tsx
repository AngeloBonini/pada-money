import { useFormContext, useFieldArray } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { OnboardingFormData } from './types'
import { ArrowRight, ArrowLeft, Plus, Trash2, Zap, Wifi, Home, Smartphone, Dumbbell, PlayCircle } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

const SUGGESTIONS = [
  { name: 'Aluguel/Condomínio', icon: Home, amount: 0 },
  { name: 'Energia', icon: Zap, amount: 0 },
  { name: 'Internet', icon: Wifi, amount: 0 },
  { name: 'Celular', icon: Smartphone, amount: 0 },
  { name: 'Academia', icon: Dumbbell, amount: 0 },
  { name: 'Streaming', icon: PlayCircle, amount: 0 },
]

export function Step2Expenses({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const { register, control, watch, formState: { errors } } = useFormContext<OnboardingFormData>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'fixed_expenses',
  })

  // Calculations for live summary
  const estimatedIncome = watch('estimated_income') || 0
  const totalFixed = watch('fixed_expenses').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
  const remaining = estimatedIncome - totalFixed

  const addExpense = (name: string = '', amount: number = 0) => {
    append({ id: uuidv4(), name, amount, category: 'fixed' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <CardHeader className="px-0">
        <CardTitle className="text-2xl">Custos Fixos</CardTitle>
        <CardDescription>
          O que você paga todo mês, faça chuva ou faça sol.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0 space-y-8">
        {/* Live Summary Card */}
        <Card className={`border-l-4 ${remaining >= 0 ? 'border-l-green-500' : 'border-l-red-500'} bg-card/50`}>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Sobra Mensal Estimada</p>
              <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                R$ {remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p>Renda: R$ {estimatedIncome.toLocaleString('pt-BR')}</p>
              <p>Fixos: - R$ {totalFixed.toLocaleString('pt-BR')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Suggestions */}
        <div className="space-y-3">
          <Label>Sugestões Rápidas (Toque para adicionar)</Label>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((sug) => (
              <Button
                key={sug.name}
                variant="outline"
                size="sm"
                className="gap-2 border-dashed border-border hover:border-blue-500 hover:text-blue-500"
                onClick={() => addExpense(sug.name)}
                type="button"
              >
                <sug.icon className="w-3 h-3" />
                {sug.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Dynamic List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Seus Custos Fixos</Label>
            <Button variant="ghost" size="sm" onClick={() => addExpense()} type="button" className="text-blue-500 hover:text-blue-600 hover:bg-blue-500/10">
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Outro
            </Button>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {fields.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-3 items-start"
                >
                  <div className="flex-1">
                    <Input
                      placeholder="Nome (ex: Financiamento)"
                      {...register(`fixed_expenses.${index}.name` as const)}
                      className={errors.fixed_expenses?.[index]?.name ? 'border-red-500' : ''}
                    />
                  </div>
                  <div className="w-32">
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground text-xs">R$</span>
                      <Input
                        type="number"
                        placeholder="0,00"
                        className={`pl-8 ${errors.fixed_expenses?.[index]?.amount ? 'border-red-500' : ''}`}
                        {...register(`fixed_expenses.${index}.amount` as const, { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => remove(index)}
                    className="text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {fields.length === 0 && (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg bg-card/30">
                <p>Nenhum custo fixo adicionado ainda.</p>
                <p className="text-xs">Adicione os principais para ter clareza.</p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 flex justify-between">
          <Button variant="ghost" onClick={onBack} type="button">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Button onClick={onNext} className="group">
            Próximo Passo
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </motion.div>
  )
}
