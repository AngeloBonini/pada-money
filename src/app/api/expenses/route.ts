import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { supabase } from '@/lib/db'
import type { RecurringExpenseInsert } from '@/lib/database.types'

/**
 * GET /api/expenses - Get user's recurring expenses
 */
export async function GET() {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: expenses, error } = await supabase
      .from('recurring_expenses')
      .select('*')
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching expenses:', error)
      return NextResponse.json({ error: 'Erro ao buscar despesas' }, { status: 500 })
    }

    return NextResponse.json({ expenses })
  } catch (error) {
    console.error('Expenses GET error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

/**
 * POST /api/expenses - Add new recurring expense
 */
export async function POST(request: Request) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    
    if (!body.name || body.amount === undefined) {
      return NextResponse.json({ error: 'Nome e valor são obrigatórios' }, { status: 400 })
    }

    const expenseData: RecurringExpenseInsert = {
      user_id: session.userId,
      name: body.name,
      amount: body.amount,
      category: body.category || 'fixed',
    }

    const { data: expense, error } = await supabase
      .from('recurring_expenses')
      .insert(expenseData)
      .select()
      .single()

    if (error) {
      console.error('Error creating expense:', error)
      return NextResponse.json({ error: 'Erro ao criar despesa' }, { status: 500 })
    }

    return NextResponse.json({ expense }, { status: 201 })
  } catch (error) {
    console.error('Expenses POST error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

/**
 * DELETE /api/expenses - Delete recurring expense
 */
export async function DELETE(request: Request) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID da despesa é obrigatório' }, { status: 400 })
    }

    const { error } = await supabase
      .from('recurring_expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', session.userId) // Ensure user can only delete their own expenses

    if (error) {
      console.error('Error deleting expense:', error)
      return NextResponse.json({ error: 'Erro ao excluir despesa' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Expenses DELETE error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

/**
 * PUT /api/expenses - Update recurring expense
 */
export async function PUT(request: Request) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json({ error: 'ID da despesa é obrigatório' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.amount !== undefined) updateData.amount = body.amount
    if (body.category !== undefined) updateData.category = body.category

    const { data: expense, error } = await supabase
      .from('recurring_expenses')
      .update(updateData)
      .eq('id', body.id)
      .eq('user_id', session.userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating expense:', error)
      return NextResponse.json({ error: 'Erro ao atualizar despesa' }, { status: 500 })
    }

    return NextResponse.json({ expense })
  } catch (error) {
    console.error('Expenses PUT error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
