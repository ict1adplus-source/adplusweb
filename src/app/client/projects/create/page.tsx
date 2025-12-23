'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
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
  Image as ImageIcon,
  Sparkles,
  Target,
  BarChart3,
  Clock,
  Award,
  Layers,
  Tag,
  FolderOpen,
  PlusCircle,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

export default function CreateProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [userData, setUserData] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Form fields matching your table structure
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [serviceType, setServiceType] = useState('website') // REQUIRED
  const [clientName, setClientName] = useState('') // REQUIRED
  const [clientEmail, setClientEmail] = useState('') // REQUIRED
  const [clientCompany, setClientCompany] = useState('')
  const [category, setCategory] = useState('general')
  const [priority, setPriority] = useState('medium') // Default: 'medium'
  const [deadline, setDeadline] = useState('')
  const [budget, setBudget] = useState('')
  const [requirements, setRequirements] = useState<string[]>([''])
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [additionalNotes, setAdditionalNotes] = useState('')

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserData(user)
          setClientName(user.user_metadata?.name || '')
          setClientEmail(user.email || '')
          setClientCompany(user.user_metadata?.company || '')
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }
    fetchUserData()
  }, [])

  // Service types with icons and descriptions
  const SERVICE_TYPES = [
    { value: 'website', label: 'Website Development', icon: <Sparkles className="h-4 w-4" />, description: 'Custom websites & web applications' },
    { value: 'marketing', label: 'Digital Marketing', icon: <BarChart3 className="h-4 w-4" />, description: 'SEO, PPC, social media campaigns' },
    { value: 'design', label: 'UI/UX Design', icon: <Target className="h-4 w-4" />, description: 'User interface & experience design' },
    { value: 'seo', label: 'SEO Optimization', icon: <Award className="h-4 w-4" />, description: 'Search engine optimization' },
    { value: 'social', label: 'Social Media', icon: <Layers className="h-4 w-4" />, description: 'Social media management & strategy' },
    { value: 'content', label: 'Content Creation', icon: <FileText className="h-4 w-4" />, description: 'Blog posts, articles, copywriting' },
    { value: 'video', label: 'Video Production', icon: <Tag className="h-4 w-4" />, description: 'Video editing & production' },
    { value: 'branding', label: 'Branding', icon: <FolderOpen className="h-4 w-4" />, description: 'Logo design & brand identity' },
    { value: 'ecommerce', label: 'E-commerce', icon: <Sparkles className="h-4 w-4" />, description: 'Online store development' },
    { value: 'mobile', label: 'Mobile Apps', icon: <PlusCircle className="h-4 w-4" />, description: 'iOS & Android applications' },
    { value: 'consulting', label: 'Consulting', icon: <Target className="h-4 w-4" />, description: 'Digital strategy consulting' },
    { value: 'other', label: 'Other Services', icon: <AlertCircle className="h-4 w-4" />, description: 'Custom service request' }
  ]

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
    // Validate file size (10MB max)
    const validFiles = newFiles.filter(file => file.size <= 10 * 1024 * 1024)
    
    if (validFiles.length !== newFiles.length) {
      setError('Some files exceed 10MB limit and were not added')
    }
    
    setUploadedFiles(prev => [...prev, ...validFiles])
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFilesToStorage = async (projectId: string) => {
    if (uploadedFiles.length === 0) return []

    const uploadedFilePaths: string[] = []
    
    for (const file of uploadedFiles) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${projectId}/attachments/${Date.now()}_${file.name.replace(/\s+/g, '_')}`
      
      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (!uploadError) {
        uploadedFilePaths.push(fileName)
      } else {
        console.error('Error uploading file:', uploadError)
      }
    }
    
    return uploadedFilePaths
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('You must be logged in to create a project')
      
      // Validate required fields based on your table structure
      if (!title.trim()) throw new Error('Project title is required')
      if (!description.trim()) throw new Error('Description is required')
      if (!clientName.trim()) throw new Error('Client name is required')
      if (!clientEmail.trim()) throw new Error('Client email is required')
      if (!serviceType.trim()) throw new Error('Service type is required')

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(clientEmail)) {
        throw new Error('Please enter a valid email address')
      }

      // Filter out empty requirements
      const filteredRequirements = requirements.filter(req => req.trim() !== '')
      
      // Prepare project data EXACTLY matching your table structure
      const projectData = {
        // REQUIRED fields (NOT NULL in your table)
        title: title.trim(),
        description: description.trim(),
        client_email: clientEmail.trim(),
        client_name: clientName.trim(),
        service_type: serviceType,
        
        // Foreign key
        client_id: user.id,
        
        // Optional fields with defaults (matching your table defaults)
        client_company: clientCompany.trim() || null,
        category: category || null,
        priority: priority, // Default is 'medium' from your table
        status: 'pending', // Default from your table
        
        // Other optional fields
        deadline: deadline ? new Date(deadline).toISOString() : null,
        budget: budget ? parseFloat(budget) : null,
        requirements: filteredRequirements.length > 0 ? filteredRequirements : null,
        attachments: uploadedFiles.length > 0 ? uploadedFiles.map(f => f.name) : null,
        additional_notes: additionalNotes.trim() || null,
        
        // System fields (auto-filled but included for clarity)
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      console.log('Submitting project data:', projectData)

      // Insert project
      const { data: project, error: insertError } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single()

      if (insertError) {
        console.error('Insert error details:', insertError)
        throw insertError
      }

      // Upload files if any
      if (uploadedFiles.length > 0) {
        setUploadingFiles(true)
        const uploadedPaths = await uploadFilesToStorage(project.id)
        
        // Save file references to project_files table
        if (uploadedPaths.length > 0) {
          const fileRecords = uploadedPaths.map(path => ({
            project_id: project.id,
            file_path: path,
            uploaded_by: user.id,
            uploaded_by_type: 'client',
            uploaded_at: new Date().toISOString(),
          }))

          const { error: fileInsertError } = await supabase
            .from('project_files')
            .insert(fileRecords)

          if (fileInsertError) {
            console.error('Error saving file records:', fileInsertError)
            // Don't throw - project was created successfully
          }
        }
      }

      setSuccess('Project created successfully! Redirecting to dashboard...')
      
      // Redirect after success
      setTimeout(() => {
        router.push('/client/dashboard')
      }, 2000)
      
    } catch (error: any) {
      console.error('Full error:', error)
      
      // More specific error messages
      if (error.message.includes('duplicate key')) {
        setError('A project with this title already exists')
      } else if (error.message.includes('foreign key')) {
        setError('User not found. Please try logging in again')
      } else if (error.message.includes('permission')) {
        setError('You do not have permission to create projects. Check RLS policies.')
      } else {
        setError(error.message || 'Failed to create project. Please check all required fields.')
      }
    } finally {
      setLoading(false)
      setUploadingFiles(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Animated Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/client/dashboard')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 hover:scale-105 transition-all mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="group-hover:underline">Back to Dashboard</span>
          </button>
          
          <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Create New Project</h1>
                <p className="text-orange-100">Fill in all required details for your new project request</p>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/20 p-4 rounded-xl">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center mt-6 mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">1</div>
                <span className="text-xs mt-2 text-gray-600">Basic Info</span>
              </div>
              <div className="w-16 h-1 bg-gray-300"></div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold">2</div>
                <span className="text-xs mt-2 text-gray-600">Details</span>
              </div>
              <div className="w-16 h-1 bg-gray-300"></div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold">3</div>
                <span className="text-xs mt-2 text-gray-600">Files</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* Section 1: Client Information */}
            <div className="relative">
              <div className="absolute -left-3 top-0 w-1 h-full bg-gradient-to-b from-orange-500 to-yellow-500 rounded-full"></div>
              
              <div className="pb-6 pl-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg mr-3">
                    <User className="h-5 w-5 text-orange-600" />
                  </div>
                  Client Information
                  <span className="ml-auto text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    Required fields
                  </span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Client Name */}
                  <div className="transform transition-all hover:scale-[1.01]">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <User className="h-4 w-4 mr-2 text-orange-500" />
                      Client Name *
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        required
                        className="pl-4 pr-4 py-3.5 w-full border border-gray-300 rounded-xl focus:ring-3 focus:ring-orange-500/20 focus:border-orange-500 transition-all group-hover:border-orange-400"
                        placeholder="John Doe"
                      />
                      {clientName && (
                        <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>

                  {/* Client Email */}
                  <div className="transform transition-all hover:scale-[1.01]">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-orange-500" />
                      Client Email *
                    </label>
                    <div className="relative group">
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        required
                        className="pl-4 pr-4 py-3.5 w-full border border-gray-300 rounded-xl focus:ring-3 focus:ring-orange-500/20 focus:border-orange-500 transition-all group-hover:border-orange-400"
                        placeholder="client@example.com"
                      />
                      {clientEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail) && (
                        <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>

                  {/* Client Company */}
                  <div className="transform transition-all hover:scale-[1.01]">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Building className="h-4 w-4 mr-2 text-orange-500" />
                      Company Name
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        value={clientCompany}
                        onChange={(e) => setClientCompany(e.target.value)}
                        className="pl-4 pr-4 py-3.5 w-full border border-gray-300 rounded-xl focus:ring-3 focus:ring-orange-500/20 focus:border-orange-500 transition-all group-hover:border-orange-400"
                        placeholder="Your Company Ltd"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Project Details */}
            <div className="relative">
              <div className="absolute -left-3 top-0 w-1 h-full bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
              
              <div className="pb-6 pl-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  Project Details
                  <span className="ml-auto text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    Required fields
                  </span>
                </h2>
                
                <div className="space-y-6">
                  {/* Project Title */}
                  <div className="transform transition-all hover:scale-[1.01]">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-blue-500" />
                      Project Title *
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="pl-4 pr-4 py-3.5 w-full border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all group-hover:border-blue-400"
                        placeholder="e.g., E-commerce Website Redesign"
                      />
                      {title && (
                        <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>

                  {/* Service Type - REQUIRED */}
                  <div className="transform transition-all hover:scale-[1.01]">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
                      Service Type *
                    </label>
                    <div className="relative group">
                      <select
                        value={serviceType}
                        onChange={(e) => setServiceType(e.target.value)}
                        required
                        className="pl-4 pr-12 py-3.5 w-full border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all group-hover:border-blue-400 appearance-none bg-white"
                      >
                        <option value="">Select a service type</option>
                        {SERVICE_TYPES.map((type) => (
                          <option key={type.value} value={type.value} className="flex items-center">
                            {type.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                      {serviceType && (
                        <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                      )}
                    </div>
                    
                    {/* Service Type Description */}
                    {serviceType && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start">
                          {SERVICE_TYPES.find(t => t.value === serviceType)?.icon}
                          <div className="ml-2">
                            <p className="text-sm font-medium text-blue-900">
                              {SERVICE_TYPES.find(t => t.value === serviceType)?.label}
                            </p>
                            <p className="text-xs text-blue-700">
                              {SERVICE_TYPES.find(t => t.value === serviceType)?.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Project Description */}
                  <div className="transform transition-all hover:scale-[1.01]">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-blue-500" />
                      Project Description *
                    </label>
                    <div className="relative group">
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows={6}
                        className="pl-4 pr-4 py-3.5 w-full border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all group-hover:border-blue-400 resize-none"
                        placeholder="Describe your project in detail. Include goals, target audience, specific requirements, and any other important information..."
                      />
                      <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                        {description.length}/2000
                      </div>
                    </div>
                  </div>

                  {/* Requirements Section */}
                  <div className="transform transition-all hover:scale-[1.01]">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-blue-500" />
                      Project Requirements
                    </label>
                    <div className="space-y-3">
                      {requirements.map((req, index) => (
                        <div key={index} className="flex items-center space-x-3 group">
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              value={req}
                              onChange={(e) => handleRequirementChange(index, e.target.value)}
                              className="pl-4 pr-10 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder={`Requirement ${index + 1}`}
                            />
                            {req && (
                              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                            )}
                          </div>
                          {requirements.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveRequirement(index)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                              title="Remove requirement"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleAddRequirement}
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Add Another Requirement
                      </button>
                    </div>
                  </div>

                  {/* Additional Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Category */}
                    <div className="transform transition-all hover:scale-[1.01]">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="general">General</option>
                        <option value="new">New Project</option>
                        <option value="enhancement">Enhancement</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>

                    {/* Priority */}
                    <div className="transform transition-all hover:scale-[1.01]">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800 hover:bg-gray-200' },
                          { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
                          { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800 hover:bg-orange-200' },
                          { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800 hover:bg-red-200' }
                        ].map((level) => (
                          <button
                            key={level.value}
                            type="button"
                            onClick={() => setPriority(level.value)}
                            className={`py-2 px-3 rounded-lg font-medium transition-all ${level.color} ${priority === level.value ? 'ring-2 ring-offset-2 ring-opacity-50' : ''}`}
                          >
                            {level.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Budget */}
                    <div className="transform transition-all hover:scale-[1.01]">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <DollarSign className="h-4 w-4 inline mr-1" />
                        Budget (MK)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">MK</span>
                        <input
                          type="number"
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          min="0"
                          step="0.01"
                          className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Deadline */}
                  <div className="transform transition-all hover:scale-[1.01]">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                      Deadline
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="pl-12 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div className="transform transition-all hover:scale-[1.01]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Any additional information, special instructions, or notes that might help us understand your project better..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: File Upload */}
            <div className="relative">
              <div className="absolute -left-3 top-0 w-1 h-full bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
              
              <div className="pb-6 pl-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <Paperclip className="h-5 w-5 text-green-600" />
                  </div>
                  Attachments & Files
                  <span className="ml-auto text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    Optional
                  </span>
                </h2>
                
                <div className="space-y-6">
                  {/* File upload area */}
                  <div 
                    className="border-3 border-dashed border-gray-300 rounded-2xl p-10 text-center hover:border-green-400 hover:bg-green-50 transition-all duration-300 cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      multiple
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                      className="hidden"
                      id="file-upload"
                    />
                    
                    <div className="space-y-4">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 group-hover:scale-110 transition-transform">
                        <Upload className="h-10 w-10 text-white" />
                      </div>
                      
                      <div>
                        <p className="text-xl font-medium text-gray-900 mb-2">Drop files here or click to upload</p>
                        <p className="text-gray-600">Supports images, documents, spreadsheets, presentations</p>
                        <p className="text-sm text-gray-500 mt-2">
                          <AlertTriangle className="h-3 w-3 inline mr-1" />
                          Maximum file size: 10MB per file
                        </p>
                      </div>
                      
                      <div className="pt-4">
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
                          <Upload className="h-5 w-5" />
                          Browse Files
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* File list */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-medium text-gray-900">
                          Selected Files ({uploadedFiles.length})
                        </p>
                        <button
                          type="button"
                          onClick={() => setUploadedFiles([])}
                          className="text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                          Clear All
                        </button>
                      </div>
                      
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                        {uploadedFiles.map((file, index) => (
                          <div 
                            key={index} 
                            className="flex items-center justify-between p-4 bg-gray-50 hover:bg-white border border-gray-200 rounded-xl transition-all hover:shadow-sm group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-white rounded-lg border border-gray-200">
                                <ImageIcon className="h-6 w-6 text-gray-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                  {file.name}
                                </p>
                                <div className="flex items-center gap-4 mt-1">
                                  <p className="text-xs text-gray-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {file.type || 'Unknown type'}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                  style={{ width: '100%' }}
                                ></div>
                              </div>
                              
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(index)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                title="Remove file"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Error & Success Messages */}
            <div className="space-y-4">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm animate-pulse">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-900">Error Creating Project</p>
                      <p className="text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl shadow-sm animate-pulse">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-900">Success!</p>
                      <p className="text-green-700 mt-1">{success}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-8 border-t border-gray-200">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    Fields marked with * are required
                  </p>
                  <p className="mt-1 text-gray-500">
                    Your project will be created and visible in your dashboard
                  </p>
                </div>
                
                <button
                  type="submit"
                  disabled={loading || uploadingFiles}
                  className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl font-bold hover:opacity-90 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="relative flex items-center justify-center gap-3">
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Creating Project...</span>
                      </>
                    ) : uploadingFiles ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Uploading Files...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        <span>Create Project</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
              
              {/* Summary Preview */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Project Summary</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Title:</span>
                    <span className="truncate">{title || 'Not set'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Service:</span>
                    <span>{SERVICE_TYPES.find(t => t.value === serviceType)?.label || 'Not set'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Priority:</span>
                    <span className="capitalize">{priority}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Budget:</span>
                    <span>{budget ? `MK${parseFloat(budget).toLocaleString()}` : 'Not set'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Deadline:</span>
                    <span>{deadline ? new Date(deadline).toLocaleDateString() : 'Not set'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Attachments:</span>
                    <span>{uploadedFiles.length} file(s)</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}