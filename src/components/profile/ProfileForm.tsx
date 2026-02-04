'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Loader2, 
  Save, 
  Plus, 
  Trash2, 
  Wallet, 
  Sparkles, 
  DollarSign,
  ShieldCheck,
  Plane,
  TrendingDown,
  Rocket
} from 'lucide-react'
import type { Profile, RecurringExpense } from '@/lib/database.types'
import { cn } from '@/lib/utils'

interface ProfileFormProps {
  profile: Profile | null
  expenses: RecurringExpense[]
  userEmail: string
}

const INCOME_TYPES = [
  { value: 'salary', label: 'Salário Fixo', icon: Wallet },
  { value: 'freelance', label: 'Freelancer', icon: Sparkles },
  { value: 'mixed', label: 'Misto', icon: DollarSign },
]

const GOALS = [
  { id: 'emergency_fund', icon: ShieldCheck, title: 'Reserva de Emergência' },
  { id: 'dream', icon: Plane, title: 'Sonho / Viagem' },
  { id: 'debt', icon: TrendingDown, title: 'Sair das Dívidas' },
  { id: 'investing', icon: Rocket, title: 'Investir & Multiplicar' },
]

export function ProfileForm({ profile, expenses: initialExpenses, userEmail }: ProfileFormProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  // Profile fields
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [incomeType, setIncomeType] = useState(profile?.income_type || '')
  const [payday, setPayday] = useState(profile?.payday?.toString() || '')
  const [estimatedIncome, setEstimatedIncome] = useState(profile?.estimated_income?.toString() || '')
  const [mainGoal, setMainGoal] = useState(profile?.main_goal || '')
  
  // Expenses management
  const [expenses, setExpenses] = useState(initialExpenses)
  const [newExpenseName, setNewExpenseName] = useState('')
  const [newExpenseAmount, setNewExpenseAmount] = useState('')

  const handleSaveProfile = async () => {
    setIsSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName || null,
          income_type: incomeType || null,
          payday: payday ? parseInt(payday) : null,
          estimated_income: estimatedIncome ? parseFloat(estimatedIncome) : null,
          main_goal: mainGoal || null,
        }),
      })

      if (!res.ok) {
        throw new Error('Erro ao salvar perfil')
      }

      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' })
      router.refresh()
    } catch {
      setMessage({ type: 'error', text: 'Erro ao salvar. Tente novamente.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddExpense = async () => {
    if (!newExpenseName || !newExpenseAmount) return

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newExpenseName,
          amount: parseFloat(newExpenseAmount),
        }),
      })

      if (!res.ok) throw new Error('Erro ao adicionar despesa')

      const { expense } = await res.json()
      setExpenses([expense, ...expenses])
      setNewExpenseName('')
      setNewExpenseAmount('')
    } catch {
      setMessage({ type: 'error', text: 'Erro ao adicionar despesa.' })
    }
  }

  const handleDeleteExpense = async (id: string) => {
    try {
      const res = await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao excluir despesa')
      setExpenses(expenses.filter(e => e.id !== id))
    } catch {
      setMessage({ type: 'error', text: 'Erro ao excluir despesa.' })
    }
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
  const income = parseFloat(estimatedIncome) || 0
  const remaining = income - totalExpenses

  return (
    <div className="space-y-6">
      {/* Message */}
      {message && (
        <div
          className={cn(
            "p-3 rounded-lg text-sm",
            message.type === 'success'
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          )}
        >
          {message.text}
        </div>
      )}

      {/* Basic Info */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
          <CardDescription>Seus dados pessoais e de conta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={userEmail} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome Completo</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Seu nome"
            />
          </div>
        </CardContent>
      </Card>

      {/* Income Info */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Renda</CardTitle>
          <CardDescription>Como você recebe e quanto ganha</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Income Type */}
          <div className="space-y-2">
            <Label>Tipo de Renda</Label>
            <div className="grid grid-cols-3 gap-3">
              {INCOME_TYPES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setIncomeType(option.value)}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-white/5",
                    incomeType === option.value 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-border/50 bg-card/50'
                  )}
                >
                  <option.icon className={cn(
                    "w-5 h-5 mb-2",
                    incomeType === option.value ? 'text-blue-400' : 'text-muted-foreground'
                  )} />
                  <span className="text-xs font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="payday">Dia do Recebimento</Label>
              <Input
                id="payday"
                type="number"
                min="1"
                max="31"
                value={payday}
                onChange={(e) => setPayday(e.target.value)}
                placeholder="Ex: 5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="income">Renda Mensal Média</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
                <Input
                  id="income"
                  type="number"
                  value={estimatedIncome}
                  onChange={(e) => setEstimatedIncome(e.target.value)}
                  placeholder="0,00"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goal */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Objetivo Principal</CardTitle>
          <CardDescription>Qual seu foco financeiro atual?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {GOALS.map((goal) => (
              <button
                key={goal.id}
                type="button"
                onClick={() => setMainGoal(goal.id)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all text-left",
                  mainGoal === goal.id 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-border/50 bg-card/50 hover:bg-card hover:border-border'
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg",
                  mainGoal === goal.id ? 'bg-blue-500 text-white' : 'bg-secondary'
                )}>
                  <goal.icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{goal.title}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recurring Expenses */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Despesas Fixas</CardTitle>
          <CardDescription>
            Gastos mensais recorrentes • Total: R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary */}
          <div className={cn(
            "p-4 rounded-lg border-l-4",
            remaining >= 0 ? 'border-l-green-500 bg-green-500/5' : 'border-l-red-500 bg-red-500/5'
          )}>
            <p className="text-sm text-muted-foreground">Sobra Mensal Estimada</p>
            <p className={cn(
              "text-2xl font-bold",
              remaining >= 0 ? 'text-green-500' : 'text-red-500'
            )}>
              R$ {remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Expense List */}
          <div className="space-y-2">
            {expenses.map((expense) => (
              <div 
                key={expense.id} 
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
              >
                <div>
                  <p className="font-medium text-sm">{expense.name}</p>
                  <p className="text-xs text-muted-foreground">{expense.category}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">
                    R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {expenses.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                Nenhuma despesa fixa cadastrada
              </p>
            )}
          </div>

          {/* Add Expense */}
          <div className="flex gap-2">
            <Input
              placeholder="Nome da despesa"
              value={newExpenseName}
              onChange={(e) => setNewExpenseName(e.target.value)}
              className="flex-1"
            />
            <div className="relative w-32">
              <span className="absolute left-3 top-2.5 text-muted-foreground text-xs">R$</span>
              <Input
                type="number"
                placeholder="0,00"
                value={newExpenseAmount}
                onChange={(e) => setNewExpenseAmount(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={handleAddExpense}
              disabled={!newExpenseName || !newExpenseAmount}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button 
        onClick={handleSaveProfile} 
        disabled={isSaving}
        className="w-full gap-2"
        size="lg"
      >
        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Salvar Alterações
      </Button>
    </div>
  )
}
