'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/contexts/AuthContext'

const ADMIN_EMAILS = [
  'yamikanitambala@gmail.com',
  'yankhojchigaru@gmail.com'
]

export default function DebugAuthPage() {
  const [authState, setAuthState] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    setLoading(true)
    
    // Get session from Supabase
    const { data: { session } } = await supabase.auth.getSession()
    
    // Get user if exists
    const { data: { user } } = await supabase.auth.getUser()
    
    // Check cookies
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.split('=').map(c => c.trim())
      acc[key] = value
      return acc
    }, {} as Record<string, string>)
    
    // Check localStorage
    const localStorageData = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        // @ts-ignore
        localStorageData[key] = localStorage.getItem(key)
      }
    }
    
    setAuthState({
      session: session ? {
        user: {
          id: session.user.id,
          email: session.user.email,
          emailConfirmed: !!session.user.email_confirmed_at,
        },
        expiresAt: new Date(session.expires_at! * 1000).toLocaleString(),
      } : null,
      user: user ? {
        id: user.id,
        email: user.email,
      } : null,
      cookies,
      localStorage: localStorageData,
      isAdminEmail: session?.user?.email ? ADMIN_EMAILS.includes(session.user.email.toLowerCase()) : false,
      timestamp: new Date().toLocaleString(),
    })
    
    setLoading(false)
  }

  const forceRedirect = () => {
    if (authState.session?.user?.email) {
      const isAdmin = ADMIN_EMAILS.includes(authState.session.user.email.toLowerCase())
      if (isAdmin) {
        window.location.href = '/admin/dashboard'
      } else {
        window.location.href = '/client/dashboard'
      }
    }
  }

  const clearAll = async () => {
    // Sign out
    await supabase.auth.signOut()
    
    // Clear cookies
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=')
      document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    })
    
    // Clear localStorage
    localStorage.clear()
    
    // Clear sessionStorage
    sessionStorage.clear()
    
    // Reload
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Auth Debug Tool</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Session Status</h2>
            {authState.session ? (
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <p className="font-medium text-green-800">✓ Logged In</p>
                  <p className="text-sm text-green-700">Email: {authState.session.user.email}</p>
                  <p className="text-sm text-green-700">Email Confirmed: {authState.session.user.emailConfirmed ? 'Yes' : 'No'}</p>
                  <p className="text-sm text-green-700">Session expires: {authState.session.expiresAt}</p>
                </div>
                <button
                  onClick={forceRedirect}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                  Force Redirect to Dashboard
                </button>
              </div>
            ) : (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <p className="font-medium text-red-800">✗ Not Logged In</p>
                <p className="text-sm text-red-700">No active session found</p>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Cookies</h2>
            <div className="space-y-2">
              {Object.keys(authState.cookies).map(key => (
                <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-mono text-sm">{key}</span>
                  <span className="text-xs text-gray-500">
                    {key.includes('token') ? '***' : authState.cookies[key]?.substring(0, 20)}
                  </span>
                </div>
              ))}
              {Object.keys(authState.cookies).length === 0 && (
                <p className="text-gray-500">No cookies found</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={checkAuth}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Refresh Auth State
            </button>
            <button
              onClick={clearAll}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear Everything & Logout
            </button>
            <button
              onClick={() => window.location.href = '/auth/login'}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go to Login Page
            </button>
            <button
              onClick={() => window.location.href = '/admin/dashboard'}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Try Admin Dashboard
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Raw Auth Data</h2>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-sm">
            {JSON.stringify(authState, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}