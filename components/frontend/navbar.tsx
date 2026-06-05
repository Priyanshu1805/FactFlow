"use client"
// Cache busting comment for Turbopack HMR v2

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Search, TrendingUp, Radio, Users, Gamepad2, Laugh, Cpu, User, Settings, ShieldCheck, Sparkles, Globe, Bookmark, Bell, Clapperboard } from "lucide-react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "@/components/theme-provider"
import { useAuthStore } from "@/store/auth-store"
import { auth } from "@/lib/firebase"
import { useSubscription } from "@/lib/use-subscription"
import { PremiumBadge } from "@/components/frontend/premium-badge"
import { NotificationBell } from "@/components/frontend/notification-bell"

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
  { name: "Saved", href: "/saved", icon: Bookmark },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)

  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  const { theme } = useTheme()
  const router = useRouter()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { user, isAuthenticated } = useAuthStore()
  const { subscription } = useSubscription()
  const [hasActiveStory, setHasActiveStory] = useState(false)
  const [hasUnreadSocial, setHasUnreadSocial] = useState(false)
  const [unreadDMCount, setUnreadDMCount] = useState(0)
  const [trendingCount, setTrendingCount] = useState(0)

  const isDark = theme !== "light"

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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

  useEffect(() => {
    if (!isAuthenticated || !user) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/stories`)
      .then(res => {
        if (!res.ok) throw new Error("Fetch failed")
        return res.json()
      })
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
        .then(res => {
          if (!res.ok) throw new Error("Fetch failed")
          return res.json()
        })
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
    const handleNewNotif = () => setHasUnreadSocial(true)

    window.addEventListener("social_notifications_read", handleRead)
    window.addEventListener("global_new_notification", handleNewNotif)

    return () => {
      clearInterval(interval)
      window.removeEventListener("social_notifications_read", handleRead)
      window.removeEventListener("global_new_notification", handleNewNotif)
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
        .then(res => {
          if (!res.ok) throw new Error("Fetch failed")
          return res.json()
        })
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

  // Handle anchor link clicks
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

  const openFuturisticSearch = () => {
    window.dispatchEvent(new CustomEvent("open-futuristic-search"))
  }

  return (
    <>
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-colors font-sans duration-200 ${
        theme === "glass"
          ? "bg-white/5 border-white/10 shadow-lg shadow-white/5 text-white"
          : isDark
          ? "bg-black/90 border-white/10 shadow-lg shadow-black/20 text-white"
          : "bg-white/95 border-gray-200 shadow-sm text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side: Logo */}
          <Link href="/" className="flex items-center shrink-0 py-1">
            <div className="flex items-center gap-3 cursor-pointer group">
              {/* Crimson Square Badge with White "FF" */}
              <div className="w-9 h-9 rounded-lg bg-red-800 flex items-center justify-center shadow-md shadow-red-900/20 font-black text-white text-base tracking-tighter">
                FF
              </div>

              {/* Bold Modern Sans-Serif Logo Text */}
              <span className={`font-black text-xl tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                FACTFLOW
              </span>
            </div>
          </Link>

          {/* Center Side: Navigation Links (hidden on mobile) */}
          <div className="hidden lg:flex items-center gap-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`relative group flex items-center gap-1.5 px-3 py-2 text-sm font-bold transition-colors duration-300 ${isDark ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-red-500"}`}
              >
                <link.icon className="w-4 h-4 opacity-75 group-hover:opacity-100 transition-opacity" />
                {link.name}
                {link.name === "Live" && (
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                )}
                {link.name === "Trending" && trendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 flex items-center justify-center bg-orange-500 text-white text-[9px] font-bold rounded-full shadow-sm animate-pulse">
                    {trendingCount > 99 ? "99+" : trendingCount}
                  </span>
                )}
                {/* Sliding underline effect */}
                <span className="absolute -bottom-1 left-3 right-3 h-0.5 bg-gradient-to-r from-red-650 to-red-500 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
              </Link>
            ))}
          </div>

            {/* Right Side: Search & Login & Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* AI Search Trigger */}
            <button
              onClick={openFuturisticSearch}
              className={`flex items-center justify-center p-2.5 sm:p-2 rounded-full transition-all duration-300 group ${
                isDark 
                  ? "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30" 
                  : "bg-gray-100 border border-transparent hover:bg-gray-200 hover:border-purple-300"
              }`}
              title="Open AI Search"
            >
              <Search className={`w-5 h-5 ${isDark ? "text-white/80" : "text-gray-600"} group-hover:hidden`} />
              <Sparkles className={`w-5 h-5 hidden group-hover:block ${isDark ? "text-purple-400" : "text-purple-600"} animate-pulse`} />
            </button>

            {/* Settings & Admin Dropdown */}
            <div className="relative hidden sm:block" ref={settingsRef}>
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className={`p-2 rounded-full transition-colors ${
                  isDark ? "hover:bg-white/10 text-gray-300 hover:text-white" : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                }`}
              >
                <Settings className="w-5 h-5" />
              </button>
              
              <AnimatePresence>
                {settingsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute right-0 mt-2 w-48 rounded-xl border shadow-xl overflow-hidden ${
                      isDark ? "bg-[#1E293B] border-white/10 text-white" : "bg-white border-gray-100 text-gray-900"
                    }`}
                  >
                    <div className="p-1">
                                            <Link href="/settings" className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${isDark ? "hover:bg-white/10" : "hover:bg-gray-50"}`}>
                        <Settings className="w-4 h-4" /> Preferences
                      </Link>
                      <Link href="/admin" className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${isDark ? "hover:bg-white/10" : "hover:bg-gray-50"}`}>
                        <ShieldCheck className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

           {/* Auth Buttons / Icons */}
            {!mounted ? (
              <div className="w-16 h-8 rounded-full animate-pulse bg-gray-200 dark:bg-white/10"></div>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Notification Dropdown */}
                <NotificationBell />

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className={`p-2 rounded-full transition-colors ${
                      isDark ? "hover:bg-white/10 text-gray-300 hover:text-white" : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                    }`}
                    title="Profile"
                  >
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-6 h-6 rounded-full object-cover border border-white/20" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </button>
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute right-0 mt-2 w-48 rounded-xl border shadow-xl overflow-hidden z-50 ${
                          isDark ? "bg-[#1E293B] border-white/10 text-white" : "bg-white border-gray-100 text-gray-900"
                        }`}
                      >
                        <div className="p-3 border-b border-white/5">
                          <p className="text-sm font-medium truncate">{user?.displayName || "User"}</p>
                          <p className={`text-xs truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>{user?.email}</p>
                        </div>
                        <div className="p-1">
                          <Link 
                            href={`/u/${(user as any)?.username || user?.uid}`}
                            onClick={() => setProfileOpen(false)}
                            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${isDark ? "hover:bg-white/10" : "hover:bg-gray-50"}`}
                          >
                            <User className="w-4 h-4" /> View Profile
                          </Link>
                          <Link 
                            href="/settings" 
                            onClick={() => setProfileOpen(false)}
                            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${isDark ? "hover:bg-white/10" : "hover:bg-gray-50"}`}
                          >
                            <Settings className="w-4 h-4" /> Settings
                          </Link>
                        </div>
                        <div className="p-1 border-t border-white/5">
                          <button
                            onClick={async () => {
                              setProfileOpen(false);
                              try {
                                const { signOut } = await import("firebase/auth");
                                const { auth } = await import("@/lib/firebase");
                                await signOut(auth);
                                useAuthStore.getState().logout();
                                window.location.href = "/";
                              } catch (e) {
                                console.error("Sign out error", e);
                              }
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <span className="font-semibold">Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-md shadow-red-900/20 hover:brightness-110 transition-all active:scale-95 text-center whitespace-nowrap"
              >
                Login
              </Link>
            )}


            {/* Hamburger Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`lg:hidden p-2 rounded-lg font-bold transition-all ${
                isDark 
                  ? "text-white bg-white/10 hover:bg-white/20 border border-white/20 shadow-sm" 
                  : "text-gray-900 bg-gray-100 hover:bg-gray-200 border border-gray-300 shadow-sm"
              }`}
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-6 h-6" strokeWidth={2.5} /> : <Menu className="w-6 h-6" strokeWidth={2.5} />}
            </button>
          </div>
        </div>
      </div>
    </motion.nav>

      {/* Mobile Sliding Sidebar Drawer & Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />

            {/* Sidebar Slide-in Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 right-0 w-full sm:w-80 z-50 bg-slate-950 border-l border-white/10 shadow-2xl p-6 overflow-y-auto lg:hidden text-white"
              style={{ backgroundColor: '#050505' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between pb-6 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-red-800 flex items-center justify-center font-black text-white text-sm">
                      FF
                    </div>
                    <span className="font-extrabold text-lg text-white">FACTFLOW</span>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Profile Section inside Drawer */}
                {isAuthenticated && user ? (
                  <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center p-[2px] ${hasActiveStory ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-fuchsia-600" : "bg-white/10"}`}>
                        <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-white/70" />
                          )}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold truncate text-white">{user.displayName || "FactFlow User"}</h4>
                        <p className="text-xs text-gray-400 truncate">@{ (user as any).username || "user" }</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
                      <Link
                        href={`/u/${(user as any)?.username || user?.uid}`}
                        onClick={() => setIsOpen(false)}
                        className="text-xs text-red-400 font-bold hover:underline"
                      >
                        View Profile
                      </Link>
                      {subscription.tier !== "free" ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                          {subscription.tier === "premium" ? "Premium" : "Pro"}
                        </span>
                      ) : (
                        <Link
                          href="/subscription"
                          onClick={() => setIsOpen(false)}
                          className="text-[10px] font-black bg-gradient-to-r from-red-500 to-amber-500 text-white px-2.5 py-0.5 rounded-lg"
                        >
                          Upgrade
                        </Link>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Login Trigger inside Drawer */
                  <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-red-950/40 to-orange-950/40 border border-red-500/20 text-center">
                    <h4 className="text-sm font-bold text-white font-sans">Unlock Full Access</h4>
                    <p className="text-[11px] text-gray-400 mt-1">Join the FactFlow community today.</p>
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="mt-3 block w-full py-2 bg-gradient-to-r from-red-600 to-orange-500 rounded-lg text-xs font-bold text-white hover:brightness-110 transition-all"
                    >
                      Login / Sign Up
                    </Link>
                  </div>
                )}

                {/* Primary Nav Links */}
                <div className="mt-6 space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={(e) => {
                        handleNavClick(e, link.href)
                        setIsOpen(false)
                      }}
                      className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <link.icon className="w-5 h-5 opacity-70" />
                      {link.name}
                      {link.name === "Live" && (
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-auto" />
                      )}
                    </Link>
                  ))}
                  
                  {/* Secondary App Links */}
                  <div className="pt-4 mt-4 border-t border-white/10 space-y-1">
                    <span className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">More Options</span>
                    
                    <Link
                      href="/social"
                      onClick={() => {
                        markSocialRead()
                        setIsOpen(false)
                      }}
                      className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Globe className="w-5 h-5 opacity-70" />
                      Social Feed
                      {hasUnreadSocial && (
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse ml-auto" />
                      )}
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Settings className="w-5 h-5 opacity-70" />
                      Settings
                    </Link>

                    <Link
                      href="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <ShieldCheck className="w-5 h-5 opacity-70" />
                      Admin Dashboard
                    </Link>
                  </div>
                </div>

              {/* Drawer Footer / Sign Out */}
              {isAuthenticated && (
                <div className="pt-4 border-t border-white/10 mt-6">
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
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 font-bold text-xs hover:bg-red-500/20 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
