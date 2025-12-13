'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, ADMIN_EMAILS } from '@/contexts/AuthContext'
import { 
  Users, 
  FolderKanban, 
  DollarSign, 
  BarChart3,
  LogOut,
  Eye,
  MessageSquare,
  CheckCircle,
  Clock,
  Shield,
  Mail,
  Calendar
} from 'lucide-react'

// Admin configurations
const ADMIN_CONFIGS = {
  'yamikanitambala@gmail.com': {
    name: 'Yamikani Tambala',
    title: 'CEO',
    phone: '+265882367459',
  },
  'yankhojchigaru@gmail.com': {
    name: 'Yankho Chigaru',
    title: 'Managing Director',
    phone: '+265882147485',
  }
}

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [adminInfo, setAdminInfo] = useState<any>(null)
  const [stats, setStats] = useState({
    totalClients: 0,
    activeProjects: 0,
    pendingProjects: 0,
    completedProjects: 0,
    revenue: 0,
  })
  const [recentProjects, setRecentProjects] = useState<any[]>([])
  const [recentClients, setRecentClients] = useState<any[]>([])

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    try {
      // Check session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/auth/login')
        return
      }

      const userEmail = session.user.email?.toLowerCase() || ''
      
      // Check if admin
      if (!ADMIN_EMAILS.includes(userEmail)) {
        router.push('/client/dashboard')
        return
      }

      // Set admin info
      const config = ADMIN_CONFIGS[userEmail as keyof typeof ADMIN_CONFIGS]
      if (config) {
        setAdminInfo({
          ...config,
          email: userEmail,
        })
      }

      // Load dashboard data
      await loadDashboardData()
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDashboardData = async () => {
    try {
      // Load clients
      const { data: clients } = await supabase
        .from('users')
        .select('*')
        .neq('role', 'admin')
        .order('created_at', { ascending: false })

      // Load projects
      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      // Calculate stats
      const totalClients = clients?.length || 0
      const activeProjects = projects?.filter(p => p.status === 'in-progress').length || 0
      const pendingProjects = projects?.filter(p => p.status === 'pending').length || 0
      const completedProjects = projects?.filter(p => p.status === 'completed' || p.status === 'delivered').length || 0
      const revenue = projects?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0

      setStats({ totalClients, activeProjects, pendingProjects, completedProjects, revenue })
      setRecentProjects(projects?.slice(0, 5) || [])
      setRecentClients(clients?.slice(0, 5) || [])
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const statusColors: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'review': 'bg-purple-100 text-purple-800',
    'completed': 'bg-green-100 text-green-800',
    'delivered': 'bg-emerald-100 text-emerald-800',
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!adminInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Admin info not found</h2>
          <button 
            onClick={() => router.push('/auth/login')}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-5 w-5 text-orange-300" />
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
              </div>
              <div className="text-xs text-gray-300">
                {adminInfo.name} • {adminInfo.email}
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors text-sm"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-medium">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-medium">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded">
                <FolderKanban className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-medium">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingProjects}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-medium">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedProjects}</p>
              </div>
              <div className="p-2 bg-green-100 rounded">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-medium">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">MK{stats.revenue.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-emerald-100 rounded">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Projects */}
          <div className="bg-white rounded-lg shadow border overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FolderKanban className="h-4 w-4 text-orange-600" />
                  <h2 className="font-bold text-gray-900">Recent Projects</h2>
                </div>
                <button className="text-orange-600 hover:text-orange-700 text-xs font-medium">
                  View All →
                </button>
              </div>
            </div>

            <div className="divide-y">
              {recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <div key={project.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{project.title}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 rounded text-xs ${statusColors[project.status]}`}>
                            {project.status.replace('-', ' ')}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(project.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button className="p-1 text-gray-400 hover:text-orange-600">
                          <Eye className="h-3 w-3" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <MessageSquare className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center">
                  <FolderKanban className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No projects yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Clients */}
          <div className="bg-white rounded-lg shadow border overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-orange-600" />
                  <h2 className="font-bold text-gray-900">Recent Clients</h2>
                </div>
                <button className="text-orange-600 hover:text-orange-700 text-xs font-medium">
                  View All →
                </button>
              </div>
            </div>

            <div className="divide-y">
              {recentClients.length > 0 ? (
                recentClients.map((client) => (
                  <div key={client.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{client.name}</h3>
                        <p className="text-xs text-gray-600">{client.company || 'No company'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{client.email}</span>
                        </div>
                      </div>
                      <button className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200">
                        View
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center">
                  <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No clients yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-lg shadow border p-4">
          <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <button className="p-3 border rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Add Client</p>
                  <p className="text-xs text-gray-600">Register new client</p>
                </div>
              </div>
            </button>

            <button className="p-3 border rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded">
                  <FolderKanban className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Create Project</p>
                  <p className="text-xs text-gray-600">Start new project</p>
                </div>
              </div>
            </button>

            <button className="p-3 border rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">View Reports</p>
                  <p className="text-xs text-gray-600">Analytics & insights</p>
                </div>
              </div>
            </button>

            <button className="p-3 border rounded-lg hover:border-gray-500 hover:bg-gray-50 transition-all text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded">
                  <Mail className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Send Email</p>
                  <p className="text-xs text-gray-600">Communicate with clients</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}