"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = require("../models/User");
const NewsArticle_1 = require("../models/NewsArticle");
const Payment_1 = require("../models/Payment");
const Report_1 = require("../models/Report");
const router = (0, express_1.Router)();
// GET /api/admin-dashboard/stats
router.get("/stats", async (req, res) => {
    try {
        const totalUsers = await User_1.User.countDocuments();
        const totalNews = await NewsArticle_1.NewsArticle.countDocuments();
        // Calculate total revenue from Payments
        // Depending on schema, we sum up 'amount' or 'amountPaid'
        const payments = await Payment_1.Payment.find({});
        const totalRevenue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
        res.json({
            success: true,
            stats: {
                totalUsers,
                totalNews,
                totalRevenue
            }
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
const Ad_1 = require("../models/Ad");
// GET /api/admin-dashboard/revenue
router.get("/revenue", async (req, res) => {
    try {
        // Fetch latest payments
        const latestPayments = await Payment_1.Payment.find()
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
        const ads = await Ad_1.Ad.find().lean();
        let totalAdViews = 0;
        let totalAdClicks = 0;
        let customAdRevenue = 0;
        ads.forEach((ad) => {
            totalAdViews += (ad.views || 0);
            totalAdClicks += (ad.clicks || 0);
            const adCpc = Number(ad.cpc) || 0;
            const adCpm = Number(ad.cpm) || 0;
            customAdRevenue += (ad.clicks * adCpc) + ((ad.views / 1000) * adCpm);
        });
        res.json({
            success: true,
            data: latestPayments,
            adStats: {
                totalViews: totalAdViews,
                totalClicks: totalAdClicks,
                estimatedCustomRevenue: customAdRevenue,
                estimatedAdSenseRevenue: ((totalAdViews * 2.5) / 1000) * 40
            }
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// GET /api/admin-dashboard/moderation
router.get("/moderation", async (req, res) => {
    try {
        const pendingReports = await Report_1.Report.find({ status: "pending" })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
        res.json({ success: true, data: pendingReports });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// GET /api/admin-dashboard/verification-requests
router.get("/verification-requests", async (req, res) => {
    try {
        const pendingRequests = await User_1.User.find({ verificationStatus: "pending" })
            .select("_id username name email avatar bio followers createdAt")
            .sort({ updatedAt: -1 })
            .lean();
        res.json({ success: true, data: pendingRequests });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// PUT /api/admin-dashboard/moderation/:id
router.put("/moderation/:id", async (req, res) => {
    try {
        const { action } = req.body; // "dismiss" or "resolve"
        const status = action === "dismiss" ? "dismissed" : "resolved";
        const report = await Report_1.Report.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!report)
            return res.status(404).json({ success: false, error: "Report not found" });
        res.json({ success: true, data: report });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=adminDashboard.js.map