'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/contexts/AuthContext'
import { Upload, X, FileText, Calendar, DollarSign, AlertCircle, CheckCircle } from 'lucide-react'

export default function CreateProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files)
    const totalFiles = uploadedFiles.length + newFiles.length
    
    if (totalFiles > 10) {
      setError('Maximum 10 files allowed')
      return
    }

    setUploadedFiles(prev => [...prev, ...newFiles])
    
    // Create preview URLs
    newFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrls(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async (projectId: string) => {
    const uploadPromises = uploadedFiles.map(async (file, index) => {
      const fileExt = file.name.split('.').pop()
      const fileName = `${projectId}/${Date.now()}_${index}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(fileName, file)
      
      if (uploadError) throw uploadError
      
      return fileName
    })

    return await Promise.all(uploadPromises)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData(e.currentTarget)
      const title = formData.get('title') as string
      const description = formData.get('description') as string
      const serviceType = formData.get('serviceType') as string
      const deadline = formData.get('deadline') as string
      const budget = formData.get('budget') as string
      const additionalNotes = formData.get('additionalNotes') as string

      // Get current user
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login')
        return
      }

      // Create project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert([
          {
            title,
            description,
            service_type: serviceType,
            deadline,
            budget: budget ? parseInt(budget) : null,
            additional_notes: additionalNotes,
            client_id: session.user.id,
            client_email: session.user.email,
            status: 'pending',
            created_at: new Date().toISOString(),
          }
        ])
        .select()
        .single()

      if (projectError) throw projectError

      // Upload files if any
      if (uploadedFiles.length > 0) {
        setUploading(true)
        const filePaths = await uploadFiles(project.id)
        
        // Save file references to database
        await supabase
          .from('project_files')
          .insert(
            filePaths.map(path => ({
              project_id: project.id,
              file_path: path,
              uploaded_by: session.user.id,
              uploaded_at: new Date().toISOString(),
            }))
          )
      }

      setSuccess('Project created successfully! Redirecting to dashboard...')
      
      // Create initial milestone
      await supabase
        .from('project_milestones')
        .insert([
          {
            project_id: project.id,
            title: 'Project Initiated',
            description: 'Project has been created and is awaiting review',
            status: 'completed',
            created_at: new Date().toISOString(),
          }
        ])

      setTimeout(() => {
        router.push('/client/dashboard')
      }, 2000)

    } catch (error: any) {
      setError(error.message || 'Failed to create project')
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Start New Project</h1>
          <p className="text-gray-600 mt-2">Fill in the details below to create your project</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title *
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., Company Logo Design"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type *
                </label>
                <select
                  name="serviceType"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select a service</option>
                  <option value="branding">Branding</option>
                  <option value="graphic-design">Graphic Design</option>
                  <option value="web-design">Web & App Design</option>
                  <option value="layout-design">Layout Design</option>
                  <option value="social-media">Social Media Marketing</option>
                  <option value="motion-graphics">Motion Graphics</option>
                  <option value="printing">Printing Services</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Description *
              </label>
              <textarea
                name="description"
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Describe your project requirements in detail..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline (Optional)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    name="deadline"
                    type="date"
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget in MK (Optional)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    name="budget"
                    type="number"
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., 50000"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Reference Files (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Click to upload files or drag and drop</p>
                  <p className="text-sm text-gray-500 mt-1">Images, PDF, Word docs (max 10 files)</p>
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Uploaded Files ({uploadedFiles.length})
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="border rounded-lg p-3 bg-gray-50">
                          {file.type.startsWith('image/') ? (
                            <img
                              src={previewUrls[index]}
                              alt={file.name}
                              className="w-full h-24 object-cover rounded mb-2"
                            />
                          ) : (
                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          )}
                          <p className="text-xs text-gray-600 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                name="additionalNotes"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Any additional information or special requirements..."
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-green-600">{success}</p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push('/client/dashboard')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploading}
                className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50"
              >
                {loading || uploading ? 'Creating Project...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">What happens next?</p>
              <p className="text-sm text-blue-700 mt-1">
                1. Our team will review your project within 24 hours<br />
                2. We'll assign a dedicated project manager<br />
                3. You'll receive updates on milestones and can communicate directly with the team<br />
                4. Uploaded files are securely stored and accessible to the admin team
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}