// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Get environment variables with validation
const getEnvVar = (key: string): string => {
  const value = process.env[key]
  if (!value) {
    // In production, you might want to throw an error
    // In development, we'll use console.error
    console.error(`Environment variable ${key} is not defined`)
    // Return empty string to avoid null, but the app should handle this
    return ''
  }
  return value
}

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
const supabaseAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY')

// Create supabase client only if we have the required values
let supabaseInstance: ReturnType<typeof createClient> | null = null

if (supabaseUrl && supabaseAnonKey) {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
} else {
  console.error('Supabase initialization failed: Missing environment variables')
}

// Export a function that always returns a supabase client or throws an error
export const getSupabase = () => {
  if (!supabaseInstance) {
    throw new Error(
      'Supabase client is not initialized. Please check your environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }
  return supabaseInstance
}

// Export the instance (might be null, but we'll handle it)
export const supabase = supabaseInstance