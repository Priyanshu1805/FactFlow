"use client"

import { useState, useEffect, useRef } from "react"
import { useTheme } from "@/components/theme-provider"
import { useRouter } from "next/navigation"

interface TickerArticle {
  _id: string
  title: string
  category: string
  link?: string
}

export function NewsTicker() {
  const { theme } = useTheme()
  const isDark = theme !== "light"
  const router = useRouter()
  const [articles, setArticles] = useState<TickerArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTicker = async () => {
      try {
        let localNews: any[] = []
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api"
          const dbRes = await fetch(`${baseUrl}/news?limit=15`)
          const dbData = await dbRes.json()
          if (dbData.data) {
            localNews = dbData.data
              .filter((item: any) => {
                const itemSections = (item.sections && item.sections.length > 0) ? item.sections : [item.category];
                return item.isBreaking || itemSections.includes("Live");
              })
              .map((item: any) => ({
                _id: item._id,
                title: item.title,
                category: "Live",
                link: `/article/${item._id}`
              }))
          }
        } catch (e) {
          console.error("Local ticker fetch failed", e)
        }

        const res = await fetch(`/api/rss?url=${encodeURIComponent("http://feeds.bbci.co.uk/news/world/rss.xml")}`)
        const data = await res.json()
        let fetchedData: any[] = []
        if (data.items && data.items.length > 0) {
          fetchedData = data.items.slice(0, 20).map((item: any) => ({
            _id: item.link || Math.random().toString(),
            title: item.title,
            category: item.categories?.[0] || "World",
            link: item.link
          }))
        }
        
        const combined = [...localNews, ...fetchedData]
        if (combined.length > 0) {
          let displayData = [...combined]
          if (combined.length > 0 && combined.length < 15) {
             displayData = [...combined, ...combined, ...combined, ...combined, ...combined]
          }
          setArticles(displayData)
        }
      } catch (err) {
        // Silent fallback
      } finally {
        setIsLoading(false)
      }
    }
    fetchTicker()
    const interval = setInterval(fetchTicker, 30 * 60 * 1000) // 30 minutes
    return () => clearInterval(interval)
  }, [])

  if (isLoading || articles.length === 0) return null

  return (
    <div className={`flex items-center h-7 w-full overflow-hidden shadow-sm border-b ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"}`}>
      {/* Badge */}
      <div className="shrink-0 h-full flex items-center justify-center px-3 bg-red-600 text-white font-bold text-[10px] uppercase tracking-wider z-10 relative shadow-[4px_0_10px_rgba(0,0,0,0.1)]">
        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse mr-1.5" />
        Breaking
      </div>

      {/* Ticker Text — CSS animation replacing deprecated <marquee> */}
      <div className="flex-1 overflow-hidden relative flex items-center h-full">
        <style>{`
          @keyframes ticker-scroll {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .ticker-track {
            display: flex;
            width: max-content;
            animation: ticker-scroll 45s linear infinite;
          }
          .ticker-track:hover {
            animation-play-state: paused;
          }
        `}</style>
        <div className="ticker-track">
          {/* Duplicate items for seamless loop */}
          {[...articles, ...articles].map((a, idx) => (
            <span key={a._id ? `${a._id}-${idx}` : `ticker-${idx}`} className="inline-flex items-center mx-4 whitespace-nowrap">
              <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mr-2 ${
                isDark ? "bg-zinc-800 text-red-400" : "bg-gray-100 text-red-600"
              }`}>
                {a.category || "News"}
              </span>
              <span
                onClick={() => {
                  if (a.link) window.open(a.link, '_blank')
                  else router.push(`/article/${a._id}`)
                }}
                className={`text-xs font-medium cursor-pointer hover:underline ${
                  isDark ? "text-gray-200 hover:text-white" : "text-gray-800 hover:text-black"
                }`}
              >
                {a.title}
              </span>
              <span className={`mx-4 text-xl ${isDark ? "text-zinc-700" : "text-gray-300"}`}>•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
