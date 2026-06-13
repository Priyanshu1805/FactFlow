"use client"

import { useState, useEffect, useRef } from "react"
import { Home, Search, PlaySquare, User, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { useSettings } from "@/lib/use-settings"

export function MobileBottomNav() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { settings } = useSettings()
  
  const [isDark, setIsDark] = useState(false)
  const [hasUnreadSocial, setHasUnreadSocial] = useState(false)
  const [navHidden, setNavHidden] = useState(false)

  useEffect(() => {
    setIsDark(settings?.appearance?.theme === "dark" || (!settings?.appearance?.theme && window.matchMedia('(prefers-color-scheme: dark)').matches))
  }, [settings?.appearance?.theme])
  const lastScrollY = useRef(0)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  // Auto-hide navbar on scroll down, show on scroll up
  useEffect(() => {
    const SCROLL_THRESHOLD = 10

    const handleScroll = () => {
      const currentY = window.scrollY
      const diff = currentY - lastScrollY.current

      if (diff > SCROLL_THRESHOLD) {
        // Scrolling DOWN → hide
        setNavHidden(true)
      } else if (diff < -SCROLL_THRESHOLD) {
        // Scrolling UP → show
        setNavHidden(false)
      }

      lastScrollY.current = currentY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const markRead = async () => {
    if (!user) return
    try {
      await fetch(`${API_URL}/notifications/read-all`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseUid: user.uid })
      })
      window.dispatchEvent(new CustomEvent("social_notifications_read"))
    } catch {}
  }

  useEffect(() => {
    if (!user) return
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
    const checkNotifications = () => {
      fetch(`${API_URL}/notifications?firebaseUid=${user.uid}`)
        .then(res => {
          if (!res.ok) throw new Error("Fetch failed")
          return res.json()
        })
        .then(data => {
          if (data.success && data.notifications) {
            const hasUnread = data.notifications.some((n: any) => !n.isRead)
            setHasUnreadSocial(hasUnread)
          }
        })
        .catch(() => {})
    }

    checkNotifications()
    const interval = setInterval(checkNotifications, 15000)

    const handleRead = () => setHasUnreadSocial(false)
    window.addEventListener("social_notifications_read", handleRead)

    return () => {
      clearInterval(interval)
      window.removeEventListener("social_notifications_read", handleRead)
    }
  }, [user])

  const navItems = [
    { name: "Home", href: "/social", icon: Home },
    { name: "Search", href: "/social?tab=search", icon: Search },
    { name: "Live", href: "/live", icon: PlaySquare },
    { name: "Profile", href: user ? `/u/${(user as any)?.username || user?.uid}` : "/login", icon: User },
  ]
  if (user?.role === "admin" || user?.email === "factflow1819@gmail.com") {
    // Replace the 4th item (Profile) with Admin so it fits in 5 icons, or just add it.
    // Adding it makes 5 icons which is standard for bottom navs (e.g. Home, Search, Live, Admin, Profile)
    navItems.splice(3, 0, { name: "Admin", href: "/admin", icon: ShieldCheck })
  }


  // Only show mobile nav on relevant pages, but explicitly HIDE it on the Live page
  const shouldShow = (pathname.startsWith("/social") || pathname.startsWith("/u/") || pathname.startsWith("/reels")) && !pathname.startsWith("/live")

  if (!shouldShow) return null

  // Determine active index
  let activeIndex = -1
  navItems.forEach((item, index) => {
    if (pathname === item.href || (item.name === "Profile" && pathname.startsWith("/u/")) || (item.name === "Live" && pathname.startsWith("/live"))) {
      activeIndex = index
    }
  })

  // Calculate indicator position safely
  const indicatorPosition = activeIndex >= 0 ? activeIndex : 0

  return (
    <>
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 border-t ${
          isDark ? "bg-black/90 border-white/10 shadow-lg" : "bg-white/90 border-gray-200"
        } backdrop-blur-xl pb-safe`}
        style={{
          transition: "transform 0.3s ease",
          transform: navHidden ? "translateY(100%)" : "translateY(0)",
        }}
      >
        <nav className="relative flex items-center justify-around h-16 px-2">
          
          {/* Spotlight Top Bar (Only visible in Dark Mode and when an item is active) */}
          {isDark && activeIndex >= 0 && (
            <div 
              className="absolute top-0 h-[2px] bg-white transition-all duration-400 ease-in-out"
              style={{
                left: `calc(${(activeIndex / navItems.length) * 100}% + ${(100 / navItems.length) / 2}%)`,
                transform: 'translateX(-50%) translateY(-1px)',
                width: '48px',
              }}
            />
          )}

          {navItems.map((item, index) => {
            const isActive = activeIndex === index
            const distance = Math.abs(indicatorPosition - index)
            const spotlightOpacity = isActive ? 1 : Math.max(0, 1 - distance * 0.6)

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  if (item.name === "Home") markRead()
                }}
                className="relative flex flex-col items-center justify-center w-full h-full transition-all duration-400"
              >
                {/* Spotlight Blur (Only in Dark Mode) */}
                {isDark && (
                  <div 
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-24 bg-gradient-to-b from-white/40 to-transparent blur-lg rounded-full transition-opacity duration-400 pointer-events-none"
                    style={{
                      opacity: spotlightOpacity,
                      transitionDelay: isActive ? '0.1s' : '0s',
                    }}
                  />
                )}

                <div className={`relative flex items-center justify-center w-10 h-10 rounded-full z-10 ${
                  isActive && !isDark ? "bg-gray-100" : ""
                }`}>
                  <item.icon 
                    className={`w-6 h-6 transition-colors duration-200 ${
                      isActive 
                        ? (isDark ? "text-white" : "text-black") 
                        : (isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400")
                    }`} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />

                  {/* Social (Home) unread notification dot */}
                  {item.name === "Home" && hasUnreadSocial && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-black shadow-[0_0_4px_rgba(239,68,68,0.8)] z-20" />
                  )}
                </div>

                {/* Text Label to reflect Font Appearance settings */}
                <span className={`mt-1 text-[10px] font-semibold transition-colors duration-200 ${
                  isActive 
                    ? (isDark ? "text-white" : "text-black") 
                    : (isDark ? "text-gray-500" : "text-gray-400")
                }`}>
                  {item.name}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}

