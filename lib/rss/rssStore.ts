import { create } from "zustand"
import Parser from "rss-parser"
import { useAuthStore } from "@/store/auth-store"
import { NEWS_SOURCES } from "./newsSources"

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
  tags?: string[]
  sections?: string[]
  upvotes?: number
}

interface RssState {
  items: RSSItem[]
  loading: boolean
  error: string | null
  lastFetched: number
  currentPage: number
  hasMore: boolean
  activeRegionCode: string
  activeCategory: string | null
  fetchNews: (force?: boolean, regionCode?: string, category?: string | null) => Promise<void>
  fetchNextPage: () => Promise<void>
  prependLiveArticles: (newArticles: RSSItem[]) => void
}

// GLOBAL FALLBACK FEEDS (to ensure no category is ever empty/hidden)
const GLOBAL_FALLBACK_FEEDS = [
  { url: "https://www.theartnewspaper.com/rss.xml", source: "The Art Newspaper", category: "Art", lang: "english" },
  { url: "https://hyperallergic.com/feed/", source: "Hyperallergic", category: "Art", lang: "english" },
  { url: "https://www.artnews.com/feed/", source: "ARTnews", category: "Art", lang: "english" },
  { url: "https://www.thisiscolossal.com/feed/", source: "Colossal", category: "Art", lang: "english" },
  { url: "https://www.vogue.com/feed/rss", source: "Vogue", category: "Lifestyle", lang: "english" },
  { url: "https://www.gq.com/feed/rss", source: "GQ", category: "Lifestyle", lang: "english" },
  { url: "https://www.architecturaldigest.com/feed/rss", source: "Architectural Digest", category: "Lifestyle", lang: "english" },
  { url: "https://techcrunch.com/feed/", source: "TechCrunch", category: "Tech", lang: "english" },
  { url: "https://www.skysports.com/rss/12040", source: "Sky Sports", category: "Sports", lang: "english" },
  { url: "http://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC News", category: "Politics", lang: "english" },
  { url: "https://www.aljazeera.com/xml/rss/all.xml", source: "Al Jazeera", category: "World", lang: "english" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml", source: "NY Times", category: "Politics", lang: "english" }
]
export const useRssStore = create<RssState>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  lastFetched: 0,
  currentPage: 1,
  hasMore: true,
  activeRegionCode: "IN",
  activeCategory: null,

  fetchNews: async (force = false, regionCode = "IN", category = null) => {
    const now = Date.now()
    // Don't refetch initial page if recently fetched, unless forced or category changed
    if (!force && now - get().lastFetched < 60000 && get().activeRegionCode === regionCode && get().activeCategory === category) return

    set({ loading: true, error: null, currentPage: 1, activeRegionCode: regionCode, activeCategory: category, items: [], hasMore: true })

    try {
      await get().fetchNextPage()
      set({ lastFetched: Date.now() })
    } catch (err: any) {
      set({ error: err.message, loading: false })
    }
  },

  fetchNextPage: async () => {
    if (get().loading && get().currentPage > 1) return // Prevent duplicate calls while loading next page
    if (!get().hasMore) return

    set({ loading: true })

    try {
      const page = get().currentPage;
      const regionCode = get().activeRegionCode;
      const category = get().activeCategory;
      
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

      let allItems: RSSItem[] = []
      
      const code = regionCode.toLowerCase();
      const regionKey = (code === "in" || code === "india") ? "india" 
        : ["us", "uk", "gb", "ca", "au", "fr", "de", "jp", "br", "ae", "za"].includes(code) ? (code === "gb" ? "uk" : code)
        : "global"

      let regionSources = NEWS_SOURCES[regionKey] || NEWS_SOURCES.global
      
      let activeLang = primaryLang;
      if (regionSources && !regionSources[activeLang]) {
        activeLang = Object.keys(regionSources)[0] || "english";
      }

      const catParam = category ? `&category=${encodeURIComponent(category)}` : ""

      // 1. Fetch from Unified Backend (Art, AI News, User articles)
      // Paginated with page and limit=20
      try {
        const apiRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/news?limit=20&page=${page}${catParam}&region=${regionCode}${uidParam}&language=${activeLang}`)
        if (apiRes.ok) {
          const apiData = await apiRes.json()
          if (apiData.success && apiData.data) {
            allItems.push(...apiData.data.map((item: any) => ({
              id: item._id,
              title: item.title,
              link: item.sourceUrl || `/news/${item._id}`,
              source: item.source || "FactFlow AI",
              author: item.author || "FactFlow",
              summary: item.excerpt || item.content || "",
              image: item.image || item.imageUrl || "",
              country: item.location || code.toUpperCase(),
              language: (item.language || "english").toLowerCase(),
              category: item.category || "General",
              sections: (item.sections && item.sections.length > 0) ? item.sections : [item.category || "General"],
              published: new Date(item.publishedAt),
              isPremium: item.isPremium || false
            })))
            
            // Set hasMore false if fewer than 20 items are returned
            if (apiData.data.length < 20) {
              set({ hasMore: false })
            }
          }
        }
      } catch (err) {
        console.warn("Backend fetch failed, relying entirely on RSS.")
      }

      const processItems = (rawItems: RSSItem[]) => {
        const uniqueItems = new Map<string, RSSItem>()
        for (const item of rawItems) {
          if (!item.title) continue
          if (!uniqueItems.has(item.title)) {
            uniqueItems.set(item.title, item)
          }
        }
        let filtered = Array.from(uniqueItems.values())
        return filtered.sort((a, b) => b.published.getTime() - a.published.getTime())
      }

      const processedNewItems = processItems(allItems)
      
      // Update store: Append new items to existing, do not replace
      set(state => {
        const existingIds = new Set(state.items.map(i => i.id))
        const uniqueNew = processedNewItems.filter(a => !existingIds.has(a.id))
        return { 
          items: [...state.items, ...uniqueNew],
          loading: false,
          currentPage: state.currentPage + 1
        }
      })

      // We only fetch external feeds ONCE on initial load (page 1) to supplement data if needed.
      // This is the fallback/supplemental RSS layer.
      if (page === 1) {
        const parser = new Parser({
          customFields: { item: [['media:content', 'mediaContent'], ['enclosure', 'enclosure']] }
        })
        const dynamicFeeds: any[] = []
        if (regionSources && regionSources[activeLang]) {
          for (const s of regionSources[activeLang]) {
            dynamicFeeds.push({ url: s.url, source: s.name, category: s.category, lang: activeLang })
          }
        }
        const finalFeeds = [...dynamicFeeds, ...GLOBAL_FALLBACK_FEEDS].sort(() => 0.5 - Math.random()).slice(0, 3)

        const fetchPromises = finalFeeds.map(async (feed) => {
          try {
            const res = await fetch(`/api/rss?url=${encodeURIComponent(feed.url)}`)
            if (!res.ok) return
            const data = await res.json()
            
            // Restored external fetch limit to 50
            const items = data.items.slice(0, 50).map((item: any) => {
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
                country: code.toUpperCase(),
                language: feed.lang,
                category: feed.category,
                published: new Date(item.pubDate || new Date())
              }
            })
            
            // Merge dynamically as they arrive
            set(state => {
              const currentIds = new Set(state.items.map(i => i.id))
              const newUnique = items.filter((i: any) => !currentIds.has(i.id))
              return { items: [...state.items, ...newUnique] }
            })
          } catch (e) {
          }
        })
        Promise.allSettled(fetchPromises)
      }

    } catch (err: any) {
      set({ error: err.message, loading: false })
    }
  },

  prependLiveArticles: (newArticles) => {
    set((state) => {
      const existingIds = new Set(state.items.map(i => i.id))
      const uniqueNew = newArticles.filter(a => !existingIds.has(a.id))
      
      if (uniqueNew.length === 0) return state;

      // Restored theoretical max items store to 1000
      const combined = [...uniqueNew, ...state.items].slice(0, 1000)
      return { items: combined }
    })
  }
}))
