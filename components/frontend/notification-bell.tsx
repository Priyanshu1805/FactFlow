"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell, X, Check, CheckCheck, Heart, MessageCircle, UserPlus,
  FileText, Settings, Megaphone, Radio, Newspaper, Trash2,
  ChevronRight, Loader2, RefreshCw, TrendingUp, Sparkles, Calendar, MapPin
} from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/store/auth-store"
import { useTheme } from "@/components/theme-provider"
import { toast } from "sonner"
import { useSocket } from "@/hooks/use-socket"

const API = process.env.NEXT_PUBLIC_API_URL || "/api"

type NotifType =
  | "mention" | "reply" | "reaction" | "like" | "share_post"
  | "follow" | "new_article" | "system" | "message_request"
  | "comment" | "breaking_news" | "trending_story" | "personalized_update"
  | "daily_digest" | "location_alert" | "recommendation"

interface Notification {
  _id: string
  type: NotifType
  isRead: boolean
  createdAt: string
  message?: string
  link?: string
  senderId?: { name: string; username: string; avatar?: string; isVerified?: boolean }
  postId?: { caption?: string; media?: { url: string }[] }
  articleId?: { title?: string; image?: string; slug?: string }
}

const TYPE_CONFIG: Record<NotifType, { icon: any; color: string; bg: string; label: string }> = {
  like: { icon: Heart, color: "text-red-400", bg: "bg-red-500/15", label: "Liked your post" },
  reaction: { icon: Heart, color: "text-pink-400", bg: "bg-pink-500/15", label: "Reacted to your post" },
  comment: { icon: MessageCircle, color: "text-blue-400", bg: "bg-blue-500/15", label: "Commented on your post" },
  reply: { icon: MessageCircle, color: "text-cyan-400", bg: "bg-cyan-500/15", label: "Replied to your comment" },
  mention: { icon: MessageCircle, color: "text-purple-400", bg: "bg-purple-500/15", label: "Mentioned you" },
  follow: { icon: UserPlus, color: "text-green-400", bg: "bg-green-500/15", label: "Started following you" },
  share_post: { icon: ChevronRight, color: "text-orange-400", bg: "bg-orange-500/15", label: "Shared your post" },
  new_article: { icon: Newspaper, color: "text-blue-400", bg: "bg-blue-500/15", label: "New article published" },
  breaking_news: { icon: Radio, color: "text-red-500", bg: "bg-red-500/15", label: "Breaking News" },
  message_request: { icon: MessageCircle, color: "text-indigo-400", bg: "bg-indigo-500/15", label: "Message request" },
  system: { icon: Settings, color: "text-gray-400", bg: "bg-gray-500/15", label: "System notification" },
  trending_story: { icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-500/15", label: "Trending Story" },
  personalized_update: { icon: Sparkles, color: "text-purple-400", bg: "bg-purple-500/15", label: "Personalized Update" },
  daily_digest: { icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/15", label: "Daily Digest" },
  location_alert: { icon: MapPin, color: "text-emerald-500", bg: "bg-emerald-500/15", label: "Local Alert" },
  recommendation: { icon: Sparkles, color: "text-indigo-400", bg: "bg-indigo-500/15", label: "Recommendation" },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(mins / 60)
  const days = Math.floor(hrs / 24)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  if (hrs < 24) return `${hrs}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export function NotificationBell() {
  const { user, isAuthenticated } = useAuthStore()
  const { theme } = useTheme()
  const isDark = theme !== "light"

  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<"all" | "news">("all")
  const [expanded, setExpanded] = useState(false)
  const [prefs, setPrefs] = useState<any>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // ── Fetch user preferences ───────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !user) return
    const token = localStorage.getItem("token") || ""
    fetch(`${API}/notifications/prefs?firebaseUid=${user.uid}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => { if (d.success) setPrefs(d.data) })
      .catch(() => {})
  }, [user, isAuthenticated])

  // ── Close on outside click ──────────────────────────────────
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // ── Fetch unread count (lightweight, for badge) ──────────────
  const fetchCount = useCallback(() => {
    if (!isAuthenticated || !user) return
    fetch(`${API}/notifications/unread-count?firebaseUid=${user.uid}`)
      .then(r => {
        if (!r.ok) throw new Error("Fetch failed")
        return r.json()
      })
      .then(d => { if (d.success) setUnreadCount(d.unreadCount) })
      .catch(() => {})
  }, [isAuthenticated, user])

  useEffect(() => {
    fetchCount()
    const iv = setInterval(fetchCount, 20000)
    return () => clearInterval(iv)
  }, [fetchCount])


  // ── Listen for social read event ─────────────────────────────
  useEffect(() => {
    const handler = () => fetchCount()
    window.addEventListener("social_notifications_read", handler)
    return () => window.removeEventListener("social_notifications_read", handler)
  }, [fetchCount])

  // ── Fetch full notification list on open ──────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await fetch(`${API}/notifications?firebaseUid=${user.uid}&limit=40`)
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (data.success) {
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch {
      toast.error("Could not load notifications")
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (open) fetchNotifications()
  }, [open, fetchNotifications])

  const { socket } = useSocket()

  // ── Listen for Real-time Notifications via Socket.IO ─────────
  useEffect(() => {
    if (!isAuthenticated || !user || !socket) return

    // Helper to get text for toast
    const getNotifText = (n: Notification): string => {
      if (n.message) return n.message
      const cfg = TYPE_CONFIG[n.type]
      const sender = n.senderId?.name || n.senderId?.username || "Someone"
      switch (n.type) {
        case "like": return `${sender} liked your post`
        case "comment": return `${sender} commented on your post`
        case "mention": return `${sender} mentioned you`
        case "follow": return `${sender} started following you`
        case "breaking_news": return `🔴 BREAKING NEWS`
        default: return cfg?.label || "New notification"
      }
    }

    const handleNewNotif = (notif: Notification) => {
      // Check quiet hours
      if (prefs?.quietHours?.enabled) {
        const now = new Date()
        const currentMins = now.getHours() * 60 + now.getMinutes()
        const [fH, fM] = (prefs.quietHours.from || "22:00").split(":").map(Number)
        const [tH, tM] = (prefs.quietHours.to || "07:00").split(":").map(Number)
        const fromMins = fH * 60 + fM
        const toMins = tH * 60 + tM
        
        let isQuiet = false
        if (fromMins <= toMins) {
          isQuiet = currentMins >= fromMins && currentMins <= toMins
        } else {
          isQuiet = currentMins >= fromMins || currentMins <= toMins
        }
        if (isQuiet) return; // Block toast, but maybe still add to list? We'll just block the toast.
      }

      setNotifications(prev => {
        const isDuplicate = prev.some(n => n._id === notif._id);
        if (isDuplicate) return prev;
        return [notif, ...prev];
      });
      setUnreadCount(prev => prev + 1);
      
      const text = getNotifText(notif);
      toast(text);
      window.dispatchEvent(new CustomEvent("global_new_notification"));
    }

    const handleNewArticle = (article?: any) => {
      if (prefs?.liveUpdates === false) return; // Ignored via settings
      fetchCount()
      if (open) fetchNotifications()
      if (article && article.title) {
        toast(`📰 New Article: ${article.title}`)
      } else {
        toast("📰 New article published!")
      }
    }

    const handleBreakingNews = (article?: any) => {
      if (prefs?.breakingNews === false) return; // Ignored via settings
      fetchCount()
      if (open) fetchNotifications()
      if (article && article.title) {
        toast(`🚨 BREAKING: ${article.title}`, { style: { backgroundColor: '#ef4444', color: 'white' } })
      } else {
        toast("🚨 BREAKING NEWS!", { style: { backgroundColor: '#ef4444', color: 'white' } })
      }
    }

    const handleTrendingStory = (trend?: any) => {
      fetchCount()
      if (open) fetchNotifications()
      if (trend && trend.topic) {
        toast(`📈 Trending: ${trend.topic}`)
      } else {
        toast("📈 New trending story!")
      }
    }

    socket.on("new_notification", handleNewNotif)
    socket.on("new_article", handleNewArticle)
    socket.on("breaking_news", handleBreakingNews)
    socket.on("trending_story", handleTrendingStory)

    return () => {
      socket.off("new_notification", handleNewNotif)
      socket.off("new_article", handleNewArticle)
      socket.off("breaking_news", handleBreakingNews)
      socket.off("trending_story", handleTrendingStory)
    }
  }, [user, isAuthenticated, open, fetchCount, fetchNotifications, socket, prefs])

  // ── Mark single notification as read ─────────────────────────
  const markRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(n => n._id === id ? { ...n, isRead: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
    await fetch(`${API}/notifications/${id}/read`, { method: "PUT" }).catch(() => {})
  }

  // ── Mark all as read ─────────────────────────────────────────
  const markAllRead = async () => {
    if (!user) return
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
    window.dispatchEvent(new CustomEvent("social_notifications_read"))
    await fetch(`${API}/notifications/read-all`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firebaseUid: user.uid }),
    }).catch(() => {})
  }

  // ── Delete notification ───────────────────────────────────────
  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setNotifications(prev => prev.filter(n => n._id !== id))
    await fetch(`${API}/notifications/${id}`, { method: "DELETE" }).catch(() => {})
  }

  const NEWS_TYPES = ["breaking_news", "new_article", "trending_story", "personalized_update", "daily_digest", "location_alert", "recommendation"]
  const displayed = (filter === "news"
    ? notifications.filter(n => NEWS_TYPES.includes(n.type))
    : notifications).sort((a, b) => {
      // Auto-push breaking news to top if unread
      if (a.type === "breaking_news" && !a.isRead && (b.type !== "breaking_news" || b.isRead)) return -1
      if (b.type === "breaking_news" && !b.isRead && (a.type !== "breaking_news" || a.isRead)) return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const getNotifText = (n: Notification): string => {
    if (n.message) return n.message
    const cfg = TYPE_CONFIG[n.type]
    const sender = n.senderId?.name || n.senderId?.username || "Someone"
    const postPreview = n.postId?.caption ? `: "${n.postId.caption.slice(0, 40)}${n.postId.caption.length > 40 ? "..." : ""}"` : ""
    const articlePreview = n.articleId?.title ? `: "${n.articleId.title.slice(0, 50)}..."` : ""
    switch (n.type) {
      case "like": return `${sender} liked your post${postPreview}`
      case "reaction": return `${sender} reacted to your post${postPreview}`
      case "comment": return `${sender} commented on your post${postPreview}`
      case "reply": return `${sender} replied to your comment${postPreview}`
      case "mention": return `${sender} mentioned you in a post`
      case "follow": return `${sender} started following you`
      case "share_post": return `${sender} shared your post`
      case "new_article": return `New article${articlePreview}`
      case "breaking_news": return `🔴 BREAKING${articlePreview}`
      case "trending_story": return `📈 Trending${articlePreview}`
      case "personalized_update": return `✨ For you${articlePreview}`
      case "daily_digest": return `📅 Your Daily Digest is ready`
      case "location_alert": return `📍 Local Alert: ${n.message || "Update near you"}`
      case "recommendation": return `💡 You may like this${articlePreview}`
      case "message_request": return `${sender} sent you a message request`
      default: return cfg.label
    }
  }

  const getNotifLink = (n: Notification): string => {
    if (n.link) return n.link
    switch (n.type) {
      case "like":
      case "comment":
      case "reaction":
      case "reply":
      case "share_post":
      case "mention":
        return n.postId ? `/social?post=${n.postId}` : "/social"
      case "follow":
        return n.senderId?.username ? `/u/${n.senderId.username}` : "/social"
      case "new_article":
      case "breaking_news":
      case "trending_story":
      case "personalized_update":
      case "recommendation":
        return n.articleId?.slug ? `/newspaper/${n.articleId.slug}` : "/newspaper"
      case "daily_digest":
        return "/newspaper"
      case "location_alert":
        return "/newspaper"
      case "message_request":
        return "/social?tab=chats"
      default:
        return "/"
    }
  }

  if (!isAuthenticated) return null

  return (
    <div ref={panelRef} className="relative">
      {/* ── Bell Button ─────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(!open)}
        className={`relative p-2 rounded-full transition-all duration-200 ${
          open
            ? isDark ? "bg-white/15 text-white" : "bg-gray-200 text-gray-900"
            : isDark ? "text-white/80 hover:text-white hover:bg-white/10" : "text-gray-600 hover:bg-gray-100"
        }`}
        title="Notifications"
      >
        <Bell className={`w-[26px] h-[26px] transition-transform ${open ? "scale-110" : ""}`} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className={`absolute top-0.5 right-0.5 min-w-[20px] h-[20px] px-1 bg-[#ff3040] text-white text-[11px] font-bold rounded-full flex items-center justify-center border-[2.5px] ${isDark ? "border-[#111111]" : "border-white"}`}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* ── Panel ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={`absolute right-[-10px] sm:right-0 mt-3 w-[calc(100vw-20px)] sm:w-[380px] rounded-2xl shadow-2xl border overflow-hidden z-[200] ${
              isDark
                ? "bg-[#111111] border-white/10 shadow-black/60"
                : "bg-white border-gray-200 shadow-gray-300/40"
            }`}
            style={{ maxHeight: expanded ? "80vh" : "520px" }}
          >
            {/* Header */}
            <div className={`px-4 py-3 flex items-center justify-between border-b ${
              isDark ? "border-white/8" : "border-gray-100"
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${isDark ? "bg-white/10" : "bg-gray-100"}`}>
                  <Bell className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <p className="text-[10px] text-gray-400">{unreadCount} unread</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    title="Mark all as read"
                    className={`p-1.5 rounded-lg text-xs flex items-center gap-1 font-semibold transition-all ${
                      isDark ? "hover:bg-white/10 text-blue-400" : "hover:bg-blue-50 text-blue-600"
                    }`}
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span className="text-[10px]">All read</span>
                  </button>
                )}
                <button
                  onClick={fetchNotifications}
                  title="Refresh"
                  className={`p-1.5 rounded-lg transition-all ${
                    isDark ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-500"
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className={`p-1.5 rounded-lg transition-all ${
                    isDark ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-500"
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className={`flex text-[11px] font-bold border-b ${
              isDark ? "border-white/8 bg-black/20" : "border-gray-100 bg-gray-50/60"
            }`}>
              {(["all", "news"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`flex-1 py-2 capitalize transition-all border-b-2 ${
                    filter === tab
                      ? "border-[#ff3040] text-[#ff3040]"
                      : `border-transparent ${isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`
                  }`}
                >
                  {tab === "news" ? "Latest News" : "All Updates"}
                </button>
              ))}
            </div>

            {/* Notification List */}
            <div className={`overflow-y-auto ${expanded ? 'h-[60vh]' : 'max-h-[360px]'}`}>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                </div>
              ) : displayed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                    isDark ? "bg-white/5" : "bg-gray-100"
                  }`}>
                    <Bell className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-400">
                    All caught up!
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    We'll notify you when something happens
                  </p>
                </div>
              ) : (
                <div>
                  {displayed.map((n, i) => {
                    const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.system
                    const Icon = cfg.icon
                    const text = getNotifText(n)
                    const href = getNotifLink(n)
                    const senderAvatar = n.senderId?.avatar

                    return (
                      <Link
                        key={n._id}
                        href={href}
                        onClick={() => { if (!n.isRead) markRead(n._id); setOpen(false) }}
                        className={`group flex items-start gap-3 px-4 py-3 transition-all border-b relative ${
                          isDark ? "border-white/5" : "border-gray-50"
                        } ${
                          // Breaking news gets red highlight
                          n.type === "breaking_news" && !n.isRead
                            ? isDark ? "bg-red-950/20 hover:bg-red-950/30 border-l-2 border-l-red-500" : "bg-red-50 hover:bg-red-100/60 border-l-2 border-l-red-500"
                          // System alerts get neutral highlight
                          : n.type === "system" && !n.isRead
                            ? isDark ? "bg-zinc-900 hover:bg-zinc-800" : "bg-gray-100 hover:bg-gray-200"
                          // Default unread highlight
                          : !n.isRead
                            ? isDark
                              ? "bg-blue-950/20 hover:bg-blue-950/30"
                              : "bg-blue-50/60 hover:bg-blue-50"
                          // Read styling
                          : isDark
                            ? "hover:bg-white/5"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        {/* Left: Avatar or Icon */}
                        <div className="relative shrink-0 mt-0.5">
                          {senderAvatar ? (
                            <div className="relative">
                              <img
                                src={senderAvatar}
                                alt=""
                                className="w-9 h-9 rounded-full object-cover"
                              />
                              <span className={`absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 p-0.5 rounded-full ${cfg.bg} flex items-center justify-center`}>
                                <Icon className={`w-2.5 h-2.5 ${cfg.color}`} />
                              </span>
                            </div>
                          ) : (
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${cfg.bg}`}>
                              <Icon className={`w-4 h-4 ${cfg.color}`} />
                            </div>
                          )}
                        </div>

                        {/* Right: Content */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-[11.5px] leading-snug ${
                            !n.isRead ? "font-semibold" : "text-gray-400"
                          }`}>
                            {text}
                          </p>

                          {/* Article image or post media preview */}
                          {(n.articleId?.image || (n.postId?.media?.[0]?.url)) && (
                            <div className={`mt-1.5 overflow-hidden opacity-80 ${
                              ["personalized_update", "recommendation"].includes(n.type)
                                ? "w-full h-24 rounded-lg border shadow-sm" // Subtle card look for recommendations
                                : "w-12 h-9 rounded-md border" // Default popup look for comments/likes
                            } ${isDark ? "border-white/10" : "border-black/10"}`}>
                              <img
                                src={n.articleId?.image || n.postId?.media?.[0]?.url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          <p className={`text-[9.5px] mt-1 font-medium ${
                            !n.isRead 
                              ? n.type === "breaking_news" ? "text-red-400" : "text-blue-400" 
                              : "text-gray-500"
                          }`}>
                            {timeAgo(n.createdAt)}
                          </p>
                        </div>

                        {/* Unread dot + delete */}
                        <div className="flex flex-col items-center gap-1.5 shrink-0 self-center">
                          {!n.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />
                          )}
                          <button
                            onClick={(e) => deleteNotification(n._id, e)}
                            className={`opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all ${
                              isDark ? "hover:bg-red-500/15 text-red-400" : "hover:bg-red-50 text-red-400"
                            }`}
                            title="Remove"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className={`px-4 py-2.5 border-t flex items-center justify-between ${
                isDark ? "border-white/8 bg-black/20" : "border-gray-100 bg-gray-50"
              }`}>
                <p className="text-[10px] text-gray-500">{notifications.length} total notifications</p>
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-[10px] font-bold text-blue-500 hover:text-blue-400 flex items-center gap-0.5"
                >
                  {expanded ? "Show less" : "See all"} <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
