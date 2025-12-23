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
  FileBarChart,
  Plus,
  Globe,
  Briefcase,
  Layers,
  CheckCheck,
  Eye,
  Search,
  Filter
} from 'lucide-react'

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'review', label: 'Under Review', color: 'bg-blue-100 text-blue-800' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-purple-100 text-purple-800' },
  { value: 'on-hold', label: 'On Hold', color: 'bg-orange-100 text-orange-800' },
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

const milestoneStatusOptions = [
  { value: 'not-started', label: 'Not Started', color: 'bg-gray-100 text-gray-800', icon: '○' },
  { value: 'started', label: 'Started', color: 'bg-blue-100 text-blue-800', icon: '▶' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-purple-100 text-purple-800', icon: '⏳' },
  { value: 'review', label: 'Under Review', color: 'bg-yellow-100 text-yellow-800', icon: '👁️' },
  { value: 'final-edits', label: 'Final Edits', color: 'bg-orange-100 text-orange-800', icon: '✏️' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800', icon: '✅' },
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
  const [availableClients, setAvailableClients] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [newMilestone, setNewMilestone] = useState({ 
    title: '', 
    description: '', 
    due_date: '',
    status: 'not-started',
    estimated_hours: 0
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editedProject, setEditedProject] = useState<any>({})
  const [paymentData, setPaymentData] = useState({
    status: 'pending',
    amount_paid: 0,
    total_amount: 0,
    notes: '',
    payment_date: new Date().toISOString().split('T')[0],
    invoice_number: `INV-${Date.now().toString().slice(-6)}`
  })
  const [sendingMessage, setSendingMessage] = useState(false)
  const [selectedMember, setSelectedMember] = useState('')
  const [selectedClient, setSelectedClient] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [projectCreator, setProjectCreator] = useState<any>(null)

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

      // Load project with creator info
      const { data: projectData } = await supabase
        .from('projects')
        .select(`
          *,
          client:users!client_id(*),
          creator:users!created_by(*),
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
        .select('*, sender:users!sender_id(*)')
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
        .select('id, name, email, role, avatar_url')
        .eq('role', 'employee')
        .or('role.eq.admin,role.eq.staff')

      // Load all clients for assignment
      const { data: allClients } = await supabase
        .from('users')
        .select('id, name, email, company, phone')
        .eq('role', 'client')
        .order('name', { ascending: true })

      setProject(projectData)
      setEditedProject(projectData)
      setMessages(messagesData || [])
      setMilestones(milestonesData || [])
      setTeamMembers(projectData?.project_team?.map((pt: any) => pt.user) || [])
      setAvailableMembers(allUsers || [])
      setAvailableClients(allClients || [])
      setProjectCreator(projectData?.creator)

      // Set selected client if project has one
      if (projectData?.client) {
        setSelectedClient(projectData.client.id)
      }

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
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (!error) {
      setProject({ ...project, status: newStatus })
      setEditedProject({ ...editedProject, status: newStatus })
      
      // Send notification to client if assigned
      if (project.client_id) {
        await sendNotificationToClient(`Project status updated to "${newStatus.replace('-', ' ')}"`)
      }
    }
  }

  const handlePriorityChange = async (newPriority: string) => {
    const { error } = await supabase
      .from('projects')
      .update({ 
        priority: newPriority,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (!error) {
      setProject({ ...project, priority: newPriority })
      setEditedProject({ ...editedProject, priority: newPriority })
    }
  }

  const handleAssignToClient = async () => {
    if (!selectedClient) {
      alert('Please select a client')
      return
    }

    try {
      const { error } = await supabase
        .from('projects')
        .update({ 
          client_id: selectedClient,
          assigned_at: new Date().toISOString()
        })
        .eq('id', params.id)

      if (!error) {
        // Update local state
        const assignedClient = availableClients.find(c => c.id === selectedClient)
        setProject({ 
          ...project, 
          client: assignedClient,
          client_id: selectedClient 
        })
        setEditedProject({ 
          ...editedProject, 
          client: assignedClient,
          client_id: selectedClient 
        })
        
        // Send notification to client
        await sendNotificationToClient(`A new project "${project.title}" has been assigned to you`)
        alert(`Project assigned to ${assignedClient?.name}`)
      }
    } catch (error) {
      console.error('Error assigning project:', error)
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
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)

      if (error) throw error

      setProject(editedProject)
      setIsEditing(false)
      alert('Project updated successfully!')
    } catch (error) {
      console.error('Error updating project:', error)
      alert('Failed to update project')
    }
  }

  const handleAssignTeamMember = async () => {
    if (!selectedMember) {
      alert('Please select a team member')
      return
    }

    try {
      // Check if already assigned
      const isAlreadyAssigned = teamMembers.some(member => member.id === selectedMember)
      if (isAlreadyAssigned) {
        alert('This team member is already assigned to the project')
        return
      }

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
        alert('Team member assigned successfully!')
      } else {
        alert('Failed to assign team member')
      }
    } catch (error) {
      console.error('Error assigning team member:', error)
      alert('Error assigning team member')
    }
  }

  const handleRemoveTeamMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('project_team')
        .delete()
        .eq('project_id', params.id)
        .eq('user_id', userId)

      if (!error) {
        setTeamMembers(teamMembers.filter(member => member.id !== userId))
        alert('Team member removed successfully!')
      } else {
        alert('Failed to remove team member')
      }
    } catch (error) {
      console.error('Error removing team member:', error)
      alert('Error removing team member')
    }
  }

  const handleUpdateMilestoneStatus = async (milestoneId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('milestones')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', milestoneId)

      if (!error) {
        setMilestones(milestones.map(m => 
          m.id === milestoneId ? { ...m, status: newStatus } : m
        ))
        
        // Update project progress
        const progress = calculateOverallProgress()
        await supabase
          .from('projects')
          .update({ progress })
          .eq('id', params.id)
        
        // Send notification if milestone is completed
        if (newStatus === 'completed' && project.client_id) {
          const milestone = milestones.find(m => m.id === milestoneId)
          await sendNotificationToClient(`Milestone "${milestone?.title}" has been completed`)
        }
      }
    } catch (error) {
      console.error('Error updating milestone:', error)
      alert('Failed to update milestone status')
    }
  }

  const handleAddMilestone = async () => {
    if (!newMilestone.title.trim()) {
      alert('Please enter a milestone title')
      return
    }

    try {
      const { data: milestone, error } = await supabase
        .from('milestones')
        .insert({
          project_id: params.id,
          title: newMilestone.title,
          description: newMilestone.description,
          due_date: newMilestone.due_date,
          status: newMilestone.status,
          estimated_hours: newMilestone.estimated_hours,
          order: milestones.length + 1,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (!error) {
        setMilestones([...milestones, milestone])
        setNewMilestone({ 
          title: '', 
          description: '', 
          due_date: '',
          status: 'not-started',
          estimated_hours: 0
        })
        alert('Milestone added successfully!')
      } else {
        alert('Failed to add milestone')
      }
    } catch (error) {
      console.error('Error adding milestone:', error)
      alert('Error adding milestone')
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
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (!error) {
        setMessages([...messages, message])
        setNewMessage('')
        
        // Send notification to client
        if (project.client_id) {
          await sendNotificationToClient('New message from admin')
        }
      } else {
        alert('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Error sending message')
    } finally {
      setSendingMessage(false)
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
        if (project.client_id) {
          await sendNotificationToClient(`Payment status updated to ${paymentData.status}`)
        }
        alert('Payment information updated successfully!')
      } else {
        alert('Failed to update payment information')
      }
    } catch (error) {
      console.error('Error updating payment:', error)
      alert('Error updating payment information')
    }
  }

  const handleShareProgress = async () => {
    const progressData = {
      project_title: project.title,
      milestones_completed: milestones.filter(m => m.status === 'completed').length,
      total_milestones: milestones.length,
      overall_progress: calculateOverallProgress(),
      next_milestone: milestones.find(m => m.status !== 'completed'),
      payment_status: paymentData.status
    }

    // Create a shareable summary
    const summary = `
Project: ${project.title}
Overall Progress: ${calculateOverallProgress()}%
Milestones: ${progressData.milestones_completed}/${progressData.total_milestones} completed
Payment Status: ${paymentData.status}
Payment Amount: MK${paymentData.total_amount.toLocaleString()}
Amount Paid: MK${paymentData.amount_paid.toLocaleString()}
Balance Due: MK${(paymentData.total_amount - paymentData.amount_paid).toLocaleString()}
${progressData.next_milestone ? `Next Milestone: ${progressData.next_milestone.title}` : 'All milestones completed'}
    `

    alert('Progress summary ready to share:\n\n' + summary)
    
    // Send notification to client
    if (project.client_id) {
      await sendNotificationToClient('Project progress update shared')
    }
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
          read: false,
          created_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

  const handleGenerateInvoice = () => {
    const invoiceContent = `
      INVOICE: ${paymentData.invoice_number}
      Date: ${new Date().toLocaleDateString()}
      Project: ${project.title}
      Client: ${project.client?.name || 'Not assigned'}
      
      Total Amount: MK${paymentData.total_amount.toLocaleString()}
      Amount Paid: MK${paymentData.amount_paid.toLocaleString()}
      Balance Due: MK${(paymentData.total_amount - paymentData.amount_paid).toLocaleString()}
      
      Status: ${paymentData.status}
      Payment Date: ${paymentData.payment_date}
      
      Notes: ${paymentData.notes}
    `
    
    const blob = new Blob([invoiceContent], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Invoice_${paymentData.invoice_number}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const calculateOverallProgress = () => {
    if (milestones.length === 0) return 0
    const completed = milestones.filter(m => m.status === 'completed').length
    const inProgress = milestones.filter(m => 
      m.status === 'started' || 
      m.status === 'in-progress' || 
      m.status === 'review' || 
      m.status === 'final-edits'
    ).length
    
    // Weight completed milestones more
    return Math.round((completed * 100 + inProgress * 50) / milestones.length)
  }

  const getMilestoneStatusIcon = (status: string) => {
    const option = milestoneStatusOptions.find(opt => opt.value === status)
    return option?.icon || '○'
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
                <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Project ID: {project.id.substring(0, 8)}</span>
                  <span>•</span>
                  <span>
                    Created by: {projectCreator?.name || 'Admin'}
                    {projectCreator?.email && ` (${projectCreator.email})`}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <select
                  value={project.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="px-4 py-2 border rounded-lg text-sm font-medium bg-white"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value} className={option.color}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={project.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  className="px-4 py-2 border rounded-lg text-sm font-medium bg-white"
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
        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="flex space-x-8">
            {['overview', 'milestones', 'team', 'payments', 'communication'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 text-sm font-medium ${
                  activeTab === tab
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {activeTab === 'overview' && (
              <>
                {/* Project Assignment Section */}
                <div className="bg-white rounded-xl shadow p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Project Assignment</h2>
                    {!project.client && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                        Unassigned
                      </span>
                    )}
                  </div>

                  {project.client ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-semibold">Assigned to Client</p>
                            <p className="text-gray-600">{project.client.name} ({project.client.email})</p>
                            {project.client.company && (
                              <p className="text-sm text-gray-500">Company: {project.client.company}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <p className="text-gray-700 mb-3">This project is not assigned to any client. Assign it to make it visible in their dashboard.</p>
                        <div className="flex gap-3">
                          <select
                            value={selectedClient}
                            onChange={(e) => setSelectedClient(e.target.value)}
                            className="flex-1 px-3 py-2 border rounded-lg"
                          >
                            <option value="">Select a client...</option>
                            {availableClients.map(client => (
                              <option key={client.id} value={client.id}>
                                {client.name} ({client.email}) {client.company ? `- ${client.company}` : ''}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={handleAssignToClient}
                            disabled={!selectedClient}
                            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Assign to Client
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Project Details */}
                <div className="bg-white rounded-xl shadow p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Project Details</h2>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      <Edit className="h-4 w-4" />
                      {isEditing ? 'Cancel Edit' : 'Edit Details'}
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Project Title</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProject.title || ''}
                          onChange={(e) => setEditedProject({...editedProject, title: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{project.title}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      {isEditing ? (
                        <textarea
                          value={editedProject.description || ''}
                          onChange={(e) => setEditedProject({...editedProject, description: e.target.value})}
                          rows={4}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      ) : (
                        <p className="text-gray-600 whitespace-pre-line">{project.description}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Deadline</p>
                            {isEditing ? (
                              <input
                                type="date"
                                value={editedProject.deadline?.split('T')[0] || ''}
                                onChange={(e) => setEditedProject({...editedProject, deadline: e.target.value})}
                                className="text-sm border rounded px-2 py-1 w-full mt-1"
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
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <DollarSign className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Budget</p>
                            {isEditing ? (
                              <input
                                type="number"
                                value={editedProject.budget || ''}
                                onChange={(e) => setEditedProject({...editedProject, budget: parseFloat(e.target.value) || 0})}
                                className="text-sm border rounded px-2 py-1 w-full mt-1"
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
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Percent className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Progress</p>
                            <p className="font-semibold text-xl">{calculateOverallProgress()}%</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="pt-4 border-t">
                        <div className="flex gap-3">
                          <button
                            onClick={handleSaveChanges}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                          >
                            <Save className="h-4 w-4" />
                            Save Changes
                          </button>
                          <button
                            onClick={() => {
                              setIsEditing(false)
                              setEditedProject(project)
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                          >
                            <X className="h-4 w-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'milestones' && (
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Milestones</h2>
                
                {/* Milestones Progress */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                    <span className="text-sm font-semibold">{calculateOverallProgress()}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${calculateOverallProgress()}%` }}
                    ></div>
                  </div>
                </div>

                {/* Add New Milestone */}
                <div className="mb-8 p-6 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-700 mb-4">Add New Milestone</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                      <input
                        type="text"
                        placeholder="e.g., Initial Design Phase"
                        value={newMilestone.title}
                        onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={newMilestone.status}
                        onChange={(e) => setNewMilestone({...newMilestone, status: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        {milestoneStatusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                      <input
                        type="date"
                        value={newMilestone.due_date}
                        onChange={(e) => setNewMilestone({...newMilestone, due_date: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
                      <input
                        type="number"
                        value={newMilestone.estimated_hours}
                        onChange={(e) => setNewMilestone({...newMilestone, estimated_hours: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      placeholder="Milestone details..."
                      value={newMilestone.description}
                      onChange={(e) => setNewMilestone({...newMilestone, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  
                  <button
                    onClick={handleAddMilestone}
                    className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
                  >
                    Add Milestone
                  </button>
                </div>

                {/* Milestones List */}
                <div className="space-y-4">
                  {milestones.map((milestone) => (
                    <div key={milestone.id} className="p-5 border rounded-xl hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{getMilestoneStatusIcon(milestone.status)}</span>
                            <h3 className="text-lg font-semibold">{milestone.title}</h3>
                          </div>
                          {milestone.description && (
                            <p className="text-gray-600 mb-3">{milestone.description}</p>
                          )}
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            {milestone.due_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Due: {new Date(milestone.due_date).toLocaleDateString()}
                              </div>
                            )}
                            {milestone.estimated_hours > 0 && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {milestone.estimated_hours} hours
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <select
                          value={milestone.status}
                          onChange={(e) => handleUpdateMilestoneStatus(milestone.id, e.target.value)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium ${milestoneStatusOptions.find(m => m.value === milestone.status)?.color}`}
                        >
                          {milestoneStatusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex gap-2 mt-4 pt-4 border-t">
                        {milestoneStatusOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleUpdateMilestoneStatus(milestone.id, option.value)}
                            className={`flex-1 py-2 text-sm rounded-lg transition-all ${
                              milestone.status === option.value
                                ? `${option.color} font-semibold`
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {option.icon} {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'team' && (
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Team Management</h2>
                
                {/* Add Team Member */}
                <div className="mb-8 p-6 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-700 mb-4">Assign Team Member</h3>
                  <div className="flex gap-3">
                    <select
                      value={selectedMember}
                      onChange={(e) => setSelectedMember(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg"
                    >
                      <option value="">Select team member...</option>
                      {availableMembers
                        .filter(m => !teamMembers.some(tm => tm.id === m.id))
                        .map(member => (
                          <option key={member.id} value={member.id}>
                            {member.name} ({member.email}) - {member.role}
                          </option>
                        ))
                      }
                    </select>
                    <button
                      onClick={handleAssignTeamMember}
                      disabled={!selectedMember}
                      className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <UserPlus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Team Members List */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-4">Assigned Team ({teamMembers.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teamMembers.map(member => (
                      <div key={member.id} className="p-4 border rounded-xl hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {member.avatar_url ? (
                              <img 
                                src={member.avatar_url} 
                                alt={member.name}
                                className="h-10 w-10 rounded-full"
                              />
                            ) : (
                              <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-orange-600" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-gray-600">{member.email}</p>
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                {member.role}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveTeamMember(member.id)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Management</h2>
                
                {/* Invoice Header */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-900">Invoice #{paymentData.invoice_number}</h3>
                      <p className="text-sm text-gray-600">Created on {new Date().toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={handleGenerateInvoice}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Download className="h-4 w-4" />
                      Download Invoice
                    </button>
                  </div>
                </div>

                {/* Payment Form */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Status
                      </label>
                      <select
                        value={paymentData.status}
                        onChange={(e) => setPaymentData({...paymentData, status: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg"
                      >
                        {paymentStatusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Invoice Number
                      </label>
                      <input
                        type="text"
                        value={paymentData.invoice_number}
                        onChange={(e) => setPaymentData({...paymentData, invoice_number: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Amount (MK)
                      </label>
                      <input
                        type="number"
                        value={paymentData.total_amount}
                        onChange={(e) => setPaymentData({...paymentData, total_amount: parseFloat(e.target.value) || 0})}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount Paid (MK)
                      </label>
                      <input
                        type="number"
                        value={paymentData.amount_paid}
                        onChange={(e) => setPaymentData({...paymentData, amount_paid: parseFloat(e.target.value) || 0})}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Date
                      </label>
                      <input
                        type="date"
                        value={paymentData.payment_date}
                        onChange={(e) => setPaymentData({...paymentData, payment_date: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Notes
                    </label>
                    <textarea
                      value={paymentData.notes}
                      onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Add payment notes or instructions..."
                    />
                  </div>

                  <button
                    onClick={handleUpdatePayment}
                    className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                  >
                    Update Payment Information
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'communication' && (
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Communication</h2>
                
                {/* Messages List */}
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
                            {message.sender?.name || (message.sender_role === 'admin' ? 'You' : 'Client')}
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

                {/* Send Message */}
                <div className="border-t pt-4">
                  <div className="relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 pr-20"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={sendingMessage || !newMessage.trim()}
                      className="absolute right-2 bottom-2 flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      {sendingMessage ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Stats</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Milestones</p>
                      <p className="text-2xl font-bold text-gray-900">{milestones.length}</p>
                    </div>
                    <Target className="h-8 w-8 text-blue-500" />
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {milestones.filter(m => m.status === 'completed').length}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {milestones.length > 0 
                          ? `${Math.round((milestones.filter(m => m.status === 'completed').length / milestones.length) * 100)}% done`
                          : 'No milestones'
                        }
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Team Members</p>
                      <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-semibold">MK{paymentData.total_amount.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-semibold text-green-600">MK{paymentData.amount_paid.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Balance Due:</span>
                  <span className="font-semibold text-orange-600">
                    MK{(paymentData.total_amount - paymentData.amount_paid).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    paymentStatusOptions.find(p => p.value === paymentData.status)?.color
                  }`}>
                    {paymentData.status.charAt(0).toUpperCase() + paymentData.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <button
                  onClick={handleShareProgress}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:opacity-90"
                >
                  <Share2 className="h-4 w-4" />
                  Share Progress Update
                </button>
              </div>
            </div>

            {/* Client Information */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Client Information</h2>
              
              {project.client ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-semibold">{project.client.name}</p>
                    </div>
                  </div>

                  {project.client.company && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Building className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Company</p>
                        <p className="font-semibold">{project.client.company}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold">{project.client.email}</p>
                    </div>
                  </div>

                  {project.client.phone && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-semibold">{project.client.phone}</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t space-y-2">
                    <button
                      onClick={() => window.location.href = `mailto:${project.client.email}`}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      <Mail className="h-4 w-4" />
                      Send Email
                    </button>
                    <button
                      onClick={() => router.push(`/admin/clients/${project.client.id}`)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      <Eye className="h-4 w-4" />
                      View Client Profile
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">No Client Assigned</h3>
                  <p className="text-gray-600 mb-4">Assign this project to a client to see their information here.</p>
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg mb-3"
                  >
                    <option value="">Select a client...</option>
                    {availableClients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignToClient}
                    disabled={!selectedClient}
                    className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                  >
                    Assign Client
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}