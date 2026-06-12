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
// POST /api/messages
// Send a message (Text / Media)
// Body: { firebaseUid, chatId, content }
// File: media (optional)
// ─────────────────────────────────────────────
router.post("/", upload.single("media"), async (req: Request, res: Response) => {
  try {
    const { firebaseUid, chatId, content } = req.body
    if (!firebaseUid || !chatId) {
      return res.status(400).json({ error: "firebaseUid and chatId are required" })
    }

    const sender = await User.findOne({ firebaseUid })
    if (!sender) return res.status(404).json({ error: "Sender not found" })

    let mediaUrl = undefined
    let mediaType: "image" | "video" | undefined = undefined

    if (req.file) {
      const resourceType = req.file.mimetype.startsWith("video/") ? "video" : "image"
      
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: resourceType,
            folder: "factflow/chat_media",
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
        stream.end(req.file!.buffer)
      })

      mediaUrl = uploadResult.secure_url
      mediaType = resourceType
    }

    const newMessage = await Message.create({
      sender: sender._id,
      content: content || "",
      chat: chatId,
      mediaUrl,
      mediaType,
      readBy: [sender._id]
    })

    // Populate sender info
    await newMessage.populate("sender", "name username avatar isVerified firebaseUid")

    // Update latest message in Chat
    await Chat.findByIdAndUpdate(chatId, { latestMessage: newMessage._id })

    // Broadcast new message via Socket.IO
    const io = req.app.get("io")
    if (io) {
      io.to(`chat_${chatId}`).emit("new_message", newMessage)
      
      // Also notify chat listing update for real-time list updates
      io.emit("chat_list_update", { chatId, latestMessage: newMessage })
    }

    res.json({ success: true, message: newMessage })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────
// GET /api/messages/:chatId
// Fetch all messages for a chat
// ─────────────────────────────────────────────
router.get("/:chatId", async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name username avatar isVerified firebaseUid")
      .sort({ createdAt: 1 }) // Chronological order
      .lean()

    res.json({ success: true, messages })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────
// PUT /api/messages/:chatId/read
// Mark all messages in a chat as read
// Body: { firebaseUid }
// ─────────────────────────────────────────────
router.put("/:chatId/read", async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params
    const { firebaseUid } = req.body
    if (!firebaseUid) return res.status(400).json({ error: "firebaseUid is required" })

    const user = await User.findOne({ firebaseUid })
    if (!user) return res.status(404).json({ error: "User not found" })

    // Add user ID to readBy array for all messages in this chat that don't have it yet
    await Message.updateMany(
      { chat: chatId, sender: { $ne: user._id }, readBy: { $ne: user._id } },
      { $addToSet: { readBy: user._id } }
    )

    // Notify that messages were read
    const io = req.app.get("io")
    if (io) {
      io.to(`chat_${chatId}`).emit("messages_read", { chatId, userId: user._id })
    }

    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
