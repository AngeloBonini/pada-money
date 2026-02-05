'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Upload, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Target,
  ArrowRight,
  Lightbulb,
  PiggyBank,
  Wallet
} from 'lucide-react'
import type { Profile, RecurringExpense, Transaction, Insight } from '@/lib/database.types'
import { cn } from '@/lib/utils'

interface DashboardContentProps {
  profile: Profile | null
  userName: string
  expenses: RecurringExpense[]
  transactions: Transaction[]
  insights: Insight[]
}

const GOAL_LABELS: Record<string, { label: string; icon: typeof Target }> = {
  emergency_fund: { label: 'Reserva de Emergência', icon: PiggyBank },
  dream: { label: 'Sonho / Viagem', icon: Target },
  debt: { label: 'Sair das Dívidas', icon: TrendingDown },
  investing: { label: 'Investir & Multiplicar', icon: TrendingUp },
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  })
}

export function DashboardContent({ 
  profile, 
  userName, 
  expenses, 
  transactions, 
  insights 
}: DashboardContentProps) {
  // Calculate financial summary
  const totalIncome = profile?.estimated_income || 0
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const monthlySavings = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? (monthlySavings / totalIncome) * 100 : 0

  const goalInfo = profile?.main_goal ? GOAL_LABELS[profile.main_goal] : null

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          Olá, {userName}! 👋
        </h1>
        <p className="text-muted-foreground">
          Bem-vindo ao seu painel financeiro inteligente.
        </p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Renda Mensal
            </CardDescription>
            <CardTitle className="text-2xl text-green-500">
              {formatCurrency(totalIncome)}
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Despesas Fixas
            </CardDescription>
            <CardTitle className="text-2xl text-red-500">
              {formatCurrency(totalExpenses)}
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Sobra Mensal
            </CardDescription>
            <CardTitle className={cn(
              "text-2xl",
              monthlySavings >= 0 ? 'text-green-500' : 'text-red-500'
            )}>
              {formatCurrency(monthlySavings)}
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Taxa de Economia
            </CardDescription>
            <CardTitle className={cn(
              "text-2xl",
              savingsRate >= 20 ? 'text-green-500' : savingsRate >= 10 ? 'text-yellow-500' : 'text-red-500'
            )}>
              {savingsRate.toFixed(0)}%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Goal & Status Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Current Goal */}
        <Card className="border-border/50">
          <CardHeader>
            <CardDescription>Seu Objetivo Atual</CardDescription>
            <CardTitle className="flex items-center gap-3">
              {goalInfo && (
                <>
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <goalInfo.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  {goalInfo.label}
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/profile">
              <Button variant="outline" size="sm" className="gap-2">
                Alterar Objetivo
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card className="border-border/50">
          <CardHeader>
            <CardDescription>Status da Conta</CardDescription>
            <CardTitle className="capitalize">
              {profile?.subscription_status === 'active' ? '✨ Premium' : '🆓 Plano Gratuito'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {profile?.subscription_status === 'active' 
                ? 'Você tem acesso a todos os recursos premium.'
                : 'Faça upgrade para desbloquear insights avançados e análises detalhadas.'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expenses Overview */}
      {expenses.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Despesas Fixas</CardTitle>
                <CardDescription>
                  {expenses.length} despesas cadastradas
                </CardDescription>
              </div>
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="gap-2">
                  Gerenciar
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expenses.slice(0, 5).map((expense) => {
                const percentage = totalExpenses > 0 
                  ? (expense.amount / totalExpenses) * 100 
                  : 0
                
                return (
                  <div key={expense.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{expense.name}</span>
                      <span className="text-muted-foreground">
                        {formatCurrency(expense.amount)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              
              {expenses.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  + {expenses.length - 5} outras despesas
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Insights */}
      <Card className="border-border/50 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle>Insights Rápidos</CardTitle>
              <CardDescription>Análise baseada nos seus dados</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {savingsRate >= 20 ? (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-green-400">
                🎉 Parabéns! Você está economizando {savingsRate.toFixed(0)}% da sua renda. 
                Continue assim para alcançar seus objetivos mais rápido!
              </p>
            </div>
          ) : savingsRate >= 10 ? (
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-yellow-400">
                💡 Você está economizando {savingsRate.toFixed(0)}% da sua renda. 
                Tente aumentar para pelo menos 20% para construir uma reserva sólida.
              </p>
            </div>
          ) : savingsRate > 0 ? (
            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <p className="text-sm text-orange-400">
                ⚠️ Sua taxa de economia está em {savingsRate.toFixed(0)}%. 
                Considere revisar suas despesas para aumentar sua margem de segurança.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400">
                🚨 Suas despesas estão maiores que sua renda! 
                Revise seu orçamento no perfil para encontrar onde cortar.
              </p>
            </div>
          )}

          {profile?.main_goal === 'emergency_fund' && monthlySavings > 0 && (
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm text-blue-400">
                🎯 Para sua reserva de emergência (6 meses de despesas = {formatCurrency(totalExpenses * 6)}), 
                você levará aproximadamente {Math.ceil((totalExpenses * 6) / monthlySavings)} meses economizando {formatCurrency(monthlySavings)}/mês.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Empty State - Call to Action for Transactions */}
      {transactions.length === 0 && (
        <Card className="border-dashed border-2 border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center mb-6">
              <Upload className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Comece importando seus extratos
            </h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Faça upload dos seus extratos bancários em PDF e deixe nossa IA 
              categorizar suas transações automaticamente.
            </p>
            <Button className="gap-2" disabled>
              <Upload className="w-4 h-4" />
              Upload de Extrato (Em breve - Fase 2)
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/profile">
          <Card className="border-border/50 hover:border-blue-500/50 transition-colors cursor-pointer group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Editar Perfil</CardTitle>
                    <CardDescription>Atualize sua renda e despesas</CardDescription>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/history">
          <Card className="border-border/50 hover:border-purple-500/50 transition-colors cursor-pointer group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Ver Histórico</CardTitle>
                    <CardDescription>Acompanhe sua evolução financeira</CardDescription>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}
