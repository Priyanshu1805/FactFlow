import { Router } from "express"
import { authenticateFirebase } from "../middleware/auth"
import {
  getNotificationPrefs,
  updateNotificationPrefs,
  savePushSubscription,
  testNotifications,
  testEmailDigest
} from "../controllers/notificationPrefsController"

const router = Router()

router.get("/", authenticateFirebase, getNotificationPrefs)
router.put("/", authenticateFirebase, updateNotificationPrefs)
router.post("/push-subscribe", authenticateFirebase, savePushSubscription)
router.post("/test", authenticateFirebase, testNotifications)
router.post("/test-email", authenticateFirebase, testEmailDigest)

export default router
