'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function loginWithPassword(formData: FormData) {
  console.log('[SERVER ACTION] loginWithPassword called')

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  console.log('[SERVER ACTION] Email:', email)

  if (!email || !password) {
    console.log('[SERVER ACTION] Missing credentials')
    return { error: 'Email e senha são obrigatórios.' }
  }

  const supabase = await createClient()

  console.log('[SERVER ACTION] Attempting sign in...')
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.log('[SERVER ACTION] Login error:', error.message)
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Email ou senha incorretos.' }
    }
    return { error: error.message }
  }

  console.log('[SERVER ACTION] Login successful, user:', data.user?.id)

  // Return success instead of redirecting
  return { success: true }
}

export async function signUpWithPassword(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!email || !password || !confirmPassword) {
    return { error: 'Todos os campos são obrigatórios.' }
  }

  if (password.length < 6) {
    return { error: 'A senha deve ter pelo menos 6 caracteres.' }
  }

  if (password !== confirmPassword) {
    return { error: 'As senhas não coincidem.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Conta criada! Verifique seu email para confirmar o cadastro.' }
}
