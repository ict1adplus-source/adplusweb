'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Lock, Shield } from 'lucide-react'
import { supabase } from '@/lib/supabase' // ← ADD THIS LINE

export default function AdminLoginPage() {
  // ... rest of your code {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    
    try {
      const { data, error } = await signIn(
        formData.get('email') as string,
        formData.get('password') as string
      )
      
      if (error) throw error

      // Verify admin role
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('email', formData.get('email'))
        .single()

      if (userData?.role !== 'admin') {
        await supabase.auth.signOut()
        throw new Error('Access denied. Admin privileges required.')
      }

      router.push('/admin/dashboard')
    } catch (error: any) {
      setError(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
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
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="admin@adplus.com"
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
                  className="pl-10 w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-900/50 border border-red-700 text-red-200 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Access Admin Panel'}
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