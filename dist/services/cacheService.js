"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCached = getCached;
exports.setCached = setCached;
exports.invalidateSection = invalidateSection;
exports.invalidateAll = invalidateAll;
const ioredis_1 = __importDefault(require("ioredis"));
// Use environment variable or default to localhost
const redis = new ioredis_1.default(process.env.REDIS_URL || "redis://localhost:6379");
const CACHE_TTL = 60 * 15; // 15 minutes
redis.on("error", (error) => {
    console.warn("Redis connection error (fallback to MongoDB):", error.message);
});
async function getCached(key) {
    try {
        if (redis.status !== "ready")
            return null;
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    }
    catch (error) {
        console.warn("Redis get error:", error);
        return null;
    }
}
async function setCached(key, data, ttl = CACHE_TTL) {
    try {
        if (redis.status !== "ready")
            return;
        await redis.set(key, JSON.stringify(data), "EX", ttl);
    }
    catch (error) {
        console.warn("Redis set error:", error);
    }
}
async function invalidateSection(section) {
    try {
        if (redis.status !== "ready")
            return;
        const keys = await redis.keys(`news:${section}:*`);
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    }
    catch (error) {
        console.warn("Redis invalidate error:", error);
    }
}
async function invalidateAll() {
    try {
        if (redis.status !== "ready")
            return;
        const keys = await redis.keys("news:*");
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    }
    catch (error) {
        console.warn("Redis invalidateAll error:", error);
    }
}
//# sourceMappingURL=cacheService.js.map