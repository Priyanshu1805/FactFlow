"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.geoBlocker = exports.checkBlockedIP = exports.ddosSlowDown = exports.apiRateLimiter = exports.authRateLimiter = exports.globalRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_slow_down_1 = __importDefault(require("express-slow-down"));
const rate_limit_redis_1 = __importDefault(require("rate-limit-redis"));
const ioredis_1 = __importDefault(require("ioredis"));
const geoip_lite_1 = __importDefault(require("geoip-lite"));
const BlockedIP_1 = require("../models/BlockedIP");
// Initialize Redis client for rate limiting
// Falls back to standard memory store if Redis connection fails or isn't provided
let redisClient;
if (process.env.REDIS_URL) {
    redisClient = new ioredis_1.default(process.env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        retryStrategy: () => null, // Don't retry endlessly if Redis is down
    });
    redisClient.on('error', (err) => console.error('Redis Rate Limit Error:', err.message));
}
const getStore = (prefix) => {
    if (redisClient && redisClient.status === 'ready') {
        return new rate_limit_redis_1.default({
            // @ts-ignore
            sendCommand: (...args) => redisClient.call(...args),
            prefix: prefix,
        });
    }
    return undefined; // Fallback to memory
};
/**
 * 🛡️ LAYER 1: Global Rate Limiter
 * Max 1000 requests per 15 minutes per IP (Comfortable for active users)
 */
exports.globalRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    store: getStore('global_rl:'),
    message: { success: false, error: "Too many requests, try again later" },
});
/**
 * 🛡️ LAYER 1: Login & Register Rate Limiter
 * Max 20 attempts per 15 minutes.
 */
exports.authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    store: getStore('auth_rl:'),
    message: { success: false, error: "Too many login attempts, please try again in 15 minutes." },
    handler: async (req, res, next, options) => {
        res.status(options.statusCode).json(options.message);
    }
});
/**
 * 🛡️ LAYER 1: News API Rate Limiter
 * Max 1500 requests per 15 minutes per IP
 */
exports.apiRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 1500,
    standardHeaders: true,
    legacyHeaders: false,
    store: getStore('api_rl:'),
    message: { success: false, error: "Too many API requests, try again later" },
});
/**
 * 🛡️ LAYER 1: DDoS Protection (Slow Down)
 * After 500 requests: add 500ms delay
 * After 1000 requests: add 2s delay
 */
exports.ddosSlowDown = (0, express_slow_down_1.default)({
    windowMs: 10 * 60 * 1000, // 10 minutes
    delayAfter: 500,
    delayMs: (hits) => {
        if (hits > 1000)
            return 2000; // 2 seconds after 1000 hits
        return 500; // 500ms after 500 hits
    },
    // @ts-ignore
    store: getStore('ddos_sd:'),
});
/**
 * 🛡️ LAYER 1: IP Blocking System
 * Checks every incoming request against the MongoDB Blocklist.
 */
const checkBlockedIP = async (req, res, next) => {
    try {
        const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '0.0.0.0';
        const blocked = await BlockedIP_1.BlockedIP.findOne({ ip });
        if (blocked) {
            if (blocked.expiresAt && new Date() > blocked.expiresAt) {
                // Block expired, remove it
                await BlockedIP_1.BlockedIP.deleteOne({ _id: blocked._id });
                return next();
            }
            res.status(403).json({ success: false, error: "Your IP has been permanently banned due to security violations." });
            return;
        }
        next();
    }
    catch (error) {
        next(); // Fail open to not break server on DB error
    }
};
exports.checkBlockedIP = checkBlockedIP;
/**
 * 🛡️ LAYER 1: Optional Geo-Blocking
 * Blocks requests from specific high-risk countries based on IP.
 */
const BLOCKED_COUNTRIES = ['KP', 'SY', 'IR']; // Example: North Korea, Syria, Iran
const geoBlocker = (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '';
    if (!ip)
        return next();
    const geo = geoip_lite_1.default.lookup(ip);
    if (geo && BLOCKED_COUNTRIES.includes(geo.country)) {
        console.warn(`[GEO-BLOCK] Blocked request from ${geo.country} (IP: ${ip})`);
        res.status(403).json({ success: false, error: "Access from your region is currently restricted." });
        return;
    }
    next();
};
exports.geoBlocker = geoBlocker;
//# sourceMappingURL=networkProtection.js.map