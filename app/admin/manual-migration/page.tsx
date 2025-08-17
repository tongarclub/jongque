"use client"

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

interface MigrationResult {
  success: boolean
  message?: string
  data?: {
    passwordColumnExists: boolean
    action: string
  }
  error?: {
    message: string
    code: string
  }
  timestamp: string
}

export default function ManualMigrationPage() {
  const [result, setResult] = useState<MigrationResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleManualMigration = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/manual-migration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      setResult(data)

    } catch (error) {
      console.error('Manual migration failed:', error)
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
      <h1 className="text-2xl font-bold mb-6">🔧 Manual Database Migration</h1>
      
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="text-orange-600">⚠️ Manual Schema Update</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-orange-50 p-4 rounded border border-orange-200">
              <h3 className="font-semibold text-orange-800 mb-2">This will:</h3>
              <ul className="list-disc ml-6 space-y-1 text-orange-700">
                <li>Check if password column exists in User table</li>
                <li>Add password column if missing</li>
                <li>Safe alternative to Prisma CLI migration</li>
                <li>Works on Vercel serverless environment</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Why manual migration?</h3>
              <p className="text-blue-700 text-sm">
                Vercel serverless functions cannot run <code>npx prisma migrate deploy</code> 
                due to file system and npm registry restrictions. This manual approach 
                directly executes the required SQL commands.
              </p>
            </div>
            
            <button
              onClick={handleManualMigration}
              disabled={loading}
              className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? 'Running manual migration...' : 'Run Manual Migration'}
            </button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>
              {result.success ? '✅ Migration Completed' : '❌ Migration Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p><strong>Timestamp:</strong> {result.timestamp}</p>
              
              {result.success ? (
                <div className="bg-green-50 p-4 rounded">
                  <p className="text-green-800 font-semibold mb-3">{result.message}</p>
                  
                  {result.data && (
                    <div className="space-y-2">
                      <div>
                        <strong>Password Column:</strong> {result.data.passwordColumnExists ? '✅ Exists' : '❌ Missing'}
                      </div>
                      <div>
                        <strong>Action Taken:</strong> {result.data.action.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <a 
                      href="/admin/setup-database" 
                      className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 mr-2"
                    >
                      Setup Database Now
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
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">After successful manual migration:</p>
            <ol className="list-decimal ml-6 space-y-1 text-sm">
              <li>Go to <a href="/admin/setup-database" className="text-blue-600 hover:underline">Setup Database</a></li>
              <li>Reset and seed the database with fresh data</li>
              <li>Test login with admin credentials</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alternative Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <a 
              href="/admin/migrate-database" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
            >
              Try Prisma Migration
            </a>
            <a 
              href="/admin/setup-database" 
              className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Setup Database
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
