"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const router = (0, express_1.Router)();
// Use memory storage for multer
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
router.post("/", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file provided" });
        }
        // Determine resource type based on mimetype
        const resourceType = req.file.mimetype.startsWith("video/") ? "video" : "image";
        // Upload to Cloudinary via stream
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({ resource_type: resourceType, folder: "factflow_uploads" }, (error, result) => {
            if (error) {
                console.error("Cloudinary upload error:", error);
                return res.status(500).json({ error: "Failed to upload to Cloudinary" });
            }
            res.json({
                success: true,
                url: result?.secure_url,
                format: result?.format,
                resourceType: result?.resource_type,
            });
        });
        uploadStream.end(req.file.buffer);
    }
    catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ error: "Internal server error during upload" });
    }
});
exports.default = router;
//# sourceMappingURL=upload.js.map