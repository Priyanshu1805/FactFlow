import cron from "node-cron"
import { getSocket } from "./pushService"
import { NewsArticle } from "../models/NewsArticle"
import { masterFetcher } from "./masterFetcher"
import { smartProcessor } from "./smartProcessor"
import { createBulkNotifications } from "./notificationService"
import { NotificationPrefs } from "../models/NotificationPrefs"

// ─────────────────────────────────────────────
// PIPELINE EXECUTION
// ─────────────────────────────────────────────
export async function runNewsPipeline() {
  console.log("🔄 [NewsCycle] Starting smart news pipeline cycle...")
  
  try {
    // Get existing titles from last 24h to pass to deduplicator
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const existingDocs = await NewsArticle.find({ publishedAt: { $gte: yesterday } }).select("title -_id").lean()
    const existingTitles = existingDocs.map(d => d.title)

    // Layer 1: Fetch
    const rawItems = await masterFetcher()
    if (rawItems.length === 0) {
      console.log("⚠️ [NewsCycle] No raw items fetched.")
      return
    }

    // Layer 2: Process
    const processedItems = await smartProcessor(rawItems, existingTitles)

    // Layer 3: Save & Distribute
    let savedCount = 0
    const newArticlesByCategory: Record<string, any[]> = {}

    for (const item of processedItems) {
      try {
        const article = await NewsArticle.create({
          title: item.title,
          excerpt: item.description?.slice(0, 500) || item.title,
          content: item.description || item.title,
          category: item.category,
          image: item.imageUrl || `https://image.pollinations.ai/prompt/${encodeURIComponent("News photo about " + item.title.slice(0, 50) + ", highly detailed, realistic, journalistic photography")}?width=1200&height=800&nologo=true`,
          source: item.source,
          publishedAt: new Date(item.publishedAt),
          qualityScore: item.qualityScore,
          isTrending: item.isTrending,
          language: item.language,
          author: "FactFlow Automated Desk",
          tags: [item.category, item.isTrending ? "Trending" : ""].filter(Boolean)
        })

        savedCount++

        // Generate database & push notifications for users in background
        if (item.isTrending) {
          NotificationPrefs.find({ breakingNews: true }).lean().then(prefs => {
            if (prefs.length > 0) {
              const userIds = prefs.map(p => p.userId.toString())
              createBulkNotifications(userIds, {
                type: "breaking_news",
                title: "🚨 Breaking News",
                message: item.title,
                link: `/article/${article._id}`,
                articleId: article._id.toString(),
                image: article.image
              }).catch(err => console.error("Breaking news bulk notification error:", err.message))
            }
          })
        } else {
          NotificationPrefs.find({ liveUpdates: true }).lean().then(prefs => {
            if (prefs.length > 0) {
              const userIds = prefs.map(p => p.userId.toString())
              createBulkNotifications(userIds, {
                type: "new_article",
                title: "📰 New Article",
                message: item.title,
                link: `/article/${article._id}`,
                articleId: article._id.toString(),
                image: article.image
              }).catch(err => console.error("New article bulk notification error:", err.message))
            }
          })
        }

        // Group for socket emit
        const normalizedCat = item.category.toLowerCase()
        if (!newArticlesByCategory[normalizedCat]) newArticlesByCategory[normalizedCat] = []
        newArticlesByCategory[normalizedCat].push(article)

        if (item.isTrending) {
          if (!newArticlesByCategory["trending"]) newArticlesByCategory["trending"] = []
          newArticlesByCategory["trending"].push(article)
        }

      } catch (err: any) {
        // Skip duplicate title or validation errors
      }
    }

    console.log(`✅ [NewsCycle] Saved ${savedCount} new articles to MongoDB.`)

    // Emit Socket.io events
    const io = getSocket()
    if (io && savedCount > 0) {
      // General ticker emit
      io.emit("news:all", { count: savedCount })

      // Section specific emits
      for (const [cat, articles] of Object.entries(newArticlesByCategory)) {
        if (articles.length > 0) {
          io.emit(`news:${cat}`, { count: articles.length, articles: articles.slice(0, 5) })
          console.log(`📡 Emitted news:${cat} with ${articles.length} items`)
        }
      }
    }

    // Post-Cycle Cleanup (Enforce Limits)
    await enforceLimits()

  } catch (err) {
    console.error("❌ [NewsCycle] Pipeline failed:", err)
  }
}

// ─────────────────────────────────────────────
// LIMIT ENFORCEMENT
// ─────────────────────────────────────────────
async function enforceLimits() {
  const limits: Record<string, number> = {
    Politics: 2000,
    Trending: 2000,
    Sports: 1000,
    Newspaper: 1000,
    Lifestyle: 1000,
    Tech: 1000,
    Memes: 500
  };

  const sections = Object.keys(limits);
  
  for (const cat of sections) {
    const limit = limits[cat];
    const count = await NewsArticle.countDocuments({ category: cat })
    if (count > limit) {
      const excess = count - limit
      const oldest = await NewsArticle.find({ category: cat }).sort({ publishedAt: 1 }).limit(excess).select("_id")
      await NewsArticle.deleteMany({ _id: { $in: oldest.map(o => o._id) } })
    }
  }
}

// ─────────────────────────────────────────────
// CRON MANAGER
// ─────────────────────────────────────────────
export function startNewsCycleManager() {
  console.log("⏰ [NewsCycleManager] Initializing smart cron jobs...")

  // Every 15 min: Main Pipeline
  cron.schedule("*/15 * * * *", () => {
    runNewsPipeline()
  })

  // Every 24 hours: Deep Cleanup (delete older than 24h)
  cron.schedule("0 0 * * *", async () => {
    console.log("🧹 [NewsCycleManager] Running 24h deep cleanup...")
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    await NewsArticle.deleteMany({ publishedAt: { $lt: oneDayAgo } })
  })

  // Run once on startup (with 10 sec delay to let DB connect)
  setTimeout(() => {
    runNewsPipeline()
  }, 10000)
}
