/**
 * Auth Types - Simple email/password authentication
 */

export interface User {
  id: string
  email: string
  name: string | null
  passwordHash: string
  createdAt: Date
}

export interface Session {
  userId: string
  email: string
  expiresAt: number
}

export interface AuthResult {
  success: boolean
  user?: Omit<User, 'passwordHash'>
  error?: string
}

export type SafeUser = Omit<User, 'passwordHash'>
