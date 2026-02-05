'use client'

import { useFinancialData } from '@/context/FinancialContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function RecurringList() {
  const { recurringTransactions, monthlyIncome, loading } = useFinancialData()

  if (loading) {
    return <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin" /></div>
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg">Contas Fixas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Show monthly income from profile */}
        {monthlyIncome > 0 && (
          <div className="flex justify-between items-center border-b border-border/50 pb-2">
            <div>
              <p className="font-medium">Renda Mensal</p>
              <p className="text-xs text-muted-foreground">Estimativa do perfil</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-green-400">+ R$ {monthlyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <Badge variant="outline" className="text-[10px] h-5">Mensal</Badge>
            </div>
          </div>
        )}

        {recurringTransactions.length === 0 && monthlyIncome === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma conta recorrente cadastrada.</p>
        ) : (
          <div className="space-y-4">
            {recurringTransactions.map((item) => {
              const isIncome = item.type === 'income'
              return (
                <div key={item.id} className="flex justify-between items-center border-b border-border/50 pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{item.description}</p>
                    <p className="text-xs text-muted-foreground">Vence dia {item.due_day}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-semibold",
                      isIncome ? "text-green-400" : "text-red-400"
                    )}>
                      {isIncome ? '+' : '-'} R$ {Number(item.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <Badge variant="outline" className="text-[10px] h-5">
                      {item.frequency === 'monthly' ? 'Mensal' : item.frequency}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
