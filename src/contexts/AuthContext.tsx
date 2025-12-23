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
  
  // Custom verification functions
  sendVerificationCode: (email: string) => Promise<any>
  verifyEmailCode: (email: string, code: string) => Promise<any>
  confirmEmailVerified: (email: string) => Promise<any>
  checkVerificationStatus: (email: string) => Promise<any>
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

  // Generate random 6-digit code
  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Send verification code to email
  const sendVerificationCode = async (email: string) => {
    try {
      // Generate a 6-digit code
      const code = generateVerificationCode()
      
      // Set expiry to 10 minutes from now
      const expiresAt = new Date()
      expiresAt.setMinutes(expiresAt.getMinutes() + 10)

      // First, invalidate any existing codes for this email
      await supabaseAdmin
        .from('verification_codes')
        .update({ used: true })
        .eq('email', email.toLowerCase())

      // Store the new code in the database
      const { data, error } = await supabaseAdmin
        .from('verification_codes')
        .insert([
          {
            email: email.toLowerCase(),
            code: code,
            expires_at: expiresAt.toISOString(),
            used: false,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Failed to store verification code:', error)
        throw error
      }

      // Log the code (for development - remove in production)
      console.log('=========================================')
      console.log('📧 VERIFICATION CODE FOR:', email)
      console.log('🔢 CODE:', code)
      console.log('⏰ Expires at:', expiresAt.toLocaleTimeString())
      console.log('=========================================')

      // Send email via API route
      try {
        const response = await fetch('/api/send-verification-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            email: email.toLowerCase(), 
            code: code 
          }),
        })

        const result = await response.json()
        
        if (!response.ok) {
          console.warn('Email API failed, but code was generated:', result.error)
          // Continue anyway - code is logged in console for development
        }
      } catch (emailError) {
        console.warn('Failed to call email API:', emailError)
        // Continue anyway - code is logged in console for development
      }

      return { 
        data: { 
          message: 'Verification code sent successfully',
          expiresAt: expiresAt
        }, 
        error: null 
      }
    } catch (error: any) {
      console.error('Send verification code error:', error)
      return { 
        data: null, 
        error: error.message || 'Failed to send verification code' 
      }
    }
  }

  // Verify the 6-digit code
  const verifyEmailCode = async (email: string, code: string) => {
    try {
      // Clean the code (remove any spaces)
      const cleanCode = code.replace(/\s/g, '')
      
      if (cleanCode.length !== 6) {
        throw new Error('Code must be 6 digits')
      }

      // Check if code exists and is valid
      const { data, error } = await supabaseAdmin
        .from('verification_codes')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('code', cleanCode)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error || !data) {
        console.log('Code verification failed for:', email, 'Code:', cleanCode)
        console.log('Error:', error)
        throw new Error('Invalid or expired verification code')
      }

      console.log('Code verified successfully for:', email)

      // Mark code as used
      await supabaseAdmin
        .from('verification_codes')
        .update({ used: true })
        .eq('id', data.id)

      return { 
        data: { 
          message: 'Email verified successfully',
          email: email,
          verifiedAt: new Date().toISOString()
        }, 
        error: null 
      }
    } catch (error: any) {
      console.error('Verify email code error:', error)
      return { 
        data: null, 
        error: error.message || 'Failed to verify code' 
      }
    }
  }

  // Mark email as verified in user metadata
  const confirmEmailVerified = async (email: string) => {
    try {
      // First, update the user's profile in the users table
      const { data: profileUpdate, error: profileError } = await supabaseAdmin
        .from('users')
        .update({ 
          email_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('email', email.toLowerCase())
        .select()
        .single()

      if (profileError) {
        console.warn('Could not update user profile:', profileError)
      }

      // Get user from auth to update metadata
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (authError) {
        console.error('Error listing users:', authError)
        // Still return success if we updated the profile
        if (!profileError) {
          return { 
            data: { 
              message: 'Email confirmed in profile',
              email: email
            }, 
            error: null 
          }
        }
        throw authError
      }
      
      const user = authData.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
      
      if (!user) {
        console.warn('User not found in auth, but profile was updated')
        return { 
          data: { 
            message: 'Email confirmed in profile',
            email: email
          }, 
          error: null 
        }
      }

      // Update user metadata to mark email as verified
      const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { 
          user_metadata: { 
            ...user.user_metadata, 
            email_verified: true,
            verified_at: new Date().toISOString()
          }
        }
      )

      if (updateError) {
        console.warn('Could not update user metadata:', updateError)
        // Still return success if we updated the profile
        if (!profileError) {
          return { 
            data: { 
              message: 'Email confirmed in profile',
              email: email
            }, 
            error: null 
          }
        }
        throw updateError
      }

      console.log('Email confirmed for user:', email)

      return { 
        data: { 
          message: 'Email confirmed successfully',
          email: email,
          user: updatedUser
        }, 
        error: null 
      }
    } catch (error: any) {
      console.error('Confirm email verified error:', error)
      return { 
        data: null, 
        error: error.message || 'Failed to confirm email verification' 
      }
    }
  }

  // Check if email is already verified
  const checkVerificationStatus = async (email: string) => {
    try {
      // Check users table first
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('users')
        .select('email_verified, updated_at')
        .eq('email', email.toLowerCase())
        .single()

      if (!profileError && profile?.email_verified) {
        return { 
          data: { 
            verified: true,
            verified_in: 'profile',
            email: email
          }, 
          error: null 
        }
      }

      // Check auth metadata
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (authError) {
        return { 
          data: { 
            verified: false,
            email: email
          }, 
          error: null 
        }
      }
      
      const user = authData.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
      
      if (user?.user_metadata?.email_verified) {
        return { 
          data: { 
            verified: true,
            verified_in: 'auth_metadata',
            email: email
          }, 
          error: null 
        }
      }

      // Check Supabase native email confirmation
      if (user?.email_confirmed_at) {
        return { 
          data: { 
            verified: true,
            verified_in: 'supabase_native',
            email: email
          }, 
          error: null 
        }
      }

      return { 
        data: { 
          verified: false,
          email: email
        }, 
        error: null 
      }
    } catch (error: any) {
      console.error('Check verification status error:', error)
      return { 
        data: null, 
        error: error.message || 'Failed to check verification status' 
      }
    }
  }

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
      
      // Check verification status
      const { data: verificationStatus } = await checkVerificationStatus(email)
      
      if (!verificationStatus?.verified) {
        // Send new verification code
        await sendVerificationCode(email)
        
        return { 
          data: null, 
          error: new Error('Please verify your email first. A new verification code has been sent to your email.') 
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
            email_verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          console.log('Admin profile updated')
        } catch (error) {
          console.warn('Could not update admin profile:', error)
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
      
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          data: {
            name: userData.name,
            company: userData.company,
            phone: userData.phone,
            role: 'client',
            email_verified: false,
          },
        }
      })

      if (authError) {
        console.error('Sign up auth error:', authError)
        return { data: null, error: authError }
      }

      console.log('User created:', authData.user?.email)

      // Send verification code
      if (authData.user) {
        await sendVerificationCode(email)
      }

      // Create user profile
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
              email_verified: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          ])
          console.log('User profile created')
        } catch (profileError) {
          console.warn('Could not create profile:', profileError)
          // Don't fail signup if profile creation fails
        }
      }

      return { 
        data: { 
          ...authData, 
          message: 'Account created! Please check your email for the verification code.' 
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
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
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
    forgotPassword,
    resetPassword,
    updatePassword,
    // Custom verification functions
    sendVerificationCode,
    verifyEmailCode,
    confirmEmailVerified,
    checkVerificationStatus,
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