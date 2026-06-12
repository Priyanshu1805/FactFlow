import express from "express"
import { getActiveAds, trackAdInteraction, getAdminAds, createAd, updateAd, deleteAd } from "../controllers/adController"
import { authenticateFirebase, requireRole } from "../middleware/auth"

const router = express.Router()

// Public routes
router.get("/", getActiveAds)
router.post("/:id/track", trackAdInteraction)

// Admin routes
router.get("/admin", authenticateFirebase, requireRole("admin", "editor"), getAdminAds)
router.post("/admin", authenticateFirebase, requireRole("admin", "editor"), createAd)
router.put("/admin/:id", authenticateFirebase, requireRole("admin", "editor"), updateAd)
router.delete("/admin/:id", authenticateFirebase, requireRole("admin", "editor"), deleteAd)

export default router
