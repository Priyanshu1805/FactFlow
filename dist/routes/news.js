"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const newsController_1 = require("../controllers/newsController");
const socialTrendingController_1 = require("../controllers/socialTrendingController");
const auth_1 = require("../middleware/auth");
const NewsArticle_1 = require("../models/NewsArticle");
const SocialTrend_1 = require("../models/SocialTrend");
const router = (0, express_1.Router)();
// Fallback live video IDs in case scraper fails or gets rate-limited by YouTube
const FALLBACK_LIVE_IDS = {};
// Helper to resolve live video ID from a YouTube Channel ID by scraping its /live page
async function getLiveVideoId(channelId) {
    try {
        const url = `https://www.youtube.com/channel/${channelId}/live`;
        const response = await axios_1.default.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9"
            },
            timeout: 5000
        });
        const html = response.data;
        // 1. Try canonical link pattern
        const canonicalMatch = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([^"]+)"/);
        if (canonicalMatch && canonicalMatch[1]) {
            return canonicalMatch[1];
        }
        // 2. Try raw videoId pattern in JSON/HTML
        const videoIdMatch = html.match(/"videoId":"([^"]+)"/);
        if (videoIdMatch && videoIdMatch[1]) {
            return videoIdMatch[1];
        }
        // 3. Try shortUrl pattern
        const shortUrlMatch = html.match(/href="https:\/\/youtu\.be\/([^"]+)"/);
        if (shortUrlMatch && shortUrlMatch[1]) {
            return shortUrlMatch[1];
        }
        return null;
    }
    catch (error) {
        console.error(`Error resolving live stream for channel ${channelId}:`, error);
        return null;
    }
}
// Public routes
router.get("/", newsController_1.getAllNews);
// Fast ticker API
router.get("/ticker", async (req, res) => {
    try {
        const limit = Math.min(30, parseInt(req.query.limit) || 10);
        const { region } = req.query;
        const query = {};
        // Apply region filtering
        if (region && typeof region === "string") {
            const normalizedRegion = region.toLowerCase();
            if (normalizedRegion !== "global") {
                const locationMap = {
                    in: ["India", "Delhi", "Mumbai", "Bengaluru", "Chennai", "Kolkata"],
                    us: ["US", "United States", "Washington", "New York", "America"],
                    uk: ["UK", "United Kingdom", "London", "Britain"],
                    gb: ["UK", "United Kingdom", "London", "Britain"]
                };
                const locs = locationMap[normalizedRegion];
                if (locs)
                    query.location = { $in: locs };
            }
        }
        const articles = await NewsArticle_1.NewsArticle.find(query).sort({ publishedAt: -1 }).limit(limit).select('title _id link sourceUrl category');
        res.json({ success: true, data: articles });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Social Trends API
router.get("/social-trends", async (req, res) => {
    try {
        const trends = await SocialTrend_1.SocialTrend.find().sort({ viral_score: -1, mentions: -1 }).limit(10);
        res.json({ success: true, data: trends });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get("/trending-social", socialTrendingController_1.getTrendingSocialVideos);
router.get("/live-stream/:channelId", async (req, res) => {
    try {
        const { channelId } = req.params;
        const videoId = await getLiveVideoId(channelId);
        if (videoId) {
            res.json({ success: true, videoId });
        }
        else {
            const fallbackId = FALLBACK_LIVE_IDS[channelId] || null;
            res.json({ success: !!fallbackId, videoId: fallbackId, isFallback: true });
        }
    }
    catch (e) {
        const fallbackId = FALLBACK_LIVE_IDS[req.params.channelId] || null;
        res.json({ success: !!fallbackId, videoId: fallbackId, isFallback: true, error: e.message });
    }
});
router.get("/:id", newsController_1.getNewsById);
router.post("/:id/view", newsController_1.viewNews);
router.post("/:id/like", newsController_1.likeNews);
router.post("/:id/unlike", newsController_1.unlikeNews);
router.post("/:id/interact", newsController_1.interactNews);
// Protected routes (admin/editor only)
router.post("/", auth_1.authenticateFirebase, (0, auth_1.requireRole)("admin", "editor"), newsController_1.createNews);
router.put("/:id", auth_1.authenticateFirebase, (0, auth_1.requireRole)("admin", "editor"), newsController_1.updateNews);
router.delete("/:id", auth_1.authenticateFirebase, (0, auth_1.requireRole)("admin"), newsController_1.deleteNews);
// Seed: mark some recent articles as premium (admin only)
router.post("/seed-premium", auth_1.authenticateFirebase, (0, auth_1.requireRole)("admin"), async (req, res) => {
    try {
        const count = parseInt(req.query.count) || 10;
        const articles = await NewsArticle_1.NewsArticle.find().sort({ publishedAt: -1 }).limit(count * 2);
        const shuffled = articles.sort(() => Math.random() - 0.5);
        const toMark = shuffled.slice(0, count);
        await Promise.all(toMark.map((a) => NewsArticle_1.NewsArticle.findByIdAndUpdate(a._id, { isPremium: true })));
        res.json({ success: true, message: `Marked ${toMark.length} articles as premium.` });
    }
    catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});
exports.default = router;
//# sourceMappingURL=news.js.map