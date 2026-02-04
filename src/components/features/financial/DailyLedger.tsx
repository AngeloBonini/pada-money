'use client'

import { useFinancialData } from '@/context/FinancialContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'
import { useState } from 'react'

export function DailyLedger() {
  const { transactions, projectedTransactions, loading } = useFinancialData()
  
  if (loading) {
     return <div className="h-40 w-full animate-pulse bg-card rounded-xl"></div>
  }

  // Combine actual and projected
  // We need to map them to a common format
  const allTransactions = [
    ...transactions.map(t => ({
      ...t,
      isProjected: false,
      dateObj: new Date(t.date + 'T12:00:00') // normalize time
    })),
    ...projectedTransactions.map(t => ({
        ...t,
        isProjected: true,
        dateObj: new Date(t.date + 'T12:00:00')
    }))
  ]

  // Sort by date ascending for the month view
  allTransactions.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())

  // Group by Day
  const groupedByDay: { [key: string]: typeof allTransactions } = {}
  
  allTransactions.forEach(t => {
      const day = t.dateObj.getDate()
      const key = day.toString()
      if (!groupedByDay[key]) groupedByDay[key] = []
      groupedByDay[key].push(t)
  })

  // Calculate daily balances
  // We likely want to show the current month mostly.
  // For now, let's just show the list as is, assuming context filters for month (TODO)
  
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg">Extrato Diário</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
            {Object.keys(groupedByDay).map(day => {
                const dayTransactions = groupedByDay[day]
                const dayBalance = dayTransactions.reduce((acc, curr) => {
                    return curr.type === 'income' ? acc + Number(curr.amount) : acc - Number(curr.amount)
                }, 0)

                return (
                    <div key={day} className="space-y-2">
                        <div className="flex items-center gap-2 border-b border-white/10 pb-1 mb-2">
                            <span className="text-sm font-bold bg-white/10 px-2 py-0.5 rounded text-white">Dia {day}</span>
                            <span className={`text-xs ${dayBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                Saldo do dia: {dayBalance >= 0 ? '+' : ''}R$ {dayBalance.toFixed(2)}
                            </span>
                        </div>
                        <div className="space-y-2 pl-2">
                            {dayTransactions.map((t, idx) => (
                                <div key={t.id || idx} className={`flex justify-between items-center text-sm ${t.isProjected ? 'opacity-60 italic' : ''}`}>
                                    <div className="flex items-center gap-2">
                                        {t.isProjected && <Clock className="w-3 h-3 text-yellow-400" />}
                                        <span>{t.description}</span>
                                    </div>
                                    <span className={t.type === 'income' ? 'text-green-400' : 'text-red-400'}>
                                        {t.type === 'income' ? '+' : '-'} R$ {Number(t.amount).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })}
             {allTransactions.length === 0 && <p className="text-center text-muted-foreground p-4">Nenhuma movimentação neste mês.</p>}
        </div>
      </CardContent>
    </Card>
  )
}
