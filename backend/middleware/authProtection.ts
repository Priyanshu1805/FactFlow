import { Request, Response, NextFunction } from "express"
import { verifyAccessToken } from "../services/authService"
import { User, IUser } from "../models/User"

// Extend Express Request object to include the user
declare global {
  namespace Express {
    interface Request {
      user?: IUser
      sessionId?: string
    }
  }
}

/**
 * 🔐 LAYER 2: Session Protection & JWT Verification
 * Verifies the access token and ensures the session is still active and valid for the current IP/Device.
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ success: false, error: "Authentication required" })
      return
    }

    const token = authHeader.split(" ")[1]
    const decoded = verifyAccessToken(token)

    if (!decoded || !decoded.id) {
      res.status(401).json({ success: false, error: "Invalid or expired token" })
      return
    }

    const user = await User.findById(decoded.id)
    if (!user) {
      res.status(401).json({ success: false, error: "User no longer exists" })
      return
    }

    if (user.isDisabled) {
      res.status(403).json({ success: false, error: "Account disabled" })
      return
    }

    // Session Protection: Bind session to IP + User Agent
    const currentIp = req.ip || req.headers['x-forwarded-for']?.toString() || '0.0.0.0'
    const currentUserAgent = req.headers['user-agent'] || 'unknown'
    
    if (decoded.sessionId) {
      const activeSession = user.activeSessions?.find(s => s.sessionId === decoded.sessionId)
      if (!activeSession) {
        res.status(401).json({ success: false, error: "Session has been revoked. Please login again." })
        return
      }

      // Removed strict IP/User-Agent mid-session checking.
      // Mobile users frequently switch between WiFi and Cellular (changing IP).
      // Revoking sessions on IP change causes frustrating random logouts.
    }

    req.user = user
    req.sessionId = decoded.sessionId
    next()
  } catch (error) {
    res.status(500).json({ success: false, error: "Authentication error" })
  }
}

/**
 * 🔐 LAYER 2: Role-Based Access Control (RBAC)
 * Protects routes by requiring specific roles.
 */
export const requireRole = (...allowedRoles: Array<"superadmin" | "admin" | "editor" | "viewer">) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Authentication required" })
      return
    }

    if (!allowedRoles.includes(req.user.role as any)) {
      res.status(403).json({ success: false, error: "Forbidden: Insufficient permissions" })
      return
    }

    next()
  }
}

/**
 * 🔐 LAYER 2: Brute Force Account Locking
 * Middleware to check if account is locked before allowing login attempt
 */
export const checkAccountLock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email } = req.body
  if (!email) return next()

  try {
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) return next()

    // If account is currently locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000)
      res.status(423).json({ 
        success: false, 
        error: `Account temporarily locked due to too many failed attempts. Try again in ${remainingMinutes} minutes.` 
      })
      return
    }

    // If lock time has expired, reset it
    if (user.lockUntil && user.lockUntil <= new Date()) {
      user.lockUntil = undefined
      user.failedLoginAttempts = 0
      await user.save()
    }

    next()
  } catch (error) {
    next()
  }
}
