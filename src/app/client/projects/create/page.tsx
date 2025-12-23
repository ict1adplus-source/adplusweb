'use client'

import { useState, useEffect } from 'react'
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
  Paperclip
} from 'lucide-react'

export default function CreateProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userData, setUserData] = useState<any>(null)
  
  // Form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [serviceType, setServiceType] = useState('website') // REQUIRED
  const [clientName, setClientName] = useState('') // REQUIRED
  const [clientEmail, setClientEmail] = useState('') // REQUIRED
  const [clientCompany, setClientCompany] = useState('')
  const [category, setCategory] = useState('general')
  const [priority, setPriority] = useState('medium')
  const [deadline, setDeadline] = useState('')
  const [budget, setBudget] = useState('')
  const [requirements, setRequirements] = useState<string[]>([''])
  const [attachments, setAttachments] = useState<string[]>([''])
  const [additionalNotes, setAdditionalNotes] = useState('')

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserData(user)
        // Pre-fill client info from user metadata
        setClientName(user.user_metadata?.name || '')
        setClientEmail(user.email || '')
        setClientCompany(user.user_metadata?.company || '')
      }
    }
    fetchUserData()
  }, [])

  // Service types based on your categories
  const SERVICE_TYPES = [
    'website',
    'marketing',
    'design',
    'seo',
    'social',
    'content',
    'video',
    'branding',
    'ecommerce',
    'mobile',
    'consulting',
    'other'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('You must be logged in to create a project')
      }

      // Validate required fields
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

      // Prepare project data
      const projectData = {
        // Required fields (NOT NULL)
        title: title.trim(),
        description: description.trim(),
        client_email: clientEmail.trim(),
        client_name: clientName.trim(),
        service_type: serviceType,
        
        // Foreign key
        client_id: user.id,
        
        // Optional fields with defaults
        client_company: clientCompany.trim() || null,
        category: category,
        priority: priority,
        status: 'pending',
        
        // Optional fields
        deadline: deadline ? new Date(deadline).toISOString() : null,
        budget: budget ? parseFloat(budget) : null,
        requirements: filteredRequirements.length > 0 ? filteredRequirements : null,
        attachments: attachments.filter(att => att.trim() !== ''),
        additional_notes: additionalNotes.trim() || null,
        
        // System fields
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      console.log('Submitting project data:', projectData)

      // Insert project
      const { data, error: insertError } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single()

      if (insertError) {
        console.error('Insert error details:', insertError)
        throw insertError
      }

      // Success - redirect to projects list
      router.push('/client/projects')
      
    } catch (error: any) {
      console.error('Full error:', error)
      setError(error.message || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
          <p className="text-gray-600 mt-2">Fill in all required details for your new project request</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Client Information Section */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-orange-500" />
                Client Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Name */}
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

                {/* Client Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      required
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="client@example.com"
                    />
                  </div>
                </div>

                {/* Client Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      value={clientCompany}
                      onChange={(e) => setClientCompany(e.target.value)}
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Company Name"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Project Details Section */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-orange-500" />
                Project Details
              </h2>
              
              <div className="space-y-6">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., Website Redesign, Marketing Campaign"
                  />
                </div>

                {/* Service Type - REQUIRED */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Type *
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select Service Type</option>
                    {SERVICE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="general">General</option>
                    <option value="new">New Project</option>
                    <option value="enhancement">Enhancement</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <div className="flex space-x-4">
                    {['low', 'medium', 'high', 'urgent'].map((level) => (
                      <label key={level} className="flex items-center">
                        <input
                          type="radio"
                          name="priority"
                          value={level}
                          checked={priority === level}
                          onChange={(e) => setPriority(e.target.value)}
                          className="h-4 w-4 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="ml-2 capitalize">{level}</span>
                      </label>
                    ))}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Describe your project in detail. Include goals, target audience, specific requirements..."
                  />
                </div>
              </div>
            </div>

            {/* Additional Details Section */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
                Additional Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Deadline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deadline
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      min="0"
                      step="0.01"
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Requirements Section */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
              <div className="space-y-4">
                {requirements.map((req, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => handleRequirementChange(index, e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder={`Requirement ${index + 1}`}
                    />
                    {requirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRequirement(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddRequirement}
                  className="text-orange-600 hover:text-orange-800 font-medium"
                >
                  + Add Another Requirement
                </button>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Notes</h2>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Any additional information, special instructions, or notes..."
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                <strong>Error:</strong> {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50"
              >
                {loading ? (
                  'Creating Project...'
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