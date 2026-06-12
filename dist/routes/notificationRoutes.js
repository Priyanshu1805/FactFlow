"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const notificationPrefsController_1 = require("../controllers/notificationPrefsController");
const router = (0, express_1.Router)();
router.get("/", auth_1.authenticateFirebase, notificationPrefsController_1.getNotificationPrefs);
router.put("/", auth_1.authenticateFirebase, notificationPrefsController_1.updateNotificationPrefs);
router.post("/push-subscribe", auth_1.authenticateFirebase, notificationPrefsController_1.savePushSubscription);
router.post("/test", auth_1.authenticateFirebase, notificationPrefsController_1.testNotifications);
router.post("/test-email", auth_1.authenticateFirebase, notificationPrefsController_1.testEmailDigest);
exports.default = router;
//# sourceMappingURL=notificationRoutes.js.map