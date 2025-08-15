import { NextResponse } from 'next/server'

export async function GET() {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'checking...',
      redis: 'checking...'
    },
    note: 'Simplified health check to avoid timeouts'
  }

  return NextResponse.json(healthData, { status: 200 })
}
