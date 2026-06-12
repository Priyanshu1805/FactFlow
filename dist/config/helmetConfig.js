"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.helmetConfig = void 0;
const helmet_1 = __importDefault(require("helmet"));
/**
 * Enhanced Helmet configuration for maximum HTTP header security.
 * Sets CSP, HSTS, XSS, and Referrer policies.
 */
exports.helmetConfig = (0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://www.google-analytics.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'", "https:", "wss:"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'", "https:"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allows loading remote images
    dnsPrefetchControl: { allow: false },
    frameguard: { action: "deny" }, // X-Frame-Options
    hidePoweredBy: true,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
    ieNoOpen: true,
    noSniff: true, // X-Content-Type-Options
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true, // X-XSS-Protection
});
//# sourceMappingURL=helmetConfig.js.map