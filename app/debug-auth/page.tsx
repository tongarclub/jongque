"use client"

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

interface AuthStatus {
  status: string
  timestamp: string
  database?: {
    connected: boolean
    userCount: number
    adminExists: boolean
  }
  session?: {
    authenticated: boolean
    user: any
  }
  environment?: {
    nodeEnv: string
    nextauthUrl: string
    hasNextauthSecret: boolean
    hasDatabaseUrl: boolean
  }
  error?: {
    message: string
    code: string
  }
}

export default function DebugAuthPage() {
  const { data: session, status } = useSession()
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/status')
      .then(res => res.json())
      .then(data => {
        setAuthStatus(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Failed to fetch auth status:', error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">🔍 Auth Debug</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold mb-6">🔍 Auth Debug Information</h1>
      
      {/* Client Session */}
      <Card>
        <CardHeader>
          <CardTitle>Client Session (useSession)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Status:</strong> {status}</p>
            <p><strong>Authenticated:</strong> {session ? '✅ Yes' : '❌ No'}</p>
            {session && (
              <div>
                <p><strong>User:</strong></p>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(session.user, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Server Status */}
      {authStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Server Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p><strong>Status:</strong> {authStatus.status}</p>
              <p><strong>Timestamp:</strong> {authStatus.timestamp}</p>
              
              {authStatus.error && (
                <div className="bg-red-50 p-3 rounded">
                  <p><strong>Error:</strong> {authStatus.error.message}</p>
                  <p><strong>Code:</strong> {authStatus.error.code}</p>
                </div>
              )}
              
              {authStatus.database && (
                <div>
                  <h4 className="font-semibold">Database:</h4>
                  <ul className="ml-4 space-y-1">
                    <li>Connected: {authStatus.database.connected ? '✅' : '❌'}</li>
                    <li>User Count: {authStatus.database.userCount}</li>
                    <li>Admin Exists: {authStatus.database.adminExists ? '✅' : '❌'}</li>
                  </ul>
                </div>
              )}
              
              {authStatus.session && (
                <div>
                  <h4 className="font-semibold">Server Session:</h4>
                  <ul className="ml-4 space-y-1">
                    <li>Authenticated: {authStatus.session.authenticated ? '✅' : '❌'}</li>
                    {authStatus.session.user && (
                      <li>
                        User: 
                        <pre className="bg-gray-100 p-2 rounded text-sm mt-1 overflow-auto">
                          {JSON.stringify(authStatus.session.user, null, 2)}
                        </pre>
                      </li>
                    )}
                  </ul>
                </div>
              )}
              
              {authStatus.environment && (
                <div>
                  <h4 className="font-semibold">Environment:</h4>
                  <ul className="ml-4 space-y-1">
                    <li>NODE_ENV: {authStatus.environment.nodeEnv}</li>
                    <li>NEXTAUTH_URL: {authStatus.environment.nextauthUrl || 'Not set'}</li>
                    <li>Has NEXTAUTH_SECRET: {authStatus.environment.hasNextauthSecret ? '✅' : '❌'}</li>
                    <li>Has DATABASE_URL: {authStatus.environment.hasDatabaseUrl ? '✅' : '❌'}</li>
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Link 
              href="/signin" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Go to Sign In
            </Link>
            <br />
            <button 
              onClick={() => signOut()} 
              className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Sign Out
            </button>
            <br />
            <button 
              onClick={() => window.location.reload()} 
              className="inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Refresh Page
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
