/**
 * Database Types para Supabase
 * Gerado baseado no schema.sql do projeto
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          abacate_customer_id: string | null
          subscription_status: string
          last_payment_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          abacate_customer_id?: string | null
          subscription_status?: string
          last_payment_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          abacate_customer_id?: string | null
          subscription_status?: string
          last_payment_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          description: string
          clean_description: string | null
          category: string | null
          date: string
          type: 'income' | 'expense' | null
          source_file: string | null
          is_verified: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          description: string
          clean_description?: string | null
          category?: string | null
          date: string
          type?: 'income' | 'expense' | null
          source_file?: string | null
          is_verified?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          description?: string
          clean_description?: string | null
          category?: string | null
          date?: string
          type?: 'income' | 'expense' | null
          source_file?: string | null
          is_verified?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'transactions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      insights: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          sentiment: 'positive' | 'neutral' | 'warning' | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          sentiment?: 'positive' | 'neutral' | 'warning' | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          sentiment?: 'positive' | 'neutral' | 'warning' | null
          is_read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'insights_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types para uso mais fácil
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Transaction = Database['public']['Tables']['transactions']['Row']
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update']

export type Insight = Database['public']['Tables']['insights']['Row']
export type InsightInsert = Database['public']['Tables']['insights']['Insert']
export type InsightUpdate = Database['public']['Tables']['insights']['Update']

export type SubscriptionStatus = 'active' | 'free' | 'past_due'
export type TransactionType = 'income' | 'expense'
export type InsightSentiment = 'positive' | 'neutral' | 'warning'
