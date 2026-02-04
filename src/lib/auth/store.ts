import { randomUUID } from 'crypto'
import { supabase } from '@/lib/db'
import type { User, SafeUser } from './types'

/**
 * User store with Supabase database persistence
 */

export async function createUser(
  email: string,
  passwordHash: string,
  name?: string
): Promise<SafeUser> {
  const id = randomUUID()
  const now = new Date().toISOString()
  
  // Create user in users table
  const { data, error } = await supabase
    .from('users')
    .insert({
      id,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      name: name || null,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single()
  
  if (error) {
    console.error('[AUTH] Error creating user:', error)
    throw new Error(error.message)
  }
  
  // Also create a profile entry for the user (for app features)
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id,
      email: email.toLowerCase(),
      full_name: name || null,
      subscription_status: 'free',
      created_at: now,
      updated_at: now,
    })
  
  if (profileError) {
    console.error('[AUTH] Error creating profile:', profileError)
    // Don't fail if profile creation fails - user is still created
  }
  
  console.log('[AUTH] Created user:', email, 'ID:', id)
  
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    passwordHash: data.password_hash,
    createdAt: new Date(data.created_at),
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  console.log('[AUTH] Finding user by email:', email)
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single()
  
  if (error || !data) {
    console.log('[AUTH] User not found:', email)
    return null
  }
  
  console.log('[AUTH] User found:', data.id)
  
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    passwordHash: data.password_hash,
    createdAt: new Date(data.created_at),
  }
}

export async function findUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error || !data) {
    return null
  }
  
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    passwordHash: data.password_hash,
    createdAt: new Date(data.created_at),
  }
}

export function getSafeUser(user: User): SafeUser {
  const { passwordHash: _, ...safeUser } = user
  return safeUser
}

export async function userExists(email: string): Promise<boolean> {
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase())
    .single()
  
  return !!data
}

// Get profile data for a user
export async function getProfile(userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  return data
}
