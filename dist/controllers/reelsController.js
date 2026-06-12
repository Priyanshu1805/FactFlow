"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllReels = getAllReels;
exports.getReelById = getReelById;
exports.createReel = createReel;
exports.likeReel = likeReel;
exports.deleteReel = deleteReel;
exports.uploadUserReel = uploadUserReel;
const Reel_1 = require("../models/Reel");
const videoUpload_1 = require("../middleware/videoUpload");
// GET /api/reels
async function getAllReels(req, res) {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, parseInt(req.query.limit) || 10);
        const { tag, source, author } = req.query;
        const search = req.query.search;
        const query = {};
        if (tag)
            query.tags = { $in: [tag] };
        if (source)
            query.source = source;
        if (author)
            query.author = author;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }
        const total = await Reel_1.Reel.countDocuments(query);
        const reels = await Reel_1.Reel.find(query)
            .sort({ views: -1, publishedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();
        res.json({
            success: true,
            data: reels,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch reels" });
    }
}
// GET /api/reels/:id
async function getReelById(req, res) {
    try {
        const reel = await Reel_1.Reel.findById(req.params.id).lean();
        if (!reel) {
            res.status(404).json({ success: false, error: "Reel not found" });
            return;
        }
        await Reel_1.Reel.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
        res.json({ success: true, data: reel });
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch reel" });
    }
}
// POST /api/reels — Admin/Editor
async function createReel(req, res) {
    try {
        const { title, description, videoUrl, thumbnailUrl, duration, tags, author, source } = req.body;
        if (!title || !videoUrl || !thumbnailUrl || !duration) {
            res.status(400).json({
                success: false,
                error: "Missing required fields: title, videoUrl, thumbnailUrl, duration",
            });
            return;
        }
        const reel = await Reel_1.Reel.create({
            title, description, videoUrl, thumbnailUrl, duration,
            tags: tags || [],
            author: author || "Fact Flow",
            source: source || "manual",
        });
        res.status(201).json({ success: true, data: reel, message: "Reel created successfully" });
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Failed to create reel" });
    }
}
// POST /api/reels/:id/like
async function likeReel(req, res) {
    try {
        const reel = await Reel_1.Reel.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true });
        if (!reel) {
            res.status(404).json({ success: false, error: "Reel not found" });
            return;
        }
        res.json({ success: true, data: { likes: reel.likes } });
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Failed to like reel" });
    }
}
// DELETE /api/reels/:id — Admin only
async function deleteReel(req, res) {
    try {
        const reel = await Reel_1.Reel.findByIdAndDelete(req.params.id);
        if (!reel) {
            res.status(404).json({ success: false, error: "Reel not found" });
            return;
        }
        res.json({ success: true, message: "Reel deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Failed to delete reel" });
    }
}
// POST /api/reels/upload — Authenticated Users
async function uploadUserReel(req, res) {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, error: "No video file provided" });
            return;
        }
        const { title, description } = req.body;
        if (!title) {
            res.status(400).json({ success: false, error: "Title is required" });
            return;
        }
        // Upload to Cloudinary
        const result = await (0, videoUpload_1.uploadBufferToCloudinary)(req.file.buffer, "factflow_reels");
        // Create DB entry
        const reel = await Reel_1.Reel.create({
            title: title.slice(0, 200),
            description: description || "",
            videoUrl: result.secure_url,
            // Cloudinary auto-generates thumbnails for videos using .jpg extension
            thumbnailUrl: result.secure_url.replace(/\.[^/.]+$/, ".jpg"),
            duration: result.duration || 30,
            tags: ["UserUpload"],
            author: req.user?.name || "Fact Flow User", // from auth middleware
            source: "manual",
            cloudinaryId: result.public_id,
        });
        const io = req.app.get("io");
        if (io) {
            io.emit("new_reel", reel);
        }
        res.status(201).json({ success: true, data: reel, message: "Reel uploaded successfully" });
    }
    catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ success: false, error: "Failed to upload reel" });
    }
}
//# sourceMappingURL=reelsController.js.map