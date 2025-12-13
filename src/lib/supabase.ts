// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Type assertion for environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create the client with type assertion that it will not be null
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

// Export with a type that tells TypeScript this is NOT null
export const supabase = supabaseClient as NonNullable<typeof supabaseClient>