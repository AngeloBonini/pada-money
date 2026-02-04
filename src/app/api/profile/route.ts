import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { supabase } from '@/lib/db'
import type { ProfileUpdate } from '@/lib/database.types'

/**
 * GET /api/profile - Get current user's profile
 */
export async function GET() {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return NextResponse.json({ error: 'Erro ao buscar perfil' }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

/**
 * PUT /api/profile - Update current user's profile
 */
export async function PUT(request: Request) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    
    // Sanitize and validate update data
    const updateData: ProfileUpdate = {}
    
    if (body.full_name !== undefined) updateData.full_name = body.full_name
    if (body.income_type !== undefined) updateData.income_type = body.income_type
    if (body.payday !== undefined) updateData.payday = body.payday
    if (body.estimated_income !== undefined) updateData.estimated_income = body.estimated_income
    if (body.main_goal !== undefined) updateData.main_goal = body.main_goal
    
    updateData.updated_at = new Date().toISOString()

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', session.userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Profile PUT error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
