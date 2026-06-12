import { Request, Response, NextFunction } from "express";
/**
 * 🛡️ LAYER 1: Global Rate Limiter
 * Max 1000 requests per 15 minutes per IP (Comfortable for active users)
 */
export declare const globalRateLimiter: any;
/**
 * 🛡️ LAYER 1: Login & Register Rate Limiter
 * Max 20 attempts per 15 minutes.
 */
export declare const authRateLimiter: any;
/**
 * 🛡️ LAYER 1: News API Rate Limiter
 * Max 1500 requests per 15 minutes per IP
 */
export declare const apiRateLimiter: any;
/**
 * 🛡️ LAYER 1: DDoS Protection (Slow Down)
 * After 500 requests: add 500ms delay
 * After 1000 requests: add 2s delay
 */
export declare const ddosSlowDown: any;
/**
 * 🛡️ LAYER 1: IP Blocking System
 * Checks every incoming request against the MongoDB Blocklist.
 */
export declare const checkBlockedIP: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const geoBlocker: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=networkProtection.d.ts.map