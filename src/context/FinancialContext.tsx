'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Database, Tables } from '@/lib/database.types'

type Transaction = Tables<'transactions'>
type RecurringTransaction = Tables<'recurring_transactions'>

interface FinancialContextType {
  transactions: Transaction[]
  recurringTransactions: RecurringTransaction[]
  balance: number
  monthlyFixedExpenses: number
  projectedBalance: number
  loading: boolean
  refreshData: () => Promise<void>
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined)

export function FinancialProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([])
  const [loading, setLoading] = useState(true)
  
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const refreshData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch Transactions
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
      
      if (txError) throw txError
      setTransactions(txData || [])

      // Fetch Recurring
      const { data: recData, error: recError } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
      
      if (recError) throw recError
      setRecurringTransactions(recData || [])

    } catch (error) {
      console.error('Error fetching financial data:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  // Computed Values
  const balance = transactions.reduce((acc, curr) => {
    return curr.type === 'income' ? acc + Number(curr.amount) : acc - Number(curr.amount)
  }, 0)

  const monthlyFixedExpenses = recurringTransactions
    .filter(t => t.type === 'expense' && t.frequency === 'monthly')
    .reduce((acc, curr) => acc + Number(curr.amount), 0)

  // Simple projection: Current Balance - Fixed Expenses (remaining for month)
  // This is a naive implementation, meant to be improved
  const projectedBalance = balance - monthlyFixedExpenses

  return (
    <FinancialContext.Provider value={{
      transactions,
      recurringTransactions,
      balance,
      monthlyFixedExpenses,
      projectedBalance,
      loading,
      refreshData
    }}>
      {children}
    </FinancialContext.Provider>
  )
}

export function useFinancialData() {
  const context = useContext(FinancialContext)
  if (context === undefined) {
    throw new Error('useFinancialData must be used within a FinancialProvider')
  }
  return context
}
