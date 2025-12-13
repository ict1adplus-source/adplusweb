// lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
  // SAFELY get environment variables without ! operator
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If environment variables are missing, return a mock client
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase environment variables are missing')
    
    // Return a mock client that won't crash during build
    return {
      auth: {
        getSession: async () => ({ 
          data: { session: null }, 
          error: null 
        }),
        getUser: async () => ({ 
          data: { user: null }, 
          error: null 
        }),
        signInWithPassword: async () => ({ 
          data: { user: null, session: null }, 
          error: null 
        }),
        signUp: async () => ({ 
          data: { user: null, session: null }, 
          error: null 
        }),
        signOut: async () => ({ 
          error: null 
        }),
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe: () => {} } }
        }),
        resetPasswordForEmail: async () => ({ 
          data: {}, 
          error: null 
        }),
      },
      from: () => ({
        select: () => ({ 
          data: [], 
          error: null 
        }),
        insert: () => ({ 
          data: null, 
          error: null 
        }),
        update: () => ({ 
          data: null, 
          error: null 
        }),
        delete: () => ({ 
          data: null, 
          error: null 
        }),
      }),
    } as any
  }

  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Browser client - now safe to use variables
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  
  // Server client - handle cookies safely
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        async getAll() {
          try {
            return (await cookies()).getAll()
          } catch {
            // During static build, cookies() throws
            return []
          }
        },
        setAll() {
          // No-op during build
        },
      },
    }
  )
}

// Export a client instance
export const supabase = createClient()