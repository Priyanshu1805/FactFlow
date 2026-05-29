"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { TrendingUp, Clock, Eye, ArrowLeft } from "lucide-react"
import { SafeImage as Image } from "@/components/frontend/safe-image"
import Link from "next/link"
import { useTheme } from "@/components/theme-provider"
import { PageShell } from "@/components/frontend/page-shell"

export default function TrendingPage() {
  const { theme } = useTheme()
  const isDark = theme !== "light"
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/news?limit=50&sort=views`)
      .then((res) => {
        if (!res.ok) throw new Error("Fetch failed")
        return res.json()
      })
      .then((data) => {
        if (data.success && data.data) {
          setNews(data.data)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <PageShell className={`min-h-screen ${isDark ? "bg-black" : "bg-gray-50"}`}>
      <main className="pt-24 pb-16 px-4 max-w-7xl mx-auto min-h-screen">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/" className={`p-2 rounded-full border transition-colors ${isDark ? "border-white/20 text-white hover:bg-white/10" : "border-gray-200 text-gray-900 hover:bg-gray-100"}`}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/15 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                Trending Now
              </h1>
              <p className={`text-sm ${isDark ? "text-white/[0.85]" : "text-gray-500"}`}>
                Most-read stories across the globe
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {news.map((article, idx) => (
              <motion.article
                key={article._id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`group cursor-pointer rounded-xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 ${
                  isDark
                    ? "bg-white/5 border-white/10 hover:border-red-500/30"
                    : "bg-white border-gray-200 hover:border-red-300 shadow-sm"
                }`}
              >
                <div className="relative overflow-hidden aspect-video">
                  <Image
                    src={article.image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop"}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {article.isBreaking && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-semibold rounded-md animate-pulse">
                        Breaking
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className={`font-bold text-sm leading-snug mb-2 line-clamp-2 group-hover:text-red-500 transition-colors ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}>
                    {article.title}
                  </h3>
                  <p className={`text-xs leading-relaxed mb-4 line-clamp-2 ${isDark ? "text-white/55" : "text-gray-500"}`}>
                    {article.excerpt}
                  </p>
                  <div className={`flex items-center justify-between text-xs ${isDark ? "text-white/[0.85]" : "text-gray-400"}`}>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(article.publishedAt || Date.now()).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {article.views || Math.floor(Math.random() * 10000)}
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </main>
    </PageShell>
  )
}
