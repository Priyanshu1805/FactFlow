"use client"

import { useMemo } from "react"
import { useRssStore } from "@/lib/rss/rssStore"
import { motion } from "framer-motion"
import { Cpu, ArrowRight, Clock, User, Sparkles , Volume2} from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { SafeImage as Image } from "@/components/frontend/safe-image"
import Link from "next/link"
import { useSettings } from "@/lib/use-settings"
import { PremiumBadge } from "@/components/frontend/premium-badge"
import { LiveNewsBanner } from "@/components/frontend/live-news-banner"
import { useVideoSettings } from "@/hooks/useVideoSettings"

const TECH_FALLBACKS = [
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop",
]

export function TechSection() {
  const { theme } = useTheme()
  const isDark = theme !== "light"
  const { settings } = useSettings()
  const avSettings = useVideoSettings()
  const enableAudio = avSettings.enableAudioNews
  const displayOptions = (settings?.displayOptions as any) || {
    thumbnails: true, readingTime: true, authorName: true
  }
  const layout = settings?.layout || "comfortable"
  const { items: rssItems, loading } = useRssStore()

  const sectionNews = useMemo(() => {
    const filtered = rssItems
      .filter(item => {
        const itemSections = (item.sections && item.sections.length > 0) ? item.sections : [item.category];
        return itemSections.some(c => ["tech", "technology", "science", "gaming", "ai", "innovation"].includes(c?.toLowerCase()));
      })
      .sort((a, b) => {
        const aImg = a.image && a.image.trim() !== "" ? 1 : 0
        const bImg = b.image && b.image.trim() !== "" ? 1 : 0
        if (bImg !== aImg) return bImg - aImg
        return new Date(b.published).getTime() - new Date(a.published).getTime()
      })
      .slice(0, 5)

    if (filtered.length === 0) return []
    return filtered.map((item, i) => ({
      id: item.id,
      title: item.title,
      excerpt: item.summary,
      image: item.image && item.image.trim() !== "" ? item.image : TECH_FALLBACKS[i % TECH_FALLBACKS.length],
      tag: item.category || "Tech",
      tagColor: ["bg-purple-500", "bg-indigo-500", "bg-violet-500", "bg-blue-500"][i % 4],
      time: new Date(item.published).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      featured: i === 0,
      authorName: item.author || item.source || "FactFlow",
      isPremium: false,
    }))
  }, [rssItems])

  const featured = sectionNews[0]
  const rest = sectionNews.slice(1, 5)

  if (sectionNews.length === 0 && !loading) return null

  return (
    <section id="tech" className={`py-12 px-4 relative overflow-hidden ${isDark ? "bg-transparent" : "bg-gray-50/30"}`}>
      <LiveNewsBanner category="Tech" />
      {isDark && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-purple-900/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/15 rounded-2xl backdrop-blur-xl border border-purple-500/20">
              <Cpu className="w-7 h-7 text-purple-500" />
            </div>
            <div>
              <h2 className={`text-3xl md:text-4xl font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                Tech & Innovation
              </h2>
              <p className={`mt-1 text-sm font-medium ${isDark ? "text-white/60" : "text-gray-500"}`}>
                Latest in AI, tech, and science
              </p>
            </div>
          </div>
          <Link href="/tech" className="group flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/25">
            View More
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <div className={`grid transition-all duration-500 ${
          layout === "compact" ? "grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8"
        }`}>

          {featured && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className={layout === "compact" ? "lg:col-span-3 h-[400px]" : "lg:col-span-2 h-[450px] md:h-[550px]"}
            >
              <Link href={`/article/${featured.id}`} className={`group relative block w-full h-full rounded-[2rem] overflow-hidden border ${isDark ? "border-white/10 hover:border-white/30" : "border-gray-200"} hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)] transition-all duration-700`}>
                {displayOptions.thumbnails !== false && (
                  <>
                    <Image src={featured.image} alt={featured.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-700" />
                  </>
                )}
                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-widest">
                      <Sparkles className="w-3 h-3" />{featured.tag}
                    </span>
                    {featured.isPremium && <PremiumBadge size="md" />}
                  </div>
                  <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                    <h3 className="text-white font-black leading-tight mb-3 drop-shadow-2xl line-clamp-3 text-2xl md:text-4xl">{featured.title}</h3>
                    <p className="text-white/70 leading-relaxed mb-4 font-medium max-w-xl text-sm line-clamp-2">{featured.excerpt}</p>
                    <div className="flex items-center gap-4 text-white/60 text-xs font-semibold">
                      {displayOptions.authorName !== false && featured.authorName && (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-purple-400" />
                          </div>
                          {featured.authorName}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{featured.time}</div>
                      {enableAudio && (
                        <button
                          onClick={(e) => {
                            e.preventDefault(); e.stopPropagation();
                            const u = new SpeechSynthesisUtterance(featured.title + ". " + (featured.excerpt || ""));
                            window.speechSynthesis.speak(u);
                          }}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold transition-all ml-3 ${isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-black/5 hover:bg-black/10 text-gray-700"}`}
                        >
                          <Volume2 className="w-3.5 h-3.5" /> Listen
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          <div className={`grid ${
            layout === "compact" ? "lg:col-span-3 grid-cols-2 gap-3" : "lg:col-span-2 grid-cols-1 sm:grid-cols-2 gap-4"
          }`}>
            {rest.map((article, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                key={article.id}
                className="h-full"
              >
                <Link href={`/article/${article.id}`} className={`group block h-full rounded-[1.5rem] overflow-hidden border ${isDark ? "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.06] hover:border-white/20" : "bg-white border-gray-100 hover:shadow-xl hover:border-gray-300"} transition-all duration-500 hover:-translate-y-1 flex flex-col`}>
                  {displayOptions.thumbnails !== false && (
                    <div className="relative overflow-hidden w-full h-40">
                      <Image src={article.image} alt={article.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute top-3 left-3">
                        <span className={`inline-block px-2.5 py-1 ${article.tagColor} text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg`}>{article.tag}</span>
                      </div>
                    </div>
                  )}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className={`font-bold leading-snug mb-3 text-sm line-clamp-3 transition-colors ${isDark ? "text-white/90 group-hover:text-white" : "text-gray-900 group-hover:text-black"}`}>{article.title}</h3>
                    <div className="mt-auto flex items-center justify-between">
                      <div className={`flex items-center gap-1.5 text-xs font-medium ${isDark ? "text-white/40" : "text-gray-400"}`}>
                        <Clock className="w-3.5 h-3.5" />{article.time}
                      {enableAudio && (
                        <button
                          onClick={(e) => {
                            e.preventDefault(); e.stopPropagation();
                            const u = new SpeechSynthesisUtterance(article.title + ". " + (article.excerpt || ""));
                            window.speechSynthesis.speak(u);
                          }}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold transition-all ml-2 ${isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-black/5 hover:bg-black/10 text-gray-700"}`}
                        >
                          <Volume2 className="w-3.5 h-3.5" /> Listen
                        </button>
                      )}
                      </div>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border ${isDark ? "border-white/10 bg-white/5 text-white/40 group-hover:bg-purple-500/20 group-hover:text-purple-400 group-hover:border-purple-500/30" : "border-gray-200 bg-gray-50 text-gray-400 group-hover:bg-purple-50 group-hover:text-purple-500"} transition-all duration-300`}>
                        <ArrowRight className="w-3.5 h-3.5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
