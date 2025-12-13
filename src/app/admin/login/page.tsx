'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Lock, Shield, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required')
      }

      // Sign in with email and password
      const { data: authData, error: signInError } = await signIn(email, password)
      
      if (signInError) {
        throw signInError
      }

      if (!authData?.user) {
        throw new Error('Authentication failed. No user data returned.')
      }

      // VERIFY ADMIN ROLE - Fixed with non-null assertion
      const { data: userData, error: userError } = await supabase!
        .from('users')
        .select('role, is_active')
        .eq('email', email)
        .single()

      if (userError) {  // Fixed: use userError, not setError()
        // If user doesn't exist in users table, sign them out
        await supabase!.auth.signOut()
        throw new Error('User account not found in system database')
      }

      if (!userData) {
        await supabase!.auth.signOut()
        throw new Error('Unable to verify user credentials')
      }

      // Check if user is admin
      if (userData.role !== 'admin') {
        await supabase!.auth.signOut()
        throw new Error('Access denied. Admin privileges required.')
      }

      // Check if account is active
      if (userData.is_active === false) {
        await supabase!.auth.signOut()
        throw new Error('Account is deactivated. Please contact system administrator.')
      }

      // Success - redirect to admin dashboard
      router.push('/admin/dashboard')
      router.refresh()

    } catch (error: any) {
      console.error('Admin login error:', error)
      
      // Set user-friendly error messages
      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.')
      } else if (error.message.includes('Email not confirmed')) {
        setError('Please verify your email address before logging in.')
      } else if (error.message.includes('rate limit')) {
        setError('Too many login attempts. Please try again in a few minutes.')
      } else if (error.message.includes('Access denied')) {
        setError('Access denied. Admin privileges required.')
      } else {
        setError(error.message || 'Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-gray-300">Restricted access - authorized personnel only</p>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                  placeholder="admin@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  name="password"
                  type="password"
                  required
                  disabled={loading}
                  className="pl-10 w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-900/50 border border-red-700 text-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </>
              ) : (
                'Access Admin Panel'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-center text-gray-400 text-sm">
              Forgot your password?{' '}
              <Link href="/contact" className="text-primary hover:underline">
                Contact system administrator
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-gray-400 hover:text-white">
            ← Back to main site
          </Link>
        </div>
      </div>
    </div>
  )
}