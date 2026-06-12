import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { User, IUser } from "../models/User"
import { requireAuth, requireRole as newRequireRole } from "./authProtection"

// Alias for backwards compatibility with other routes
export interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticate = requireAuth;
export const requireRole = newRequireRole;

export async function authenticateFirebase(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    let firebaseUid = req.query.firebaseUid || req.body.firebaseUid

    if (!firebaseUid) {
      const authHeader = req.headers.authorization
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1]
        const decoded = jwt.decode(token) as any
        if (decoded && (decoded.uid || decoded.user_id)) {
          firebaseUid = decoded.uid || decoded.user_id
        }
      }
    }

    if (!firebaseUid) {
      res.status(401).json({ success: false, error: "No firebaseUid provided." })
      return
    }

    const user = await User.findOne({ firebaseUid })
    if (!user) {
      res.status(401).json({ success: false, error: "User not found." })
      return
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ success: false, error: "Authentication failed." })
  }
}
