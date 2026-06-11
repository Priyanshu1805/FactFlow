"use client"

import { useState, useEffect, useRef } from "react"
import { useTheme } from "@/components/theme-provider"
import { useRouter } from "next/navigation"

interface TickerArticle {
  _id: string
  title: string
  category: string
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
        const res = await fetch(`/api/rss?url=${encodeURIComponent("http://feeds.bbci.co.uk/news/world/rss.xml")}`)
        const data = await res.json()
        if (data.items && data.items.length > 0) {
          const fetchedData = data.items.slice(0, 20).map((item: any) => ({
            _id: item.link || Math.random().toString(),
            title: item.title,
            category: item.categories?.[0] || "World",
            link: item.link
          }))
          
          let displayData = [...fetchedData]
          if (fetchedData.length > 0 && fetchedData.length < 15) {
             displayData = [...fetchedData, ...fetchedData, ...fetchedData, ...fetchedData, ...fetchedData]
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
    <div className={`flex items-center h-10 w-full overflow-hidden shadow-md border-b ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"}`}>
      {/* Badge */}
      <div className="shrink-0 h-full flex items-center justify-center px-4 bg-red-600 text-white font-bold text-xs uppercase tracking-wider z-10 relative shadow-[4px_0_10px_rgba(0,0,0,0.1)]">
        <span className="w-2 h-2 bg-white rounded-full animate-pulse mr-2" />
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
            animation: ticker-scroll 120s linear infinite;
          }
          .ticker-track:hover {
            animation-play-state: paused;
          }
        `}</style>
        <div className="ticker-track">
          {/* Duplicate items for seamless loop */}
          {[...articles, ...articles].map((a, idx) => (
            <span key={a._id + idx} className="inline-flex items-center mx-4 whitespace-nowrap">
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mr-2 ${
                isDark ? "bg-zinc-800 text-red-400" : "bg-gray-100 text-red-600"
              }`}>
                {a.category || "News"}
              </span>
              <span
                onClick={() => {
                  if (a.link) window.open(a.link, '_blank')
                  else router.push(`/article/${a._id}`)
                }}
                className={`text-sm font-medium cursor-pointer hover:underline ${
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
