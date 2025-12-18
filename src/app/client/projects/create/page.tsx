'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/contexts/AuthContext'
import { 
  ArrowLeft,
  Upload,
  FileText,
  DollarSign,
  Calendar,
  CheckCircle,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react'

const SERVICES = [
  {
    id: 'branding',
    name: 'Branding',
    description: 'Build a strong brand identity',
    startingPrice: 500,
    features: ['Brand Strategy', 'Logo Design', 'Business Cards', 'Brand Guidelines']
  },
  {
    id: 'graphic-design',
    name: 'Graphic Design',
    description: 'Professional design for marketing materials',
    startingPrice: 300,
    features: ['Social Media Designs', 'Flyers', 'Banners', 'Packaging Design']
  },
  {
    id: 'web-mobile',
    name: 'Web & Mobile App Design',
    description: 'Digital presence with cutting-edge solutions',
    startingPrice: 1000,
    features: ['Website Design', 'UX/UI Design', 'Web Development', 'SEO']
  },
  {
    id: 'layout-design',
    name: 'Layout Design',
    description: 'Print and digital layout solutions',
    startingPrice: 400,
    features: ['Brochures', 'Magazines', 'Books', 'Newsletters']
  },
  {
    id: 'social-media',
    name: 'Social Media Marketing',
    description: 'Grow your social media presence',
    startingPrice: 600,
    features: ['Content Creation', 'Management', 'Paid Ads', 'Analytics']
  },
  {
    id: 'motion-graphics',
    name: 'Motion Graphics',
    description: 'Animated content that captures attention',
    startingPrice: 800,
    features: ['2D/3D Animation', 'Video Editing', 'VFX', 'Storyboarding']
  }
]

export default function CreateProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    serviceType: '',
    category: '',
    budget: '',
    deadline: '',
    requirements: '',
    attachments: [] as File[],
  })
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    checkAuthAndLoadUser()
  }, [])

  const checkAuthAndLoadUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/auth/login?redirect=/client/projects/create')
        return
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', session.user.email)
        .single()

      if (userError) {
        console.log('Creating new user record...')
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || 'Client',
            company: session.user.user_metadata?.company || '',
            phone: session.user.user_metadata?.phone || '',
            role: 'client',
            created_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating user:', createError)
          setError('Failed to setup user account. Please contact support.')
          return
        }

        setUserInfo(newUser)
      } else {
        setUserInfo(userData)
      }
    } catch (error) {
      console.error('Error in checkAuthAndLoadUser:', error)
      setError('Failed to load user information')
    }
  }

  const handleServiceSelect = (serviceId: string) => {
    const service = SERVICES.find(s => s.id === serviceId)
    setFormData(prev => ({
      ...prev,
      serviceType: serviceId,
      category: service?.name || '',
      budget: service?.startingPrice.toString() || ''
    }))
  }

  const handleFileUpload = (files: FileList) => {
    const fileArray = Array.from(files)
    const validFiles = fileArray.filter(file => file.size <= 10 * 1024 * 1024)
    
    if (validFiles.length !== fileArray.length) {
      setError('Some files were skipped (max 10MB each)')
    }
    
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles]
    }))
  }

  const uploadAttachments = async (): Promise<string[]> => {
    if (formData.attachments.length === 0) return []

    const uploadedUrls: string[] = []
    
    try {
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
      
      if (bucketError) {
        throw new Error(`Storage error: ${bucketError.message}`)
      }

      if (!buckets?.find(b => b.name === 'projects')) {
        throw new Error('Storage bucket not configured. Please contact support.')
      }

      for (let i = 0; i < formData.attachments.length; i++) {
        const file = formData.attachments[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
        const filePath = `attachments/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('projects')
          .upload(filePath, file)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          throw new Error(`Failed to upload ${file.name}`)
        }

        const { data: { publicUrl } } = supabase.storage
          .from('projects')
          .getPublicUrl(filePath)
        
        uploadedUrls.push(publicUrl)
        setUploadProgress(Math.round(((i + 1) / formData.attachments.length) * 100))
      }
    } catch (error: any) {
      console.error('Upload attachments error:', error)
      throw error
    }

    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setUploadProgress(0)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('Session expired. Please log in again.')
      }

      if (!formData.title.trim()) throw new Error('Project title is required')
      if (!formData.description.trim()) throw new Error('Project description is required')
      if (!formData.serviceType) throw new Error('Please select a service type')

      let attachmentUrls: string[] = []
      try {
        attachmentUrls = await uploadAttachments()
      } catch (uploadError) {
        console.warn('File upload failed, continuing without attachments')
      }

      let budgetValue = null
      if (formData.budget) {
        const num = parseFloat(formData.budget)
        if (!isNaN(num) && num > 0) {
          budgetValue = num
        }
      }

      const projectData = {
        client_id: session.user.id,
        client_email: session.user.email,
        client_name: userInfo?.name || session.user.user_metadata?.name || 'Client',
        client_company: userInfo?.company || session.user.user_metadata?.company || '',
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category || 'General',
        service_type: formData.serviceType,
        budget: budgetValue,
        deadline: formData.deadline || null,
        requirements: formData.requirements.trim() || null,
        attachments: attachmentUrls,
        status: 'pending',
        priority: budgetValue && budgetValue > 10000 ? 'high' : 'medium',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('Submitting project data:', projectData)

      const { data: project, error: insertError } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single()

      if (insertError) {
        console.error('Database insert error:', insertError)
        throw new Error(`Database error: ${insertError.message}`)
      }

      if (!project) {
        throw new Error('No project data returned from server')
      }

      alert('✅ Project created successfully!')
      router.push('/client/dashboard')

    } catch (error: any) {
      console.error('Project creation error:', error)
      setError(error.message || 'Failed to create project')
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg"
              disabled={loading}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Start New Project</h1>
              <p className="text-gray-600">Choose a service and describe your needs</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 mt-0.5" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Choose Service */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">1. Choose a Service *</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SERVICES.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => handleServiceSelect(service.id)}
                  disabled={loading}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    formData.serviceType === service.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    {formData.serviceType === service.id && (
                      <CheckCircle className="h-5 w-5 text-orange-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                  <div className="flex items-center gap-1 text-sm">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold">From MK{service.startingPrice}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Project Details */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">2. Project Details</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50"
                  placeholder="e.g., Company Website Redesign"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50"
                  placeholder="Describe your project in detail..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget (MK) - Optional
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={formData.budget}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50"
                      placeholder="e.g., 5000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Desired Deadline - Optional
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                      disabled={loading}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specific Requirements - Optional
                </label>
                <textarea
                  rows={3}
                  value={formData.requirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50"
                  placeholder="Any specific colors, styles, features, or references..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments - Optional (Max 10MB each)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Drop files here or click to upload
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Images, PDFs, documents, etc.
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                    disabled={loading}
                    className="hidden"
                    id="file-upload"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                  <label
                    htmlFor="file-upload"
                    className={`inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Upload className="h-5 w-5" />
                    Choose Files
                  </label>
                </div>
                
                {formData.attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-500" />
                          <div>
                            <span className="text-sm block">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            attachments: prev.attachments.filter((_, i) => i !== index)
                          }))}
                          disabled={loading}
                          className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {uploadProgress > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Uploading files...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step 3: Review & Submit */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">3. Review & Submit</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Service:</span>
                <span className="font-semibold">
                  {SERVICES.find(s => s.id === formData.serviceType)?.name || 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Budget:</span>
                <span className="font-semibold">
                  {formData.budget ? `MK${parseFloat(formData.budget).toLocaleString()}` : 'Not specified'}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Attachments:</span>
                <span className="font-semibold">
                  {formData.attachments.length} file(s)
                </span>
              </div>
            </div>

            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg mb-6">
              <h3 className="font-semibold text-orange-900 mb-2">What happens next?</h3>
              <ul className="space-y-2 text-sm text-orange-800">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>We'll review your project within 24 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Our team will contact you for clarifications if needed</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>You'll receive a detailed proposal and quote</span>
                </li>
              </ul>
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading || !formData.serviceType || !formData.title.trim() || !formData.description.trim()}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating Project...
                  </>
                ) : (
                  'Submit Project Request'
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}