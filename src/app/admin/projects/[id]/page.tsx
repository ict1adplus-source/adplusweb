'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, DollarSign, User, Mail, Phone, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AdminProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails()
    }
  }, [projectId])

  const fetchProjectDetails = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockProject = {
        id: projectId,
        name: 'E-commerce Website',
        description: 'Full-featured e-commerce platform with admin dashboard, payment integration, and inventory management.',
        client: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1 (555) 123-4567',
          company: 'Tech Solutions Inc.'
        },
        status: 'active',
        createdBy: 'admin', // or 'client'
        createdAt: '2024-11-15',
        deadline: '2024-12-31',
        budget: 5000,
        paidAmount: 2500,
        tasks: [
          { id: 1, name: 'Design Mockups', status: 'completed' },
          { id: 2, name: 'Frontend Development', status: 'in-progress' },
          { id: 3, name: 'Backend API', status: 'pending' },
          { id: 4, name: 'Payment Integration', status: 'pending' },
          { id: 5, name: 'Testing & Deployment', status: 'pending' },
        ],
        files: [
          { name: 'Project Brief.pdf', size: '2.4 MB', uploaded: '2024-11-16' },
          { name: 'Wireframes.sketch', size: '5.1 MB', uploaded: '2024-11-18' },
          { name: 'Contract.docx', size: '1.2 MB', uploaded: '2024-11-15' },
        ],
        notes: [
          { date: '2024-11-20', text: 'Client approved initial designs. Moving to development phase.' },
          { date: '2024-11-25', text: 'Frontend development is 70% complete. Need to discuss payment schedule.' },
        ]
      }
      
      setProject(mockProject)
    } catch (error) {
      console.error('Error fetching project details:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-500" />
      default: return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Project not found</h2>
        <Link href="/admin/projects">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600 mt-2">Project ID: {project.id}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Edit Project</Button>
          <Button className="bg-orange-500 hover:bg-orange-600">Update Status</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Details */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Project Details</h2>
            <p className="text-gray-600 mb-6">{project.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Timeline</span>
                  </div>
                  <p>Created: {new Date(project.createdAt).toLocaleDateString()}</p>
                  <p>Deadline: {new Date(project.deadline).toLocaleDateString()}</p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-medium">Budget & Payments</span>
                  </div>
                  <p>Total Budget: ${project.budget}</p>
                  <p>Paid: ${project.paidAmount}</p>
                  <p>Remaining: ${project.budget - project.paidAmount}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <User className="h-4 w-4" />
                  <span className="font-medium">Created By</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="capitalize font-medium mb-1">{project.createdBy}</p>
                  <p className="text-sm text-gray-600">
                    This project was {project.createdBy === 'admin' ? 'created by you' : 'submitted by the client'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Project Tasks</h2>
            <div className="space-y-3">
              {project.tasks.map((task: any) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(task.status)}
                    <span>{task.name}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                    task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {task.status.replace('-', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Client Info */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Client Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">{project.client.name}</p>
                  <p className="text-sm text-gray-600">{project.client.company}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <a href={`mailto:${project.client.email}`} className="text-orange-600 hover:underline">
                  {project.client.email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <a href={`tel:${project.client.phone}`} className="text-gray-700">
                  {project.client.phone}
                </a>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t">
              <Button className="w-full" variant="outline">
                Contact Client
              </Button>
            </div>
          </div>

          {/* Files */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Project Files</h2>
            <div className="space-y-3">
              {project.files.map((file: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.size} • {file.uploaded}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Project Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Current Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  project.status === 'active' ? 'bg-green-100 text-green-800' :
                  project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Progress</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <p className="text-right text-sm text-gray-600 mt-1">65% complete</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}