import { createClient, RedisClientType } from 'redis'

let redisClient: RedisClientType | null = null

// Create Redis connection
async function getRedisClient(): Promise<RedisClientType | null> {
  if (!redisClient) {
    try {
      console.log('🔄 Creating Redis client...')
      redisClient = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      })

      redisClient.on('error', (err) => {
        console.error('❌ Redis Client Error:', err.message)
      })

      redisClient.on('connect', () => {
        console.log('🔄 Redis Client Connected')
      })

      redisClient.on('ready', () => {
        console.log('✅ Redis Client Ready')
      })

      console.log('🔄 Connecting to Redis...')
      await redisClient.connect()
      console.log('✅ Redis connected successfully')
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error)
      redisClient = null
    }
  }
  return redisClient
}

// Simple Redis helpers
export const simpleRedisHelpers = {
  async ping(): Promise<boolean> {
    try {
      console.log('📡 Starting Redis ping...')
      const client = await getRedisClient()
      if (!client) {
        console.log('❌ No Redis client available')
        return false
      }

      console.log('📡 Sending ping...')
      const result = await client.ping()
      console.log('📡 Ping result:', result)
      return result === 'PONG'
    } catch (error) {
      console.error('❌ Redis ping error:', error)
      return false
    }
  },

  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const client = await getRedisClient()
      if (!client) return false

      const serialized = JSON.stringify(value)
      if (ttl) {
        await client.setEx(key, ttl, serialized)
      } else {
        await client.set(key, serialized)
      }
      return true
    } catch (error) {
      console.error('❌ Redis set error:', error)
      return false
    }
  },

  async get(key: string): Promise<any> {
    try {
      const client = await getRedisClient()
      if (!client) return null

      const data = await client.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('❌ Redis get error:', error)
      return null
    }
  },

  async del(key: string): Promise<boolean> {
    try {
      const client = await getRedisClient()
      if (!client) return false

      await client.del(key)
      return true
    } catch (error) {
      console.error('❌ Redis delete error:', error)
      return false
    }
  },

  async isConnected(): Promise<boolean> {
    try {
      const client = await getRedisClient()
      return client ? client.isOpen : false
    } catch (error) {
      return false
    }
  },

  async disconnect(): Promise<void> {
    try {
      if (redisClient) {
        await redisClient.disconnect()
        redisClient = null
        console.log('📴 Redis disconnected')
      }
    } catch (error) {
      console.error('❌ Redis disconnect error:', error)
    }
  }
}

export default simpleRedisHelpers
