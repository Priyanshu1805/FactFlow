"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Gamepad2, Clock, ArrowLeft } from "lucide-react"
import { SafeImage as Image } from "@/components/frontend/safe-image"
import Link from "next/link"
import { useTheme } from "@/components/theme-provider"
import { PageShell } from "@/components/frontend/page-shell"

export default function SportsNewsPage() {
  const { theme } = useTheme()
  const isDark = theme !== "light"
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/news?category=Sports&limit=50`)
      .then((res) => res.json())
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
            <div className="p-2 bg-blue-500/15 rounded-lg">
              <Gamepad2 className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                Sports Updates
              </h1>
              <p className={`text-sm ${isDark ? "text-white/[0.85]" : "text-gray-500"}`}>
                Latest scores, highlights, and news
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((article, idx) => (
              <Link href={`/article/${article._id}`} key={article._id || idx} className="block group cursor-pointer">
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`rounded-xl overflow-hidden border ${
                    isDark ? "bg-white/5 border-white/10 hover:border-blue-500/30" : "bg-white border-gray-200 shadow-sm hover:shadow-md"
                  } transition-all duration-300`}
                >
                <div className="relative aspect-video overflow-hidden">
                  <Image src={article.image || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop"} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-md">
                      {article.tags?.[0] || article.category || "Sports"}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className={`font-bold text-lg leading-snug mb-2 line-clamp-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {article.title}
                  </h3>
                  <p className={`text-sm leading-relaxed mb-4 line-clamp-3 ${isDark ? "text-white/[0.85]" : "text-gray-500"}`}>
                    {article.excerpt}
                  </p>
                  <div className={`flex items-center gap-2 text-xs ${isDark ? "text-white/[0.85]" : "text-gray-400"}`}>
                    <Clock className="w-4 h-4" />
                    {new Date(article.publishedAt || Date.now()).toLocaleDateString()}
                  </div>
                </div>
                </motion.article>
              </Link>
            ))}
          </div>
        )}
      </main>

    </PageShell>
  )
}
