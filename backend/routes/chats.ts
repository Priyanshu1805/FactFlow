import { Router, Request, Response } from "express"
import { Chat } from "../models/Chat"
import { User } from "../models/User"
import { Message } from "../models/Message"
import multer from "multer"
import { v2 as cloudinary } from "cloudinary"

const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB max
})

// ─────────────────────────────────────────────
// POST /api/chats/access
// Fetch or create a 1-on-1 chat
// Body: { firebaseUid, userId } (userId is the MongoDB ObjectId of the target user)
// ─────────────────────────────────────────────
router.post("/access", async (req: Request, res: Response) => {
  try {
    const { firebaseUid, userId } = req.body
    if (!firebaseUid || !userId) {
      return res.status(400).json({ error: "firebaseUid and userId are required" })
    }

    const currentUser = await User.findOne({ firebaseUid })
    if (!currentUser) return res.status(404).json({ error: "User not found" })

    // Find if a 1-on-1 chat already exists
    let isChat = await Chat.findOne({
      isGroupChat: false,
      participants: { $all: [currentUser._id, userId] }
    })
      .populate("participants", "name username avatar isVerified")
      .populate("latestMessage")

    if (isChat) {
      return res.json({ success: true, chat: isChat })
    }

    // Otherwise create a new chat
    const targetUser = await User.findById(userId)
    const followsBack = targetUser?.following?.some((id: any) => id.toString() === currentUser._id.toString())
    const status = followsBack ? "accepted" : "requested"

    const chatData = {
      chatName: "sender",
      isGroupChat: false,
      participants: [currentUser._id, userId],
      status,
      requestRecipient: status === "requested" ? userId : undefined
    }

    const createdChat = await Chat.create(chatData)
    const fullChat = await Chat.findById(createdChat._id)
      .populate("participants", "name username avatar isVerified")
      .populate("requestRecipient", "name username avatar")

    res.json({ success: true, chat: fullChat })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────
// GET /api/chats
// Get all chats for the user
// Query: ?firebaseUid=xxx
// ─────────────────────────────────────────────
router.get("/", async (req: Request, res: Response) => {
  try {
    const { firebaseUid } = req.query
    if (!firebaseUid) return res.status(400).json({ error: "firebaseUid is required" })

    const currentUser = await User.findOne({ firebaseUid })
    if (!currentUser) return res.status(404).json({ error: "User not found" })

    const chats = await Chat.find({
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
      .sort({ updatedAt: -1 })

    res.json({ success: true, chats })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────
// POST /api/chats/group
// Create a group chat
// Body: { firebaseUid, users (array of userIds), name }
// ─────────────────────────────────────────────
router.post("/group", async (req: Request, res: Response) => {
  try {
    const { firebaseUid, users, name } = req.body
    if (!firebaseUid || !users || !name) {
      return res.status(400).json({ error: "firebaseUid, users array, and name are required" })
    }

    const currentUser = await User.findOne({ firebaseUid })
    if (!currentUser) return res.status(404).json({ error: "User not found" })

    let parsedUsers = Array.isArray(users) ? users : JSON.parse(users)
    if (parsedUsers.length < 1) {
      return res.status(400).json({ error: "At least 1 other user is required to form a group chat" })
    }

    // Add current user to group participants
    parsedUsers.push(currentUser._id)

    const groupChat = await Chat.create({
      chatName: name,
      isGroupChat: true,
      participants: parsedUsers,
      groupAdmin: currentUser._id
    })

    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate("participants", "name username avatar isVerified")
      .populate("groupAdmin", "name username avatar")

    res.json({ success: true, chat: fullGroupChat })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────
// PUT /api/chats/:id/category
// Change chat category (primary vs general)
// ─────────────────────────────────────────────
router.put("/:id/category", async (req: Request, res: Response) => {
  try {
    const { category } = req.body
    if (!["primary", "general"].includes(category)) {
      return res.status(400).json({ error: "Invalid category" })
    }
    const chat = await Chat.findByIdAndUpdate(req.params.id, { category }, { new: true })
      .populate("participants", "name username avatar isVerified")
    res.json({ success: true, chat })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────
// PUT /api/chats/:id/accept
// Accept message request (set status to accepted)
// ─────────────────────────────────────────────
router.put("/:id/accept", async (req: Request, res: Response) => {
  try {
    const chat = await Chat.findByIdAndUpdate(req.params.id, { status: "accepted" }, { new: true })
      .populate("participants", "name username avatar isVerified")
    res.json({ success: true, chat })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────
// DELETE /api/chats/:id
// Delete chat completely (including messages)
// ─────────────────────────────────────────────
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await Chat.findByIdAndDelete(req.params.id)
    await Message.deleteMany({ chat: req.params.id })
    res.json({ success: true, message: "Chat deleted successfully" })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────
// DELETE /api/chats/:id/clear
// Clear messages in chat (but keep chat item)
// ─────────────────────────────────────────────
router.delete("/:id/clear", async (req: Request, res: Response) => {
  try {
    await Message.deleteMany({ chat: req.params.id })
    await Chat.findByIdAndUpdate(req.params.id, { $unset: { latestMessage: "" } })
    res.json({ success: true, message: "Chat cleared successfully" })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
