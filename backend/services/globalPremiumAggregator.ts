import Parser from "rss-parser"
import * as cheerio from "cheerio"
import axios from "axios"
import { NewsArticle } from "../models/NewsArticle"
import { getSocket } from "./pushService"
import { createBulkNotifications } from "./notificationService"
import { isClickbait, extractEntities, processSmartArticle } from "../utils/smartNewsUtils"

const parser = new Parser({
  timeout: 10000,
  customFields: {
    item: ['media:content', 'media:thumbnail', 'enclosure', 'content:encoded', 'og:image']
  }
})

// 50+ Premium Global & Indian Sources categorized strictly into our 6 frontend categories
const PREMIUM_FEEDS = [
  // ── POLITICS (Global & India) ──
  { url: "https://feeds.bbci.co.uk/news/politics/rss.xml", category: "Politics", source: "BBC" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml", category: "Politics", source: "NYT" },
  { url: "https://feeds.reuters.com/reuters/politicsNews", category: "Politics", source: "Reuters" },
  { url: "https://www.theguardian.com/politics/rss", category: "Politics", source: "The Guardian" },
  { url: "https://www.aljazeera.com/xml/rss/all.xml", category: "Politics", source: "Al Jazeera" },
  { url: "https://indianexpress.com/section/political-pulse/feed/", category: "Politics", source: "Indian Express" },
  { url: "https://feeds.feedburner.com/ndtvnews-india-news", category: "Politics", source: "NDTV" },
  { url: "https://www.thehindu.com/news/national/feeder/default.rss", category: "Politics", source: "The Hindu" },
  { url: "https://www.news18.com/rss/politics.xml", category: "Politics", source: "News18" },
  { url: "https://www.firstpost.com/rss/politics.xml", category: "Politics", source: "Firstpost" },

  // ── TRENDING (Breaking / World / India Top News) ──
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml", category: "Trending", source: "BBC" },
  { url: "https://feeds.reuters.com/reuters/topNews", category: "Trending", source: "Reuters" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml", category: "Trending", source: "NYT" },
  { url: "https://www.yahoo.com/news/rss", category: "Trending", source: "Yahoo News" },
  { url: "https://www.buzzfeednews.com/news.xml", category: "Trending", source: "BuzzFeed" },
  { url: "https://www.thehindu.com/news/feeder/default.rss", category: "Trending", source: "The Hindu" },
  { url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms", category: "Trending", source: "Times of India" },
  { url: "https://www.news18.com/rss/india.xml", category: "Trending", source: "News18" },
  { url: "https://www.firstpost.com/rss/india.xml", category: "Trending", source: "Firstpost" },
  { url: "https://api.foxnews.com/v1/rss/news", category: "Trending", source: "Fox News" },

  // ── LIFESTYLE & ENTERTAINMENT ──
  { url: "https://www.vogue.com/feed/rss", category: "Lifestyle", source: "Vogue" },
  { url: "https://www.gq.com/feed/rss", category: "Lifestyle", source: "GQ" },
  { url: "https://www.vanityfair.com/feed/rss", category: "Lifestyle", source: "Vanity Fair" },
  { url: "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml", category: "Lifestyle", source: "BBC" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/Style.xml", category: "Lifestyle", source: "NYT" },
  { url: "https://www.theguardian.com/uk/lifeandstyle/rss", category: "Lifestyle", source: "The Guardian" },
  { url: "https://timesofindia.indiatimes.com/rssfeeds/2886704.cms", category: "Lifestyle", source: "Times of India" },
  { url: "https://www.hindustantimes.com/feeds/rss/lifestyle/rssfeed.xml", category: "Lifestyle", source: "Hindustan Times" },
  { url: "https://indianexpress.com/section/lifestyle/feed/", category: "Lifestyle", source: "Indian Express" },
  { url: "https://www.news18.com/rss/lifestyle.xml", category: "Lifestyle", source: "News18" },

  // ── SPORTS ──
  { url: "https://feeds.bbci.co.uk/sport/rss.xml", category: "Sports", source: "BBC Sports" },
  { url: "https://www.espn.com/espn/rss/news", category: "Sports", source: "ESPN" },
  { url: "https://www.skysports.com/rss/12040", category: "Sports", source: "Sky Sports" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml", category: "Sports", source: "NYT" },
  { url: "https://www.theguardian.com/uk/sport/rss", category: "Sports", source: "The Guardian" },
  { url: "https://sports.yahoo.com/rss/", category: "Sports", source: "Yahoo Sports" },
  { url: "https://timesofindia.indiatimes.com/rssfeeds/4719148.cms", category: "Sports", source: "Times of India" },
  { url: "https://www.hindustantimes.com/feeds/rss/sports/rssfeed.xml", category: "Sports", source: "Hindustan Times" },
  { url: "https://www.news18.com/rss/sports.xml", category: "Sports", source: "News18" },
  { url: "https://indianexpress.com/section/sports/feed/", category: "Sports", source: "Indian Express" },

  // ── TECH ──
  { url: "https://techcrunch.com/feed/", category: "Tech", source: "TechCrunch" },
  { url: "https://www.theverge.com/rss/index.xml", category: "Tech", source: "The Verge" },
  { url: "https://www.wired.com/feed/rss", category: "Tech", source: "Wired" },
  { url: "https://feeds.arstechnica.com/arstechnica/index", category: "Tech", source: "Ars Technica" },
  { url: "https://www.cnet.com/rss/news/", category: "Tech", source: "CNET" },
  { url: "https://mashable.com/feeds/rss/tech", category: "Tech", source: "Mashable" },
  { url: "https://feeds.bbci.co.uk/news/technology/rss.xml", category: "Tech", source: "BBC" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml", category: "Tech", source: "NYT" },
  { url: "https://timesofindia.indiatimes.com/rssfeeds/5880659.cms", category: "Tech", source: "Times of India" },
  { url: "https://www.firstpost.com/rss/tech.xml", category: "Tech", source: "Firstpost" },

  // ── ART ──
  { url: "https://www.artnews.com/feed/", category: "Art", source: "ARTnews" },
  { url: "https://hyperallergic.com/feed/", category: "Art", source: "Hyperallergic" },
  { url: "https://www.thisiscolossal.com/feed/", category: "Art", source: "Colossal" },
  { url: "https://artforum.com/feed/", category: "Art", source: "Artforum" },
  { url: "https://www.juxtapoz.com/news/?format=feed&type=rss", category: "Art", source: "Juxtapoz" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/Arts.xml", category: "Art", source: "NYT" },
  { url: "https://www.theguardian.com/artanddesign/rss", category: "Art", source: "The Guardian" },
  { url: "https://www.itsnicethat.com/feeds/articles", category: "Art", source: "It's Nice That" }
]

// Fallback images strictly mapped to our 6 categories to guarantee a beautiful UI
const PREMIUM_FALLBACK_IMAGES: Record<string, string> = {
  Politics: "https://images.unsplash.com/photo-1529107386315-e1c731f2ca75?w=1200&q=80",
  Trending: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80",
  Lifestyle: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80",
  Sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&q=80",
  Tech: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80",
  Art: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1200&q=80"
}

// Very fast HTML scraper to find images if RSS misses them
async function extractImageFromUrl(url: string): Promise<string | null> {
  if (!url || !url.startsWith("http")) return null
  try {
    const res = await axios.get(url, {
      headers: { "User-Agent": "FactFlow Premium Aggregator Bot" },
      timeout: 5000,
    })
    const $ = cheerio.load(res.data)
    const ogImage = $('meta[property="og:image"]').attr("content") || $('meta[name="twitter:image"]').attr("content")
    return ogImage || null
  } catch {
    return null
  }
}

// Main execution function
export async function runGlobalPremiumAggregator(): Promise<void> {
  console.log(`\n🚀 [GLOBAL PREMIUM AGGREGATOR] Starting massive fetch from ${PREMIUM_FEEDS.length} premium sources...`)
  
  let totalAdded = 0
  const fetchPromises = PREMIUM_FEEDS.map(async (feed) => {
    try {
      const parsed = await parser.parseURL(feed.url)
      let addedForFeed = 0
      
      // Grab only the 5 most recent articles per feed to ensure fast execution
      for (const item of (parsed.items || []).slice(0, 5)) {
        if (!item.title || item.title.length < 15) continue

        // 🧠 1. CLICKBAIT FILTER
        if (isClickbait(item.title)) {
          console.log(`🛡️  [Smart Filter] Rejected clickbait: "${item.title}"`)
          continue
        }

        // Fast title deduplication check
        const exists = await NewsArticle.exists({ title: item.title })
        if (exists) continue

        let excerpt = item.contentSnippet || item.content || item.title
        excerpt = excerpt.replace(/<[^>]*>?/gm, '').slice(0, 300)

        // 🧠 2. FUZZY DUPLICATE & VIRAL VELOCITY DETECTION
        const { isDuplicate, promoteToBreaking } = await processSmartArticle(item.title, excerpt, feed.category)
        if (isDuplicate) {
          console.log(`🧠 [Smart Merge] Skipped duplicate article: "${item.title}"`)
          continue
        }

        // 1. Try to extract image from RSS metadata
        let image = null
        if (item['media:content'] && item['media:content']['$'] && item['media:content']['$'].url) {
          image = item['media:content']['$'].url
        } else if (item.enclosure && item.enclosure.url && item.enclosure.type?.startsWith('image/')) {
          image = item.enclosure.url
        }
        
        // 2. If no image in RSS, quickly scrape the OG:Image from the URL
        if (!image && item.link) {
          image = await extractImageFromUrl(item.link)
        }

        // 3. Absolute fallback to guarantee UI aesthetic
        if (!image) {
          image = PREMIUM_FALLBACK_IMAGES[feed.category]
        }

        // 🧠 3. SMART ENTITY EXTRACTION
        const smartTags = extractEntities(item.title + " " + excerpt)
        const finalTags = Array.from(new Set([feed.category, "Premium", feed.source.replace(" ", ""), ...smartTags]))

        // Save immediately to DB
        const article = await NewsArticle.create({
          title: item.title,
          excerpt,
          content: excerpt + "\n\n(Read the full story on the original source).",
          category: feed.category,
          image,
          author: feed.source,
          source: item.link || feed.url,
          publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
          tags: finalTags,
          isPremium: true,
          isBreaking: promoteToBreaking // 🧠 Auto-promoted based on viral velocity
        })

        // Instantly emit to frontend live users
        const io = getSocket()
        if (io) {
          io.emit("new_article", article)
        }

        // 🧠 4. AUTO BREAKING NEWS NOTIFICATION
        if (promoteToBreaking) {
          console.log(`🚨 [VIRAL VELOCITY] Auto-Promoted to BREAKING: "${article.title}"`)
          
          try {
            const { NotificationPrefs } = await import("../models/NotificationPrefs")
            const prefs = await NotificationPrefs.find({ breakingNews: true }).lean()
            if (prefs.length > 0) {
              const userIds = prefs.map((p: any) => p.userId.toString())
              await createBulkNotifications(userIds, {
                type: "breaking_news",
                title: "🚨 Breaking News",
                message: `This story is currently going viral across multiple global sources! ${article.title}`,
                link: `/article/${article._id}`,
                articleId: article._id.toString()
              })
            }
          } catch (err) {
            console.warn("Failed to send breaking news notifications:", err)
          }
        }

        addedForFeed++
        totalAdded++
      }
      
      if (addedForFeed > 0) {
        console.log(`✅ [${feed.category}] ${feed.source}: +${addedForFeed} stories`)
      }
    } catch (e: any) {
      // Silently catch dead links to prevent crash
    }
  })

  // Run all feeds in parallel for maximum speed
  await Promise.all(fetchPromises)
  
  console.log(`🏁 [GLOBAL PREMIUM AGGREGATOR] Finished. Total fresh stories added: ${totalAdded}\n`)
}
