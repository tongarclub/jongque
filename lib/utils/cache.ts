import { redisHelpers } from '@/lib/redis'

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  SHORT: 300,      // 5 minutes
  MEDIUM: 1800,    // 30 minutes  
  LONG: 3600,      // 1 hour
  VERY_LONG: 86400 // 24 hours
} as const

// Cache key prefixes for different data types
export const CACHE_KEYS = {
  USER_PROFILE: 'user:profile',
  BUSINESS_INFO: 'business:info',
  QUEUE_STATUS: 'queue:status',
  BOOKING_STATS: 'booking:stats',
  NOTIFICATION_TEMPLATE: 'notification:template'
} as const

export class CacheService {
  /**
   * Generate a cache key with prefix
   */
  static generateKey(prefix: string, id: string): string {
    return `${prefix}:${id}`
  }

  /**
   * Cache user profile data
   */
  static async cacheUserProfile(userId: string, profile: any, ttl: number = CACHE_TTL.MEDIUM) {
    const key = this.generateKey(CACHE_KEYS.USER_PROFILE, userId)
    return await redisHelpers.set(key, profile, ttl)
  }

  /**
   * Get cached user profile
   */
  static async getCachedUserProfile(userId: string) {
    const key = this.generateKey(CACHE_KEYS.USER_PROFILE, userId)
    return await redisHelpers.get(key)
  }

  /**
   * Cache business information
   */
  static async cacheBusinessInfo(businessId: string, info: any, ttl: number = CACHE_TTL.LONG) {
    const key = this.generateKey(CACHE_KEYS.BUSINESS_INFO, businessId)
    return await redisHelpers.set(key, info, ttl)
  }

  /**
   * Get cached business information
   */
  static async getCachedBusinessInfo(businessId: string) {
    const key = this.generateKey(CACHE_KEYS.BUSINESS_INFO, businessId)
    return await redisHelpers.get(key)
  }

  /**
   * Cache queue status for real-time updates
   */
  static async cacheQueueStatus(businessId: string, queueData: any, ttl: number = CACHE_TTL.SHORT) {
    const key = this.generateKey(CACHE_KEYS.QUEUE_STATUS, businessId)
    return await redisHelpers.set(key, queueData, ttl)
  }

  /**
   * Get cached queue status
   */
  static async getCachedQueueStatus(businessId: string) {
    const key = this.generateKey(CACHE_KEYS.QUEUE_STATUS, businessId)
    return await redisHelpers.get(key)
  }

  /**
   * Cache booking statistics
   */
  static async cacheBookingStats(businessId: string, stats: any, ttl: number = CACHE_TTL.LONG) {
    const key = this.generateKey(CACHE_KEYS.BOOKING_STATS, businessId)
    return await redisHelpers.set(key, stats, ttl)
  }

  /**
   * Get cached booking statistics
   */
  static async getCachedBookingStats(businessId: string) {
    const key = this.generateKey(CACHE_KEYS.BOOKING_STATS, businessId)
    return await redisHelpers.get(key)
  }

  /**
   * Cache notification templates
   */
  static async cacheNotificationTemplate(templateId: string, template: any, ttl: number = CACHE_TTL.VERY_LONG) {
    const key = this.generateKey(CACHE_KEYS.NOTIFICATION_TEMPLATE, templateId)
    return await redisHelpers.set(key, template, ttl)
  }

  /**
   * Get cached notification template
   */
  static async getCachedNotificationTemplate(templateId: string) {
    const key = this.generateKey(CACHE_KEYS.NOTIFICATION_TEMPLATE, templateId)
    return await redisHelpers.get(key)
  }

  /**
   * Invalidate user-related caches
   */
  static async invalidateUserCache(userId: string) {
    const userProfileKey = this.generateKey(CACHE_KEYS.USER_PROFILE, userId)
    return await redisHelpers.del(userProfileKey)
  }

  /**
   * Invalidate business-related caches
   */
  static async invalidateBusinessCache(businessId: string) {
    const businessInfoKey = this.generateKey(CACHE_KEYS.BUSINESS_INFO, businessId)
    const queueStatusKey = this.generateKey(CACHE_KEYS.QUEUE_STATUS, businessId)
    const bookingStatsKey = this.generateKey(CACHE_KEYS.BOOKING_STATS, businessId)
    
    return await Promise.all([
      redisHelpers.del(businessInfoKey),
      redisHelpers.del(queueStatusKey),
      redisHelpers.del(bookingStatsKey)
    ])
  }

  /**
   * Warm up cache with frequently accessed data
   */
  static async warmUpCache(businessId: string, userData: any) {
    // This could be called during startup or periodically
    try {
      // Cache commonly accessed business data
      await this.cacheBusinessInfo(businessId, userData.business)
      
      // Cache initial queue status
      if (userData.queueStatus) {
        await this.cacheQueueStatus(businessId, userData.queueStatus)
      }

      console.log(`Cache warmed up for business: ${businessId}`)
      return true
    } catch (error) {
      console.error('Cache warm-up failed:', error)
      return false
    }
  }

  /**
   * Get cache statistics
   */
  static async getCacheStats() {
    try {
      const info = await redisHelpers.getInfo()
      return {
        connected: await redisHelpers.ping(),
        info: info ? info.split('\n').filter(line => 
          line.includes('connected_clients') || 
          line.includes('used_memory_human') ||
          line.includes('keyspace_hits') ||
          line.includes('keyspace_misses')
        ) : []
      }
    } catch (error) {
      console.error('Failed to get cache stats:', error)
      return null
    }
  }
}
