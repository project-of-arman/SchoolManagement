import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string
          name: string
          slug: string
          owner_id: string
          created_at: string
          updated_at: string
          settings: any
        }
        Insert: {
          id?: string
          name: string
          slug: string
          owner_id: string
          created_at?: string
          updated_at?: string
          settings?: any
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          owner_id?: string
          created_at?: string
          updated_at?: string
          settings?: any
        }
      }
      school_content: {
        Row: {
          id: string
          school_id: string
          section: string
          content: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          school_id: string
          section: string
          content: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          section?: string
          content?: any
          created_at?: string
          updated_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          school_id: string
          roll_number: string
          application_type: string
          message: string
          status: string
          payment_info: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          school_id: string
          roll_number: string
          application_type: string
          message: string
          status?: string
          payment_info?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          roll_number?: string
          application_type?: string
          message?: string
          status?: string
          payment_info?: any
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          role: string
          school_id: string
          full_name: string
          subject?: string | null
          phone?: string | null
          qualification?: string | null
          experience?: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          role: string
          school_id: string
          full_name: string
          subject?: string | null
          phone?: string | null
          qualification?: string | null
          experience?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: string
          school_id?: string
          full_name?: string
          subject?: string | null
          phone?: string | null
          qualification?: string | null
          experience?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      results: {
        Row: {
          id: string
          school_id: string
          roll_number: string
          class: string
          subject: string
          marks: number
          total_marks: number
          exam_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          school_id: string
          roll_number: string
          class: string
          subject: string
          marks: number
          total_marks: number
          exam_type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          roll_number?: string
          class?: string
          subject?: string
          marks?: number
          total_marks?: number
          exam_type?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}