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
const cloudinary_1 = require("cloudinary");
const Post_1 = require("../models/Post");
const User_1 = require("../models/User");
const Comment_1 = require("../models/Comment");
const Notification_1 = require("../models/Notification");
const notificationService_1 = require("../services/notificationService");
const router = (0, express_1.Router)();
// Multer setup for multiple files
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max per file
});
// ─────────────────────────────────────────────
// POST /api/posts/create
// Create a new post with multiple images/videos
// ─────────────────────────────────────────────
router.post("/create", upload.array("media", 10), async (req, res) => {
    try {
        const { firebaseUid, caption, hashtags, location } = req.body;
        if (!firebaseUid)
            return res.status(400).json({ error: "firebaseUid required" });
        const user = await User_1.User.findOne({ firebaseUid });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: "At least one media file is required" });
        }
        const uploadedMedia = [];
        // Upload files sequentially or in parallel
        for (const file of files) {
            const resourceType = file.mimetype.startsWith("video/") ? "video" : "image";
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary_1.v2.uploader.upload_stream({
                    resource_type: resourceType,
                    folder: "factflow/posts",
                }, (error, result) => {
                    if (error)
                        reject(error);
                    else
                        resolve(result);
                });
                stream.end(file.buffer);
            });
            uploadedMedia.push({
                url: uploadResult.secure_url,
                type: resourceType,
            });
        }
        let parsedHashtags = [];
        try {
            parsedHashtags = hashtags ? JSON.parse(hashtags) : [];
        }
        catch {
            parsedHashtags = typeof hashtags === "string" ? hashtags.split(",").map((t) => t.trim()) : [];
        }
        const newPost = new Post_1.Post({
            author: user._id,
            media: uploadedMedia,
            caption: caption || "",
            hashtags: parsedHashtags,
            location: location || "",
            likes: [],
            commentsCount: 0,
            savesCount: 0,
        });
        await newPost.save();
        // Populate author before broadcasting
        await newPost.populate("author", "name username avatar isVerified");
        // Broadcast new post via Socket.io
        const io = req.app.get("io");
        if (io) {
            io.emit("new_post", newPost);
        }
        res.json({ success: true, post: newPost });
    }
    catch (err) {
        console.error("Post creation error:", err);
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// GET /api/posts/feed
// Fetch posts for the social feed
// ─────────────────────────────────────────────
router.get("/feed", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const firebaseUid = req.query.firebaseUid;
        const search = req.query.search;
        const skip = (page - 1) * limit;
        const query = {};
        if (search) {
            query.$or = [
                { caption: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
            ];
        }
        if (firebaseUid) {
            const user = await User_1.User.findOne({ firebaseUid }).lean();
            if (user) {
                // Feed Logic: Only followed users + self
                const { Follow } = await Promise.resolve().then(() => __importStar(require("../models/Follow")));
                const follows = await Follow.find({ followerId: user._id }).select("followingId").lean();
                const followingIds = follows.map(f => f.followingId);
                // Include self
                followingIds.push(user._id);
                query.author = { $in: followingIds };
                if (user.settings?.content) {
                    const { mutedKeywords } = user.settings.content;
                    if (mutedKeywords && mutedKeywords.length > 0) {
                        query.$and = query.$and || [];
                        const regexStr = mutedKeywords.map((kw) => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
                        const regex = new RegExp(regexStr, "i");
                        query.$and.push({ caption: { $not: regex } });
                    }
                }
            }
        }
        else {
            // If no user is logged in, perhaps show no posts or just public posts. Let's return public.
            // Alternatively, the prompt implies this is a logged-in experience. 
        }
        let posts = await Post_1.Post.find(query)
            .sort({ createdAt: -1 })
            .populate("author", "name username avatar isVerified")
            .lean();
        // Post-filter hidden publishers since author is a populated reference
        if (firebaseUid) {
            const user = await User_1.User.findOne({ firebaseUid }).lean();
            if (user && user.settings?.content) {
                const { hiddenPublishers } = user.settings.content;
                if (hiddenPublishers && hiddenPublishers.length > 0) {
                    posts = posts.filter(post => {
                        const author = post.author;
                        if (!author)
                            return true;
                        return !hiddenPublishers.some((p) => author.name?.toLowerCase().includes(p.toLowerCase()) ||
                            author.username?.toLowerCase().includes(p.toLowerCase()));
                    });
                }
            }
        }
        // Apply pagination after filtering
        const paginatedPosts = posts.slice(skip, skip + limit);
        res.json({ success: true, posts: paginatedPosts });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// POST /api/posts/:id/like
// Like or unlike a post
// ─────────────────────────────────────────────
router.post("/:id/like", async (req, res) => {
    try {
        const { firebaseUid } = req.body;
        if (!firebaseUid)
            return res.status(400).json({ error: "firebaseUid required" });
        const user = await User_1.User.findOne({ firebaseUid });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const post = await Post_1.Post.findById(req.params.id);
        if (!post)
            return res.status(404).json({ error: "Post not found" });
        const hasLiked = post.likes.includes(user._id);
        if (hasLiked) {
            post.likes = post.likes.filter((id) => id.toString() !== user._id.toString());
        }
        else {
            post.likes.push(user._id);
            // Notify author of the like
            if (post.author.toString() !== user._id.toString()) {
                await (0, notificationService_1.createNotification)({
                    recipientId: post.author.toString(),
                    senderId: user._id.toString(),
                    type: "like",
                    title: "New Like",
                    message: `${user.name || user.username} liked your post.`,
                    postId: post._id.toString(),
                    link: `/social`,
                });
            }
        }
        await post.save();
        // Realtime update
        const io = req.app.get("io");
        if (io) {
            io.emit("post_like_update", {
                postId: post._id.toString(),
                likesCount: post.likes.length,
                userId: user._id.toString(),
                hasLiked: !hasLiked
            });
        }
        res.json({ success: true, hasLiked: !hasLiked, likesCount: post.likes.length });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// POST /api/posts/:id/save
// Save a post to bookmarks
// ─────────────────────────────────────────────
router.post("/:id/save", async (req, res) => {
    try {
        const { firebaseUid } = req.body;
        if (!firebaseUid)
            return res.status(400).json({ error: "firebaseUid required" });
        const user = await User_1.User.findOne({ firebaseUid });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const post = await Post_1.Post.findById(req.params.id);
        if (!post)
            return res.status(404).json({ error: "Post not found" });
        const exists = user.savedItems.some((item) => item.itemId === post._id.toString() && item.itemType === "social_post");
        if (exists) {
            user.savedItems = user.savedItems.filter((item) => !(item.itemId === post._id.toString() && item.itemType === "social_post"));
            post.savesCount = Math.max(0, post.savesCount - 1);
        }
        else {
            user.savedItems.push({ itemId: post._id.toString(), itemType: "social_post", savedAt: new Date() });
            post.savesCount += 1;
        }
        await Promise.all([user.save(), post.save()]);
        res.json({ success: true, hasSaved: !exists, savesCount: post.savesCount });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// DELETE /api/posts/:id
// Delete a post
// ─────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
    try {
        const { firebaseUid } = req.query;
        if (!firebaseUid)
            return res.status(400).json({ error: "firebaseUid required" });
        const user = await User_1.User.findOne({ firebaseUid });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const post = await Post_1.Post.findById(req.params.id);
        if (!post)
            return res.status(404).json({ error: "Post not found" });
        if (post.author.toString() !== user._id.toString() && user.role !== "admin") {
            return res.status(403).json({ error: "Unauthorized to delete this post" });
        }
        // Attempt to delete media from Cloudinary
        for (const media of post.media) {
            try {
                const publicIdMatch = media.url.match(/factflow\/posts\/([^.]+)/);
                if (publicIdMatch) {
                    const publicId = `factflow/posts/${publicIdMatch[1]}`;
                    await cloudinary_1.v2.uploader.destroy(publicId, { resource_type: media.type });
                }
            }
            catch (e) {
                console.warn("Could not delete from Cloudinary:", e);
            }
        }
        await Post_1.Post.findByIdAndDelete(post._id);
        // Broadcast deletion
        const io = req.app.get("io");
        if (io) {
            io.emit("post_deleted", { postId: post._id.toString() });
        }
        res.json({ success: true, message: "Post deleted successfully" });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// POST /api/posts/:id/comment
// Add a comment or reply to a post
// ─────────────────────────────────────────────
router.post("/:id/comment", async (req, res) => {
    try {
        const { firebaseUid, text, parentId } = req.body;
        if (!firebaseUid || !text)
            return res.status(400).json({ error: "firebaseUid and text required" });
        const user = await User_1.User.findOne({ firebaseUid });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const post = await Post_1.Post.findById(req.params.id);
        if (!post)
            return res.status(404).json({ error: "Post not found" });
        if (post.commentsDisabled)
            return res.status(403).json({ error: "Comments are disabled for this post" });
        const newComment = new Comment_1.Comment({
            postId: post._id,
            parentId: parentId || null,
            text: text,
            authorName: user.name || user.username || "Anonymous",
            authorId: user._id,
        });
        await newComment.save();
        post.commentsCount += 1;
        await post.save();
        await newComment.populate("authorId", "name username avatar isVerified");
        // Notify post author if someone else commented
        if (post.author.toString() !== user._id.toString() && !parentId) {
            await (0, notificationService_1.createNotification)({
                recipientId: post.author.toString(),
                senderId: user._id.toString(),
                type: "comment",
                title: "New Comment",
                message: `${user.name || user.username} commented: "${text.substring(0, 50)}..."`,
                postId: post._id.toString(),
                link: `/social`,
            });
        }
        // Notify comment author if this is a reply
        if (parentId) {
            const parentComment = await Comment_1.Comment.findById(parentId);
            if (parentComment && parentComment.authorId && parentComment.authorId.toString() !== user._id.toString()) {
                await (0, notificationService_1.createNotification)({
                    recipientId: parentComment.authorId.toString(),
                    senderId: user._id.toString(),
                    type: "reply",
                    title: "New Reply",
                    message: `${user.name || user.username} replied: "${text.substring(0, 50)}..."`,
                    postId: post._id.toString(),
                    commentId: parentComment._id.toString(),
                    link: `/social`,
                });
            }
        }
        const io = req.app.get("io");
        if (io) {
            io.emit("post_comment_added", {
                postId: post._id.toString(),
                comment: newComment,
                commentsCount: post.commentsCount
            });
        }
        res.json({ success: true, comment: newComment });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// GET /api/posts/:id/comments
// Get comments for a post
// ─────────────────────────────────────────────
router.get("/:id/comments", async (req, res) => {
    try {
        // Fetch all comments and let the frontend build the tree
        const comments = await Comment_1.Comment.find({ postId: req.params.id, isDeleted: false })
            .sort({ createdAt: -1 })
            .populate("authorId", "name username avatar isVerified")
            .lean();
        res.json({ success: true, comments });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// PUT /api/posts/:id/comment/:commentId/action
// Like, delete, or report a comment
// ─────────────────────────────────────────────
router.put("/:id/comment/:commentId/action", async (req, res) => {
    try {
        const { firebaseUid, actionType } = req.body;
        if (!firebaseUid || !actionType)
            return res.status(400).json({ error: "firebaseUid and actionType required" });
        const user = await User_1.User.findOne({ firebaseUid });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const comment = await Comment_1.Comment.findById(req.params.commentId);
        if (!comment)
            return res.status(404).json({ error: "Comment not found" });
        const post = await Post_1.Post.findById(req.params.id);
        if (actionType === "like") {
            const hasLiked = comment.reactions.like.includes(user._id);
            if (hasLiked) {
                comment.reactions.like = comment.reactions.like.filter((id) => id.toString() !== user._id.toString());
            }
            else {
                comment.reactions.like.push(user._id);
            }
        }
        else if (actionType === "delete") {
            // Allow author of comment or author of post to delete
            const isPostAuthor = post && post.author.toString() === user._id.toString();
            const isCommentAuthor = comment.authorId && comment.authorId.toString() === user._id.toString();
            if (!isPostAuthor && !isCommentAuthor && user.role !== "admin") {
                return res.status(403).json({ error: "Unauthorized to delete this comment" });
            }
            comment.isDeleted = true;
            if (post) {
                post.commentsCount = Math.max(0, post.commentsCount - 1);
                await post.save();
            }
        }
        else if (actionType === "report") {
            // Just mock report for now
            return res.json({ success: true, message: "Comment reported." });
        }
        else {
            return res.status(400).json({ error: "Invalid actionType" });
        }
        await comment.save();
        const io = req.app.get("io");
        if (io) {
            io.emit("post_comment_updated", {
                postId: req.params.id,
                comment,
            });
        }
        res.json({ success: true, comment });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// PUT /api/posts/:id
// Edit a post's caption and hashtags
// ─────────────────────────────────────────────
router.put("/:id", async (req, res) => {
    try {
        const { firebaseUid, caption, hashtags } = req.body;
        if (!firebaseUid)
            return res.status(400).json({ error: "firebaseUid required" });
        const user = await User_1.User.findOne({ firebaseUid });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const post = await Post_1.Post.findById(req.params.id);
        if (!post)
            return res.status(404).json({ error: "Post not found" });
        if (post.author.toString() !== user._id.toString() && user.role !== "admin") {
            return res.status(403).json({ error: "Unauthorized to edit this post" });
        }
        if (caption !== undefined)
            post.caption = caption;
        if (hashtags !== undefined) {
            let parsedHashtags = [];
            try {
                parsedHashtags = typeof hashtags === "string" ? JSON.parse(hashtags) : hashtags;
            }
            catch {
                parsedHashtags = typeof hashtags === "string" ? hashtags.split(",").map((t) => t.trim()) : [];
            }
            post.hashtags = parsedHashtags;
        }
        await post.save();
        await post.populate("author", "name username avatar isVerified");
        // Broadcast update
        const io = req.app.get("io");
        if (io) {
            io.emit("post_updated", post);
        }
        res.json({ success: true, post });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// PUT /api/posts/:id/options
// Handle 3-dot menu options
// ─────────────────────────────────────────────
router.put("/:id/options", async (req, res) => {
    try {
        const { firebaseUid, actionType } = req.body;
        if (!firebaseUid || !actionType)
            return res.status(400).json({ error: "firebaseUid and actionType required" });
        const user = await User_1.User.findOne({ firebaseUid });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const post = await Post_1.Post.findById(req.params.id);
        if (!post)
            return res.status(404).json({ error: "Post not found" });
        const isAuthor = post.author.toString() === user._id.toString() || user.role === "admin";
        if (actionType === "hide_likes" && isAuthor) {
            post.hideLikes = !post.hideLikes;
        }
        else if (actionType === "disable_comments" && isAuthor) {
            post.commentsDisabled = !post.commentsDisabled;
        }
        else if (actionType === "pin" && isAuthor) {
            post.isPinned = !post.isPinned;
        }
        else if (actionType === "report") {
            // Logic for reporting (simplified: maybe just log it or flag the post)
            // We could add an array of reporters to the post or just return success
            return res.json({ success: true, message: "Post reported successfully." });
        }
        else if (actionType === "hide") {
            // In a real app we'd add it to user's hiddenPosts array
            return res.json({ success: true, message: "Post hidden from your feed." });
        }
        else {
            return res.status(400).json({ error: "Invalid action or unauthorized" });
        }
        await post.save();
        const io = req.app.get("io");
        if (io) {
            io.emit("post_updated", post);
        }
        res.json({ success: true, post });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// POST /api/posts/:id/share
// Share a post with friends
// ─────────────────────────────────────────────
router.post("/:id/share", async (req, res) => {
    try {
        const { firebaseUid, friendIds } = req.body;
        if (!firebaseUid || !friendIds || !Array.isArray(friendIds)) {
            return res.status(400).json({ error: "firebaseUid and an array of friendIds are required" });
        }
        const sender = await User_1.User.findOne({ firebaseUid });
        if (!sender)
            return res.status(404).json({ error: "User not found" });
        const post = await Post_1.Post.findById(req.params.id);
        if (!post)
            return res.status(404).json({ error: "Post not found" });
        const notifications = friendIds.map((friendId) => ({
            recipientId: friendId,
            senderId: sender._id,
            type: "share_post",
            postId: post._id,
            isRead: false,
        }));
        await Notification_1.Notification.insertMany(notifications);
        res.json({ success: true, message: "Post shared successfully" });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=posts.js.map