import { useFormContext } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { OnboardingFormData } from './types'
import { ArrowRight, ArrowLeft, ShieldCheck, Plane, TrendingDown, Rocket } from 'lucide-react'

const GOALS = [
  {
    id: 'emergency_fund',
    icon: ShieldCheck,
    title: 'Reserva de Emergência',
    desc: 'Quero ter 6 meses de custos guardados para segurança.'
  },
  {
    id: 'dream',
    icon: Plane,
    title: 'Sonho / Viagem',
    desc: 'Estou juntando para um objetivo específico de curto prazo.'
  },
  {
    id: 'debt',
    icon: TrendingDown,
    title: 'Sair das Dívidas',
    desc: 'Preciso organizar o caos e limpar meu nome.'
  },
  {
    id: 'investing',
    icon: Rocket,
    title: 'Investir & Multiplicar',
    desc: 'Já tenho controle e quero ver meu patrimônio crescer.'
  }
]

export function Step3Goal({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const { register, watch, setValue, formState: { errors } } = useFormContext<OnboardingFormData>()
  
  const selectedGoal = watch('main_goal')

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <CardHeader className="px-0">
        <CardTitle className="text-2xl">Qual seu foco agora?</CardTitle>
        <CardDescription>
          Isso ajuda nossa IA a personalizar os conselhos para o seu momento.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0 space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {GOALS.map((goal) => (
            <div
              key={goal.id}
              onClick={() => setValue('main_goal', goal.id)}
              className={`
                relative p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]
                ${selectedGoal === goal.id 
                  ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/20' 
                  : 'border-border/50 bg-card/50 hover:bg-card hover:border-border'
                }
              `}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${selectedGoal === goal.id ? 'bg-blue-500 text-white' : 'bg-secondary text-foreground'}`}>
                  <goal.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-1">{goal.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {goal.desc}
                  </p>
                </div>
              </div>
              
              {/* Hidden input for form registration */}
              <input
                type="radio"
                value={goal.id}
                className="sr-only"
                {...register('main_goal')}
              />
            </div>
          ))}
        </div>
        
        {errors.main_goal && (
          <p className="text-sm text-red-400 text-center">{errors.main_goal.message}</p>
        )}

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
