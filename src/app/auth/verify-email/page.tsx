'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Mail, CheckCircle, Clock, ArrowRight } from 'lucide-react'

// Create a separate component that uses useSearchParams
function VerifyEmailContent() {
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, verifyEmail, resendVerification } = useAuth()

  useEffect(() => {
    // Get email from URL or auth context
    const urlEmail = searchParams.get('email')
    if (urlEmail) {
      setEmail(urlEmail)
    } else if (user?.email) {
      setEmail(user.email)
    }
  }, [user, searchParams])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...verificationCode]
      newCode[index] = value
      setVerificationCode(newCode)

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`)
        if (nextInput) (nextInput as HTMLInputElement).focus()
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const code = verificationCode.join('')
    if (code.length !== 6) {
      setError('Please enter the full 6-digit code')
      setLoading(false)
      return
    }

    try {
      const { error } = await verifyEmail(code)
      if (error) throw error
      
      setSuccess('Email verified successfully! Redirecting to client dashboard...')
      setTimeout(() => {
        router.push('/client/dashboard')
      }, 2000)
    } catch (error: any) {
      setError(error.message || 'Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (resendCooldown > 0 || !email) return

    setLoading(true)
    setError('')
    
    try {
      const { error } = await resendVerification(email)
      if (error) throw error
      
      setSuccess('Verification code sent! Check your email.')
      setResendCooldown(60) // 60 seconds cooldown
    } catch (error: any) {
      setError(error.message || 'Failed to resend code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
            <Mail className="h-8 w-8 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-gray-600">
            We sent a 6-digit code to <span className="font-semibold">{email}</span>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Check your inbox and enter the code below
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit}>
            {/* Code Input */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Verification Code
              </label>
              <div className="flex justify-between gap-2">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    className="w-full h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors"
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg">
                <CheckCircle className="inline h-4 w-4 mr-2" />
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || verificationCode.join('').length !== 6}
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 mb-4"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading || resendCooldown > 0}
                className="text-orange-600 hover:text-orange-800 font-medium disabled:opacity-50"
              >
                {resendCooldown > 0 ? (
                  <>
                    <Clock className="inline h-4 w-4 mr-1" />
                    Resend code in {resendCooldown}s
                  </>
                ) : (
                  'Resend verification code'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <Link 
                href="/auth/login" 
                className="inline-flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                Back to login
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Didn't receive the email? Check your spam folder or{' '}
            <button
              onClick={() => router.push('/contact')}
              className="text-orange-600 hover:underline"
            >
              contact support
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

// Loading fallback component
function VerifyEmailLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
            <Mail className="h-8 w-8 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main component with Suspense boundary
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailContent />
    </Suspense>
  )
}