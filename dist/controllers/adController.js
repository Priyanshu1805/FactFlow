"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAd = exports.updateAd = exports.createAd = exports.getAdminAds = exports.trackAdInteraction = exports.getActiveAds = void 0;
const Ad_1 = require("../models/Ad");
const cacheService_1 = require("../services/cacheService");
// Get active ads (Public API for AdBanner)
const getActiveAds = async (req, res) => {
    try {
        const cacheKey = "ads:active";
        const cachedData = await (0, cacheService_1.getCached)(cacheKey);
        if (cachedData) {
            res.status(200).json({ success: true, data: cachedData });
            return;
        }
        const ads = await Ad_1.Ad.find({ isActive: true }).select("-clicks -views -createdBy").sort("-createdAt").lean();
        await (0, cacheService_1.setCached)(cacheKey, ads, 60 * 5); // Cache for 5 minutes
        res.status(200).json({ success: true, data: ads });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.getActiveAds = getActiveAds;
const AdTracking_1 = require("../models/AdTracking");
// Track view or click (Unique Tracking enforced)
const trackAdInteraction = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, firebaseUid } = req.body; // 'view' or 'click'
        // Determine unique identifier for the user (UID or IP Address)
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "unknown";
        const identifier = firebaseUid || ip;
        try {
            // Attempt to record this unique interaction
            await AdTracking_1.AdTracking.create({ adId: id, action, identifier });
            // If successful (no duplicate key error), increment the actual ad stats
            if (action === "view") {
                await Ad_1.Ad.findByIdAndUpdate(id, { $inc: { views: 1 } });
            }
            else if (action === "click") {
                await Ad_1.Ad.findByIdAndUpdate(id, { $inc: { clicks: 1 } });
            }
        }
        catch (err) {
            // E11000 duplicate key error means this user already viewed/clicked it.
            // We gracefully ignore it so stats don't artificially inflate.
            if (err.code !== 11000)
                throw err;
        }
        res.status(200).json({ success: true });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.trackAdInteraction = trackAdInteraction;
// --- ADMIN ENDPOINTS ---
const getAdminAds = async (req, res) => {
    try {
        const ads = await Ad_1.Ad.find().sort("-createdAt").populate("createdBy", "name email");
        res.status(200).json({ success: true, data: ads });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.getAdminAds = getAdminAds;
const createAd = async (req, res) => {
    try {
        const { title, imageUrl, targetUrl, isActive, expiresAt, cpc, cpm } = req.body;
        // Auth middleware ensures req.user is populated
        const user = req.user;
        if (!user || user.role !== "admin") {
            res.status(403).json({ success: false, error: "Not authorized" });
            return;
        }
        const ad = await Ad_1.Ad.create({
            title,
            imageUrl,
            targetUrl,
            isActive,
            expiresAt,
            cpc: Number(cpc) || 0,
            cpm: Number(cpm) || 0,
            createdBy: user._id
        });
        res.status(201).json({ success: true, data: ad });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.createAd = createAd;
const updateAd = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, imageUrl, targetUrl, isActive, expiresAt } = req.body;
        const user = req.user;
        if (!user || user.role !== "admin") {
            res.status(403).json({ success: false, error: "Not authorized" });
            return;
        }
        const ad = await Ad_1.Ad.findByIdAndUpdate(id, {
            title, imageUrl, targetUrl, isActive, expiresAt
        }, { new: true });
        res.status(200).json({ success: true, data: ad });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.updateAd = updateAd;
const deleteAd = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        if (!user || user.role !== "admin") {
            res.status(403).json({ success: false, error: "Not authorized" });
            return;
        }
        await Ad_1.Ad.findByIdAndDelete(id);
        res.status(200).json({ success: true });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.deleteAd = deleteAd;
//# sourceMappingURL=adController.js.map