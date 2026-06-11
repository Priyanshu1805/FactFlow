"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { SafeImage as Image } from "@/components/frontend/safe-image"
import Link from "next/link"
import { ArrowLeft, Clock, MapPin, Share2, Heart, Tag, BookOpen, Eye, ThumbsUp, ThumbsDown, Sparkles, ChevronDown, ChevronUp, Bookmark } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Navbar } from "@/components/frontend/navbar"
import { Footer } from "@/components/frontend/footer"
import { RelatedNews } from "@/components/frontend/related-news"
import { useAuthStore } from "@/store/auth-store"
import { getSavedItems, saveItem, unsaveItem } from "@/lib/api/saved"
import { toast } from "sonner"
import dynamic from "next/dynamic"
import { PremiumBadge } from "@/components/frontend/premium-badge"
import { PaywallOverlay } from "@/components/frontend/paywall-overlay"
import { useSubscription } from "@/lib/use-subscription"
import { AISummaryButton } from "@/components/frontend/article/ai-summary-button"

const ReactPlayer = dynamic(() => import("react-player")) as any

export default function ArticlePage() {
  const { slug } = useParams()
  const searchParams = useSearchParams()
  const videoUrl = searchParams.get("videoUrl")
  const { theme } = useTheme()
  const isDark = theme !== "light"
  const { user } = useAuthStore()
  const { canAccess } = useSubscription()
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [videoPlaying, setVideoPlaying] = useState(false)

  // Stats state
  const [stats, setStats] = useState({ likes: 0, dislikes: 0 })
  const [isLiked, setIsLiked] = useState(false)
  const [isDisliked, setIsDisliked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  // Share toast
  const [shareToast, setShareToast] = useState(false)
  
  // Article expand state
  const [articleExpanded, setArticleExpanded] = useState(false)

  const getDeviceId = () => {
    let deviceId = localStorage.getItem("ff_device_id")
    if (!deviceId) {
      deviceId = "dev_" + Math.random().toString(36).substring(2, 15) + Date.now()
      localStorage.setItem("ff_device_id", deviceId)
    }
    return deviceId
  }

  useEffect(() => {
    if (videoUrl) {
      const timer = setTimeout(() => setVideoPlaying(true), 500)
      return () => clearTimeout(timer)
    }
  }, [videoUrl])

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/news/${slug}?t=${Date.now()}`, { cache: "no-store" })
        if (!res.ok) throw new Error("Fetch failed")
        const data = await res.json()
        if (data.success && data.data) {
          setArticle(data.data)
          setStats({
            likes: data.data.likes || 0,
            dislikes: data.data.dislikes || 0
          })

          const articleId = data.data._id

          // ── Like/Dislike state: restore from localStorage across sessions ──
          const likedSet: string[] = JSON.parse(localStorage.getItem("ff_news_liked") || "[]")
          const dislikedSet: string[] = JSON.parse(localStorage.getItem("ff_news_disliked") || "[]")
          setIsLiked(likedSet.includes(articleId))
          setIsDisliked(dislikedSet.includes(articleId))

          // ── Fetch if saved ──
          if (user) {
            getSavedItems(user.uid).then(res => {
              if (res.success && res.data.posts.some((p: any) => p._id === articleId)) {
                setIsSaved(true)
              }
            }).catch(() => {})
          }

          // ── View count: only once per browser session per article ──
          const sessionKey = `ff_news_viewed_${articleId}`
          if (!sessionStorage.getItem(sessionKey)) {
            sessionStorage.setItem(sessionKey, "1")
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/news/${articleId}/view`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ deviceId: getDeviceId(), userId: user?.uid })
            }).catch(() => {})

            // Also log to user reading history
            if (user?.uid) {
              fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/history`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  firebaseUid: user.uid,
                  itemId: articleId,
                  itemType: "post",
                  category: data.data.category || "General",
                  engagement: "viewed"
                })
              }).catch(() => {})
            }
          }
        }
        setLoading(false)
      } catch (error) {
        console.error("Failed to fetch article", error)
        setLoading(false)
      }
    }
    fetchArticle()
  }, [slug, user])

  const handleLike = async () => {
    if (!article) return
    const newLiked = !isLiked

    setIsLiked(newLiked)
    if (newLiked) setIsDisliked(false)
    
    setStats(prev => ({
      ...prev,
      likes: prev.likes + (newLiked ? 1 : -1),
      dislikes: isDisliked ? Math.max(0, prev.dislikes - 1) : prev.dislikes
    }))

    // Local Storage Persist
    const likedSet: string[] = JSON.parse(localStorage.getItem("ff_news_liked") || "[]")
    const dislikedSet: string[] = JSON.parse(localStorage.getItem("ff_news_disliked") || "[]")
    
    if (newLiked) {
      localStorage.setItem("ff_news_liked", JSON.stringify([...new Set([...likedSet, article._id])]))
      localStorage.setItem("ff_news_disliked", JSON.stringify(dislikedSet.filter((id: string) => id !== article._id)))
    } else {
      localStorage.setItem("ff_news_liked", JSON.stringify(likedSet.filter((id: string) => id !== article._id)))
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/news/${article._id}/interact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId: getDeviceId(), userId: user?.uid, action: newLiked ? "like" : "unlike" })
      })
      const data = await res.json()
      if (data.success) {
        setStats({ likes: data.data.likes, dislikes: data.data.dislikes })
      }
    } catch (err) {
      console.error(err)
      setIsLiked(!newLiked) // revert
    }
  }

  const handleDislike = async () => {
    if (!article) return
    const newDisliked = !isDisliked

    setIsDisliked(newDisliked)
    if (newDisliked) setIsLiked(false)
    
    setStats(prev => ({
      ...prev,
      dislikes: prev.dislikes + (newDisliked ? 1 : -1),
      likes: isLiked ? Math.max(0, prev.likes - 1) : prev.likes
    }))

    // Local Storage Persist
    const likedSet: string[] = JSON.parse(localStorage.getItem("ff_news_liked") || "[]")
    const dislikedSet: string[] = JSON.parse(localStorage.getItem("ff_news_disliked") || "[]")
    
    if (newDisliked) {
      localStorage.setItem("ff_news_disliked", JSON.stringify([...new Set([...dislikedSet, article._id])]))
      localStorage.setItem("ff_news_liked", JSON.stringify(likedSet.filter((id: string) => id !== article._id)))
    } else {
      localStorage.setItem("ff_news_disliked", JSON.stringify(dislikedSet.filter((id: string) => id !== article._id)))
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/news/${article._id}/interact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId: getDeviceId(), userId: user?.uid, action: newDisliked ? "dislike" : "undislike" })
      })
      const data = await res.json()
      if (data.success) {
        setStats({ likes: data.data.likes, dislikes: data.data.dislikes })
      }
    } catch (err) {
      console.error(err)
      setIsDisliked(!newDisliked) // revert
    }
  }

  const handleSaveToggle = async () => {
    if (!user || !article) {
      toast.error("Please login to save articles")
      return
    }
    try {
      if (isSaved) {
        setIsSaved(false)
        await unsaveItem(user.uid, article._id, "post")
        toast.success("Removed from saved items")
      } else {
        setIsSaved(true)
        await saveItem(user.uid, article._id, "post")
        toast.success("Article saved")
      }
    } catch (err) {
      setIsSaved(!isSaved) // revert
      toast.error("Failed to update saved state")
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    const title = article?.title || "Fact Flow News"
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const el = document.createElement("textarea")
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
    }
    setShareToast(true)
    setTimeout(() => setShareToast(false), 3000)
  }

  if (loading) {
    return (
      <main className={`min-h-screen ${isDark ? "bg-black" : "bg-gray-50"}`}>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </main>
    )
  }

  if (!article) {
    return (
      <main className={`min-h-screen ${isDark ? "bg-black" : "bg-gray-50"}`}>
        <Navbar />
        <div className="flex flex-col justify-center items-center h-screen">
          <h1 className={`text-4xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Article Not Found</h1>
          <Link href="/" className="text-purple-500 hover:underline">Return to Home</Link>
        </div>
      </main>
    )
  }

  const cleanContent = (text: string): string[] => {
    if (!text) return []
    let clean = text
    const blocklist = [
      "Subscribed with another email? Logout and Login with that one.",
      "Account subscription benefits alongside Premium Stories, Editorials, Opinions and more. Unlock these with Subscription",
      "The View From India",
      "Looking at World Affairs from the Indian perspective.",
      "First Day First Show",
      "News and reviews from the world of cinema and streaming.",
      "Today's Cache",
      "Your download of the top 5 technology stories of the day.",
      "Science For All",
      "The weekly newsletter from science writers takes the jargon out of science and puts the fun in!",
      "Data Point",
      "Decoding the headlines with facts, figures, and numbers",
      "Health Matters",
    ]
    blocklist.forEach(item => { clean = clean.split(item).join("") })
    clean = clean.replace(/The Hindu/gi, "Fact Flow")
    clean = clean.replace(/\bBBC\b/g, "Fact Flow")
    clean = clean.replace(/\bCNN\b/g, "Fact Flow")
    clean = clean.replace(/Reuters/gi, "Fact Flow")
    clean = clean.replace(/Al Jazeera/gi, "Fact Flow")
    clean = clean.replace(/New York Times/gi, "Fact Flow")
    const paragraphs = clean
      .split(/\n{2,}|\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0)
    return paragraphs
  }

  const paragraphs = cleanContent(article.content)

  return (
    <main className={`min-h-screen ${isDark ? "bg-[#0a0a0a]" : "bg-white"} transition-colors duration-500`}>
      <Navbar />

      <article className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">

          <Link href="/" className={`inline-flex items-center gap-2 text-sm font-medium mb-8 transition-colors ${isDark ? "text-white/50 hover:text-white" : "text-gray-400 hover:text-gray-900"}`}>
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="px-3 py-1 bg-red-500 text-white text-[11px] font-black rounded uppercase tracking-widest shadow">
              {article.category}
            </span>
            {article.isBreaking && (
              <span className="px-3 py-1 bg-yellow-500 text-black text-[11px] font-black rounded uppercase tracking-widest animate-pulse">
                Breaking
              </span>
            )}
            {article.isPremium && <PremiumBadge size="md" />}
            {article.location && article.location !== "Global" && (
              <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold border ${
                isDark ? "border-white/20 text-white/70 bg-white/5" : "border-gray-300 text-gray-600 bg-gray-50"
              }`}>
                <MapPin className="w-3 h-3" />
                {article.location}
              </span>
            )}
          </div>

          <h1 className={`text-3xl md:text-[2.6rem] font-black leading-[1.15] tracking-tight mb-5 ${
            isDark ? "text-white" : "text-gray-950"
          }`}>
            {article.title}
          </h1>

          <p className={`text-lg md:text-xl font-medium leading-relaxed mb-4 border-l-4 pl-4 ${
            isDark ? "text-white/[0.85] border-red-500" : "text-gray-700 border-red-500"
          }`}>
            {article.excerpt}
          </p>

          <AISummaryButton articleText={article.content} />

          <div className="flex flex-col gap-3 my-6 pb-2">
            <div className={`flex flex-wrap items-center gap-2 text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              <span className={`font-semibold ${isDark ? "text-white" : "text-black"}`}>@FactFlowNews</span>
              <span>{Number(article.views).toLocaleString("en-IN")} views</span>
              <span>{new Date(article.publishedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
              <span className="text-gray-500">#{article.category.toLowerCase().replace(/\s+/g, '')} ...more</span>
            </div>
          </div>

          <div
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold shadow-2xl transition-all duration-300 ${
              shareToast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            } ${
              isDark ? "bg-white text-black" : "bg-gray-900 text-white"
            }`}
          >
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            Link copied to clipboard!
          </div>

          {videoUrl ? (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-10 bg-black shadow-2xl">
              <ReactPlayer
                url={decodeURIComponent(videoUrl)}
                width="100%" height="100%"
                playing={videoPlaying} controls muted={false}
                config={{ youtube: { playerVars: { origin: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000' } } }}
              />
            </div>
          ) : (
            <figure className="mb-10">
              <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src={article.image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=800&fit=crop"}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
              </div>
              <figcaption className={`mt-2 text-xs flex items-center gap-1 ${
                isDark ? "text-white/40" : "text-gray-400"
              }`}>
                <MapPin className="w-3 h-3" />
                {article.location && article.location !== "Global" ? `${article.location} — ` : ""}Fact Flow Photo
              </figcaption>
            </figure>
          )}

          {article.isPremium && !canAccess("pro") ? (
            <PaywallOverlay />
          ) : (
            <div className={`mb-8 space-y-6 relative ${
              isDark ? "text-white/[0.85]" : "text-gray-800"
            } ${!articleExpanded && paragraphs.length > 2 ? "pb-24 overflow-hidden" : ""}`}>
              {(articleExpanded ? paragraphs : paragraphs.slice(0, 3)).map((para, i) => {
                if (i === 0) {
                  return (
                    <p
                      key={i}
                      className={`text-[1.15rem] leading-[1.9] font-medium first-letter:text-6xl first-letter:font-black first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-[0.8] ${
                        isDark ? "first-letter:text-red-400" : "first-letter:text-red-500"
                      }`}
                    >
                      {para}
                    </p>
                  )
                }
                if (i % 4 === 0 && i !== 0) {
                  return (
                    <div key={`wrap-${i}`}>
                      <hr className={`border-0 border-t my-2 ${
                        isDark ? "border-white/5" : "border-gray-100"
                      }`} />
                      <p className="text-[1.08rem] leading-[1.9]">{para}</p>
                    </div>
                  )
                }
                return (
                  <p key={i} className="text-[1.08rem] leading-[1.9]">{para}</p>
                )
              })}

              {!articleExpanded && paragraphs.length > 3 && (
                <div className={`absolute bottom-0 left-0 w-full pt-32 pb-2 flex justify-center bg-gradient-to-t ${
                  isDark ? "from-[#0a0a0a] via-[#0a0a0a]/80" : "from-white via-white/80"
                } to-transparent pointer-events-none`}>
                  <button
                    onClick={() => setArticleExpanded(true)}
                    className={`pointer-events-auto flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm shadow-xl transition-all active:scale-95 ${
                      isDark ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800"
                    }`}
                  >
                    Read full article
                    <ChevronDown className="w-4 h-4 animate-bounce" />
                  </button>
                </div>
              )}

              {articleExpanded && paragraphs.length > 3 && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => {
                      setArticleExpanded(false);
                      window.scrollTo({ top: 300, behavior: "smooth" });
                    }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all active:scale-95 ${
                      isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    Close article
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className={`flex flex-wrap items-center gap-2 mb-10 pt-6 border-t ${
              isDark ? "border-white/10" : "border-gray-200"
            }`}>
              <Tag className={`w-4 h-4 ${isDark ? "text-white/40" : "text-gray-400"}`} />
              {article.tags.map((tag: string) => (
                <span
                  key={tag}
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isDark ? "bg-white/5 text-white/60 border border-white/10 hover:border-red-500/40" : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600"
                  } transition-colors cursor-default`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}



          {/* Action Bar (Moved above comments) */}
          <div className={`flex flex-wrap items-center justify-between gap-4 mt-8 mb-6 border-b pb-6 ${
            isDark ? "border-white/10" : "border-gray-200"
          }`}>
            
            {/* User Profile (Reader) */}
            <Link href={user ? `/u/${(user as any).username || user.uid}` : "/login"} className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-red-500 shadow-sm flex items-center justify-center text-white font-black text-sm">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.displayName ? user.displayName.charAt(0).toUpperCase() : "G"
                )}
              </div>
              <span className={`text-[15px] font-bold group-hover:underline ${isDark ? "text-white" : "text-gray-900"}`}>
                {user?.displayName || "Guest"}
              </span>
            </Link>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Like / Dislike Pill */}
              <div className={`flex items-center rounded-full overflow-hidden transition-colors ${
                isDark ? "bg-white/10 hover:bg-white/20" : "bg-gray-100 hover:bg-gray-200"
              }`}>
                <button 
                  onClick={handleLike} 
                  className={`flex items-center gap-2 px-4 py-2 transition-transform active:scale-95 ${isLiked ? (isDark ? "text-green-400 bg-green-500/10" : "text-green-600 bg-green-500/10") : ""}`}
                >
                  <ThumbsUp className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                  <span className="font-semibold text-sm">
                    {Math.max(0, stats.likes) > 999 ? (Math.max(0, stats.likes)/1000).toFixed(1) + 'K' : Math.max(0, stats.likes)}
                  </span>
                </button>
                <div className={`w-px h-5 ${isDark ? "bg-white/20" : "bg-gray-300"}`}></div>
                <button 
                  onClick={handleDislike}
                  className={`flex items-center gap-2 px-4 py-2 transition-transform active:scale-95 ${isDisliked ? (isDark ? "text-red-400 bg-red-500/10" : "text-red-600 bg-red-500/10") : ""}`}
                >
                  <ThumbsDown className={`w-5 h-5 ${isDisliked ? "fill-current" : ""}`} />
                  <span className="font-semibold text-sm">
                    {Math.max(0, stats.dislikes) > 999 ? (Math.max(0, stats.dislikes)/1000).toFixed(1) + 'K' : Math.max(0, stats.dislikes)}
                  </span>
                </button>
              </div>

              {/* Save Circle */}
              <button 
                onClick={handleSaveToggle}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-95 ${
                  isDark ? "bg-white/10 hover:bg-white/20" : "bg-gray-100 hover:bg-gray-200"
                } ${isSaved ? "text-red-500" : ""}`}
                aria-label="Save Article"
              >
                <Bookmark className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
              </button>

              {/* Share Circle */}
              <button 
                onClick={handleShare}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-95 ${
                  isDark ? "bg-white/10 hover:bg-white/20" : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <RelatedNews currentCategory={article.category} currentArticleId={article._id} />
        </div>
      </article>

      <Footer />
    </main>
  )
}
