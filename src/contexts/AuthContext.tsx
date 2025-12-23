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
  forgotPassword: (email: string) => Promise<any>
  resetPassword: (token: string, newPassword: string) => Promise<any>
  updatePassword: (newPassword: string) => Promise<any>
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
        email: email.toLowerCase(),
        password,
      })
      
      if (error) {
        console.error('Sign in error:', error)
        return { data: null, error }
      }
      
      console.log('Sign in successful:', data.user?.email)
      
      // Check if email is verified
      if (!data.user?.email_confirmed_at && !data.user?.user_metadata?.email_verified) {
        // Send verification email
        await resendVerification(email)
        
        return { 
          data: null, 
          error: new Error('Please verify your email first. A new verification email has been sent.') 
        }
      }
      
      // Update admin profile if needed
      if (data.user && isAdminEmail(email)) {
        try {
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
      
      // Use your actual Vercel domain
      const siteUrl = 'https://adplusweb.vercel.app'
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          data: {
            name: userData.name,
            company: userData.company,
            phone: userData.phone,
            role: 'client',
          },
          // This is the key - redirect to login page after verification
          emailRedirectTo: `${siteUrl}/auth/login?verified=true&email=${encodeURIComponent(email.toLowerCase())}`,
        }
      })

      if (authError) {
        console.error('Sign up error:', authError)
        return { data: null, error: authError }
      }

      console.log('Sign up successful:', authData.user?.email)

      // Try to create user profile
      if (authData.user) {
        try {
          const adminClient = supabaseAdmin || supabase
          await adminClient.from('users').insert([
            {
              id: authData.user.id,
              email: authData.user.email?.toLowerCase(),
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
        }
      }

      return { 
        data: { 
          ...authData, 
          message: 'Account created! Please check your email to verify your account.' 
        }, 
        error: null 
      }
    } catch (error: any) {
      console.error('Sign up catch error:', error)
      return { data: null, error: error.message || 'Failed to create account' }
    }
  }

  const forgotPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
        redirectTo: 'https://adplusweb.vercel.app/auth/reset-password',
      })
      
      if (error) {
        console.error('Forgot password error:', error)
        return { data: null, error }
      }
      
      return { data: { message: 'Password reset instructions sent to your email' }, error: null }
    } catch (error: any) {
      console.error('Forgot password catch error:', error)
      return { data: null, error }
    }
  }

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      // First verify the token
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'recovery'
      })
      
      if (verifyError) {
        return { data: null, error: verifyError }
      }
      
      // Then update the password
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      })
      
      if (error) {
        return { data: null, error }
      }
      
      return { data: { message: 'Password reset successfully' }, error: null }
    } catch (error: any) {
      return { data: null, error }
    }
  }

  const updatePassword = async (newPassword: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      })
      
      if (error) {
        return { data: null, error }
      }
      
      return { data: { message: 'Password updated successfully' }, error: null }
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
      email: email.toLowerCase(),
      options: {
        emailRedirectTo: 'https://adplusweb.vercel.app/auth/login?verified=true',
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
    forgotPassword,
    resetPassword,
    updatePassword,
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