// lib/supabase-safe.ts - This will NEVER fail during build
export const getSupabaseSafe = () => {
  // This is a dummy function that returns null during build
  // Real implementation will only run in browser
  if (typeof window === 'undefined') {
    return null
  }
  
  // Dynamically import the real supabase client
  return import('@supabase/supabase-js').then(({ createClient }) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Missing Supabase environment variables')
      return null
    }
    
    return createClient(supabaseUrl, supabaseAnonKey)
  }).catch(() => null)
}