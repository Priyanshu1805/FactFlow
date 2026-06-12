"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Chat_1 = require("../models/Chat");
const User_1 = require("../models/User");
const Message_1 = require("../models/Message");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB max
});
// ─────────────────────────────────────────────
// POST /api/chats/access
// Fetch or create a 1-on-1 chat
// Body: { firebaseUid, userId } (userId is the MongoDB ObjectId of the target user)
// ─────────────────────────────────────────────
router.post("/access", async (req, res) => {
    try {
        const { firebaseUid, userId } = req.body;
        if (!firebaseUid || !userId) {
            return res.status(400).json({ error: "firebaseUid and userId are required" });
        }
        const currentUser = await User_1.User.findOne({ firebaseUid });
        if (!currentUser)
            return res.status(404).json({ error: "User not found" });
        // Find if a 1-on-1 chat already exists
        let isChat = await Chat_1.Chat.findOne({
            isGroupChat: false,
            participants: { $all: [currentUser._id, userId] }
        })
            .populate("participants", "name username avatar isVerified")
            .populate("latestMessage");
        if (isChat) {
            return res.json({ success: true, chat: isChat });
        }
        // Otherwise create a new chat
        const targetUser = await User_1.User.findById(userId);
        const followsBack = targetUser?.following?.some((id) => id.toString() === currentUser._id.toString());
        const status = followsBack ? "accepted" : "requested";
        const chatData = {
            chatName: "sender",
            isGroupChat: false,
            participants: [currentUser._id, userId],
            status,
            requestRecipient: status === "requested" ? userId : undefined
        };
        const createdChat = await Chat_1.Chat.create(chatData);
        const fullChat = await Chat_1.Chat.findById(createdChat._id)
            .populate("participants", "name username avatar isVerified")
            .populate("requestRecipient", "name username avatar");
        res.json({ success: true, chat: fullChat });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// GET /api/chats
// Get all chats for the user
// Query: ?firebaseUid=xxx
// ─────────────────────────────────────────────
router.get("/", async (req, res) => {
    try {
        const { firebaseUid } = req.query;
        if (!firebaseUid)
            return res.status(400).json({ error: "firebaseUid is required" });
        const currentUser = await User_1.User.findOne({ firebaseUid });
        if (!currentUser)
            return res.status(404).json({ error: "User not found" });
        const chats = await Chat_1.Chat.find({
            participants: { $elemMatch: { $eq: currentUser._id } }
        })
            .populate("participants", "name username avatar isVerified")
            .populate("groupAdmin", "name username avatar")
            .populate("requestRecipient", "name username")
            .populate({
            path: "latestMessage",
            populate: {
                path: "sender",
                select: "name username avatar"
            }
        })
            .sort({ updatedAt: -1 });
        res.json({ success: true, chats });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// POST /api/chats/group
// Create a group chat
// Body: { firebaseUid, users (array of userIds), name }
// ─────────────────────────────────────────────
router.post("/group", async (req, res) => {
    try {
        const { firebaseUid, users, name } = req.body;
        if (!firebaseUid || !users || !name) {
            return res.status(400).json({ error: "firebaseUid, users array, and name are required" });
        }
        const currentUser = await User_1.User.findOne({ firebaseUid });
        if (!currentUser)
            return res.status(404).json({ error: "User not found" });
        let parsedUsers = Array.isArray(users) ? users : JSON.parse(users);
        if (parsedUsers.length < 1) {
            return res.status(400).json({ error: "At least 1 other user is required to form a group chat" });
        }
        // Add current user to group participants
        parsedUsers.push(currentUser._id);
        const groupChat = await Chat_1.Chat.create({
            chatName: name,
            isGroupChat: true,
            participants: parsedUsers,
            groupAdmin: currentUser._id
        });
        const fullGroupChat = await Chat_1.Chat.findById(groupChat._id)
            .populate("participants", "name username avatar isVerified")
            .populate("groupAdmin", "name username avatar");
        res.json({ success: true, chat: fullGroupChat });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// PUT /api/chats/:id/category
// Change chat category (primary vs general)
// ─────────────────────────────────────────────
router.put("/:id/category", async (req, res) => {
    try {
        const { category } = req.body;
        if (!["primary", "general"].includes(category)) {
            return res.status(400).json({ error: "Invalid category" });
        }
        const chat = await Chat_1.Chat.findByIdAndUpdate(req.params.id, { category }, { new: true })
            .populate("participants", "name username avatar isVerified");
        res.json({ success: true, chat });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// PUT /api/chats/:id/accept
// Accept message request (set status to accepted)
// ─────────────────────────────────────────────
router.put("/:id/accept", async (req, res) => {
    try {
        const chat = await Chat_1.Chat.findByIdAndUpdate(req.params.id, { status: "accepted" }, { new: true })
            .populate("participants", "name username avatar isVerified");
        res.json({ success: true, chat });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// DELETE /api/chats/:id
// Delete chat completely (including messages)
// ─────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
    try {
        await Chat_1.Chat.findByIdAndDelete(req.params.id);
        await Message_1.Message.deleteMany({ chat: req.params.id });
        res.json({ success: true, message: "Chat deleted successfully" });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─────────────────────────────────────────────
// DELETE /api/chats/:id/clear
// Clear messages in chat (but keep chat item)
// ─────────────────────────────────────────────
router.delete("/:id/clear", async (req, res) => {
    try {
        await Message_1.Message.deleteMany({ chat: req.params.id });
        await Chat_1.Chat.findByIdAndUpdate(req.params.id, { $unset: { latestMessage: "" } });
        res.json({ success: true, message: "Chat cleared successfully" });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=chats.js.map