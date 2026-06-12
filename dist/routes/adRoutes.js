"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adController_1 = require("../controllers/adController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Public routes
router.get("/", adController_1.getActiveAds);
router.post("/:id/track", adController_1.trackAdInteraction);
// Admin routes
router.get("/admin", auth_1.authenticateFirebase, (0, auth_1.requireRole)("admin", "editor"), adController_1.getAdminAds);
router.post("/admin", auth_1.authenticateFirebase, (0, auth_1.requireRole)("admin", "editor"), adController_1.createAd);
router.put("/admin/:id", auth_1.authenticateFirebase, (0, auth_1.requireRole)("admin", "editor"), adController_1.updateAd);
router.delete("/admin/:id", auth_1.authenticateFirebase, (0, auth_1.requireRole)("admin", "editor"), adController_1.deleteAd);
exports.default = router;
//# sourceMappingURL=adRoutes.js.map