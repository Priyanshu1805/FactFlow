import Redis from "ioredis"

// Use environment variable or default to localhost
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"
// Only attempt to connect to Redis if explicitly configured or in production, to avoid dev spam/slowness
const useRedis = process.env.NODE_ENV === "production" || process.env.USE_REDIS === "true"

let redis: Redis | null = null;
if (useRedis) {
  redis = new Redis(redisUrl)
  redis.on("error", (error) => {
    // Suppress endless reconnect logs
  })
}

const CACHE_TTL = 60 * 15 // 15 minutes

// Fallback in-memory cache
const memoryCache = new Map<string, { data: any, expiry: number }>();

export async function getCached(key: string): Promise<any | null> {
  try {
    if (redis && redis.status === "ready") {
      const data = await redis.get(key)
      return data ? JSON.parse(data) : null
    }
    // Fallback to memory cache
    const cached = memoryCache.get(key)
    if (cached && cached.expiry > Date.now()) {
      return cached.data
    }
    if (cached && cached.expiry <= Date.now()) {
      memoryCache.delete(key)
    }
    return null
  } catch (error) {
    return null
  }
}

export async function setCached(key: string, data: any, ttl: number = CACHE_TTL): Promise<void> {
  try {
    if (redis && redis.status === "ready") {
      await redis.set(key, JSON.stringify(data), "EX", ttl)
      return
    }
    // Fallback to memory cache
    memoryCache.set(key, { data, expiry: Date.now() + (ttl * 1000) })
  } catch (error) {
  }
}

export async function invalidateSection(section: string): Promise<void> {
  try {
    if (redis && redis.status === "ready") {
      const keys = await redis.keys(`news:${section}:*`)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
      return
    }
    // Memory cache invalidation
    const prefix = `news:${section}:`
    for (const k of memoryCache.keys()) {
      if (k.startsWith(prefix)) memoryCache.delete(k)
    }
  } catch (error) {
  }
}

export async function invalidateAll(): Promise<void> {
  try {
    if (redis && redis.status === "ready") {
      const keys = await redis.keys("news:*")
      if (keys.length > 0) {
        await redis.del(...keys)
      }
      return
    }
    // Memory cache invalidation
    for (const k of memoryCache.keys()) {
      if (k.startsWith("news:")) memoryCache.delete(k)
    }
  } catch (error) {
  }
}
