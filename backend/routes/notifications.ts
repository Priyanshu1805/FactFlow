import { Router, Request, Response } from "express"
import { Notification } from "../models/Notification"
import { User } from "../models/User"

const router = Router()

// ─────────────────────────────────────────────
// GET /api/notifications
// Fetch all notifications for a user
// Query: ?firebaseUid=xxx&limit=30&page=1
// ─────────────────────────────────────────────
router.get("/", async (req: Request, res: Response) => {
  try {
    const { firebaseUid, limit = "30", page = "1" } = req.query
    if (!firebaseUid) return res.status(400).json({ error: "firebaseUid required" })

    const user = await User.findOne({ firebaseUid })
    if (!user) return res.status(404).json({ error: "User not found" })

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ recipientId: user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit as string))
        .populate("senderId", "name username avatar isVerified")
        .populate("senderIds", "name username avatar isVerified")
        .populate("postId", "caption media")
        .populate("articleId", "title image slug")
        .lean(),
      Notification.countDocuments({ recipientId: user._id, isRead: false }),
    ])

    res.json({ success: true, notifications, unreadCount })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────
// GET /api/notifications/unread-count
// Quick endpoint just for the badge number
// Query: ?firebaseUid=xxx
// ─────────────────────────────────────────────
router.get("/unread-count", async (req: Request, res: Response) => {
  try {
    const { firebaseUid } = req.query
    if (!firebaseUid) return res.status(400).json({ error: "firebaseUid required" })

    const user = await User.findOne({ firebaseUid })
    if (!user) return res.status(404).json({ error: "User not found" })

    const [unreadCount, trendingCount] = await Promise.all([
      Notification.countDocuments({
        recipientId: user._id,
        isRead: false,
      }),
      Notification.countDocuments({
        recipientId: user._id,
        isRead: false,
        type: "trending_story"
      })
    ])

    res.json({ success: true, unreadCount, trendingCount })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────
// PUT /api/notifications/read-all
// Mark all notifications as read
// Body: { firebaseUid }
// ─────────────────────────────────────────────
router.put("/read-all", async (req: Request, res: Response) => {
  try {
    const { firebaseUid } = req.body
    if (!firebaseUid) return res.status(400).json({ error: "firebaseUid required" })

    const user = await User.findOne({ firebaseUid })
    if (!user) return res.status(404).json({ error: "User not found" })

    await Notification.updateMany(
      { recipientId: user._id, isRead: false },
      { $set: { isRead: true } }
    )

    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────
// PUT /api/notifications/:id/read
// Mark single notification as read
// ─────────────────────────────────────────────
router.put("/:id/read", async (req: Request, res: Response) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { $set: { isRead: true } },
      { new: true }
    )
    if (!notification) return res.status(404).json({ error: "Notification not found" })
    res.json({ success: true, notification })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────
// POST /api/notifications/system
// Create a system-wide or user-targeted notification (admin use)
// Body: { recipientFirebaseUid, type, message, link }
// ─────────────────────────────────────────────
router.post("/system", async (req: Request, res: Response) => {
  try {
    const { recipientFirebaseUid, type, message, link } = req.body
    if (!recipientFirebaseUid || !message) {
      return res.status(400).json({ error: "recipientFirebaseUid and message required" })
    }

    const recipient = await User.findOne({ firebaseUid: recipientFirebaseUid })
    if (!recipient) return res.status(404).json({ error: "Recipient not found" })

    const notification = await Notification.create({
      recipientId: recipient._id,
      type: type || "system",
      message,
      link: link || null,
    })

    res.json({ success: true, notification })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────
// POST /api/notifications/trigger-daily-digest
// CRON placeholder: Generate daily digests for opted-in users
// ─────────────────────────────────────────────
router.post("/trigger-daily-digest", async (req: Request, res: Response) => {
  try {
    // 1. Find all users who have dailyDigest enabled
    const users = await User.find({ "settings.notifications.dailyDigest": true })
    
    // 2. Mock generating digest notifications for these users
    const notifications = users.map(user => ({
      recipientId: user._id,
      type: "daily_digest",
      message: "Your Daily Digest is ready: Top 5 stories of the day",
      isRead: false
    }))
    
    if (notifications.length > 0) {
      await Notification.insertMany(notifications)
    }

    res.json({ success: true, message: `Sent digests to ${users.length} users.` })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────
// DELETE /api/notifications/:id
// Delete a single notification
// ─────────────────────────────────────────────
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await Notification.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
