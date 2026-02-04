'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { useFinancialData } from '@/context/FinancialContext'

export function MigrationDebug() {
  const [counts, setCounts] = useState<{ expenses: number; transactions: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const { refreshData } = useFinancialData()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const checkCounts = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { count: expCount } = await supabase
        .from('recurring_expenses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      const { count: txCount } = await supabase
        .from('recurring_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      setCounts({ expenses: expCount || 0, transactions: txCount || 0 })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkCounts()
  }, [])

  const handleMigrate = async () => {
    setMigrating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Get old data
      const { data: oldData } = await supabase
        .from('recurring_expenses')
        .select('*')
        .eq('user_id', user.id)
      
      if (!oldData || oldData.length === 0) return

      // 2. Transform
      const newData = oldData.map(item => ({
        user_id: user.id,
        description: item.name,
        amount: item.amount,
        type: 'expense',
        frequency: 'monthly',
        due_day: 1, // Default because recurring_expenses didn't have day?
        category: item.category || 'fixed',
        is_active: true
      }))

      // 3. Insert
      const { error } = await supabase
        .from('recurring_transactions')
        .insert(newData)
      
      if (error) throw error

      alert('Migração concluída!')
      await checkCounts()
      await refreshData()

    } catch (err: any) {
      alert('Erro na migração: ' + err.message)
    } finally {
      setMigrating(false)
    }
  }

  if (loading) return null

  if (counts && counts.expenses > 0 && counts.transactions === 0) {
    return (
      <Card className="border-yellow-500 bg-yellow-500/10 mb-6">
        <CardHeader>
          <CardTitle className="text-yellow-500 text-sm">Dados de Onboarding Encontrados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">
            Encontramos {counts.expenses} despesas do onboarding antigo, mas nenhuma na nova tabela.
          </p>
          <Button onClick={handleMigrate} disabled={migrating} variant="secondary">
            {migrating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Migrar Dados Agora
          </Button>
        </CardContent>
      </Card>
    )
  }

  return null
}
