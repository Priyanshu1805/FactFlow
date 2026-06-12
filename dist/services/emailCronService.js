"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startEmailCronJobs = startEmailCronJobs;
const node_cron_1 = __importDefault(require("node-cron"));
const NewsArticle_1 = require("../models/NewsArticle");
const NotificationPrefs_1 = require("../models/NotificationPrefs");
const emailService_1 = require("./emailService");
function startEmailCronJobs() {
    // ── DAILY DIGEST (Runs based on user selected time)
    const dailySchedules = [
        { time: "7AM", cronStr: "0 7 * * *" },
        { time: "12PM", cronStr: "0 12 * * *" },
        { time: "6PM", cronStr: "0 18 * * *" },
        { time: "9PM", cronStr: "0 21 * * *" }
    ];
    dailySchedules.forEach(({ time, cronStr }) => {
        node_cron_1.default.schedule(cronStr, async () => {
            console.log(`📧 Running Daily Email Digest Cron for ${time}...`);
            try {
                // Find NotificationPrefs with dailyDigest enabled AND matching time
                const prefsList = await NotificationPrefs_1.NotificationPrefs.find({
                    "dailyDigest.enabled": true,
                    "dailyDigest.time": time
                }).populate("userId").lean();
                if (prefsList.length === 0)
                    return;
                // Filter users who have an email
                const users = prefsList.map(p => p.userId).filter(u => u && u.email);
                if (users.length === 0)
                    return;
                // Fetch top 5 articles from the last 24 hours
                const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
                const topArticles = await NewsArticle_1.NewsArticle.find({ publishedAt: { $gte: yesterday } })
                    .sort({ views: -1, likesCount: -1 })
                    .limit(5)
                    .lean();
                if (topArticles.length === 0)
                    return;
                let sentCount = 0;
                for (const user of users) {
                    const success = await (0, emailService_1.sendDigestEmail)(user.email, "daily", topArticles);
                    if (success)
                        sentCount++;
                }
                console.log(`✅ Sent Daily Digest (${time}) to ${sentCount} users.`);
            }
            catch (err) {
                console.error(`❌ Daily Digest (${time}) error:`, err.message);
            }
        });
    });
    // ── WEEKLY SUMMARY (Runs every Sunday at 09:00)
    node_cron_1.default.schedule("0 9 * * 0", async () => {
        console.log("📧 Running Weekly Email Summary Cron...");
        try {
            // Find users with newsletter/weekly digest enabled
            const prefsList = await NotificationPrefs_1.NotificationPrefs.find({
                weeklySummary: true
            }).populate("userId").lean();
            if (prefsList.length === 0)
                return;
            // Filter users who have an email
            const users = prefsList.map(p => p.userId).filter(u => u && u.email);
            if (users.length === 0)
                return;
            // Fetch top 10 articles from the last 7 days
            const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const topArticles = await NewsArticle_1.NewsArticle.find({ publishedAt: { $gte: lastWeek } })
                .sort({ views: -1, likesCount: -1 })
                .limit(10)
                .lean();
            if (topArticles.length === 0)
                return;
            let sentCount = 0;
            for (const user of users) {
                const success = await (0, emailService_1.sendDigestEmail)(user.email, "weekly", topArticles);
                if (success)
                    sentCount++;
            }
            console.log(`✅ Sent Weekly Summary to ${sentCount} users.`);
        }
        catch (err) {
            console.error("❌ Weekly Summary error:", err.message);
        }
    });
    console.log("✅ Email Cron Jobs Started (Daily: 07:00 | Weekly: Sun 09:00)");
}
//# sourceMappingURL=emailCronService.js.map