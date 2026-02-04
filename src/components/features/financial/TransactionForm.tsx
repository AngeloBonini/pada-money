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
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, PlusCircle } from 'lucide-react'

const transactionSchema = z.object({
  description: z.string().min(1, 'Descrição obrigatória'),
  amount: z.string().transform((val) => parseFloat(val.replace(',', '.'))).or(z.number()),
  type: z.enum(['income', 'expense']),
  category: z.string().optional(),
  date: z.string().min(1, 'Data obrigatória'), // YYYY-MM-DD
  isRecurring: z.boolean().optional().default(false)
})

type TransactionFormSchema = z.infer<typeof transactionSchema>

export function TransactionForm() {
  const { refreshData } = useFinancialData()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Use z.input<typeof transactionSchema> for the form values to allow strings before transformation
  const { register, handleSubmit, reset, setValue, watch } = useForm<z.input<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      isRecurring: false
    }
  })

  // Watch recurring to show extra feedback if needed
  const isRecurring = watch('isRecurring')

  const onSubmit = async (data: TransactionFormSchema) => {
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

      // If recurring, also insert into recurring_transactions
      if (data.isRecurring) {
        const day = parseInt(data.date.split('-')[2], 10)
        
        const { error: reqError } = await supabase.from('recurring_transactions').insert({
          user_id: user.id,
          description: data.description,
          amount: data.amount,
          type: data.type,
          frequency: 'monthly',
          due_day: day,
          category: data.category || 'Outros',
          is_active: true
        })
        
        if (reqError) throw reqError
      }
      
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
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
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

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="recurring" 
              checked={isRecurring}
              onCheckedChange={(checked) => setValue('isRecurring', checked as boolean)} 
            />
            <Label htmlFor="recurring" className="font-normal cursor-pointer">
              É uma conta fixa/recorrente?
            </Label>
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
