"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const newsFeedPrefsController_1 = require("../controllers/newsFeedPrefsController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/", auth_1.authenticateFirebase, newsFeedPrefsController_1.getFeedPrefs);
router.put("/", auth_1.authenticateFirebase, newsFeedPrefsController_1.updateFeedPrefs);
exports.default = router;
//# sourceMappingURL=newsFeedRoutes.js.map