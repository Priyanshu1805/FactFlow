import { Response } from "express"
import { NotificationPrefs } from "../models/NotificationPrefs"
import { AuthRequest } from "../middleware/auth"
import { createBulkNotifications } from "../services/notificationService"
import { Notification } from "../models/Notification"
import { getSocket } from "../services/pushService"
import { sendDigestEmail } from "../services/emailService"
import { NewsArticle } from "../models/NewsArticle"
import { User } from "../models/User"

export async function getNotificationPrefs(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ success: false, error: "Not authenticated" })
      return
    }

    const prefs = await NotificationPrefs.findOne({ userId })

    if (!prefs) {
      // Default preferences
      res.json({
        success: true,
        data: {
          breakingNews: false,
          dailyDigest: { enabled: true, time: "7AM" },
          pushEnabled: false,
          commentReplies: true,
          mentions: true,
          weeklySummary: false,
        },
      })
      return
    }

    res.json({ success: true, data: prefs })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function updateNotificationPrefs(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ success: false, error: "Not authenticated" })
      return
    }

    const prefs = await NotificationPrefs.findOneAndUpdate(
      { userId },
      { $set: req.body },
      { upsert: true, new: true }
    )

    res.json({ success: true, data: prefs })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function savePushSubscription(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ success: false, error: "Not authenticated" })
      return
    }
    
    const { subscription } = req.body
    
    const prefs = await NotificationPrefs.findOneAndUpdate(
      { userId },
      { $set: { pushEnabled: true, pushSubscription: subscription } },
      { upsert: true, new: true }
    )
    
    res.json({ success: true, data: prefs, message: "Push subscription saved" })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function testNotifications(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ success: false, error: "Not authenticated" })
      return
    }

    const prefs = await NotificationPrefs.findOne({ userId }).lean()
    const io = getSocket()
    const generated = []

    if (!prefs) {
      res.json({ success: false, error: "No preferences found" })
      return
    }

    if (prefs.breakingNews) {
      const notif = await Notification.create({
        recipientId: userId,
        type: "breaking_news",
        message: "🚨 Test: Major breaking story just happened!",
        isRead: false
      })
      io?.to(`user_${userId}`).emit("new_notification", notif)
      generated.push("breaking_news")
    }

    if (prefs.liveUpdates) {
      const notif = await Notification.create({
        recipientId: userId,
        type: "new_article",
        message: "📰 Test: A new live update was posted.",
        isRead: false
      })
      io?.to(`user_${userId}`).emit("new_notification", notif)
      generated.push("liveUpdates")
    }

    if (prefs.mentions) {
      const notif = await Notification.create({
        recipientId: userId,
        type: "mention",
        message: "@test_user mentioned you in a comment.",
        isRead: false
      })
      io?.to(`user_${userId}`).emit("new_notification", notif)
      generated.push("mentions")
    }

    if (prefs.commentReplies) {
      const notif = await Notification.create({
        recipientId: userId,
        type: "reply",
        message: "Someone replied to your comment: 'Test reply!'",
        isRead: false
      })
      io?.to(`user_${userId}`).emit("new_notification", notif)
      generated.push("commentReplies")
    }

    res.json({ success: true, message: `Tested notifications: ${generated.join(", ")}` })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function testEmailDigest(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ success: false, error: "Not authenticated" })
      return
    }

    const user = await User.findById(userId).lean()
    if (!user || !user.email) {
      res.status(400).json({ success: false, error: "User email not found" })
      return
    }

    // Fetch top 3 articles for the test email
    const topArticles = await NewsArticle.find({})
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean()

    if (topArticles.length === 0) {
      res.status(404).json({ success: false, error: "No articles found to generate email" })
      return
    }

    const success = await sendDigestEmail(user.email, "daily", topArticles as any)

    if (success) {
      res.json({ success: true, message: `Test email sent to ${user.email}` })
    } else {
      res.status(500).json({ success: false, error: "Failed to send test email" })
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}
