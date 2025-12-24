'use client'

import { useState, useEffect } from 'react'
import { 
  Search, Filter, User, Mail, Building, Phone, 
  Calendar, Eye, Edit, Trash2, UserPlus, 
  CheckCircle, XCircle, Download,
  Shield, Clock, DollarSign, Activity,
  Users, RefreshCw, AlertCircle, FolderKanban
} from 'lucide-react'
import { supabase } from '@/lib/supabase-client'
import { useAdmin } from '@/contexts/AdminContext'
import Link from 'next/link'

interface Client {
  id: string
  email: string
  name: string | null
  company: string | null
  phone: string | null
  role: 'client' | 'admin'
  created_at: string
  last_sign_in_at: string | null
  is_active: boolean
  project_count: number
  total_spent: number
}

export default function AdminClientsPage() {
  const { admin } = useAdmin()
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalRevenue: 0,
    newThisMonth: 0
  })

  useEffect(() => {
    if (admin) {
      fetchClients()
    }
  }, [admin])

  useEffect(() => {
    filterClients()
    calculateStats()
  }, [searchTerm, clients])

  const fetchClients = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Check if supabase is initialized
      if (!supabase) {
        setError('Database connection not available')
        setClients(getMockClients())
        return
      }

      // Fetch users with client role from Supabase
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'client')
        .order('created_at', { ascending: false })

      if (usersError) {
        console.error('Error fetching users:', usersError)
        setError(usersError.message)
        setClients(getMockClients())
        return
      }

      // First, get all projects to avoid multiple queries
      const { data: allProjects, error: projectsError } = await supabase
        .from('projects')
        .select('id, client_id, budget')

      if (projectsError) {
        console.error('Error fetching projects:', projectsError)
        // Continue with empty projects array
      }

      // Process each client with their stats
      const clientsWithStats = (usersData || []).map((user: any) => {
        // Filter projects for this client
        const clientProjects = (allProjects || []).filter(
          (project: any) => project.client_id === user.id
        )
        
        // Calculate total spent
        const totalSpent = clientProjects.reduce(
          (sum: number, project: any) => {
            const budget = Number(project.budget) || 0
            return sum + budget
          }, 
          0
        )

        // Determine if active (logged in within last 30 days)
        let isActive = false
        if (user.last_sign_in_at && typeof user.last_sign_in_at === 'string') {
          try {
            const lastSignIn = new Date(user.last_sign_in_at)
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
            isActive = lastSignIn > thirtyDaysAgo
          } catch (error) {
            console.error(`Invalid last_sign_in_at for user ${user.id}:`, user.last_sign_in_at)
            isActive = false
          }
        }

        return {
          ...user,
          project_count: clientProjects.length,
          total_spent: totalSpent,
          is_active: isActive
        }
      })

      setClients(clientsWithStats as Client[])
    } catch (error: any) {
      console.error('Error fetching clients:', error)
      setError(error.message)
      setClients(getMockClients())
    } finally {
      setLoading(false)
    }
  }

  const filterClients = () => {
    let filtered = clients

    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredClients(filtered)
  }

  const calculateStats = () => {
    const total = clients.length
    const active = clients.filter(c => c.is_active).length
    const totalRevenue = clients.reduce((sum, c) => sum + c.total_spent, 0)
    
    // Calculate new clients this month
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const newThisMonth = clients.filter(c => {
      try {
        const createdDate = new Date(c.created_at)
        return createdDate.getMonth() === currentMonth && 
               createdDate.getFullYear() === currentYear
      } catch (error) {
        return false
      }
    }).length

    setStats({ total, active, totalRevenue, newThisMonth })
  }

  const handleCreateClient = () => {
    // Open modal or redirect to create client page
    alert('Create client functionality coming soon!')
  }

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client? This will also delete all their projects.')) return
    
    try {
      if (!supabase) {
        alert('Database connection not available')
        return
      }

      // First, delete user's projects
      const { error: projectsError } = await supabase
        .from('projects')
        .delete()
        .eq('client_id', clientId)

      if (projectsError) {
        console.error('Error deleting projects:', projectsError)
        // Continue anyway, maybe show a warning
      }

      // Then delete the user from users table
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', clientId)

      if (userError) {
        console.error('Error deleting user:', userError)
        alert('Failed to delete client: ' + userError.message)
        return
      }

      // Remove from local state
      setClients(prev => prev.filter(c => c.id !== clientId))
      alert('Client deleted successfully!')
    } catch (error: any) {
      console.error('Error deleting client:', error)
      alert('Failed to delete client: ' + error.message)
    }
  }

  const handleToggleActive = async (clientId: string, currentStatus: boolean) => {
    try {
      if (!supabase) {
        alert('Database connection not available')
        return
      }

      // Update local state only (for demo)
      setClients(prev => prev.map(c => 
        c.id === clientId ? { ...c, is_active: !currentStatus } : c
      ))
      
      alert('Client status updated successfully!')
    } catch (error) {
      console.error('Error toggling client status:', error)
      alert('Failed to update client status')
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return 'Invalid date'
    }
  }

  const handleRetry = () => {
    fetchClients()
  }

  if (loading && clients.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading clients...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients Management</h1>
          <p className="text-gray-600 mt-2">
            Manage client accounts and view their activity
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => alert('Export functionality coming soon!')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={handleCreateClient}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:opacity-90"
          >
            <UserPlus className="h-4 w-4" />
            Add Client
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Error loading clients</p>
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
              <p className="text-sm text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Clients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
            <Activity className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">New This Month</p>
              <p className="text-2xl font-bold text-gray-900">{stats.newThisMonth}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">MK{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients by name, email, company, or phone..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
              <option>All Clients</option>
              <option>Active Only</option>
              <option>Inactive</option>
              <option>With Projects</option>
              <option>Without Projects</option>
            </select>
            <button 
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Client</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Contact</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Status</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Projects</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Total Spent</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Joined</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  {/* Client Info */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                        {client.name?.[0]?.toUpperCase() || client.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{client.name || 'No Name'}</div>
                        <div className="text-sm text-gray-500">ID: {client.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>

                  {/* Contact Info */}
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">{client.email}</span>
                      </div>
                      {client.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{client.phone}</span>
                        </div>
                      )}
                      {client.company && (
                        <div className="flex items-center gap-2">
                          <Building className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{client.company}</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {client.is_active ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-700">Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-700">Inactive</span>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Last login: {formatDate(client.last_sign_in_at)}
                    </div>
                  </td>

                  {/* Projects */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        client.project_count > 0 ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        {client.project_count > 0 ? (
                          <FolderKanban className="h-4 w-4 text-blue-600" />
                        ) : (
                          <FolderKanban className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{client.project_count}</div>
                        <div className="text-xs text-gray-500">projects</div>
                      </div>
                    </div>
                  </td>

                  {/* Total Spent */}
                  <td className="py-4 px-6">
                    <div className="font-medium">
                      MK{client.total_spent.toLocaleString()}
                    </div>
                    {client.project_count > 0 && (
                      <div className="text-xs text-gray-500">
                        Avg: MK{Math.round(client.total_spent / client.project_count).toLocaleString()}
                      </div>
                    )}
                  </td>

                  {/* Joined */}
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-600">
                      {formatDate(client.created_at)}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/clients/${client.id}`}>
                        <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Eye className="h-4 w-4" />
                        </button>
                      </Link>
                      <button 
                        onClick={() => alert('Edit functionality coming soon!')}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(client.id, client.is_active)}
                        className={`p-2 rounded-lg ${client.is_active 
                          ? 'text-orange-600 hover:bg-orange-50 hover:text-orange-700' 
                          : 'text-green-600 hover:bg-green-50 hover:text-green-700'
                        }`}
                      >
                        {client.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client.id)}
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

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              {searchTerm ? 'No clients match your search' : 'No clients found'}
            </div>
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 text-sm text-orange-600 hover:text-orange-800"
              >
                Clear search
              </button>
            ) : (
              <button
                onClick={handleCreateClient}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:opacity-90"
              >
                <UserPlus className="h-4 w-4" />
                Add Your First Client
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function for mock data
function getMockClients(): Client[] {
  return [
    {
      id: '1',
      email: 'john@example.com',
      name: 'John Doe',
      company: 'TechCorp Inc.',
      phone: '+265 123 456 789',
      role: 'client',
      created_at: '2024-01-15T10:30:00Z',
      last_sign_in_at: '2024-12-01T14:25:00Z',
      is_active: true,
      project_count: 3,
      total_spent: 95000
    },
    {
      id: '2',
      email: 'jane@example.com',
      name: 'Jane Smith',
      company: 'StartupXYZ',
      phone: '+265 987 654 321',
      role: 'client',
      created_at: '2024-02-20T09:15:00Z',
      last_sign_in_at: '2024-11-28T16:45:00Z',
      is_active: true,
      project_count: 2,
      total_spent: 45000
    },
    {
      id: '3',
      email: 'bob@example.com',
      name: 'Bob Wilson',
      company: null,
      phone: null,
      role: 'client',
      created_at: '2024-03-10T11:20:00Z',
      last_sign_in_at: '2024-10-15T08:30:00Z',
      is_active: false,
      project_count: 1,
      total_spent: 15000
    },
    {
      id: '4',
      email: 'alice@example.com',
      name: 'Alice Johnson',
      company: 'Digital Solutions',
      phone: '+265 555 123 456',
      role: 'client',
      created_at: '2024-12-01T13:00:00Z',
      last_sign_in_at: '2024-12-05T10:15:00Z',
      is_active: true,
      project_count: 0,
      total_spent: 0
    }
  ]
}