import { Router } from "express"
import axios from "axios"
import {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  likeNews,
  unlikeNews,
  interactNews,
  viewNews,
} from "../controllers/newsController"
import { getTrendingSocialVideos } from "../controllers/socialTrendingController"
import { authenticate, authenticateFirebase, requireRole, AuthRequest } from "../middleware/auth"
import { NewsArticle } from "../models/NewsArticle"
import { SocialTrend } from "../models/SocialTrend"


const router = Router()

// Fallback live video IDs in case scraper fails or gets rate-limited by YouTube
const FALLBACK_LIVE_IDS: Record<string, string> = {}

// Helper to resolve live video ID from a YouTube Channel ID by scraping its /live page
async function getLiveVideoId(channelId: string): Promise<string | null> {
  try {
    const url = `https://www.youtube.com/channel/${channelId}/live`
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      },
      timeout: 5000
    })
    const html = response.data

    // 1. Try canonical link pattern
    const canonicalMatch = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([^"]+)"/)
    if (canonicalMatch && canonicalMatch[1]) {
      return canonicalMatch[1]
    }

    // 2. Try raw videoId pattern in JSON/HTML
    const videoIdMatch = html.match(/"videoId":"([^"]+)"/)
    if (videoIdMatch && videoIdMatch[1]) {
      return videoIdMatch[1]
    }

    // 3. Try shortUrl pattern
    const shortUrlMatch = html.match(/href="https:\/\/youtu\.be\/([^"]+)"/)
    if (shortUrlMatch && shortUrlMatch[1]) {
      return shortUrlMatch[1]
    }

    return null
  } catch (error) {
    console.error(`Error resolving live stream for channel ${channelId}:`, error)
    return null
  }
}

// Public routes
router.get("/", getAllNews)

// Fast ticker API
router.get("/ticker", async (req, res) => {
  try {
    const limit = Math.min(30, parseInt(req.query.limit as string) || 10)
    const { region } = req.query

    const query: Record<string, any> = {}

    // Apply region filtering
    if (region && typeof region === "string") {
      const normalizedRegion = region.toLowerCase();
      if (normalizedRegion !== "global") {
        const locationMap: Record<string, string[]> = {
          in: ["India", "Delhi", "Mumbai", "Bengaluru", "Chennai", "Kolkata"],
          us: ["US", "United States", "Washington", "New York", "America"],
          uk: ["UK", "United Kingdom", "London", "Britain"],
          gb: ["UK", "United Kingdom", "London", "Britain"]
        };
        const locs = locationMap[normalizedRegion];
        if (locs) query.location = { $in: locs };
      }
    }

    const articles = await NewsArticle.find(query).sort({ publishedAt: -1 }).limit(limit).select('title _id link sourceUrl category')
    res.json({ success: true, data: articles })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})


// Social Trends API
router.get("/social-trends", async (req, res) => {
  try {
    const trends = await SocialTrend.find().sort({ viral_score: -1, mentions: -1 }).limit(10)
    res.json({ success: true, data: trends })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

router.get("/trending-social", getTrendingSocialVideos)

router.get("/live-stream/:channelId", async (req, res) => {
  try {
    const { channelId } = req.params
    const videoId = await getLiveVideoId(channelId)
    
    if (videoId) {
      res.json({ success: true, videoId })
    } else {
      const fallbackId = FALLBACK_LIVE_IDS[channelId] || null
      res.json({ success: !!fallbackId, videoId: fallbackId, isFallback: true })
    }
  } catch (e: any) {
    const fallbackId = FALLBACK_LIVE_IDS[req.params.channelId] || null
    res.json({ success: !!fallbackId, videoId: fallbackId, isFallback: true, error: e.message })
  }
})

router.get("/:id", getNewsById)
router.post("/:id/view", viewNews)
router.post("/:id/like", likeNews)
router.post("/:id/unlike", unlikeNews)
router.post("/:id/interact", interactNews)

// Protected routes (admin/editor only)
router.post("/", authenticateFirebase, requireRole("admin", "editor"), createNews)
router.put("/:id", authenticateFirebase, requireRole("admin", "editor"), updateNews)
router.delete("/:id", authenticateFirebase, requireRole("admin"), deleteNews)

// Seed: mark some recent articles as premium (admin only)
router.post("/seed-premium", authenticateFirebase, requireRole("admin"), async (req: AuthRequest, res: any) => {
  try {
    const count = parseInt(req.query.count as string) || 10
    const articles = await NewsArticle.find().sort({ publishedAt: -1 }).limit(count * 2)
    const shuffled = articles.sort(() => Math.random() - 0.5)
    const toMark = shuffled.slice(0, count)
    await Promise.all(toMark.map((a) => NewsArticle.findByIdAndUpdate(a._id, { isPremium: true })))
    res.json({ success: true, message: `Marked ${toMark.length} articles as premium.` })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

export default router
