import { Router } from "express"
import { getPreferences, updatePreferences } from "../controllers/userPreferencesController"
import { authenticate } from "../middleware/auth"

const router = Router()

router.get("/", authenticate, getPreferences)
router.put("/", authenticate, updatePreferences)

export default router
