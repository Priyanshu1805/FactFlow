"use client"

import { useMemo } from "react"
import { useRssStore } from "@/lib/rss/rssStore"
import { motion } from "framer-motion"
import { Palette, ArrowRight, Clock, User, Sparkles , Volume2} from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { SafeImage as Image } from "@/components/frontend/safe-image"
import Link from "next/link"
import { useSettings } from "@/lib/use-settings"
import { PremiumBadge } from "@/components/frontend/premium-badge"
import { LiveNewsBanner } from "@/components/frontend/live-news-banner"

export function ArtSection() {
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
      .filter(item => {
        const itemSections = (item.sections && item.sections.length > 0) ? item.sections : [item.category];
        return itemSections.some(c => ["art", "arts & culture"].includes(c?.toLowerCase()));
      })
      .sort((a, b) => {
        const aImg = a.image && a.image.trim() !== "" ? 1 : 0
        const bImg = b.image && b.image.trim() !== "" ? 1 : 0
        if (bImg !== aImg) return bImg - aImg
        return new Date(b.published).getTime() - new Date(a.published).getTime()
      })
      .slice(0, 5)
    
    // Sophisticated Art fallback images
    const fallbacks = [
      "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1518998053401-b5806ee3778a?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?w=600&h=400&fit=crop"
    ]

    if (filtered.length === 0) return []
    return filtered.map((item, i) => {
      let finalImage = item.image;
      if (!finalImage || finalImage.trim() === "") {
        finalImage = fallbacks[i % fallbacks.length];
      }

      return {
        id: item.id,
        title: item.title,
        excerpt: item.summary,
        image: finalImage,
        tag: item.category || "Art",
        tagColor: "bg-zinc-800",
        time: new Date(item.published).toLocaleDateString("en-US", { month: 'short', day: 'numeric' }),
        featured: i === 0,
        authorName: item.author || item.source || "Fact Flow",
        isPremium: false,
      };
    })
  }, [rssItems])

  const featured = sectionNews[0]
  const rest = sectionNews.slice(1, 5)

  if (sectionNews.length === 0 && !loading) return null;

  return (
    <section id="art" className={`py-12 px-4 relative overflow-hidden ${
      isDark ? "bg-[#0a0a0a]" : "bg-white"
    }`}>
      <LiveNewsBanner category="Art" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 border-b border-zinc-200 dark:border-zinc-800 pb-6"
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 bg-zinc-100 dark:bg-zinc-900 rounded-none`}>
              <Palette className={`w-7 h-7 text-zinc-900 dark:text-zinc-100`} />
            </div>
            <div>
              <h2 className={`text-3xl md:text-4xl font-serif tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>
                Arts & Culture
              </h2>
              <p className={`mt-1 text-sm md:text-base font-serif italic ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                Global perspectives on art, design, and culture
              </p>
            </div>
          </div>
          <Link href="/art" className={`group flex items-center gap-2 px-5 py-2.5 font-sans font-bold text-sm transition-all duration-300 uppercase tracking-widest ${isDark ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-black"}`}>
            Full Coverage
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <div className={`grid transition-all duration-500 ${
          layout === "compact" ? "grid-cols-1 lg:grid-cols-6 gap-6" : 
          layout === "spacious" ? "grid-cols-1 max-w-4xl mx-auto gap-12" : 
          "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 xl:gap-10"
        }`}>
          
          {featured && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className={`${
                layout === "compact" ? "lg:col-span-3 h-[450px]" : 
                layout === "spacious" ? "col-span-1 h-[600px]" : 
                "lg:col-span-2 h-[500px] md:h-[600px]"
              }`}
            >
              <Link href={`/article/${featured.id}`} className={`group relative block w-full h-full overflow-hidden ${isDark ? "bg-zinc-900" : "bg-zinc-100"} transition-all duration-700`}>
                
                {displayOptions.thumbnails !== false && (
                  <>
                    <Image src={featured.image} alt={featured.title} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                  </>
                )}

                <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end">
                  <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                    <div className="mb-4">
                      <span className={`inline-block px-3 py-1 bg-red-700 text-white text-[10px] font-sans font-bold uppercase tracking-widest`}>
                        {featured.tag}
                      </span>
                    </div>

                    <h3 className={`text-white font-serif leading-tight mb-4 drop-shadow-lg ${
                      layout === "compact" ? "text-2xl md:text-3xl" : 
                      layout === "spacious" ? "text-4xl md:text-5xl" : 
                      "text-3xl md:text-5xl"
                    }`}>
                      {featured.title}
                    </h3>
                    
                    <p className={`text-zinc-300 leading-relaxed mb-6 font-sans font-light max-w-xl ${
                      layout === "compact" ? "hidden" : 
                      layout === "spacious" ? "text-lg line-clamp-4" : 
                      "text-base line-clamp-3"
                    }`}>
                      {featured.excerpt}
                    </p>

                    <div className="flex items-center gap-4 text-zinc-400 text-xs font-sans uppercase tracking-wider">
                      {displayOptions.authorName !== false && featured.authorName && (
                        <div className="flex items-center gap-2 border-r border-zinc-600 pr-4">
                          {featured.authorName}
                        </div>
                      )}
                      {displayOptions.readingTime !== false && (
                        <div className="flex items-center gap-1.5">
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
            layout === "compact" ? "lg:col-span-3 grid-cols-2 gap-6" :
            "lg:col-span-2 grid-cols-1 sm:grid-cols-2 gap-6"
          }`}>
            {rest.map((article, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(idx * 0.1, 0.5) }}
                key={article.id}
                className="h-full"
              >
                <Link href={`/article/${article.id}`} className={`group block h-full overflow-hidden ${isDark ? "bg-[#0f0f0f]" : "bg-white"} transition-all duration-500 hover:-translate-y-1 flex flex-col`}>
                  
                  {displayOptions.thumbnails !== false && (
                    <div className={`relative overflow-hidden w-full h-48`}>
                      <Image src={article.image} alt={article.title} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    </div>
                  )}

                  <div className={`pt-5 flex flex-col flex-1`}>
                    <div className="mb-2">
                       <span className={`text-red-600 dark:text-red-500 text-[10px] font-sans font-bold uppercase tracking-widest`}>
                         {article.tag}
                       </span>
                    </div>

                    <h3 className={`font-serif leading-snug mb-3 transition-colors duration-300 ${isDark ? "text-zinc-100 group-hover:text-white" : "text-zinc-900 group-hover:text-black"} ${
                      layout === "compact" ? "text-lg line-clamp-3" : 
                      "text-xl line-clamp-3"
                    }`}>
                      {article.title}
                    </h3>

                    <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                      {displayOptions.readingTime !== false && (
                        <div className={`font-sans text-[10px] uppercase tracking-wider ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
                          {article.time}
                        </div>
                      )}
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
