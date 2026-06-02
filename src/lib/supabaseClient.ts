import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || ''

// Mock client for demo purposes (since no real Supabase credentials provided)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// If env vars are missing, run in demo mode (localStorage). Otherwise use Supabase.
export const isDemoMode = !(supabaseUrl && supabaseAnonKey)

