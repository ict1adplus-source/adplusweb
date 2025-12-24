'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

const ADMIN_EMAILS = ['admin@example.com'] // Add your admin emails here

interface AdminContextType {
  admin: any
  loading: boolean
  signOut: () => Promise<void>
  refreshAdmin: () => Promise<void>
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const checkAdmin = async () => {
    try {
      const { data: { session } } = await supabase?.auth.getSession() || { data: { session: null } }
      
      if (session) {
        const isAdmin = ADMIN_EMAILS.includes(session.user.email?.toLowerCase() || '')
        if (isAdmin) {
          setAdmin(session.user)
        } else {
          await supabase?.auth.signOut()
          router.push('/auth/login')
        }
      } else {
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('Admin auth error:', error)
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const refreshAdmin = async () => {
    await checkAdmin()
  }

  useEffect(() => {
    // Initial check
    checkAdmin()

    // Set up auth state change listener
    const { data: { subscription } } = supabase?.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event)
        
        if (event === 'SIGNED_OUT') {
          setAdmin(null)
          router.push('/admin/login')
        } else if (session) {
          const isAdmin = ADMIN_EMAILS.includes(session.user.email?.toLowerCase() || '')
          if (isAdmin) {
            setAdmin(session.user)
          } else {
            await supabase?.auth.signOut()
            router.push('/auth/login')
          }
        } else {
          // No session, redirect to login
          router.push('/admin/login')
        }
      }
    ) || { data: { subscription: null } }

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [router])

  const signOut = async () => {
    try {
      await supabase?.auth.signOut()
      setAdmin(null)
      router.push('/admin/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <AdminContext.Provider value={{ 
      admin, 
      loading, 
      signOut,
      refreshAdmin 
    }}>
      {children}
    </AdminContext.Provider>
  )
}

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}