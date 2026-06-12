"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("../config/cloudinary");
const User_1 = require("../models/User");
const Comment_1 = require("../models/Comment");
const NewsArticle_1 = require("../models/NewsArticle");
const Reel_1 = require("../models/Reel");
const Post_1 = require("../models/Post");
const History_1 = require("../models/History");
const mongoose_1 = __importDefault(require("mongoose"));
const OTPAuth = __importStar(require("otpauth"));
const qrcode_1 = __importDefault(require("qrcode"));
const router = (0, express_1.Router)();
// Multer memory storage (we upload buffer directly to cloudinary)
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        }
        else {
            cb(new Error("Only image files are allowed"));
        }
    },
});
// ─────────────────────────────────────────────
// GET /api/users/profile?firebaseUid=xxx
// Get or create user profile in MongoDB by Firebase UID
// ─────────────────────────────────────────────
router.get("/profile", async (req, res) => {
    try {
        const { firebaseUid, email } = req.query;
        if (!firebaseUid && !email) {
            return res.status(400).json({ error: "firebaseUid or email required" });
        }
        let user = await User_1.User.findOne(firebaseUid ? { firebaseUid } : { email });
        // Auto-create profile if first login (Firebase user, not in MongoDB yet)
        if (!user && email) {
            const name = req.query.name || "Fact Flow User";
            const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
            user = await User_1.User.create({
                firebaseUid,
                username: req.query.username || undefined,
                name: name,
                email,
                phone: req.query.phone || undefined,
                avatar: req.query.avatar || defaultAvatar,
                password: "firebase-auth-no-password", // placeholder
                isVerified: false,
                verificationStatus: "unverified",
            });
        }
        const { Follow } = await Promise.resolve().then(() => __importStar(require("../models/Follow")));
        const followersCount = await Follow.countDocuments({ followingId: user?._id });
        res.json({ success: true, user, followersCount });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// PUT /api/users/profile  — Update name, phone, bio
// Body: { firebaseUid, name, phone, bio }
// ─────────────────────────────────────────────
router.put("/profile", async (req, res) => {
    try {
        const { firebaseUid, email, username, name, phone, bio } = req.body;
        if (!firebaseUid)
            return res.status(400).json({ error: "firebaseUid required" });
        // Try finding by firebaseUid first
        let user = await User_1.User.findOne({ firebaseUid });
        if (!user && email) {
            // If not found by firebaseUid, maybe they have an old account with the same email?
            user = await User_1.User.findOne({ email });
            if (user) {
                // Link the old account to the new firebaseUid
                user.firebaseUid = firebaseUid;
            }
        }
        if (!user) {
            // Completely new user
            const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || email || "User")}`;
            user = await User_1.User.create({
                firebaseUid,
                email: email || "",
                username: username || undefined,
                name,
                phone: phone || undefined,
                bio,
                password: "firebase-auth-no-password",
                isVerified: false,
                verificationStatus: "unverified",
                avatar: defaultAvatar,
            });
        }
        else {
            // Update existing user
            if (username)
                user.username = username;
            user.name = name;
            if (phone)
                user.phone = phone;
            user.bio = bio;
            await user.save();
        }
        res.json({ success: true, user });
    }
    catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: "Username or Phone number is already in use." });
        }
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// GET /api/users/settings/:firebaseUid
// Get user settings
// ─────────────────────────────────────────────
router.get("/settings/:firebaseUid", async (req, res) => {
    try {
        const { firebaseUid } = req.params;
        const user = await User_1.User.findOne({ firebaseUid });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        res.json({ success: true, settings: user.settings });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// PUT /api/users/settings
// Update user settings
// Body: { firebaseUid, settings: Partial<Settings> }
// ─────────────────────────────────────────────
router.put("/settings", async (req, res) => {
    try {
        const { firebaseUid, settings } = req.body;
        if (!firebaseUid || !settings)
            return res.status(400).json({ error: "firebaseUid and settings required" });
        const user = await User_1.User.findOne({ firebaseUid });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        // Deep merge settings
        const currentSettings = user.toObject().settings || {};
        user.settings = {
            ...currentSettings,
            ...settings,
            notifications: {
                ...currentSettings.notifications,
                ...(settings.notifications || {})
            },
            content: {
                ...currentSettings.content,
                ...(settings.content || {})
            }
        };
        await user.save();
        res.json({ success: true, settings: user.settings });
    }
    catch (err) {
        console.error("Error saving settings:", err);
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// POST /api/users/save
// Save an item to the user's savedItems
// ─────────────────────────────────────────────
router.post("/save", async (req, res) => {
    try {
        const { firebaseUid, itemId, itemType } = req.body;
        if (!firebaseUid || !itemId || !itemType)
            return res.status(400).json({ error: "Missing parameters" });
        const user = await User_1.User.findOne({ firebaseUid });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        // Check if already saved
        const exists = user.savedItems.some((item) => item.itemId === itemId && item.itemType === itemType);
        if (!exists) {
            user.savedItems.push({ itemId, itemType, savedAt: new Date() });
            await user.save();
        }
        res.json({ success: true, message: "Saved successfully" });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// POST /api/users/unsave
// Remove an item from the user's savedItems
// ─────────────────────────────────────────────
router.post("/unsave", async (req, res) => {
    try {
        const { firebaseUid, itemId, itemType } = req.body;
        if (!firebaseUid || !itemId || !itemType)
            return res.status(400).json({ error: "Missing parameters" });
        const user = await User_1.User.findOne({ firebaseUid });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        user.savedItems = user.savedItems.filter((item) => !(item.itemId === itemId && item.itemType === itemType));
        await user.save();
        res.json({ success: true, message: "Unsaved successfully" });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// GET /api/users/saved/:firebaseUid
// Get all saved items for a user
// ─────────────────────────────────────────────
router.get("/saved/:firebaseUid", async (req, res) => {
    try {
        const { firebaseUid } = req.params;
        const user = await User_1.User.findOne({ firebaseUid });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        // Sort by savedAt descending
        const savedItems = [...user.savedItems].sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());
        // Group them and validate ObjectIds
        const isValidId = (id) => mongoose_1.default.Types.ObjectId.isValid(id);
        const postIds = savedItems.filter(i => i.itemType === "post" && isValidId(i.itemId)).map(i => i.itemId);
        const shortIds = savedItems.filter(i => i.itemType === "short" && isValidId(i.itemId)).map(i => i.itemId);
        const socialPostIds = savedItems.filter(i => i.itemType === "social_post" && isValidId(i.itemId)).map(i => i.itemId);
        const videoItems = savedItems.filter(i => i.itemType === "video");
        // Fetch populated data
        const populatedPosts = await NewsArticle_1.NewsArticle.find({ _id: { $in: postIds } })
            .select("title image category createdAt excerpt source");
        const populatedShorts = await Reel_1.Reel.find({ _id: { $in: shortIds } })
            .select("title thumbnailUrl views source youtubeId");
        const populatedSocialPosts = await Post_1.Post.find({ _id: { $in: socialPostIds } })
            .populate("author", "name username avatar isVerified")
            .select("caption media createdAt location likesCount commentsCount savesCount author");
        res.json({
            success: true,
            data: {
                posts: populatedPosts,
                shorts: populatedShorts,
                socialPosts: populatedSocialPosts,
                videos: videoItems.map(v => v.itemId) // Send raw string IDs for Live TV
            }
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// GET /api/users/public/:username
// Get public profile details
// ─────────────────────────────────────────────
router.get("/public/:username", async (req, res) => {
    try {
        const username = req.params.username;
        // Check if the param might be an ObjectId
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(username);
        const user = await User_1.User.findOne({
            $or: [
                { username: new RegExp('^' + username + '$', 'i') },
                { firebaseUid: username },
                ...(isObjectId ? [{ _id: username }] : [])
            ]
        }, "name username bio avatar coverImage isVerified createdAt role isDisabled" // Only select safe fields
        );
        if (!user || user.isDisabled) {
            return res.status(404).json({ error: "User not found" });
        }
        const { Follow } = await Promise.resolve().then(() => __importStar(require("../models/Follow")));
        // Get stats: social posts only
        const postsCount = await Post_1.Post.countDocuments({ author: user._id });
        // Fetch followers & following from Follow collection
        const followersCount = await Follow.countDocuments({ followingId: user._id });
        const followingCount = await Follow.countDocuments({ followerId: user._id });
        // Fetch latest 20 posts
        const posts = await Post_1.Post.find({ author: user._id })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate("author", "name username avatar isVerified")
            .lean();
        // Only use actual social posts for this profile
        const combinedPosts = posts;
        const viewerUid = req.query.viewerUid;
        let isFollowing = false;
        if (viewerUid) {
            const viewerUser = await User_1.User.findOne({ firebaseUid: viewerUid });
            if (viewerUser) {
                const followDoc = await Follow.findOne({ followerId: viewerUser._id, followingId: user._id });
                isFollowing = !!followDoc;
            }
        }
        res.json({
            success: true,
            user,
            isFollowing,
            stats: {
                posts: postsCount,
                followers: followersCount,
                following: followingCount,
            },
            posts: combinedPosts
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// POST /api/users/:id/follow
// Follow a user
// Body: { viewerUid: string }
// ─────────────────────────────────────────────
router.post("/:id/follow", async (req, res) => {
    try {
        const { id } = req.params; // The ID of the user being followed (ObjectId or Username)
        const { viewerUid } = req.body; // Firebase UID of the current user doing the following
        if (!viewerUid)
            return res.status(400).json({ error: "Viewer UID required" });
        const followerUser = await User_1.User.findOne({ firebaseUid: viewerUid });
        if (!followerUser)
            return res.status(404).json({ error: "Follower user not found" });
        // Find the target user
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
        const followingUser = await User_1.User.findOne({
            $or: [
                { username: new RegExp('^' + id + '$', 'i') },
                { firebaseUid: id },
                ...(isObjectId ? [{ _id: id }] : [])
            ]
        });
        if (!followingUser)
            return res.status(404).json({ error: "Target user not found" });
        if (followerUser._id.toString() === followingUser._id.toString()) {
            return res.status(400).json({ error: "You cannot follow yourself" });
        }
        const { Follow } = await Promise.resolve().then(() => __importStar(require("../models/Follow")));
        // Create the follow document if it doesn't exist
        try {
            await Follow.create({ followerId: followerUser._id, followingId: followingUser._id });
        }
        catch (e) {
            // 11000 is duplicate key error, meaning they are already following
            if (e.code !== 11000)
                throw e;
        }
        // Broadcast update via Socket.IO
        const io = req.app.get("io");
        if (io) {
            const followersCount = await Follow.countDocuments({ followingId: followingUser._id });
            const followingCount = await Follow.countDocuments({ followerId: followingUser._id });
            const followerUserFollowingCount = await Follow.countDocuments({ followerId: followerUser._id });
            const followerUserFollowersCount = await Follow.countDocuments({ followingId: followerUser._id });
            // Emit to target user's profile
            io.to(`profile_${followingUser._id}`).to(`profile_${followingUser.username}`).to(`profile_${followingUser.firebaseUid}`).emit("profile_stats_update", { followers: followersCount, following: followingCount });
            // Emit to current user's profile
            io.to(`profile_${followerUser._id}`).to(`profile_${followerUser.username}`).to(`profile_${followerUser.firebaseUid}`).emit("profile_stats_update", { followers: followerUserFollowersCount, following: followerUserFollowingCount });
        }
        res.json({ success: true, message: "Followed successfully" });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// DELETE /api/users/:id/unfollow
// Unfollow a user
// Body: { viewerUid: string }
// ─────────────────────────────────────────────
router.delete("/:id/unfollow", async (req, res) => {
    try {
        const { id } = req.params;
        const viewerUid = req.body.viewerUid || req.query.viewerUid; // Support both
        if (!viewerUid)
            return res.status(400).json({ error: "Viewer UID required" });
        const followerUser = await User_1.User.findOne({ firebaseUid: viewerUid });
        if (!followerUser)
            return res.status(404).json({ error: "Follower user not found" });
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
        const followingUser = await User_1.User.findOne({
            $or: [
                { username: new RegExp('^' + id + '$', 'i') },
                { firebaseUid: id },
                ...(isObjectId ? [{ _id: id }] : [])
            ]
        });
        if (!followingUser)
            return res.status(404).json({ error: "Target user not found" });
        const { Follow } = await Promise.resolve().then(() => __importStar(require("../models/Follow")));
        await Follow.deleteOne({ followerId: followerUser._id, followingId: followingUser._id });
        // Broadcast update via Socket.IO
        const io = req.app.get("io");
        if (io) {
            const followersCount = await Follow.countDocuments({ followingId: followingUser._id });
            const followingCount = await Follow.countDocuments({ followerId: followingUser._id });
            const followerUserFollowingCount = await Follow.countDocuments({ followerId: followerUser._id });
            const followerUserFollowersCount = await Follow.countDocuments({ followingId: followerUser._id });
            // Emit to target user's profile
            io.to(`profile_${followingUser._id}`).to(`profile_${followingUser.username}`).to(`profile_${followingUser.firebaseUid}`).emit("profile_stats_update", { followers: followersCount, following: followingCount });
            // Emit to current user's profile
            io.to(`profile_${followerUser._id}`).to(`profile_${followerUser.username}`).to(`profile_${followerUser.firebaseUid}`).emit("profile_stats_update", { followers: followerUserFollowersCount, following: followerUserFollowingCount });
        }
        res.json({ success: true, message: "Unfollowed successfully" });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// POST /api/users/:id/toggle-follow
// Toggle Follow a user
// Body: { viewerUid: string }
// ─────────────────────────────────────────────
router.post("/:id/toggle-follow", async (req, res) => {
    try {
        const { id } = req.params;
        const { viewerUid } = req.body;
        if (!viewerUid)
            return res.status(400).json({ error: "Viewer UID required" });
        const followerUser = await User_1.User.findOne({ firebaseUid: viewerUid });
        if (!followerUser)
            return res.status(404).json({ error: "Follower user not found" });
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
        const followingUser = await User_1.User.findOne({
            $or: [
                { username: new RegExp('^' + id + '$', 'i') },
                { firebaseUid: id },
                ...(isObjectId ? [{ _id: id }] : [])
            ]
        });
        if (!followingUser)
            return res.status(404).json({ error: "Target user not found" });
        if (followerUser._id.toString() === followingUser._id.toString()) {
            return res.status(400).json({ error: "You cannot follow yourself" });
        }
        const { Follow } = await Promise.resolve().then(() => __importStar(require("../models/Follow")));
        const existingFollow = await Follow.findOne({ followerId: followerUser._id, followingId: followingUser._id });
        let isFollowing = false;
        if (existingFollow) {
            await Follow.deleteOne({ _id: existingFollow._id });
            isFollowing = false;
        }
        else {
            await Follow.create({ followerId: followerUser._id, followingId: followingUser._id });
            isFollowing = true;
        }
        // Broadcast update via Socket.IO
        const io = req.app.get("io");
        if (io) {
            const followersCount = await Follow.countDocuments({ followingId: followingUser._id });
            const followingCount = await Follow.countDocuments({ followerId: followingUser._id });
            const followerUserFollowingCount = await Follow.countDocuments({ followerId: followerUser._id });
            const followerUserFollowersCount = await Follow.countDocuments({ followingId: followerUser._id });
            io.to(`profile_${followingUser._id}`).to(`profile_${followingUser.username}`).to(`profile_${followingUser.firebaseUid}`).emit("profile_stats_update", { followers: followersCount, following: followingCount });
            io.to(`profile_${followerUser._id}`).to(`profile_${followerUser.username}`).to(`profile_${followerUser.firebaseUid}`).emit("profile_stats_update", { followers: followerUserFollowersCount, following: followerUserFollowingCount });
        }
        res.json({ success: true, isFollowing, message: isFollowing ? "Followed successfully" : "Unfollowed successfully" });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// POST /api/users/lookup
// Look up email by username or phone
// Body: { identifier }
// ─────────────────────────────────────────────
router.post("/lookup", async (req, res) => {
    try {
        const { identifier } = req.body;
        if (!identifier)
            return res.status(400).json({ error: "Identifier required" });
        console.log("Lookup called with identifier:", identifier);
        // Find user by email, username, or phone
        // For phone, we create a regex that matches the last 10 digits if possible, to ignore country codes.
        const phoneDigits = identifier.replace(/[^0-9]/g, '');
        const phoneRegex = phoneDigits.length >= 10 ? new RegExp(phoneDigits.slice(-10) + '$') : new RegExp('^' + identifier + '$');
        const user = await User_1.User.findOne({
            $or: [
                { email: identifier.toLowerCase() },
                { username: new RegExp('^' + identifier + '$', 'i') },
                { phone: identifier },
                { phone: phoneRegex }
            ]
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ success: true, email: user.email });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// POST /api/users/check-username
// Check if a username is available
// Body: { username }
// ─────────────────────────────────────────────
router.post("/check-username", async (req, res) => {
    try {
        const { username } = req.body;
        if (!username)
            return res.status(400).json({ error: "Username required" });
        // Case-insensitive check
        const user = await User_1.User.findOne({ username: new RegExp('^' + username + '$', 'i') });
        res.json({ success: true, available: !user });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// POST /api/users/avatar  — Upload profile picture
// multipart/form-data: file + firebaseUid
// ─────────────────────────────────────────────
router.post("/avatar", upload.single("avatar"), async (req, res) => {
    try {
        if (!req.file)
            return res.status(400).json({ error: "No file uploaded" });
        const { firebaseUid } = req.body;
        if (!firebaseUid)
            return res.status(400).json({ error: "firebaseUid required" });
        // Upload buffer to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary_1.cloudinary.uploader.upload_stream({
                folder: "factflow/avatars",
                public_id: `user_${firebaseUid}`,
                overwrite: true,
                transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
            }, (error, result) => {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
            stream.end(req.file.buffer);
        });
        const avatarUrl = uploadResult.secure_url;
        // Save to MongoDB
        await User_1.User.findOneAndUpdate({ firebaseUid }, { $set: { avatar: avatarUrl } });
        res.json({ success: true, avatarUrl });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// POST /api/users/logout-all
// Revoke all Firebase refresh tokens for the user
// Body: { firebaseUid }
// ─────────────────────────────────────────────
router.post("/logout-all", async (req, res) => {
    try {
        const { firebaseUid } = req.body;
        if (!firebaseUid)
            return res.status(400).json({ error: "firebaseUid required" });
        // Try Firebase Admin SDK
        try {
            const admin = await Promise.resolve().then(() => __importStar(require("../config/firebase-admin")));
            await admin.admin.auth().revokeRefreshTokens(firebaseUid);
            console.log(`✅ Revoked all refresh tokens for UID: ${firebaseUid}`);
        }
        catch (adminErr) {
            console.warn("Firebase Admin revoke failed (may need service account):", adminErr.message);
            // Even if admin SDK fails, we return success — the client will sign out locally
        }
        res.json({ success: true, message: "All sessions revoked. Please log in again." });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// POST /api/users/schedule-deletion
// Schedule account for deletion in 7 days
// Body: { firebaseUid, reason }
// ─────────────────────────────────────────────
router.post("/schedule-deletion", async (req, res) => {
    try {
        const { firebaseUid, reason } = req.body;
        if (!firebaseUid)
            return res.status(400).json({ error: "firebaseUid required" });
        const user = await User_1.User.findOne({ firebaseUid });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const deletionDate = new Date();
        deletionDate.setDate(deletionDate.getDate() + 7);
        // Revoke tokens so they are logged out immediately
        try {
            const admin = await Promise.resolve().then(() => __importStar(require("../config/firebase-admin")));
            await admin.admin.auth().revokeRefreshTokens(firebaseUid);
        }
        catch (adminErr) {
            console.warn("Firebase Admin revoke failed:", adminErr.message);
        }
        user.deletionScheduledFor = deletionDate;
        user.accountActionReason = reason || "";
        await user.save();
        res.json({
            success: true,
            message: `Account scheduled for permanent deletion on ${deletionDate.toDateString()}.`,
            deletionDate,
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// POST /api/users/deactivate-account
// Temporarily disable account
// Body: { firebaseUid, reason }
// ─────────────────────────────────────────────
router.post("/deactivate-account", async (req, res) => {
    try {
        const { firebaseUid, reason } = req.body;
        if (!firebaseUid)
            return res.status(400).json({ error: "firebaseUid required" });
        const user = await User_1.User.findOne({ firebaseUid });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        // Revoke tokens so they are logged out immediately
        try {
            const admin = await Promise.resolve().then(() => __importStar(require("../config/firebase-admin")));
            await admin.admin.auth().revokeRefreshTokens(firebaseUid);
        }
        catch (adminErr) {
            console.warn("Firebase Admin revoke failed:", adminErr.message);
        }
        user.isDisabled = true;
        user.accountActionReason = reason || "";
        await user.save();
        res.json({ success: true, message: "Account has been deactivated." });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// POST /api/users/reactivate-account
// Cancel deletion or enable disabled account
// Body: { firebaseUid }
// ─────────────────────────────────────────────
router.post("/reactivate-account", async (req, res) => {
    try {
        const { firebaseUid } = req.body;
        if (!firebaseUid)
            return res.status(400).json({ error: "firebaseUid required" });
        const user = await User_1.User.findOne({ firebaseUid });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        user.isDisabled = false;
        user.deletionScheduledFor = undefined;
        user.accountActionReason = undefined;
        await user.save();
        res.json({ success: true, message: "Account reactivated successfully." });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// POST /api/users/2fa/generate
// Generate TOTP secret and QR code URL
// Body: { firebaseUid, email }
// ─────────────────────────────────────────────
router.post("/2fa/generate", async (req, res) => {
    try {
        const { firebaseUid, email } = req.body;
        if (!firebaseUid)
            return res.status(400).json({ error: "firebaseUid required" });
        const user = await User_1.User.findOne({ firebaseUid });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        // Generate secret
        let secret = new OTPAuth.Secret({ size: 20 });
        // Save secret temporarily
        user.twoFactorSecret = secret.base32;
        await user.save();
        let totp = new OTPAuth.TOTP({
            issuer: "Fact Flow",
            label: email || user.email,
            algorithm: "SHA1",
            digits: 6,
            period: 30,
            secret: secret,
        });
        // Generate QR Code data URL
        const qrCodeUrl = await qrcode_1.default.toDataURL(totp.toString());
        res.json({ success: true, qrCodeUrl, secret: secret.base32 });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// POST /api/users/2fa/verify
// Verify TOTP token and enable 2FA
// Body: { firebaseUid, token }
// ─────────────────────────────────────────────
router.post("/2fa/verify", async (req, res) => {
    try {
        const { firebaseUid, token } = req.body;
        if (!firebaseUid || !token)
            return res.status(400).json({ error: "firebaseUid and token required" });
        const user = await User_1.User.findOne({ firebaseUid });
        if (!user || !user.twoFactorSecret)
            return res.status(400).json({ error: "2FA setup not initiated" });
        let totp = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(user.twoFactorSecret) });
        let delta = totp.validate({ token, window: 1 });
        if (delta !== null) {
            user.isTwoFactorEnabled = true;
            await user.save();
            res.json({ success: true, message: "2FA enabled successfully" });
        }
        else {
            res.status(400).json({ error: "Invalid verification code" });
        }
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// POST /api/users/2fa/disable
// Verify TOTP token and disable 2FA
// Body: { firebaseUid, token }
// ─────────────────────────────────────────────
router.post("/2fa/disable", async (req, res) => {
    try {
        const { firebaseUid, token } = req.body;
        if (!firebaseUid || !token)
            return res.status(400).json({ error: "firebaseUid and token required" });
        const user = await User_1.User.findOne({ firebaseUid });
        if (!user || !user.twoFactorSecret)
            return res.status(400).json({ error: "2FA is not enabled" });
        let totp = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(user.twoFactorSecret) });
        let delta = totp.validate({ token, window: 1 });
        if (delta !== null) {
            user.isTwoFactorEnabled = false;
            user.twoFactorSecret = undefined;
            await user.save();
            res.json({ success: true, message: "2FA disabled successfully" });
        }
        else {
            res.status(400).json({ error: "Invalid verification code" });
        }
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// POST /api/users/2fa/verify-login
// Verify TOTP token during login
// Body: { firebaseUid, token }
// ─────────────────────────────────────────────
router.post("/2fa/verify-login", async (req, res) => {
    try {
        const { firebaseUid, token } = req.body;
        if (!firebaseUid || !token)
            return res.status(400).json({ error: "firebaseUid and token required" });
        const user = await User_1.User.findOne({ firebaseUid });
        if (!user || !user.twoFactorSecret || !user.isTwoFactorEnabled) {
            return res.status(400).json({ error: "2FA is not enabled for this user" });
        }
        let totp = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(user.twoFactorSecret) });
        let delta = totp.validate({ token, window: 1 });
        if (delta !== null) {
            res.json({ success: true, message: "2FA verified" });
        }
        else {
            res.status(400).json({ error: "Invalid verification code" });
        }
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// GET /api/users/search-mentions?q=...
// Search users by username or name for @mentions
// ─────────────────────────────────────────────
router.get("/search-mentions", async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== "string") {
            return res.json({ success: true, users: [] });
        }
        const regex = new RegExp(q, "i");
        const users = await User_1.User.find({
            $or: [{ username: regex }, { name: regex }]
        })
            .select("username name avatar _id")
            .limit(10)
            .lean();
        res.json({ success: true, users });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// POST /api/users/post
// User creates a news post
// ─────────────────────────────────────────────
router.post("/post", async (req, res) => {
    try {
        const { firebaseUid, mediaUrl, caption } = req.body;
        if (!firebaseUid || !mediaUrl)
            return res.status(400).json({ error: "Missing required fields" });
        const user = await User_1.User.findOne({ firebaseUid });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const newPost = new Post_1.Post({
            author: user._id,
            media: [{ url: mediaUrl, type: req.body.mediaType || "image" }],
            caption: caption || "",
            hashtags: [],
            location: "",
            likes: [],
            commentsCount: 0,
            savesCount: 0,
        });
        await newPost.save();
        await newPost.populate("author", "name username avatar isVerified");
        const io = req.app.get("io");
        if (io) {
            io.emit("new_post", newPost);
        }
        res.json({ success: true, post: newPost });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// POST /api/users/short
// User creates a news short
// ─────────────────────────────────────────────
router.post("/short", async (req, res) => {
    try {
        const { firebaseUid, mediaUrl, caption } = req.body;
        if (!firebaseUid || !mediaUrl)
            return res.status(400).json({ error: "Missing required fields" });
        const user = await User_1.User.findOne({ firebaseUid });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const newReel = new Reel_1.Reel({
            title: caption || "User Short",
            description: caption || "",
            videoUrl: mediaUrl,
            thumbnailUrl: mediaUrl.replace(/\.[^/.]+$/, ".jpg"), // Cloudinary auto-generates thumbnails for videos using .jpg extension
            duration: 60,
            source: "manual",
            author: user.username || user.name
        });
        await newReel.save();
        const io = req.app.get("io");
        if (io) {
            io.emit("new_reel", newReel);
        }
        res.json({ success: true, short: newReel });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// POST /api/users/cover  — Upload profile cover banner
// multipart/form-data: file + firebaseUid
// ─────────────────────────────────────────────
router.post("/cover", upload.single("cover"), async (req, res) => {
    try {
        if (!req.file)
            return res.status(400).json({ error: "No file uploaded" });
        const { firebaseUid } = req.body;
        if (!firebaseUid)
            return res.status(400).json({ error: "firebaseUid required" });
        // Upload buffer to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary_1.cloudinary.uploader.upload_stream({
                folder: "factflow/covers",
                public_id: `user_cover_${firebaseUid}`,
                overwrite: true,
            }, (error, result) => {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
            stream.end(req.file.buffer);
        });
        const coverUrl = uploadResult.secure_url;
        // Save to MongoDB
        await User_1.User.findOneAndUpdate({ firebaseUid }, { $set: { coverImage: coverUrl } });
        res.json({ success: true, coverUrl });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// POST /api/users/follow
// Follow/Unfollow a user
// Body: { firebaseUid, targetUsername }
// ─────────────────────────────────────────────
router.post("/follow", async (req, res) => {
    try {
        const { firebaseUid, targetUsername } = req.body;
        if (!firebaseUid || !targetUsername)
            return res.status(400).json({ error: "firebaseUid and targetUsername required" });
        const currentUser = await User_1.User.findOne({ firebaseUid });
        const targetUser = await User_1.User.findOne({ username: targetUsername });
        if (!currentUser || !targetUser)
            return res.status(404).json({ error: "User not found" });
        if (currentUser._id.toString() === targetUser._id.toString()) {
            return res.status(400).json({ error: "You cannot follow yourself" });
        }
        const currentFollowing = currentUser.following || [];
        const isFollowing = currentFollowing.includes(targetUser._id.toString());
        if (isFollowing) {
            // Unfollow
            await User_1.User.findByIdAndUpdate(currentUser._id, { $pull: { following: targetUser._id } });
            await User_1.User.findByIdAndUpdate(targetUser._id, { $pull: { followers: currentUser._id } });
        }
        else {
            // Follow
            await User_1.User.findByIdAndUpdate(currentUser._id, { $addToSet: { following: targetUser._id } });
            await User_1.User.findByIdAndUpdate(targetUser._id, { $addToSet: { followers: currentUser._id } });
        }
        // Get updated counts
        const updatedTargetUser = await User_1.User.findById(targetUser._id);
        const updatedCurrentUser = await User_1.User.findById(currentUser._id);
        // Broadcast update using socket.io if available
        const io = req.app.get("io");
        if (io) {
            io.emit("follower_update", {
                userId: targetUser._id.toString(),
                followersCount: updatedTargetUser?.followers?.length || 0,
                followingCount: updatedTargetUser?.following?.length || 0,
            });
            io.emit("follower_update", {
                userId: currentUser._id.toString(),
                followersCount: updatedCurrentUser?.followers?.length || 0,
                followingCount: updatedCurrentUser?.following?.length || 0,
            });
        }
        res.json({
            success: true,
            isFollowing: !isFollowing,
            targetFollowersCount: updatedTargetUser?.followers?.length || 0,
            userFollowingCount: updatedCurrentUser?.following?.length || 0
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// POST /api/users/history
// Save an item to history
// Body: { firebaseUid, itemId, itemType, category, engagement }
// ─────────────────────────────────────────────
router.post("/history", async (req, res) => {
    try {
        const { firebaseUid, itemId, itemType, category, engagement } = req.body;
        if (!firebaseUid || !itemId || !itemType)
            return res.status(400).json({ error: "Missing required fields" });
        const user = await User_1.User.findOne({ firebaseUid });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        // Incognito mode check
        if (user.settings?.privacy?.incognitoMode) {
            return res.json({ success: true, historyItem: null, message: "Incognito mode active, history not recorded" });
        }
        // Upsert or log a new view history item
        const historyItem = await History_1.History.findOneAndUpdate({ user: user._id, itemId, itemType }, {
            $set: {
                category: category || "General",
                engagement: engagement || "viewed",
                timestamp: new Date()
            }
        }, { upsert: true, new: true });
        res.json({ success: true, historyItem });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// GET /api/users/history
// Fetch history items
// ─────────────────────────────────────────────
router.get("/history", async (req, res) => {
    try {
        const firebaseUid = req.query.firebaseUid;
        if (!firebaseUid)
            return res.status(400).json({ error: "firebaseUid is required" });
        const user = await User_1.User.findOne({ firebaseUid });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const historyItems = await History_1.History.find({ user: user._id })
            .sort({ timestamp: -1 })
            .limit(50)
            .lean();
        // Populate actual details for posts and reels
        const enrichedHistory = await Promise.all(historyItems.map(async (item) => {
            let details = null;
            if (item.itemType === "post") {
                details = await NewsArticle_1.NewsArticle.findById(item.itemId).select("title image category createdAt").lean();
            }
            else if (item.itemType === "reel") {
                details = await Reel_1.Reel.findById(item.itemId).select("title thumbnailUrl views").lean();
            }
            return {
                ...item,
                details
            };
        }));
        res.json({ success: true, data: enrichedHistory });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// DELETE /api/users/history
// Clear history items for a user
// ─────────────────────────────────────────────
router.delete("/history", async (req, res) => {
    try {
        const firebaseUid = (req.query.firebaseUid || req.body.firebaseUid);
        if (!firebaseUid)
            return res.status(400).json({ error: "firebaseUid is required" });
        const user = await User_1.User.findOne({ firebaseUid });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        await History_1.History.deleteMany({ user: user._id });
        res.json({ success: true, message: "Reading history cleared" });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// GET /api/users/export-data
// Export all data for a user
// ─────────────────────────────────────────────
router.get("/export-data", async (req, res) => {
    try {
        const firebaseUid = req.query.firebaseUid;
        if (!firebaseUid)
            return res.status(400).json({ error: "firebaseUid is required" });
        const user = await User_1.User.findOne({ firebaseUid }).lean();
        if (!user)
            return res.status(404).json({ error: "User not found" });
        // Fetch related records
        const history = await History_1.History.find({ user: user._id }).sort({ timestamp: -1 }).lean();
        const comments = await Comment_1.Comment.find({ authorId: user._id }).sort({ createdAt: -1 }).lean();
        // Clean sensitive fields from user object
        const cleanUser = { ...user };
        delete cleanUser.password;
        delete cleanUser.twoFactorSecret;
        const exportedData = {
            exportedAt: new Date(),
            profile: cleanUser,
            historyCount: history.length,
            history,
            commentsCount: comments.length,
            comments
        };
        res.json({ success: true, data: exportedData });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// GET /api/users
// List all users (for share-to-friends feature and social feed search)
// ─────────────────────────────────────────────
router.get("/", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const search = req.query.search || "";
        const viewerUid = req.query.viewerUid;
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { username: { $regex: search, $options: "i" } },
            ];
        }
        const { Follow } = await Promise.resolve().then(() => __importStar(require("../models/Follow")));
        const users = await User_1.User.find(query)
            .select("_id name username avatar isVerified firebaseUid")
            .limit(limit)
            .lean();
        let viewerUser = null;
        if (viewerUid) {
            viewerUser = await User_1.User.findOne({ firebaseUid: viewerUid }).lean();
        }
        // Enrich with actual follower/following data
        const enrichedUsers = await Promise.all(users.map(async (u) => {
            // Fetch real follower/following counts
            const followersCount = await Follow.countDocuments({ followingId: u._id });
            const followingCount = await Follow.countDocuments({ followerId: u._id });
            let isFollowing = false;
            if (viewerUser) {
                const followDoc = await Follow.findOne({ followerId: viewerUser._id, followingId: u._id });
                isFollowing = !!followDoc;
            }
            return {
                ...u,
                followers: followersCount,
                following: followingCount,
                isFollowing
            };
        }));
        res.json({ success: true, users: enrichedUsers });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// PUT /api/users/:id/verify
// Admin toggles user verified blue badge
// Body: { adminFirebaseUid }
// ─────────────────────────────────────────────
router.put("/:id/verify", async (req, res) => {
    try {
        const { adminFirebaseUid, action } = req.body;
        const adminUser = await User_1.User.findOne({ firebaseUid: adminFirebaseUid });
        if (!adminUser || adminUser.role !== "admin") {
            return res.status(403).json({ error: "Only administrators can perform this action" });
        }
        const user = await User_1.User.findById(req.params.id);
        if (!user)
            return res.status(404).json({ error: "User not found" });
        if (action === "approve") {
            user.isVerified = true;
            user.verificationStatus = "verified";
        }
        else if (action === "reject") {
            user.isVerified = false;
            user.verificationStatus = "rejected";
        }
        else if (action === "revoke") {
            user.isVerified = false;
            user.verificationStatus = "unverified";
        }
        else {
            // Toggle logic for the standard users table toggle switch
            user.isVerified = !user.isVerified;
            user.verificationStatus = user.isVerified ? "verified" : "unverified";
        }
        await user.save();
        res.json({ success: true, isVerified: user.isVerified, verificationStatus: user.verificationStatus });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// PUT /api/users/:id/toggle-ban
// Admin bans/unbans a user
// Body: { adminFirebaseUid }
// ─────────────────────────────────────────────
router.put("/:id/toggle-ban", async (req, res) => {
    try {
        const { adminFirebaseUid } = req.body;
        const adminUser = await User_1.User.findOne({ firebaseUid: adminFirebaseUid });
        if (!adminUser || adminUser.role !== "admin") {
            return res.status(403).json({ error: "Only administrators can perform this action" });
        }
        const user = await User_1.User.findById(req.params.id);
        if (!user)
            return res.status(404).json({ error: "User not found" });
        user.isDisabled = !user.isDisabled;
        await user.save();
        res.json({ success: true, isDisabled: user.isDisabled });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// PUT /api/users/:id/toggle-admin
// Admin promotes/demotes a user to/from admin
// Body: { adminFirebaseUid }
// ─────────────────────────────────────────────
router.put("/:id/toggle-admin", async (req, res) => {
    try {
        const { adminFirebaseUid } = req.body;
        const adminUser = await User_1.User.findOne({ firebaseUid: adminFirebaseUid });
        if (!adminUser || adminUser.role !== "admin") {
            return res.status(403).json({ error: "Only administrators can perform this action" });
        }
        const user = await User_1.User.findById(req.params.id);
        if (!user)
            return res.status(404).json({ error: "User not found" });
        user.role = user.role === "admin" ? "viewer" : "admin";
        await user.save();
        res.json({ success: true, role: user.role });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map