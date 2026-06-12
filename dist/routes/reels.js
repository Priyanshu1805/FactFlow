"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reelsController_1 = require("../controllers/reelsController");
const videoUpload_1 = require("../middleware/videoUpload");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.get("/", reelsController_1.getAllReels);
router.get("/:id", reelsController_1.getReelById);
router.post("/:id/like", reelsController_1.likeReel);
// Protected routes
router.post("/upload", auth_1.authenticate, videoUpload_1.uploadVideo.single("video"), reelsController_1.uploadUserReel);
router.post("/", auth_1.authenticate, (0, auth_1.requireRole)("admin", "editor"), reelsController_1.createReel);
router.delete("/:id", auth_1.authenticate, (0, auth_1.requireRole)("admin"), reelsController_1.deleteReel);
exports.default = router;
//# sourceMappingURL=reels.js.map