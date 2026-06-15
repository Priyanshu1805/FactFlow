"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Newspaper, Send, AlertCircle, CheckCircle2, MapPin, Tag, 
  ToggleLeft, ToggleRight, BarChart3, Users as UsersIcon, ShieldAlert,
  Coins, Settings, Eye, Check, X, ShieldCheck, ArrowLeft, Loader2, Search,
  BadgeCheck, LayoutTemplate
} from "lucide-react"
import { Navbar } from "@/components/frontend/navbar"
import { Footer } from "@/components/frontend/footer"
import { useTheme } from "@/components/theme-provider"
import { useAuthStore } from "@/store/auth-store"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const API = process.env.NEXT_PUBLIC_API_URL || "/api"

export default function AdminDashboard() {
  const { theme } = useTheme()
  const isDark = theme !== "light"
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<"stats" | "users" | "news" | "monetization" | "moderation" | "ads">("stats")

  // Publish News State
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    categories: ["Tech"],
    image: "",
    location: "",
    tags: "",
    isBreaking: false,
    isSponsored: false,
  })
  
  const [status, setStatus] = useState<{ type: "idle" | "loading" | "success" | "error", message: string }>({ type: "idle", message: "" })

  // User Management State
  const [usersList, setUsersList] = useState<any[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [revenueList, setRevenueList] = useState<any[]>([])
  const [adStats, setAdStats] = useState<any>(null)
  const [moderationAlerts, setModerationAlerts] = useState<any[]>([])
  const [verificationRequests, setVerificationRequests] = useState<any[]>([])

  // Ad Manager State
  const [adsList, setAdsList] = useState<any[]>([])
  const [adFormData, setAdFormData] = useState({ title: "", imageUrl: "", targetUrl: "", isActive: true, cpc: 0, cpm: 0 })
  const [adStatus, setAdStatus] = useState<{ type: "idle" | "loading" | "success" | "error", message: string }>({ type: "idle", message: "" })

  // Fetch Users List
  const fetchUsers = async () => {
    setUsersLoading(true)
    try {
      const res = await fetch(`${API}/users?limit=100`)
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (data.success) {
        setUsersList(data.users)
      }
    } catch {
      toast.error("Failed to load user database")
    } finally {
      setUsersLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/admin-dashboard/stats`)
      const data = await res.json()
      if (data.success) setDashboardStats(data.stats)
    } catch {
      toast.error("Failed to fetch stats")
    }
  }

  const fetchRevenue = async () => {
    try {
      const res = await fetch(`${API}/admin-dashboard/revenue`)
      const revData = await res.json()
      if (revData.success) {
        setRevenueList(revData.data)
        if (revData.adStats) setAdStats(revData.adStats)
      }
    } catch {
      toast.error("Failed to fetch revenue")
    }
  }

  const fetchModeration = async () => {
    try {
      const res = await fetch(`${API}/admin-dashboard/moderation`)
      const data = await res.json()
      if (data.success) setModerationAlerts(data.data)
    } catch {
      toast.error("Failed to fetch moderation alerts")
    }
  }

  const fetchVerificationReqs = async () => {
    try {
      const res = await fetch(`${API}/admin-dashboard/verification-requests`)
      const data = await res.json()
      if (data.success) setVerificationRequests(data.data)
    } catch {
      toast.error("Failed to fetch verification requests")
    }
  }

  const fetchAds = async () => {
    try {
      const token = (user as any)?.stsTokenManager?.accessToken || (user as any)?.accessToken
      const res = await fetch(`${API}/ads/admin?firebaseUid=${user?.uid}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) setAdsList(data.data)
    } catch {
      toast.error("Failed to fetch ads")
    }
  }

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adFormData.imageUrl || (!/^https?:\/\//i.test(adFormData.imageUrl) && !adFormData.imageUrl.startsWith("data:image"))) {
      toast.error("Invalid Image URL. Please provide a valid link or upload an image.")
      return
    }
    if (!adFormData.targetUrl || !/^https?:\/\//i.test(adFormData.targetUrl)) {
      toast.error("Invalid Target Link. Must start with http:// or https://")
      return
    }
    setAdStatus({ type: "loading", message: "Creating ad..." })
    try {
      const token = (user as any)?.stsTokenManager?.accessToken || (user as any)?.accessToken
      const payload = { ...adFormData, firebaseUid: user?.uid }
      const res = await fetch(`${API}/ads/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (data.success) {
        setAdStatus({ type: "success", message: "Ad created successfully!" })
        setAdFormData({ title: "", imageUrl: "", targetUrl: "", isActive: true, cpc: 0, cpm: 0 })
        fetchAds()
        setTimeout(() => setAdStatus({ type: "idle", message: "" }), 3000)
      } else {
        setAdStatus({ type: "error", message: data.error })
      }
    } catch {
      setAdStatus({ type: "error", message: "Failed to create ad" })
    }
  }

  const handleAdImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setAdStatus({ type: "loading", message: "Uploading image to Cloudinary..." })
    try {
      const uploadData = new FormData()
      uploadData.append("file", file)
      
      const token = (user as any)?.stsTokenManager?.accessToken || (user as any)?.accessToken
      const res = await fetch(`${API}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: uploadData
      })
      
      const data = await res.json()
      if (data.url || data.secure_url) {
        setAdFormData(prev => ({ ...prev, imageUrl: data.url || data.secure_url }))
        setAdStatus({ type: "success", message: "Image uploaded! Ready to launch." })
        setTimeout(() => setAdStatus({ type: "idle", message: "" }), 3000)
      } else {
        setAdStatus({ type: "error", message: data.error || "Upload failed" })
      }
    } catch (err) {
      setAdStatus({ type: "error", message: "Network error during upload" })
    }
  }

  const handleDeleteAd = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ad?")) return
    try {
      const token = (user as any)?.stsTokenManager?.accessToken || (user as any)?.accessToken
      const res = await fetch(`${API}/ads/admin/${id}?firebaseUid=${user?.uid}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) fetchAds()
    } catch {
      toast.error("Failed to delete ad")
    }
  }

  useEffect(() => {
    let statsInterval: any;
    if (activeTab === "users") {
      fetchUsers()
      fetchVerificationReqs()
    }
    if (activeTab === "stats") {
      fetchStats()
      statsInterval = setInterval(fetchStats, 30000) // Auto-refresh stats every 30s
    }
    if (activeTab === "monetization") fetchRevenue()
    if (activeTab === "moderation") fetchModeration()
    if (activeTab === "ads") fetchAds()
    
    return () => clearInterval(statsInterval)
  }, [activeTab])

  // Admin Actions
  const handleToggleVerification = async (targetUser: any, action?: "approve" | "reject" | "revoke") => {
    if (!confirm(`Are you sure you want to ${action || "toggle verification"} for @${targetUser.username}?`)) return;
    try {
      const body: any = { adminFirebaseUid: user?.uid }
      if (action) body.action = action

      const res = await fetch(`${API}/users/${targetUser._id}/verify`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (data.success) {
        setUsersList(prev => prev.map(u => u._id === targetUser._id ? { ...u, isVerified: data.isVerified, verificationStatus: data.verificationStatus } : u))
        if (action === "approve" || action === "reject") {
           setVerificationRequests(prev => prev.filter(r => r._id !== targetUser._id))
        }
        toast.success(action ? `Verification ${action}ed for @${targetUser.username}` : `Verification toggled for @${targetUser.username}`)
      } else {
        toast.error(data.error || "Action unauthorized")
      }
    } catch {
      toast.error("Failed to update verification status")
    }
  }

  const handleToggleBan = async (targetUser: any) => {
    if (!confirm(`Are you sure you want to ${targetUser.isDisabled ? 'activate' : 'deactivate'} @${targetUser.username}?`)) return;
    try {
      const res = await fetch(`${API}/users/${targetUser._id}/toggle-ban`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminFirebaseUid: user?.uid })
      })
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (data.success) {
        setUsersList(prev => prev.map(u => u._id === targetUser._id ? { ...u, isDisabled: data.isDisabled } : u))
        toast.success(data.isDisabled ? `Account @${targetUser.username} deactivated` : `Account @${targetUser.username} activated`)
      } else {
        toast.error(data.error || "Action unauthorized")
      }
    } catch {
      toast.error("Failed to toggle ban status")
    }
  }

  const handleToggleAdmin = async (targetUser: any) => {
    if (!confirm(`CRITICAL: Are you sure you want to alter admin privileges for @${targetUser.username}?`)) return;
    try {
      const res = await fetch(`${API}/users/${targetUser._id}/toggle-admin`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminFirebaseUid: user?.uid })
      })
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (data.success) {
        setUsersList(prev => prev.map(u => u._id === targetUser._id ? { ...u, role: data.role } : u))
        toast.success(`Role updated for @${targetUser.username} to ${data.role}`)
      } else {
        toast.error(data.error || "Action unauthorized")
      }
    } catch {
      toast.error("Failed to update admin role")
    }
  }

  const handleModerationAction = async (id: string, action: "resolve" | "dismiss") => {
    if (!confirm(`Are you sure you want to ${action} this report?`)) return;
    try {
      const res = await fetch(`${API}/admin-dashboard/moderation/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      })
      if (res.ok) {
        setModerationAlerts(prev => prev.filter(a => a._id !== id))
        toast.success(`Report ${action}d`)
      }
    } catch {
      toast.error("Failed to perform action")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleCategoryToggle = (cat: string) => {
    setFormData((prev: any) => {
      let cats = [...prev.categories]
      if (cats.includes(cat)) {
        cats = cats.filter((c: string) => c !== cat)
      } else if (cats.length < 3) {
        cats.push(cat)
      }
      return { ...prev, categories: cats }
    })
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.title.length < 10) { toast.error("Title must be at least 10 characters."); return; }
    if (formData.excerpt.length < 20) { toast.error("Summary must be at least 20 characters."); return; }
    if (formData.content.length < 50) { toast.error("Content must be at least 50 characters."); return; }
    if (formData.categories.length === 0) { toast.error("Please select at least 1 category."); return; }

    setStatus({ type: "loading", message: "Publishing news..." })

    try {
      if (formData.categories.length === 0) {
        setStatus({ type: "error", message: "Please select at least 1 category." })
        return
      }

      let finalImageUrl = formData.image.trim();
      if (finalImageUrl && !/^https?:\/\//i.test(finalImageUrl) && !finalImageUrl.startsWith("data:image")) {
        finalImageUrl = "https://" + finalImageUrl;
      }

      const payload = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        categories: formData.categories,
        isBreaking: formData.isBreaking,
        isSponsored: formData.isSponsored,
        image: finalImageUrl,
        location: formData.location || "Global",
        tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
        author: "Fact Flow Editorial Desk",
        firebaseUid: user?.uid
      }

      const res = await fetch(`${API}/news`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (data.success) {
        setStatus({ type: "success", message: "News published successfully! 🎉" })
        setFormData({ title: "", excerpt: "", content: "", categories: ["Tech"], image: "", location: "", tags: "", isBreaking: false, isSponsored: false })
        setTimeout(() => setStatus({ type: "idle", message: "" }), 4000)
      } else {
        setStatus({ type: "error", message: data.error || "Failed to publish news." })
      }
    } catch (error) {
      setStatus({ type: "error", message: "Network error occurred." })
    }
  }

  const [isAdminChecked, setIsAdminChecked] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !user?.uid) return;
    
    // Fetch fresh role from DB because local auth state might be stale
    const checkRole = async () => {
      try {
        const res = await fetch(`${API}/users/profile?firebaseUid=${user.uid}`)
        const data = await res.json()
        if (data.success && (data.user?.role === "admin" || data.user?.email === "factflow1819@gmail.com" || user.email === "factflow1819@gmail.com")) {
          setIsAdmin(true)
        } else {
          router.push("/")
        }
      } catch (err) {
        console.error(err)
        router.push("/")
      } finally {
        setIsAdminChecked(true)
      }
    }
    
    checkRole()
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || !isAdminChecked || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const AVAILABLE_CATEGORIES = ["Tech", "Lifestyle", "Sports", "Politics", "Art", "Trending", "Newspaper", "Live"]

  return (
    <main className={`min-h-screen ${isDark ? "bg-[#0a0a0a] text-white" : "bg-gray-50 text-gray-900"} transition-colors duration-500`}>
      <Navbar />

      <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
        {/* SIDE BAR NAVIGATION */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          <div className="flex items-center gap-3 p-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-sm tracking-tight">Admin Portal</h2>
              <span className="text-[10px] text-gray-500 font-bold uppercase">Fact Flow OS</span>
            </div>
          </div>

          <button 
            onClick={() => setActiveTab("stats")}
            className={`flex items-center gap-3 p-3 rounded-xl text-sm font-bold text-left transition-all ${
              activeTab === "stats" 
                ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
                : isDark ? "text-white/70 hover:bg-white/5" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Dashboard Stats
          </button>
          
          <button 
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-3 p-3 rounded-xl text-sm font-bold text-left transition-all ${
              activeTab === "users" 
                ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
                : isDark ? "text-white/70 hover:bg-white/5" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <UsersIcon className="w-4 h-4" />
            Manage Users
          </button>
          
          <button 
            onClick={() => setActiveTab("news")}
            className={`flex items-center gap-3 p-3 rounded-xl text-sm font-bold text-left transition-all ${
              activeTab === "news" 
                ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
                : isDark ? "text-white/70 hover:bg-white/5" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Newspaper className="w-4 h-4" />
            Publish News
          </button>
          
          <button 
            onClick={() => setActiveTab("monetization")}
            className={`flex items-center gap-3 p-3 rounded-xl text-sm font-bold text-left transition-all ${
              activeTab === "monetization" 
                ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
                : isDark ? "text-white/70 hover:bg-white/5" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Coins className="w-4 h-4" />
            Revenue & Ads
          </button>
          
          <button 
            onClick={() => setActiveTab("moderation")}
            className={`flex items-center gap-3 p-3 rounded-xl text-sm font-bold text-left transition-all ${
              activeTab === "moderation" 
                ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
                : isDark ? "text-white/70 hover:bg-white/5" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Moderation Alerts
          </button>
          
          <button 
            onClick={() => setActiveTab("ads")}
            className={`flex items-center gap-3 p-3 rounded-xl text-sm font-bold text-left transition-all ${
              activeTab === "ads" 
                ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
                : isDark ? "text-white/70 hover:bg-white/5" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <LayoutTemplate className="w-4 h-4" />
            Ad Manager
          </button>
        </div>

        {/* DETAILS PANELS */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {/* TAB 1: DASHBOARD STATS */}
            {activeTab === "stats" && (
              <motion.div key="stats_tab" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Card 1 */}
                  <div className={`p-5 rounded-2xl border ${isDark ? "bg-[#161616] border-zinc-800" : "bg-white border-gray-200 shadow-sm"}`}>
                    <span className="text-xs text-gray-500 font-bold uppercase">Total Users</span>
                    <h3 className="text-3xl font-black mt-1">
                      {dashboardStats ? dashboardStats.totalUsers.toLocaleString() : <Loader2 className="w-6 h-6 animate-spin mt-2" />}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-green-500 mt-2">
                      <span className="font-bold">Live</span>
                    </div>
                  </div>
                  {/* Card 2 */}
                  <div className={`p-5 rounded-2xl border ${isDark ? "bg-[#161616] border-zinc-800" : "bg-white border-gray-200 shadow-sm"}`}>
                    <span className="text-xs text-gray-500 font-bold uppercase">Total News Articles</span>
                    <h3 className="text-3xl font-black mt-1">
                      {dashboardStats ? dashboardStats.totalNews.toLocaleString() : <Loader2 className="w-6 h-6 animate-spin mt-2" />}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-green-500 mt-2">
                      <span className="font-bold">Live</span>
                    </div>
                  </div>
                  {/* Card 3 */}
                  <div className={`p-5 rounded-2xl border ${isDark ? "bg-[#161616] border-zinc-800" : "bg-white border-gray-200 shadow-sm"}`}>
                    <span className="text-xs text-gray-500 font-bold uppercase">Total Revenue</span>
                    <h3 className="text-3xl font-black mt-1">
                      {dashboardStats ? `₹${dashboardStats.totalRevenue.toLocaleString()}` : <Loader2 className="w-6 h-6 animate-spin mt-2" />}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2">
                      From User Subscriptions
                    </div>
                  </div>
                  {/* Card 4 */}
                  <div className={`p-5 rounded-2xl border ${isDark ? "bg-[#161616] border-zinc-800" : "bg-white border-gray-200 shadow-sm"}`}>
                    <span className="text-xs text-gray-500 font-bold uppercase">System Status</span>
                    <h3 className="text-3xl font-black mt-1">Online</h3>
                    <div className="flex items-center gap-1.5 text-xs text-green-500 mt-2">
                      <span className="font-bold">All systems nominal</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Chart Container */}
                <div className={`p-6 rounded-2xl border ${isDark ? "bg-[#161616] border-zinc-800" : "bg-white border-gray-200 shadow-sm"}`}>
                  <h3 className="font-bold mb-4">Daily Engagement & Active Streams</h3>
                  <div className="h-64 flex items-end gap-3 pt-6 border-b border-zinc-700">
                    {[30, 45, 60, 40, 80, 95, 70, 85, 90, 110, 95, 120].map((val, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                        <div 
                          style={{ height: `${(val / 120) * 180}px` }} 
                          className="w-full bg-gradient-to-t from-red-500 to-pink-500 rounded-t-lg group-hover:from-red-400 group-hover:to-pink-400 transition-all duration-300 relative"
                        >
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {val}k
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400">{["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][idx]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: MANAGE USERS */}
            {activeTab === "users" && (
              <motion.div key="users_tab" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                
                {/* Verification Requests Section */}
                {verificationRequests.length > 0 && (
                  <div className={`p-6 rounded-2xl border border-blue-500/30 mb-6 ${isDark ? "bg-[#161616]" : "bg-blue-50/50"}`}>
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <BadgeCheck className="w-5 h-5 text-blue-500" /> Pending Verification Requests
                    </h3>
                    <div className="flex flex-col gap-3">
                      {verificationRequests.map((reqUser: any) => (
                        <div key={reqUser._id} className="flex justify-between items-center p-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl">
                          <div className="flex items-center gap-3">
                            <img src={reqUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reqUser.name}`} alt="" className="w-10 h-10 rounded-full" />
                            <div>
                              <p className="font-bold text-sm">{reqUser.name} <span className="text-gray-500 font-normal">@{reqUser.username}</span></p>
                              <p className="text-xs text-gray-500 truncate max-w-xs">{reqUser.bio}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleToggleVerification(reqUser, "approve")} className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors">Approve</button>
                            <button onClick={() => handleToggleVerification(reqUser, "reject")} className="px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-colors">Reject</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className={`rounded-2xl border overflow-hidden ${isDark ? "bg-[#161616] border-zinc-800" : "bg-white border-gray-200 shadow-sm"}`}>
                  <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <h3 className="font-bold">User Administration Database</h3>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className={`flex items-center px-3 py-1.5 rounded-lg border flex-1 sm:w-64 ${isDark ? "bg-black/20 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                        <Search className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
                        <input 
                          type="text" 
                          placeholder="Search username, email..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="bg-transparent border-none outline-none text-xs w-full"
                        />
                      </div>
                      <button onClick={fetchUsers} className="text-xs text-blue-500 font-bold hover:underline shrink-0">Reload Database</button>
                    </div>
                  </div>
                  
                  {usersLoading ? (
                    <div className="flex justify-center items-center py-20">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                  ) : usersList.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">No users found.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className={`border-b border-zinc-800 text-xs font-bold text-gray-400 uppercase ${isDark ? "bg-black/20" : "bg-gray-50"}`}>
                            <th className="p-4">User</th>
                            <th className="p-4">Verification</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usersList
                            .filter(u => 
                              (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (u.username || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (u.email || "").toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((u) => (
                            <tr key={u._id} className="border-b border-zinc-850 hover:bg-black/5">
                              <td className="p-4 flex items-center gap-3 cursor-pointer" onClick={() => setSelectedUser(u)}>
                                <div className="w-9 h-9 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                                  {u.avatar ? (
                                    <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center font-bold bg-zinc-700 text-white">
                                      {u.name?.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 hover:underline">
                                  <p className="font-bold text-xs truncate">{u.name}</p>
                                  <p className="text-[10px] text-gray-500">@{u.username || "no-username"}</p>
                                </div>
                              </td>
                              <td className="p-4">
                                {u.isVerified ? (
                                  <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">Verified</span>
                                ) : (
                                  <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-gray-500/10 text-gray-400">Regular</span>
                                )}
                              </td>
                              <td className="p-4 text-xs font-semibold capitalize">{u.role}</td>
                              <td className="p-4">
                                {u.isDisabled ? (
                                  <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-red-500 text-white">Banned</span>
                                ) : (
                                  <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-green-500 text-white">Active</span>
                                )}
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex gap-2 justify-end">
                                  <button 
                                    onClick={() => handleToggleVerification(u)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                                      u.isVerified 
                                        ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20" 
                                        : "border-blue-500/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                                    }`}
                                  >
                                    {u.isVerified ? "Revoke Badge" : "Verify User"}
                                  </button>
                                  <button 
                                    onClick={() => handleToggleBan(u)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                                      u.isDisabled 
                                        ? "border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/20" 
                                        : "border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                    }`}
                                  >
                                    {u.isDisabled ? "Unban" : "Ban"}
                                  </button>
                                  <button
                                    onClick={() => setSelectedUser(u)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                                      isDark ? "border-gray-500/20 bg-gray-500/10 text-gray-300 hover:bg-gray-500/20" : "border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                  >
                                    View Details
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 3: PUBLISH NEWS */}
            {activeTab === "news" && (
              <motion.div
                key="news_tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-8 rounded-2xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200 shadow-xl"}`}
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-gradient-to-tr from-red-500 to-pink-500 rounded-xl">
                    <Newspaper className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Publish News</h1>
                    <p className={`text-sm ${isDark ? "text-white/[0.85]" : "text-gray-500"}`}>Publish stories directly to the Fact Flow platform</p>
                  </div>
                </div>

                {status.type === "error" && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" /> {status.message}
                  </div>
                )}
                
                {status.type === "success" && (
                  <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> {status.message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className={`text-sm font-semibold ${isDark ? "text-white/[0.85]" : "text-gray-700"}`}>Headline *</label>
                      <input
                        type="text"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter breaking news title"
                        className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-red-500 transition-all ${
                          isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/30" : "bg-gray-50 border-gray-200 text-gray-900"
                        }`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className={`text-sm font-semibold ${isDark ? "text-white/[0.85]" : "text-gray-700"}`}>Categories (Max 3) *</label>
                      <div className="flex flex-wrap gap-2">
                        {AVAILABLE_CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => handleCategoryToggle(cat)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
                              formData.categories.includes(cat)
                                ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/30"
                                : isDark 
                                  ? "bg-white/5 text-white/60 border-white/10 hover:bg-white/10" 
                                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className={`text-sm font-semibold flex items-center gap-1.5 ${isDark ? "text-white/[0.85]" : "text-gray-700"}`}>
                        <MapPin className="w-3.5 h-3.5 text-red-500" /> Location / City
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g. New Delhi, Mumbai, Global"
                        className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-red-500 transition-all ${
                          isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/30" : "bg-gray-50 border-gray-200 text-gray-900"
                        }`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className={`text-sm font-semibold ${isDark ? "text-white/[0.85]" : "text-gray-700"}`}>Image URL *</label>
                      <input
                        type="text"
                        name="image"
                        required
                        value={formData.image}
                        onChange={handleChange}
                        placeholder="Paste image URL (e.g. example.com/img.jpg)"
                        className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-red-500 transition-all ${
                          isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/30" : "bg-gray-50 border-gray-200 text-gray-900"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={`text-sm font-semibold flex items-center gap-1.5 ${isDark ? "text-white/[0.85]" : "text-gray-700"}`}>
                      <Tag className="w-3.5 h-3.5 text-red-500" /> Tags
                      <span className={`ml-1 text-xs font-normal ${isDark ? "text-white/40" : "text-gray-400"}`}>(comma separated)</span>
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="politics, india, breaking, economy"
                      className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-red-500 transition-all ${
                        isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/30" : "bg-gray-50 border-gray-200 text-gray-900"
                      }`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className={`text-sm font-semibold ${isDark ? "text-white/[0.85]" : "text-gray-700"}`}>Short Excerpt *</label>
                    <textarea
                      name="excerpt"
                      required
                      rows={2}
                      value={formData.excerpt}
                      onChange={handleChange}
                      placeholder="A brief summary shown in news cards and search results..."
                      className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-red-500 resize-none transition-all ${
                        isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/30" : "bg-gray-50 border-gray-200 text-gray-900"
                      }`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className={`text-sm font-semibold ${isDark ? "text-white/[0.85]" : "text-gray-700"}`}>Full Article Content *</label>
                    <textarea
                      name="content"
                      required
                      rows={8}
                      value={formData.content}
                      onChange={handleChange}
                      placeholder={`Write paragraphs here...`}
                      className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-red-500 transition-all leading-relaxed ${
                        isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/30" : "bg-gray-50 border-gray-200 text-gray-900"
                      }`}
                    />
                  </div>

                  <div className={`p-5 rounded-xl border mb-6 ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                    <label className={`block text-sm font-semibold mb-3 ${isDark ? "text-white/[0.85]" : "text-gray-700"}`}>Article Type / Visibility</label>
                    <select
                      value={formData.isBreaking ? "breaking" : formData.isSponsored ? "sponsored" : "standard"}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({
                          ...formData,
                          isBreaking: val === "breaking",
                          isSponsored: val === "sponsored"
                        });
                      }}
                      className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-red-500 transition-all font-bold ${
                        isDark ? "bg-[#111] border-white/20 text-white" : "bg-white border-gray-300 text-gray-900 shadow-sm"
                      }`}
                    >
                      <option value="standard">📰 Standard News Article (Default)</option>
                      <option value="breaking">🚨 Breaking News (Pin to Live Scrolling Ticker)</option>
                      <option value="sponsored">💰 Sponsored Article (Show as Native Ad)</option>
                    </select>
                    <p className={`text-xs mt-3 ${isDark ? "text-white/50" : "text-gray-500"}`}>
                      {formData.isBreaking && "This article will be pinned to the top scrolling ticker for immediate attention."}
                      {formData.isSponsored && "This article will display a 'Sponsored' badge to comply with native advertising rules."}
                      {!formData.isBreaking && !formData.isSponsored && "This article will be published normally to the selected categories."}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={status.type === "loading"}
                    className="w-full py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {status.type === "loading" ? "Publishing..." : (
                      <>Publish to Fact Flow <Send className="w-5 h-5" /></>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* TAB 4: REVENUE & ADS */}
            {activeTab === "monetization" && (
              <motion.div key="monetization" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                
                {/* AD REVENUE OVERVIEW */}
                {adStats && (
                  <div className={`p-6 rounded-2xl border ${isDark ? "bg-[#161616] border-zinc-800" : "bg-white border-gray-200 shadow-sm"}`}>
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <span className="text-xl">💰</span> Ad Network Earnings
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className={`p-4 rounded-xl border ${isDark ? "bg-black/40 border-white/5" : "bg-blue-50 border-blue-100"}`}>
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Custom Ad Revenue</p>
                        <h4 className="text-2xl font-black text-blue-500">₹{adStats.estimatedCustomRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h4>
                        <p className="text-[10px] text-gray-400 mt-1">Based on {adStats.totalClicks} clicks & {adStats.totalViews} views</p>
                      </div>
                      <div className={`p-4 rounded-xl border ${isDark ? "bg-black/40 border-white/5" : "bg-orange-50 border-orange-100"}`}>
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">AdSense (Estimated)</p>
                        <h4 className="text-2xl font-black text-orange-500">₹{adStats.estimatedAdSenseRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h4>
                        <p className="text-[10px] text-gray-400 mt-1">Fallback ad network earnings</p>
                      </div>
                      <div className={`p-4 rounded-xl border ${isDark ? "bg-black/40 border-white/5" : "bg-green-50 border-green-100"}`}>
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Total Ad Revenue</p>
                        <h4 className="text-2xl font-black text-green-500">₹{(adStats.estimatedCustomRevenue + adStats.estimatedAdSenseRevenue).toLocaleString(undefined, { maximumFractionDigits: 0 })}</h4>
                        <p className="text-[10px] text-gray-400 mt-1">All networks combined</p>
                      </div>
                      <div className={`p-4 rounded-xl border ${isDark ? "bg-black/40 border-white/5" : "bg-purple-50 border-purple-100"}`}>
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Total Impressions</p>
                        <h4 className="text-2xl font-black text-purple-500">{adStats.totalViews.toLocaleString()}</h4>
                        <p className="text-[10px] text-gray-400 mt-1">Total unique views served</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBSCRIPTIONS */}
                <div className={`p-6 rounded-2xl border ${isDark ? "bg-[#161616] border-zinc-800" : "bg-white border-gray-200 shadow-sm"}`}>
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <span className="text-xl">💳</span> Recent Subscription Payments
                  </h3>
                  <div className="flex flex-col gap-4">
                    {revenueList.length === 0 ? (
                      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>No recent transactions.</p>
                    ) : (
                      revenueList.map((payment: any) => (
                        <div key={payment._id} className="flex justify-between items-center p-4 rounded-xl bg-zinc-800/20 border border-zinc-800">
                          <div>
                            <p className="text-xs text-gray-500 font-bold uppercase">Transaction #{payment._id.substring(0, 8)}</p>
                            <h4 className="font-bold text-sm">Subscription Payment - {payment.status}</h4>
                            <span className="text-[10px] text-green-500 font-semibold">{new Date(payment.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-sm">₹{payment.amount}</p>
                            <span className="text-[10px] text-gray-500">Collected</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 5: MODERATION ALERTS */}
            {activeTab === "moderation" && (
              <motion.div key="moderation" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                
                {/* Verification Requests Section */}
                {verificationRequests.length > 0 && (
                  <div className={`p-6 rounded-2xl border border-blue-500/30 ${isDark ? "bg-[#161616]" : "bg-blue-50/50"}`}>
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <BadgeCheck className="w-5 h-5 text-blue-500" /> Pending Verification Requests
                    </h3>
                    <div className="flex flex-col gap-3">
                      {verificationRequests.map((reqUser: any) => (
                        <div key={reqUser._id} className="flex justify-between items-center p-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl">
                          <div className="flex items-center gap-3">
                            <img src={reqUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reqUser.name}`} alt="" className="w-10 h-10 rounded-full" />
                            <div>
                              <p className="font-bold text-sm">{reqUser.name} <span className="text-gray-500 font-normal">@{reqUser.username}</span></p>
                              <p className="text-xs text-gray-500 truncate max-w-xs">{reqUser.bio}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleToggleVerification(reqUser, "approve")} className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors">Approve</button>
                            <button onClick={() => handleToggleVerification(reqUser, "reject")} className="px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-colors">Reject</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className={`p-6 rounded-2xl border ${isDark ? "bg-[#161616] border-zinc-800" : "bg-white border-gray-200 shadow-sm"}`}>
                  <h3 className="font-bold mb-4">Flagged Social Content Reports</h3>
                  <div className="flex flex-col gap-4">
                    {moderationAlerts.length === 0 ? (
                      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>No pending reports! Good job.</p>
                    ) : (
                      moderationAlerts.map((report: any) => (
                        <div key={report._id} className="p-4 rounded-xl bg-zinc-800/20 border border-zinc-800 flex justify-between items-center">
                          <div>
                            <p className="text-xs text-red-500 font-bold flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5" /> Flagged {report.itemType}</p>
                            <p className="text-xs italic mt-1 text-gray-400">"{report.reason}"</p>
                            <span className="text-[10px] text-gray-500">Item ID: {report.reportedItemId}</span>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleModerationAction(report._id, "resolve")} title="Resolve (Take Action)" className="p-2 rounded-lg bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20 transition-colors"><Check className="w-4 h-4" /></button>
                            <button onClick={() => handleModerationAction(report._id, "dismiss")} title="Dismiss Alert" className="p-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors"><X className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}
            {/* TAB 4: MONETIZATION & REVENUE */}
            {activeTab === "monetization" && (
              <motion.div key="monetization_tab" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                
                {/* Revenue Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`p-6 rounded-2xl border ${isDark ? "bg-[#161616] border-zinc-800" : "bg-white border-gray-200 shadow-sm"}`}>
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Total Subscription Revenue</h3>
                    <p className="text-3xl font-black text-green-500">
                      ₹{dashboardStats?.totalRevenue ? dashboardStats.totalRevenue.toLocaleString() : 0}
                    </p>
                  </div>
                  <div className={`p-6 rounded-2xl border ${isDark ? "bg-[#161616] border-zinc-800" : "bg-white border-gray-200 shadow-sm"}`}>
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Total Ad Revenue (Estimated)</h3>
                    <p className="text-3xl font-black text-blue-500">
                      ₹{adStats ? (adStats.estimatedCustomRevenue + adStats.estimatedAdSenseRevenue).toFixed(2) : 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Custom Ads: ₹{adStats?.estimatedCustomRevenue?.toFixed(2) || 0} | AdSense: ₹{adStats?.estimatedAdSenseRevenue?.toFixed(2) || 0}</p>
                  </div>
                </div>

                {/* Billing History Table */}
                <div className={`p-6 rounded-2xl border overflow-hidden ${isDark ? "bg-[#161616] border-zinc-800" : "bg-white border-gray-200 shadow-sm"}`}>
                  <h3 className="font-bold mb-4">Recent Subscription Transactions</h3>
                  
                  {revenueList.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">No payment records found.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className={`border-b ${isDark ? "border-zinc-800 text-gray-400" : "border-gray-200 text-gray-500"} uppercase text-xs`}>
                            <th className="p-3">Paytm ID</th>
                            <th className="p-3">Plan</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {revenueList.map((payment) => (
                            <tr key={payment._id} className={`border-b ${isDark ? "border-zinc-800/50 hover:bg-white/5" : "border-gray-100 hover:bg-gray-50"}`}>
                              <td className="p-3 font-mono text-xs">{payment.paytmTransactionId || payment.paytmOrderId}</td>
                              <td className="p-3 capitalize font-bold text-blue-500">{payment.plan}</td>
                              <td className="p-3 font-bold">₹{(payment.amount || 0).toLocaleString()}</td>
                              <td className="p-3">
                                {payment.status === "paid" ? (
                                  <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold rounded">PAID</span>
                                ) : (
                                  <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-[10px] font-bold rounded uppercase">{payment.status}</span>
                                )}
                              </td>
                              <td className="p-3 text-xs text-gray-500">{new Date(payment.createdAt).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 6: AD MANAGER */}
            {activeTab === "ads" && (
              <motion.div key="ads_tab" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className={`p-6 rounded-2xl border ${isDark ? "bg-[#161616] border-zinc-800" : "bg-white border-gray-200 shadow-sm"}`}>
                  <h3 className="font-bold mb-4">Create New Campaign</h3>
                  {adStatus.type === "error" && <div className="mb-4 text-red-500 text-sm font-bold">{adStatus.message}</div>}
                  {adStatus.type === "success" && <div className="mb-4 text-green-500 text-sm font-bold">{adStatus.message}</div>}
                  
                  {adFormData.imageUrl && (
                    <div className="mb-6">
                      <label className={`text-xs font-bold ${isDark ? "text-gray-400" : "text-gray-500"} mb-2 block`}>Live Image Preview</label>
                      <div className={`w-full max-w-[728px] h-auto min-h-[90px] rounded-lg border border-dashed ${isDark ? "border-white/20 bg-black/50" : "border-gray-300 bg-gray-50"} overflow-hidden flex items-center justify-center relative`}>
                        <img src={adFormData.imageUrl} alt="Preview" className="w-full h-full object-cover max-h-[250px]" onError={(e) => (e.currentTarget.style.display = 'none')} onLoad={(e) => (e.currentTarget.style.display = 'block')} />
                        <span className="absolute text-xs text-gray-400 -z-10">Invalid or loading image...</span>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleCreateAd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Campaign Title (e.g. Nike Summer Promo)" required value={adFormData.title} onChange={(e) => setAdFormData({ ...adFormData, title: e.target.value })} className={`px-4 py-2 rounded-xl border outline-none ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`} />
                    <input type="text" placeholder="Target Link (Where user goes on click)" required value={adFormData.targetUrl} onChange={(e) => setAdFormData({ ...adFormData, targetUrl: e.target.value })} className={`px-4 py-2 rounded-xl border outline-none ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`} />
                    
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className={`text-xs font-bold ${isDark ? "text-gray-400" : "text-gray-500"}`}>Or Upload Image File</label>
                        <input type="file" accept="image/*" onChange={handleAdImageUpload} className={`px-4 py-1.5 rounded-xl border outline-none cursor-pointer ${isDark ? "bg-white/5 border-white/10 file:bg-white/10 file:text-white file:border-0" : "bg-gray-50 border-gray-200 file:bg-gray-200 file:text-gray-700 file:border-0"} file:mr-4 file:py-1 file:px-3 file:rounded-lg file:text-xs file:font-bold file:cursor-pointer`} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className={`text-xs font-bold ${isDark ? "text-gray-400" : "text-gray-500"}`}>Image URL (Direct Link)</label>
                        <input type="text" placeholder="https://example.com/ad.jpg" required value={adFormData.imageUrl} onChange={(e) => setAdFormData({ ...adFormData, imageUrl: e.target.value })} className={`w-full px-4 py-2 rounded-xl border outline-none ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`} />
                      </div>
                    </div>
                    
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className={`text-xs font-bold ${isDark ? "text-gray-400" : "text-gray-500"}`}>CPC Rate (₹ per click)</label>
                        <input type="number" min="0" step="0.5" placeholder="e.g. 5" required value={adFormData.cpc} onChange={(e) => setAdFormData({ ...adFormData, cpc: Number(e.target.value) })} className={`px-4 py-2 rounded-xl border outline-none ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className={`text-xs font-bold ${isDark ? "text-gray-400" : "text-gray-500"}`}>CPM Rate (₹ per 1000 views)</label>
                        <input type="number" min="0" step="1" placeholder="e.g. 50" required value={adFormData.cpm} onChange={(e) => setAdFormData({ ...adFormData, cpm: Number(e.target.value) })} className={`px-4 py-2 rounded-xl border outline-none ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`} />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 font-bold text-sm md:col-span-2">
                      <input type="checkbox" checked={adFormData.isActive} onChange={(e) => setAdFormData({ ...adFormData, isActive: e.target.checked })} className="w-5 h-5" />
                      Active (Display immediately)
                    </label>
                    <button type="submit" disabled={adStatus.type === "loading"} className="md:col-span-2 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50">
                      {adStatus.type === "loading" ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                      Launch Ad Campaign
                    </button>
                  </form>
                </div>

                <div className={`p-6 rounded-2xl border ${isDark ? "bg-[#161616] border-zinc-800" : "bg-white border-gray-200 shadow-sm"}`}>
                  <h3 className="font-bold mb-4">Active & Past Campaigns</h3>
                  <div className="space-y-4">
                    {adsList.length === 0 ? (
                      <p className="text-gray-500 text-sm">No ads found.</p>
                    ) : (
                      adsList.map(ad => (
                        <div key={ad._id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border ${isDark ? "bg-black/20 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                          <div className="flex items-center gap-4">
                            <div className="w-24 h-16 bg-gray-200 rounded-lg overflow-hidden shrink-0 border border-gray-300 dark:border-zinc-700">
                              <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <h4 className="font-bold">{ad.title}</h4>
                              <p className="text-xs text-gray-500 truncate max-w-[200px]">{ad.targetUrl}</p>
                              <div className="flex gap-3 mt-1">
                                <span className="text-[10px] font-bold text-blue-500">{ad.views} Views</span>
                                <span className="text-[10px] font-bold text-green-500">{ad.clicks} Clicks</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-4 sm:mt-0">
                            {ad.isActive ? (
                              <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold rounded">LIVE</span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-500/10 text-gray-500 text-[10px] font-bold rounded">PAUSED</span>
                            )}
                            <button onClick={() => handleDeleteAd(ad._id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>
      
      {/* User Details Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md p-6 rounded-2xl shadow-2xl ${isDark ? "bg-[#1E293B] text-white border border-white/10" : "bg-white text-gray-900"}`}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">User Details</h2>
                <button onClick={() => setSelectedUser(null)} className="p-2 rounded-full hover:bg-gray-500/20 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-800">
                  {selectedUser.avatar ? (
                    <img src={selectedUser.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-xl bg-red-600 text-white">
                      {selectedUser.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{selectedUser.name}</h3>
                  <p className="text-sm text-gray-500">@{selectedUser.username || "no-username"}</p>
                  <p className="text-xs mt-1 font-mono text-gray-400">{selectedUser.email}</p>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between p-3 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/5">
                  <span className="text-sm font-semibold text-gray-500">Status</span>
                  <span className="text-sm font-bold">{selectedUser.isDisabled ? <span className="text-red-500">BANNED</span> : <span className="text-green-500">ACTIVE</span>}</span>
                </div>
                <div className="flex justify-between p-3 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/5">
                  <span className="text-sm font-semibold text-gray-500">Role</span>
                  <span className="text-sm font-bold uppercase">{selectedUser.role}</span>
                </div>
                <div className="flex justify-between p-3 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/5">
                  <span className="text-sm font-semibold text-gray-500">Joined</span>
                  <span className="text-sm font-bold">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* SUPER ADMIN ONLY SECTION */}
              {user?.email === "factflow1819@gmail.com" && (
                <div className="pt-4 border-t border-black/10 dark:border-white/10">
                  <h4 className="text-xs font-black uppercase text-gray-500 mb-3">Owner Actions</h4>
                  <button
                    onClick={async () => {
                      await handleToggleAdmin(selectedUser);
                      setSelectedUser({ ...selectedUser, role: selectedUser.role === "admin" ? "viewer" : "admin" });
                    }}
                    className={`w-full py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-all ${
                      selectedUser.role === "admin"
                        ? "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
                        : "bg-purple-600 text-white shadow-lg shadow-purple-900/20 hover:bg-purple-700"
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5" />
                    {selectedUser.role === "admin" ? "Remove Admin Privileges" : "Make Admin"}
                  </button>
                  <p className="text-[10px] text-center text-gray-500 mt-2">Only the Super Owner (factflow1819@gmail.com) can see this option.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  )
}
