import { NextRequest, NextResponse } from 'next/server'
import { simpleRedisHelpers } from '@/lib/redis-simple'
import { CacheService } from '@/lib/utils/cache'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, key, value, ttl, queueName, item } = body

    switch (action) {
      case 'ping':
        {
          console.log('🔄 Testing Redis ping via API...')
          const isConnected = await simpleRedisHelpers.ping()
          console.log('📡 API ping result:', isConnected)
          return NextResponse.json({
            success: true,
            data: { connected: isConnected, message: isConnected ? 'PONG' : 'No response' }
          })
        }

      case 'set':
        {
          if (!key || value === undefined) {
            return NextResponse.json({
              success: false,
              error: 'Key and value are required'
            }, { status: 400 })
          }

          const result = await simpleRedisHelpers.set(key, value, ttl)
          return NextResponse.json({
            success: result,
            data: { key, value, ttl, cached: result }
          })
        }

      case 'get':
        {
          if (!key) {
            return NextResponse.json({
              success: false,
              error: 'Key is required'
            }, { status: 400 })
          }

          const result = await simpleRedisHelpers.get(key)
          return NextResponse.json({
            success: true,
            data: { key, value: result, found: result !== null }
          })
        }

      case 'delete':
        {
          if (!key) {
            return NextResponse.json({
              success: false,
              error: 'Key is required'
            }, { status: 400 })
          }

          const result = await simpleRedisHelpers.del(key)
          return NextResponse.json({
            success: result,
            data: { key, deleted: result }
          })
        }

      case 'queue':
        {
          if (!queueName || !item) {
            return NextResponse.json({
              success: false,
              error: 'Queue name and item are required'
            }, { status: 400 })
          }

          const result = await redisHelpers.addToQueue(queueName, item)
          const queueItems = await redisHelpers.getFromQueue(queueName, 5)
          
          return NextResponse.json({
            success: result,
            data: { 
              queueName, 
              item, 
              added: result,
              currentQueue: queueItems
            }
          })
        }

      case 'stats':
        {
          const stats = await CacheService.getCacheStats()
          return NextResponse.json({
            success: true,
            data: stats
          })
        }

      case 'demo-cache':
        {
          // Demonstrate caching with business use case
          const businessId = 'demo-business-123'
          const demoData = {
            name: 'Demo Restaurant',
            location: 'Bangkok, Thailand',
            services: ['Table Booking', 'Takeaway Order'],
            currentQueue: 15,
            averageWaitTime: '25 minutes',
            lastUpdated: new Date().toISOString()
          }

          // Cache the demo business data
          const cached = await CacheService.cacheBusinessInfo(businessId, demoData, 300) // 5 minutes TTL
          
          // Retrieve it to verify
          const retrieved = await CacheService.getCachedBusinessInfo(businessId)

          return NextResponse.json({
            success: cached,
            data: {
              businessId,
              originalData: demoData,
              cachedData: retrieved,
              cacheWorking: JSON.stringify(demoData) === JSON.stringify(retrieved)
            }
          })
        }

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}. Available actions: ping, set, get, delete, queue, stats, demo-cache`
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Redis test API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

export async function GET() {
  // Health check for Redis test endpoint
  try {
    console.log('🔄 Testing Redis connection for API endpoint...')
    const isConnected = await simpleRedisHelpers.ping()
    console.log('📡 Redis test API result:', isConnected)
    return NextResponse.json({
      status: 'Redis Test API is running',
      redis_connected: isConnected,
      available_actions: ['ping', 'set', 'get', 'delete', 'queue', 'stats', 'demo-cache'],
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Redis Test API error:', error)
    return NextResponse.json({
      status: 'Redis Test API error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
