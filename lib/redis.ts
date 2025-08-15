import { createClient, RedisClientType } from 'redis'

declare global {
  var __redis: RedisClientType | undefined
}

let redis: RedisClientType

const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 10000,
    commandTimeout: 10000,
    reconnectStrategy: (retries: number) => {
      console.log(`Redis reconnect attempt ${retries}`)
      if (retries > 5) return false
      return Math.min(retries * 100, 2000)
    }
  },
  retry_delay: 500
}

if (process.env.NODE_ENV === 'production') {
  redis = createClient(redisConfig)
} else {
  if (!global.__redis) {
    global.__redis = createClient(redisConfig)
  }
  redis = global.__redis
}

// Connect to Redis with better error handling
async function connectRedis() {
  if (!redis.isOpen) {
    try {
      await redis.connect()
      console.log('✅ Redis connected successfully')
    } catch (err) {
      console.error('❌ Redis connection error:', err)
    }
  }
}

// Attempt to connect
connectRedis()

// Connection configuration is set during client creation

// Handle Redis connection events
redis.on('error', (err) => {
  console.error('❌ Redis error:', err.message)
})

redis.on('connect', () => {
  console.log('🔄 Redis connecting...')
})

redis.on('ready', () => {
  console.log('✅ Redis ready for operations')
})

redis.on('end', () => {
  console.log('📴 Redis connection ended')
})

redis.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...')
})

export { redis }

// Helper functions for common Redis operations
export const redisHelpers = {
  // Session management
  async setSession(sessionId: string, data: any, ttl: number = 3600) {
    try {
      await redis.setEx(`session:${sessionId}`, ttl, JSON.stringify(data))
      return true
    } catch (error) {
      console.error('Error setting session:', error)
      return false
    }
  },

  async getSession(sessionId: string) {
    try {
      const data = await redis.get(`session:${sessionId}`)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Error getting session:', error)
      return null
    }
  },

  async deleteSession(sessionId: string) {
    try {
      await redis.del(`session:${sessionId}`)
      return true
    } catch (error) {
      console.error('Error deleting session:', error)
      return false
    }
  },

  // Caching
  async set(key: string, value: any, ttl?: number) {
    try {
      if (!redis.isOpen) {
        await connectRedis()
        if (!redis.isOpen) return false
      }
      
      const serialized = JSON.stringify(value)
      if (ttl) {
        await redis.setEx(key, ttl, serialized)
      } else {
        await redis.set(key, serialized)
      }
      return true
    } catch (error) {
      console.error('Error setting cache:', error)
      return false
    }
  },

  async get(key: string) {
    try {
      if (!redis.isOpen) {
        await connectRedis()
        if (!redis.isOpen) return null
      }
      
      const data = await redis.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Error getting cache:', error)
      return null
    }
  },

  async del(key: string) {
    try {
      await redis.del(key)
      return true
    } catch (error) {
      console.error('Error deleting cache:', error)
      return false
    }
  },

  // Queue operations for booking system
  async addToQueue(queueName: string, item: any, priority?: number) {
    try {
      const score = priority || Date.now()
      await redis.zAdd(`queue:${queueName}`, { score, value: JSON.stringify(item) })
      return true
    } catch (error) {
      console.error('Error adding to queue:', error)
      return false
    }
  },

  async getFromQueue(queueName: string, count: number = 1) {
    try {
      const items = await redis.zRange(`queue:${queueName}`, 0, count - 1)
      return items.map(item => JSON.parse(item))
    } catch (error) {
      console.error('Error getting from queue:', error)
      return []
    }
  },

  async removeFromQueue(queueName: string, item: any) {
    try {
      await redis.zRem(`queue:${queueName}`, JSON.stringify(item))
      return true
    } catch (error) {
      console.error('Error removing from queue:', error)
      return false
    }
  },

  // Simple health check
  async ping() {
    try {
      // Ensure connection
      if (!redis.isOpen) {
        console.log('🔄 Redis not connected, attempting to connect...')
        await connectRedis()
      }

      if (!redis.isOpen) {
        console.log('❌ Redis connection failed')
        return false
      }

      // Perform ping
      console.log('📡 Pinging Redis...')
      const result = await redis.ping()
      console.log('📡 Redis ping result:', result)
      return result === 'PONG'
    } catch (error) {
      console.error('❌ Redis ping failed:', error instanceof Error ? error.message : error)
      return false
    }
  },

  // Get Redis info
  async getInfo() {
    try {
      return await redis.info()
    } catch (error) {
      console.error('Error getting Redis info:', error)
      return null
    }
  }
}
