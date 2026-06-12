"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMorningDigests = sendMorningDigests;
exports.sendWeeklySummaries = sendWeeklySummaries;
const NotificationPrefs_1 = require("../models/NotificationPrefs");
const NewsArticle_1 = require("../models/NewsArticle");
const emailService_1 = require("./emailService");
async function fetchTopArticles(limit = 8) {
    const articles = await NewsArticle_1.NewsArticle.find()
        .sort({ publishedAt: -1 })
        .limit(limit)
        .lean();
    return articles;
}
async function sendMorningDigests() {
    try {
        const prefs = await NotificationPrefs_1.NotificationPrefs.find({ dailyDigest: true, emailEnabled: true }).populate("userId");
        for (const pref of prefs) {
            const user = pref.userId;
            if (!user?.email)
                continue;
            const articles = await fetchTopArticles(8);
            await (0, emailService_1.sendDigestEmail)(user.email, "daily", articles);
        }
        console.log(`📧 Morning digests sent to ${prefs.length} users`);
    }
    catch (err) {
        console.error("❌ Digest error:", err.message);
    }
}
async function sendWeeklySummaries() {
    try {
        const prefs = await NotificationPrefs_1.NotificationPrefs.find({ weeklySummary: true, emailEnabled: true }).populate("userId");
        for (const pref of prefs) {
            const user = pref.userId;
            if (!user?.email)
                continue;
            const articles = await fetchTopArticles(12);
            await (0, emailService_1.sendDigestEmail)(user.email, "weekly", articles);
        }
        console.log(`📧 Weekly summaries sent to ${prefs.length} users`);
    }
    catch (err) {
        console.error("❌ Weekly summary error:", err.message);
    }
}
//# sourceMappingURL=digestService.js.map