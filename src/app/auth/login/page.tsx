'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, ADMIN_EMAILS } from '@/contexts/AuthContext'
import { Mail, Lock, User, Building, Phone, Shield, CheckCircle } from 'lucide-react'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)

  // Handle email verification success from URL
  useEffect(() => {
    const handleVerificationSuccess = () => {
      const searchParams = new URLSearchParams(window.location.search)
      const verified = searchParams.get('verified')
      const email = searchParams.get('email')
      
      if (verified === 'true') {
        if (email) {
          setSuccess(`Email ${email} verified successfully! You can now login.`)
        } else {
          setSuccess('Email verified successfully! You can now login.')
        }
        
        // Clear success message from URL
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }

    handleVerificationSuccess()
  }, [])

  // Check auth immediately on page load
  useEffect(() => {
    const checkAuth = async () => {
      console.log('Login page - checking auth...')
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        console.log('Already logged in as:', session.user.email)
        
        const isAdmin = ADMIN_EMAILS.includes(session.user.email?.toLowerCase() || '')
        const isVerified = session.user.email_confirmed_at
        
        if (!isVerified) {
          window.location.href = `/auth/verify-email?email=${encodeURIComponent(session.user.email || '')}`
          return
        }
        
        // Force redirect using window.location
        if (isAdmin) {
          window.location.href = '/admin/dashboard'
        } else {
          window.location.href = '/client/dashboard'
        }
      } else {
        console.log('Not logged in, showing login form')
        setCheckingAuth(false)
      }
    }
    
    checkAuth()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    try {
      if (isLogin) {
        // Direct Supabase login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase(),
          password,
        })
        
        if (error) {
          console.error('Login error:', error)
          throw error
        }
        
        console.log('Login successful:', data.user?.email)
        
        // Check if email is verified
        if (!data.user?.email_confirmed_at) {
          throw new Error('Please verify your email first. Check your inbox for the verification link.')
        }
        
        // Wait for session to be established
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Force redirect
        const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase())
        
        if (isAdmin) {
          window.location.href = '/admin/dashboard'
        } else {
          window.location.href = '/client/dashboard'
        }
      } else {
        // Sign up logic
        const userData = {
          name: formData.get('name') as string,
          company: formData.get('company') as string,
          phone: formData.get('phone') as string,
        }
        
        // Check if trying to create admin account
        if (ADMIN_EMAILS.includes(email.toLowerCase())) {
          setError('Admin accounts are pre-configured. Please use login instead.')
          setLoading(false)
          return
        }
        
        const { data, error } = await supabase.auth.signUp({
          email: email.toLowerCase(),
          password,
          options: {
            data: {
              name: userData.name,
              company: userData.company,
              phone: userData.phone,
            },
            // Redirect to login page after verification
            emailRedirectTo: 'https://adplusweb.vercel.app/auth/login?verified=true',
          }
        })
        
        if (error) throw error
        
        if (data?.user) {
          setSuccess('Account created successfully! Please check your email and click the verification link to activate your account.')
          setIsLogin(true)
          
          // Clear form fields manually instead of using reset()
          if (formRef.current) {
            const form = formRef.current
            const inputs = form.querySelectorAll('input, textarea')
            inputs.forEach(input => {
              (input as HTMLInputElement).value = ''
            })
          }
        }
      }
    } catch (error: any) {
      console.error('Full error:', error)
      setError(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-white to-yellow-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-gray-600">Checking authentication...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-600">
            {isLogin ? 'Sign in to your account' : 'Join Ad Plus as a client'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      name="name"
                      type="text"
                      required
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      name="company"
                      type="text"
                      required
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Your Company Ltd"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      name="phone"
                      type="tel"
                      required
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="+265 XXX XXX XXX"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  name="email"
                  type="email"
                  required
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                {isLogin && (
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-sm text-orange-600 hover:text-orange-800 hover:underline"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg">
                <CheckCircle className="inline h-4 w-4 mr-2" />
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
                setSuccess('')
                
                // Clear form fields when switching between login/signup
                if (formRef.current) {
                  const form = formRef.current
                  const inputs = form.querySelectorAll('input, textarea')
                  inputs.forEach(input => {
                    (input as HTMLInputElement).value = ''
                  })
                }
              }}
              className="text-orange-600 hover:text-orange-800 font-medium hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

          {isLogin && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Admin Access</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Use pre-configured admin emails for admin dashboard access.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600 text-sm">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="text-orange-600 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-orange-600 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-gray-600 hover:text-gray-900 hover:underline">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  )
}