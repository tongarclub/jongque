"use client"

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

interface MigrationResult {
  success: boolean
  message?: string
  data?: {
    migrationOutput: string
    generateOutput: string
    userCount: number
  }
  error?: {
    message: string
    code: string
    stdout: string
    stderr: string
  }
  timestamp: string
}

export default function MigrateDatabasePage() {
  const [result, setResult] = useState<MigrationResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleMigrateDatabase = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/migrate-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      setResult(data)

    } catch (error) {
      console.error('Migration failed:', error)
      setResult({
        success: false,
        error: {
          message: 'Network error or server unavailable',
          code: 'NETWORK_ERROR',
          stdout: '',
          stderr: ''
        },
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold mb-6">🔄 Database Migration</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Run Database Migrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">This will:</h3>
              <ul className="list-disc ml-6 space-y-1 text-blue-700">
                <li>Apply pending database migrations</li>
                <li>Update database schema to latest version</li>
                <li>Generate fresh Prisma client</li>
                <li>Safe for production use</li>
              </ul>
            </div>
            
            <button
              onClick={handleMigrateDatabase}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Running migrations...' : 'Run Database Migrations'}
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
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold">Migration Output:</h4>
                        <pre className="bg-white p-2 rounded border text-xs overflow-auto max-h-32">
                          {result.data.migrationOutput || 'No output'}
                        </pre>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold">Generate Output:</h4>
                        <pre className="bg-white p-2 rounded border text-xs overflow-auto max-h-32">
                          {result.data.generateOutput || 'No output'}
                        </pre>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold">Database Status:</h4>
                        <p>Users found: {result.data.userCount}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <a 
                      href="/admin/setup-database" 
                      className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 mr-2"
                    >
                      Setup Database
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
                  
                  {result.error?.stdout && (
                    <div className="mt-2">
                      <h4 className="font-semibold text-sm">STDOUT:</h4>
                      <pre className="bg-white p-2 rounded border text-xs overflow-auto max-h-32">
                        {result.error.stdout}
                      </pre>
                    </div>
                  )}
                  
                  {result.error?.stderr && (
                    <div className="mt-2">
                      <h4 className="font-semibold text-sm">STDERR:</h4>
                      <pre className="bg-white p-2 rounded border text-xs overflow-auto max-h-32">
                        {result.error.stderr}
                      </pre>
                    </div>
                  )}
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
            <p className="text-sm text-gray-600">After successful migration:</p>
            <ol className="list-decimal ml-6 space-y-1 text-sm">
              <li>Go to <a href="/admin/setup-database" className="text-blue-600 hover:underline">Setup Database</a></li>
              <li>Reset and seed the database with fresh data</li>
              <li>Test login with admin credentials</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
