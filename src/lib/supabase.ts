import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      folders: {
        Row: {
          id: string
          user_id: string
          title: string
          is_secret: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          is_secret?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          is_secret?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      saved_movies: {
        Row: {
          id: string
          user_id: string
          folder_id: string
          movie_id: number
          movie_title: string
          movie_poster: string | null
          movie_overview: string | null
          movie_release_date: string | null
          movie_rating: number | null
          added_at: string
        }
        Insert: {
          id?: string
          user_id: string
          folder_id: string
          movie_id: number
          movie_title: string
          movie_poster?: string | null
          movie_overview?: string | null
          movie_release_date?: string | null
          movie_rating?: number | null
          added_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          folder_id?: string
          movie_id?: number
          movie_title?: string
          movie_poster?: string | null
          movie_overview?: string | null
          movie_release_date?: string | null
          movie_rating?: number | null
          added_at?: string
        }
      }
    }
  }
} 