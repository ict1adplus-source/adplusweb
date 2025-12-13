// lib/supabase-admin.ts - CLIENT ONLY
import { createBrowserClient } from '@supabase/ssr'

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export const getSupabaseAdminClient = () => {
  // Only initialize on client side
  if (typeof window === 'undefined') {
    return null
  }
  
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables')
      return null
    }
    
    supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  
  return supabaseClient
}