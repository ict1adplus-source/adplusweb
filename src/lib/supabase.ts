// lib/supabase.ts - CLIENT-SIDE ONLY VERSION
import { createClient } from '@supabase/supabase-js'

// This file should ONLY be used on the client side
// It will not be called during SSR/static generation

// Check if we're in the browser
const isBrowser = typeof window !== 'undefined'

let supabaseClient = null

if (isBrowser) {
  // Only initialize on the client side
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (supabaseUrl && supabaseAnonKey) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  } else {
    console.warn('Supabase: Missing environment variables on client side')
  }
}

export const supabase = supabaseClient