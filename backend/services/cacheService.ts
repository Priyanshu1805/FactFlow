import Redis from "ioredis"

// Use environment variable or default to localhost
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379")

const CACHE_TTL = 60 * 15 // 15 minutes

redis.on("error", (error) => {
  console.warn("Redis connection error (fallback to MongoDB):", error.message)
})

export async function getCached(key: string): Promise<any | null> {
  try {
    if (redis.status !== "ready") return null
    const data = await redis.get(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.warn("Redis get error:", error)
    return null
  }
}

export async function setCached(key: string, data: any, ttl: number = CACHE_TTL): Promise<void> {
  try {
    if (redis.status !== "ready") return
    await redis.set(key, JSON.stringify(data), "EX", ttl)
  } catch (error) {
    console.warn("Redis set error:", error)
  }
}

export async function invalidateSection(section: string): Promise<void> {
  try {
    if (redis.status !== "ready") return
    const keys = await redis.keys(`news:${section}:*`)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (error) {
    console.warn("Redis invalidate error:", error)
  }
}

export async function invalidateAll(): Promise<void> {
  try {
    if (redis.status !== "ready") return
    const keys = await redis.keys("news:*")
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (error) {
    console.warn("Redis invalidateAll error:", error)
  }
}
