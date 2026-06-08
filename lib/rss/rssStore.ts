import { create } from "zustand"
import Parser from "rss-parser"
import { useAuthStore } from "@/store/auth-store"

export interface RSSItem {
  id: string
  title: string
  link: string
  source: string
  author?: string
  summary: string
  image: string
  country: string
  language: string
  category: string
  published: Date
  isPremium?: boolean
}

interface RssState {
  items: RSSItem[]
  loading: boolean
  error: string | null
  lastFetched: number
  fetchNews: (force?: boolean) => Promise<void>
}

// HYBRID CONFIG
const RSS_FEEDS = [
  { url: "https://www.thehindu.com/news/national/feeder/default.rss", source: "The Hindu", category: "Politics", lang: "english" },
  { url: "https://timesofindia.indiatimes.com/rssfeeds/4719148.cms", source: "TOI", category: "Sports", lang: "english" },
  { url: "https://timesofindia.indiatimes.com/rssfeeds/1081479906.cms", source: "Entertainment", category: "Entertainment", lang: "english" },
  { url: "https://timesofindia.indiatimes.com/rssfeeds/66949542.cms", source: "Tech", category: "Technology", lang: "english" },
  { url: "https://techcrunch.com/feed/", source: "TechCrunch", category: "Technology", lang: "english" },
  { url: "https://www.reddit.com/r/memes/top/.rss?t=day", source: "r/memes", category: "Memes", lang: "english" },
  { url: "https://www.reddit.com/r/dankmemes/top/.rss?t=day", source: "r/dankmemes", category: "Memes", lang: "english" },
  { url: "https://www.reddit.com/r/ProgrammerHumor/top/.rss?t=day", source: "r/ProgrammerHumor", category: "Memes", lang: "english" },
  { url: "https://knowyourmeme.com/news/feed", source: "KnowYourMeme", category: "Memes", lang: "english" },
  { url: "https://thechive.com/feed/", source: "The Chive", category: "Memes", lang: "english" }
]

export const useRssStore = create<RssState>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  lastFetched: 0,

  fetchNews: async (force = false) => {
    const now = Date.now()
    if (!force && now - get().lastFetched < 60000) return

    set({ loading: true, error: null })

    try {
      // 1. Language Preference
      let savedLanguages = ["english"]
      let contentPrefs: any = null
      
      try {
        const feedLangs = localStorage.getItem("ff_newsfeed_newsLanguages")
        const globalLangs = localStorage.getItem("ff_news_languages")
        if (globalLangs) {
          savedLanguages = JSON.parse(globalLangs).map((l: string) => l.toLowerCase())
        } else if (feedLangs) {
          savedLanguages = JSON.parse(feedLangs).map((l: string) => l.toLowerCase())
        }
      } catch { /* ignore */ }
      const primaryLang = savedLanguages[0] || "english"

      const uid = useAuthStore.getState().user?.uid
      const uidParam = uid ? `&firebaseUid=${uid}` : ''

      if (uid) {
        try {
          const prefRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/users/settings/${uid}`)
          if (prefRes.ok) {
            const prefData = await prefRes.json()
            if (prefData.success && prefData.settings?.content) {
              contentPrefs = prefData.settings.content
            }
          }
        } catch(e) {}
      }

      let allItems: RSSItem[] = []

      // 2. Fetch from Unified Backend (Memes, AI News, User articles)
      try {
        const apiRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/news?limit=300${uidParam}`)
        if (apiRes.ok) {
          const apiData = await apiRes.json()
          if (apiData.success && apiData.data) {
            // Ensure memes are fetched if they aren't in the top 300
            const memeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/news?category=Memes&limit=50${uidParam}`).catch(() => null)
            if (memeRes && memeRes.ok) {
               const memeData = await memeRes.json()
               if (memeData.success && memeData.data) {
                 apiData.data = [...apiData.data, ...memeData.data]
               }
            }
            allItems.push(...apiData.data.map((item: any) => ({
              id: item._id,
              title: item.title,
              link: item.sourceUrl || `/news/${item._id}`,
              source: item.source || "FactFlow AI",
              author: item.author || "FactFlow",
              summary: item.excerpt || item.content || "",
              image: item.imageUrl || "",
              country: "india",
              language: (item.language || "english").toLowerCase(),
              category: item.category || "General",
              published: new Date(item.publishedAt),
              isPremium: item.isPremium || false
            })))
          }
        }
      } catch (err) {
        console.warn("Backend fetch failed, relying entirely on RSS.")
      }

      // 3. Fetch from External RSS Feeds (High Volume Fallback)
      // We use proxy to bypass CORS
      const parser = new Parser({
        customFields: { item: [['media:content', 'mediaContent'], ['enclosure', 'enclosure']] }
      })
      
      const fetchPromises = RSS_FEEDS.map(async (feed) => {
        try {
          const res = await fetch(`/api/rss?url=${encodeURIComponent(feed.url)}`)
          if (!res.ok) return
          const data = await res.json()
          
          const items = data.items.slice(0, 30).map((item: any) => {
            let imageUrl = ""
            if (item.enclosure?.url) imageUrl = item.enclosure.url
            else if (item.mediaContent?.$?.url) imageUrl = item.mediaContent.$.url
            else {
              const match = item.content?.match(/<img[^>]+src="([^">]+)"/)
              if (match) imageUrl = match[1]
            }

            return {
              id: item.guid || item.link || Math.random().toString(),
              title: item.title || "",
              link: item.link || "",
              source: feed.source,
              author: feed.source,
              summary: item.contentSnippet || item.content || "",
              image: imageUrl,
              country: "india",
              language: feed.lang,
              category: feed.category,
              published: new Date(item.pubDate || new Date())
            }
          })
          allItems.push(...items)
        } catch (e) {
          // Ignore individual feed failures
        }
      })

      await Promise.allSettled(fetchPromises)

      // 4. Filter, Deduplicate, and Sort
      const uniqueItems = new Map<string, RSSItem>()
      for (const item of allItems) {
        if (!item.title) continue
        
        // Apply Client-Side Content Filters for External RSS
        if (contentPrefs) {
          const { mutedKeywords = [], hiddenPublishers = [] } = contentPrefs
          let isHidden = false
          
          if (hiddenPublishers.length > 0) {
            const isHiddenPub = hiddenPublishers.some((p: string) => 
              item.source?.toLowerCase().includes(p.toLowerCase()) || 
              item.author?.toLowerCase().includes(p.toLowerCase())
            )
            if (isHiddenPub) isHidden = true
          }
          
          if (!isHidden && mutedKeywords.length > 0) {
            const hasMutedWord = mutedKeywords.some((kw: string) => 
              item.title.toLowerCase().includes(kw.toLowerCase()) || 
              item.summary?.toLowerCase().includes(kw.toLowerCase())
            )
            if (hasMutedWord) isHidden = true
          }
          
          if (isHidden) continue
        }

        // simple deduplication by title
        if (!uniqueItems.has(item.title)) {
          uniqueItems.set(item.title, item)
        }
      }
      allItems = Array.from(uniqueItems.values())

      // Lang priority sorting
      if (primaryLang && primaryLang !== "english") {
        const localItems = allItems.filter(item => item.language === primaryLang)
        if (localItems.length > 0) {
          allItems = [...localItems, ...allItems.filter(item => item.language !== primaryLang)]
        }
      }

      allItems = allItems.filter(item => item.language.toLowerCase() === "english")
      allItems.sort((a, b) => b.published.getTime() - a.published.getTime())

      set({ items: allItems, loading: false, lastFetched: now })
    } catch (err: any) {
      set({ error: err.message, loading: false })
    }
  },
}))
