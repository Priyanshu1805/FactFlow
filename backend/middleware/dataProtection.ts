import { Request, Response, NextFunction } from "express"
// Note: xss-clean, mongo-sanitize, and hpp don't have perfect modern ES6 exports/types in all environments, so require is safer
const mongoSanitize = require("mongo-sanitize")
const xss = require("xss-clean")
const hpp = require("hpp")

/**
 * 🧱 LAYER 3: Data Protection Middleware Suite
 * This array can be directly used in server.ts to apply all data protections.
 */
export const dataProtectionSuite = [
  // 1. Prevent NoSQL Injection: Removes $ and . from req.body, req.query, and req.params
  (req: Request, res: Response, next: NextFunction) => {
    req.body = mongoSanitize(req.body)
    req.query = mongoSanitize(req.query)
    req.params = mongoSanitize(req.params)
    next()
  },

  // 2. Prevent Cross-Site Scripting (XSS): Strips malicious HTML/JS tags from user input
  xss(),

  // 3. Prevent HTTP Parameter Pollution (HPP): Prevents attacks that send multiple parameters with same name
  hpp()
]

/**
 * 🧱 LAYER 3: File Upload Validation
 * Middleware to strictly validate file types and sizes
 */
export const validateFileUpload = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.files && !req.file) return next()

  const files = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : [req.file]
  const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4']
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

  for (const file of files as Express.Multer.File[]) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      res.status(400).json({ success: false, error: `Invalid file type: ${file.mimetype}. Only JPG, PNG, GIF, WEBP, and MP4 are allowed.` })
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      res.status(400).json({ success: false, error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Max size is 5MB.` })
      return
    }
  }

  next()
}
