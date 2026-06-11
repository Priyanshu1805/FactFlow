"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { NEWS_SOURCES } from "@/lib/rss/newsSources"
import { useRegion } from "@/components/providers/region-provider"

const fallbacks = [
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80",
  "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200&q=80",
  "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&q=80",
  "https://images.unsplash.com/photo-1557992260-ec58e38d363c?w=1200&q=80",
  "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&q=80",
  "https://images.unsplash.com/photo-1529236183275-4fdcf2bc741e?w=1200&q=80",
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80",
  "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=1200&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80",
  "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1200&q=80"
];
const getRandomFallback = () => fallbacks[Math.floor(Math.random() * fallbacks.length)];
export function InternationalTopNews() {
  const { region } = useRegion()
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    
    const fetchCountryNews = async () => {
      setLoading(true)
      
      try {
        const code = region.code.toLowerCase()
        const regionKey = (code === "in" || code === "india") ? "india" 
          : ["us", "uk", "gb", "ca", "au", "fr", "de", "jp", "br", "ae", "za"].includes(code) ? (code === "gb" ? "uk" : code)
          : "global"

        const sources = NEWS_SOURCES[regionKey] || NEWS_SOURCES.global
        
        // Use english if available, otherwise first available
        const activeLang = sources["english"] ? "english" : Object.keys(sources)[0] || "english"
        const activeSources = sources[activeLang] || []

        const fetchPromises = activeSources.map(async (feed) => {
          try {
            const res = await fetch(`/api/rss?url=${encodeURIComponent(feed.url)}`)
            if (!res.ok) return []
            const data = await res.json()
            return data.items.map((item: any) => {
              return {
                id: item.link || Math.random().toString(),
                title: item.title || "",
                link: item.link || "",
                source: feed.name,
                image: item.image || "",
                published: new Date(item.pubDate || Date.now()),
                country: region.code
              }
            })
          } catch (e) {
            return []
          }
        })

        const results = await Promise.all(fetchPromises)
        let allItems = results.flat()
        
        // Deduplicate
        const unique = new Map()
        for (const item of allItems) {
          if (!unique.has(item.title)) unique.set(item.title, item)
        }
        
        const sortedItems = Array.from(unique.values()).sort((a, b) => b.published.getTime() - a.published.getTime()).slice(0, 100)
        
        // Apply Fallback Images System with 20 diverse news-related images
        const fallbacks = [
          "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1557992260-ec58e38d363c?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1529236183275-4fdcf2bc741e?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1494178270175-e96de2971df9?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1478358161113-b0e11994a36b?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1503694978374-8a2fa686963a?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop"
        ]
        
        const finalItems = sortedItems.map((item, i) => {
          if (!item.image || item.image.trim() === "") {
            item.image = fallbacks[i % fallbacks.length];
          }
          return item;
        })

        if (mounted) {
          setArticles(finalItems)
          setLoading(false)
        }
      } catch (err) {
        console.error(err)
        if (mounted) setLoading(false)
      }
    }

    fetchCountryNews()

    // Refresh automatically every 30 minutes
    const interval = setInterval(fetchCountryNews, 30 * 60 * 1000)

    return () => { 
      mounted = false 
      clearInterval(interval)
    }
  }, [region.code])

  // Show "No updates found" state if empty, don't just disappear.

  return (
    <section className="w-full bg-[#111] border-b border-[#222] py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {region.name} Live Updates
          </h2>
        </div>

        <div className="min-h-[250px] relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={region.code}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[800px] overflow-y-auto scrollbar-thin scrollbar-thumb-red-500 scrollbar-track-[#1a1a1a] p-2 pr-4 rounded-xl"
            >
              <AnimatePresence>
                {articles.map((article, idx) => (
                  <Link
                    key={article.id}
                    href={`/read?url=${encodeURIComponent(article.link)}&title=${encodeURIComponent(article.title)}`}
                    className="block w-full"
                  >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (idx % 6) * 0.1 }}
                    className="group relative h-48 md:h-64 rounded-xl overflow-hidden bg-[#1a1a1a] border border-[#333] flex items-end block"
                  >
                    <img src={article.image || getRandomFallback()} alt={article.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80" onError={(e) => { e.currentTarget.src = getRandomFallback(); e.currentTarget.onerror = null; }} />
                    
                    {/* Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                      <span className="text-white text-8xl md:text-9xl font-black tracking-widest select-none uppercase drop-shadow-2xl">
                        {region.code === "GLOBAL" ? "" : region.code}
                      </span>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                    <div className="relative z-10 p-4 md:p-5 w-full">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded">
                          {article.source}
                        </span>
                        <span className="text-[10px] text-white/50 uppercase tracking-widest">
                          {new Date(article.published).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <h3 className="text-white font-bold text-sm md:text-base leading-snug line-clamp-3 group-hover:text-red-400 transition-colors">
                        {article.title}
                      </h3>
                    </div>
                  </motion.div>
                  </Link>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
