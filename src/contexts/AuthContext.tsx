'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, createClient, Session } from '@supabase/supabase-js'

// Initialize Supabase clients
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Check if required environment variables are present
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin emails configuration
export const ADMIN_EMAILS = [
  'yamikanitambala@gmail.com',
  'yankhojchigaru@gmail.com'
]

// Helper function to check if email is admin
export const isAdminEmail = (email: string) => {
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

// Create admin client only if service key is available
let supabaseAdmin = supabase // Default to regular client

try {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (supabaseServiceKey) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    console.log('Admin client initialized with service role key')
  } else {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not found. Admin features may be limited.')
  }
} catch (error) {
  console.error('Failed to create admin client:', error)
  supabaseAdmin = supabase // Fallback to regular client
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, userData: any) => Promise<any>
  signOut: () => Promise<void>
  verifyEmail: (token: string) => Promise<any>
  resendVerification: (email: string) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Initial session:', session?.user?.email)
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user?.email) {
          const adminCheck = isAdminEmail(session.user.email)
          setIsAdmin(adminCheck)
        }
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user?.email) {
          const adminCheck = isAdminEmail(session.user.email)
          setIsAdmin(adminCheck)
        } else {
          setIsAdmin(false)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log('Signing in:', email)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('Sign in error:', error)
        return { data: null, error }
      }
      
      console.log('Sign in successful:', data.user?.email)
      
      // Update admin profile if needed (try with admin client, but don't fail if it doesn't work)
      if (data.user && isAdminEmail(email)) {
        try {
          // Try to get the admin client (might be the same as regular client)
          const adminClient = supabaseAdmin || supabase
          await adminClient.from('users').upsert({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || 'Admin User',
            company: 'Ad Plus Digital',
            phone: data.user.user_metadata?.phone || '+265000000000',
            role: 'admin',
            created_at: new Date().toISOString(),
          })
          console.log('Admin profile updated')
        } catch (error) {
          console.warn('Could not update admin profile (might be RLS issue):', error)
        }
      }
      
      return { data, error: null }
    } catch (error: any) {
      console.error('Sign in catch error:', error)
      return { data: null, error }
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      // Check if trying to create admin account
      if (isAdminEmail(email)) {
        return { 
          data: null, 
          error: new Error('Admin accounts are pre-configured. Please use login instead.') 
        }
      }
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            company: userData.company,
            phone: userData.phone,
            role: 'client',
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      })

      if (authError) {
        return { data: null, error: authError }
      }

      // Try to create user profile (might fail due to RLS, but that's OK)
      if (authData.user) {
        try {
          const adminClient = supabaseAdmin || supabase
          await adminClient.from('users').insert([
            {
              id: authData.user.id,
              email: authData.user.email,
              name: userData.name,
              company: userData.company,
              phone: userData.phone,
              role: 'client',
              created_at: new Date().toISOString(),
            }
          ])
          console.log('User profile created')
        } catch (profileError) {
          console.warn('Could not create profile (might be RLS issue):', profileError)
          // Don't fail signup if profile creation fails
        }
      }

      return { data: authData, error: null }
    } catch (error: any) {
      return { data: null, error }
    }
  }

  const verifyEmail = async (token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email',
    })
    return { data, error }
  }

  const resendVerification = async (email: string) => {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    })
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setIsAdmin(false)
  }

  const value = {
    user,
    session,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    verifyEmail,
    resendVerification,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Export the admin client for other files to use
export { supabaseAdmin }