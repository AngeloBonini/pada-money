'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Database, Tables } from '@/lib/database.types'

type Transaction = Tables<'transactions'>
type RecurringTransaction = Tables<'recurring_transactions'>
type Profile = Tables<'profiles'>

export interface ProjectedTransaction {
  id: string
  user_id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  date: string
  category: string | null
  is_verified?: boolean
  isProjected: boolean
}

interface FinancialContextType {
  transactions: Transaction[]
  recurringTransactions: RecurringTransaction[]
  projectedTransactions: ProjectedTransaction[]
  balance: number
  monthlyFixedExpenses: number
  monthlyIncome: number
  projectedBalance: number
  loading: boolean
  refreshData: () => Promise<void>
}

interface FinancialProviderProps {
  children: React.ReactNode
  userId: string
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined)

export function FinancialProvider({ children, userId }: FinancialProviderProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const refreshData = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch Profile (for estimated_income)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      setProfile(profileData)

      // Fetch Transactions (Current Month)
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('date', firstDay)
        .lte('date', lastDay)
        .order('date', { ascending: false })
      
      if (txError) throw txError
      setTransactions(txData || [])

      // Fetch Recurring
      const { data: recData, error: recError } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
      
      if (recError) throw recError
      setRecurringTransactions(recData || [])

    } catch (error) {
      console.error('Error fetching financial data:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase, userId])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  // Computed Values
  
  // Monthly income from profile (estimated_income)
  const monthlyIncome = Number(profile?.estimated_income) || 0

  // Current balance from actual transactions this month
  const balance = transactions.reduce((acc, curr) => {
    return curr.type === 'income' ? acc + Number(curr.amount) : acc - Number(curr.amount)
  }, 0)

  // Total monthly fixed expenses from recurring transactions
  const monthlyFixedExpenses = recurringTransactions
    .filter(t => t.type === 'expense' && t.frequency === 'monthly')
    .reduce((acc, curr) => acc + Number(curr.amount), 0)

  // PROJECTION LOGIC
  const projectedTransactions: ProjectedTransaction[] = []
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const currentDay = now.getDate()

  // Add estimated income as a projected transaction if no income transactions this month
  const hasReceivedIncome = transactions.some(t => t.type === 'income')
  const payday = profile?.payday || 1
  
  if (!hasReceivedIncome && monthlyIncome > 0) {
    const incomeDate = new Date(currentYear, currentMonth, payday)
    projectedTransactions.push({
      id: 'proj-salary',
      user_id: userId,
      description: 'Renda Mensal',
      amount: monthlyIncome,
      type: 'income',
      date: incomeDate.toISOString().split('T')[0],
      category: 'income',
      isProjected: true
    })
  }

  // Add recurring expenses that haven't been paid yet
  recurringTransactions.forEach(rec => {
    // Check if this recurring transaction already happened this month
    const exists = transactions.some(t => {
      return t.description.toLowerCase().includes(rec.description.toLowerCase()) || 
             rec.description.toLowerCase().includes(t.description.toLowerCase())
    })

    if (!exists) {
      const dueDate = new Date(currentYear, currentMonth, rec.due_day)
      const dateStr = dueDate.toISOString().split('T')[0]

      projectedTransactions.push({
        id: `proj-${rec.id}`,
        user_id: rec.user_id,
        description: rec.description,
        amount: Number(rec.amount),
        type: rec.type as 'income' | 'expense',
        date: dateStr,
        category: rec.category,
        isProjected: true
      })
    }
  })

  // Projected Balance = Current Balance + Projected Income - Projected Expenses
  const projectedBalance = balance + projectedTransactions.reduce((acc, curr) => {
    return curr.type === 'income' ? acc + Number(curr.amount) : acc - Number(curr.amount)
  }, 0)

  return (
    <FinancialContext.Provider value={{
      transactions,
      recurringTransactions,
      projectedTransactions,
      balance,
      monthlyFixedExpenses,
      monthlyIncome,
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
