import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  if (typeof window !== 'undefined') {
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '***' : 'undefined')
  }
}

// Create a singleton instance
let supabaseClient: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (typeof window === 'undefined') {
    // Server-side: return null or handle differently
    return null
  }

  if (!supabaseClient && supabaseUrl && supabaseAnonKey) {
    try {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        },
        global: {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })
      console.log('Supabase client initialized successfully')
    } catch (error) {
      console.error('Error creating Supabase client:', error)
    }
  } else if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase client not initialized due to missing environment variables')
  }
  
  return supabaseClient
}

// Export the client instance
export const supabase = getSupabaseClient()

// Updated safeSupabase with proper method chaining
export const safeSupabase = {
  from: (table: string) => {
    const client = getSupabaseClient()
    if (!client) {
      // Return a mock chainable object when Supabase is not initialized
      return {
        select: () => ({ 
          data: null, 
          error: new Error('Supabase not initialized') 
        }),
        insert: () => ({ 
          data: null, 
          error: new Error('Supabase not initialized') 
        }),
        update: () => ({ 
          data: null, 
          error: new Error('Supabase not initialized') 
        }),
        delete: () => ({ 
          data: null, 
          error: new Error('Supabase not initialized') 
        }),
      }
    }
    return client.from(table)
  },
  auth: {
    getSession: async () => {
      const client = getSupabaseClient()
      if (!client) return { data: { session: null }, error: new Error('Supabase not initialized') }
      return client.auth.getSession()
    },
    signInWithPassword: async (credentials: { email: string; password: string }) => {
      const client = getSupabaseClient()
      if (!client) return { data: { user: null, session: null }, error: new Error('Supabase not initialized') }
      return client.auth.signInWithPassword(credentials)
    },
    signOut: async () => {
      const client = getSupabaseClient()
      if (!client) return { error: new Error('Supabase not initialized') }
      return client.auth.signOut()
    },
    onAuthStateChange: (callback: any) => {
      const client = getSupabaseClient()
      if (!client) return { data: { subscription: { unsubscribe: () => {} } } }
      return client.auth.onAuthStateChange(callback)
    }
  }
}