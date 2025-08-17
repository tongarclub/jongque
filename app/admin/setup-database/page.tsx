"use client"

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

interface SetupResult {
  success: boolean
  message?: string
  data?: {
    users: number
    businesses: number
    credentials: {
      admin: { email: string, password: string }
      owner: { email: string, password: string }
    }
  }
  error?: {
    message: string
    code: string
  }
  timestamp: string
}

export default function SetupDatabasePage() {
  const [result, setResult] = useState<SetupResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const handleSetupDatabase = async () => {
    if (!confirmed) {
      alert('กรุณายืนยันการลบข้อมูลทั้งหมด')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/setup-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      setResult(data)

    } catch (error) {
      console.error('Setup database failed:', error)
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
      <h1 className="text-2xl font-bold mb-6">🗄️ Production Database Setup</h1>
      
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">⚠️ WARNING: Complete Database Reset</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded border border-red-200">
              <h3 className="font-semibold text-red-800 mb-2">This will:</h3>
              <ul className="list-disc ml-6 space-y-1 text-red-700">
                <li>DELETE ALL existing data in the database</li>
                <li>Reset database structure</li>
                <li>Create fresh admin and sample data</li>
                <li>Cannot be undone</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-4 rounded border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">After setup, you&apos;ll have:</h3>
              <ul className="list-disc ml-6 space-y-1 text-green-700">
                <li>Admin user: admin@jongque.com / admin123</li>
                <li>Business owner: owner@jongque.com / owner123</li>
                <li>Sample business with operating hours</li>
                <li>Sample customers</li>
              </ul>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="confirm"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="confirm" className="text-sm">
                I understand this will DELETE ALL DATA and cannot be undone
              </label>
            </div>
            
            <button
              onClick={handleSetupDatabase}
              disabled={loading || !confirmed}
              className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 disabled:opacity-50 font-semibold"
            >
              {loading ? 'Setting up database...' : 'Setup Production Database'}
            </button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>
              {result.success ? '✅ Setup Completed' : '❌ Setup Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p><strong>Timestamp:</strong> {result.timestamp}</p>
              
              {result.success ? (
                <div className="bg-green-50 p-4 rounded">
                  <p className="text-green-800 font-semibold mb-3">{result.message}</p>
                  
                  {result.data && (
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold">Database Summary:</h4>
                        <ul className="ml-4 space-y-1 text-sm">
                          <li>Users: {result.data.users}</li>
                          <li>Businesses: {result.data.businesses}</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold">Login Credentials:</h4>
                        <div className="ml-4 space-y-2 text-sm">
                          <div className="bg-white p-2 rounded border">
                            <strong>Admin:</strong><br />
                            Email: {result.data.credentials.admin.email}<br />
                            Password: {result.data.credentials.admin.password}
                          </div>
                          <div className="bg-white p-2 rounded border">
                            <strong>Business Owner:</strong><br />
                            Email: {result.data.credentials.owner.email}<br />
                            Password: {result.data.credentials.owner.password}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <a 
                      href="/signin" 
                      className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
                    >
                      Test Login
                    </a>
                    <a 
                      href="/debug-auth" 
                      className="inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                      Debug Auth
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
          <CardTitle>Alternative: Manual Scripts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>If you prefer to run scripts manually:</p>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
{`# Complete setup (all-in-one)
CONFIRM_SETUP=yes node scripts/production-db-setup.js

# Or step by step:
CONFIRM_RESET=yes node scripts/production-db-reset.js
node scripts/production-db-migrate.js
node scripts/production-db-seed.js`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
