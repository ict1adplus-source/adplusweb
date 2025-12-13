'use client'

import { useEffect } from 'react'
import { supabase, ADMIN_EMAILS } from '@/contexts/AuthContext'

export default function RedirectPage() {
  useEffect(() => {
    const redirectUser = async () => {
      console.log('Redirect page - checking auth...')
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        console.log('No session, going to login')
        window.location.href = '/auth/login'
        return
      }
      
      console.log('Found session for:', session.user.email)
      
      const isAdmin = ADMIN_EMAILS.includes(session.user.email?.toLowerCase() || '')
      const isVerified = session.user.email_confirmed_at
      
      if (!isVerified) {
        console.log('Not verified, going to verify page')
        window.location.href = `/auth/verify-email?email=${encodeURIComponent(session.user.email || '')}`
        return
      }
      
      console.log('Redirecting to:', isAdmin ? 'admin' : 'client', 'dashboard')
      
      if (isAdmin) {
        window.location.href = '/admin/dashboard'
      } else {
        window.location.href = '/client/dashboard'
      }
    }
    
    redirectUser()
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-700">Redirecting...</h2>
      <p className="text-gray-500 mt-2">Please wait while we redirect you</p>
    </div>
  )
}