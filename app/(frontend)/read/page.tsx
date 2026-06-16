"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useSocket } from "@/hooks/use-socket"
import { Suspense, useEffect, useState, useRef } from "react"
import { Share2, Clock, Globe, ChevronLeft, Bookmark, Heart, MoreHorizontal, Copy, ExternalLink, Headphones, Square, ThumbsUp, ThumbsDown } from "lucide-react"
import { motion } from "framer-motion"
import { useSavedStore } from "@/lib/rss/savedStore"
import { useAuthStore } from "@/store/auth-store"
import { useVideoSettings } from "@/hooks/useVideoSettings"
import { useTTS } from "@/hooks/useTTS"

function ReadArticleContent() {
  const searchParams = useSearchParams()
  const url = searchParams.get("url")
  const defaultTitle = searchParams.get("title") || "Fact Flow Article"

  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  
  // Interaction State
  const { saveItem, removeItem, isSaved: isSavedStore } = useSavedStore()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const isSaved = isMounted ? isSavedStore(url || "") : false
  const { user } = useAuthStore()
  const [isLiked, setIsLiked] = useState(false)
  const [isDisliked, setIsDisliked] = useState(false)

  // TTS & Settings
  const settings = useVideoSettings()
  const { speak, stop, isPlaying } = useTTS(settings?.voiceSpeed || "1x")

  // Dropdown State
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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
  const [stats, setStats] = useState({ likes: 0, dislikes: 0, saves: 0, shares: 0 })
  const { socket } = useSocket()

  useEffect(() => {
    if (!socket) return

    const handleUpdate = (payload: { url: string, stats: any }) => {
      if (payload.url === url) {
        setStats(prev => ({
          ...prev,
          likes: payload.stats.likes,
          dislikes: payload.stats.dislikes,
          saves: payload.stats.saves,
          shares: payload.stats.shares
        }))
      }
    }

    socket.on("external_article_stats_update", handleUpdate)
    return () => {
      socket.off("external_article_stats_update", handleUpdate)
    }
  }, [socket, url])

  // Reading progress bar
  const containerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current
      const windowHeight = scrollHeight - clientHeight
      if (windowHeight > 0) {
        setProgress((scrollTop / windowHeight) * 100)
      }
    }
    const el = containerRef.current
    el?.addEventListener('scroll', handleScroll)
    return () => el?.removeEventListener('scroll', handleScroll)
  }, [article])

  useEffect(() => {
    if (!url) return
    
    const fetchArticleAndStats = async () => {
      try {
        // 1. Fetch Article Content
        const res = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`)
        const data = await res.json()
        if (data.success && data.content) {
          setArticle(data)
        } else {
          setError(true)
        }

        // 2. Fetch Global Stats from Backend
        const userId = user?.uid || ""
        const statsRes = await fetch(`/api/external-articles/stats?url=${encodeURIComponent(url)}&userId=${userId}&t=${Date.now()}`, { cache: "no-store" })
        const statsData = await statsRes.json()
        if (statsData.success) {
          setStats({ likes: statsData.likes, dislikes: statsData.dislikes, saves: statsData.saves, shares: statsData.shares })
          setIsLiked(statsData.hasLiked)
          setIsDisliked(statsData.hasDisliked)
        }
      } catch (err) {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    
    fetchArticleAndStats()
  }, [url, user])

  // --- Handlers for Backend Interactions --- //

  const handleLike = async () => {
    if (!url) return
    if (!user?.uid) {
      alert("Please sign in to like articles.")
      return
    }
    const newLiked = !isLiked
    setIsLiked(newLiked)
    if (newLiked) setIsDisliked(false)

    try {
      const res = await fetch(`/api/external-articles/interact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          action: "like",
          value: newLiked ? 1 : -1,
          userId: user.uid
        })
      })
      const data = await res.json()
      if (data.success) {
        setStats(prev => ({ ...prev, likes: data.stats.likes, dislikes: data.stats.dislikes }))
        setIsLiked(data.stats.hasLiked)
        setIsDisliked(data.stats.hasDisliked)
      }
    } catch (err) {
      console.error(err)
      setIsLiked(!newLiked)
    }
  }

  const handleDislike = async () => {
    if (!url) return
    if (!user?.uid) {
      alert("Please sign in to dislike articles.")
      return
    }
    const newDisliked = !isDisliked
    setIsDisliked(newDisliked)
    if (newDisliked) setIsLiked(false)

    try {
      const res = await fetch(`/api/external-articles/interact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          action: "dislike",
          value: newDisliked ? 1 : -1,
          userId: user.uid
        })
      })
      const data = await res.json()
      if (data.success) {
        setStats(prev => ({ ...prev, likes: data.stats.likes, dislikes: data.stats.dislikes }))
        setIsLiked(data.stats.hasLiked)
        setIsDisliked(data.stats.hasDisliked)
      }
    } catch (err) {
      console.error(err)
      setIsDisliked(!newDisliked)
    }
  }

  const handleSave = async () => {
    if (!url) return
    const isCurrentlySaved = isSaved
    
    if (isCurrentlySaved) {
      removeItem(url)
    } else {
      saveItem({
        id: url,
        title: article?.title || defaultTitle || "",
        link: url,
        source: article?.siteName || new URL(url).hostname || "Global Update",
        summary: article?.textContent?.substring(0, 150) || "",
        image: article?.image || "",
        country: "global",
        language: "en",
        category: "Global Update",
        published: new Date()
      })
    }

    if (user?.uid) {
      try {
        const res = await fetch(`/api/external-articles/interact`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url,
            action: "save",
            value: !isCurrentlySaved ? 1 : -1,
            userId: user.uid
          })
        })
        const data = await res.json()
        if (data.success) {
          setStats(prev => ({ ...prev, saves: data.stats.saves }))
        }
      } catch (err) {
        console.error(err)
      }
    } else {
      setStats(prev => ({ ...prev, saves: prev.saves + (!isCurrentlySaved ? 1 : -1) }))
    }
  }

  const handleShare = async () => {
    if (!url) return
    try {
      if (navigator.share) {
        await navigator.share({
          title: article?.title || defaultTitle,
          text: "Check out this news on FactFlow",
          url: url
        })
      } else {
        await navigator.clipboard.writeText(url)
        alert("Link copied to clipboard!")
      }
      
      // Ping Backend to increment share count
      setStats(prev => ({ ...prev, shares: prev.shares + 1 }))
      fetch(`/api/external-articles/interact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, action: "share", value: 1 })
      }).catch(console.error)
    } catch (err) {
      console.log("User cancelled share")
    }
  }

  if (!url) return <div className="p-20 text-white text-center font-bold text-xl">Invalid Article URL</div>

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] overflow-hidden text-gray-100 font-sans selection:bg-red-500/30">
      {/* Top Navbar */}
      <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-4 h-16 flex justify-between items-center shrink-0 z-50 sticky top-0 transition-all shadow-sm">
        
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 h-[2px] bg-red-600 transition-all duration-150 ease-out" style={{ width: `${progress}%` }} />

        <div className="flex items-center gap-4 flex-1">
          <Link href="/" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <ChevronLeft className="w-5 h-5 text-white/70" />
          </Link>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 shadow-inner">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="text-white/60 text-[10px] uppercase font-bold tracking-widest">FactFlow Reader</span>
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          <h1 className="text-white font-bold text-xs sm:text-sm truncate max-w-[150px] sm:max-w-xs md:max-w-md opacity-80">
            {article?.siteName || defaultTitle}
          </h1>
        </div>
        
        <div className="flex items-center justify-end gap-2 sm:gap-4 flex-1">
          <button onClick={handleSave} className={`flex items-center gap-1.5 px-3 h-10 rounded-full transition-all ${isSaved ? "bg-white text-black font-bold" : "bg-white/5 text-white/70 hover:bg-white/10 font-medium"}`}>
            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-black" : ""}`} />
            <span className="text-xs">{stats.saves > 0 ? stats.saves : ""}</span>
          </button>
          <a href={url} target="_blank" rel="noreferrer" className="hidden sm:flex items-center gap-1.5 text-white/50 text-xs hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/5">
            <Globe className="w-3.5 h-3.5" />
            <span>Original</span>
          </a>
          <div className="relative" ref={menuRef}>
            <button onClick={() => setShowMenu(!showMenu)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
              <MoreHorizontal className="w-5 h-5 text-white/70" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#121212] border border-white/10 p-2 shadow-2xl z-50">
                <button
                  onClick={async () => {
                    setShowMenu(false)
                    if (url) {
                      await navigator.clipboard.writeText(url)
                      alert("Link copied to clipboard!")
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-colors text-left"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </button>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setShowMenu(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-colors text-left"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Original Link</span>
                </a>
                <button
                  onClick={() => {
                    setShowMenu(false)
                    if (isPlaying) {
                      stop()
                    } else {
                      speak(`${article?.title || defaultTitle}. ${article?.textContent || ""}`)
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-colors text-left"
                >
                  {isPlaying ? (
                    <>
                      <Square className="w-4 h-4 text-red-500 fill-red-500" />
                      <span>Stop Listening</span>
                    </>
                  ) : (
                    <>
                      <Headphones className="w-4 h-4 text-green-500" />
                      <span>Listen to Article</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Scroll Container */}
      <div ref={containerRef} className="flex-1 overflow-y-auto w-full relative scroll-smooth scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        
        {loading && (
          <div className="max-w-3xl mx-auto w-full px-4 py-16">
            <div className="w-full h-64 bg-white/5 animate-pulse rounded-3xl mb-8" />
            <div className="w-3/4 h-12 bg-white/5 animate-pulse rounded-lg mb-4" />
            <div className="w-1/2 h-12 bg-white/5 animate-pulse rounded-lg mb-8" />
            <div className="flex gap-4 mb-12">
              <div className="w-12 h-12 rounded-full bg-white/5 animate-pulse" />
              <div className="space-y-2">
                <div className="w-32 h-4 bg-white/5 animate-pulse rounded" />
                <div className="w-24 h-4 bg-white/5 animate-pulse rounded" />
              </div>
            </div>
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={`h-4 bg-white/5 animate-pulse rounded ${i % 3 === 0 ? "w-5/6" : "w-full"}`} />
              ))}
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="bg-red-500/10 p-5 rounded-full mb-6 ring-1 ring-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
              <Globe className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Publisher Restricted</h2>
            <p className="text-white/50 mb-8 max-w-md text-lg leading-relaxed">
              The publisher of this article has blocked automated reading modes. We respect their copyright.
            </p>
            <a href={url} target="_blank" rel="noreferrer" className="group relative inline-flex items-center justify-center bg-white text-black px-8 py-4 rounded-full font-bold text-sm tracking-wide overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              <span className="relative z-10 flex items-center gap-2">Read on {new URL(url).hostname} <Globe className="w-4 h-4" /></span>
            </a>
          </div>
        )}

        {article && !loading && !error && (
          <article className="w-full pb-24">
            
            {/* Hero Cover Image */}
            <div className="relative w-full h-[40vh] md:h-[55vh] min-h-[300px] mb-8 md:mb-16">
                <img src={article.image || getRandomFallback()} alt={article.title} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { e.currentTarget.src = getRandomFallback(); e.currentTarget.onerror = null; }} />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/50 to-[#0a0a0a]" />
              </div>

            <div className={`max-w-[720px] mx-auto px-5 sm:px-8 $'-mt-24 relative z-10'`}>
              
              {/* Header Info */}
              <header className="mb-10 sm:mb-14 text-center sm:text-left">
                {article.siteName && (
                  <div className="inline-block px-3 py-1 bg-red-600/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-6">
                    {article.siteName}
                  </div>
                )}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.15] mb-8 tracking-tight font-serif drop-shadow-sm">
                  {article.title}
                </h1>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-y border-white/10 py-6">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-inner border border-white/10 shrink-0">
                      <span className="text-white/50 font-bold text-lg">{article.siteName ? article.siteName[0] : "N"}</span>
                    </div>
                    <div>
                      {article.byline ? (
                        <p className="font-bold text-white/90 text-sm">{article.byline}</p>
                      ) : (
                        <p className="font-bold text-white/90 text-sm">FactFlow Desk</p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-white/40 mt-1">
                        <span>Original Report</span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {Math.max(1, Math.ceil(article.length / 1000))} min read
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 justify-center">
                    <button onClick={handleShare} className="flex items-center gap-2 px-3 h-10 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/80 font-medium text-xs">
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                    <div className="flex items-center rounded-full border border-white/10 bg-white/5 overflow-hidden">
                      <button onClick={handleLike} className={`flex items-center gap-2 px-4 h-10 transition-colors font-bold text-xs ${isLiked ? "bg-green-500/20 text-green-500" : "text-white/80 hover:bg-white/10"}`}>
                        <ThumbsUp className={`w-4 h-4 ${isLiked ? "fill-green-500" : ""}`} />
                        <span>{Math.max(0, stats.likes) > 999 ? (Math.max(0, stats.likes)/1000).toFixed(1) + 'K' : Math.max(0, stats.likes)}</span>
                      </button>
                      <div className="w-[1px] h-6 bg-white/10" />
                      <button onClick={handleDislike} className={`flex items-center gap-2 px-4 h-10 transition-colors font-bold text-xs ${isDisliked ? "bg-red-500/20 text-red-500" : "text-white/80 hover:bg-white/10"}`}>
                        <ThumbsDown className={`w-4 h-4 ${isDisliked ? "fill-red-500" : ""}`} />
                        <span>{Math.max(0, stats.dislikes) > 999 ? (Math.max(0, stats.dislikes)/1000).toFixed(1) + 'K' : Math.max(0, stats.dislikes)}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </header>

              {/* The Body - Smart Typography */}
              <div 
                className="prose prose-invert prose-lg md:prose-xl max-w-none 
                  font-serif
                  prose-p:leading-[1.8] prose-p:text-gray-300 prose-p:font-light
                  prose-a:text-red-400 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                  prose-headings:font-sans prose-headings:font-bold prose-headings:text-white prose-headings:tracking-tight
                  prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
                  prose-h3:text-xl
                  prose-img:rounded-2xl prose-img:w-full prose-img:shadow-2xl prose-img:my-10
                  prose-blockquote:border-l-4 prose-blockquote:border-red-500 prose-blockquote:bg-white/[0.02] prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl prose-blockquote:text-white/70 prose-blockquote:font-style-normal prose-blockquote:text-xl
                  prose-li:text-gray-300 prose-li:leading-[1.8]
                  first-letter:text-7xl first-letter:font-black first-letter:text-white first-letter:mr-3 first-letter:float-left first-letter:leading-[0.9]"
                dangerouslySetInnerHTML={{ __html: article.content }} 
              />

              {/* Footer */}
              <div className="mt-20 pt-8 border-t border-white/10">
                <div className="bg-white/5 rounded-3xl p-8 text-center flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                    <Globe className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">Continue the story</h3>
                  <p className="text-white/50 text-sm mb-6 max-w-sm">
                    This article was scraped from {new URL(url).hostname}. Read the original piece to support the publisher.
                  </p>
                  <a href={url} target="_blank" rel="noreferrer" className="px-6 py-2.5 bg-white text-black font-bold rounded-full text-sm hover:scale-105 transition-transform">
                    Visit Original Site
                  </a>
                </div>
              </div>

            </div>
          </article>
        )}
      </div>
    </div>
  )
}

export default function ReadArticlePage() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <ReadArticleContent />
    </Suspense>
  )
}
