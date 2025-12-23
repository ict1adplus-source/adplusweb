'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/contexts/AuthContext'
import { 
  ArrowLeft, Upload, MessageSquare, CheckCircle, 
  Clock, FileText, Image as ImageIcon, Download, Eye
} from 'lucide-react'

export default function ProjectDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<any>(null)
  const [milestones, setMilestones] = useState<any[]>([])
  const [files, setFiles] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [uploadingFile, setUploadingFile] = useState(false)

  useEffect(() => {
    loadProjectData()
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('project-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'project_milestones',
          filter: `project_id=eq.${params.id}`
        }, 
        () => {
          loadMilestones()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [params.id])

  const loadProjectData = async () => {
    try {
      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .eq('id', params.id)
        .single()

      setProject(projectData)
      await loadMilestones()
      await loadFiles()
    } catch (error) {
      console.error('Error loading project:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMilestones = async () => {
    const { data } = await supabase
      .from('project_milestones')
      .select('*')
      .eq('project_id', params.id)
      .order('created_at', { ascending: true })

    setMilestones(data || [])
  }

  const loadFiles = async () => {
    const { data } = await supabase
      .from('project_files')
      .select('*')
      .eq('project_id', params.id)
      .order('uploaded_at', { ascending: false })

    setFiles(data || [])
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${params.id}/client_${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(fileName, file)
      
      if (uploadError) throw uploadError

      await supabase
        .from('project_files')
        .insert([
          {
            project_id: params.id,
            file_path: fileName,
            uploaded_by: session?.user.id,
            uploaded_by_type: 'client',
            uploaded_at: new Date().toISOString(),
          }
        ])

      await loadFiles()
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setUploadingFile(false)
    }
  }

  const handleDownloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('project-files')
        .download(filePath)
      
      if (error) throw error
      
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading file:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => router.push('/client/dashboard')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                <p className="text-gray-600 mt-2">{project.description}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {project.status}
                  </span>
                  <span className="text-gray-500">
                    Service: {project.service_type}
                  </span>
                  {project.budget && (
                    <span className="text-gray-500">
                      Budget: MK{project.budget.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setActiveTab('messages')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90"
              >
                <MessageSquare className="h-4 w-4" />
                Message Team
              </button>
            </div>
          </div>

          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 font-medium ${activeTab === 'overview' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-600'}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('milestones')}
                className={`px-6 py-4 font-medium ${activeTab === 'milestones' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-600'}`}
              >
                Milestones
              </button>
              <button
                onClick={() => setActiveTab('files')}
                className={`px-6 py-4 font-medium ${activeTab === 'files' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-600'}`}
              >
                Files ({files.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                    <p className="text-gray-600">{project.description}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Additional Notes</h4>
                    <p className="text-gray-600">{project.additional_notes || 'No additional notes'}</p>
                  </div>
                </div>
                {project.deadline && (
                  <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-medium text-orange-800 mb-2">Deadline</h4>
                    <p className="text-orange-700">
                      {new Date(project.deadline).toLocaleDateString()} - {new Date(project.deadline).toLocaleTimeString()}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'milestones' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Project Milestones</h3>
                  <span className="text-sm text-gray-500">
                    {milestones.filter(m => m.status === 'completed').length} of {milestones.length} completed
                  </span>
                </div>
                <div className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <div key={milestone.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {milestone.status === 'completed' ? (
                            <CheckCircle className="h-6 w-6 text-green-500" />
                          ) : milestone.status === 'in-progress' ? (
                            <Clock className="h-6 w-6 text-blue-500" />
                          ) : (
                            <Clock className="h-6 w-6 text-gray-400" />
                          )}
                          <div>
                            <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                            <p className="text-sm text-gray-600">{milestone.description}</p>
                            {milestone.completed_at && (
                              <p className="text-xs text-gray-500 mt-1">
                                Completed: {new Date(milestone.completed_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                          milestone.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {milestone.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'files' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Project Files</h3>
                  <div>
                    <input
                      type="file"
                      id="file-upload"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:opacity-90 cursor-pointer"
                    >
                      <Upload className="h-4 w-4" />
                      {uploadingFile ? 'Uploading...' : 'Upload File'}
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {files.map((file) => (
                    <div key={file.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {file.file_path.includes('.pdf') ? (
                            <FileText className="h-8 w-8 text-red-500" />
                          ) : file.file_path.includes('.doc') ? (
                            <FileText className="h-8 w-8 text-blue-500" />
                          ) : (
                            <ImageIcon className="h-8 w-8 text-green-500" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900 truncate">
                              {file.file_path.split('/').pop()}
                            </p>
                            <p className="text-sm text-gray-500">
                              Uploaded by {file.uploaded_by_type}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(file.uploaded_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDownloadFile(file.file_path, file.file_path.split('/').pop())}
                            className="p-1 text-gray-600 hover:text-orange-600"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}