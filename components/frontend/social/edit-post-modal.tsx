"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Loader2, Check } from "lucide-react"
import { useAuthStore } from "@/store/auth-store"
import { toast } from "sonner"

interface EditPostModalProps {
  isOpen: boolean
  onClose: () => void
  post: any
  isDark: boolean
}

export function EditPostModal({ isOpen, onClose, post, isDark }: EditPostModalProps) {
  const [caption, setCaption] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const { user } = useAuthStore()

  useEffect(() => {
    if (post) {
      setCaption(post.caption || "")
    }
  }, [post, isOpen])

  const handleSave = async () => {
    if (!user) return
    setIsSaving(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/posts/${post._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid: user.uid,
          caption: caption
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Post updated successfully")
        onClose()
      } else {
        throw new Error(data.error)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to edit post")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[310] flex flex-col md:items-center md:justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`w-full h-full md:w-[600px] md:h-auto md:max-h-[80vh] flex flex-col md:rounded-2xl overflow-hidden shadow-2xl ${isDark ? "bg-[#1a1a1a] text-white" : "bg-white text-black"}`}
          >
            {/* Header */}
            <div className={`h-14 flex items-center justify-between px-4 border-b ${isDark ? "border-white/10" : "border-gray-200"}`}>
              <button onClick={onClose} className="p-1 hover:opacity-70 transition-opacity">
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-lg font-bold">Edit info</h2>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="text-blue-500 font-bold px-2 py-1.5 hover:bg-blue-500/10 rounded-full transition-colors flex items-center"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-6 h-6" />}
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/2 aspect-square bg-black rounded-lg overflow-hidden flex items-center justify-center relative">
                 {post.media[0]?.type === "video" ? (
                   <video src={post.media[0].url} className="w-full h-full object-cover" />
                 ) : (
                   <img src={post.media[0]?.url} alt="Preview" className="w-full h-full object-cover" />
                 )}
                 {post.media.length > 1 && (
                   <div className="absolute top-2 right-2 bg-black/60 backdrop-blur text-white text-xs px-2 py-1 rounded-full font-bold">
                     1/{post.media.length}
                   </div>
                 )}
              </div>
              <div className="w-full md:w-1/2 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800">
                    {post.author?.avatar ? (
                      <img src={post.author.avatar} alt="Author" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                        {post.author?.name?.charAt(0) || "U"}
                      </div>
                    )}
                  </div>
                  <span className="font-bold text-sm">{post.author?.username || post.author?.name}</span>
                </div>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption..."
                  className={`w-full flex-1 min-h-[150px] p-0 bg-transparent border-none focus:ring-0 resize-none text-sm ${isDark ? "text-white placeholder:text-white/40" : "text-black placeholder:text-gray-400"}`}
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
