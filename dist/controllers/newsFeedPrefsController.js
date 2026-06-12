"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFeedPrefs = getFeedPrefs;
exports.updateFeedPrefs = updateFeedPrefs;
const NewsFeedPrefs_1 = require("../models/NewsFeedPrefs");
async function getFeedPrefs(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, error: "Not authenticated" });
            return;
        }
        const prefs = await NewsFeedPrefs_1.NewsFeedPrefs.findOne({ userId });
        if (!prefs) {
            res.json({
                success: true,
                data: {
                    followedTopics: ["politics", "trending", "lifestyle", "sports", "tech", "art"],
                    feedSortOrder: "latest",
                    newsLanguages: ["English"],
                    reels: { autoPlay: true, wifiOnly: false, captions: false },
                    saved: { offlineReading: false, autoRemove: false, autoRemoveDays: 30 },
                },
            });
            return;
        }
        res.json({ success: true, data: prefs });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}
async function updateFeedPrefs(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, error: "Not authenticated" });
            return;
        }
        const prefs = await NewsFeedPrefs_1.NewsFeedPrefs.findOneAndUpdate({ userId }, { $set: req.body }, { upsert: true, new: true });
        res.json({ success: true, data: prefs });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}
//# sourceMappingURL=newsFeedPrefsController.js.map