import { Router } from "express"
import { getAllReels, getReelById, createReel, likeReel, deleteReel, uploadUserReel } from "../controllers/reelsController"
import { uploadVideo } from "../middleware/videoUpload"
import { authenticate, requireRole } from "../middleware/auth"

const router = Router()

// Public routes
router.get("/", getAllReels)
router.get("/:id", getReelById)
router.post("/:id/like", likeReel)

// Protected routes
router.post("/upload", authenticate, uploadVideo.single("video"), uploadUserReel)
router.post("/", authenticate, requireRole("admin", "editor"), createReel)
router.delete("/:id", authenticate, requireRole("admin"), deleteReel)

export default router
