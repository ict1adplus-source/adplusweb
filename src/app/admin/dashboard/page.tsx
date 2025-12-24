'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdmin } from '@/contexts/AdminContext'
import { BarChart3, Users, FolderKanban, CreditCard, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface Project {
  id: number
  name: string
  client: string
  status: 'in-progress' | 'completed' | 'review' | 'pending'
  dueDate: string
}

interface StatCard {
  title: string
  value: string | number
  change: string
  icon: any
  color: string
  description: string
}

export default function AdminDashboardPage() {
  const { admin, loading } = useAdmin()
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalClients: 0,
    pendingTasks: 0,
    totalRevenue: 0,
    completionRate: 0
  })
  const [recentProjects, setRecentProjects] = useState<Project[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    console.log('Dashboard: Admin context:', { admin, loading })
    
    if (!loading && admin) {
      fetchDashboardData()
    }
  }, [admin, loading])

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...')
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setStats({
        totalProjects: 24,
        activeProjects: 8,
        totalClients: 18,
        pendingTasks: 12,
        totalRevenue: 45231,
        completionRate: 92
      })
      
      setRecentProjects([
        { id: 1, name: 'E-commerce Platform', client: 'TechCorp', status: 'in-progress', dueDate: '2024-12-15' },
        { id: 2, name: 'Mobile App Redesign', client: 'StartupXYZ', status: 'completed', dueDate: '2024-11-30' },
        { id: 3, name: 'Brand Identity', client: 'FreshBrand', status: 'review', dueDate: '2024-12-20' },
        { id: 4, name: 'Website Migration', client: 'LegacyCorp', status: 'pending', dueDate: '2025-01-10' },
      ])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  const statCards: StatCard[] = [
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      change: '+12%',
      icon: FolderKanban,
      color: 'bg-blue-500',
      description: 'Across all clients'
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      change: '+3%',
      icon: Clock,
      color: 'bg-green-500',
      description: 'Currently in progress'
    },
    {
      title: 'Total Clients',
      value: stats.totalClients,
      change: '+5%',
      icon: Users,
      color: 'bg-purple-500',
      description: 'Registered users'
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: '+20.1%',
      icon: CreditCard,
      color: 'bg-orange-500',
      description: 'Year to date'
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-500" />
      case 'review': return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'review': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // If not admin, show access denied
  if (!admin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need to be logged in as an admin to access this page.</p>
          <a 
            href="/admin/login" 
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  // Show data loading
  if (dataLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {admin?.email}! Here's an overview of your platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(project.status)}
                    <div>
                      <h4 className="font-medium">{project.name}</h4>
                      <p className="text-sm text-gray-600">Client: {project.client}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Due: {project.dueDate}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                      {project.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FolderKanban className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Projects Completion Rate</p>
                    <p className="text-sm text-gray-600">Average across all projects</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{stats.completionRate}%</p>
                  <p className="text-sm text-green-600">+3% from last month</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">Pending Tasks</p>
                    <p className="text-sm text-gray-600">Requiring attention</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{stats.pendingTasks}</p>
                  <p className="text-sm text-red-600">-2 from yesterday</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">New Clients This Month</p>
                    <p className="text-sm text-gray-600">Recently registered</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-green-600">+50% from last month</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}