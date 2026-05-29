"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Newspaper, Send, AlertCircle, CheckCircle2, MapPin, Tag, 
  ToggleLeft, ToggleRight, BarChart3, Users as UsersIcon, ShieldAlert,
  Coins, Settings, Eye, Check, X, ShieldCheck, ArrowLeft, Loader2
} from "lucide-react"
import { Navbar } from "@/components/frontend/navbar"
import { Footer } from "@/components/frontend/footer"
import { useTheme } from "@/components/theme-provider"
import { useAuthStore } from "@/store/auth-store"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function AdminDashboard() {
  const { theme } = useTheme()
  const isDark = theme !== "light"
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<"stats" | "users" | "news" | "monetization" | "moderation">("stats")

  // Publish News State
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "Tech",
    image: "",
    location: "",
    tags: "",
    isBreaking: false,
    isFeatured: false,
  })
  
  const [status, setStatus] = useState<{ type: "idle" | "loading" | "success" | "error", message: string }>({ type: "idle", message: "" })

  // User Management State
  const [usersList, setUsersList] = useState<any[]>([])
  const [usersLoading, setUsersLoading] = useState(false)

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

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers()
    }
  }, [activeTab])

  // Admin Actions
  const handleToggleVerification = async (targetUser: any) => {
    try {
      const res = await fetch(`${API}/users/${targetUser._id}/verify`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminFirebaseUid: user?.uid })
      })
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (data.success) {
        setUsersList(prev => prev.map(u => u._id === targetUser._id ? { ...u, isVerified: data.isVerified } : u))
        toast.success(`Verification status updated for @${targetUser.username}`)
      } else {
        toast.error(data.error || "Action unauthorized")
      }
    } catch {
      toast.error("Failed to update verification status")
    }
  }

  const handleToggleBan = async (targetUser: any) => {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleToggle = (field: "isBreaking" | "isFeatured") => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus({ type: "loading", message: "Publishing news..." })

    try {
      const payload = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        image: formData.image,
        location: formData.location || "Global",
        tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
        isBreaking: formData.isBreaking,
        isFeatured: formData.isFeatured,
        author: "Fact Flow Editorial Desk",
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
        setFormData({ title: "", excerpt: "", content: "", category: "Tech", image: "", location: "", tags: "", isBreaking: false, isFeatured: false })
        setTimeout(() => setStatus({ type: "idle", message: "" }), 4000)
      } else {
        setStatus({ type: "error", message: data.error || "Failed to publish news." })
      }
    } catch (error) {
      setStatus({ type: "error", message: "Network error occurred." })
    }
  }

  if (!isAuthenticated) {
    return (
      <main className={`min-h-screen ${isDark ? "bg-black" : "bg-gray-50"}`}>
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen px-4">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4 animate-bounce" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-500 text-center max-w-sm mb-6">You must be logged in as an admin to view the administrative panel.</p>
          <button onClick={() => router.push("/login")} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-colors">
            Login
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className={`min-h-screen ${isDark ? "bg-[#0a0a0a]" : "bg-gray-50"} transition-colors duration-500`}>
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
        </div>

        {/* DETAILS PANELS */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {/* TAB 1: DASHBOARD STATS */}
            {activeTab === "stats" && (
              <motion.div key="stats" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Card 1 */}
                  <div className={`p-5 rounded-2xl border ${isDark ? "bg-[#161616] border-zinc-800" : "bg-white border-gray-200 shadow-sm"}`}>
                    <span className="text-xs text-gray-500 font-bold uppercase">Total Users</span>
                    <h3 className="text-3xl font-black mt-1">142,800</h3>
                    <div className="flex items-center gap-1.5 text-xs text-green-500 mt-2">
                      <span className="font-bold">+12%</span> this week
                    </div>
                  </div>
                  {/* Card 2 */}
                  <div className={`p-5 rounded-2xl border ${isDark ? "bg-[#161616] border-zinc-800" : "bg-white border-gray-200 shadow-sm"}`}>
                    <span className="text-xs text-gray-500 font-bold uppercase">Weekly Ad Revenue</span>
                    <h3 className="text-3xl font-black mt-1">$12,490</h3>
                    <div className="flex items-center gap-1.5 text-xs text-green-500 mt-2">
                      <span className="font-bold">+8.4%</span> this week
                    </div>
                  </div>
                  {/* Card 3 */}
                  <div className={`p-5 rounded-2xl border ${isDark ? "bg-[#161616] border-zinc-800" : "bg-white border-gray-200 shadow-sm"}`}>
                    <span className="text-xs text-gray-500 font-bold uppercase">Active Campaigns</span>
                    <h3 className="text-3xl font-black mt-1">16 Ads</h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2">
                      Sponsored Reels/Posts
                    </div>
                  </div>
                  {/* Card 4 */}
                  <div className={`p-5 rounded-2xl border ${isDark ? "bg-[#161616] border-zinc-800" : "bg-white border-gray-200 shadow-sm"}`}>
                    <span className="text-xs text-gray-500 font-bold uppercase">Engagement Rate</span>
                    <h3 className="text-3xl font-black mt-1">68.2%</h3>
                    <div className="flex items-center gap-1.5 text-xs text-green-500 mt-2">
                      <span className="font-bold">+3.1%</span> vs last week
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
              <motion.div key="users" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className={`rounded-2xl border overflow-hidden ${isDark ? "bg-[#161616] border-zinc-800" : "bg-white border-gray-200 shadow-sm"}`}>
                  <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                    <h3 className="font-bold">User Administration Database</h3>
                    <button onClick={fetchUsers} className="text-xs text-blue-500 font-bold hover:underline">Reload Database</button>
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
                          {usersList.map((u) => (
                            <tr key={u._id} className="border-b border-zinc-850 hover:bg-black/5">
                              <td className="p-4 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                                  {u.avatar ? (
                                    <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center font-bold bg-zinc-700">
                                      {u.name?.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
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
                key="news"
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
                      <label className={`text-sm font-semibold ${isDark ? "text-white/[0.85]" : "text-gray-700"}`}>Category *</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-red-500 transition-all ${
                          isDark ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                        }`}
                      >
                        <option value="Tech">Tech</option>
                        <option value="Lifestyle">Lifestyle</option>
                        <option value="Sports">Sports</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Politics">Politics</option>
                        <option value="Science">Science</option>
                        <option value="World">World</option>
                        <option value="Memes">Memes</option>
                        <option value="Breaking">Breaking</option>
                      </select>
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
                        type="url"
                        name="image"
                        required
                        value={formData.image}
                        onChange={handleChange}
                        placeholder="https://example.com/image.jpg"
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

                  <div className={`flex flex-wrap gap-4 p-4 rounded-xl border ${
                    isDark ? "bg-white/[0.03] border-white/10" : "bg-gray-50 border-gray-200"
                  }`}>
                    <button
                      type="button"
                      onClick={() => handleToggle("isBreaking")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        formData.isBreaking
                          ? "bg-yellow-500 text-black"
                          : isDark ? "bg-white/10 text-white/70" : "bg-white text-gray-600 border border-gray-200"
                      }`}
                    >
                      {formData.isBreaking ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      Breaking News
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggle("isFeatured")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        formData.isFeatured
                          ? "bg-red-500 text-white"
                          : isDark ? "bg-white/10 text-white/70" : "bg-white text-gray-600 border border-gray-200"
                      }`}
                    >
                      {formData.isFeatured ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      Featured Story
                    </button>
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
                <div className={`p-6 rounded-2xl border ${isDark ? "bg-[#161616] border-zinc-800" : "bg-white border-gray-200 shadow-sm"}`}>
                  <h3 className="font-bold mb-4">Active Sponsored Advertising Campaigns</h3>
                  <div className="flex flex-col gap-4">
                    {/* Fake ad 1 */}
                    <div className="flex justify-between items-center p-4 rounded-xl bg-zinc-800/20 border border-zinc-800">
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Campaign #FF-8090</p>
                        <h4 className="font-bold text-sm">Nike Air Max Pro Sponsored Reel</h4>
                        <span className="text-[10px] text-green-500 font-semibold">Active &bull; CPM $4.50</span>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-sm">$4,280.50</p>
                        <span className="text-[10px] text-gray-500">Generated</span>
                      </div>
                    </div>
                    {/* Fake ad 2 */}
                    <div className="flex justify-between items-center p-4 rounded-xl bg-zinc-800/20 border border-zinc-800">
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Campaign #FF-8112</p>
                        <h4 className="font-bold text-sm">Tesla Cybercore Section Banner</h4>
                        <span className="text-[10px] text-green-500 font-semibold">Active &bull; CPC $0.20</span>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-sm">$2,891.10</p>
                        <span className="text-[10px] text-gray-500">Generated</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 5: MODERATION ALERTS */}
            {activeTab === "moderation" && (
              <motion.div key="moderation" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className={`p-6 rounded-2xl border ${isDark ? "bg-[#161616] border-zinc-800" : "bg-white border-gray-200 shadow-sm"}`}>
                  <h3 className="font-bold mb-4">Flagged Social Content Reports</h3>
                  <div className="flex flex-col gap-4">
                    {/* Fake Report 1 */}
                    <div className="p-4 rounded-xl bg-zinc-800/20 border border-zinc-800 flex justify-between items-center">
                      <div>
                        <p className="text-xs text-red-500 font-bold flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5" /> Flagged Comment &bull; Spam</p>
                        <p className="text-xs italic mt-1 text-gray-400">"Buy cheap coins at fakeurl.com!"</p>
                        <span className="text-[10px] text-gray-500">Reported on @user89 post</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 rounded-lg bg-green-500/10 text-green-500 border border-green-500/20"><Check className="w-4 h-4" /></button>
                        <button className="p-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20"><X className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </main>
  )
}
