"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userPreferencesController_1 = require("../controllers/userPreferencesController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/", auth_1.authenticate, userPreferencesController_1.getPreferences);
router.put("/", auth_1.authenticate, userPreferencesController_1.updatePreferences);
exports.default = router;
//# sourceMappingURL=userPreferencesRoutes.js.map