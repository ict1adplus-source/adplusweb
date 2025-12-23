// app/auth/verify-email/page.tsx
'use client'

import Link from 'next/link'
import { Mail, CheckCircle } from 'lucide-react'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
            <Mail className="h-8 w-8 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Check Your Email</h1>
          <p className="text-gray-600">
            We've sent you a verification link
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verification Email Sent</h2>
            <p className="text-gray-600 mb-6">
              Please check your email inbox and click the verification link to confirm your account.
              Once verified, you'll be redirected to the login page.
            </p>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> The verification link will redirect you to the login page.
              </p>
            </div>

            <Link
              href="/auth/login"
              className="inline-block w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-all"
            >
              Go to Login
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-500 text-sm">
              Didn't receive the email? Check your spam folder or{' '}
              <Link href="/auth/login" className="text-orange-600 hover:underline">
                try logging in again
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}