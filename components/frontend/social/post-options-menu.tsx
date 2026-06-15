"use client"

import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { useAuthStore } from "@/store/auth-store"
import { useState } from "react"
import { Loader2, QrCode } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

interface PostOptionsMenuProps {
  isOpen: boolean
  onClose: () => void
  post: any
  isDark: boolean
  onEdit: () => void
}

export function PostOptionsMenu({ isOpen, onClose, post, isDark, onEdit }: PostOptionsMenuProps) {
  const { user } = useAuthStore()
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [showQR, setShowQR] = useState(false)
  
  const isAuthor = user && post.author && (user.uid === post.author._id || user.uid === post.author.firebaseUid || post.author.username === user.displayName)

  const handleAction = async (actionType: string) => {
    if (!user) {
      toast.error("Please login first")
      return
    }
    
    setLoadingAction(actionType)
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "/api"
      
      if (actionType === "save" || actionType === "favorite") {
        const res = await fetch(`${API}/posts/${post._id}/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firebaseUid: user.uid })
        })
        if (!res.ok) throw new Error("Fetch failed")
        const data = await res.json()
        if (data.success) {
          toast.success(data.hasSaved ? "Saved successfully" : "Removed from saved")
        } else throw new Error(data.error)
      } else if (actionType === "follow") {
        if (!post.author?._id) throw new Error("Author not found")
        const res = await fetch(`${API}/users/${post.author._id}/toggle-follow`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ viewerUid: user.uid })
        })
        if (!res.ok) throw new Error("Fetch failed")
        const data = await res.json()
        if (data.success) {
          toast.success(data.message)
        } else throw new Error(data.error)
      } else if (actionType === "delete") {
        const res = await fetch(`${API}/posts/${post._id}?firebaseUid=${user.uid}`, { method: "DELETE" })
        if (!res.ok) throw new Error("Fetch failed")
        const data = await res.json()
        if (data.success) toast.success("Post deleted")
        else throw new Error(data.error)
      } else if (actionType === "qr") {
        setShowQR(true)
        return // Don't close menu
      } else {
        const res = await fetch(`${API}/posts/${post._id}/options`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firebaseUid: user.uid, actionType })
        })
        if (!res.ok) throw new Error("Fetch failed")
        const data = await res.json()
        if (data.success) {
          toast.success(data.message || "Action successful")
        } else throw new Error(data.error)
      }
      
      onClose()
    } catch (err: any) {
      toast.error(err.message || "Action failed")
    } finally {
      setLoadingAction(null)
    }
  }

  const postUrl = typeof window !== "undefined" ? `${window.location.origin}/post/${post._id}` : ""

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          {showQR ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-sm rounded-xl p-6 flex flex-col items-center gap-4 ${isDark ? "bg-[#262626] text-white" : "bg-white text-black"}`}
            >
              <h3 className="font-bold text-lg">Post QR Code</h3>
              <div className="bg-white p-4 rounded-xl">
                <QRCodeSVG value={postUrl} size={200} />
              </div>
              <p className="text-sm text-center opacity-70">Scan this code to open the post directly.</p>
              <button 
                onClick={() => { setShowQR(false); onClose(); }}
                className="mt-2 w-full py-2.5 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors"
              >
                Done
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className={`w-full max-w-sm rounded-xl overflow-hidden flex flex-col ${isDark ? "bg-[#262626] text-white" : "bg-white text-black"}`}
            >
              {isAuthor ? (
                <>
                  <button onClick={() => handleAction("hide_likes")} disabled={!!loadingAction} className="w-full py-3.5 border-b border-white/10 hover:bg-black/5 active:bg-black/10 transition-colors">
                    {loadingAction === "hide_likes" ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (post.hideLikes ? "Show Like Count" : "Hide Like Count")}
                  </button>
                  <button onClick={() => handleAction("disable_comments")} disabled={!!loadingAction} className="w-full py-3.5 border-b border-white/10 hover:bg-black/5 active:bg-black/10 transition-colors">
                    {loadingAction === "disable_comments" ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (post.commentsDisabled ? "Turn On Commenting" : "Turn Off Commenting")}
                  </button>
                  <button onClick={() => { onClose(); onEdit(); }} className="w-full py-3.5 border-b border-white/10 hover:bg-black/5 active:bg-black/10 transition-colors">
                    Edit Post/Reel
                  </button>
                  <button onClick={() => handleAction("pin")} disabled={!!loadingAction} className="w-full py-3.5 border-b border-white/10 hover:bg-black/5 active:bg-black/10 transition-colors">
                    {loadingAction === "pin" ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (post.isPinned ? "Unpin from Main Grid" : "Pin to Main Grid")}
                  </button>
                  <button onClick={() => handleAction("save")} disabled={!!loadingAction} className="w-full py-3.5 border-b border-white/10 hover:bg-black/5 active:bg-black/10 transition-colors">
                    {loadingAction === "save" ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Save Post/Reel"}
                  </button>
                  <button onClick={() => handleAction("qr")} className="w-full py-3.5 border-b border-white/10 hover:bg-black/5 active:bg-black/10 transition-colors">
                    Generate QR Code
                  </button>
                  <button onClick={() => handleAction("delete")} disabled={!!loadingAction} className="w-full py-3.5 font-bold text-red-500 border-b border-white/10 hover:bg-black/5 active:bg-black/10 transition-colors">
                    {loadingAction === "delete" ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Delete Post/Reel"}
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => handleAction("save")} disabled={!!loadingAction} className="w-full py-3.5 border-b border-white/10 hover:bg-black/5 active:bg-black/10 transition-colors">
                    {loadingAction === "save" ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Save Post/Reel"}
                  </button>
                  <button onClick={() => handleAction("qr")} className="w-full py-3.5 border-b border-white/10 hover:bg-black/5 active:bg-black/10 transition-colors">
                    Generate QR Code
                  </button>
                  <button onClick={() => handleAction("favorite")} disabled={!!loadingAction} className="w-full py-3.5 border-b border-white/10 hover:bg-black/5 active:bg-black/10 transition-colors">
                    {loadingAction === "favorite" ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Add to Favorites"}
                  </button>
                  <button onClick={() => handleAction("follow")} disabled={!!loadingAction} className="w-full py-3.5 border-b border-white/10 hover:bg-black/5 active:bg-black/10 transition-colors">
                    {loadingAction === "follow" ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Follow/Unfollow Creator"}
                  </button>
                  <button onClick={() => handleAction("hide")} disabled={!!loadingAction} className="w-full py-3.5 border-b border-white/10 hover:bg-black/5 active:bg-black/10 transition-colors">
                    {loadingAction === "hide" ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Hide Post/Reel"}
                  </button>
                  <button onClick={() => { toast.info("Creator Info: " + post.author?.name); onClose() }} className="w-full py-3.5 border-b border-white/10 hover:bg-black/5 active:bg-black/10 transition-colors">
                    About This Account
                  </button>
                  <button onClick={() => handleAction("report")} disabled={!!loadingAction} className="w-full py-3.5 font-bold text-red-500 border-b border-white/10 hover:bg-black/5 active:bg-black/10 transition-colors">
                    {loadingAction === "report" ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Report Post/Reel"}
                  </button>
                </>
              )}
              
              <button 
                onClick={onClose}
                className="w-full py-3.5 hover:bg-black/5 active:bg-black/10 transition-colors font-medium opacity-80"
              >
                Cancel
              </button>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  )
}
