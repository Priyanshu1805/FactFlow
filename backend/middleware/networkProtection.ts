import { Request, Response, NextFunction } from "express"
import rateLimit from "express-rate-limit"
import slowDown from "express-slow-down"
import RedisStore from "rate-limit-redis"
import Redis from "ioredis"
import geoip from "geoip-lite"
import { BlockedIP } from "../models/BlockedIP"

// Initialize Redis client for rate limiting
// Falls back to standard memory store if Redis connection fails or isn't provided
let redisClient: Redis | undefined
if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy: () => null, // Don't retry endlessly if Redis is down
  })
  redisClient.on('error', (err) => console.error('Redis Rate Limit Error:', err.message))
}

const getStore = (prefix: string) => {
  if (redisClient && redisClient.status === 'ready') {
    return new RedisStore({
      // @ts-ignore
      sendCommand: (...args: string[]) => redisClient!.call(...args),
      prefix: prefix,
    })
  }
  return undefined // Fallback to memory
}

/**
 * 🛡️ LAYER 1: Global Rate Limiter
 * Max 1000 requests per 15 minutes per IP (Comfortable for active users)
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore('global_rl:'),
  message: { success: false, error: "Too many requests, try again later" },
})

/**
 * 🛡️ LAYER 1: Login & Register Rate Limiter
 * Max 20 attempts per 15 minutes.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore('auth_rl:'),
  message: { success: false, error: "Too many login attempts, please try again in 15 minutes." },
  handler: async (req: Request, res: Response, next: NextFunction, options) => {
    res.status(options.statusCode).json(options.message)
  }
})

/**
 * 🛡️ LAYER 1: News API Rate Limiter
 * Max 1500 requests per 15 minutes per IP
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1500,
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore('api_rl:'),
  message: { success: false, error: "Too many API requests, try again later" },
})

/**
 * 🛡️ LAYER 1: DDoS Protection (Slow Down)
 * After 500 requests: add 500ms delay
 * After 1000 requests: add 2s delay
 */
export const ddosSlowDown = slowDown({
  windowMs: 10 * 60 * 1000, // 10 minutes
  delayAfter: 500, 
  delayMs: (hits: number) => {
    if (hits > 1000) return 2000 // 2 seconds after 1000 hits
    return 500 // 500ms after 500 hits
  },
  // @ts-ignore
  store: getStore('ddos_sd:'),
})

/**
 * 🛡️ LAYER 1: IP Blocking System
 * Checks every incoming request against the MongoDB Blocklist.
 */
export const checkBlockedIP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '0.0.0.0'
    const blocked = await BlockedIP.findOne({ ip })
    
    if (blocked) {
      if (blocked.expiresAt && new Date() > blocked.expiresAt) {
        // Block expired, remove it
        await BlockedIP.deleteOne({ _id: blocked._id })
        return next()
      }
      res.status(403).json({ success: false, error: "Your IP has been permanently banned due to security violations." })
      return
    }
    
    next()
  } catch (error) {
    next() // Fail open to not break server on DB error
  }
}

/**
 * 🛡️ LAYER 1: Optional Geo-Blocking
 * Blocks requests from specific high-risk countries based on IP.
 */
const BLOCKED_COUNTRIES = ['KP', 'SY', 'IR'] // Example: North Korea, Syria, Iran
export const geoBlocker = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip || req.headers['x-forwarded-for']?.toString() || ''
  if (!ip) return next()

  const geo = geoip.lookup(ip)
  if (geo && BLOCKED_COUNTRIES.includes(geo.country)) {
    console.warn(`[GEO-BLOCK] Blocked request from ${geo.country} (IP: ${ip})`)
    res.status(403).json({ success: false, error: "Access from your region is currently restricted." })
    return
  }
  
  next()
}
