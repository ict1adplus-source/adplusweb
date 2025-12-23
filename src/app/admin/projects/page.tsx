'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Filter, Eye, Edit, Trash2, Plus, UserCheck, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Project {
  id: number
  name: string
  clientName: string
  clientEmail: string
  status: 'draft' | 'active' | 'completed' | 'archived'
  createdBy: 'admin' | 'client'
  createdAt: string
  deadline: string
  budget: number
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    filterProjects()
  }, [searchTerm, filter, projects])

  const fetchProjects = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockProjects: Project[] = [
        {
          id: 1,
          name: 'E-commerce Website',
          clientName: 'John Doe',
          clientEmail: 'john@example.com',
          status: 'active',
          createdBy: 'admin',
          createdAt: '2024-11-15',
          deadline: '2024-12-31',
          budget: 5000
        },
        {
          id: 2,
          name: 'Mobile App Development',
          clientName: 'Jane Smith',
          clientEmail: 'jane@example.com',
          status: 'completed',
          createdBy: 'client',
          createdAt: '2024-10-20',
          deadline: '2024-11-30',
          budget: 15000
        },
        {
          id: 3,
          name: 'Brand Identity Design',
          clientName: 'Bob Wilson',
          clientEmail: 'bob@example.com',
          status: 'draft',
          createdBy: 'admin',
          createdAt: '2024-12-01',
          deadline: '2025-01-15',
          budget: 3000
        },
        {
          id: 4,
          name: 'SEO Optimization',
          clientName: 'Alice Johnson',
          clientEmail: 'alice@example.com',
          status: 'active',
          createdBy: 'client',
          createdAt: '2024-11-10',
          deadline: '2025-02-28',
          budget: 2000
        },
        {
          id: 5,
          name: 'Social Media Campaign',
          clientName: 'Charlie Brown',
          clientEmail: 'charlie@example.com',
          status: 'archived',
          createdBy: 'admin',
          createdAt: '2024-09-05',
          deadline: '2024-10-31',
          budget: 4000
        },
      ]
      
      setProjects(mockProjects)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterProjects = () => {
    let filtered = projects

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.clientEmail.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(project => project.status === filter)
    }

    setFilteredProjects(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCreatedByIcon = (createdBy: string) => {
    return createdBy === 'admin' 
      ? <UserCheck className="h-4 w-4 text-blue-600" />
      : <UserPlus className="h-4 w-4 text-green-600" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-2">
            Manage all projects - both created by admin and submitted by clients
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/projects/create">
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg border">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects by name, client name, or email..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Project Name</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Client</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Created By</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Budget</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Deadline</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">{project.name}</div>
                    <div className="text-sm text-gray-500">
                      Created: {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium">{project.clientName}</div>
                    <div className="text-sm text-gray-500">{project.clientEmail}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {getCreatedByIcon(project.createdBy)}
                      <span className="capitalize">{project.createdBy}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-medium">
                    ${project.budget.toLocaleString()}
                  </td>
                  <td className="py-4 px-6">
                    {new Date(project.deadline).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/projects/${project.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">No projects found</div>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Clear search
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}