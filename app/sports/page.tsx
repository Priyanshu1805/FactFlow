"use client"

import { useTheme } from "@/components/theme-provider"
import { useRssStore } from "@/lib/rss/rssStore"
import { useAuthStore } from "@/store/auth-store"
import { Trophy, Heart } from "lucide-react"
import { SafeImage as Image } from "@/components/frontend/safe-image"
import Link from "next/link"
import { useEffect, useState, useMemo, useRef } from "react"
import { BackButton } from "@/components/frontend/back-button"

export default function SportsPage() {
  const { theme } = useTheme()
  const isDark = theme !== "light"
  const { items: rssItems, fetchNextPage, hasMore, fetchNews } = useRssStore()
  const [loading, setLoading] = useState(true)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchNews(false, "IN", "Sports").then(() => setLoading(false)).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )
    if (sentinelRef.current) observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, fetchNextPage])

  const sportsItems = useMemo(() => {
    const fallbacks = [
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&h=400&fit=crop"
    ]
    
    return rssItems
      .filter(item => item.category === "Sports")
      .map((item, i) => ({
        ...item,
        image: (!item.image || item.image.trim() === "") ? fallbacks[i % fallbacks.length] : item.image
      }))
      .sort((a, b) => {
        const aReal = a.image && !a.image.includes('unsplash.com') && !a.image.includes('pollinations.ai');
        const bReal = b.image && !b.image.includes('unsplash.com') && !b.image.includes('pollinations.ai');
        if (aReal && !bReal) return -1;
        if (!aReal && bReal) return 1;
        return new Date(b.published).getTime() - new Date(a.published).getTime();
      })
  }, [rssItems])

  return (
    <div className={`min-h-screen pt-20 pb-12 ${isDark ? "bg-[#0a0a0a]" : "bg-white"}`}>
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-zinc-200 dark:border-zinc-800 pb-8">
          <div>
            <BackButton className="mb-6" />
            <div className="flex items-center gap-4">
              <div className={`p-4 bg-zinc-100 dark:bg-zinc-900`}>
                <Trophy className={`w-8 h-8 text-zinc-900 dark:text-zinc-100`} />
              </div>
              <div>
                <h1 className={`text-4xl md:text-5xl font-serif tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>
                  Global Sports
                </h1>
                <p className={`mt-2 text-lg font-serif italic ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                  The latest updates from the world of athletics, competitions, and teams
                </p>
              </div>
            </div>
          </div>
        </div>

        {loading && sportsItems.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse">
                <div className={`w-full h-64 ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`}></div>
                <div className={`h-6 mt-4 w-3/4 ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`}></div>
                <div className={`h-4 mt-2 w-1/2 ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`}></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {sportsItems.map((article, idx) => (
              <Link 
                key={article.id} 
                href={`/article/${article.id}`}
                className="group flex flex-col"
              >
                <div className="relative w-full h-64 overflow-hidden mb-5">
                  <Image 
                    src={article.image || ""} 
                    alt={article.title} 
                    fill 
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                </div>
                
                <div className="flex flex-col flex-1">
                  <div className="mb-3">
                    <span className="text-red-600 dark:text-red-500 text-xs font-sans font-bold uppercase tracking-widest">
                      {article.tags?.[0] || article.category || "Sports"}
                    </span>
                  </div>

                  <h2 className={`text-2xl font-serif leading-tight mb-3 transition-colors duration-300 ${isDark ? "text-zinc-100 group-hover:text-white" : "text-zinc-900 group-hover:text-black"}`}>
                    {article.title}
                  </h2>
                  
                  <p className={`font-sans font-light line-clamp-3 mb-6 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                    {article.summary}
                  </p>

                  <div className={`mt-auto pt-4 border-t ${isDark ? "border-zinc-800 text-zinc-500" : "border-zinc-200 text-zinc-500"} flex items-center justify-between text-xs font-sans uppercase tracking-widest`}>
                    <span>{new Date(article.published).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
                         <Heart className="w-4 h-4" /> 
                         <span>{article.upvotes || 0}</span>
                       </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {!loading && sportsItems.length === 0 && (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
            <h3 className="text-xl font-serif text-zinc-900 dark:text-zinc-100">No stories found</h3>
            <p className="text-zinc-500 mt-2 font-sans">Check back later for more sports updates.</p>
          </div>
        )}

        {/* Sentinel div for infinite scroll */}
        <div ref={sentinelRef} className="py-10 text-center">
          {hasMore ? (
            <div className="inline-block w-8 h-8 border-4 border-zinc-200 border-t-red-500 rounded-full animate-spin"></div>
          ) : (
            sportsItems.length > 0 && <p className="text-zinc-500 font-sans">You're all caught up!</p>
          )}
        </div>
      </div>
    </div>
  )
}
