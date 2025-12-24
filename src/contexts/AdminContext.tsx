'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

interface AdminUser {
  id: string
  email: string
  role: string
}

interface AdminContextType {
  admin: AdminUser | null
  loading: boolean
  signOut: () => Promise<void>
}

const AdminContext = createContext<AdminContextType>({
  admin: null,
  loading: true,
  signOut: async () => {},
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const checkSession = async () => {
      console.log('Checking session...')
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        console.log('Session:', session)
        console.log('Session error:', sessionError)
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          setAdmin(null)
          setLoading(false)
          return
        }

        if (!session) {
          console.log('No session found')
          setAdmin(null)
          setLoading(false)
          return
        }

        console.log('User email:', session.user.email)
        
        // Check admin role by email (same as login page)
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role, id')
          .eq('email', session.user.email)
          .single()

        console.log('User data from DB:', userData)
        console.log('User error:', userError)

        if (userError) {
          console.error('User fetch error:', userError)
          setAdmin(null)
          setLoading(false)
          return
        }

        if (userData?.role !== 'admin') {
          console.log('User is not admin, role:', userData?.role)
          setAdmin(null)
          setLoading(false)
          return
        }

        // User is admin
        console.log('Setting admin user:', session.user.email)
        setAdmin({
          id: session.user.id,
          email: session.user.email!,
          role: userData.role
        })
        
      } catch (error) {
        console.error('Auth check error:', error)
        setAdmin(null)
      } finally {
        console.log('Setting loading to false')
        setLoading(false)
      }
    }

    checkSession()

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        if (event === 'SIGNED_OUT') {
          setAdmin(null)
        } else if (session) {
          // Re-check admin status on auth state change
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('email', session.user.email)
            .single()

          if (userData?.role === 'admin') {
            setAdmin({
              id: session.user.id,
              email: session.user.email!,
              role: userData.role
            })
          } else {
            setAdmin(null)
          }
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const signOut = async () => {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      await supabase.auth.signOut()
      setAdmin(null)
      router.push('/admin/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <AdminContext.Provider value={{ admin, loading, signOut }}>
      {children}
    </AdminContext.Provider>
  )
}

export const useAdmin = () => useContext(AdminContext)