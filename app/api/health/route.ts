import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { simpleRedisHelpers } from '@/lib/redis-simple'

export async function GET() {
  const services = {
    database: 'disconnected',
    redis: 'disconnected'
  }
  
  let isHealthy = true

  try {
    // Check database connection with timeout
    console.log('🔄 Checking database health...')
    const dbQuery = prisma.$queryRaw`SELECT 1`
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database timeout')), 5000)
    )
    
    await Promise.race([dbQuery, timeout])
    services.database = 'connected'
    console.log('✅ Database connected')
  } catch (error) {
    console.error('❌ Database health check failed:', error)
    services.database = 'disconnected'
    isHealthy = false
  }

  try {
    // Temporarily skip Redis check to fix UI hanging
    console.log('⚠️ Skipping Redis health check temporarily')
    services.redis = 'skipped'
    // isHealthy = false // Don't mark as unhealthy for now
  } catch (error) {
    console.error('❌ Redis health check failed:', error)
    services.redis = 'disconnected'
    isHealthy = false
  }
    
  const healthData = {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services
  }

  return NextResponse.json(healthData, { 
    status: isHealthy ? 200 : 503 
  })
}
