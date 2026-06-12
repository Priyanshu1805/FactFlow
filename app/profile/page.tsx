"use client"

import { useTheme } from "@/components/theme-provider"
import { useAuthStore } from "@/store/auth-store"
import { User, Settings, LogOut, Calendar, Mail, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Navbar } from "@/components/frontend/navbar"
import { Footer } from "@/components/frontend/footer"

export default function ProfilePage() {
  const { theme } = useTheme()
  const { user, logout } = useAuthStore()
  const isDark = theme !== "light"
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (user?.uid) {
      // Fetch real data for stats
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/users/public/${user.uid}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.stats) {
            setStats(data.stats)
          }
        })
        .catch(() => {})
    }
  }, [user?.uid])

  if (!mounted) return null

  const bg = isDark ? "bg-black text-white" : "bg-gray-50 text-gray-900"

  return (
    <main className={`min-h-screen ${bg} transition-colors duration-500`}>
      <Navbar />

      <div className="pt-24 pb-12 max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center shrink-0">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-white" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-black">{user?.displayName || "User"}</h1>
            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1 text-sm">
              <Mail className="w-4 h-4" /> {user?.email || "No email"}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1 mt-1">
              <Calendar className="w-3.5 h-3.5" /> Joined {new Date(Date.now()).toLocaleDateString()}
            </p>
            
            {/* Live Stats */}
            <div className="flex items-center gap-4 mt-3">
              <div className="text-center">
                <span className="block font-bold text-lg leading-none">{stats.posts}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Posts</span>
              </div>
              <div className="w-px h-6 bg-gray-300 dark:bg-white/10" />
              <div className="text-center">
                <span className="block font-bold text-lg leading-none">{stats.followers}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Followers</span>
              </div>
              <div className="w-px h-6 bg-gray-300 dark:bg-white/10" />
              <div className="text-center">
                <span className="block font-bold text-lg leading-none">{stats.following}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Following</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Link href={`/u/${user?.username || user?.uid}`} className={`flex items-center gap-3 p-4 rounded-xl border ${isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-white border-gray-200 hover:bg-gray-50"} transition-colors`}>
            <User className="w-5 h-5 text-red-500" />
            <span className="font-semibold">View Public Profile</span>
          </Link>

          <Link href="/settings" className={`flex items-center gap-3 p-4 rounded-xl border ${isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-white border-gray-200 hover:bg-gray-50"} transition-colors`}>
            <Settings className="w-5 h-5 text-red-500" />
            <span className="font-semibold">Settings</span>
          </Link>

          <Link href="/subscription" className={`flex items-center gap-3 p-4 rounded-xl border ${isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-white border-gray-200 hover:bg-gray-50"} transition-colors`}>
            <ShieldCheck className="w-5 h-5 text-red-500" />
            <span className="font-semibold">Subscription</span>
          </Link>

          <button
            onClick={logout}
            className={`flex items-center gap-3 p-4 w-full rounded-xl border ${isDark ? "bg-white/5 border-white/10 hover:bg-red-500/10 hover:border-red-500/30" : "bg-white border-gray-200 hover:bg-red-50 hover:border-red-300"} transition-colors text-left`}
          >
            <LogOut className="w-5 h-5 text-red-500" />
            <span className="font-semibold">Sign Out</span>
          </button>
        </div>
      </div>

      <Footer />
    </main>
  )
}
