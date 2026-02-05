'use client'

import { useFinancialData } from '@/context/FinancialContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Wallet, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function DashboardSummary() {
  const { balance, monthlyFixedExpenses, monthlyIncome, projectedBalance, loading } = useFinancialData()

  if (loading) return <div className="h-32 w-full animate-pulse bg-card rounded-xl"></div>

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {/* Renda Mensal */}
      <Card className="bg-gradient-to-br from-green-600/20 to-green-900/20 border-green-500/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Renda Mensal</CardTitle>
          <DollarSign className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-400">R$ {formatCurrency(monthlyIncome)}</div>
          <p className="text-xs text-muted-foreground">Estimativa do perfil</p>
        </CardContent>
      </Card>

      {/* Saldo Atual */}
      <Card className="bg-gradient-to-br from-blue-600/20 to-blue-900/20 border-blue-500/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
          <Wallet className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-2xl font-bold",
            balance >= 0 ? "text-blue-400" : "text-red-400"
          )}>
            R$ {formatCurrency(balance)}
          </div>
          <p className="text-xs text-muted-foreground">Transações do mês</p>
        </CardContent>
      </Card>

      {/* Contas Fixas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Contas Fixas</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-400">R$ {formatCurrency(monthlyFixedExpenses)}</div>
          <p className="text-xs text-muted-foreground">Comprometido mensalmente</p>
        </CardContent>
      </Card>

      {/* Previsão de Sobra */}
      <Card className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 border-purple-500/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Previsão de Sobra</CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-2xl font-bold",
            projectedBalance >= 0 ? "text-purple-400" : "text-red-400"
          )}>
            R$ {formatCurrency(projectedBalance)}
          </div>
          <p className="text-xs text-muted-foreground">Estimativa de fim de mês</p>
        </CardContent>
      </Card>
    </div>
  )
}
