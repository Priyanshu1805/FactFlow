"use client"

import { useState, useEffect, useRef } from "react"
import { useTheme } from "@/components/theme-provider"
import { useRouter } from "next/navigation"

interface TickerArticle {
  _id: string
  title: string
}

export function NewsTicker() {
  const { theme } = useTheme()
  const isDark = theme !== "light"
  const router = useRouter()
  const [articles, setArticles] = useState<TickerArticle[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number | null>(null)
  const posRef = useRef(0)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/news?limit=20`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.length) setArticles(d.data)
      })
      .catch(() => {})
  }, [])

  // CSS-based marquee animation (smooth, no JS jank)
  const tickerText = articles.length
    ? articles.map((a) => `🔥 ${a.title}`).join("   ·   ")
    : "🔥 Loading latest news from around the world..."

  return (
    <div
      className={`relative border-y overflow-hidden ${
        isDark
          ? "bg-gradient-to-r from-red-950/40 via-black/60 to-red-950/40 border-red-500/20"
          : "bg-gradient-to-r from-red-50 via-white to-red-50 border-red-200"
      }`}
    >
      <div className="flex items-center">
        {/* LIVE badge */}
        <div className="shrink-0 px-4 py-2.5 bg-red-600 text-white font-black text-xs tracking-widest z-10 uppercase flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          LIVE
        </div>

        {/* Scrolling container */}
        <div className="overflow-hidden flex-1 relative">
          <div className="ticker-scroll-wrapper">
            {/* Duplicated for seamless loop */}
            {[0, 1].map((copy) => (
              <span key={copy} className="ticker-scroll-inner">
                {articles.length > 0
                  ? articles.map((a, idx) => (
                      <span
                        key={`${copy}-${a._id}`}
                        onClick={() => router.push(`/article/${a._id}`)}
                        className={`inline-flex items-center cursor-pointer px-6 py-2.5 text-sm font-medium transition-colors hover:text-red-500 ${
                          isDark ? "text-white/85" : "text-gray-700"
                        }`}
                      >
                        🔥 {a.title}
                        <span className="mx-5 text-red-400/60">|</span>
                      </span>
                    ))
                  : (
                      <span className={`inline-block px-6 py-2.5 text-sm ${isDark ? "text-white/[0.85]" : "text-gray-400"}`}>
                        Loading latest news...
                      </span>
                    )}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .ticker-scroll-wrapper {
          display: flex;
          white-space: nowrap;
          animation: ticker-move 60s linear infinite;
        }
        .ticker-scroll-wrapper:hover {
          animation-play-state: paused;
        }
        .ticker-scroll-inner {
          display: inline-flex;
          flex-shrink: 0;
        }
        @keyframes ticker-move {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
