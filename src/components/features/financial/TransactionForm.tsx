'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { createBrowserClient } from '@supabase/ssr'
import { useFinancialData } from '@/context/FinancialContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, PlusCircle } from 'lucide-react'

const transactionSchema = z.object({
  description: z.string().min(1, 'Descrição obrigatória'),
  amount: z.string().transform((val) => parseFloat(val.replace(',', '.'))).or(z.number()),
  type: z.enum(['income', 'expense']),
  category: z.string().optional(),
  date: z.string().min(1, 'Data obrigatória') // YYYY-MM-DD
})

type TransactionFormData = z.infer<typeof transactionSchema>

export function TransactionForm() {
  const { refreshData } = useFinancialData()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { register, handleSubmit, reset, setValue } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      date: new Date().toISOString().split('T')[0]
    }
  })

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not found')

      const { error } = await supabase.from('transactions').insert({
        user_id: user.id,
        description: data.description,
        amount: data.amount,
        type: data.type,
        date: data.date,
        category: data.category || 'Outros',
        is_verified: true
      })

      if (error) throw error
      
      reset()
      await refreshData()
    } catch (error) {
      console.error('Error adding transaction:', error)
      alert('Erro ao adicionar transação.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg">Novo Lançamento</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input {...register('description')} placeholder="Ex: Mercado, Uber..." />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor</Label>
              <Input {...register('amount')} type="number" step="0.01" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select onValueChange={(val: 'income' | 'expense') => setValue('type', val)} defaultValue="expense">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Gasto</SelectItem>
                  <SelectItem value="income">Ganho</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Data</Label>
            <Input {...register('date')} type="date" />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4 mr-2" />}
            Adicionar
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
