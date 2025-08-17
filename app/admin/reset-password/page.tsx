"use client"

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

interface ResetResult {
  success: boolean
  message?: string
  user?: any
  newPassword?: string
  error?: {
    message: string
    code: string
  }
  timestamp: string
}

export default function ResetPasswordPage() {
  const [result, setResult] = useState<ResetResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleResetPassword = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      setResult(data)

    } catch (error) {
      console.error('Reset password failed:', error)
      setResult({
        success: false,
        error: {
          message: 'Network error or server unavailable',
          code: 'NETWORK_ERROR'
        },
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold mb-6">🔐 Admin Password Reset</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Reset Admin Password</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              This will reset the admin password to <code className="bg-gray-100 px-2 py-1 rounded">admin123</code>
            </p>
            
            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Admin Password'}
            </button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>
              {result.success ? '✅ Success' : '❌ Error'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p><strong>Timestamp:</strong> {result.timestamp}</p>
              
              {result.success ? (
                <div className="bg-green-50 p-4 rounded">
                  <p className="text-green-800 font-semibold">{result.message}</p>
                  
                  {result.user && (
                    <div className="mt-3">
                      <h4 className="font-semibold">Updated User:</h4>
                      <ul className="ml-4 space-y-1 text-sm">
                        <li>ID: {result.user.id}</li>
                        <li>Email: {result.user.email}</li>
                        <li>Name: {result.user.name}</li>
                        <li>Role: {result.user.role}</li>
                        <li>Verified: {result.user.isVerified ? '✅' : '❌'}</li>
                      </ul>
                    </div>
                  )}
                  
                  {result.newPassword && (
                    <div className="mt-3">
                      <p><strong>New Password:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{result.newPassword}</code></p>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <a 
                      href="/signin" 
                      className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Go to Sign In
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 p-4 rounded">
                  <p className="text-red-800 font-semibold">Error: {result.error?.message}</p>
                  <p className="text-red-600 text-sm">Code: {result.error?.code}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <a 
              href="/debug-auth" 
              className="inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 mr-2"
            >
              Debug Auth
            </a>
            <a 
              href="/signin" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Sign In
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
