'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/contexts/AuthContext'
import { 
  FolderKanban, 
  FileText, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  LogOut,
  Eye,
  User,
  Building,
  Mail,
  Phone,
  Plus,
  ArrowRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react'

export default function ClientDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    pending: 0,
  })
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  const checkAuthAndLoadData = useCallback(async () => {
    if (!mountedRef.current) return
    
    try {
      console.log('Starting auth check...')
      setError(null)
      
      // Check for session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        throw new Error('Session error: ' + sessionError.message)
      }
      
      if (!session) {
        console.log('No session found, redirecting to login')
        router.push('/auth/login')
        return
      }

      console.log('Session found for user:', session.user.email)

      // Check if email is verified
      if (!session.user.email_confirmed_at) {
        console.log('Email not verified, redirecting to verification page')
        window.location.href = `/auth/verify-email?email=${encodeURIComponent(session.user.email || '')}`
        return
      }

      // Load user info
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', session.user.email)
        .single()

      if (userError) {
        console.error('User data error:', userError)
        // Continue even if user data fails - use auth user as fallback
        setUserInfo({
          name: session.user.user_metadata?.name || 'Client',
          email: session.user.email,
          company: session.user.user_metadata?.company || 'Not set',
          phone: session.user.user_metadata?.phone || 'Not set'
        })
      } else if (userData) {
        setUserInfo(userData)
      }

      // Load projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', session.user.id)
        .order('created_at', { ascending: false })

      if (projectsError) {
        console.error('Projects error:', projectsError)
        // Don't throw, just show empty projects
        setProjects([])
      } else {
        console.log('Projects loaded:', projectsData?.length || 0)
        setProjects(projectsData || [])
      }

      // Calculate stats
      const total = projectsData?.length || 0
      const inProgress = projectsData?.filter(p => p.status === 'in-progress').length || 0
      const completed = projectsData?.filter(p => p.status === 'completed' || p.status === 'delivered').length || 0
      const pending = projectsData?.filter(p => p.status === 'pending').length || 0

      setStats({ total, inProgress, completed, pending })
      
    } catch (error: any) {
      console.error('Error loading dashboard:', error)
      setError(error.message || 'Failed to load dashboard data')
      
      // If auth error, redirect to login
      if (error.message.includes('session') || error.message.includes('auth')) {
        router.push('/auth/login')
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [router])

  useEffect(() => {
    mountedRef.current = true
    
    // Initial load
    checkAuthAndLoadData()

    // Set up auth state change listener with debounce
    let timeoutId: NodeJS.Timeout
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event)
        
        if (!session && mountedRef.current) {
          router.push('/auth/login')
        } else if (event === 'SIGNED_IN' && mountedRef.current) {
          // Debounce to prevent multiple calls
          clearTimeout(timeoutId)
          timeoutId = setTimeout(() => {
            checkAuthAndLoadData()
          }, 500)
        }
      }
    )

    return () => {
      mountedRef.current = false
      clearTimeout(timeoutId)
      authListener?.subscription.unsubscribe()
    }
  }, [checkAuthAndLoadData, router])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      // Use window.location for complete sign out
      window.location.href = '/'
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const handleRetry = () => {
    setLoading(true)
    setError(null)
    checkAuthAndLoadData()
  }

  const statusColors: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'review': 'bg-purple-100 text-purple-800',
    'completed': 'bg-green-100 text-green-800',
    'delivered': 'bg-emerald-100 text-emerald-800',
  }

  const handleViewProject = (projectId: string) => {
    router.push(`/client/projects/${projectId}`)
  }

  const handleMessageTeam = (projectId: string) => {
    router.push(`/client/projects/${projectId}?tab=messages`)
  }

  // Error state
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Dashboard</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:opacity-90"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    )
  }

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Client Portal</h1>
              <p className="text-gray-600">Welcome back, {userInfo?.name || 'Client'}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/client/projects/create')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:opacity-90 transition-all"
              >
                <Plus className="h-5 w-5" />
                New Project
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Section */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold">{userInfo?.name || 'Not set'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Building className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Company</p>
                <p className="font-semibold">{userInfo?.company || 'Not set'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Mail className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{userInfo?.email || 'Not set'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Phone className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold">{userInfo?.phone || 'Not set'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Total Projects</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FolderKanban className="h-10 w-10 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
              <Clock className="h-10 w-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <Clock className="h-10 w-10 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">My Projects</h2>
            {projects.length > 0 && (
              <button
                onClick={() => router.push('/client/projects/create')}
                className="text-sm text-orange-600 hover:text-orange-800 font-medium"
              >
                Create New Project <ArrowRight className="inline h-4 w-4 ml-1" />
              </button>
            )}
          </div>

          <div className="divide-y divide-gray-200">
            {projects.map((project) => (
              <div key={project.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                    <p className="text-gray-600 mt-1 line-clamp-2">{project.description}</p>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[project.status]}`}>
                        {project.status.replace('-', ' ')}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {project.service_type?.replace('-', ' ') || project.category?.replace('-', ' ') || 'General'}
                      </span>
                      {project.budget && (
                        <span className="text-gray-500 text-sm">
                          Budget: MK{project.budget.toLocaleString()}
                        </span>
                      )}
                      {project.deadline && (
                        <span className="text-gray-500 text-sm">
                          Due: {new Date(project.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleViewProject(project.id)}
                      className="p-2 text-gray-600 hover:text-orange-600 hover:bg-gray-100 rounded-lg"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => handleMessageTeam(project.id)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg"
                    >
                      <MessageSquare className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button 
                    onClick={() => handleMessageTeam(project.id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Message Team
                  </button>
                  <button 
                    onClick={() => handleViewProject(project.id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    <FileText className="h-4 w-4" />
                    View Details
                  </button>
                </div>
              </div>
            ))}

            {projects.length === 0 && (
              <div className="p-12 text-center">
                <FolderKanban className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-6">Start your first project to get started with our services.</p>
                <button
                  onClick={() => router.push('/client/projects/create')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:opacity-90"
                >
                  <Plus className="h-5 w-5" />
                  Create Your First Project
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}