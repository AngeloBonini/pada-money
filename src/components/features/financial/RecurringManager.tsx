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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Trash2 } from 'lucide-react'

const recurringSchema = z.object({
  description: z.string().min(1, 'Nome obrigatório'),
  amount: z.string().transform((val) => parseFloat(val.replace(',', '.'))).or(z.number()),
  type: z.enum(['income', 'expense']),
  day: z.string().transform((val) => parseInt(val, 10)).or(z.number()).refine(val => val >= 1 && val <= 31, 'Dia inválido'),
})

type RecurringFormSchema = z.infer<typeof recurringSchema>

export function RecurringManager() {
  const { recurringTransactions, refreshData } = useFinancialData()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<z.input<typeof recurringSchema>>({
    resolver: zodResolver(recurringSchema),
    defaultValues: {
      type: 'expense'
    }
  })

  // Calculations
  const fixedIncome = recurringTransactions
    .filter(t => t.type === 'income' && t.is_active)
    .reduce((acc, curr) => acc + Number(curr.amount), 0)

  const fixedExpenses = recurringTransactions
    .filter(t => t.type === 'expense' && t.is_active)
    .reduce((acc, curr) => acc + Number(curr.amount), 0)

  const initialPower = fixedIncome - fixedExpenses

  const onSubmit = async (data: RecurringFormSchema) => {
    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not found')

      const { error } = await supabase.from('recurring_transactions').insert({
        user_id: user.id,
        description: data.description,
        amount: data.amount,
        type: data.type,
        frequency: 'monthly',
        due_day: data.day,
        is_active: true,
        category: 'Fixed'
      })

      if (error) throw error
      
      reset()
      await refreshData()
    } catch (error) {
      console.error('Error adding recurring:', error)
      alert('Erro ao adicionar conta fixa.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta conta fixa?')) return
    
    setDeleteLoading(id)
    try {
      const { error } = await supabase.from('recurring_transactions').delete().eq('id', id)
      if (error) throw error
      await refreshData()
    } catch (error) {
      console.error('Error deleting:', error)
      alert('Erro ao remover item.')
    } finally {
      setDeleteLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-green-500/10 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-500">Entradas Fixas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {fixedIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Salários, aluguéis...</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-500">Saídas Fixas (Basal)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {fixedExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Custo de vida mínimo</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-500">Poder de Compra Inicial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {initialPower.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">O que sobra das fixas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Recorrente</CardTitle>
            <CardDescription>Cadastre suas "Verdades Financeiras"</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input {...register('description')} placeholder="Ex: Spotify, Aluguel..." />
                {errors.description && <p className="text-red-400 text-xs">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input {...register('amount')} type="number" step="0.01" placeholder="0.00" />
                  {errors.amount && <p className="text-red-400 text-xs">{errors.amount.message}</p>}
                </div>
                 <div className="space-y-2">
                  <Label>Dia de Vencimento</Label>
                  <Input {...register('day')} type="number" min="1" max="31" placeholder="Dia" />
                   {errors.day && <p className="text-red-400 text-xs">{errors.day.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select onValueChange={(val: 'income' | 'expense') => setValue('type', val)} defaultValue="expense">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Saída Fixa (Gasto)</SelectItem>
                    <SelectItem value="income">Entrada Fixa (Renda)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Cadastrar
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Fixos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recurringTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum item cadastrado.
                </div>
              ) : (
                recurringTransactions.sort((a, b) => a.due_day - b.due_day).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${item.type === 'income' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                        <span className="text-xs font-bold">{item.due_day}</span>
                      </div>
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-xs text-muted-foreground capitalize">{item.frequency}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-semibold ${item.type === 'income' ? 'text-green-500' : 'text-red-400'}`}>
                        {item.type === 'income' ? '+' : '-'} R$ {Number(item.amount).toFixed(2)}
                      </span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-400" onClick={() => handleDelete(item.id)} disabled={deleteLoading === item.id}>
                        {deleteLoading === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
