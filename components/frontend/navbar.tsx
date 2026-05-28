"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Search, TrendingUp, Radio, Users, Gamepad2, Laugh, Cpu, User, Settings, ShieldCheck, ChevronDown, MonitorPlay, Sparkles, Globe, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "@/components/theme-provider"
import { useAuthStore } from "@/store/auth-store"
import { auth } from "@/lib/firebase"

const navLinks = [
  { name: "Live", href: "/live", icon: Radio },
  { name: "Newspaper", href: "/newspaper", icon: TrendingUp },
  { name: "Politics", href: "/politics", icon: Users },
  { name: "Trending", href: "/#trending", icon: TrendingUp },
  { name: "Lifestyle", href: "/#lifestyle", icon: Users },
  { name: "Sports", href: "/#sports", icon: Gamepad2 },
  { name: "Tech", href: "/#tech", icon: Cpu },
  { name: "Memes", href: "/#memes", icon: Laugh },
  { name: "Social", href: "/social", icon: Globe },
]

// All available features for the smart search
const siteFeatures = [
  { name: "Admin Dashboard", href: "/admin", icon: ShieldCheck, keywords: ["admin", "dashboard", "manage"] },
  { name: "Settings", href: "/settings", icon: Settings, keywords: ["settings", "preferences", "config"] },
  { name: "Reels", href: "/reels", icon: MonitorPlay, keywords: ["reels", "videos", "shorts"] },
  { name: "Newspaper", href: "/newspaper", icon: TrendingUp, keywords: ["newspaper", "articles", "news"] },
  { name: "Politics", href: "/politics", icon: Users, keywords: ["politics", "government"] },
  { name: "Live News", href: "/live", icon: Radio, keywords: ["live", "breaking", "now"] },
  { name: "Social Feed", href: "/social", icon: Globe, keywords: ["social", "feed", "stories", "posts", "community"] },
  { name: "Memes", href: "/#memes", icon: Laugh, keywords: ["memes", "funny", "jokes"] },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { theme } = useTheme()
  const router = useRouter()
  const settingsRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const { user, isAuthenticated } = useAuthStore()
  const [hasActiveStory, setHasActiveStory] = useState(false)
  const [hasUnreadSocial, setHasUnreadSocial] = useState(false)
  const [unreadDMCount, setUnreadDMCount] = useState(0)
  const [trendingCount, setTrendingCount] = useState(0)

  const isDark = theme !== "light"

  useEffect(() => {
    if (!isAuthenticated || !user) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/stories`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const userStory = data.data.find((g: any) => g.user.username === (user as any).username || (user.displayName && g.user.name === user.displayName))
          setHasActiveStory(!!userStory)
        }
      })
      .catch(() => {})
  }, [isAuthenticated, user])

  useEffect(() => {
    if (!isAuthenticated || !user) return
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
    const checkNotifications = () => {
      fetch(`${API_URL}/notifications/unread-count?firebaseUid=${user.uid}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setHasUnreadSocial(data.unreadCount > 0)
            setTrendingCount(data.trendingCount || 0)
          }
        })
        .catch(() => {})
    }

    checkNotifications()
    const interval = setInterval(checkNotifications, 20000)

    const handleRead = () => {
      setHasUnreadSocial(false)
      setTrendingCount(0)
    }
    window.addEventListener("social_notifications_read", handleRead)

    return () => {
      clearInterval(interval)
      window.removeEventListener("social_notifications_read", handleRead)
    }
  }, [isAuthenticated, user])

  const markSocialRead = async () => {
    if (!user) return
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/notifications/read-all`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseUid: user.uid })
      })
      window.dispatchEvent(new CustomEvent("social_notifications_read"))
    } catch {}
  }

  // Smart DM unread polling
  useEffect(() => {
    if (!isAuthenticated || !user) return
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
    const checkDMs = () => {
      fetch(`${API_URL}/chats?firebaseUid=${user.uid}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.chats) {
            const count = data.chats.filter((chat: any) => {
              if (!chat.latestMessage) return false
              const senderUid = chat.latestMessage.sender?.firebaseUid
              const senderId = chat.latestMessage.sender?._id
              const myMongoId = (user as any)?._id || (user as any)?.id
              const isOtherUser = (senderUid && senderUid !== user.uid) || (!senderUid && myMongoId && String(senderId) !== String(myMongoId))
              const isUnread = myMongoId && !chat.latestMessage.readBy?.map(String).includes(String(myMongoId))
              return isOtherUser && isUnread
            }).length
            setUnreadDMCount(count)
          }
        })
        .catch(() => {})
    }
    checkDMs()
    const interval = setInterval(checkDMs, 15000)
    const handleDMRead = () => setUnreadDMCount(0)
    window.addEventListener("dm_read", handleDMRead)
    return () => {
      clearInterval(interval)
      window.removeEventListener("dm_read", handleDMRead)
    }
  }, [isAuthenticated, user])

  // Handle anchor link clicks to work reliably even if clicked multiple times
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href === "/social") markSocialRead()
    if (href.startsWith("/#")) {
      const id = href.replace("/#", "")
      if (window.location.pathname === "/") {
        e.preventDefault()
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior: "smooth" })
          window.history.pushState(null, "", href)
        }
      }
    }
  }

  // Close settings dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setSettingsOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const openFuturisticSearch = () => {
    window.dispatchEvent(new CustomEvent("open-futuristic-search"))
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-colors ${
        theme === "glass"
          ? "bg-white/5 border-white/10 shadow-lg shadow-white/5"
          : isDark
          ? "bg-black/90 border-white/10 shadow-lg shadow-black/20"
          : "bg-white/95 border-gray-200 shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0 relative py-1">
            <div className="flex items-center gap-3 cursor-pointer group">
              {/* Logo Vector Container with Premium border */}
              <div className="relative p-[1px] bg-gradient-to-tr from-red-500/30 via-purple-500/30 to-blue-500/30 rounded-xl shadow-sm">
                
                {/* Vector SVG Emblem */}
                <div className="relative z-10 w-9 h-9 rounded-[10px] overflow-hidden bg-black flex items-center justify-center border border-white/10">
                  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full select-none">
                    {/* Symmetrical exact F.F design */}
                    <text 
                      x="30" 
                      y="74" 
                      fontFamily="Georgia, 'Times New Roman', serif" 
                      fontWeight="bold" 
                      fontSize="68" 
                      fill="#FFFFFF"
                      textAnchor="middle"
                    >
                      F
                    </text>
                    
                    {/* Red Dot */}
                    <circle 
                      cx="50" 
                      cy="74" 
                      r="6" 
                      fill="#a8152e"
                    />
                    
                    <text 
                      x="70" 
                      y="74" 
                      fontFamily="Georgia, 'Times New Roman', serif" 
                      fontWeight="bold" 
                      fontSize="68" 
                      fill="#FFFFFF"
                      textAnchor="middle"
                    >
                      F
                    </text>
                  </svg>
                </div>
              </div>

              {/* Elegant Professional Brand Name */}
              <div className="relative flex flex-col justify-center">
                <div className="flex items-center">
                  <span className={`font-black text-2xl tracking-tighter ${isDark ? "text-white" : "text-gray-900"}`} style={{ letterSpacing: "-0.05em" }}>
                    FACT
                  </span>
                  
                  <span className="font-black text-2xl tracking-tighter text-red-500 flex" style={{ letterSpacing: "-0.05em" }}>
                    FLOW
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`relative group flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isDark
                    ? "text-white/[0.85] hover:text-white hover:bg-white/10"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <link.icon className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                {link.name}
                {link.name === "Live" && (
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                )}
                {link.name === "Newspaper" && trendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 flex items-center justify-center bg-orange-500 text-white text-[9px] font-bold rounded-full shadow-sm animate-pulse">
                    {trendingCount > 99 ? "99+" : trendingCount}
                  </span>
                )}
                {link.name === "Social" && hasUnreadSocial && (
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
                )}
                {/* Hover Underline Effect */}
                <span className="absolute -bottom-1 left-3 right-3 h-0.5 bg-red-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* AI Search Trigger */}
            <button
              onClick={openFuturisticSearch}
              className={`flex items-center justify-center p-2 rounded-full transition-all duration-300 group ${
                isDark 
                  ? "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30" 
                  : "bg-gray-100 border border-transparent hover:bg-gray-200 hover:border-purple-300"
              }`}
              title="Open AI Search"
            >
              <Search className={`w-5 h-5 ${isDark ? "text-white/80" : "text-gray-600"} group-hover:hidden`} />
              <Sparkles className={`w-5 h-5 hidden group-hover:block ${isDark ? "text-purple-400" : "text-purple-600"} animate-pulse`} />
            </button>

            {/* Smart Notification Bell — Real backend integration */}
            {/* Removed from global Navbar as per request, now only available in Socials */}

            {/* Settings & Admin Dropdown */}
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className={`flex items-center gap-1 p-2 rounded-full transition-colors ${
                  isDark 
                    ? (settingsOpen ? "bg-white/10 text-white" : "text-white/[0.85] hover:text-white hover:bg-white/10")
                    : (settingsOpen ? "bg-gray-200 text-gray-900" : "text-gray-600 hover:bg-gray-100")
                }`}
              >
                <Settings className="w-5 h-5" />
                <ChevronDown className={`w-3 h-3 transition-transform ${settingsOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {settingsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute right-0 mt-2 w-48 rounded-xl border shadow-xl overflow-hidden ${
                      isDark ? "bg-black/95 border-white/10 backdrop-blur-xl" : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="p-1">
                      <Link 
                        href="/settings"
                        onClick={() => setSettingsOpen(false)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          isDark ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Settings className="w-4 h-4" />
                        Preferences
                      </Link>
                      <div className={`my-1 border-t ${isDark ? "border-white/10" : "border-gray-100"}`} />
                      <Link 
                        href="/admin"
                        onClick={() => setSettingsOpen(false)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          isDark ? "text-red-400 hover:bg-red-500/10 hover:text-red-300" : "text-red-600 hover:bg-red-50"
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Auth Button / Profile Dropdown (Replaced with Link) */}
            {isAuthenticated ? (
              <div className="relative">
                <Link
                  href={`/u/${(user as any)?.username || user?.uid}`}
                  className={`flex items-center justify-center w-9 h-9 rounded-full transition-transform hover:scale-105 ${
                    hasActiveStory 
                      ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-fuchsia-600 p-[1.5px]" 
                      : `overflow-hidden border-2 ${isDark ? "border-white/20 hover:border-white/40" : "border-gray-200 hover:border-gray-300"}`
                  }`}
                >
                  <div className={`w-full h-full rounded-full flex items-center justify-center overflow-hidden bg-black ${hasActiveStory ? 'border border-black' : ''}`}>
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className={`w-5 h-5 ${isDark ? "text-white/[0.85]" : "text-gray-600"}`} />
                    )}
                  </div>
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="btn hidden sm:block"
              >
                <span>
                  <User className="w-4 h-4" />
                  Login
                </span>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                isDark ? "text-white hover:bg-white/10" : "text-gray-900 hover:bg-gray-100"
              }`}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`lg:hidden border-t overflow-y-auto max-h-[80vh] ${theme === "glass" ? "border-white/10 bg-white/5 backdrop-blur-3xl" : isDark ? "border-white/10 bg-black/95 backdrop-blur-xl" : "border-gray-200 bg-white"}`}
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    handleNavClick(e, link.href)
                    setIsOpen(false)
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                    isDark ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <link.icon className="w-5 h-5 opacity-70" />
                  {link.name}
                  {link.name === "Live" && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-auto" />}
                  {link.name === "Social" && hasUnreadSocial && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-auto shadow-[0_0_6px_rgba(239,68,68,0.8)]" />}
                </Link>
              ))}
              <div className={`pt-4 pb-2 mt-4 border-t ${isDark ? "border-white/10" : "border-gray-100"}`}>
                <div className={`px-4 mb-2 text-xs font-bold uppercase tracking-wider ${isDark ? "text-white/[0.85]" : "text-gray-500"}`}>
                  Account & Settings
                </div>
                <Link
                  href="/settings"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isDark ? "text-white/80 hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Settings className="w-5 h-5 opacity-70" />
                  Preferences
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isDark ? "text-red-400 hover:bg-red-500/10 hover:text-red-300" : "text-red-600 hover:bg-red-50"
                  }`}
                >
                  <ShieldCheck className="w-5 h-5 opacity-70" />
                  Admin Dashboard
                </Link>
                
                {!user ? (
                  <div className={`mt-6 p-5 rounded-2xl border relative overflow-hidden group ${
                    isDark ? "bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20" : "bg-gradient-to-br from-blue-50 to-purple-50 border-blue-100"
                  }`}>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl opacity-50" />
                    <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl opacity-50" />
                    
                    <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg mb-1">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Join FactFlow Community</h4>
                        <p className={`text-xs mt-1 px-2 ${isDark ? "text-white/[0.85]" : "text-gray-600"}`}>Unlock premium features and personalized news feed.</p>
                      </div>
                      <Link
                        href="/login"
                        onClick={() => setIsOpen(false)}
                        className="btn w-full mt-2"
                      >
                        <span>
                          <Sparkles className="w-4 h-4" />
                          Get Started Now
                        </span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={async () => {
                      setIsOpen(false);
                      try {
                        const { signOut } = await import("firebase/auth");
                        await signOut(auth);
                        useAuthStore.getState().logout();
                        window.location.href = "/";
                      } catch (e) {
                        console.error("Sign out error", e);
                      }
                    }}
                    className={`mt-6 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all border ${
                      isDark ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20" : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                    }`}
                  >
                    Sign Out
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
