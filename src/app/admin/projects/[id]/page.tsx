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
  Send,
  Users,
  Target,
  CreditCard,
  TrendingUp,
  FileText,
  Share2,
  UserPlus,
  CheckSquare,
  Percent,
  FileBarChart
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

const paymentStatusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'partial', label: 'Partial', color: 'bg-blue-100 text-blue-800' },
  { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-800' },
  { value: 'overdue', label: 'Overdue', color: 'bg-red-100 text-red-800' },
]

export default function AdminProjectView() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [milestones, setMilestones] = useState<any[]>([])
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [availableMembers, setAvailableMembers] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [newMilestone, setNewMilestone] = useState({ title: '', description: '', due_date: '' })
  const [isEditing, setIsEditing] = useState(false)
  const [editedProject, setEditedProject] = useState<any>({})
  const [paymentData, setPaymentData] = useState({
    status: 'pending',
    amount_paid: 0,
    total_amount: 0,
    notes: '',
    payment_date: new Date().toISOString().split('T')[0]
  })
  const [sendingMessage, setSendingMessage] = useState(false)
  const [selectedMember, setSelectedMember] = useState('')

  useEffect(() => {
    loadProjectData()
  }, [params.id])

  const loadProjectData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || !ADMIN_EMAILS.includes(session.user.email?.toLowerCase() || '')) {
        router.push('/auth/login')
        return
      }

      // Load project
      const { data: projectData } = await supabase
        .from('projects')
        .select(`
          *,
          client:users(*),
          payments(*),
          project_team:project_team(
            user:users(*)
          )
        `)
        .eq('id', params.id)
        .single()

      // Load messages
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('project_id', params.id)
        .order('created_at', { ascending: true })

      // Load milestones
      const { data: milestonesData } = await supabase
        .from('milestones')
        .select('*')
        .eq('project_id', params.id)
        .order('order', { ascending: true })

      // Load all users for team assignment
      const { data: allUsers } = await supabase
        .from('users')
        .select('id, name, email, role')
        .eq('role', 'employee')
        .or('role.eq.admin,role.eq.staff')

      setProject(projectData)
      setEditedProject(projectData)
      setMessages(messagesData || [])
      setMilestones(milestonesData || [])
      setTeamMembers(projectData?.project_team?.map((pt: any) => pt.user) || [])
      setAvailableMembers(allUsers || [])

      // Set payment data if exists
      if (projectData?.payments?.[0]) {
        setPaymentData(projectData.payments[0])
      } else {
        setPaymentData(prev => ({
          ...prev,
          total_amount: projectData?.budget || 0
        }))
      }
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
      
      // Send notification to client
      if (newStatus === 'completed' || newStatus === 'delivered') {
        await sendNotificationToClient(`Project status updated to ${newStatus}`)
      }
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
        .from('messages')
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

  const handleAddMilestone = async () => {
    if (!newMilestone.title.trim()) return

    try {
      const { data: milestone, error } = await supabase
        .from('milestones')
        .insert({
          project_id: params.id,
          title: newMilestone.title,
          description: newMilestone.description,
          due_date: newMilestone.due_date,
          status: 'pending',
          order: milestones.length + 1
        })
        .select()
        .single()

      if (!error) {
        setMilestones([...milestones, milestone])
        setNewMilestone({ title: '', description: '', due_date: '' })
      }
    } catch (error) {
      console.error('Error adding milestone:', error)
    }
  }

  const handleUpdateMilestone = async (milestoneId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('milestones')
        .update(updates)
        .eq('id', milestoneId)

      if (!error) {
        setMilestones(milestones.map(m => 
          m.id === milestoneId ? { ...m, ...updates } : m
        ))
      }
    } catch (error) {
      console.error('Error updating milestone:', error)
    }
  }

  const handleAssignTeamMember = async () => {
    if (!selectedMember) return

    try {
      // Check if already assigned
      const isAlreadyAssigned = teamMembers.some(member => member.id === selectedMember)
      if (isAlreadyAssigned) return

      const { error } = await supabase
        .from('project_team')
        .insert({
          project_id: params.id,
          user_id: selectedMember,
          assigned_at: new Date().toISOString()
        })

      if (!error) {
        const assignedMember = availableMembers.find(m => m.id === selectedMember)
        setTeamMembers([...teamMembers, assignedMember])
        setSelectedMember('')
      }
    } catch (error) {
      console.error('Error assigning team member:', error)
    }
  }

  const handleRemoveTeamMember = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('project_team')
        .delete()
        .eq('project_id', params.id)
        .eq('user_id', userId)

      if (!error) {
        setTeamMembers(teamMembers.filter(member => member.id !== userId))
      }
    } catch (error) {
      console.error('Error removing team member:', error)
    }
  }

  const handleUpdatePayment = async () => {
    try {
      const { error } = await supabase
        .from('payments')
        .upsert({
          project_id: params.id,
          ...paymentData,
          updated_at: new Date().toISOString()
        })

      if (!error) {
        // Send payment update notification
        await sendNotificationToClient(`Payment status updated to ${paymentData.status}`)
        alert('Payment information updated successfully!')
      }
    } catch (error) {
      console.error('Error updating payment:', error)
    }
  }

  const handleShareProgress = async () => {
    const progressData = {
      project_title: project.title,
      milestones_completed: milestones.filter(m => m.status === 'completed').length,
      total_milestones: milestones.length,
      overall_progress: calculateOverallProgress(),
      next_milestone: milestones.find(m => m.status === 'pending'),
      payment_status: paymentData.status
    }

    // Here you would typically send an email or notification
    // For now, we'll create a shareable summary
    const summary = `
      Project: ${project.title}
      Overall Progress: ${calculateOverallProgress()}%
      Milestones: ${progressData.milestones_completed}/${progressData.total_milestones} completed
      Payment Status: ${paymentData.status}
      Next Milestone: ${progressData.next_milestone?.title || 'None'}
    `

    alert('Progress summary ready to share:\n\n' + summary)
    
    // Send notification to client
    await sendNotificationToClient('Project progress update shared')
  }

  const sendNotificationToClient = async (message: string) => {
    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: project.client_id,
          project_id: params.id,
          message: message,
          type: 'project_update',
          read: false
        })
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

  const calculateOverallProgress = () => {
    if (milestones.length === 0) return 0
    const completed = milestones.filter(m => m.status === 'completed').length
    return Math.round((completed / milestones.length) * 100)
  }

  const calculateRevenue = () => {
    // Calculate based on completed projects with paid status
    return paymentData.status === 'paid' ? paymentData.total_amount : 0
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
            <div className="flex items-center gap-4">
              <button
                onClick={handleShareProgress}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <Share2 className="h-4 w-4" />
                Share Progress
              </button>
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
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Project Details & Milestones */}
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
                    <Percent className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Progress</p>
                      <p className="font-semibold">{calculateOverallProgress()}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Milestones Management */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Milestones</h2>
              
              {/* Add New Milestone */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-3">Add New Milestone</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Milestone Title"
                    value={newMilestone.title}
                    onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={newMilestone.description}
                    onChange={(e) => setNewMilestone({...newMilestone, description: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <div className="flex gap-3">
                    <input
                      type="date"
                      value={newMilestone.due_date}
                      onChange={(e) => setNewMilestone({...newMilestone, due_date: e.target.value})}
                      className="flex-1 px-3 py-2 border rounded-lg"
                    />
                    <button
                      onClick={handleAddMilestone}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90"
                    >
                      Add Milestone
                    </button>
                  </div>
                </div>
              </div>

              {/* Milestones List */}
              <div className="space-y-4">
                {milestones.map((milestone) => (
                  <div key={milestone.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{milestone.title}</h4>
                        {milestone.description && (
                          <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                        )}
                      </div>
                      <select
                        value={milestone.status}
                        onChange={(e) => handleUpdateMilestone(milestone.id, { status: e.target.value })}
                        className="px-2 py-1 text-sm border rounded"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Due: {milestone.due_date ? new Date(milestone.due_date).toLocaleDateString() : 'No deadline'}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateMilestone(milestone.id, { 
                            status: milestone.status === 'completed' ? 'pending' : 'completed' 
                          })}
                          className={`px-2 py-1 rounded text-xs ${milestone.status === 'completed' ? 'bg-gray-100' : 'bg-green-100 text-green-800'}`}
                        >
                          {milestone.status === 'completed' ? 'Mark Pending' : 'Mark Complete'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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

          {/* Right Column - Team, Payments, Client Info */}
          <div className="space-y-8">
            {/* Team Assignment */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Team Members</h2>
              
              <div className="mb-4">
                <div className="flex gap-2">
                  <select
                    value={selectedMember}
                    onChange={(e) => setSelectedMember(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select team member</option>
                    {availableMembers
                      .filter(m => !teamMembers.some(tm => tm.id === m.id))
                      .map(member => (
                        <option key={member.id} value={member.id}>
                          {member.name} ({member.email})
                        </option>
                      ))
                    }
                  </select>
                  <button
                    onClick={handleAssignTeamMember}
                    disabled={!selectedMember}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
                  >
                    <UserPlus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {teamMembers.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.email}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveTeamMember(member.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Management */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={paymentData.status}
                    onChange={(e) => setPaymentData({...paymentData, status: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {paymentStatusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Amount
                    </label>
                    <input
                      type="number"
                      value={paymentData.total_amount}
                      onChange={(e) => setPaymentData({...paymentData, total_amount: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount Paid
                    </label>
                    <input
                      type="number"
                      value={paymentData.amount_paid}
                      onChange={(e) => setPaymentData({...paymentData, amount_paid: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={paymentData.payment_date}
                    onChange={(e) => setPaymentData({...paymentData, payment_date: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <button
                  onClick={handleUpdatePayment}
                  className="w-full py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 font-medium"
                >
                  Update Payment Information
                </button>

                {/* Payment Summary */}
                <div className="mt-4 pt-4 border-t">
                  <h3 className="font-semibold text-gray-700 mb-2">Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-semibold">MK{paymentData.total_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paid:</span>
                      <span className="font-semibold text-green-600">MK{paymentData.amount_paid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Balance:</span>
                      <span className="font-semibold">
                        MK{(paymentData.total_amount - paymentData.amount_paid).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Tracking */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Project Value</p>
                      <p className="text-2xl font-bold text-gray-900">
                        MK{paymentData.total_amount.toLocaleString()}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Revenue Collected</p>
                      <p className="text-2xl font-bold text-gray-900">
                        MK{paymentData.amount_paid.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {((paymentData.amount_paid / paymentData.total_amount) * 100).toFixed(1)}% collected
                      </p>
                    </div>
                    <CreditCard className="h-8 w-8 text-blue-500" />
                  </div>
                </div>

                {project.status === 'completed' && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Project Completed</p>
                        <p className="text-lg font-bold text-gray-900">
                          Revenue: MK{calculateRevenue().toLocaleString()}
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-purple-500" />
                    </div>
                  </div>
                )}
              </div>
            </div>

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

              <div className="mt-6 pt-6 border-t space-y-2">
                <button
                  onClick={() => window.location.href = `mailto:${project.client?.email}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90"
                >
                  <Mail className="h-4 w-4" />
                  Send Email
                </button>
                <button
                  onClick={handleShareProgress}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  <Share2 className="h-4 w-4" />
                  Share Progress
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}