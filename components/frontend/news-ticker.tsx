"use client"

import { useState, useEffect, useRef } from "react"
import { useTheme } from "@/components/theme-provider"
import { useRouter } from "next/navigation"

interface TickerArticle {
  _id: string
  title: string
}

import { useRssStore } from "@/lib/rss/rssStore"

export function NewsTicker() {
  const { theme } = useTheme()
  const isDark = theme !== "light"
  const router = useRouter()
  const { items } = useRssStore()
  
  const articles = items.length > 0 ? items.slice(0, 15).map(item => ({ _id: item.id, title: item.title, link: item.link })) : []

  return (
    <div
      className={`relative border-y overflow-hidden ${
        isDark
          ? "bg-gradient-to-r from-red-950/40 via-black/60 to-red-950/40 border-red-500/20"
          : "bg-gradient-to-r from-red-50 via-white to-red-50 border-red-200"
      }`}
    >
      <div className="flex items-center">
        {/* LIVE badge - smaller on mobile */}
        <div className="shrink-0 px-2.5 sm:px-4 py-1.5 sm:py-2.5 bg-red-600 text-white font-black text-[10px] sm:text-xs tracking-widest z-10 uppercase flex items-center gap-1.5 sm:gap-2 shadow-lg">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse" />
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
                        className={`inline-flex items-center cursor-pointer px-3 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-colors hover:text-red-500 ${
                          isDark ? "text-white/85" : "text-gray-700"
                        }`}
                      >
                        🔥 {a.title}
                        <span className="mx-3 sm:mx-5 text-red-400/60">|</span>
                      </span>
                    ))
                  : (
                      <span className={`inline-block px-4 py-2 text-xs sm:text-sm ${isDark ? "text-white/[0.85]" : "text-gray-400"}`}>
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
          animation: ticker-move 12s linear infinite;
          -webkit-animation: ticker-move 12s linear infinite;
          will-change: transform;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
        }
        @media (min-width: 640px) {
          .ticker-scroll-wrapper {
            animation-duration: 18s;
            -webkit-animation-duration: 18s;
          }
        }
        .ticker-scroll-wrapper:hover {
          animation-play-state: paused;
          -webkit-animation-play-state: paused;
        }
        .ticker-scroll-inner {
          display: inline-flex;
          flex-shrink: 0;
        }
        @-webkit-keyframes ticker-move {
          from { -webkit-transform: translateX(0); transform: translateX(0); }
          to { -webkit-transform: translateX(-50%); transform: translateX(-50%); }
        }
        @keyframes ticker-move {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
