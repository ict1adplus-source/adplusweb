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
  Image as ImageIcon
} from 'lucide-react'

export default function CreateProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userData, setUserData] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [serviceType, setServiceType] = useState('website')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientCompany, setClientCompany] = useState('')
  const [category, setCategory] = useState('general')
  const [priority, setPriority] = useState('medium')
  const [deadline, setDeadline] = useState('')
  const [budget, setBudget] = useState('')
  const [requirements, setRequirements] = useState<string[]>([''])
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [additionalNotes, setAdditionalNotes] = useState('')

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserData(user)
        setClientName(user.user_metadata?.name || '')
        setClientEmail(user.email || '')
        setClientCompany(user.user_metadata?.company || '')
      }
    }
    fetchUserData()
  }, [])

  const SERVICE_TYPES = [
    'website', 'marketing', 'design', 'seo', 'social', 'content',
    'video', 'branding', 'ecommerce', 'mobile', 'consulting', 'other'
  ]

  // File upload handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    
    const newFiles = Array.from(files)
    setUploadedFiles(prev => [...prev, ...newFiles])
    
    // Reset file input
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
        .upload(fileName, file)
      
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

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('You must be logged in to create a project')
      
      // Validate required fields
      if (!title.trim()) throw new Error('Project title is required')
      if (!description.trim()) throw new Error('Description is required')
      if (!clientName.trim()) throw new Error('Client name is required')
      if (!clientEmail.trim()) throw new Error('Client email is required')
      if (!serviceType.trim()) throw new Error('Service type is required')

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(clientEmail)) {
        throw new Error('Please enter a valid email address')
      }

      // First create the project
      const projectData = {
        title: title.trim(),
        description: description.trim(),
        client_email: clientEmail.trim(),
        client_name: clientName.trim(),
        service_type: serviceType,
        client_id: user.id,
        client_company: clientCompany.trim() || null,
        category: category,
        priority: priority,
        status: 'pending',
        deadline: deadline ? new Date(deadline).toISOString() : null,
        budget: budget ? parseFloat(budget) : null,
        requirements: requirements.filter(req => req.trim() !== ''),
        additional_notes: additionalNotes.trim() || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data: project, error: insertError } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single()

      if (insertError) throw insertError

      // Upload files if any
      if (uploadedFiles.length > 0) {
        setUploadingFiles(true)
        const uploadedPaths = await uploadFilesToStorage(project.id)
        
        // Save file references to database
        if (uploadedPaths.length > 0) {
          const fileRecords = uploadedPaths.map(path => ({
            project_id: project.id,
            file_path: path,
            uploaded_by: user.id,
            uploaded_by_type: 'client',
            uploaded_at: new Date().toISOString(),
          }))

          await supabase.from('project_files').insert(fileRecords)
        }
      }

      // Success - redirect to dashboard
      router.push('/client/dashboard')
      
    } catch (error: any) {
      console.error('Error:', error)
      setError(error.message || 'Failed to create project')
    } finally {
      setLoading(false)
      setUploadingFiles(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/client/dashboard')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
          <p className="text-gray-600 mt-2">Fill in all required details for your new project request</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* ... Keep existing form sections (Client Info, Project Details, etc.) ... */}
            {/* Client Information Section */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-orange-500" />
                Client Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      required
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                {/* ... other client fields ... */}
              </div>
            </div>

            {/* ... Rest of form sections ... */}

            {/* NEW: File Upload Section */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Paperclip className="h-5 w-5 mr-2 text-orange-500" />
                Attachments
              </h2>
              
              <div className="space-y-4">
                {/* File upload area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">Drop files here or click to upload</p>
                    <p className="text-sm text-gray-500">Supports images, PDFs, Word docs, Excel files</p>
                    <p className="text-xs text-gray-400 mt-2">Max file size: 10MB</p>
                  </label>
                </div>

                {/* File list */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">Selected files ({uploadedFiles.length}):</p>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <ImageIcon className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="font-medium text-gray-900 truncate max-w-xs">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(index)}
                            className="p-1 text-gray-400 hover:text-red-500"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Error Display */}
            {(error || uploadingFiles) && (
              <div className={`p-4 rounded-lg ${error ? 'bg-red-50 border border-red-200 text-red-600' : 'bg-blue-50 border border-blue-200 text-blue-600'}`}>
                {error ? (
                  <strong>Error:</strong>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Uploading files...
                  </div>
                )}
                <span className="ml-2">{error || `${uploadedFiles.length} file(s) uploading...`}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6 border-t">
              <button
                type="submit"
                disabled={loading || uploadingFiles}
                className="w-full flex items-center justify-center bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50"
              >
                {loading ? (
                  'Creating Project...'
                ) : uploadingFiles ? (
                  'Uploading Files...'
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Create Project
                  </>
                )}
              </button>
              
              <p className="mt-4 text-sm text-gray-500 text-center">
                Fields marked with * are required
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}