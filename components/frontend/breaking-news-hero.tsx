"use client"
import { useAuthStore } from "@/store/auth-store";

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, ChevronLeft, ChevronRight, Play, MessageSquare, Twitter, Globe } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "@/components/theme-provider"
import { PremiumBadge } from "@/components/frontend/premium-badge"

interface Article {
  _id: string
  title: string
  excerpt: string
  image: string
  publishedAt: string
  category: string
  source?: string
  tags?: string[]
  isPremium?: boolean
  isSponsored?: boolean
}

function SocialUpdateCard({ article }: { article: Article }) {
  // Always use Fact Flow branding
  const platform = "Fact Flow"
  
  // Choose a sleek looping background based on random
  const bgVideoUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4" 

  const handleCardClick = (e: React.MouseEvent) => {
    window.open(`/article/${article._id}`, "_self")
  }

  return (
    <div 
      onClick={handleCardClick}
      className="relative flex-shrink-0 w-[90vw] sm:w-[600px] lg:w-[800px] h-[320px] sm:h-[500px] rounded-2xl overflow-hidden group shadow-2xl cursor-pointer block bg-black border border-white/10"
    >
      {/* Sleek Looping Video Background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none scale-105">
        <video 
          src={bgVideoUrl} 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-[15s]"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </div>

      {/* Gradients for UI separation */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent opacity-50" />
      
      {/* Top Left: LATEST UPDATE Badge */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-3 z-10">
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/20 shadow-xl">
          <span className="text-white text-[10px] sm:text-xs font-black tracking-widest uppercase">
            LATEST UPDATE • FACT FLOW
          </span>
        </div>
      </div>

      {/* Top Right: Glowing Logo */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 opacity-70 group-hover:opacity-100 transition-opacity">
        <div className="w-9 h-9 sm:w-12 h-12 bg-white/5 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)] text-white text-sm sm:font-bold">
          F
        </div>
      </div>

      {/* Center: The Actual Update Text */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-10 z-10">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-white/[0.85] text-xs sm:text-sm font-bold uppercase tracking-wider mb-1 sm:mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Breaking from Fact Flow Desk
          </p>
          <h2 className="text-white font-black text-lg sm:text-2xl lg:text-3xl leading-tight line-clamp-2 sm:line-clamp-3">
            "{article.title}"
          </h2>
          <p className="text-white/[0.85] mt-1.5 sm:mt-3 text-xs sm:text-sm max-w-2xl line-clamp-1 sm:line-clamp-2">
            {article.excerpt}
          </p>
          
          <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-5 text-white/[0.85] text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <span className="bg-white/10 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full hover:bg-white/20 transition-colors">
              Read Full Update
            </span>
            <span>•</span>
            <span>
              {new Date(article.publishedAt).toLocaleString("en-IN", {
                day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

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
function ArticleHeroCard({ article }: { article: Article }) {
  const sourceLabel = "Fact Flow Live"

  return (
    <Link href={`/article/${article._id}`} className="relative flex-shrink-0 w-[90vw] sm:w-[600px] lg:w-[800px] h-[320px] sm:h-[500px] rounded-2xl overflow-hidden group shadow-2xl cursor-pointer block">
      <div className="absolute inset-0 bg-zinc-950" />
      
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={article.image || getRandomFallback()}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-[15s] ease-linear group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = getRandomFallback()
            e.currentTarget.onerror = null
          }}
        />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjA1Ii8+Cjwvc3ZnPg==')] opacity-30 mix-blend-overlay pointer-events-none" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent opacity-50" />
      
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-3">
        <div className="flex items-center gap-2 bg-red-600/95 backdrop-blur-sm px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full border border-red-400/30 shadow-lg">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse shadow-[0_0_8px_white]" />
          <span className="text-white text-[10px] sm:text-xs font-black tracking-widest uppercase">
            LIVE UPDATE
          </span>
          {article.isPremium && <PremiumBadge size="sm" />}
          {article.isSponsored && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30 backdrop-blur-sm">
              Sponsored
            </span>
          )}
        </div>
      </div>

      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 bg-black/70 backdrop-blur-sm px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full border border-white/10 shadow-lg z-20">
        <span className="text-white/90 text-[10px] sm:text-xs font-bold tracking-wide uppercase">
          {sourceLabel}
        </span>
      </div>

      <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 z-10">
        <h2 className="text-white font-black text-lg sm:text-3xl lg:text-4xl leading-tight line-clamp-2 sm:line-clamp-3 group-hover:text-red-400 transition-colors drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          {article.title}
        </h2>
        <p className="text-white/80 mt-2 text-xs sm:text-base max-w-2xl line-clamp-1 sm:line-clamp-2 drop-shadow-md font-medium">
          {article.excerpt}
        </p>
        <div className="flex items-center gap-2 sm:gap-3 mt-3 text-white/[0.85] text-[10px] sm:text-xs font-bold uppercase tracking-wider">
          <span className="bg-white/10 px-2 py-0.5 rounded backdrop-blur-sm">Read Full Story</span>
          <span>•</span>
          <span>
            {new Date(article.publishedAt).toLocaleString("en-IN", {
              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
            })}
          </span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 h-1 bg-red-600 animate-[progress_15s_linear_infinite]" style={{ width: '100%' }} />

      <style>{`
        @keyframes progress {
          0% { transform: scaleX(0); transform-origin: left; }
          100% { transform: scaleX(1); transform-origin: left; }
        }
      `}</style>
    </Link>
  )
}

export function BreakingNewsHero() {
  const { theme } = useTheme()
  const isDark = theme !== "light"
  const [articles, setArticles] = useState<Article[]>([])
  const [socialUpdates, setSocialUpdates] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isPausedRef = useRef(false)
  const isManualScrollingRef = useRef(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        let r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/news?breaking=true&limit=20&region=global&${useAuthStore.getState().user?.uid ? 'firebaseUid=' + useAuthStore.getState().user?.uid : ''}`)
        let data = r.ok ? await r.json() : { success: false, data: [] }
        
        let allArticles = data.success && data.data ? data.data : []

        if (allArticles.length < 15) {
          // Fallback to top standard global news if we don't have enough breaking
          const fbR = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/news?limit=20&region=global&${useAuthStore.getState().user?.uid ? 'firebaseUid=' + useAuthStore.getState().user?.uid : ''}`)
          const fbData = fbR.ok ? await fbR.json() : null
          if (fbData && fbData.success && fbData.data) {
             const existingIds = new Set(allArticles.map((a: any) => a._id))
             const more = fbData.data.filter((a: any) => !existingIds.has(a._id))
             allArticles = [...allArticles, ...more].slice(0, 20)
          }
        }

        if (allArticles.length > 0) {
          // Separate social updates (Twitter/Reddit) from standard breaking news
          const social = allArticles.filter((a: any) => 
            a.source?.toLowerCase().includes("twitter") || 
            a.source?.toLowerCase().includes("nitter") || 
            a.source?.toLowerCase().includes("reddit")
          )
          const standard = allArticles.filter((a: any) => !social.includes(a))
          
          setArticles(standard.length > 0 ? standard : allArticles)
          setSocialUpdates(social)
        }
        
        setLoading(false)
      } catch (e) {
        setLoading(false)
      }
    }
    fetchData()

    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Smooth CSS-like auto scroll with visibility-aware pause
  useEffect(() => {
    const container = scrollRef.current
    if (!container || articles.length === 0) return

    let animationId: number
    let isVisible = true

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting
    }, { threshold: 0.1 })
    observer.observe(container)

    const scroll = () => {
      if (isVisible && !isPausedRef.current && !isManualScrollingRef.current && container) {
        container.scrollLeft += 1.0
        if (container.scrollLeft >= (container.scrollWidth - container.clientWidth) / 2) {
          container.scrollLeft = 0
        }
      }
      animationId = requestAnimationFrame(scroll)
    }
    
    animationId = requestAnimationFrame(scroll)
    return () => {
      cancelAnimationFrame(animationId)
      observer.disconnect()
    }
  }, [articles.length])

  const scrollBy = (dir: "left" | "right") => {
    const container = scrollRef.current
    if (container) {
      isManualScrollingRef.current = true
      const scrollAmount = Math.min(600, container.clientWidth * 0.8)
      container.scrollBy({ left: dir === "right" ? scrollAmount : -scrollAmount, behavior: "smooth" })
      setTimeout(() => {
        isManualScrollingRef.current = false
      }, 600)
    }
  }

  if (loading) {
    return (
      <div className="w-full h-[500px] flex flex-col items-center justify-center bg-black">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 text-sm font-bold tracking-widest uppercase">Loading Live Broadcast...</p>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="w-full h-[360px] sm:h-[550px] flex flex-col items-center justify-center bg-black border-b border-white/10">
        <Globe className="w-16 h-16 text-white/20 mb-4" />
        <h2 className="text-white/60 text-xl font-bold uppercase tracking-widest">Global Desk Standby</h2>
        <p className="text-white/40 text-sm mt-2 max-w-md text-center">We are actively monitoring global sources for the top 15-20 biggest world news. Next update in a few minutes.</p>
      </div>
    )
  }

  // Mix Articles with Social Updates
  const items: any[] = []
  let updateIndex = 0

  articles.forEach((a, i) => {
    if (i > 0 && i % 2 === 0 && socialUpdates.length > 0) {
      // 1 Social Update every 2 articles for faster appearance
      const update = socialUpdates[updateIndex % socialUpdates.length]
      items.push({ type: "social", data: update })
      updateIndex++
    } else {
      items.push({ type: "article", data: a })
    }
  })

  // Duplicate items for seamless infinite scrolling to ensure enough width
  let displayItems = [...items]
  while (displayItems.length > 0 && displayItems.length < 8) {
    displayItems = [...displayItems, ...items]
  }

  return (
    <div className="relative w-full overflow-hidden bg-black py-4">

      <div 
        className="w-full h-[360px] sm:h-[550px] flex items-center"
        onMouseEnter={() => isPausedRef.current = true}
        onMouseLeave={() => isPausedRef.current = false}
        onTouchStart={() => isPausedRef.current = true}
        onTouchEnd={() => isPausedRef.current = false}
      >
        <div 
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 px-4 sm:px-10 overflow-x-auto scrollbar-hide py-4 sm:py-10 w-full"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {displayItems.map((item, idx) => (
            <motion.div
              key={`${item.data._id}-${idx}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (idx % items.length) * 0.1, duration: 0.5 }}
            >
              {item.type === "article" ? (
                <ArticleHeroCard article={item.data} />
              ) : (
                <SocialUpdateCard article={item.data} />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-10 sm:bottom-16 right-6 sm:right-12 flex items-center gap-3 z-30">
        <button
          onClick={() => scrollBy("left")}
          className="w-12 h-12 rounded-full bg-black/60 border border-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-red-600 hover:border-red-500 transition-all shadow-xl"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => scrollBy("right")}
          className="w-12 h-12 rounded-full bg-black/60 border border-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-red-600 hover:border-red-500 transition-all shadow-xl"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Left/Right Fade Overlays for seamless look */}
      <div className="absolute inset-y-0 left-0 w-8 sm:w-24 bg-gradient-to-r from-black to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-8 sm:w-24 bg-gradient-to-l from-black to-transparent pointer-events-none z-10" />

    </div>
  )
}
