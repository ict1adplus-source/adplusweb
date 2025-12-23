'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Mail, CheckCircle, Clock, ArrowRight, RefreshCw } from 'lucide-react'

function VerifyEmailContent() {
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [codeSent, setCodeSent] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, sendVerificationCode, verifyEmailCode, confirmEmailVerified } = useAuth()

  useEffect(() => {
    // Get email from URL or auth context
    const urlEmail = searchParams.get('email')
    if (urlEmail) {
      setEmail(decodeURIComponent(urlEmail))
      sendNewCode(decodeURIComponent(urlEmail))
    } else if (user?.email) {
      setEmail(user.email)
      sendNewCode(user.email)
    }
  }, [user, searchParams])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const sendNewCode = async (emailToSend: string) => {
    setLoading(true)
    setError('')
    
    try {
      const { data, error } = await sendVerificationCode(emailToSend)
      
      if (error) throw error
      
      setCodeSent(true)
      setSuccess('A new 6-digit verification code has been sent to your email.')
      setResendCooldown(60) // 60 seconds cooldown
    } catch (error: any) {
      setError(error.message || 'Failed to send verification code')
    } finally {
      setLoading(false)
    }
  }

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
      
      // Auto-submit when all digits are filled
      if (index === 5 && value) {
        const fullCode = [...newCode].join('')
        if (fullCode.length === 6) {
          handleSubmitCode(fullCode)
        }
      }
    }
  }

  const handleSubmitCode = async (code: string) => {
    setLoading(true)
    setError('')

    if (!email) {
      setError('Email not found. Please try again.')
      setLoading(false)
      return
    }

    if (code.length !== 6) {
      setError('Please enter the full 6-digit code')
      setLoading(false)
      return
    }

    try {
      // Verify the code
      const { data, error } = await verifyEmailCode(email, code)
      if (error) throw error
      
      // Confirm email verification in user metadata
      const { error: confirmError } = await confirmEmailVerified(email)
      if (confirmError) {
        console.warn('Could not update user metadata:', confirmError)
      }
      
      setSuccess('Email verified successfully! Redirecting to dashboard...')
      
      // Clear the code
      setVerificationCode(['', '', '', '', '', ''])
      
      // Redirect based on user type
      setTimeout(() => {
        const isAdmin = email.includes('admin') || email === 'yamikanitambala@gmail.com' || email === 'yankhojchigaru@gmail.com'
        if (isAdmin) {
          window.location.href = '/admin/dashboard'
        } else {
          window.location.href = '/client/dashboard'
        }
      }, 2000)
    } catch (error: any) {
      setError(error.message || 'Invalid verification code')
      // Clear invalid code
      setVerificationCode(['', '', '', '', '', ''])
      // Focus first input
      const firstInput = document.getElementById('code-0')
      if (firstInput) (firstInput as HTMLInputElement).focus()
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = verificationCode.join('')
    await handleSubmitCode(code)
  }

  const handleResendCode = async () => {
    if (resendCooldown > 0 || !email) return
    await sendNewCode(email)
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()
    
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('')
      setVerificationCode(digits)
      
      // Auto-submit
      setTimeout(() => {
        handleSubmitCode(pastedData)
      }, 100)
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
            Enter the 6-digit code sent to <span className="font-semibold">{email}</span>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            The code will expire in 10 minutes
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} onPaste={handlePaste}>
            {/* Code Input */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                6-Digit Verification Code
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
                    onFocus={(e) => e.target.select()}
                    className="w-full h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors"
                    autoFocus={index === 0}
                    disabled={loading}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Tip: You can paste the entire 6-digit code
              </p>
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
                className="inline-flex items-center text-orange-600 hover:text-orange-800 font-medium disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {resendCooldown > 0 ? (
                  `Resend code in ${resendCooldown}s`
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

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-blue-700">
              <strong>Development Mode:</strong> Check your browser console for the verification code
            </p>
            <p className="text-xs text-blue-600 mt-1">
              In production, this code would be sent to your email
            </p>
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