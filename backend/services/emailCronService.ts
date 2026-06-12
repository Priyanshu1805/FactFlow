import cron from "node-cron"
import { NewsArticle } from "../models/NewsArticle"
import { User } from "../models/User"
import { NotificationPrefs } from "../models/NotificationPrefs"
import { sendDigestEmail } from "./emailService"

export function startEmailCronJobs(): void {
  // ── DAILY DIGEST (Runs based on user selected time)
  const dailySchedules = [
    { time: "7AM", cronStr: "0 7 * * *" },
    { time: "12PM", cronStr: "0 12 * * *" },
    { time: "6PM", cronStr: "0 18 * * *" },
    { time: "9PM", cronStr: "0 21 * * *" }
  ]

  dailySchedules.forEach(({ time, cronStr }) => {
    cron.schedule(cronStr, async () => {
      console.log(`📧 Running Daily Email Digest Cron for ${time}...`)
      try {
        // Find NotificationPrefs with dailyDigest enabled AND matching time
        const prefsList = await NotificationPrefs.find({
          "dailyDigest.enabled": true,
          "dailyDigest.time": time
        }).populate<{ userId: any }>("userId").lean()

        if (prefsList.length === 0) return

        // Filter users who have an email
        const users = prefsList.map(p => p.userId).filter(u => u && u.email)
        
        if (users.length === 0) return

        // Fetch top 5 articles from the last 24 hours
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
        const topArticles = await NewsArticle.find({ publishedAt: { $gte: yesterday } })
          .sort({ views: -1, likesCount: -1 })
          .limit(5)
          .lean()

        if (topArticles.length === 0) return

        let sentCount = 0
        for (const user of users) {
          const success = await sendDigestEmail(user.email, "daily", topArticles as any)
          if (success) sentCount++
        }
        console.log(`✅ Sent Daily Digest (${time}) to ${sentCount} users.`)
      } catch (err: any) {
        console.error(`❌ Daily Digest (${time}) error:`, err.message)
      }
    })
  })

  // ── WEEKLY SUMMARY (Runs every Sunday at 09:00)
  cron.schedule("0 9 * * 0", async () => {
    console.log("📧 Running Weekly Email Summary Cron...")
    try {
      // Find users with newsletter/weekly digest enabled
      const prefsList = await NotificationPrefs.find({
        weeklySummary: true
      }).populate<{ userId: any }>("userId").lean()

      if (prefsList.length === 0) return

      // Filter users who have an email
      const users = prefsList.map(p => p.userId).filter(u => u && u.email)
      
      if (users.length === 0) return

      // Fetch top 10 articles from the last 7 days
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const topArticles = await NewsArticle.find({ publishedAt: { $gte: lastWeek } })
        .sort({ views: -1, likesCount: -1 })
        .limit(10)
        .lean()

      if (topArticles.length === 0) return

      let sentCount = 0
      for (const user of users) {
        const success = await sendDigestEmail(user.email, "weekly", topArticles as any)
        if (success) sentCount++
      }
      console.log(`✅ Sent Weekly Summary to ${sentCount} users.`)
    } catch (err: any) {
      console.error("❌ Weekly Summary error:", err.message)
    }
  })

  console.log("✅ Email Cron Jobs Started (Daily: 07:00 | Weekly: Sun 09:00)")
}
