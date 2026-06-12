import { Router } from "express"
import { getFeedPrefs, updateFeedPrefs } from "../controllers/newsFeedPrefsController"
import { authenticateFirebase } from "../middleware/auth"

const router = Router()

router.get("/", authenticateFirebase, getFeedPrefs)
router.put("/", authenticateFirebase, updateFeedPrefs)

export default router
