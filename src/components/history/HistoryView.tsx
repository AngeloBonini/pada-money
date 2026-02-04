'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign
} from 'lucide-react'
import type { Profile, Transaction, RecurringExpense } from '@/lib/database.types'
import { cn } from '@/lib/utils'

interface HistoryViewProps {
  profile: Profile | null
  transactions: Transaction[]
  expenses: RecurringExpense[]
}

// Helper to get month name in Portuguese
function getMonthName(date: Date): string {
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

// Helper to format currency
function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  })
}

export function HistoryView({ profile, transactions, expenses }: HistoryViewProps) {
  // Calculate monthly data
  const monthlyData = useMemo(() => {
    const months: Record<string, { income: number; expenses: number; transactions: Transaction[] }> = {}
    
    transactions.forEach(t => {
      const date = new Date(t.date)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!months[key]) {
        months[key] = { income: 0, expenses: 0, transactions: [] }
      }
      
      months[key].transactions.push(t)
      
      if (t.type === 'income' || t.amount > 0) {
        months[key].income += Math.abs(t.amount)
      } else {
        months[key].expenses += Math.abs(t.amount)
      }
    })
    
    return months
  }, [transactions])

  // Calculate totals
  const totalIncome = profile?.estimated_income || 0
  const totalFixedExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const monthlySavings = totalIncome - totalFixedExpenses
  const savingsRate = totalIncome > 0 ? (monthlySavings / totalIncome) * 100 : 0

  // Generate last 6 months for projection
  const projectionMonths = useMemo(() => {
    const result = []
    const today = new Date()
    
    for (let i = 0; i < 6; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1)
      result.push({
        date,
        name: getMonthName(date),
        projectedSavings: monthlySavings,
        cumulativeSavings: monthlySavings * (i + 1),
      })
    }
    
    return result
  }, [monthlySavings])

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
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
              {formatCurrency(totalFixedExpenses)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
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
              <Calendar className="w-4 h-4" />
              Taxa de Economia
            </CardDescription>
            <CardTitle className={cn(
              "text-2xl",
              savingsRate >= 20 ? 'text-green-500' : savingsRate >= 10 ? 'text-yellow-500' : 'text-red-500'
            )}>
              {savingsRate.toFixed(1)}%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Projection Chart (Simple Bar Visualization) */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Projeção de Economia</CardTitle>
          <CardDescription>
            Estimativa de acúmulo nos próximos 6 meses baseado na sua sobra atual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projectionMonths.map((month, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground capitalize">{month.name}</span>
                  <span className={cn(
                    "font-medium",
                    month.cumulativeSavings >= 0 ? 'text-green-500' : 'text-red-500'
                  )}>
                    {formatCurrency(month.cumulativeSavings)}
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all",
                      month.cumulativeSavings >= 0 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-400' 
                        : 'bg-gradient-to-r from-red-500 to-orange-400'
                    )}
                    style={{ 
                      width: `${Math.min(Math.abs((month.cumulativeSavings / (monthlySavings * 6)) * 100), 100)}%` 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {monthlySavings > 0 && (
            <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-green-400">
                💡 Em 6 meses, você poderá acumular aproximadamente{' '}
                <strong>{formatCurrency(monthlySavings * 6)}</strong> se mantiver esse ritmo!
              </p>
            </div>
          )}

          {monthlySavings < 0 && (
            <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400">
                ⚠️ Suas despesas excedem sua renda em {formatCurrency(Math.abs(monthlySavings))} por mês.
                Considere revisar seus gastos no seu perfil.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fixed Expenses Breakdown */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Despesas Fixas</CardTitle>
          <CardDescription>
            Distribuição dos seus gastos mensais recorrentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length > 0 ? (
            <div className="space-y-3">
              {expenses.map((expense) => {
                const percentage = totalFixedExpenses > 0 
                  ? (expense.amount / totalFixedExpenses) * 100 
                  : 0
                
                return (
                  <div key={expense.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{expense.name}</span>
                      <span className="text-muted-foreground">
                        {formatCurrency(expense.amount)} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma despesa fixa cadastrada. 
              <br />
              <span className="text-sm">Adicione suas despesas no seu perfil.</span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
          <CardDescription>
            {transactions.length > 0 
              ? `Últimas ${transactions.length} transações registradas`
              : 'Nenhuma transação registrada ainda'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.slice(0, 20).map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      transaction.type === 'income' || transaction.amount > 0
                        ? 'bg-green-500/20'
                        : 'bg-red-500/20'
                    )}>
                      {transaction.type === 'income' || transaction.amount > 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {transaction.clean_description || transaction.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.category && `${transaction.category} • `}
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    "font-semibold",
                    transaction.type === 'income' || transaction.amount > 0
                      ? 'text-green-500'
                      : 'text-red-500'
                  )}>
                    {transaction.type === 'income' || transaction.amount > 0 ? '+' : '-'}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 space-y-2">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground">
                Ainda não há transações registradas.
              </p>
              <p className="text-sm text-muted-foreground">
                Quando você fizer upload de extratos, suas transações aparecerão aqui.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
