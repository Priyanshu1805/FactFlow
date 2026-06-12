import { User } from "../models/User"
import { NotificationPrefs } from "../models/NotificationPrefs"
import { NewsArticle } from "../models/NewsArticle"
import { sendDigestEmail } from "./emailService"
import { createBulkNotifications } from "./notificationService"

async function fetchTopArticles(limit: number = 8): Promise<any[]> {
  const articles = await NewsArticle.find()
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean()

  return articles
}

export async function sendMorningDigests(): Promise<void> {
  try {
    const prefs = await NotificationPrefs.find({ dailyDigest: true, emailEnabled: true }).populate("userId")

    for (const pref of prefs) {
      const user = pref.userId as any
      if (!user?.email) continue

      const articles = await fetchTopArticles(8)
      await sendDigestEmail(user.email, "daily", articles)
    }
    console.log(`📧 Morning digests sent to ${prefs.length} users`)
  } catch (err: any) {
    console.error("❌ Digest error:", err.message)
  }
}

export async function sendWeeklySummaries(): Promise<void> {
  try {
    const prefs = await NotificationPrefs.find({ weeklySummary: true, emailEnabled: true }).populate("userId")

    for (const pref of prefs) {
      const user = pref.userId as any
      if (!user?.email) continue

      const articles = await fetchTopArticles(12)
      await sendDigestEmail(user.email, "weekly", articles)
    }
    console.log(`📧 Weekly summaries sent to ${prefs.length} users`)
  } catch (err: any) {
    console.error("❌ Weekly summary error:", err.message)
  }
}
