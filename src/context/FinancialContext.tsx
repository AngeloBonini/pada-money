'use client'


import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Database, Tables } from '@/lib/database.types'

type Transaction = Tables<'transactions'>
type RecurringTransaction = Tables<'recurring_transactions'>

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

      // Fetch Transactions (Current Month to Date ideally, but fetching all for now)
      // TODO: Filter by month in the query for scalability
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', firstDay)
        .lte('date', lastDay)
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

  // PROJECTION LOGIC
  const projectedTransactions: ProjectedTransaction[] = []
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  recurringTransactions.forEach(rec => {
      // Logic: For each recurring transaction, check if it already "happened" in the transactions list
      // We match loosely by description and approximate amount? Or just Description and Month?
      // "Simple" User Logic: If I have a recurring "Spotify", and I see a "Spotify" transaction this month, it's paid.
      
      const exists = transactions.some(t => {
          const tDate = new Date(t.date)
          return t.description.toLowerCase().includes(rec.description.toLowerCase()) || 
                 rec.description.toLowerCase().includes(t.description.toLowerCase())
      })

      if (!exists) {
          // If due day is passed, it's late. If future, it's coming.
          // Construct the date for this month
          const dueDate = new Date(currentYear, currentMonth, rec.due_day)
          const dateStr = dueDate.toISOString().split('T')[0] // YYYY-MM-DD

          projectedTransactions.push({
              id: `proj-${rec.id}`,
              user_id: rec.user_id, // ensure user_id is in recurring schema
              description: rec.description,
              amount: Number(rec.amount),
              type: rec.type as 'income' | 'expense',
              date: dateStr,
              category: rec.category,
              isProjected: true
          })
      }
  })

  // Projected Balance = Current Balance + (Projected Income - Projected Expenses)
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
