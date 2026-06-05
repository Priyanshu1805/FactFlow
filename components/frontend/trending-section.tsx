"use client"

import { useMemo } from "react"
import { useRssStore } from "@/lib/rss/rssStore"
import { motion } from "framer-motion"
import { TrendingUp, ArrowRight, Clock, User, Sparkles } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { SafeImage as Image } from "@/components/frontend/safe-image"
import Link from "next/link"
import { useSettings } from "@/lib/use-settings"
import { PremiumBadge } from "@/components/frontend/premium-badge"

export function TrendingSection() {
  const { theme } = useTheme()
  const isDark = theme !== "light"
  const { settings } = useSettings()
  const displayOptions = (settings?.displayOptions as any) || {
    thumbnails: true, readingTime: true, authorName: true, reduceAnimations: false
  }
  const layout = settings?.layout || "comfortable"
  const { items: rssItems, loading } = useRssStore()

  const sectionNews = useMemo(() => {
    const filtered = rssItems
      .filter(item => true)
      .sort((a, b) => {
        const aHas = a.image && a.image.trim() !== "" ? 1 : 0;
        const bHas = b.image && b.image.trim() !== "" ? 1 : 0;
        return bHas - aHas; // Real images go first
      })
      .slice(0, 20)
    
    // Category-specific fallback images (very related, no dummy abstract images)
    const fallbacks = {
      blue: [
        "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1526685816358-305be0981977?w=600&h=400&fit=crop"
      ], // Politics
      pink: [
        "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=600&h=400&fit=crop"
      ], // Lifestyle
      orange: [
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&h=400&fit=crop"
      ], // Sports
      purple: [
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=400&fit=crop"
      ], // Tech
      yellow: [
        "https://images.unsplash.com/photo-1545048702-79362596cf9b?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600&h=400&fit=crop"
      ], // Memes
      green: [
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=600&h=400&fit=crop"
      ] // Trending
    }
    const catImages = fallbacks["green"] || fallbacks["green"]

    if (filtered.length === 0) return []
    return filtered.map((item, i) => {
      let finalImage = item.image;
      if (!finalImage || finalImage.trim() === "") {
        finalImage = catImages[i % catImages.length];
      }

      return {
        id: item.id,
        title: item.title,
        excerpt: item.summary,
        image: finalImage,
      tag: item.category || "Updates",
      tagColor: ["bg-green-500", "bg-indigo-500", "bg-rose-500", "bg-emerald-500"][i % 4],
      time: new Date(item.published).toLocaleDateString("en-US", { month: 'short', day: 'numeric' }),
      featured: i === 0,
      authorName: item.author || item.source || "Fact Flow",
      isPremium: false,
      };
    })
  }, [rssItems])

  const featured = sectionNews.find((n) => n.featured) || sectionNews[0]
  const rest = sectionNews.filter((n) => !n.featured).slice(0, 6)

  if (sectionNews.length === 0 && !loading) return null;

  return (
    <section id="trending" className={`py-12 px-4 relative overflow-hidden ${
      isDark ? "bg-transparent" : "bg-gray-50/30"
    }`}>
      {isDark && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-green-900/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 bg-green-500/15 rounded-2xl backdrop-blur-xl border border-green-500/20 shadow-[0_0_20px_rgba(var(--green),0.2)]`}>
              <TrendingUp className={`w-7 h-7 text-green-500`} />
            </div>
            <div>
              <h2 className={`text-3xl md:text-4xl font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                Trending Now
              </h2>
              <p className={`mt-1 text-sm md:text-base font-medium ${isDark ? "text-white/60" : "text-gray-500"}`}>
                Most popular stories across the web
              </p>
            </div>
          </div>
          <Link href="#breaking-updates" className={`group flex items-center gap-2 px-4 py-2 rounded-full ${isDark ? "bg-white/5 hover:bg-white/10 text-white/80" : "bg-black/5 hover:bg-black/10 text-black/80"} transition-all backdrop-blur-md text-sm font-bold`}>
            Explore More 
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <div className={`grid transition-all duration-500 ${
          layout === "compact" ? "grid-cols-1 lg:grid-cols-6 gap-4" : 
          layout === "spacious" ? "grid-cols-1 max-w-4xl mx-auto gap-10" : 
          "grid-cols-1 lg:grid-cols-4 gap-6 xl:gap-8"
        }`}>
          
          {featured && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className={`${
                layout === "compact" ? "lg:col-span-3 h-[400px]" : 
                layout === "spacious" ? "col-span-1 h-[600px]" : 
                "lg:col-span-2 h-[450px] md:h-[550px]"
              }`}
            >
              <Link href={`/article/${featured.id}`} className={`group relative block w-full h-full rounded-[2rem] overflow-hidden border ${isDark ? "border-white/10 hover:border-white/30" : "border-gray-200"} hover:shadow-[0_0_30px_-5px_rgba(34,197,94,0.3)] transition-all duration-700`}>
                
                {displayOptions.thumbnails !== false && (
                  <>
                    <Image src={featured.image} alt={featured.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-700" />
                    <div className="absolute inset-0 bg-black/20 mix-blend-overlay" />
                  </>
                )}

                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-widest shadow-xl`}>
                      <Sparkles className="w-3 h-3" />
                      {featured.tag}
                    </span>
                    {featured.isPremium && <PremiumBadge size="md" />}
                  </div>

                  <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                    <h3 className={`text-white font-black leading-tight mb-4 drop-shadow-2xl line-clamp-3 ${
                      layout === "compact" ? "text-2xl md:text-3xl" : 
                      layout === "spacious" ? "text-4xl md:text-5xl" : 
                      "text-2xl md:text-4xl"
                    }`}>
                      {featured.title}
                    </h3>
                    
                    <p className={`text-white/70 leading-relaxed mb-5 font-medium max-w-xl ${
                      layout === "compact" ? "text-xs md:text-sm line-clamp-2" : 
                      layout === "spacious" ? "text-lg line-clamp-4" : 
                      "text-sm md:text-base line-clamp-2"
                    }`}>
                      {featured.excerpt}
                    </p>

                    <div className="flex items-center gap-4 text-white/60 text-xs md:text-sm font-semibold">
                      {displayOptions.authorName !== false && featured.authorName && (
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full bg-green-500/15 flex items-center justify-center backdrop-blur-md`}>
                            <User className={`w-3.5 h-3.5 text-green-500`} />
                          </div>
                          {featured.authorName}
                        </div>
                      )}
                      {displayOptions.readingTime !== false && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {featured.time}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          <div className={`grid ${
            layout === "compact" ? "lg:col-span-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3" : 
            layout === "spacious" ? "col-span-1 grid-cols-1 gap-8" : 
            "lg:col-span-2 grid-cols-1 sm:grid-cols-2 gap-4 xl:gap-6"
          }`}>
            {rest.map((article, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                key={article.id}
                className="h-full"
              >
                <Link href={`/article/${article.id}`} className={`group block h-full rounded-[1.5rem] overflow-hidden border ${isDark ? "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.06] hover:border-white/20" : "bg-white border-gray-100 hover:shadow-xl hover:border-gray-300"} transition-all duration-500 hover:-translate-y-1 ${
                  layout === "spacious" ? "flex flex-col md:flex-row" : "flex flex-col"
                }`}>
                  
                  {displayOptions.thumbnails !== false && (
                    <div className={`relative overflow-hidden ${
                      layout === "spacious" ? "w-full md:w-1/3 md:h-full min-h-[200px]" : 
                      layout === "compact" ? "w-full h-32" : 
                      "w-full h-40"
                    }`}>
                      <Image src={article.image} alt={article.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute top-3 left-3">
                        <span className={`inline-block px-2.5 py-1 ${article.tagColor} text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg`}>
                          {article.tag}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className={`p-5 flex flex-col flex-1 ${layout === "spacious" ? "justify-center p-8" : ""}`}>
                    <h3 className={`font-bold leading-snug mb-4 transition-colors duration-300 ${isDark ? "text-white/90 group-hover:text-white" : "text-gray-900 group-hover:text-black"} ${
                      layout === "compact" ? "text-sm line-clamp-2" : 
                      layout === "spacious" ? "text-xl md:text-2xl line-clamp-3" : 
                      "text-base line-clamp-3"
                    }`}>
                      {article.title}
                    </h3>
                    
                    {layout === "spacious" && (
                      <p className={`mb-6 line-clamp-3 ${isDark ? "text-white/60" : "text-gray-500"}`}>
                        {article.excerpt}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between">
                      {displayOptions.readingTime !== false && (
                        <div className={`flex items-center gap-1.5 font-medium ${
                          layout === "compact" ? "text-[10px]" : "text-xs"
                        } ${isDark ? "text-white/40" : "text-gray-400"}`}>
                          <Clock className="w-3.5 h-3.5" />
                          {article.time}
                        </div>
                      )}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${isDark ? "border-white/10 bg-white/5 text-white/50 group-hover:bg-white/20 group-hover:text-white" : "border-gray-200 bg-gray-50 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-900"} transition-all duration-300`}>
                        <ArrowRight className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
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
