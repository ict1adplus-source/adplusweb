'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/contexts/AuthContext'
import Link from 'next/link'
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
  AlertCircle,
  Download,
  Target,
  CreditCard,
  DollarSign,
  Percent,
  TrendingUp,
  AlertTriangle,
  Users,
  Calendar,
  FileBarChart,
  ChevronRight,
  Bell
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
    totalInvestment: 0,
    totalPaid: 0,
  })
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [projectDetails, setProjectDetails] = useState<Record<string, {
    milestones: any[],
    progress: number,
    payment: any,
    deliverables: any[]
  }>>({})
  const [error, setError] = useState<string | null>(null)
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const mountedRef = useRef(true)
  const initialLoadDone = useRef(false)

  const addDebugLog = (message: string) => {
    console.log(`[Dashboard Debug] ${message}`)
    setDebugLogs(prev => [...prev.slice(-5), `${new Date().toISOString().split('T')[1].split('.')[0]}: ${message}`])
  }

  const checkAuthAndLoadData = useCallback(async () => {
    if (!mountedRef.current || initialLoadDone.current) return
    
    try {
      addDebugLog('Starting auth check...')
      setError(null)
      
      // Check for session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        addDebugLog(`Session error: ${sessionError.message}`)
        throw new Error('Session error: ' + sessionError.message)
      }
      
      if (!session) {
        addDebugLog('No session found, redirecting to login')
        router.push('/auth/login')
        return
      }

      addDebugLog(`Session found for user: ${session.user.email}`)

      // Check if email is verified
      if (!session.user.email_confirmed_at) {
        addDebugLog('Email not verified, redirecting to verification page')
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
        addDebugLog(`User data error: ${userError.message}`)
        // Use auth user as fallback
        setUserInfo({
          name: session.user.user_metadata?.name || 'Client',
          email: session.user.email,
          company: session.user.user_metadata?.company || 'Not set',
          phone: session.user.user_metadata?.phone || 'Not set'
        })
      } else if (userData) {
        addDebugLog(`User data loaded for: ${userData.name}`)
        setUserInfo(userData)
      }

      // Load projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', session.user.id)
        .order('created_at', { ascending: false })

      if (projectsError) {
        addDebugLog(`Projects error: ${projectsError.message}`)
        setProjects([])
      } else {
        addDebugLog(`Projects loaded: ${projectsData?.length || 0}`)
        setProjects(projectsData || [])
      }

      // Load notifications
      const { data: notificationsData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (notificationsData) {
        setNotifications(notificationsData)
        const unread = notificationsData.filter(n => !n.read).length
        setUnreadNotifications(unread)
      }

      // Load additional details for each project
      if (projectsData && projectsData.length > 0) {
        for (const project of projectsData) {
          await loadProjectDetails(project.id)
        }
      }

      // Calculate stats
      const total = projectsData?.length || 0
      const inProgress = projectsData?.filter(p => p.status === 'in-progress').length || 0
      const completed = projectsData?.filter(p => p.status === 'completed' || p.status === 'delivered').length || 0
      const pending = projectsData?.filter(p => p.status === 'pending').length || 0
      
      // Calculate financial stats
      let totalInvestment = 0
      let totalPaid = 0
      
      if (projectsData) {
        for (const project of projectsData) {
          const projectId = project.id
          const payment = projectDetails[projectId]?.payment
          
          if (payment) {
            totalInvestment += parseFloat(payment.total_amount) || 0
            totalPaid += parseFloat(payment.amount_paid) || 0
          } else {
            totalInvestment += parseFloat(project.budget) || 0
          }
        }
      }

      setStats({ total, inProgress, completed, pending, totalInvestment, totalPaid })
      
      initialLoadDone.current = true
      
    } catch (error: any) {
      addDebugLog(`Error: ${error.message}`)
      setError(error.message || 'Failed to load dashboard data')
      
      if (error.message.includes('session') || error.message.includes('auth')) {
        router.push('/auth/login')
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [router, projectDetails])

  const loadProjectDetails = async (projectId: string) => {
    try {
      // Load milestones
      const { data: milestonesData } = await supabase
        .from('milestones')
        .select('*')
        .eq('project_id', projectId)
        .order('order', { ascending: true })

      // Load payment info
      const { data: paymentData } = await supabase
        .from('payments')
        .select('*')
        .eq('project_id', projectId)
        .single()

      // Load deliverables
      const { data: deliverablesData } = await supabase
        .from('project_files')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_deliverable', true)
        .order('uploaded_at', { ascending: false })

      // Calculate progress
      let progress = 0
      if (milestonesData && milestonesData.length > 0) {
        const completed = milestonesData.filter(m => m.status === 'completed').length
        progress = Math.round((completed / milestonesData.length) * 100)
      }

      setProjectDetails(prev => ({
        ...prev,
        [projectId]: {
          milestones: milestonesData || [],
          progress,
          payment: paymentData || null,
          deliverables: deliverablesData || []
        }
      }))
    } catch (error) {
      console.error('Error loading project details:', error)
    }
  }

  const loadNotifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: notificationsData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (notificationsData) {
        setNotifications(notificationsData)
        const unread = notificationsData.filter(n => !n.read).length
        setUnreadNotifications(unread)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      // Reload notifications
      await loadNotifications()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllNotificationsAsRead = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', session.user.id)
        .eq('read', false)

      // Reload notifications
      await loadNotifications()
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const handleDownloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('project-files')
        .download(filePath)
      
      if (error) throw error
      
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading file:', error)
      alert('Failed to download file')
    }
  }

  useEffect(() => {
    mountedRef.current = true
    initialLoadDone.current = false
    
    // Initial load
    checkAuthAndLoadData()

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        addDebugLog(`Auth state changed: ${event}`)
        
        if (!session && mountedRef.current) {
          addDebugLog('No session in auth listener, redirecting to login')
          router.push('/auth/login')
        }
      }
    )

    // Set up real-time subscriptions
    const projectsChannel = supabase
      .channel('projects-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'projects',
          filter: `client_id=eq.${userInfo?.id || ''}`
        }, 
        () => {
          checkAuthAndLoadData()
        }
      )
      .subscribe()

    const notificationsChannel = supabase
      .channel('notifications-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${userInfo?.id || ''}`
        }, 
        () => {
          loadNotifications()
        }
      )
      .subscribe()

    return () => {
      mountedRef.current = false
      authListener?.subscription.unsubscribe()
      supabase.removeChannel(projectsChannel)
      supabase.removeChannel(notificationsChannel)
    }
  }, [checkAuthAndLoadData, router, userInfo?.id])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const handleRetry = () => {
    initialLoadDone.current = false
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

  const paymentStatusColors: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'partial': 'bg-blue-100 text-blue-800',
    'paid': 'bg-green-100 text-green-800',
    'overdue': 'bg-red-100 text-red-800',
  }

  const handleViewProject = (projectId: string) => {
    router.push(`/client/projects/${projectId}`)
  }

  const handleMessageTeam = (projectId: string) => {
    router.push(`/client/projects/${projectId}?tab=messages`)
  }

  const handleViewMilestones = (projectId: string) => {
    router.push(`/client/projects/${projectId}?tab=milestones`)
  }

  const handleViewPayments = (projectId: string) => {
    router.push(`/client/projects/${projectId}?tab=payments`)
  }

  const handleViewDeliverables = (projectId: string) => {
    router.push(`/client/projects/${projectId}?tab=files`)
  }

  const calculateOverallProgress = () => {
    if (projects.length === 0) return 0
    let totalProgress = 0
    projects.forEach(project => {
      totalProgress += projectDetails[project.id]?.progress || 0
    })
    return Math.round(totalProgress / projects.length)
  }

  // Error state
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow p-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Unable to Load Dashboard</h2>
            <p className="text-gray-600 mb-6 text-center">{error}</p>
            
            {debugLogs.length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Debug Logs:</p>
                <div className="text-xs text-gray-600 space-y-1">
                  {debugLogs.map((log, index) => (
                    <div key={index} className="font-mono">{log}</div>
                  ))}
                </div>
              </div>
            )}
            
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
              {/* Notifications Dropdown */}
              <div className="relative">
                <button className="p-2 text-gray-600 hover:text-gray-900 relative">
                  <Bell className="h-6 w-6" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
                
                {notifications.length > 0 && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                    <div className="p-4 border-b">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Notifications</h3>
                        <button
                          onClick={markAllNotificationsAsRead}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Mark all as read
                        </button>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                          onClick={() => {
                            markNotificationAsRead(notification.id)
                            if (notification.project_id) {
                              router.push(`/client/projects/${notification.project_id}`)
                            }
                          }}
                        >
                          <p className="text-sm text-gray-900">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

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
        {/* Client Information */}
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

        {/* Stats Overview */}
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
                <p className="text-gray-600">Overall Progress</p>
                <p className="text-3xl font-bold text-gray-900">{calculateOverallProgress()}%</p>
              </div>
              <Percent className="h-10 w-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Total Investment</p>
                <p className="text-3xl font-bold text-gray-900">MK{stats.totalInvestment.toLocaleString()}</p>
              </div>
              <DollarSign className="h-10 w-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Amount Paid</p>
                <p className="text-3xl font-bold text-gray-900">MK{stats.totalPaid.toLocaleString()}</p>
              </div>
              <CreditCard className="h-10 w-10 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

          <div className="bg-white rounded-xl p-6 shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Balance Due</p>
                <p className="text-3xl font-bold text-gray-900">MK{(stats.totalInvestment - stats.totalPaid).toLocaleString()}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="bg-white rounded-xl shadow overflow-hidden mb-8">
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
            {projects.map((project) => {
              const details = projectDetails[project.id]
              const milestones = details?.milestones || []
              const progress = details?.progress || 0
              const payment = details?.payment
              const deliverables = details?.deliverables || []
              
              return (
                <div key={project.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                          <p className="text-gray-600 mt-1 line-clamp-2">{project.description}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[project.status]}`}>
                            {project.status.replace('-', ' ')}
                          </span>
                          {payment?.status && (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${paymentStatusColors[payment.status]}`}>
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Project Info Row */}
                      <div className="flex items-center gap-4 mt-3 flex-wrap">
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
                        {deliverables.length > 0 && (
                          <span className="text-blue-500 text-sm">
                            {deliverables.length} deliverable{deliverables.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress: {progress}%</span>
                          <span>{milestones.filter(m => m.status === 'completed').length}/{milestones.length} milestones</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Payment Info */}
                      {payment && (
                        <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="text-gray-600">Total</div>
                            <div className="font-semibold">MK{payment.total_amount?.toLocaleString() || '0'}</div>
                          </div>
                          <div className="bg-green-50 p-2 rounded">
                            <div className="text-green-600">Paid</div>
                            <div className="font-semibold">MK{payment.amount_paid?.toLocaleString() || '0'}</div>
                          </div>
                          <div className="bg-orange-50 p-2 rounded">
                            <div className="text-orange-600">Balance</div>
                            <div className="font-semibold">
                              MK{((payment.total_amount || 0) - (payment.amount_paid || 0)).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button 
                        onClick={() => handleViewProject(project.id)}
                        className="p-2 text-gray-600 hover:text-orange-600 hover:bg-gray-100 rounded-lg"
                        title="View Project"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleMessageTeam(project.id)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg"
                        title="Message Team"
                      >
                        <MessageSquare className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-4 flex-wrap">
                    <button 
                      onClick={() => handleViewProject(project.id)}
                      className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      <FileText className="h-4 w-4" />
                      View Details
                    </button>
                    <button 
                      onClick={() => handleMessageTeam(project.id)}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Message Team
                    </button>
                    {milestones.length > 0 && (
                      <button 
                        onClick={() => handleViewMilestones(project.id)}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90"
                      >
                        <Target className="h-4 w-4" />
                        View Milestones ({milestones.filter(m => m.status === 'completed').length}/{milestones.length})
                      </button>
                    )}
                    {payment && (
                      <button 
                        onClick={() => handleViewPayments(project.id)}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:opacity-90"
                      >
                        <CreditCard className="h-4 w-4" />
                        Payment Details
                      </button>
                    )}
                    {deliverables.length > 0 && (
                      <button 
                        onClick={() => handleViewDeliverables(project.id)}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-lg hover:opacity-90"
                      >
                        <Download className="h-4 w-4" />
                        View Deliverables ({deliverables.length})
                      </button>
                    )}
                  </div>

                  {/* Quick Milestone Preview */}
                  {milestones.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Milestones</h4>
                      <div className="space-y-2">
                        {milestones.slice(0, 3).map((milestone) => (
                          <div key={milestone.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${
                                milestone.status === 'completed' ? 'bg-green-500' :
                                milestone.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'
                              }`} />
                              <span className="truncate">{milestone.title}</span>
                            </div>
                            <div className="text-gray-500 text-xs">
                              {milestone.status === 'completed' ? 'Completed' :
                               milestone.status === 'in-progress' ? 'In Progress' : 'Pending'}
                            </div>
                          </div>
                        ))}
                        {milestones.length > 3 && (
                          <button 
                            onClick={() => handleViewMilestones(project.id)}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            View all {milestones.length} milestones <ChevronRight className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Deliverables Preview */}
                  {deliverables.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Deliverables</h4>
                      <div className="space-y-2">
                        {deliverables.slice(0, 2).map((file) => (
                          <div key={file.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-gray-400" />
                              <span className="truncate">{file.file_name || file.file_path.split('/').pop()}</span>
                            </div>
                            <button
                              onClick={() => handleDownloadFile(file.file_path, file.file_name || file.file_path.split('/').pop())}
                              className="text-blue-600 hover:text-blue-800 text-xs"
                            >
                              Download
                            </button>
                          </div>
                        ))}
                        {deliverables.length > 2 && (
                          <button 
                            onClick={() => handleViewDeliverables(project.id)}
                            className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                          >
                            View all {deliverables.length} deliverables <ChevronRight className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

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

        {/* Financial Summary */}
        {projects.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Financial Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">Total Investment</p>
                    <p className="text-3xl font-bold text-gray-900">MK{stats.totalInvestment.toLocaleString()}</p>
                    <p className="text-sm text-gray-600 mt-1">Across {stats.total} projects</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">Amount Paid</p>
                    <p className="text-3xl font-bold text-gray-900">MK{stats.totalPaid.toLocaleString()}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {stats.totalInvestment > 0 ? 
                        `${((stats.totalPaid / stats.totalInvestment) * 100).toFixed(1)}% paid` : 
                        'No payments yet'}
                    </p>
                  </div>
                  <CreditCard className="h-8 w-8 text-green-500" />
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">Balance Due</p>
                    <p className="text-3xl font-bold text-gray-900">MK{(stats.totalInvestment - stats.totalPaid).toLocaleString()}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {stats.totalInvestment > 0 ? 
                        `${(100 - ((stats.totalPaid / stats.totalInvestment) * 100)).toFixed(1)}% remaining` : 
                        'Fully paid'}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}