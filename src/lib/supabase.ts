// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Helper function to validate environment variables
const validateEnvVars = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    console.error('NEXT_PUBLIC_SUPABASE_URL is not defined')
    throw new Error('Supabase URL is not configured')
  }

  if (!supabaseAnonKey) {
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined')
    throw new Error('Supabase anon key is not configured')
  }

  return { supabaseUrl, supabaseAnonKey }
}

// Create supabase client with error handling
let supabaseClient: ReturnType<typeof createClient> | null = null

try {
  const { supabaseUrl, supabaseAnonKey } = validateEnvVars()
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })
} catch (error) {
  console.error('Failed to initialize Supabase client:', error)
  // In development, you might want to throw the error
  // In production, you might want to handle it gracefully
  if (process.env.NODE_ENV === 'development') {
    throw error
  }
}

// Export the client (will be null if initialization failed)
export const supabase = supabaseClient

// Helper function to check if supabase is available
export const isSupabaseAvailable = () => {
  return supabaseClient !== null
}

// Helper function to get supabase with error handling
export const getSupabase = () => {
  if (!supabaseClient) {
    throw new Error('Supabase client is not initialized. Check your environment variables.')
  }
  return supabaseClient
}