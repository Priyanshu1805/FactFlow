"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { NEWS_SOURCES } from "@/lib/rss/newsSources"
import { useRegion } from "@/components/providers/region-provider"
import { Volume2, Square, ThumbsUp, ThumbsDown } from "lucide-react"
import { useAuthStore } from "@/store/auth-store"
import { useVideoSettings } from "@/hooks/useVideoSettings"
import { useTTS } from "@/hooks/useTTS"

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
]
const getRandomFallback = () => fallbacks[Math.floor(Math.random() * fallbacks.length)]

// Individual news card with TTS + Like/Dislike
function NewsCard({ article, idx, ttsSpeak, ttsStop, ttsIsPlaying, enableAudio, user }: {
  article: any
  idx: number
  ttsSpeak: (text: string) => void
  ttsStop: () => void
  ttsIsPlaying: boolean
  enableAudio: boolean
  user: any
}) {
  const [likes, setLikes] = useState(0)
  const [dislikes, setDislikes] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isDisliked, setIsDisliked] = useState(false)
  const [isThisPlaying, setIsThisPlaying] = useState(false)

  // Fetch live stats for this article from DB
  useEffect(() => {
    if (!article.link) return
    const userId = user?.uid || ""
    fetch(`/api/external-articles/stats?url=${encodeURIComponent(article.link)}&userId=${userId}&t=${Date.now()}`, { cache: "no-store" })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.success) {
          setLikes(data.likes || 0)
          setDislikes(data.dislikes || 0)
          setIsLiked(data.hasLiked || false)
          setIsDisliked(data.hasDisliked || false)
        }
      })
      .catch(() => {})
  }, [article.link, user?.uid])

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (!user?.uid) { alert("Please sign in to like articles."); return }
    const newLiked = !isLiked
    setIsLiked(newLiked)
    if (newLiked) { setIsDisliked(false); setLikes(l => l + 1) }
    else setLikes(l => Math.max(0, l - 1))

    try {
      const res = await fetch("/api/external-articles/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: article.link, action: "like", value: newLiked ? 1 : -1, userId: user.uid })
      })
      const data = await res.json()
      if (data.success) {
        setLikes(data.stats.likes)
        setDislikes(data.stats.dislikes)
        setIsLiked(data.stats.hasLiked)
        setIsDisliked(data.stats.hasDisliked)
      }
    } catch { setIsLiked(!newLiked); setLikes(l => newLiked ? Math.max(0, l - 1) : l + 1) }
  }

  const handleDislike = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (!user?.uid) { alert("Please sign in to dislike articles."); return }
    const newDisliked = !isDisliked
    setIsDisliked(newDisliked)
    if (newDisliked) { setIsLiked(false); setDislikes(d => d + 1) }
    else setDislikes(d => Math.max(0, d - 1))

    try {
      const res = await fetch("/api/external-articles/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: article.link, action: "dislike", value: newDisliked ? 1 : -1, userId: user.uid })
      })
      const data = await res.json()
      if (data.success) {
        setLikes(data.stats.likes)
        setDislikes(data.stats.dislikes)
        setIsLiked(data.stats.hasLiked)
        setIsDisliked(data.stats.hasDisliked)
      }
    } catch { setIsDisliked(!newDisliked); setDislikes(d => newDisliked ? Math.max(0, d - 1) : d + 1) }
  }

  const handleTTS = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (isThisPlaying) {
      ttsStop()
      setIsThisPlaying(false)
    } else {
      ttsStop()
      setIsThisPlaying(true)
      ttsSpeak(article.title)
    }
  }

  // If global TTS stops (another card starts), reset our playing state
  useEffect(() => {
    if (!ttsIsPlaying) setIsThisPlaying(false)
  }, [ttsIsPlaying])

  return (
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
        <img
          src={article.image || getRandomFallback()}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80"
          onError={(e) => { e.currentTarget.src = getRandomFallback(); e.currentTarget.onerror = null }}
        />
        
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <span className="text-white text-8xl md:text-9xl font-black tracking-widest select-none uppercase drop-shadow-2xl">
            {article.country === "GLOBAL" ? "" : article.country}
          </span>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        <div className="relative z-10 p-4 md:p-5 w-full">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded">
              {article.source}
            </span>
            <span className="text-[10px] text-white/50 uppercase tracking-widest">
              {new Date(article.published).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <h3 className="text-white font-bold text-sm md:text-base leading-snug line-clamp-2 group-hover:text-red-400 transition-colors mb-3">
            {article.title}
          </h3>

          {/* Action Bar: TTS + Like/Dislike */}
          <div className="flex items-center gap-2 mt-1" onClick={e => e.preventDefault()}>
            {/* TTS Button — only visible when enableAudioNews is on in settings */}
            {enableAudio && (
              <button
                onClick={handleTTS}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                  isThisPlaying
                    ? "bg-red-600 border-red-500 text-white"
                    : "bg-white/10 border-white/20 text-white/80 hover:bg-white/20"
                }`}
                title={isThisPlaying ? "Stop audio" : "Listen to headline"}
              >
                {isThisPlaying ? <Square className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                {isThisPlaying ? "Stop" : "Listen"}
              </button>
            )}

            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                isLiked
                  ? "bg-green-600/80 border-green-500 text-white"
                  : "bg-white/10 border-white/20 text-white/70 hover:bg-white/20"
              }`}
              title="Like"
            >
              <ThumbsUp className={`w-3 h-3 ${isLiked ? "fill-current" : ""}`} />
              {likes > 0 && <span>{likes}</span>}
            </button>

            {/* Dislike Button */}
            <button
              onClick={handleDislike}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                isDisliked
                  ? "bg-red-700/80 border-red-500 text-white"
                  : "bg-white/10 border-white/20 text-white/70 hover:bg-white/20"
              }`}
              title="Dislike"
            >
              <ThumbsDown className={`w-3 h-3 ${isDisliked ? "fill-current" : ""}`} />
              {dislikes > 0 && <span>{dislikes}</span>}
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

export function InternationalTopNews() {
  const { region } = useRegion()
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore()

  // TTS: use the same hook as the article reader page
  const settings = useVideoSettings()
  const { speak, stop, isPlaying } = useTTS((settings as any)?.voiceSpeed || "1x")
  const enableAudio = !!(settings as any)?.enableAudioNews

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
        
        const activeLang = sources["english"] ? "english" : Object.keys(sources)[0] || "english"
        const activeSources = (sources[activeLang] || []).sort(() => 0.5 - Math.random()).slice(0, 3)

        const fetchPromises = activeSources.map(async (feed) => {
          try {
            const res = await fetch(`/api/rss?url=${encodeURIComponent(feed.url)}`)
            if (!res.ok) return []
            const data = await res.json()
            return data.items.map((item: any) => ({
              id: item.link || Math.random().toString(),
              title: item.title || "",
              link: item.link || "",
              source: feed.name,
              image: item.image || "",
              published: new Date(item.pubDate || Date.now()),
              country: region.code
            }))
          } catch (e) {
            return []
          }
        })

        const results = await Promise.all(fetchPromises)
        let allItems = results.flat()
        
        const unique = new Map()
        for (const item of allItems) {
          if (!unique.has(item.title)) unique.set(item.title, item)
        }
        
        const sortedItems = Array.from(unique.values())
          .sort((a, b) => b.published.getTime() - a.published.getTime())
          .slice(0, 100)
        
        const localFallbacks = [
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
            item.image = localFallbacks[i % localFallbacks.length]
          }
          return item
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
    const interval = setInterval(fetchCountryNews, 30 * 60 * 1000)

    return () => { 
      mounted = false 
      clearInterval(interval)
    }
  }, [region.code])

  return (
    <section className="w-full bg-[#111] border-b border-[#222] py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {region.name} Live Updates
          </h2>
          {enableAudio && (
            <span className="text-[10px] text-white/40 uppercase tracking-widest flex items-center gap-1">
              <Volume2 className="w-3 h-3" /> Audio News Active
            </span>
          )}
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
                  <NewsCard
                    key={article.id + idx}
                    article={article}
                    idx={idx}
                    ttsSpeak={speak}
                    ttsStop={stop}
                    ttsIsPlaying={isPlaying}
                    enableAudio={enableAudio}
                    user={user}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
