"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Gamepad2, Clock, ArrowRight, Eye, User } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { SafeImage as Image } from "@/components/frontend/safe-image"
import Link from "next/link"
import { useSettings } from "@/lib/use-settings"

export function SportsSection() {
  const { theme } = useTheme()
  const isDark = theme !== "light"
  const { settings } = useSettings()
  const displayOptions = settings?.displayOptions || {
    thumbnails: true, readingTime: true, authorName: true, reduceAnimations: false
  }
  const layout = settings?.layout || "comfortable"
  const [sportsNews, setSportsNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNews = () => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/news?category=Sports&limit=4`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-purple-500"]
            const formatted = data.data.map((item: any, idx: number) => ({
              id: item._id,
              title: item.title,
              excerpt: item.excerpt,
              image: item.image || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop",
              tag: item.tags?.[0] || item.category || "Sports",
              tagColor: colors[idx % colors.length],
              time: new Date(item.publishedAt).toLocaleDateString(),
              featured: idx === 0,
              authorName: item.author?.name || "Fact Flow Sports",
              readingTime: Math.max(1, Math.ceil((item.excerpt?.length || 100) / 100)) + " min read",
            }))
            setSportsNews(formatted)
          }
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
    fetchNews()
    const interval = setInterval(fetchNews, 30000)
    return () => clearInterval(interval)
  }, [])

  const featured = sportsNews.find((n) => n.featured) || sportsNews[0]
  const rest = sportsNews.filter((n) => !n.featured)

  if (sportsNews.length === 0 && !loading) return null;

  return (
    <section id="sports" className={`py-16 px-4 ${
      isDark ? "bg-gradient-to-b from-transparent via-blue-950/15 to-transparent" : "bg-gray-50/50"
    }`}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-10"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/15 rounded-lg">
              <Gamepad2 className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                Sports Updates
              </h2>
              <p className={`text-sm ${isDark ? "text-white/[0.85]" : "text-gray-500"}`}>
                Latest scores, highlights, and news
              </p>
            </div>
          </div>
          <Link href="/sports" className="flex items-center gap-1.5 text-purple-500 text-sm font-semibold hover:text-purple-400 transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className={`grid gap-6 transition-all duration-300 ${
          layout === "compact" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : 
          layout === "spacious" ? "grid-cols-1 max-w-4xl mx-auto" : 
          "grid-cols-1 lg:grid-cols-3"
        }`}>
          {layout === "comfortable" ? (
            <>
              {featured && (
                <Link href={`/article/${featured.id}`} className="lg:col-span-2 group cursor-pointer block">
                  <motion.article
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`rounded-xl overflow-hidden border ${
                      isDark ? "bg-white/5 border-white/10 hover:border-blue-500/30" : "bg-white border-gray-200 shadow-sm hover:shadow-md"
                    } transition-all duration-300 h-full flex flex-col`}
                  >
                  {displayOptions.thumbnails !== false && (
                    <div className="relative aspect-video overflow-hidden shrink-0">
                      <Image src={featured.image} alt={featured.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 ${featured.tagColor} text-white text-xs font-bold rounded-md uppercase tracking-wider`}>
                          {featured.tag}
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-bold text-2xl leading-snug line-clamp-2 mb-2 drop-shadow-md">
                          {featured.title}
                        </h3>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-5 flex-1 flex flex-col">
                    {displayOptions.thumbnails === false && (
                      <>
                        <span className={`inline-block px-3 py-1 ${featured.tagColor} text-white text-xs font-bold rounded-md uppercase tracking-wider mb-3 w-max`}>
                          {featured.tag}
                        </span>
                        <h3 className={`font-bold text-2xl leading-snug line-clamp-2 mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                          {featured.title}
                        </h3>
                      </>
                    )}
                    
                    <p className={`text-base leading-relaxed mb-4 ${isDark ? "text-white/[0.85]" : "text-gray-600"}`}>
                      {featured.excerpt}
                    </p>
                    
                    <div className="mt-auto">
                      <div className={`flex items-center flex-wrap gap-x-4 gap-y-2 text-xs mb-4 ${isDark ? "text-white/70" : "text-gray-500"}`}>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {featured.time}
                        </div>
                      </div>
                      
                      <div className={`mt-auto pt-4 border-t ${isDark ? "border-white/10 text-blue-400" : "border-gray-100 text-blue-600"} font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all`}>
                        Read full news <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  </motion.article>
                </Link>
              )}

              <div className="space-y-4">
                {rest.map((article, index) => (
                  <Link href={`/article/${article.id}`} key={article.id} className="block group cursor-pointer h-full">
                    <motion.article
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.08 }}
                      className={`rounded-xl overflow-hidden border flex flex-col sm:flex-row gap-3 p-3 transition-all duration-300 h-full ${
                        isDark
                          ? "bg-white/5 border-white/10 hover:border-blue-500/30 hover:bg-white/8"
                          : "bg-white border-gray-200 hover:shadow-md"
                      }`}
                    >
                    {displayOptions.thumbnails !== false && (
                      <div className="relative w-full sm:w-24 h-32 sm:h-24 shrink-0 rounded-lg overflow-hidden">
                        <Image src={article.image} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                      <div>
                        <span className={`inline-block px-2 py-0.5 ${article.tagColor} text-white text-[10px] uppercase font-bold tracking-wider rounded mb-1.5`}>
                          {article.tag}
                        </span>
                        <h3 className={`font-semibold text-sm leading-snug line-clamp-2 group-hover:text-blue-400 transition-colors ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}>
                          {article.title}
                        </h3>
                      </div>
                      <div className="mt-2">
                        <div className={`flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] ${isDark ? "text-white/60" : "text-gray-400"}`}>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {article.time}</span>
                        </div>
                      </div>
                    </div>
                    </motion.article>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            sportsNews.map((article, index) => (
              <Link href={`/article/${article.id}`} key={article.id} className="block group cursor-pointer">
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className={`rounded-xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 flex ${
                    layout === "compact" ? "flex-row items-center h-28 p-3 gap-4" : 
                    "flex-col p-6 gap-5" // spacious
                  } ${
                    isDark
                      ? "bg-white/5 border-white/10 hover:border-blue-500/30 hover:bg-white/8"
                      : "bg-white border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md"
                  }`}
                >
                  {displayOptions.thumbnails !== false && (
                    <div className={`relative overflow-hidden shrink-0 ${
                      layout === "compact" ? "w-20 h-20 rounded-md" : 
                      "w-full h-72 rounded-lg" // spacious
                    }`}>
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  
                  <div className={`flex flex-col flex-1 ${layout === "spacious" ? "p-2" : ""}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2.5 py-1 ${article.tagColor} text-white text-[10px] uppercase font-bold tracking-wider rounded-md`}>
                        {article.tag}
                      </span>
                    </div>
                    
                    <h3 className={`font-bold leading-snug mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors ${
                      layout === "compact" ? "text-sm" : "text-2xl mt-2"
                    } ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}>
                      {article.title}
                    </h3>
                    
                    {layout === "spacious" && (
                      <p className={`text-sm leading-relaxed mb-4 line-clamp-3 ${isDark ? "text-white/70" : "text-gray-500"}`}>
                        {article.excerpt}
                      </p>
                    )}
                    
                    <div className="mt-auto">
                      <div className={`flex items-center flex-wrap gap-x-4 gap-y-2 text-xs ${layout === "spacious" ? "mb-4" : ""} ${isDark ? "text-white/60" : "text-gray-400"}`}>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {article.time}
                        </div>
                      </div>
                      
                      {layout === "spacious" && (
                        <div className={`pt-4 border-t ${isDark ? "border-white/10 text-blue-400" : "border-gray-100 text-blue-600"} font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all`}>
                          Read full news <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.article>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
