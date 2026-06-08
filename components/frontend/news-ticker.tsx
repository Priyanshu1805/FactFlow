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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api/backend"}/news/ticker`)
        const data = await res.json()
        if (data.success && data.data) {
          const fetchedData = data.data
          let displayData = [...fetchedData]
          if (fetchedData.length > 0 && fetchedData.length < 15) {
             displayData = [...fetchedData, ...fetchedData, ...fetchedData, ...fetchedData, ...fetchedData]
          }
          setArticles(displayData)
        }
      } catch (err) {
        console.error("Failed to fetch ticker:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTicker()
    const interval = setInterval(fetchTicker, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading || articles.length === 0) return null

  return (
    <div
      id="factflow-smart-ticker"
      className={`relative overflow-hidden shadow-md w-full border-b ${
        isDark
          ? "bg-gradient-to-r from-red-950/60 via-black to-red-950/60 border-red-500/30"
          : "bg-gradient-to-r from-red-50 via-white to-red-50 border-red-200"
      }`}
    >
      <div className="flex items-stretch h-10 sm:h-12 w-full">
        {/* LIVE badge - Left aligned and fixed */}
        <div className="shrink-0 px-3 sm:px-5 flex items-center justify-center bg-red-600 text-white font-black text-[10px] sm:text-xs tracking-widest z-10 uppercase gap-1.5 sm:gap-2 shadow-[4px_0_15px_rgba(220,38,38,0.5)]">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse shadow-[0_0_8px_white]" />
          BREAKING
        </div>

        {/* Scrolling container */}
        <div className="overflow-hidden flex-1 relative flex items-center">
          <div className="ff-ticker-scroll-wrapper">
            {/* Duplicated blocks for a perfectly seamless infinite scroll loop */}
            {[0, 1].map((copy) => (
              <div key={copy} className="ff-ticker-scroll-inner">
                {articles.map((a, idx) => (
                  <div
                    key={`${copy}-${a._id}-${idx}`}
                    onClick={() => router.push(`/article/${a._id}`)}
                    className="inline-flex items-center cursor-pointer group whitespace-nowrap h-full"
                  >
                    <span className="mx-4 sm:mx-6 w-1.5 h-1.5 rounded-full bg-red-500/50" />
                    <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md mr-2 sm:mr-3 border ${
                      isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-200'
                    }`}>
                      {a.category || "News"}
                    </span>
                    <span className={`text-xs sm:text-sm font-semibold transition-colors duration-200 group-hover:text-red-500 ${
                      isDark ? "text-white/90" : "text-gray-800"
                    }`}>
                      {a.title}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        
        {/* Fade overlays for smooth entry/exit */}
        <div className={`absolute right-0 top-0 bottom-0 w-12 sm:w-24 z-10 pointer-events-none ${
          isDark ? 'bg-gradient-to-l from-black to-transparent' : 'bg-gradient-to-l from-white to-transparent'
        }`} />
      </div>

      <style>{`
        .ff-ticker-scroll-wrapper {
          display: flex;
          width: max-content;
          white-space: nowrap;
          /* Force animation using !important to bypass global reduce-motion blocks */
          animation: ff-ticker-move 120s linear infinite !important;
          will-change: transform;
        }
        @media (max-width: 640px) {
          .ff-ticker-scroll-wrapper {
            animation-duration: 95s !important;
          }
        }
        .ff-ticker-scroll-wrapper:hover,
        .ff-ticker-scroll-wrapper:active {
          animation-play-state: paused !important;
        }
        .ff-ticker-scroll-inner {
          display: flex;
          flex-shrink: 0;
          align-items: center;
          width: max-content;
        }
        @keyframes ff-ticker-move {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
