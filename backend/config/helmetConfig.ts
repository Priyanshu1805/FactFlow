import helmet from "helmet"

/**
 * Enhanced Helmet configuration for maximum HTTP header security.
 * Sets CSP, HSTS, XSS, and Referrer policies.
 */
export const helmetConfig = helmet({
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
})
