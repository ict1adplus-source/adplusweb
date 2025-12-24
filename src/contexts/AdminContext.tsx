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
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Check initial session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // Check if user is admin
          const { data: userData, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single()

          if (error || userData?.role !== 'admin') {
            await supabase.auth.signOut()
            setAdmin(null)
            router.push('/admin/login')
          } else {
            setAdmin({
              id: session.user.id,
              email: session.user.email!,
              role: userData.role
            })
          }
        } else {
          setAdmin(null)
        }
      } catch (error) {
        console.error('Session check error:', error)
        setAdmin(null)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setAdmin(null)
          router.push('/admin/login')
        } else if (session?.user) {
          // Check if user is admin
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single()

          if (userData?.role === 'admin') {
            setAdmin({
              id: session.user.id,
              email: session.user.email!,
              role: userData.role
            })
          } else {
            await supabase.auth.signOut()
            setAdmin(null)
            router.push('/admin/login')
          }
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const signOut = async () => {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    await supabase.auth.signOut()
    setAdmin(null)
    router.push('/admin/login')
  }

  return (
    <AdminContext.Provider value={{ admin, loading, signOut }}>
      {children}
    </AdminContext.Provider>
  )
}

export const useAdmin = () => useContext(AdminContext)