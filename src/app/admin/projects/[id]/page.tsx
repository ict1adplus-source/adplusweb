'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, ADMIN_EMAILS } from '@/contexts/AuthContext'
import {
  ArrowLeft,
  Clock,
  DollarSign,
  Calendar,
  User,
  Building,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Download,
  Edit,
  Save,
  X,
  Paperclip,
  Send
} from 'lucide-react'

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'review', label: 'Review', color: 'bg-purple-100 text-purple-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-emerald-100 text-emerald-800' },
]

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
]

export default function AdminProjectView() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProject, setEditedProject] = useState<any>({})

  useEffect(() => {
    loadProjectData()
  }, [params.id])

  const loadProjectData = async () => {
    try {
      // Check if admin
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || !ADMIN_EMAILS.includes(session.user.email?.toLowerCase() || '')) {
        router.push('/auth/login')
        return
      }

      // Load project using existing 'projects' table
      const { data: projectData } = await supabase
        .from('projects')
        .select(`
          *,
          client:users(*)
        `)
        .eq('id', params.id)
        .single()

      // Load messages using existing 'messages' table
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('project_id', params.id)
        .order('created_at', { ascending: true })

      setProject(projectData)
      setEditedProject(projectData)
      setMessages(messagesData || [])
    } catch (error) {
      console.error('Error loading project:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    const { error } = await supabase
      .from('projects')
      .update({ status: newStatus })
      .eq('id', params.id)

    if (!error) {
      setProject({ ...project, status: newStatus })
      setEditedProject({ ...editedProject, status: newStatus })
    }
  }

  const handlePriorityChange = async (newPriority: string) => {
    const { error } = await supabase
      .from('projects')
      .update({ priority: newPriority })
      .eq('id', params.id)

    if (!error) {
      setProject({ ...project, priority: newPriority })
      setEditedProject({ ...editedProject, priority: newPriority })
    }
  }

  const handleSaveChanges = async () => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          title: editedProject.title,
          description: editedProject.description,
          requirements: editedProject.requirements,
          budget: editedProject.budget,
          deadline: editedProject.deadline,
        })
        .eq('id', params.id)

      if (error) throw error

      setProject(editedProject)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating project:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sendingMessage) return

    setSendingMessage(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()

      const { data: message, error } = await supabase
        .from('messages')  // Using existing 'messages' table
        .insert({
          project_id: params.id,
          sender_id: session?.user.id,
          sender_role: 'admin',
          message: newMessage,
        })
        .select()
        .single()

      if (!error) {
        setMessages([...messages, message])
        setNewMessage('')
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSendingMessage(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Project not found</h2>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProject.title}
                    onChange={(e) => setEditedProject({...editedProject, title: e.target.value})}
                    className="text-2xl font-bold border-b border-gray-300 focus:border-primary focus:outline-none"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                )}
                <p className="text-gray-600">Project ID: {project.id.substring(0, 8)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={project.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-3 py-1 border rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: statusOptions.find(s => s.value === project.status)?.color.split(' ')[0],
                  color: statusOptions.find(s => s.value === project.status)?.color.split(' ')[1]
                }}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={project.priority}
                onChange={(e) => handlePriorityChange(e.target.value)}
                className="px-3 py-1 border rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: priorityOptions.find(p => p.value === project.priority)?.color.split(' ')[0],
                  color: priorityOptions.find(p => p.value === project.priority)?.color.split(' ')[1]
                }}
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Project Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Info */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Project Details</h2>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSaveChanges}
                        className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        <Save className="h-4 w-4" />
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false)
                          setEditedProject(project)
                        }}
                        className="flex items-center gap-2 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-3 py-1 bg-primary text-white rounded hover:bg-opacity-90"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                  {isEditing ? (
                    <textarea
                      value={editedProject.description}
                      onChange={(e) => setEditedProject({...editedProject, description: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  ) : (
                    <p className="text-gray-600 whitespace-pre-line">{project.description}</p>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Requirements</h3>
                  {isEditing ? (
                    <textarea
                      value={editedProject.requirements}
                      onChange={(e) => setEditedProject({...editedProject, requirements: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  ) : (
                    <p className="text-gray-600 whitespace-pre-line">{project.requirements || 'No specific requirements provided.'}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Deadline</p>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editedProject.deadline?.split('T')[0] || ''}
                          onChange={(e) => setEditedProject({...editedProject, deadline: e.target.value})}
                          className="text-sm border rounded px-2 py-1"
                        />
                      ) : (
                        <p className="font-semibold">
                          {project.deadline 
                            ? new Date(project.deadline).toLocaleDateString()
                            : 'Flexible'
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <DollarSign className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Budget</p>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedProject.budget || ''}
                          onChange={(e) => setEditedProject({...editedProject, budget: parseFloat(e.target.value) || 0})}
                          className="text-sm border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        <p className="font-semibold">
                          {project.budget 
                            ? `MK${project.budget.toLocaleString()}`
                            : 'Not specified'
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Service Type</p>
                      <p className="font-semibold">{project.service_type?.replace('-', ' ') || 'General'}</p>
                    </div>
                  </div>
                </div>

                {/* Attachments */}
                {project.attachments && project.attachments.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3">Attachments</h3>
                    <div className="space-y-2">
                      {project.attachments.map((url: string, index: number) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded">
                              <Download className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="text-sm">Attachment {index + 1}</span>
                          </div>
                          <span className="text-xs text-gray-500">Click to download</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Communication</h2>
              
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto p-2">
                {messages.map((message) => (
                  <div key={message.id} className={`p-4 rounded-lg ${
                    message.sender_role === 'admin' 
                      ? 'bg-blue-50 border border-blue-100 ml-8' 
                      : 'bg-gray-50 border border-gray-100 mr-8'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-semibold text-sm">
                          {message.sender_role === 'admin' ? 'You' : project.client?.name || 'Client'}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          {new Date(message.created_at).toLocaleString()}
                        </span>
                      </div>
                      {message.sender_role === 'admin' && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">Admin</span>
                      )}
                    </div>
                    <p className="text-gray-700 whitespace-pre-line">{message.message}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary pr-20"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                    className="absolute right-2 bottom-2 flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    {sendingMessage ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Client Info */}
          <div className="space-y-8">
            {/* Client Info */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Client Information</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold">{project.client?.name || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded">
                    <Building className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Company</p>
                    <p className="font-semibold">{project.client?.company || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded">
                    <Mail className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{project.client?.email || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded">
                    <Phone className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold">{project.client?.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <button
                  onClick={() => window.location.href = `mailto:${project.client?.email}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90"
                >
                  <Mail className="h-4 w-4" />
                  Send Email to Client
                </button>
              </div>
            </div>

            {/* Project Timeline */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Project Timeline</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded mt-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Project Created</p>
                    <p className="text-xs text-gray-500">
                      {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded mt-1">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Status Updated</p>
                    <p className="text-xs text-gray-500">
                      {project.status === 'pending' ? 'Awaiting review' : 
                       project.status === 'in-progress' ? 'Development started' :
                       project.status === 'review' ? 'Ready for review' :
                       project.status === 'completed' ? 'Completed' : 'Delivered'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded mt-1">
                    <MessageSquare className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Messages</p>
                    <p className="text-xs text-gray-500">
                      {messages.length} messages exchanged
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}