"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ExternalArticle_1 = require("../models/ExternalArticle");
const router = (0, express_1.Router)();
// GET /api/external-articles/stats?url=...&userId=...
router.get("/stats", async (req, res) => {
    const { url, userId } = req.query;
    if (!url)
        return res.status(400).json({ error: "URL is required" });
    try {
        const article = await ExternalArticle_1.ExternalArticle.findOne({ url: String(url) });
        const likes = article?.likedBy ? article.likedBy.length : 0;
        const dislikes = article?.dislikedBy ? article.dislikedBy.length : 0;
        const saves = article?.savedBy ? article.savedBy.length : 0;
        const shares = article?.shares || 0;
        const hasLiked = article?.likedBy && userId ? article.likedBy.includes(String(userId)) : false;
        const hasDisliked = article?.dislikedBy && userId ? article.dislikedBy.includes(String(userId)) : false;
        const hasSaved = article?.savedBy && userId ? article.savedBy.includes(String(userId)) : false;
        res.json({
            success: true,
            likes,
            dislikes,
            saves,
            shares,
            hasLiked,
            hasDisliked,
            hasSaved
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});
// POST /api/external-articles/interact
router.post("/interact", async (req, res) => {
    const { url, action, value, userId } = req.body;
    // action: "like", "dislike", "save", "share"
    // value: 1 (add) or -1 (remove)
    if (!url || !action)
        return res.status(400).json({ error: "URL and action required" });
    try {
        let updateDoc = {};
        if (action === "like") {
            if (!userId)
                return res.status(400).json({ error: "User ID required for liking" });
            if (value === 1) {
                updateDoc = { $addToSet: { likedBy: userId }, $pull: { dislikedBy: userId } };
            }
            else {
                updateDoc = { $pull: { likedBy: userId } };
            }
        }
        else if (action === "dislike") {
            if (!userId)
                return res.status(400).json({ error: "User ID required for disliking" });
            if (value === 1) {
                updateDoc = { $addToSet: { dislikedBy: userId }, $pull: { likedBy: userId } };
            }
            else {
                updateDoc = { $pull: { dislikedBy: userId } };
            }
        }
        else if (action === "save") {
            if (!userId)
                return res.status(400).json({ error: "User ID required for saving" });
            if (value === 1) {
                updateDoc = { $addToSet: { savedBy: userId } };
            }
            else {
                updateDoc = { $pull: { savedBy: userId } };
            }
        }
        else if (action === "share") {
            updateDoc = { $inc: { shares: 1 } };
        }
        else {
            return res.status(400).json({ error: "Invalid action" });
        }
        const article = await ExternalArticle_1.ExternalArticle.findOneAndUpdate({ url }, updateDoc, { new: true, upsert: true });
        const stats = {
            likes: article.likedBy ? article.likedBy.length : 0,
            dislikes: article.dislikedBy ? article.dislikedBy.length : 0,
            saves: article.savedBy ? article.savedBy.length : 0,
            shares: article.shares || 0,
            hasLiked: article.likedBy && userId ? article.likedBy.includes(userId) : false,
            hasDisliked: article.dislikedBy && userId ? article.dislikedBy.includes(userId) : false,
            hasSaved: article.savedBy && userId ? article.savedBy.includes(userId) : false
        };
        const io = req.app.get("io");
        if (io) {
            io.emit("external_article_stats_update", { url, stats });
        }
        res.json({
            success: true,
            stats
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});
exports.default = router;
//# sourceMappingURL=externalArticles.js.map