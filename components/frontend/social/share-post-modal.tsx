"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, Loader2, Link as LinkIcon } from "lucide-react"
import { useAuthStore } from "@/store/auth-store"
import { toast } from "sonner"

const API = process.env.NEXT_PUBLIC_API_URL || "/api"

interface SharePostModalProps {
  isOpen: boolean
  onClose: () => void
  post: any
  isDark: boolean
}

export function SharePostModal({ isOpen, onClose, post, isDark }: SharePostModalProps) {
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [sentTo, setSentTo] = useState<Set<string>>(new Set())
  const { user } = useAuthStore()

  const fetchUsers = useCallback(async (q: string) => {
    setLoading(true)
    try {
      const url = q
        ? `${API}/users?search=${encodeURIComponent(q)}&limit=30`
        : `${API}/users?limit=30`
      const res = await fetch(url)
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (data.success) {
        // Exclude self
        setUsers(data.users.filter((u: any) => u.firebaseUid !== user?.uid))
      }
    } catch (err) {
      console.error("Failed to fetch users", err)
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  useEffect(() => {
    if (isOpen) {
      setSentTo(new Set())
      fetchUsers("")
    }
  }, [isOpen, fetchUsers])

  // Debounced search
  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(() => fetchUsers(search), 300)
    return () => clearTimeout(timer)
  }, [search, isOpen, fetchUsers])

  const handleSend = async (friendId: string) => {
    if (!user) { toast.error("Please login first"); return }
    setSentTo(prev => new Set(prev).add(friendId))
    try {
      const res = await fetch(`${API}/posts/${post._id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseUid: user.uid, friendIds: [friendId] }),
      })
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
    } catch (err: any) {
      toast.error("Failed to send")
      setSentTo(prev => { const n = new Set(prev); n.delete(friendId); return n })
    }
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/post/${post._id}`
    navigator.clipboard.writeText(url)
    toast.success("Link copied!")
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[320] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm">
          {/* Tap outside to close */}
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`relative w-full md:max-w-sm h-[85vh] md:h-[80vh] flex flex-col rounded-t-2xl md:rounded-2xl overflow-hidden shadow-2xl ${isDark ? "bg-[#262626] text-white" : "bg-white text-black"}`}
          >
            {/* Drag handle (mobile) */}
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className={`w-10 h-1 rounded-full ${isDark ? "bg-white/20" : "bg-gray-300"}`} />
            </div>

            {/* Header */}
            <div className={`h-14 flex items-center justify-between px-4 border-b ${isDark ? "border-white/10" : "border-gray-200"}`}>
              <h2 className="text-base font-bold">Share</h2>
              <button onClick={onClose} className="p-1 hover:opacity-70 transition-opacity">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick actions — Copy Link */}
            <div className={`px-4 py-3 border-b ${isDark ? "border-white/10" : "border-gray-100"}`}>
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors ${isDark ? "bg-white/5 hover:bg-white/10" : "bg-gray-50 hover:bg-gray-100"}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? "bg-white/10" : "bg-gray-200"}`}>
                  <LinkIcon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">Copy link</p>
                  <p className={`text-xs ${isDark ? "text-white/50" : "text-gray-500"}`}>Share anywhere</p>
                </div>
              </button>
            </div>

            {/* Search */}
            <div className={`px-4 py-2 border-b ${isDark ? "border-white/10" : "border-gray-100"}`}>
              <div className={`flex items-center gap-2 px-3 rounded-xl ${isDark ? "bg-black/40" : "bg-gray-100"}`}>
                <Search className={`w-4 h-4 shrink-0 ${isDark ? "text-white/40" : "text-gray-400"}`} />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search people..."
                  className={`flex-1 h-10 bg-transparent border-none text-sm focus:outline-none ${isDark ? "placeholder:text-white/30" : "placeholder:text-gray-400"}`}
                />
                {search && (
                  <button onClick={() => setSearch("")} className="opacity-50 hover:opacity-100">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto px-2 py-2">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin opacity-40" />
                </div>
              ) : users.length === 0 ? (
                <div className={`text-center py-12 text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}>
                  {search ? `No results for "${search}"` : "No users found"}
                </div>
              ) : (
                users.map(u => (
                  <div
                    key={u._id}
                    className={`flex items-center justify-between gap-3 p-2.5 rounded-xl transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}
                  >
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 bg-zinc-800">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-purple-600 to-pink-500">
                          {u.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm leading-tight truncate">
                        {u.name}
                        {u.isVerified && (
                          <svg viewBox="0 0 24 24" className="inline w-3.5 h-3.5 ml-1 text-blue-500 fill-current">
                            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7L6 12.6l1.5-1.5 2.6 2.6 6.4-6.4 1.5 1.5-7.9 7.9z" />
                          </svg>
                        )}
                      </p>
                      <p className={`text-xs truncate ${isDark ? "text-white/50" : "text-gray-500"}`}>
                        @{u.username || "user"}
                      </p>
                    </div>

                    {/* Send Button */}
                    <button
                      onClick={() => handleSend(u._id)}
                      disabled={sentTo.has(u._id)}
                      className={`shrink-0 px-4 py-1.5 rounded-lg text-sm font-bold transition-all active:scale-95 ${
                        sentTo.has(u._id)
                          ? isDark
                            ? "border border-white/20 text-white/40 cursor-default"
                            : "border border-gray-200 text-gray-400 cursor-default"
                          : "bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
                      }`}
                    >
                      {sentTo.has(u._id) ? "Sent ✓" : "Send"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
