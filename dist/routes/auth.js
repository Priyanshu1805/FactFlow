"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authProtection_1 = require("../middleware/authProtection");
const networkProtection_1 = require("../middleware/networkProtection");
const router = (0, express_1.Router)();
// 🛡️ Apply Layer 1 Rate Limit to Auth Routes
router.use("/register", networkProtection_1.authRateLimiter);
router.use("/login", networkProtection_1.authRateLimiter);
router.post("/register", authController_1.register);
// 🔐 Apply Layer 2 Brute Force Lock check to login
router.post("/login", authProtection_1.checkAccountLock, authController_1.login);
// 🔐 Apply Layer 2 JWT & Session validation
router.get("/me", authProtection_1.requireAuth, authController_1.getMe);
exports.default = router;
//# sourceMappingURL=auth.js.map