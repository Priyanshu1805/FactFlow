"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { StoryTray } from "@/components/frontend/stories/story-tray"
import { SocialFeed } from "@/components/frontend/social/social-feed"
import { SocialInbox } from "@/components/frontend/social/social-inbox"
import { PostCard } from "@/components/frontend/social/post-card"
import { 
  Play, Heart, Eye, ArrowRight, MessageSquare, 
  Plus, Bell, ChevronLeft, Search, Loader2, UserPlus, MessageCircle, X, Sparkles, Globe, Clapperboard
} from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import Link from "next/link"
import { AccessibleImage as Image } from "@/components/frontend/accessible-image"
import { CreateMenuSheet } from "@/components/frontend/create-menu-sheet"
import { UploadFlowModal } from "@/components/frontend/upload-flow-modal"
import { SocialNotificationPanel } from "@/components/frontend/social/social-notification-panel"
import { toast } from "sonner"
import { useSocket } from "@/hooks/use-socket"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

function ReelsScroller() {
  const { theme } = useTheme()
  const isDark = theme !== "light"
  const [reels, setReels] = useState<any[]>([])

  const { socket } = useSocket()

  useEffect(() => {
    fetch(`${API}/reels?limit=10`)
      .then((res) => {
        if (!res.ok) throw new Error("Fetch failed")
        return res.json()
      })
      .then((data) => {
        if (data.success && data.data) {
          const formatted = data.data.map((item: any) => ({
            id: item._id,
            title: item.title || item.description || "Reel",
            views: item.views || 0,
            likes: item.likes || 0,
            thumbnail: item.thumbnailUrl || "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=300&h=500&fit=crop",
            tag: item.tags?.[0] || "Reel",
          }))
          setReels(formatted)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!socket) return
    socket.on("new_reel", (item: any) => {
      const formatted = {
        id: item._id,
        title: item.title || item.description || "Reel",
        views: item.views || 0,
        likes: item.likes || 0,
        thumbnail: item.thumbnailUrl || "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=300&h=500&fit=crop",
        tag: item.tags?.[0] || "Reel",
      }
      setReels(prev => [formatted, ...prev].slice(0, 10))
    })
    return () => {
      socket.off("new_reel")
    }
  }, [socket])

  if (reels.length === 0) return null

  return (
    <div className="w-full max-w-[600px] mx-auto px-4 pb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-red-500/15 rounded-lg">
            <Play className="w-4 h-4 text-red-500 fill-red-500" />
          </div>
          <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            News Shorts
          </h3>
        </div>
        <Link href="/reels" className="flex items-center gap-1 text-red-500 text-xs font-semibold hover:text-red-400 transition-colors">
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
        {reels.map((reel) => (
          <Link
            key={reel.id}
            href={`/reels?id=${reel.id}`}
            className="group relative shrink-0 w-32 snap-start"
          >
            <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-gray-900">
              <Image
                src={reel.thumbnail}
                alt={reel.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
              
              <div className="absolute top-2 left-2">
                <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-semibold rounded-md">
                  {reel.tag}
                </span>
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-red-500/80 transition-colors">
                  <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                </div>
              </div>

              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-white text-[11px] font-semibold line-clamp-2 mb-1">{reel.title}</p>
                <div className="flex items-center gap-2 text-white/70 text-[10px]">
                  <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{reel.views}</span>
                  <span className="flex items-center gap-0.5"><Heart className="w-2.5 h-2.5" />{reel.likes}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

interface SocialFeedPageProps {
  isDark: boolean
  onStoryClick: (group: any, index: number) => void
}

export function SocialFeedPage({ isDark, onStoryClick }: SocialFeedPageProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuthStore()

  const [activeTab, setActiveTab] = useState<"feed" | "chats" | "search">("feed")

  useEffect(() => {
    if (!user) return
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
    fetch(`${API}/notifications/read-all`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firebaseUid: user.uid })
    }).catch(() => {})
    window.dispatchEvent(new CustomEvent("social_notifications_read"))
  }, [user])

  // Modals & Menu States
  const [createMenuOpen, setCreateMenuOpen] = useState(false)
  const [uploadType, setUploadType] = useState<"story" | "post" | "shorts">("post")
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [notifLoading, setNotifLoading] = useState(false)
  
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length
  }, [notifications])

  // Search tab states
  const [searchVal, setSearchVal] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  // Explore Feed & Meta AI states
  const [searchSubTab, setSearchSubTab] = useState<"explore" | "ai">("explore")
  const [explorePosts, setExplorePosts] = useState<any[]>([])
  const [exploreReels, setExploreReels] = useState<any[]>([])
  const [exploreLoading, setExploreLoading] = useState(false)
  const [aiQuery, setAiQuery] = useState("")
  const [aiMessages, setAiMessages] = useState<any[]>([
    { role: "assistant", content: "Hello! I am FactFlow Meta AI. Ask me to find verified creators, trending reels/shorts, popular posts, or anything else about our social platform." }
  ])
  const [aiLoading, setAiLoading] = useState(false)
  const [selectedPost, setSelectedPost] = useState<any | null>(null)

  const formatViews = (num: number) => {
    if (!num) return "0"
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M"
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K"
    return num.toString()
  }

  const exploreItems = useMemo(() => {
    const items: any[] = []
    const maxLength = Math.max(exploreReels.length, explorePosts.length)
    for (let i = 0; i < maxLength; i++) {
      if (exploreReels[i]) items.push({ ...exploreReels[i], exploreType: "reel" })
      if (explorePosts[i]) items.push({ ...explorePosts[i], exploreType: "post" })
    }
    return items
  }, [exploreReels, explorePosts])

  // Fetch explore content
  useEffect(() => {
    if (activeTab !== "search") return
    setExploreLoading(true)
    
    const fetchReels = fetch(`${API}/reels?limit=6`)
      .then(res => {
        if (!res.ok) throw new Error("Fetch failed")
        return res.json()
      })
      .catch(() => ({ success: false, data: [] }))
    
    const fetchPosts = fetch(`${API}/posts/feed?limit=6${user?.uid ? '&firebaseUid=' + user.uid : ''}`)
      .then(res => {
        if (!res.ok) throw new Error("Fetch failed")
        return res.json()
      })
      .catch(() => ({ success: false, posts: [] }))
    
    Promise.all([fetchReels, fetchPosts])
      .then(([reelsData, postsData]) => {
        if (reelsData.success && reelsData.data) {
          setExploreReels(reelsData.data)
        }
        if (postsData.success && postsData.posts) {
          setExplorePosts(postsData.posts)
        }
      })
      .catch(() => {})
      .finally(() => {
        setExploreLoading(false)
      })
  }, [activeTab])

  // AI submit handler
  const handleAiSubmit = async (customQuery?: string) => {
    const queryToSend = customQuery || aiQuery
    if (!queryToSend.trim()) return
    
    const userMsg = { role: "user", content: queryToSend }
    setAiMessages(prev => [...prev, userMsg])
    setAiQuery("")
    setAiLoading(true)
    
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `User is searching/asking about the social page. Answer their questions or suggest related profiles/shorts/posts on our platform. Query: "${queryToSend}"`,
          model: "free-unlimited"
        })
      })
      
      if (!res.ok) {
        throw new Error("AI query failed")
      }
      
      const reader = res.body?.getReader()
      if (!reader) {
        setAiMessages(prev => [...prev, { role: "assistant", content: "AI engine is currently unavailable." }])
        return
      }
      
      setAiMessages(prev => [...prev, { role: "assistant", content: "" }])
      
      const decoder = new TextDecoder()
      let assistantResponse = ""
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value)
        assistantResponse += text
        setAiMessages(prev => {
          const updated = [...prev]
          if (updated.length > 0) {
            updated[updated.length - 1] = { role: "assistant", content: assistantResponse }
          }
          return updated
        })
      }
      
    } catch {
      setAiMessages(prev => [...prev, { role: "assistant", content: "Failed to connect to Meta AI. Please try again in a moment." }])
    } finally {
      setAiLoading(false)
    }
  }

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab === "chats") {
      setActiveTab("chats")
    } else if (tab === "search") {
      setActiveTab("search")
    } else {
      setActiveTab("feed")
    }
  }, [searchParams])

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return
    setNotifLoading(true)
    try {
      const res = await fetch(`${API}/notifications?firebaseUid=${user.uid}`)
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (data.success) {
        setNotifications(data.notifications)
      }
    } catch {
      toast.error("Failed to load notifications")
    } finally {
      setNotifLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications() // fetch immediately to get the unread count for badge
    
    // Listen for real-time global notifications dispatched by the NotificationBell websocket
    const handleRealtimeNotif = () => fetchNotifications()
    window.addEventListener("global_new_notification", handleRealtimeNotif)
    return () => window.removeEventListener("global_new_notification", handleRealtimeNotif)
  }, [user])

  useEffect(() => {
    if (notificationsOpen) {
      fetchNotifications()
    }
  }, [notificationsOpen])

  const handleMarkRead = async (id: string) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
    try {
      await fetch(`${API}/notifications/${id}/read`, { method: "PUT" })
    } catch {}
  }

  const [searchResultPosts, setSearchResultPosts] = useState<any[]>([])
  const [searchResultReels, setSearchResultReels] = useState<any[]>([])

  // Custom Search Handler
  useEffect(() => {
    if (activeTab !== "search" || !searchVal.trim()) {
      setSearchResults([])
      setSearchResultPosts([])
      setSearchResultReels([])
      return
    }
    setSearchLoading(true)
    const delay = setTimeout(() => {
      const fetchUsers = fetch(`${API}/users?search=${encodeURIComponent(searchVal)}&limit=20${user?.uid ? '&viewerUid=' + user.uid : ''}`)
        .then(res => {
          if (!res.ok) throw new Error("Fetch failed")
          return res.json()
        })
        .catch(() => ({ success: false, users: [] }))

      const fetchSearchPosts = fetch(`${API}/posts/feed?search=${encodeURIComponent(searchVal)}&limit=10${user?.uid ? '&firebaseUid=' + user.uid : ''}`)
        .then(res => {
          if (!res.ok) throw new Error("Fetch failed")
          return res.json()
        })
        .catch(() => ({ success: false, posts: [] }))

      const fetchSearchReels = fetch(`${API}/reels?search=${encodeURIComponent(searchVal)}&limit=10`)
        .then(res => {
          if (!res.ok) throw new Error("Fetch failed")
          return res.json()
        })
        .catch(() => ({ success: false, data: [] }))

      Promise.all([fetchUsers, fetchSearchPosts, fetchSearchReels])
        .then(([usersData, postsData, reelsData]) => {
          if (usersData.success) {
            setSearchResults(usersData.users)
          }
          if (postsData.success) {
            setSearchResultPosts(postsData.posts)
          }
          if (reelsData.success) {
            setSearchResultReels(reelsData.data)
          }
        })
        .catch(() => {})
        .finally(() => setSearchLoading(false))
    }, 400)

    return () => clearTimeout(delay)
  }, [searchVal, activeTab])

  const handleFollowToggle = async (targetUser: any) => {
    if (!user) { toast.error("Please login to follow"); return }
    try {
      const isCurrentlyFollowing = targetUser.isFollowing;
      const action = isCurrentlyFollowing ? "unfollow" : "follow";
      const method = isCurrentlyFollowing ? "DELETE" : "POST";

      const res = await fetch(`${API}/users/${targetUser._id}/${action}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ viewerUid: user.uid })
      })
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (data.success) {
        setSearchResults(prev => prev.map(u => {
          if (u._id === targetUser._id) {
            return {
              ...u,
              isFollowing: !isCurrentlyFollowing,
              followers: isCurrentlyFollowing ? Math.max(0, u.followers - 1) : u.followers + 1
            }
          }
          return u
        }))
        toast.success(isCurrentlyFollowing ? `Unfollowed @${targetUser.username}` : `Followed @${targetUser.username}`)
      }
    } catch {
      toast.error("Follow action failed")
    }
  }

  const navigateToChat = async (targetUser: any) => {
    if (!user) return
    try {
      const res = await fetch(`${API}/chats/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseUid: user.uid, userId: targetUser._id })
      })
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (data.success) {
        router.push("/social?tab=chats")
      }
    } catch {
      toast.error("Could not initiate chat")
    }
  }

  return (
    <div className="w-full">
      {/* ─────────────────────────────────────────────
          INSTAGRAM STYLE SOCIAL HEADER
          ───────────────────────────────────────────── */}
      <div className={`sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b backdrop-blur-md ${
        isDark ? "bg-black/90 border-white/10" : "bg-white/95 border-gray-200"
      }`}>
        {/* Left Side: Plus Icon or Back Arrow */}
        {activeTab !== "feed" ? (
          <button 
            onClick={() => {
              setActiveTab("feed")
              router.push("/social")
            }}
            className={`p-2 rounded-xl transition-all ${isDark ? "hover:bg-white/10 text-white" : "hover:bg-gray-100 text-black"}`}
            title="Back to Feed"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        ) : (
          <button 
            onClick={() => setCreateMenuOpen(true)}
            className={`p-2 rounded-xl transition-all ${isDark ? "hover:bg-white/10 text-white" : "hover:bg-gray-100 text-black"}`}
            title="Create Post"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}

        {/* Center Title */}
        <h1 
          onClick={() => {
            setActiveTab("feed")
            router.push("/social")
          }}
          className="cursor-pointer font-black text-2xl tracking-tighter italic bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent select-none"
        >
          FACT FLOW FEED
        </h1>

        {/* Right Side: Message & Heart Icons */}
        <div className="flex items-center gap-1">
          {/* Shorts Link */}
          <Link
            href="/reels"
            className={`p-2 rounded-xl transition-all ${isDark ? "hover:bg-white/10 text-white" : "hover:bg-gray-100 text-black"}`}
            title="Watch Shorts"
          >
            <Clapperboard className="w-6 h-6 hover:text-red-500 transition-colors" />
          </Link>

          {/* Notifications Heart */}
          <button 
            onClick={() => setNotificationsOpen(true)}
            className={`relative p-2 rounded-xl transition-all ${isDark ? "hover:bg-white/10 text-white" : "hover:bg-gray-100 text-black"}`}
          >
            <Bell className="w-6 h-6 hover:text-red-500 hover:fill-red-500 transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.8)] border border-black animate-pulse">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Inbox Chat icon */}
          <button 
            onClick={() => {
              if (activeTab === "chats") {
                setActiveTab("feed")
                router.push("/social")
              } else {
                setActiveTab("chats")
                router.push("/social?tab=chats")
              }
            }}
            className={`p-2 rounded-xl transition-all ${
              activeTab === "chats"
                ? "bg-red-500/10 text-red-500"
                : isDark ? "hover:bg-white/10 text-white" : "hover:bg-gray-100 text-black"
            }`}
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          TAB CONTENT RENDERING
          ───────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === "feed" && (
          <motion.div
            key="feed"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="pt-4"
          >
            <div className={`border-b ${isDark ? "border-white/10" : "border-gray-200"} mb-6`}>
              <StoryTray onStoryClick={onStoryClick} />
            </div>
            <SocialFeed isDark={isDark} />
          </motion.div>
        )}

        {activeTab === "chats" && (
          <motion.div
            key="chats"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-[1000px] mx-auto px-0 md:px-4 py-4"
          >
            <SocialInbox isDark={isDark} />
          </motion.div>
        )}

        {activeTab === "search" && (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-[700px] mx-auto px-4 py-6"
          >
            {/* Search Input Bar */}
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border mb-6 ${
              isDark ? "bg-[#161616] border-zinc-800" : "bg-white border-gray-200"
            }`}>
              <Search className="w-5 h-5 text-gray-400" />
              <input 
                type="text"
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                placeholder="Search social creators..."
                className={`bg-transparent text-sm border-none outline-none w-full ${isDark ? "text-white placeholder:text-gray-500" : "text-gray-900 placeholder:text-gray-400"}`}
              />
              {searchVal && <button onClick={() => setSearchVal("")}><X className="w-4 h-4" /></button>}
            </div>

            {/* Sub-tab Switcher (only if search input is empty) */}
            {!searchVal && (
              <div className={`flex gap-4 border-b pb-3 mb-6 ${isDark ? "border-white/5" : "border-gray-200"}`}>
                <button
                  onClick={() => setSearchSubTab("explore")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    searchSubTab === "explore" 
                      ? isDark ? "bg-white text-black border-white" : "bg-gray-900 text-white border-gray-900" 
                      : (isDark ? "bg-white/5 border-white/10 text-white/70 hover:bg-white/10" : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200")
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  Explore Feed
                </button>
                <button
                  onClick={() => setSearchSubTab("ai")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    searchSubTab === "ai" 
                      ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white border-transparent shadow-[0_0_15px_rgba(79,70,229,0.4)]" 
                      : (isDark ? "bg-white/5 border-white/10 text-white/70 hover:bg-white/10" : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200")
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  Meta AI Search
                </button>
              </div>
            )}

            {/* Results Rendering */}
            {searchVal ? (
              /* ACTIVE SEARCH QUERY RESULTS */
              searchLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : searchResults.length === 0 && searchResultReels.length === 0 && searchResultPosts.length === 0 ? (
                <div className="text-center py-20 text-gray-500 text-sm">
                  No creators, shorts, or posts matching your query
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Creators Section */}
                  {searchResults.length > 0 && (
                    <div>
                      <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? "text-white/40" : "text-gray-400"}`}>Creators</h4>
                      <div className="flex flex-col gap-3">
                        {searchResults.map(u => {
                          const isFollowing = u.isFollowing
                          return (
                            <div 
                              key={u._id}
                              className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                                isDark ? "bg-[#161616] border-zinc-850 hover:bg-zinc-900" : "bg-white border-gray-100 hover:bg-gray-50"
                              }`}
                            >
                              <Link href={`/u/${u.username}`} className="flex items-center gap-3 min-w-0">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                                  {u.avatar ? (
                                    <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold">
                                      {u.name?.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-sm truncate flex items-center gap-1">
                                    {u.name}
                                    {u.isVerified && (
                                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-blue-500 fill-current">
                                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7L6 12.6l1.5-1.5 2.6 2.6 6.4-6.4 1.5 1.5-7.9 7.9z" />
                                      </svg>
                                    )}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    @{u.username} • {u.followers || 0} {(u.followers === 1) ? 'follower' : 'followers'}
                                  </p>
                                </div>
                              </Link>

                              {user && user.uid !== u.firebaseUid && (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => navigateToChat(u)}
                                    className={`p-2 rounded-xl transition-all ${isDark ? "bg-zinc-800 hover:bg-zinc-700" : "bg-gray-100 hover:bg-gray-200"}`}
                                  >
                                    <MessageCircle className="w-4 h-4 text-blue-500" />
                                  </button>
                                  <button
                                    onClick={() => handleFollowToggle(u)}
                                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                      isFollowing 
                                        ? (isDark ? "bg-zinc-850 text-white/50" : "bg-gray-100 text-gray-500")
                                        : "bg-blue-600 hover:bg-blue-500 text-white"
                                    }`}
                                  >
                                    {isFollowing ? "Following" : "Follow"}
                                  </button>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Reels/Shorts Section */}
                  {searchResultReels.length > 0 && (
                    <div>
                      <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? "text-white/40" : "text-gray-400"}`}>Shorts</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {searchResultReels.map((reel) => (
                          <Link
                            key={reel._id}
                            href={`/reels?id=${reel._id}`}
                            className={`group relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:scale-[1.02] transition-all ${isDark ? "bg-zinc-900 border border-white/5" : "bg-gray-100 border border-gray-200"}`}
                          >
                            <img 
                              src={reel.thumbnailUrl || "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=300&h=500&fit=crop"} 
                              alt="" 
                              className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex flex-col justify-end p-2.5">
                              <p className="text-white text-[11px] font-bold line-clamp-2">{reel.title}</p>
                              <span className="text-[9px] text-white/60 flex items-center gap-0.5 mt-0.5"><Eye className="w-2.5 h-2.5" /> {reel.views || 0}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Posts Section */}
                  {searchResultPosts.length > 0 && (
                    <div>
                      <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? "text-white/40" : "text-gray-400"}`}>Posts</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {searchResultPosts.map((post) => (
                          <div 
                            key={post._id}
                            className={`group relative aspect-square rounded-2xl overflow-hidden border cursor-pointer ${
                              isDark ? "bg-[#161616] border-zinc-850" : "bg-white border-gray-150"
                            }`}
                          >
                            {post.media && post.media[0] ? (
                              <img 
                                src={post.media[0].url} 
                                alt="" 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col justify-between p-3 bg-gradient-to-br from-zinc-800 to-zinc-900">
                                <p className="text-white text-[10px] font-bold line-clamp-4">{post.caption || "Text Post"}</p>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white text-xs font-bold">
                              <span className="flex items-center gap-0.5"><Heart className="w-3.5 h-3.5 fill-current" /> {post.likes?.length || 0}</span>
                              <span className="flex items-center gap-0.5"><MessageCircle className="w-3.5 h-3.5" /> {post.commentsCount || 0}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            ) : searchSubTab === "explore" ? (
              /* EXPLORE MODE - TRENDING GRID (REELS & POSTS) */
              exploreLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 3-Column Instagram Style Explore Grid */}
                  <div className="grid grid-cols-3 gap-0.5 sm:gap-1.5">
                    {exploreItems.map((item) => {
                      const isReel = item.exploreType === "reel";
                      const title = item.title || item.caption || "";
                      const imgUrl = isReel 
                        ? item.thumbnailUrl 
                        : (item.media?.[0]?.url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=400&fit=crop");
                      
                      // Fake views calculation for posts if views count not present
                      const viewsCount = isReel ? (item.views || 0) : ((item.likes?.length || 0) * 14 + 18);

                      return (
                        <div
                          key={item._id}
                          onClick={() => {
                            if (isReel) {
                              router.push(`/reels?id=${item._id}`);
                            } else {
                              setSelectedPost(item);
                            }
                          }}
                          className="group relative aspect-[3/4] overflow-hidden bg-zinc-950 cursor-pointer transition-all active:scale-95 shadow-inner"
                        >
                          <img
                            src={imgUrl}
                            alt={title}
                            className="w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-300 select-none"
                            draggable={false}
                          />

                          {/* White Text Views Overlay at Bottom-Left with eye icon */}
                          <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 text-white font-bold text-[10px] sm:text-xs drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] select-none">
                            <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                            <span>{formatViews(viewsCount)}</span>
                          </div>

                          {/* Subtle overlay shading */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            ) : (
              /* META AI SEARCH ASSISTANT PANEL */
              <div className={`rounded-3xl border p-4 flex flex-col min-h-[400px] ${
                isDark ? "bg-[#161616] border-zinc-800" : "bg-gray-50 border-gray-200"
              }`}>
                {/* Suggestions / Recent Searches Pills */}
                {aiMessages.length === 1 && (
                  <div className="mb-4">
                    <p className={`text-xs font-bold mb-2.5 uppercase tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>Suggested Prompts</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "🔍 Find verified social accounts",
                        "🔥 Suggest trending technology posts",
                        "📸 Give ideas for trending news reels",
                        "✨ How do I get more followers?"
                      ].map((pill, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAiSubmit(pill)}
                          className={`text-xs px-3.5 py-2 rounded-xl border text-left font-semibold active:scale-95 transition-all ${
                            isDark 
                              ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-white" 
                              : "bg-white border-gray-200 hover:bg-gray-100 text-black"
                          }`}
                        >
                          {pill}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Log */}
                <div className="flex-1 overflow-y-auto space-y-4 max-h-[300px] mb-4 pr-1 scrollbar-hide">
                  {aiMessages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === "user" 
                          ? "bg-blue-600 text-white rounded-tr-none" 
                          : (isDark ? "bg-zinc-800 text-white/90 rounded-tl-none border border-zinc-700" : "bg-white text-gray-800 rounded-tl-none shadow-sm border border-gray-200")
                      }`}>
                        {msg.content || (
                          <span className="flex items-center gap-1.5 text-xs text-white/50">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking...
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Prompt Input form */}
                <form onSubmit={(e) => { e.preventDefault(); handleAiSubmit(); }} className="flex gap-2">
                  <input
                    type="text"
                    value={aiQuery}
                    onChange={e => setAiQuery(e.target.value)}
                    placeholder="Ask Meta AI anything..."
                    disabled={aiLoading}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                      isDark 
                        ? "bg-zinc-900 border-zinc-800 text-white focus:border-indigo-500" 
                        : "bg-white border-gray-200 text-black focus:border-indigo-500"
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={aiLoading || !aiQuery.trim()}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    Send
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────
          CREATOR POPUPS & UPLOAD MODALS
          ───────────────────────────────────────────── */}
      <CreateMenuSheet 
        isOpen={createMenuOpen} 
        onClose={() => setCreateMenuOpen(false)} 
        isDark={isDark}
        onSelect={(type) => {
          setUploadType(type)
          setUploadModalOpen(true)
        }}
      />

      <UploadFlowModal 
        isOpen={uploadModalOpen} 
        onClose={() => setUploadModalOpen(false)} 
        type={uploadType} 
        isDark={isDark} 
      />

      {/* ─────────────────────────────────────────────
          INSTAGRAM NOTIFICATIONS PANEL
          ───────────────────────────────────────────── */}
      <SocialNotificationPanel 
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        isDark={isDark}
        notifications={notifications}
        onMarkRead={handleMarkRead}
      />

      {/* Dynamic Tapped Post Details Popup Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-[480px] my-8">
            <button 
              onClick={() => setSelectedPost(null)}
              className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <div className={`rounded-3xl overflow-hidden shadow-2xl border ${
              isDark ? "bg-[#0b0b0b] border-zinc-800" : "bg-white border-gray-150"
            } p-2`}>
              <PostCard post={selectedPost} isDark={isDark} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}