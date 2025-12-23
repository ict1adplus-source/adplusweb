'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, ADMIN_EMAILS } from '@/contexts/AuthContext'
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Building,
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
  Paperclip,
  Upload,
  X,
  Sparkles,
  Target,
  CheckCircle,
  Users,
  Search,
  UserPlus,
  Tag,
  PlusCircle,
  Clock,
  Percent,
  Eye
} from 'lucide-react'

export default function AdminCreateProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [adminData, setAdminData] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [serviceType, setServiceType] = useState('website-development')
  const [category, setCategory] = useState('web-design')
  const [priority, setPriority] = useState('medium')
  const [deadline, setDeadline] = useState('')
  const [budget, setBudget] = useState('')
  const [requirements, setRequirements] = useState<string[]>([''])
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [selectedClient, setSelectedClient] = useState('')
  const [clients, setClients] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [creatingClient, setCreatingClient] = useState(false)
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    company: '',
    phone: ''
  })

  // Categories and services
  const ALLOWED_CATEGORIES = [
    { value: 'web-design', label: 'Web Design', icon: <Sparkles className="h-4 w-4" /> },
    { value: 'graphic-design', label: 'Graphic Design', icon: <Tag className="h-4 w-4" /> },
    { value: 'digital-marketing', label: 'Digital Marketing', icon: <Target className="h-4 w-4" /> },
    { value: 'printing', label: 'Printing Services', icon: <FileText className="h-4 w-4" /> },
    { value: 'branding', label: 'Branding', icon: <Target className="h-4 w-4" /> },
    { value: 'consultation', label: 'Consultation', icon: <Users className="h-4 w-4" /> }
  ]

  const SERVICE_TYPES = [
    // Web Design
    { value: 'website-development', label: 'Website Development', category: 'web-design' },
    { value: 'ecommerce-site', label: 'E-commerce Website', category: 'web-design' },
    { value: 'web-redesign', label: 'Website Redesign', category: 'web-design' },
    // Graphic Design
    { value: 'logo-design', label: 'Logo Design', category: 'graphic-design' },
    { value: 'brochure-design', label: 'Brochure Design', category: 'graphic-design' },
    // Digital Marketing
    { value: 'seo-optimization', label: 'SEO Optimization', category: 'digital-marketing' },
    { value: 'social-media-management', label: 'Social Media Management', category: 'digital-marketing' },
    // Printing
    { value: 'business-cards-print', label: 'Business Cards Printing', category: 'printing' },
    { value: 'flyers-print', label: 'Flyers Printing', category: 'printing' },
    // Branding
    { value: 'brand-identity', label: 'Brand Identity', category: 'branding' },
    { value: 'brand-strategy', label: 'Brand Strategy', category: 'branding' },
    // Consultation
    { value: 'digital-strategy', label: 'Digital Strategy', category: 'consultation' }
  ]

  useEffect(() => {
    checkAdminAuth()
    loadClients()
  }, [])

  const checkAdminAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session || !ADMIN_EMAILS.includes(session.user.email?.toLowerCase() || '')) {
        router.push('/auth/login')
        return
      }
      
      setAdminData(session.user)
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/auth/login')
    }
  }

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, company, phone, created_at')
        .eq('role', 'client')
        .order('name', { ascending: true })
      
      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error('Error loading clients:', error)
    }
  }

  const handleAddRequirement = () => {
    setRequirements([...requirements, ''])
  }

  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...requirements]
    newRequirements[index] = value
    setRequirements(newRequirements)
  }

  const handleRemoveRequirement = (index: number) => {
    if (requirements.length > 1) {
      const newRequirements = requirements.filter((_, i) => i !== index)
      setRequirements(newRequirements)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    
    const newFiles = Array.from(files)
    const validFiles = newFiles.filter(file => file.size <= 10 * 1024 * 1024)
    
    if (validFiles.length !== newFiles.length) {
      setError('Some files exceed 10MB limit')
      setTimeout(() => setError(''), 3000)
    }
    
    setUploadedFiles(prev => [...prev, ...validFiles])
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const createClientAccount = async () => {
    if (!newClient.name || !newClient.email) {
      setError('Client name and email are required')
      return
    }

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newClient.email,
        password: Math.random().toString(36).slice(-8) + 'A1!', // Generate random password
        options: {
          data: {
            name: newClient.name,
            company: newClient.company,
            phone: newClient.phone,
            role: 'client'
          }
        }
      })

      if (authError) throw authError

      // Create user record
      const { error: userError } = await supabase
        .from('users')
        .insert([{
          id: authData.user?.id,
          email: newClient.email,
          name: newClient.name,
          company: newClient.company || null,
          phone: newClient.phone || null,
          role: 'client',
          created_at: new Date().toISOString()
        }])

      if (userError) throw userError

      // Reload clients
      await loadClients()
      setSelectedClient(authData.user?.id || '')
      setCreatingClient(false)
      setNewClient({ name: '', email: '', company: '', phone: '' })
      
      alert(`Client account created successfully! Login credentials sent to ${newClient.email}`)
    } catch (error: any) {
      setError(error.message || 'Failed to create client account')
    }
  }

  const uploadFilesToStorage = async (projectId: string) => {
    if (uploadedFiles.length === 0) return []

    const uploadedFilePaths: string[] = []
    
    for (const file of uploadedFiles) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${projectId}/attachments/${Date.now()}_${file.name.replace(/\s+/g, '_')}`
      
      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(fileName, file)
      
      if (!uploadError) {
        uploadedFilePaths.push(fileName)
      }
    }
    
    return uploadedFilePaths
  }

  const createMilestones = async (projectId: string) => {
    const defaultMilestones = [
      {
        project_id: projectId,
        title: 'Project Kickoff',
        description: 'Initial meeting and requirements finalization',
        status: 'not-started',
        order: 1,
        estimated_hours: 2
      },
      {
        project_id: projectId,
        title: 'Design Phase',
        description: 'Creating initial designs and mockups',
        status: 'not-started',
        order: 2,
        estimated_hours: 8
      },
      {
        project_id: projectId,
        title: 'Development',
        description: 'Building the solution',
        status: 'not-started',
        order: 3,
        estimated_hours: 20
      },
      {
        project_id: projectId,
        title: 'Review & Feedback',
        description: 'Client review and feedback incorporation',
        status: 'not-started',
        order: 4,
        estimated_hours: 5
      },
      {
        project_id: projectId,
        title: 'Final Delivery',
        description: 'Project delivery and handover',
        status: 'not-started',
        order: 5,
        estimated_hours: 3
      }
    ]

    const { error } = await supabase
      .from('milestones')
      .insert(defaultMilestones)

    if (error) console.error('Error creating milestones:', error)
  }

  const createPaymentRecord = async (projectId: string) => {
    const paymentData = {
      project_id: projectId,
      status: 'pending',
      total_amount: budget ? parseFloat(budget) : 0,
      amount_paid: 0,
      invoice_number: `INV-${Date.now().toString().slice(-8)}`,
      payment_date: null,
      notes: 'Initial project invoice'
    }

    const { error } = await supabase
      .from('payments')
      .insert([paymentData])

    if (error) console.error('Error creating payment record:', error)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session || !ADMIN_EMAILS.includes(session.user.email?.toLowerCase() || '')) {
        throw new Error('Admin access required')
      }

      // Validation
      if (!title.trim()) throw new Error('Project title is required')
      if (!description.trim()) throw new Error('Description is required')
      if (!selectedClient) throw new Error('Please select or create a client')
      if (!serviceType.trim()) throw new Error('Service type is required')

      // Filter requirements
      const filteredRequirements = requirements.filter(req => req.trim() !== '')
      
      // Create project
      const projectData = {
        title: title.trim(),
        description: description.trim(),
        service_type: serviceType,
        category: category,
        client_id: selectedClient,
        client_name: clients.find(c => c.id === selectedClient)?.name || 'Client',
        client_email: clients.find(c => c.id === selectedClient)?.email || '',
        client_company: clients.find(c => c.id === selectedClient)?.company || null,
        priority: priority,
        status: 'pending',
        deadline: deadline ? new Date(deadline).toISOString() : null,
        budget: budget ? parseFloat(budget) : null,
        requirements: filteredRequirements.length > 0 ? filteredRequirements : null,
        additional_notes: additionalNotes.trim() || null,
        created_by: session.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      console.log('Creating project:', projectData)

      // Insert project
      const { data: project, error: insertError } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single()

      if (insertError) throw insertError

      console.log('Project created:', project.id)

      // Upload files
      if (uploadedFiles.length > 0) {
        const uploadedPaths = await uploadFilesToStorage(project.id)
        
        if (uploadedPaths.length > 0) {
          const fileRecords = uploadedPaths.map(path => ({
            project_id: project.id,
            file_path: path,
            uploaded_by: session.user.id,
            uploaded_by_type: 'admin',
            uploaded_at: new Date().toISOString(),
          }))

          await supabase
            .from('project_files')
            .insert(fileRecords)
        }
      }

      // Create default milestones
      await createMilestones(project.id)

      // Create payment record
      await createPaymentRecord(project.id)

      // Send notification to client
      await supabase
        .from('notifications')
        .insert({
          user_id: selectedClient,
          project_id: project.id,
          message: `New project "${title}" has been created for you`,
          type: 'project_created',
          read: false,
          created_at: new Date().toISOString()
        })

      setSuccess(`Project "${title}" created successfully!`)
      
      // Reset form
      setTimeout(() => {
        router.push(`/admin/projects/${project.id}`)
      }, 2000)
      
    } catch (error: any) {
      console.error('Error creating project:', error)
      setError(error.message || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!adminData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Create New Project</h1>
                <p className="text-blue-100">Create project for client</p>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/20 p-4 rounded-xl">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Client Selection Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                Select Client
              </h2>
              
              {!creatingClient ? (
                <>
                  {/* Client Search */}
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search clients by name, email, or company..."
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Clients List */}
                    <div className="border rounded-lg max-h-60 overflow-y-auto">
                      {filteredClients.map((client) => (
                        <div
                          key={client.id}
                          onClick={() => setSelectedClient(client.id)}
                          className={`p-4 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedClient === client.id ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{client.name}</p>
                              <p className="text-sm text-gray-600">{client.email}</p>
                              {client.company && (
                                <p className="text-sm text-gray-500">Company: {client.company}</p>
                              )}
                            </div>
                            {selectedClient === client.id && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {filteredClients.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No clients found</p>
                      </div>
                    )}

                    {/* Create New Client Button */}
                    <button
                      type="button"
                      onClick={() => setCreatingClient(true)}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <UserPlus className="h-5 w-5" />
                      <span className="font-medium">Create New Client Account</span>
                    </button>
                  </div>
                </>
              ) : (
                /* New Client Form */
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-semibold text-gray-900">Create New Client</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client Name *
                      </label>
                      <input
                        type="text"
                        value={newClient.name}
                        onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={newClient.email}
                        onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="client@example.com"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company
                      </label>
                      <input
                        type="text"
                        value={newClient.company}
                        onChange={(e) => setNewClient({...newClient, company: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="Company Name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={newClient.phone}
                        onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="+265 XXX XXX XXX"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={createClientAccount}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Create Client Account
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreatingClient(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Project Details Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg mr-3">
                  <Target className="h-5 w-5 text-orange-600" />
                </div>
                Project Details
              </h2>

              {/* Project Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., E-commerce Website Development"
                />
              </div>

              {/* Category & Service Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {ALLOWED_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Type *
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {SERVICE_TYPES.filter(s => s.category === category).map((service) => (
                      <option key={service.value} value={service.value}>
                        {service.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Describe the project requirements, goals, and deliverables..."
                />
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requirements
                </label>
                <div className="space-y-3">
                  {requirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => handleRequirementChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder={`Requirement ${index + 1}`}
                      />
                      {requirements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRequirement(index)}
                          className="p-2 text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddRequirement}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add Requirement
                  </button>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget (MK)
                  </label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Any additional information or instructions..."
                />
              </div>
            </div>

            {/* File Upload Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <Paperclip className="h-5 w-5 text-green-600" />
                </div>
                Attachments (Optional)
              </h2>

              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  className="hidden"
                />
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Click to upload files</p>
                <p className="text-sm text-gray-500">Maximum file size: 10MB</p>
              </div>

              {/* File List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Selected Files ({uploadedFiles.length})</h3>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary & Submit */}
            <div className="pt-6 border-t">
              {/* Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Project Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Client:</span>
                    <span className="font-medium ml-2">
                      {clients.find(c => c.id === selectedClient)?.name || 'Not selected'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium ml-2">
                      {ALLOWED_CATEGORIES.find(c => c.value === category)?.label}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium ml-2">
                      {SERVICE_TYPES.find(s => s.value === serviceType)?.label}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Budget:</span>
                    <span className="font-medium ml-2">
                      {budget ? `MK${parseFloat(budget).toLocaleString()}` : 'Not set'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Priority:</span>
                    <span className="font-medium ml-2 capitalize">{priority}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Files:</span>
                    <span className="font-medium ml-2">{uploadedFiles.length}</span>
                  </div>
                </div>
              </div>

              {/* Error & Success Messages */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <p>{success}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <p>Fields marked with * are required</p>
                </div>
                <button
                  type="submit"
                  disabled={loading || !selectedClient}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Create Project
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}