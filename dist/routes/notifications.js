"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Notification_1 = require("../models/Notification");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
// ─────────────────────────────────────────────
// GET /api/notifications
// Fetch all notifications for a user
// Query: ?firebaseUid=xxx&limit=30&page=1
// ─────────────────────────────────────────────
router.get("/", async (req, res) => {
    try {
        const { firebaseUid, limit = "30", page = "1" } = req.query;
        if (!firebaseUid)
            return res.status(400).json({ error: "firebaseUid required" });
        const user = await User_1.User.findOne({ firebaseUid });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [notifications, unreadCount] = await Promise.all([
            Notification_1.Notification.find({ recipientId: user._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate("senderId", "name username avatar isVerified")
                .populate("senderIds", "name username avatar isVerified")
                .populate("postId", "caption media")
                .populate("articleId", "title image slug")
                .lean(),
            Notification_1.Notification.countDocuments({ recipientId: user._id, isRead: false }),
        ]);
        res.json({ success: true, notifications, unreadCount });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// GET /api/notifications/unread-count
// Quick endpoint just for the badge number
// Query: ?firebaseUid=xxx
// ─────────────────────────────────────────────
router.get("/unread-count", async (req, res) => {
    try {
        const { firebaseUid } = req.query;
        if (!firebaseUid)
            return res.status(400).json({ error: "firebaseUid required" });
        const user = await User_1.User.findOne({ firebaseUid });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const [unreadCount, trendingCount] = await Promise.all([
            Notification_1.Notification.countDocuments({
                recipientId: user._id,
                isRead: false,
            }),
            Notification_1.Notification.countDocuments({
                recipientId: user._id,
                isRead: false,
                type: "trending_story"
            })
        ]);
        res.json({ success: true, unreadCount, trendingCount });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// PUT /api/notifications/read-all
// Mark all notifications as read
// Body: { firebaseUid }
// ─────────────────────────────────────────────
router.put("/read-all", async (req, res) => {
    try {
        const { firebaseUid } = req.body;
        if (!firebaseUid)
            return res.status(400).json({ error: "firebaseUid required" });
        const user = await User_1.User.findOne({ firebaseUid });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        await Notification_1.Notification.updateMany({ recipientId: user._id, isRead: false }, { $set: { isRead: true } });
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// PUT /api/notifications/:id/read
// Mark single notification as read
// ─────────────────────────────────────────────
router.put("/:id/read", async (req, res) => {
    try {
        const notification = await Notification_1.Notification.findByIdAndUpdate(req.params.id, { $set: { isRead: true } }, { new: true });
        if (!notification)
            return res.status(404).json({ error: "Notification not found" });
        res.json({ success: true, notification });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// POST /api/notifications/system
// Create a system-wide or user-targeted notification (admin use)
// Body: { recipientFirebaseUid, type, message, link }
// ─────────────────────────────────────────────
router.post("/system", async (req, res) => {
    try {
        const { recipientFirebaseUid, type, message, link } = req.body;
        if (!recipientFirebaseUid || !message) {
            return res.status(400).json({ error: "recipientFirebaseUid and message required" });
        }
        const recipient = await User_1.User.findOne({ firebaseUid: recipientFirebaseUid });
        if (!recipient)
            return res.status(404).json({ error: "Recipient not found" });
        const notification = await Notification_1.Notification.create({
            recipientId: recipient._id,
            type: type || "system",
            message,
            link: link || null,
        });
        res.json({ success: true, notification });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// POST /api/notifications/trigger-daily-digest
// CRON placeholder: Generate daily digests for opted-in users
// ─────────────────────────────────────────────
router.post("/trigger-daily-digest", async (req, res) => {
    try {
        // 1. Find all users who have dailyDigest enabled
        const users = await User_1.User.find({ "settings.notifications.dailyDigest": true });
        // 2. Mock generating digest notifications for these users
        const notifications = users.map(user => ({
            recipientId: user._id,
            type: "daily_digest",
            message: "Your Daily Digest is ready: Top 5 stories of the day",
            isRead: false
        }));
        if (notifications.length > 0) {
            await Notification_1.Notification.insertMany(notifications);
        }
        res.json({ success: true, message: `Sent digests to ${users.length} users.` });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// DELETE /api/notifications/:id
// Delete a single notification
// ─────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
    try {
        await Notification_1.Notification.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=notifications.js.map