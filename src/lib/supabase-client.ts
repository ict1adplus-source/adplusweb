// lib/supabase-client.ts
import { createClient } from '@supabase/supabase-js'

// Check if we're in the browser (client-side)
const isBrowser = typeof window !== 'undefined'

// Get environment variables with better error handling
const getEnvVar = (key: string): string => {
  if (isBrowser) {
    // Client-side: environment variables should be available
    return process.env[key] || ''
  }
  
  // Server-side: during build, check if variables exist
  const value = process.env[key]
  if (!value && process.env.NODE_ENV === 'production') {
    console.warn(`Warning: Environment variable ${key} is not set`)
  }
  return value || ''
}

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
const supabaseAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY')

// Only create the client if we have the required values
let supabaseClient = null

if (supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
} else {
  console.warn('Supabase: Missing environment variables. Client not initialized.')
}

// Export the client
export const supabase = supabaseClient