"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { TrendingUp, Clock, Eye, ArrowRight, Share2, User } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { SafeImage as Image } from "@/components/frontend/safe-image"
import Link from "next/link"
import { useSettings } from "@/lib/use-settings"
import { PremiumBadge } from "@/components/frontend/premium-badge"

export function TrendingSection() {
  const { theme } = useTheme()
  const isDark = theme !== "light"
  const { settings } = useSettings()
  const displayOptions = settings?.displayOptions || {
    thumbnails: true, readingTime: true, authorName: true, reduceAnimations: false
  }
  const layout = settings?.layout || "comfortable"

  const [trendingNews, setTrendingNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNews = () => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/news?limit=4`)
        .then((res) => {
          if (!res.ok) throw new Error("Fetch failed")
          return res.json()
        })
        .then((data) => {
          if (data.success && data.data) {
            const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500"]
            const formatted = data.data.map((item: any, idx: number) => ({
              id: item._id,
              category: item.category || "News",
              categoryColor: colors[idx % colors.length],
              title: item.title,
              excerpt: item.excerpt,
              image: item.image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop",
              time: new Date(item.publishedAt).toLocaleDateString(),
              views: item.views || 0,
              isBreaking: item.isBreaking || false,
              authorName: item.author?.name || "Fact Flow Staff",
              readingTime: Math.max(1, Math.ceil((item.excerpt?.length || 100) / 100)) + " min read",
              isPremium: item.isPremium || false,
            }))
            setTrendingNews(formatted)
          }
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
    fetchNews()

    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchNews, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="trending" className={`py-16 px-4 ${isDark ? "" : "bg-gray-50/50"}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-10"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/15 rounded-lg">
              <TrendingUp className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                Trending Now
              </h2>
              <p className={`text-sm ${isDark ? "text-white/[0.85]" : "text-gray-500"}`}>
                Most-read stories today
              </p>
            </div>
          </div>
          <Link href="/trending" className="flex items-center gap-1.5 text-purple-500 text-sm font-semibold hover:text-purple-400 transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Cards Grid */}
        <div className={`grid gap-6 transition-all duration-300 ${
          layout === "compact" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : 
          layout === "spacious" ? "grid-cols-1 max-w-4xl mx-auto" : 
          "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        }`}>
          {trendingNews.map((article, index) => (
            <Link href={`/article/${article.id}`} key={article.id} className="block group cursor-pointer">
              <motion.article
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className={`rounded-xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 flex ${
                  layout === "compact" ? "flex-row items-center min-h-[100px] p-3 gap-4" : 
                  layout === "spacious" ? "flex-col p-6 gap-5" : 
                  "flex-col h-full"
                } ${
                  isDark
                    ? "bg-white/5 border-white/10 hover:border-red-500/30 hover:bg-white/8"
                    : "bg-white border-gray-200 hover:border-red-300 shadow-sm hover:shadow-md"
                }`}
              >
                {/* Image (Conditionally Rendered based on settings) */}
                {displayOptions.thumbnails !== false && (
                  <div className={`relative overflow-hidden shrink-0 ${
                    layout === "compact" ? "w-20 h-20 rounded-md" : 
                    layout === "spacious" ? "w-full h-72 rounded-lg" : 
                    "w-full aspect-video"
                  }`}>
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className={`px-2.5 py-1 ${article.categoryColor} text-white text-xs font-semibold rounded-md`}>
                        {article.category}
                      </span>
{article.isPremium && <PremiumBadge size="sm" />}
                      {article.isBreaking && (
                        <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-semibold rounded-md animate-pulse">
                          Breaking
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Content */}
                <div className={`flex flex-col flex-1 ${layout !== "compact" ? "p-4" : ""}`}>
                  {displayOptions.thumbnails === false && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2.5 py-1 ${article.categoryColor} text-white text-xs font-semibold rounded-md`}>
                        {article.category}
                      </span>
{article.isPremium && <PremiumBadge size="sm" />}
                      {article.isBreaking && (
                        <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-semibold rounded-md animate-pulse">
                          Breaking
                        </span>
                      )}
                    </div>
                  )}
                  
                  <h3 className={`font-bold leading-snug mb-2 line-clamp-2 group-hover:text-red-500 transition-colors ${
                    layout === "compact" ? "text-sm" :
                    layout === "spacious" ? "text-2xl mt-2" :
                    "text-sm"
                  } ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}>
                    {article.title}
                  </h3>
                  

                  {layout !== "compact" && (
                    <p className={`leading-relaxed mb-4 line-clamp-2 ${
                      layout === "spacious" ? "text-sm" : "text-xs"
                    } ${isDark ? "text-white/55" : "text-gray-500"}`}>
                      {article.excerpt}
                    </p>
                  )}
                  
                  <div className="mt-auto">
                    <div className={`flex items-center flex-wrap gap-x-4 gap-y-2 text-xs ${layout !== "compact" ? "mb-4" : ""} ${isDark ? "text-white/[0.85]" : "text-gray-400"}`}>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {article.time}
                      </div>
                    </div>
                    
                    {layout !== "compact" && (
                      <div className={`pt-4 border-t ${isDark ? "border-white/10 text-red-400" : "border-gray-100 text-red-600"} font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all`}>
                        Read full news <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
