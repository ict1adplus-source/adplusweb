'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import { useAdmin } from '@/contexts/AdminContext'
import { 
  Search, Filter, Eye, Edit, Trash2, Plus, 
  UserCheck, UserPlus, Download, Calendar, 
  DollarSign, Clock, CheckCircle, AlertCircle,
  FolderKanban, RefreshCw, FileText, Users
} from 'lucide-react'

interface Project {
  id: string
  title: string
  description: string
  client_name: string
  client_email: string
  client_company?: string
  service_type: string
  category: string
  status: 'pending' | 'in-progress' | 'review' | 'completed' | 'delivered' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  budget: number | null
  deadline: string | null
  created_at: string
  updated_at: string
  client_id: string
}

export default function AdminProjectsPage() {
  const router = useRouter()
  const { admin } = useAdmin()
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    totalRevenue: 0
  })

  useEffect(() => {
    if (admin) {
      fetchProjects()
    }
  }, [admin])

  useEffect(() => {
    filterProjects()
    calculateStats()
  }, [searchTerm, filter, projects])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Check if supabase is initialized
      if (!supabase) {
        setError('Database connection not available')
        setProjects(getMockProjects())
        return
      }

      // Fetch projects from Supabase
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (fetchError) {
        console.error('Error fetching projects:', fetchError)
        setError(fetchError.message)
        // For demo, show sample data
        setProjects(getMockProjects())
        return
      }

      setProjects((data || []) as Project[])
    } catch (error: any) {
      console.error('Error fetching projects:', error)
      setError(error.message)
      // For demo, show sample data
      setProjects(getMockProjects())
    } finally {
      setLoading(false)
    }
  }

  const filterProjects = () => {
    let filtered = projects

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(project => project.status === filter)
    }

    setFilteredProjects(filtered)
  }

  const calculateStats = () => {
    const total = projects.length
    const pending = projects.filter(p => p.status === 'pending').length
    const inProgress = projects.filter(p => p.status === 'in-progress').length
    const completed = projects.filter(p => p.status === 'completed' || p.status === 'delivered').length
    const totalRevenue = projects.reduce((sum, p) => sum + (p.budget || 0), 0)

    setStats({ total, pending, inProgress, completed, totalRevenue })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'review': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800'
      case 'medium': return 'bg-blue-100 text-blue-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'urgent': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'in-progress': return <RefreshCw className="h-4 w-4 text-blue-500" />
      case 'review': return <AlertCircle className="h-4 w-4 text-purple-500" />
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'delivered': return <CheckCircle className="h-4 w-4 text-emerald-500" />
      default: return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleExportProjects = () => {
    // Implement export functionality
    alert('Export functionality coming soon!')
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return
    
    try {
      if (!supabase) {
        alert('Database connection not available')
        return
      }

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) throw error
      
      // Remove from local state
      setProjects(prev => prev.filter(p => p.id !== projectId))
      alert('Project deleted successfully!')
    } catch (error: any) {
      console.error('Error deleting project:', error)
      alert('Failed to delete project: ' + error.message)
    }
  }

  const handleRetry = () => {
    fetchProjects()
  }

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects Management</h1>
          <p className="text-gray-600 mt-2">
            Manage all projects across the platform
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportProjects}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <Link href="/admin/projects/create">
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:opacity-90">
              <Plus className="h-4 w-4" />
              Create Project
            </button>
          </Link>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Error loading projects</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FolderKanban className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
            </div>
            <RefreshCw className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">MK{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects by name, client, email, or description..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button
              onClick={() => {
                setSearchTerm('')
                setFilter('all')
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Project</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Client</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Status</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Budget</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Deadline</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Created</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  {/* Project Column */}
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-medium text-gray-900">{project.title}</div>
                      <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {project.description || 'No description'}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                          {project.service_type?.replace('-', ' ') || project.category?.replace('-', ' ') || 'General'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(project.priority)}`}>
                          {project.priority}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Client Column */}
                  <td className="py-4 px-6">
                    <div className="font-medium">{project.client_name}</div>
                    <div className="text-sm text-gray-500">{project.client_email}</div>
                    {project.client_company && (
                      <div className="text-xs text-gray-500 mt-1">{project.client_company}</div>
                    )}
                  </td>

                  {/* Status Column */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(project.status)}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status.replace('-', ' ')}
                      </span>
                    </div>
                  </td>

                  {/* Budget Column */}
                  <td className="py-4 px-6">
                    {project.budget ? (
                      <div className="font-medium">
                        MK{project.budget.toLocaleString()}
                      </div>
                    ) : (
                      <div className="text-gray-400">Not set</div>
                    )}
                  </td>

                  {/* Deadline Column */}
                  <td className="py-4 px-6">
                    {project.deadline ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{formatDate(project.deadline)}</span>
                      </div>
                    ) : (
                      <div className="text-gray-400">Not set</div>
                    )}
                  </td>

                  {/* Created Column */}
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-600">
                      {formatDate(project.created_at)}
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/projects/${project.id}`}>
                        <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Eye className="h-4 w-4" />
                        </button>
                      </Link>
                      <Link href={`/admin/projects/${project.id}/edit`}>
                        <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg">
                          <Edit className="h-4 w-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              {searchTerm ? 'No projects match your search' : 'No projects found'}
            </div>
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 text-sm text-orange-600 hover:text-orange-800"
              >
                Clear search
              </button>
            ) : (
              <Link href="/admin/projects/create">
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:opacity-90">
                  <Plus className="h-4 w-4" />
                  Create Your First Project
                </button>
              </Link>
            )}
          </div>
        )}

        {/* Pagination */}
        {filteredProjects.length > 0 && (
          <div className="border-t px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {filteredProjects.length} of {projects.length} projects
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-50">Previous</button>
                <button className="px-3 py-1 bg-orange-500 text-white rounded-lg text-sm">1</button>
                <button className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-50">2</button>
                <button className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-50">Next</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function for mock data (remove when using real Supabase)
function getMockProjects(): Project[] {
  return [
    {
      id: '1',
      title: 'E-commerce Website Development',
      description: 'Full-stack e-commerce platform with payment integration',
      client_name: 'John Doe',
      client_email: 'john@example.com',
      client_company: 'TechCorp Inc.',
      service_type: 'website-development',
      category: 'web-design',
      status: 'in-progress',
      priority: 'high',
      budget: 50000,
      deadline: '2024-12-31',
      created_at: '2024-11-15T10:30:00Z',
      updated_at: '2024-11-15T10:30:00Z',
      client_id: 'user_123'
    },
    {
      id: '2',
      title: 'Mobile App Redesign',
      description: 'UI/UX redesign of existing mobile application',
      client_name: 'Jane Smith',
      client_email: 'jane@example.com',
      service_type: 'mobile-app',
      category: 'web-design',
      status: 'completed',
      priority: 'medium',
      budget: 30000,
      deadline: '2024-11-30',
      created_at: '2024-10-20T14:45:00Z',
      updated_at: '2024-11-30T09:15:00Z',
      client_id: 'user_456'
    },
    {
      id: '3',
      title: 'Brand Identity Design',
      description: 'Complete brand identity including logo, colors, and guidelines',
      client_name: 'Bob Wilson',
      client_email: 'bob@example.com',
      client_company: 'FreshBrand',
      service_type: 'brand-identity',
      category: 'branding',
      status: 'pending',
      priority: 'medium',
      budget: 15000,
      deadline: '2025-01-15',
      created_at: '2024-12-01T08:20:00Z',
      updated_at: '2024-12-01T08:20:00Z',
      client_id: 'user_789'
    },
    {
      id: '4',
      title: 'SEO Optimization',
      description: 'Search engine optimization for corporate website',
      client_name: 'Alice Johnson',
      client_email: 'alice@example.com',
      service_type: 'seo-optimization',
      category: 'digital-marketing',
      status: 'in-progress',
      priority: 'low',
      budget: 8000,
      deadline: '2025-02-28',
      created_at: '2024-11-10T11:10:00Z',
      updated_at: '2024-11-25T16:30:00Z',
      client_id: 'user_101'
    }
  ]
}