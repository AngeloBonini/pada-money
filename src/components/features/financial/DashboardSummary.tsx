'use client'

import { useFinancialData } from '@/context/FinancialContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowTrendingUp, ArrowTrendingDown, Wallet } from 'lucide-react'

export function DashboardSummary() {
  const { balance, monthlyFixedExpenses, projectedBalance, loading } = useFinancialData()

  if (loading) return <div className="h-32 w-full animate-pulse bg-card rounded-xl"></div>

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-gradient-to-br from-blue-600/20 to-blue-900/20 border-blue-500/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
          <Wallet className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {balance.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Disponível agora</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Contas Fixas</CardTitle>
          <ArrowTrendingDown className="h-4 w-4 text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {monthlyFixedExpenses.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Comprometido mensalmente</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 border-purple-500/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Previsão de Sobra</CardTitle>
          <ArrowTrendingUp className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {projectedBalance.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Estimativa de fim de mês</p>
        </CardContent>
      </Card>
    </div>
  )
}
