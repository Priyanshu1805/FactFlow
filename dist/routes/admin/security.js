"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authProtection_1 = require("../../middleware/authProtection");
const SecurityLog_1 = require("../../models/SecurityLog");
const BlockedIP_1 = require("../../models/BlockedIP");
const User_1 = require("../../models/User");
const router = (0, express_1.Router)();
// Only Superadmins and Admins can access the security dashboard
router.use(authProtection_1.requireAuth, (0, authProtection_1.requireRole)("superadmin", "admin"));
/**
 * 👁️ LAYER 4: Get Security Dashboard Stats
 */
router.get("/stats", async (req, res) => {
    try {
        const totalBlockedIPs = await BlockedIP_1.BlockedIP.countDocuments();
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentLogs = await SecurityLog_1.SecurityLog.find({ timestamp: { $gte: last24h } }).sort({ timestamp: -1 }).limit(100);
        const criticalEventsCount = await SecurityLog_1.SecurityLog.countDocuments({ severity: "critical", timestamp: { $gte: last24h } });
        // Calculate basic health score (100 - (critical * 5))
        const healthScore = Math.max(0, 100 - (criticalEventsCount * 5));
        // Active Sessions Count
        const usersWithSessions = await User_1.User.find({ "activeSessions.0": { $exists: true } }).select("activeSessions");
        const activeSessionsCount = usersWithSessions.reduce((acc, user) => acc + (user.activeSessions?.length || 0), 0);
        res.json({
            success: true,
            data: {
                totalBlockedIPs,
                criticalEventsCount,
                healthScore,
                activeSessionsCount,
                recentLogs
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch security stats" });
    }
});
/**
 * 👁️ LAYER 4: Get Blocked IPs
 */
router.get("/blocked-ips", async (req, res) => {
    try {
        const ips = await BlockedIP_1.BlockedIP.find().sort({ blockedAt: -1 });
        res.json({ success: true, data: ips });
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch blocked IPs" });
    }
});
/**
 * 👁️ LAYER 4: Unban IP
 */
router.post("/unban-ip", async (req, res) => {
    try {
        const { ip } = req.body;
        await BlockedIP_1.BlockedIP.deleteOne({ ip });
        // Log the unban
        await SecurityLog_1.SecurityLog.create({
            event: "IP Unbanned",
            userId: req.user?._id,
            ip: req.ip || "0.0.0.0",
            userAgent: req.headers['user-agent'] || "unknown",
            severity: "medium",
            details: { unbannedIp: ip }
        });
        res.json({ success: true, message: `IP ${ip} has been unbanned` });
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Failed to unban IP" });
    }
});
exports.default = router;
//# sourceMappingURL=security.js.map