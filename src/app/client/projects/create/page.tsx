'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/contexts/AuthContext'
import { ArrowLeft, Upload, AlertCircle } from 'lucide-react'

export default function CreateProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    service_type: '',
    budget: '',
    deadline: '',
    requirements: '',
  })

  const serviceTypes = [
    'web-development',
    'mobile-app',
    'ui-ux-design',
    'graphic-design',
    'digital-marketing',
    'seo',
    'content-writing',
    'video-production',
    'other'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Get current session with proper error handling
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        setError('Authentication error. Please sign out and sign back in.')
        setLoading(false)
        return
      }

      if (!session) {
        setError('You must be logged in to create a project. Please sign in.')
        router.push('/auth/login')
        return
      }

      // Verify the user exists in our database
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('email', session.user.email)
        .single()

      if (userError || !user) {
        console.error('User not found in database:', userError)
        setError('Your account information is not complete. Please contact support.')
        setLoading(false)
        return
      }

      // Create the project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          title: formData.title,
          description: formData.description,
          service_type: formData.service_type,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          deadline: formData.deadline || null,
          requirements: formData.requirements,
          client_id: session.user.id,
          client_email: session.user.email,
          status: 'pending',
          priority: 'medium',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (projectError) {
        console.error('Project creation error:', projectError)
        setError(`Failed to create project: ${projectError.message}`)
        setLoading(false)
        return
      }

      // Also create an initial payment record
      if (formData.budget) {
        await supabase
          .from('payments')
          .insert({
            project_id: project.id,
            total_amount: parseFloat(formData.budget),
            amount_paid: 0,
            status: 'pending',
            payment_date: null,
            notes: 'Initial project setup',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
      }

      // Redirect to project view
      router.push(`/client/projects/${project.id}`)

    } catch (err: any) {
      console.error('Unexpected error:', err)
      setError(`An unexpected error occurred: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/client/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
                <p className="text-gray-600">Fill in the details below to start a new project</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium text-red-800">{error}</p>
                  <button
                    onClick={() => router.push('/auth/login')}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Click here to sign in again
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter project title"
              />
            </div>

            {/* Service Type */}
            <div>
              <label htmlFor="service_type" className="block text-sm font-medium text-gray-700 mb-2">
                Service Type *
              </label>
              <select
                id="service_type"
                name="service_type"
                required
                value={formData.service_type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Select a service type</option>
                {serviceTypes.map(type => (
                  <option key={type} value={type}>
                    {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Project Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Describe your project in detail..."
              />
            </div>

            {/* Requirements */}
            <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                Specific Requirements
              </label>
              <textarea
                id="requirements"
                name="requirements"
                rows={3}
                value={formData.requirements}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Any specific requirements or preferences?"
              />
            </div>

            {/* Budget and Deadline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Budget (MK)
                </label>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  min="0"
                  step="0.01"
                  value={formData.budget}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                  Desired Deadline
                </label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Required Fields Note */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">Note:</span> Fields marked with * are required
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push('/client/dashboard')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Project...' : 'Create Project'}
              </button>
            </div>
          </form>

          {/* Debug Info - Remove in production */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <p>Logged in as: ict1adplus@gmail.com</p>
              <p className="mt-1">If you continue to experience issues, please:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Sign out and sign back in</li>
                <li>Clear your browser cache and cookies</li>
                <li>Contact support if the problem persists</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}