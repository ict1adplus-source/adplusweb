'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/contexts/AuthContext'
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
  TrendingUp,
  Percent,
  CreditCard,
  Target,
  AlertCircle,
  Calendar,
  DollarSign,
  Users,
  Download,
  FileBarChart
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

  const [projectDetails, setProjectDetails] = useState<Record<string, {
    milestones: any[],
    progress: number,
    payment: any
  }>>({})

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/auth/login')
        return
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', session.user.email)
        .single()

      if (userError) {
        console.error('User error:', userError)
        router.push('/auth/login')
        return
      }

      if (userData) {
        setUserInfo(userData)
      }

      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', session.user.id)
        .order('created_at', { ascending: false })

      setProjects(projectsData || [])

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
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

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
          payment: paymentData || null
        }
      }))
    } catch (error) {
      console.error('Error loading project details:', error)
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

  const calculateOverallProgress = () => {
    if (projects.length === 0) return 0
    let totalProgress = 0
    projects.forEach(project => {
      totalProgress += projectDetails[project.id]?.progress || 0
    })
    return Math.round(totalProgress / projects.length)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

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
              <AlertCircle className="h-10 w-10 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
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
                  </div>

                  {/* Quick Milestone Preview */}
                  {milestones.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Milestones</h4>
                      <div className="space-y-2">
                        {milestones.slice(0, 2).map((milestone) => (
                          <div key={milestone.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${
                                milestone.status === 'completed' ? 'bg-green-500' :
                                milestone.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'
                              }`} />
                              <span>{milestone.title}</span>
                            </div>
                            <div className="text-gray-500">
                              {milestone.status === 'completed' ? 'Completed' :
                               milestone.status === 'in-progress' ? 'In Progress' : 'Pending'}
                            </div>
                          </div>
                        ))}
                        {milestones.length > 2 && (
                          <button 
                            onClick={() => handleViewMilestones(project.id)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            View all {milestones.length} milestones →
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
          <div className="mt-8 bg-white rounded-xl shadow p-6">
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
                  <AlertCircle className="h-8 w-8 text-orange-500" />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}