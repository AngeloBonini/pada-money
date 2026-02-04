/**
 * Database Types para Supabase
 * Gerado via Supabase CLI
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
      insights: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          sentiment: 'positive' | 'neutral' | 'warning' | null
          title: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          sentiment?: 'positive' | 'neutral' | 'warning' | null
          title: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          sentiment?: 'positive' | 'neutral' | 'warning' | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "insights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
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
          income_type: 'salary' | 'freelance' | 'mixed' | null
          payday: number | null
          estimated_income: number | null
          main_goal: string | null
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
          income_type?: 'salary' | 'freelance' | 'mixed' | null
          payday?: number | null
          estimated_income?: number | null
          main_goal?: string | null
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
          income_type?: 'salary' | 'freelance' | 'mixed' | null
          payday?: number | null
          estimated_income?: number | null
          main_goal?: string | null
        }
        Relationships: []
      }
      recurring_expenses: {
        Row: {
          id: string
          user_id: string
          name: string
          amount: number
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          amount: number
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          amount?: number
          category?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_expenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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

export type RecurringExpense = Database['public']['Tables']['recurring_expenses']['Row']
export type RecurringExpenseInsert = Database['public']['Tables']['recurring_expenses']['Insert']
export type RecurringExpenseUpdate = Database['public']['Tables']['recurring_expenses']['Update']

export type SubscriptionStatus = 'active' | 'free' | 'past_due'
export type TransactionType = 'income' | 'expense'
export type InsightSentiment = 'positive' | 'neutral' | 'warning'
