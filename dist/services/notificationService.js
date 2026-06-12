"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = createNotification;
exports.createBulkNotifications = createBulkNotifications;
const Notification_1 = require("../models/Notification");
const NotificationPrefs_1 = require("../models/NotificationPrefs");
const pushService_1 = require("./pushService");
// Helper to check if current time is within quiet hours
function isQuietHours(quietHours) {
    if (!quietHours || !quietHours.enabled || !quietHours.from || !quietHours.to)
        return false;
    const now = new Date();
    // Using server local time for now. In a real production app, we would use the user's timezone.
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
    const [fromH, fromM] = quietHours.from.split(':').map(Number);
    const [toH, toM] = quietHours.to.split(':').map(Number);
    const fromTotal = fromH * 60 + fromM;
    const toTotal = toH * 60 + toM;
    if (fromTotal < toTotal) {
        // e.g. 09:00 to 17:00
        return currentTotalMinutes >= fromTotal && currentTotalMinutes <= toTotal;
    }
    else {
        // Crosses midnight e.g. 22:00 to 07:00
        return currentTotalMinutes >= fromTotal || currentTotalMinutes <= toTotal;
    }
}
async function createNotification(data) {
    try {
        // 1. Fetch user preferences
        const prefs = await NotificationPrefs_1.NotificationPrefs.findOne({ userId: data.recipientId });
        let inQuietHours = false;
        let pushEnabled = false;
        if (prefs) {
            // 2. Check if the specific notification type is disabled
            if ((data.type === "reply" || data.type === "comment") && !prefs.commentReplies)
                return null;
            if (data.type === "mention" && !prefs.mentions)
                return null;
            if (data.type === "breaking_news" && !prefs.breakingNews)
                return null;
            if (data.type === "trending_story" && !prefs.liveUpdates)
                return null;
            if (data.type === "new_article" && !prefs.liveUpdates)
                return null;
            inQuietHours = isQuietHours(prefs.quietHours);
            pushEnabled = prefs.pushEnabled;
        }
        // 3. Smart Grouping Logic
        const GROUPABLE_TYPES = ["like", "reaction", "follow", "share_post", "mention", "reply"];
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        let notification = null;
        if (GROUPABLE_TYPES.includes(data.type) && data.senderId) {
            const query = {
                recipientId: data.recipientId,
                type: data.type,
                createdAt: { $gte: twentyFourHoursAgo },
            };
            if (data.postId)
                query.postId = data.postId;
            if (data.commentId)
                query.commentId = data.commentId;
            if (data.articleId)
                query.articleId = data.articleId;
            const existingNotif = await Notification_1.Notification.findOne(query).sort({ createdAt: -1 });
            if (existingNotif) {
                // We found an existing notification to group with
                const senderIdsSet = new Set(existingNotif.senderIds?.map(id => id.toString()) || []);
                if (existingNotif.senderId)
                    senderIdsSet.add(existingNotif.senderId.toString());
                senderIdsSet.add(data.senderId);
                existingNotif.senderIds = Array.from(senderIdsSet);
                existingNotif.senderId = data.senderId;
                existingNotif.updatedAt = new Date();
                existingNotif.isRead = false; // Mark unread again to bring to attention
                await existingNotif.save();
                notification = await Notification_1.Notification.findById(existingNotif._id)
                    .populate("senderId", "name username avatar isVerified")
                    .populate("senderIds", "name username avatar isVerified")
                    .populate("postId", "caption media")
                    .populate("articleId", "title image slug")
                    .lean();
            }
        }
        if (!notification) {
            // Create new
            const createdNotif = await Notification_1.Notification.create({
                ...data,
                senderIds: data.senderId ? [data.senderId] : [],
                isRead: false
            });
            notification = await Notification_1.Notification.findById(createdNotif._id)
                .populate("senderId", "name username avatar isVerified")
                .populate("senderIds", "name username avatar isVerified")
                .populate("postId", "caption media")
                .populate("articleId", "title image slug")
                .lean();
        }
        // 4. Send Real-time Socket Event
        const io = (0, pushService_1.getSocket)();
        if (io) {
            io.to(`user_${data.recipientId}`).emit("new_notification", notification);
        }
        // 5. Send Web Push Notification if not in quiet hours
        if (pushEnabled && !inQuietHours && prefs?.pushSubscription) {
            await (0, pushService_1.sendPushNotification)(prefs.pushSubscription, {
                title: data.title || "New Notification",
                body: data.message || "You have a new alert",
                url: data.link || "/",
                icon: data.image
            });
        }
        return notification;
    }
    catch (err) {
        console.error("❌ Notification error:", err.message);
        return null;
    }
}
async function createBulkNotifications(userIds, data) {
    let count = 0;
    for (const recipientId of userIds) {
        const result = await createNotification({ recipientId, ...data });
        if (result)
            count++;
    }
    return count;
}
//# sourceMappingURL=notificationService.js.map