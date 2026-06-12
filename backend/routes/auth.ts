import { Router, Request, Response, NextFunction } from "express"
import { register, login, getMe } from "../controllers/authController"
import { requireAuth, checkAccountLock } from "../middleware/authProtection"
import { authRateLimiter } from "../middleware/networkProtection"

const router = Router()

// 🛡️ Apply Layer 1 Rate Limit to Auth Routes
router.use("/register", authRateLimiter)
router.use("/login", authRateLimiter)

router.post("/register", register)

// 🔐 Apply Layer 2 Brute Force Lock check to login
router.post("/login", checkAccountLock, login)

// 🔐 Apply Layer 2 JWT & Session validation
router.get("/me", requireAuth, getMe)

export default router
