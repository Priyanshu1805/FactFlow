import cron from "node-cron"
import axios from "axios"
import { NewsArticle } from "../models/NewsArticle"
import * as cheerio from "cheerio"
import { runAiNewsAggregator } from "./aiNewsAggregator"
import { runSocialTrendAnalyzer } from "./socialTrendAnalyzer"
import { runMemeContentTracker } from "./memeContentTracker"
import { runGlobalPremiumAggregator } from "./globalPremiumAggregator"
import { getSocket } from "./pushService"
import { createBulkNotifications } from "./notificationService"
import { NotificationPrefs } from "../models/NotificationPrefs"
import { classifyArticle } from "./newsClassifier"
import { isClickbait, extractEntities, processSmartArticle } from "../utils/smartNewsUtils"
import { stringSimilarity } from "../utils/similarity"
import { invalidateAll, setCached } from "./cacheService"

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const NEWS_API_KEY = process.env.NEWS_API_KEY
const NEWS_API_URL = "https://newsapi.org/v2/top-headlines"

const CATEGORY_MAP: Record<string, string> = {
  technology: "Tech",
  sports: "Sports",
  entertainment: "Lifestyle",
  science: "Science",
  business: "Crypto",
  general: "Art",
  politics: "Politics",
}

// Used when no image found anywhere
const FALLBACK_IMAGES: Record<string, string> = {
  Tech: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80",
  Sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&q=80",
  Lifestyle: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80",
  Science: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&q=80",
  Crypto: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=1200&q=80",
  Art: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1200&q=80",
  World: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&q=80",
  Politics: "https://images.unsplash.com/photo-1529107386315-e1c731f2ca75?w=1200&q=80",
  Breaking: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80",
}

const BRANDED_AUTHORS = ["Fact Flow Team", "Fact Flow Editor", "Fact Flow Desk", "Fact Flow Bureau"]
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function randomAuthor() {
  return BRANDED_AUTHORS[Math.floor(Math.random() * BRANDED_AUTHORS.length)]
}

function getImageFallback(category: string): string {
  return FALLBACK_IMAGES[category] || FALLBACK_IMAGES["World"]
}

function generateAIImageUrl(title: string, category: string): string {
  const models = ["flux", "turbo", "default"]
  const model = models[Math.floor(Math.random() * models.length)]
  const prompt = encodeURIComponent(`high quality news photography about ${category}, highly detailed, professional, completely photorealistic. NO TEXT, NO WORDS, NO WRITING, NO LETTERS, no watermarks, clean image.`)
  return `https://image.pollinations.ai/prompt/${prompt}?width=1200&height=800&nologo=true&model=${model}`
}

async function generateFullArticle(title: string, excerpt: string, category: string): Promise<string> {
  const prompt = encodeURIComponent(
    `Write a detailed 4-paragraph news article about: "${title}". Context: "${excerpt.slice(0, 300)}". Category: ${category}. Only body paragraphs, no headings or metadata.`
  )
  const endpoints = [
    `https://text.pollinations.ai/${prompt}`,
    `https://text.pollinations.ai/prompt/${prompt}`,
  ]
  for (const endpoint of endpoints) {
    try {
      await sleep(300)
      const res = await axios.get(endpoint, { timeout: 12000 })
      if (res.data && typeof res.data === "string" && res.data.length > 150 && !res.data.includes("<html")) {
        return res.data
      }
    } catch {}
  }
  // Smart fallback: expand the excerpt into a readable paragraph block
  const base = excerpt && excerpt.length > 30 ? excerpt : title
  return `${base}\n\nThis is a developing story being closely monitored by the Fact Flow news desk. Our reporters are gathering additional information and updates will be provided as the situation unfolds.\n\nThe story has drawn significant attention across news platforms and social media, highlighting its importance to readers both in India and globally.\n\nStay tuned to Fact Flow for the latest updates, analysis, and in-depth coverage of this and related stories.`
}

async function scrapeArticleFromUrl(url: string): Promise<{ text: string | null; image: string | null }> {
  if (!url || !url.startsWith("http")) return { text: null, image: null }
  try {
    const res = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      timeout: 8000,
    })
    const $ = cheerio.load(res.data)

    let text = ""
    $("article p, .article-body p, .story-body p, .post-content p, .content p, main p").each((_, el) => {
      const t = $(el).text().trim()
      if (t.length > 60) text += t + "\n\n"
    })
    if (text.length < 300) {
      text = ""
      $("p").each((_, el) => {
        const t = $(el).text().trim()
        if (t.length > 60) text += t + "\n\n"
      })
    }

    const ogImage = $('meta[property="og:image"]').attr("content") || $('meta[name="twitter:image"]').attr("content") || null

    return { text: text.length > 300 ? text.trim() : null, image: ogImage }
  } catch {
    return { text: null, image: null }
  }
}

function extractLocation(content: string, title: string): string {
  const text = (title + " " + (content || "")).substring(0, 300);
  
  // Common dateline match: e.g., "MUMBAI: " or "LONDON (Reuters) -"
  const match = text.match(/^([A-Z][A-Za-z\s]+)(?:\s*\(.*?\))?\s*[-—:]/);
  if (match && match[1]) {
    const loc = match[1].trim();
    if (loc.split(" ").length <= 3 && loc.toUpperCase() === loc) {
      return loc.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    }
  }
  
  // Fallback: check prominent cities in the first few sentences
  const cities = ["Delhi", "Mumbai", "Bengaluru", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Nagpur", "Ahmedabad", "Jaipur", "Lucknow", "Washington", "London", "New York", "Paris", "Tokyo", "Dubai", "Beijing"];
  for (const city of cities) {
    const regex = new RegExp(`\\b${city}\\b`, "i");
    if (regex.test(text)) return city;
  }
  
  return "Global";
}

// ─────────────────────────────────────────────
// GLOBALS FOR CRON JOB MEMOIZATION
// ─────────────────────────────────────────────
let cachedRecentArticles: any[] = []
let lastRecentFetchTime = 0

async function saveArticle(data: {
  title: string
  excerpt: string
  content: string
  category: string
  image: string
  author: string
  publishedAt: Date
  source?: string
  isBreaking?: boolean
  tags?: string[]
}) {
  try {
    // 🧠 1. CLICKBAIT FILTER
    if (isClickbait(data.title)) {
      console.log(`🛡️  [Smart Filter] Rejected clickbait: "${data.title}"`)
      return false
    }

    // Fast deduplication check
    const exists = await NewsArticle.exists({ title: data.title })
    if (exists) return false
    
    // 🧠 1.5 SIMILARITY DEDUPLICATION (2 hour window)
    const now = Date.now()
    if (now - lastRecentFetchTime > 10000) { // Cache for 10 seconds
      const twoHoursAgo = new Date(now - 2 * 60 * 60 * 1000)
      cachedRecentArticles = await NewsArticle.find({ publishedAt: { $gte: twoHoursAgo } }).select("title").lean()
      lastRecentFetchTime = now
    }
    
    const isSimilar = cachedRecentArticles.some(a => stringSimilarity(data.title, a.title) > 0.8)
    if (isSimilar) {
      console.log(`🧠 [Similarity] Skipped duplicate article: "${data.title}"`)
      return false
    }

    // 🧠 2. FUZZY DUPLICATE & VIRAL VELOCITY DETECTION
    const { isDuplicate, promoteToBreaking } = await processSmartArticle(data.title, data.excerpt, data.category)
    if (isDuplicate) {
      console.log(`🧠 [Smart Merge] Skipped duplicate article: "${data.title}"`)
      return false
    }

    const location = extractLocation(data.content, data.title)

    // 🧠 3. SMART ENTITY EXTRACTION
    const smartTags = extractEntities(data.title + " " + data.excerpt)
    const finalTags = Array.from(new Set([...(data.tags || [data.category]), ...smartTags]))
    
    let article;
    try {
      const section = await classifyArticle(data.title, data.excerpt || '');
      article = await NewsArticle.create({
        ...data,
        location,
        isBreaking: data.isBreaking || promoteToBreaking, // 🧠 Auto-promoted based on viral velocity
        tags: finalTags,
        sections: [section],
        primarySection: section,
        classifiedBy: 'keyword', // Actually could be keyword or AI, but user specifically asked for 'keyword' here
        classifiedAt: new Date()
      })
    } catch (classifyError) {
      console.warn('Classifier failed, saving without classification:', classifyError);
      article = await NewsArticle.create({
        ...data,
        location,
        isBreaking: data.isBreaking || promoteToBreaking,
        tags: finalTags,
      })
    }

    const io = getSocket()
    if (io) {
      if (article.isBreaking) {
        io.emit("breaking_news", article)
      } else {
        io.emit("new_article", article)
      }
    }

    if (article.isBreaking) {
      const prefs = await NotificationPrefs.find({ breakingNews: true }).lean()
      if (prefs.length > 0) {
        const userIds = prefs.map(p => p.userId.toString())
        // Run in background without blocking
        createBulkNotifications(userIds, {
          type: "breaking_news",
          title: "🚨 Breaking News",
          message: data.title,
          link: `/article/${article._id}`,
          articleId: article._id.toString(),
          image: data.image
        }).catch(err => console.error("Breaking news bulk notification error:", err.message))
      }
    }

    return true
  } catch (err: any) {
    console.error("Save article error:", err.message)
    return false
  }
}

// ─────────────────────────────────────────────
// CACHE WARMUP
// ─────────────────────────────────────────────

export async function warmUpCache() {
  try {
    const sections = ['Art','Politics','Sports','Tech','Lifestyle','Crypto','World','Science'];
    for (const section of sections) {
      const data = await NewsArticle.find({ category: section }).sort({ publishedAt: -1 }).limit(20).lean();
      await setCached(`news:${section.toLowerCase()}:page1`, {
        success: true,
        data,
        pagination: { page: 1, limit: 20, total: await NewsArticle.countDocuments({ category: section }), totalPages: -1 }
      }, 60 * 15);
    }
    
    // Also warm up global (frontpage)
    const globalData = await NewsArticle.find({}).sort({ publishedAt: -1 }).limit(20).lean();
    await setCached(`news:global:page1`, {
      success: true,
      data: globalData,
      pagination: { page: 1, limit: 20, total: await NewsArticle.countDocuments({}), totalPages: -1 }
    }, 60 * 15);

    console.log('🔥 Cache warmed up for all sections');
  } catch (error) {
    console.error('❌ Cache warmup failed:', error);
  }
}

// ─────────────────────────────────────────────
// CRON SCHEDULER
// ─────────────────────────────────────────────

export function startNewsCronJob(): void {
  // ── BREAKING NEWS: Every 30 minutes (API calls — limited quota, use sparingly)
  cron.schedule("*/30 * * * *", async () => {
    console.log("🔴 Fetching BREAKING NEWS from APIs...")
    await fetchBreakingNewsFromAPIs()
    // Auto-expire breaking tag on articles older than 6 hours
    await expireOldBreakingNews()
    console.log("🔴 Breaking news fetch complete.")
  })

  // ── AI ENGINES: Run every hour to fetch and process with LLM
  cron.schedule("0 * * * *", async () => {
    console.log("🤖 Running AI Engines (News, Trends, Memes)...")
    await runAiNewsAggregator()
    await runSocialTrendAnalyzer()
    await runMemeContentTracker()
    console.log("🤖 AI Engines finished processing.")
  })

  // ── REGULAR NEWS: Every 15 minutes (RSS + Reddit + Nitter — unlimited)
  cron.schedule("*/15 * * * *", async () => {
    console.log("📰 Fetching REGULAR NEWS from RSS/Reddit/Nitter in parallel...")
    await Promise.allSettled([
      fetchAllRSSFeeds(),
      fetchAllRedditFeeds(),
      fetchNitterFeeds(),
      fetchMediaStack("technology"),
      fetchNewsData("politics"),
      
      // NEW CODE ADDED - FIX 2 (Reddit public API)
      (async () => {
        try {
          const { fetchAllReddit } = await import("./redditFetcher")
          const redditArticles = await fetchAllReddit();
          await NewsArticle.insertMany(redditArticles, { ordered: false });
          console.log(`Reddit: ${redditArticles.length} articles saved`);
        } catch (err) {
          console.warn('Reddit fetch failed, skipping:', err);
        }
      })()
    ])
    console.log("📰 Regular news fetch complete.")
    
    // NEW CODE ADDED - FIX 5 (Min articles check)
    await ensureMinimumArticles()
    
    await invalidateAll()
    await warmUpCache()
  })

  // ── CLEANUP: Every 48 hours — delete very old articles
  cron.schedule("0 */48 * * *", async () => {
    try {
      const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)
      const result = await NewsArticle.deleteMany({ publishedAt: { $lt: twoDaysAgo } })
      if (result.deletedCount > 0) console.log(`🧹 Cleanup: Deleted ${result.deletedCount} old articles.`)
    } catch (error) {
      console.error("❌ Cleanup failed:", error)
    }
  })

  // ── IMAGE FIXER: Every 5 minutes — Find articles with missing or broken images and fix them!
  cron.schedule("*/5 * * * *", async () => {
    console.log("🖼️ Running Continuous Image Fixer...")
    try {
      // Find articles where image is missing, empty, or doesn't start with http
      const brokenArticles = await NewsArticle.find({
        $or: [
          { image: null },
          { image: "" },
          { image: { $exists: false } },
          { image: { $not: /^http/i } }
        ]
      }).limit(50) // Fix in batches of 50

      if (brokenArticles.length > 0) {
        for (const article of brokenArticles) {
          article.image = getImageFallback(article.category) || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&q=80"
          await article.save()
        }
        console.log(`🖼️ Image Fixer: Successfully restored images for ${brokenArticles.length} articles!`)
      } else {
        console.log("🖼️ Image Fixer: All articles have valid images.")
      }
    } catch (error) {
      console.error("❌ Image Fixer failed:", error)
    }
  })

  // ── PREMIUM GLOBAL NEWS: Every 5 minutes for "instant" updates
  cron.schedule("*/5 * * * *", async () => {
    console.log("🌐 Running Fast Global Premium News Aggregator (50+ Sources)...")
    await runGlobalPremiumAggregator()
  })

  console.log("✅ Smart news cron jobs started (Breaking: 30m | Regular: 15m | Premium: 5m | Images: 5m | Cleanup: 48h)")
}

// ─────────────────────────────────────────────
// BREAKING NEWS — APIs (Limited Quota)
// ─────────────────────────────────────────────

async function fetchBreakingNewsFromAPIs(): Promise<void> {
  await fetchBreakingFromNewsAPI()
  await fetchBreakingFromTheNewsAPI()
  await fetchBreakingFromNewsData()
}

async function fetchBreakingFromNewsAPI(): Promise<void> {
  if (!NEWS_API_KEY) return
  try {
    // Fetch top headlines across all relevant countries
    const countries = ["in", "us", "gb"]
    for (const country of countries) {
      const res = await axios.get(NEWS_API_URL, {
        params: { country, pageSize: 20, apiKey: NEWS_API_KEY },
        timeout: 10000,
      })
      const articles = res.data.articles || []
      let added = 0
      for (const article of articles) {
        if (!article.title || article.title === "[Removed]" || !article.description) continue
        const scraped = await scrapeArticleFromUrl(article.url)
        const content = scraped.text || await generateFullArticle(article.title, article.description, "Breaking")
        const image = article.urlToImage || scraped.image || generateAIImageUrl(article.title, "Breaking")
        const ok = await saveArticle({
          title: article.title,
          excerpt: article.description,
          content,
          category: "Politics", // Breaking news maps to Politics/World
          image,
          author: article.source?.name || randomAuthor(),
          publishedAt: new Date(article.publishedAt),
          source: article.url,
          isBreaking: true,
          tags: ["Breaking", "TopNews"],
        })
        if (ok) added++
      }
      console.log(`✅ NewsAPI [${country}]: +${added} breaking`)
      await sleep(500)
    }
  } catch (e: any) {
    if (e?.response?.status !== 429) console.error("❌ NewsAPI Breaking:", e?.message)
    else console.warn("⚠️ NewsAPI rate limit hit")
  }
}

async function fetchBreakingFromTheNewsAPI(): Promise<void> {
  const key = process.env.THENEWSAPI_KEY
  if (!key) return
  try {
    const res = await axios.get("https://api.thenewsapi.com/v1/news/top", {
      params: { api_token: key, language: "en", limit: 20 },
      timeout: 10000,
    })
    const articles = res.data.data || []
    let added = 0
    for (const item of articles) {
      if (!item.title) continue
      const scraped = await scrapeArticleFromUrl(item.url)
      const content = scraped.text || await generateFullArticle(item.title, item.snippet || "", "Breaking")
      const ok = await saveArticle({
        title: item.title,
        excerpt: item.snippet || item.title,
        content,
        category: "World",
        image: item.image_url || scraped.image || generateAIImageUrl(item.title, "Breaking"),
        author: randomAuthor(),
        publishedAt: new Date(item.published_at),
        source: item.url,
        isBreaking: true,
        tags: ["Breaking", "TopNews"],
      })
      if (ok) added++
    }
    console.log(`✅ TheNewsAPI Breaking: +${added}`)
  } catch (e: any) {
    if (e?.response?.status !== 429) console.error("❌ TheNewsAPI:", e?.message)
  }
}

async function fetchBreakingFromNewsData(): Promise<void> {
  const key = process.env.NEWSDATA_KEY
  if (!key) return
  try {
    // Prioritize India breaking news
    const res = await axios.get("https://newsdata.io/api/1/news", {
      params: { apikey: key, language: "en", country: "in", size: 20 },
      timeout: 10000,
    })
    const articles = res.data.results || []
    let added = 0
    for (const item of articles) {
      if (!item.title) continue
      const scraped = await scrapeArticleFromUrl(item.link)
      const content = scraped.text || await generateFullArticle(item.title, item.description || "", "Breaking")
      const ok = await saveArticle({
        title: item.title,
        excerpt: item.description || item.title,
        content,
        category: "Politics",
        image: item.image_url || scraped.image || generateAIImageUrl(item.title, "Breaking"),
        author: randomAuthor(),
        publishedAt: new Date(item.pubDate),
        source: item.link,
        isBreaking: true,
        tags: ["Breaking", "India"],
      })
      if (ok) added++
    }
    console.log(`✅ NewsData India Breaking: +${added}`)
  } catch (e: any) {
    if (e?.response?.status !== 429) console.error("❌ NewsData:", e?.message)
  }
}

async function expireOldBreakingNews(): Promise<void> {
  try {
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000)
    const result = await NewsArticle.updateMany(
      { isBreaking: true, publishedAt: { $lt: sixHoursAgo } },
      { $set: { isBreaking: false } }
    )
    if (result.modifiedCount > 0) console.log(`⏰ Expired ${result.modifiedCount} breaking news tags`)
  } catch {}
}

// ─────────────────────────────────────────────
// REGULAR NEWS — RSS FEEDS (Unlimited)
// 30+ Indian + Global channels
// ─────────────────────────────────────────────

import Parser from "rss-parser"
const rssParser = new Parser({ timeout: 10000 })

const ALL_RSS_FEEDS: Array<{ url: string; category: string; source: string }> = [
  // ── INDIAN NEWS SOURCES
  { url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms", category: "World", source: "Times of India" },
  { url: "https://timesofindia.indiatimes.com/rssfeeds/296589292.cms", category: "Politics", source: "Times of India" },
  { url: "https://timesofindia.indiatimes.com/rssfeeds/4719148.cms", category: "Sports", source: "Times of India" },
  { url: "https://timesofindia.indiatimes.com/rssfeeds/5880659.cms", category: "Tech", source: "Times of India" },
  { url: "https://www.thehindu.com/news/national/feeder/default.rss", category: "Politics", source: "The Hindu" },
  { url: "https://www.thehindu.com/sport/feeder/default.rss", category: "Sports", source: "The Hindu" },
  { url: "https://www.thehindu.com/sci-tech/technology/feeder/default.rss", category: "Tech", source: "The Hindu" },
  { url: "https://indianexpress.com/section/political-pulse/feed/", category: "Politics", source: "Indian Express" },
  { url: "https://indianexpress.com/section/sports/feed/", category: "Sports", source: "Indian Express" },
  { url: "https://indianexpress.com/section/technology/feed/", category: "Tech", source: "Indian Express" },
  { url: "https://feeds.feedburner.com/ndtvnews-top-stories", category: "World", source: "NDTV" },
  { url: "https://feeds.feedburner.com/ndtvnews-india-news", category: "Politics", source: "NDTV" },
  { url: "https://feeds.feedburner.com/ndtvnews-sports", category: "Sports", source: "NDTV" },
  { url: "https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml", category: "Politics", source: "Hindustan Times" },
  { url: "https://www.hindustantimes.com/feeds/rss/sports/rssfeed.xml", category: "Sports", source: "Hindustan Times" },
  { url: "https://www.indiatoday.in/rss/home", category: "World", source: "India Today" },
  // ── GLOBAL NEWS SOURCES
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml", category: "World", source: "BBC" },
  { url: "https://feeds.bbci.co.uk/news/technology/rss.xml", category: "Tech", source: "BBC" },
  { url: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml", category: "Science", source: "BBC" },
  { url: "https://feeds.bbci.co.uk/sport/rss.xml", category: "Sports", source: "BBC Sports" },
  { url: "https://feeds.bbci.co.uk/news/politics/rss.xml", category: "Politics", source: "BBC" },
  { url: "https://feeds.reuters.com/reuters/topNews", category: "World", source: "Reuters" },
  { url: "https://feeds.reuters.com/reuters/technologyNews", category: "Tech", source: "Reuters" },
  { url: "https://feeds.reuters.com/reuters/sportsNews", category: "Sports", source: "Reuters" },
  { url: "https://www.aljazeera.com/xml/rss/all.xml", category: "World", source: "Al Jazeera" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", category: "World", source: "NYT" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml", category: "Politics", source: "NYT" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml", category: "Tech", source: "NYT" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/Science.xml", category: "Science", source: "NYT" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml", category: "Sports", source: "NYT" },
  { url: "https://techcrunch.com/feed/", category: "Tech", source: "TechCrunch" },
  { url: "https://feeds.arstechnica.com/arstechnica/index", category: "Tech", source: "Ars Technica" },
  { url: "https://www.theguardian.com/world/rss", category: "World", source: "The Guardian" },
  { url: "https://www.theguardian.com/technology/rss", category: "Tech", source: "The Guardian" },
  { url: "https://www.theguardian.com/sport/rss", category: "Sports", source: "The Guardian" },
  { url: "https://www.science.org/rss/news_current.xml", category: "Science", source: "Science.org" },
  { url: "https://www.espn.com/espn/rss/news", category: "Sports", source: "ESPN" },
  
  // NEW CODE ADDED - FIX 1 (New Sources)
  // 🎨 ART SECTION — Bollywood, Music, Entertainment
  { url: 'https://www.filmfare.com/rss/news.xml',           category: 'Art', source: 'Filmfare' },
  { url: 'https://www.pinkvilla.com/rss.xml',               category: 'Art', source: 'Pinkvilla' },
  { url: 'https://www.bollywoodhungama.com/rss/news.xml',   category: 'Art', source: 'Bollywood Hungama' },
  { url: 'https://timesofindia.indiatimes.com/rss/4719148.cms', category: 'Art', source: 'TOI Entertainment' }, 
  { url: 'https://www.ndtv.com/entertainment/rss',          category: 'Art', source: 'NDTV' },
  { url: 'https://feeds.feedburner.com/gadgetsnow-art',     category: 'Art', source: 'Gadgets Now' },
  { url: 'https://www.thehindu.com/entertainment/feeder/default.rss', category: 'Art', source: 'The Hindu' },
  { url: 'https://indianexpress.com/section/entertainment/feed/', category: 'Art', source: 'Indian Express' },

  // 💃 LIFESTYLE SECTION — Health, Food, Travel, Fitness
  { url: 'https://www.healthshots.com/feed/',               category: 'Lifestyle', source: 'HealthShots' },
  { url: 'https://food.ndtv.com/feeds/rss/all.xml',         category: 'Lifestyle', source: 'NDTV Food' },
  { url: 'https://timesofindia.indiatimes.com/rss/4719244.cms', category: 'Lifestyle', source: 'TOI Life' }, 
  { url: 'https://www.femina.in/feed',                      category: 'Lifestyle', source: 'Femina' },
  { url: 'https://www.mensxp.com/feed',                     category: 'Lifestyle', source: 'MensXP' },
  { url: 'https://www.shethepeople.tv/feed/',               category: 'Lifestyle', source: 'SheThePeople' },
  { url: 'https://www.healthline.com/rss/health-news',      category: 'Lifestyle', source: 'Healthline' },
  { url: 'https://indianexpress.com/section/lifestyle/feed/', category: 'Lifestyle', source: 'Indian Express' },
  { url: 'https://www.travelandleisure.com/rss',            category: 'Lifestyle', source: 'Travel+Leisure' },

  // ⚽ SPORTS SECTION — Football, Tennis, All sports
  { url: 'https://www.goal.com/feeds/en/news',              category: 'Sports', source: 'Goal.com' },
  { url: 'https://www.skysports.com/rss/12040',             category: 'Sports', source: 'Sky Sports' }, 
  { url: 'https://timesofindia.indiatimes.com/rss/4719242.cms', category: 'Sports', source: 'TOI Sports' }, 
  { url: 'https://sportstar.thehindu.com/feeder/default.rss', category: 'Sports', source: 'Sportstar' },
  { url: 'https://www.espncricinfo.com/rss/content/story/feeds/0.xml', category: 'Sports', source: 'ESPN Cricinfo' },
  { url: 'https://www.cricbuzz.com/rss-feeds/7730',         category: 'Sports', source: 'Cricbuzz' },
  { url: 'https://www.olympicchannel.com/en/feed/',         category: 'Sports', source: 'Olympic Channel' },

  // 💻 TECH SECTION — Indian startups, Global tech
  { url: 'https://yourstory.com/feed',                      category: 'Tech', source: 'YourStory' },
  { url: 'https://inc42.com/feed/',                         category: 'Tech', source: 'Inc42' },
  { url: 'https://entrackr.com/feed/',                      category: 'Tech', source: 'Entrackr' },
  { url: 'https://www.wired.com/feed/rss',                  category: 'Tech', source: 'Wired' },
  { url: 'https://thenextweb.com/feed/',                    category: 'Tech', source: 'The Next Web' },
  { url: 'https://www.theverge.com/rss/index.xml',          category: 'Tech', source: 'The Verge' },
  { url: 'https://timesofindia.indiatimes.com/rss/4719243.cms', category: 'Tech', source: 'TOI Tech' }, 

  // 🏛️ POLITICS SECTION — India + World politics
  { url: 'https://pib.gov.in/RssMain.aspx',                 category: 'Politics', source: 'PIB India' },
  { url: 'https://indianexpress.com/section/politics/feed/', category: 'Politics', source: 'Indian Express' },
  { url: 'https://feeds.feedburner.com/ndtv/India',         category: 'Politics', source: 'NDTV' },
  { url: 'https://www.firstpost.com/rss/politics.xml',      category: 'Politics', source: 'Firstpost' },
  { url: 'https://scroll.in/feed',                          category: 'Politics', source: 'Scroll.in' },
  { url: 'https://thewire.in/feed',                         category: 'Politics', source: 'The Wire' },

  // 🔥 TRENDING SECTION — Viral, Social media
  { url: 'https://timesofindia.indiatimes.com/rss/3908837.cms',     category: 'Trending', source: 'TOI Viral' }, 

  // 📺 LIVE SECTION — Breaking news
  { url: 'https://www.ndtv.com/latest/rss',                 category: 'Live', source: 'NDTV Latest' },
  { url: 'https://feeds.feedburner.com/NDTV-LatestNews',    category: 'Live', source: 'NDTV Latest' },
  { url: 'https://timesofindia.indiatimes.com/rss/858977.cms', category: 'Live', source: 'TOI Breaking' }, 
  { url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml', category: 'Live', source: 'Hindustan Times' },
  { url: 'http://feeds.reuters.com/reuters/INtopNews',       category: 'Live', source: 'Reuters India' },
  { url: 'https://feeds.bbci.co.uk/news/world/asia/india/rss.xml', category: 'Live', source: 'BBC India' },

  // 📰 NEWSPAPER SECTION — General headlines
  { url: 'https://www.deccanherald.com/rss-feeds/top-news', category: 'Newspaper', source: 'Deccan Herald' },
  { url: 'https://www.business-standard.com/rss/latest.rss', category: 'Newspaper', source: 'Business Standard' },
  { url: 'https://www.livemint.com/rss/news',               category: 'Newspaper', source: 'Livemint' },
  { url: 'https://www.telegraphindia.com/feeds/rss.cms',    category: 'Newspaper', source: 'Telegraph India' },
  { url: 'https://www.tribuneindia.com/rss/feed.cms',       category: 'Newspaper', source: 'Tribune India' },
  { url: 'https://www.freepressjournal.in/feed',            category: 'Newspaper', source: 'Free Press Journal' },
  { url: 'https://www.theprint.in/feed/',                   category: 'Newspaper', source: 'ThePrint' },

  // NEW CODE ADDED - FIX 3 (Google News RSS)
  { url: 'https://news.google.com/rss/search?q=bollywood&hl=en-IN&gl=IN&ceid=IN:en',       category: 'Art', source: 'Google News' },
  { url: 'https://news.google.com/rss/search?q=cricket+india&hl=en-IN&gl=IN&ceid=IN:en',   category: 'Sports', source: 'Google News' },
  { url: 'https://news.google.com/rss/search?q=indian+politics&hl=en-IN&gl=IN&ceid=IN:en', category: 'Politics', source: 'Google News' },
  { url: 'https://news.google.com/rss/search?q=india+technology+startup&hl=en-IN&gl=IN&ceid=IN:en', category: 'Tech', source: 'Google News' },
  { url: 'https://news.google.com/rss/search?q=health+fitness+india&hl=en-IN&gl=IN&ceid=IN:en', category: 'Lifestyle', source: 'Google News' },
  { url: 'https://news.google.com/rss/search?q=viral+india+trending&hl=en-IN&gl=IN&ceid=IN:en', category: 'Trending', source: 'Google News' },
  { url: 'https://news.google.com/rss/search?q=breaking+news+india&hl=en-IN&gl=IN&ceid=IN:en', category: 'Live', source: 'Google News'   },
  { url: 'https://news.google.com/rss/search?q=india+headlines&hl=en-IN&gl=IN&ceid=IN:en', category: 'Newspaper', source: 'Google News' },
  { url: 'https://news.google.com/rss/search?q=football+india&hl=en-IN&gl=IN&ceid=IN:en',  category: 'Sports', source: 'Google News'    },
  { url: 'https://news.google.com/rss/search?q=music+india+new+song&hl=en-IN&gl=IN&ceid=IN:en', category: 'Art', source: 'Google News'  },
  { url: 'https://news.google.com/rss/search?q=travel+india+tourism&hl=en-IN&gl=IN&ceid=IN:en', category: 'Lifestyle', source: 'Google News' },
  { url: 'https://news.google.com/rss/search?q=indian+startup+funding&hl=en-IN&gl=IN&ceid=IN:en', category: 'Tech', source: 'Google News' },
]


async function fetchAllRSSFeeds(): Promise<void> {
  for (const feed of ALL_RSS_FEEDS) {
    try {
      const parsed = await rssParser.parseURL(feed.url)
      let added = 0
      for (const item of (parsed.items || []).slice(0, 15)) {
        if (!item.title) continue
        const scraped = item.link ? await scrapeArticleFromUrl(item.link) : { text: null, image: null }
        const content = scraped.text || await generateFullArticle(item.title, item.contentSnippet || "", feed.category)
        const image = scraped.image || getImageFallback(feed.category)
        const ok = await saveArticle({
          title: item.title,
          excerpt: item.contentSnippet?.slice(0, 200) || item.title,
          content,
          category: feed.category,
          image,
          author: feed.source,
          publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
          source: item.link || feed.url,
          tags: [feed.category, feed.source.replace(" ", "")],
        })
        if (ok) added++
      }
      if (added > 0) console.log(`✅ RSS [${feed.source}]: +${added} ${feed.category}`)
    } catch (e: any) {
      // Silently skip dead feeds
    }
    await sleep(100) // tiny throttle between feeds
  }
}

// ─────────────────────────────────────────────
// REGULAR NEWS — REDDIT (Indian + Global)
// ─────────────────────────────────────────────

const REDDIT_FEEDS = [
  // Indian subreddits
  { subreddit: "india", category: "World" },
  { subreddit: "IndiaSpeaks", category: "Politics" },
  { subreddit: "IndiaNews", category: "World" },
  { subreddit: "indiadiscussion", category: "World" },
  { subreddit: "bollywood", category: "Lifestyle" },
  // Global subreddits
  { subreddit: "worldnews", category: "World" },
  { subreddit: "news", category: "World" },
  { subreddit: "politics", category: "Politics" },
  { subreddit: "technology", category: "Tech" },
  { subreddit: "science", category: "Science" },
  { subreddit: "sports", category: "Sports" },
  { subreddit: "entertainment", category: "Lifestyle" },
  // Art & Culture
  { subreddit: "Art", category: "Art" },
  { subreddit: "Museum", category: "Art" },
]

export async function fetchAllRedditFeeds(): Promise<void> {
  for (const feed of REDDIT_FEEDS) {
    try {
      const res = await axios.get(`https://www.reddit.com/r/${feed.subreddit}/hot.json?limit=30`, {
        headers: { "User-Agent": "FactFlow/2.0 NewsAggregator" },
        timeout: 10000,
      })
      const posts = res.data.data.children || []
      let added = 0
      for (const post of posts) {
        const data = post.data
        if (!data.title || data.over_18 || data.is_video) continue
        if (data.stickied) continue // skip pinned posts
        // Skip low-quality / personal posts
        if (data.score < 50) continue  // minimum 50 upvotes
        if (data.title.length < 20) continue  // too short title
        // Skip personal/question style posts not suitable for news
        const personalIndicators = /^(i |my |am i|is it|does anyone|what should|help me|how do i|eli5|asking for|rant:|update:|tldr)/i
        if (personalIndicators.test(data.title.trim())) continue

        let image: string | null = null
        if (data.url && /\.(jpg|jpeg|png)$/i.test(data.url)) image = data.url
        else if (data.thumbnail && data.thumbnail.startsWith("http") && data.thumbnail !== "self") image = data.thumbnail
        if (!image) image = getImageFallback(feed.category)

        const excerpt = data.selftext ? data.selftext.slice(0, 200) + "..." : data.title
        const content =
          data.selftext && data.selftext.length > 150
            ? data.selftext
            : await generateFullArticle(data.title, data.selftext || "", feed.category)

        const ok = await saveArticle({
          title: data.title,
          excerpt,
          content,
          category: feed.category,
          image,
          author: `r/${feed.subreddit}`,
          publishedAt: new Date(data.created_utc * 1000),
          source: `https://reddit.com${data.permalink}`,
          tags: [feed.category, `r/${feed.subreddit}`],
        })
        if (ok) added++
      }
      if (added > 0) console.log(`✅ Reddit r/${feed.subreddit}: +${added} ${feed.category}`)
    } catch (e: any) {
      // skip failed subreddits silently
    }
    await sleep(200)
  }
}

// ─────────────────────────────────────────────
// REGULAR NEWS — NITTER / X (Twitter RSS)
// No API key needed — public RSS from big accounts
// ─────────────────────────────────────────────

const NITTER_FEEDS = [
  { account: "BBCBreaking", category: "World", label: "BBC Breaking" },
  { account: "Reuters", category: "World", label: "Reuters" },
  { account: "IndiaToday", category: "Politics", label: "India Today" },
  { account: "ndtv", category: "Politics", label: "NDTV" },
  { account: "timesofindia", category: "World", label: "Times of India" },
  { account: "CNN", category: "World", label: "CNN" },
  { account: "AJEnglish", category: "World", label: "Al Jazeera" },
  { account: "ANI", category: "Politics", label: "ANI" },
]

// Multiple Nitter instances for fallback
const NITTER_INSTANCES = ["https://nitter.net", "https://nitter.cz", "https://nitter.nl"]

async function fetchNitterFeeds(): Promise<void> {
  for (const feed of NITTER_FEEDS) {
    let fetched = false
    for (const instance of NITTER_INSTANCES) {
      try {
        const url = `${instance}/${feed.account}/rss`
        const parsed = await rssParser.parseURL(url)
        let added = 0
        for (const item of (parsed.items || []).slice(0, 10)) {
          if (!item.title || item.title.length < 20) continue
          const content = await generateFullArticle(item.title, item.contentSnippet || "", feed.category)
          const ok = await saveArticle({
            title: item.title.slice(0, 280),
            excerpt: item.contentSnippet?.slice(0, 200) || item.title,
            content,
            category: feed.category,
            image: getImageFallback(feed.category),
            author: feed.label,
            publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
            source: item.link || url,
            tags: [feed.category, "X", feed.label.replace(" ", "")],
          })
          if (ok) added++
        }
        if (added > 0) console.log(`✅ X/Nitter @${feed.account}: +${added} ${feed.category}`)
        fetched = true
        break
      } catch {
        // try next nitter instance
      }
    }
    if (!fetched) {
      // silently skip — nitter might be down
    }
    await sleep(200)
  }
}

// ─────────────────────────────────────────────
// MEDIASTACK + NEWSDATA (for supplemental fills)
// Called with targeted categories only
// ─────────────────────────────────────────────

export async function fetchMediaStack(category: string): Promise<void> {
  const key = process.env.MEDIASTACK_KEY
  if (!key) return
  try {
    const res = await axios.get("http://api.mediastack.com/v1/news", {
      params: { access_key: key, languages: "en", limit: 20, categories: category, countries: "in,us,gb" },
      timeout: 10000,
    })
    const articles = res.data.data || []
    let added = 0
    for (const item of articles) {
      if (!item.title) continue
      const scraped = item.url ? await scrapeArticleFromUrl(item.url) : { text: null, image: null }
      const cat = CATEGORY_MAP[category] || "World"
      const ok = await saveArticle({
        title: item.title,
        excerpt: item.description || item.title,
        content: scraped.text || await generateFullArticle(item.title, item.description || "", cat),
        category: cat,
        image: item.image || scraped.image || getImageFallback(cat),
        author: item.source || randomAuthor(),
        publishedAt: new Date(item.published_at),
        source: item.url,
        tags: [cat],
      })
      if (ok) added++
    }
    if (added > 0) console.log(`✅ MediaStack [${category}]: +${added}`)
  } catch (e: any) {
    if (e?.response?.status !== 429) console.error("❌ MediaStack:", e?.message)
  }
}

export async function fetchNewsData(category: string): Promise<void> {
  const key = process.env.NEWSDATA_KEY
  if (!key) return
  try {
    const res = await axios.get("https://newsdata.io/api/1/news", {
      params: { apikey: key, language: "en", category, size: 20 },
      timeout: 10000,
    })
    const articles = res.data.results || []
    let added = 0
    for (const item of articles) {
      if (!item.title) continue
      const scraped = item.link ? await scrapeArticleFromUrl(item.link) : { text: null, image: null }
      const cat = CATEGORY_MAP[category] || "World"
      const ok = await saveArticle({
        title: item.title,
        excerpt: item.description || item.title,
        content: scraped.text || await generateFullArticle(item.title, item.description || "", cat),
        category: cat,
        image: item.image_url || scraped.image || getImageFallback(cat),
        author: randomAuthor(),
        publishedAt: new Date(item.pubDate),
        source: item.link,
        isBreaking: false,
        tags: [cat, "India"],
      })
      if (ok) added++
    }
    if (added > 0) console.log(`✅ NewsData India [${category}]: +${added}`)
  } catch (e: any) {
    if (e?.response?.status !== 429) console.error("❌ NewsData:", e?.message)
  }
}

// ─────────────────────────────────────────────
// MANUAL TRIGGER (for fetch-now.ts)
// ─────────────────────────────────────────────

export async function fetchAllNewsNow(): Promise<void> {
  console.log("🔴 [1/3] Fetching Breaking News from APIs...")
  await fetchBreakingNewsFromAPIs()

  console.log("📰 [2/3] Fetching Regular News and Supplemental in parallel...")
  await Promise.allSettled([
    fetchAllRSSFeeds(),
    fetchAllRedditFeeds(),
    fetchNitterFeeds(),
    fetchMediaStack("technology"),
    fetchMediaStack("sports"),
    fetchNewsData("politics"),
    fetchNewsData("science")
  ])

  console.log("✅ Full news fetch complete!")
  await invalidateAll()
  await warmUpCache()
}

// NEW CODE ADDED - FIX 5 (Min articles check)
// If any section has less than 10 articles in last 24 hours,
// trigger an extra Google News RSS fetch for that section only
async function ensureMinimumArticles() {
  const sections = ['art','lifestyle','sports','tech','politics','live','trending','newspaper'];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

  for (const section of sections) {
    try {
      const count = await NewsArticle.countDocuments({
        category: section, // using 'category' since the schema field is primarily category
        publishedAt: { $gte: yesterday }
      });

      if (count < 10) {
        console.log(`[Minimum Check] ${section} has only ${count} articles — fetching more...`);
        const url = `https://news.google.com/rss/search?q=${section}+india&hl=en-IN&gl=IN&ceid=IN:en`;
        
        const parsed = await rssParser.parseURL(url)
        let added = 0
        for (const item of (parsed.items || []).slice(0, 15)) {
          if (!item.title) continue
          const scraped = item.link ? await scrapeArticleFromUrl(item.link) : { text: null, image: null }
          const content = scraped.text || await generateFullArticle(item.title, item.contentSnippet || "", section)
          const image = scraped.image || getImageFallback(section)
          const ok = await saveArticle({
            title: item.title,
            excerpt: item.contentSnippet ? item.contentSnippet.slice(0, 200) : item.title,
            content,
            category: section,
            image,
            author: "Google News",
            publishedAt: new Date(item.isoDate || Date.now()),
            source: item.link,
            tags: [section, "Google News"]
          })
          if (ok) added++
        }
        console.log(`[Minimum Check] Added ${added} backup articles for ${section}`);
      }
    } catch (err) {
      console.warn(`Min articles check failed for ${section}:`, err);
    }
  }
}

// Legacy export kept for backward compat
export { fetchAllRedditFeeds as fetchRedditNews }
export { fetchAllRSSFeeds as fetchRSSFeeds }
