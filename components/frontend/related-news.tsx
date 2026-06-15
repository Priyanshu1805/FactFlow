"use client"
import { useAuthStore } from "@/store/auth-store";


import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useTheme } from "@/components/theme-provider"
import { SafeImage as Image } from "@/components/frontend/safe-image"
import Link from "next/link"
import { PremiumBadge } from "@/components/frontend/premium-badge"

export function RelatedNews({ currentCategory, currentArticleId }: { currentCategory: string, currentArticleId: string }) {
  const { theme } = useTheme()
  const isDark = theme !== "light"
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch related news (limit 7 to ensure we have 6 after filtering out the current article)
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/news?category=${currentCategory}&limit=7&${useAuthStore.getState().user?.uid ? 'firebaseUid=' + useAuthStore.getState().user?.uid : ''}`)
      .then((res) => {
        if (!res.ok) throw new Error("Fetch failed")
        return res.json()
      })
      .then((data) => {
        if (data.success && data.data) {
          const filtered = data.data
            .filter((item: any) => item._id !== currentArticleId)
            .slice(0, 6) // take exactly 6 related articles
          
          setNews(filtered)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [currentCategory, currentArticleId])

  if (loading || news.length === 0) return null

  return (
    <div className={`mt-12 pt-10 border-t ${isDark ? "border-white/10" : "border-gray-200"}`}>
      <h3 className={`text-xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>
        Related News in {currentCategory}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((article, idx) => (
          <Link href={`/article/${article._id}`} key={article._id} className="block group">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`flex flex-col h-full rounded-xl overflow-hidden border transition-all duration-300 ${
                isDark 
                  ? "bg-white/5 border-white/10 hover:border-red-500/30 hover:bg-white/10" 
                  : "bg-white border-gray-200 hover:shadow-lg"
              }`}
            >
              <div className="relative aspect-video overflow-hidden">
                <Image 
                  src={article.image || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop"} 
                  alt={article.title} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
              <div className="p-4 flex flex-col flex-grow">
                {article.isPremium && <PremiumBadge size="sm" className="mb-1.5" />}
                <h4 className={`font-bold text-sm leading-snug line-clamp-2 mb-2 group-hover:text-red-500 transition-colors ${
                  isDark ? "text-white" : "text-gray-900"
                }`}>
                  {article.title}
                </h4>
                <div className="mt-auto flex items-center justify-between text-xs">
                  <span className={isDark ? "text-white/50" : "text-gray-500"}>
                    {new Date(article.publishedAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
                  </span>
                  <span className={`font-semibold ${isDark ? "text-white/80" : "text-gray-700"}`}>
                    {Number(article.views || 0).toLocaleString("en-IN")} views
                  </span>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  )
}
