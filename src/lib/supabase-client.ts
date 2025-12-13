// lib/supabase-client.ts
import { createClient } from '@supabase/supabase-js'

class SupabaseClient {
  private static instance: ReturnType<typeof createClient>

  public static getClient() {
    if (!this.instance) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase environment variables')
      }

      this.instance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    }

    return this.instance
  }
}

// Export a singleton instance
export const supabase = SupabaseClient.getClient()