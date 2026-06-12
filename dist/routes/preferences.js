"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserPreferences_1 = require("../models/UserPreferences");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET current preferences
router.get("/preferences", auth_1.authenticateFirebase, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Not authenticated" });
            return;
        }
        let prefs = await UserPreferences_1.UserPreferences.findOne({ userId: req.user.id });
        if (!prefs) {
            prefs = await UserPreferences_1.UserPreferences.create({ userId: req.user.id });
        }
        res.json(prefs.audioVideo || {});
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch preferences" });
    }
});
// PATCH update preferences
router.patch("/preferences/audio-video", auth_1.authenticateFirebase, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Not authenticated" });
            return;
        }
        const allowedFields = [
            "autoPlayVideos", "autoPlayOnWifiOnly", "muteByDefault",
            "showSubtitles", "hdOnWifi", "videoQuality",
            "enableAudioNews", "backgroundAudio", "voiceSpeed"
        ];
        const updates = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[`audioVideo.${field}`] = req.body[field];
            }
        });
        const prefs = await UserPreferences_1.UserPreferences.findOneAndUpdate({ userId: req.user.id }, { $set: updates }, { new: true, upsert: true });
        // We can assume prefs is defined since upsert: true is used
        res.json({ success: true, audioVideo: prefs?.audioVideo });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to update preferences" });
    }
});
// GET current region
router.get("/preferences/region", auth_1.authenticateFirebase, async (req, res) => {
    try {
        if (!req.user?.id) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        let prefs = await UserPreferences_1.UserPreferences.findOne({ userId: req.user.id });
        if (!prefs) {
            prefs = await UserPreferences_1.UserPreferences.create({ userId: req.user.id });
        }
        res.json(prefs.region);
    }
    catch (err) {
        console.error("GET /preferences/region error:", err);
        res.status(500).json({ error: "Failed to fetch region" });
    }
});
// PATCH update region
router.patch("/preferences/region", auth_1.authenticateFirebase, async (req, res) => {
    try {
        if (!req.user?.id) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const { code, name, language } = req.body;
        const prefs = await UserPreferences_1.UserPreferences.findOneAndUpdate({ userId: req.user.id }, { $set: { "region.code": code, "region.name": name, "region.language": language } }, { new: true, upsert: true });
        res.json(prefs.region);
    }
    catch (err) {
        console.error("PATCH /preferences/region error:", err);
        res.status(500).json({ error: "Failed to update region" });
    }
});
exports.default = router;
//# sourceMappingURL=preferences.js.map