'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, ADMIN_EMAILS } from '@/contexts/AuthContext'
import { Mail, Lock, User, Building, Phone, Shield, LogOut } from 'lucide-react'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true)

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

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    try {
      if (isLogin) {
        // Direct Supabase login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) {
          console.error('Login error:', error)
          throw error
        }
        
        console.log('Login successful:', data.user?.email)
        
        // Wait for session to be established
        await new Promise(resolve => setTimeout(resolve, 1000))
        
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
          email,
          password,
          options: {
            data: {
              name: userData.name,
              company: userData.company,
              phone: userData.phone,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        })
        
        if (error) throw error
        
        if (data?.user) {
          alert('Account created successfully! Please check your email to verify your account.')
          setIsLogin(true)
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-malawi-light via-white to-malawi-light">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">Checking authentication...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-malawi-light via-white to-malawi-light flex items-center justify-center p-4">
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
          <form onSubmit={handleSubmit} className="space-y-6">
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
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
              }}
              className="text-primary hover:text-opacity-80 font-medium"
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
                    Use admin credentials for admin dashboard access.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600 text-sm">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  )
}