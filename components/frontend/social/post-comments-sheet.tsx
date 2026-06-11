"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Loader2, Search, Smile, Heart, MoreHorizontal } from "lucide-react"
import { useAuthStore } from "@/store/auth-store"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import dynamic from "next/dynamic"

const EmojiPicker = dynamic(() => import("emoji-picker-react"))

interface PostCommentsSheetProps {
  isOpen: boolean
  onClose: () => void
  post: any
  isDark: boolean
  socket: any
}

export function PostCommentsSheet({ isOpen, onClose, post, isDark, socket }: PostCommentsSheetProps) {
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newText, setNewText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [replyingTo, setReplyingTo] = useState<any>(null)
  const [showEmoji, setShowEmoji] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  
  const { user } = useAuthStore()
  const endOfMessagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) fetchComments()
  }, [isOpen])

  useEffect(() => {
    if (socket && isOpen) {
      const handleCommentAdded = (data: any) => {
        if (data.postId === post._id) {
          setComments(prev => {
            if (prev.find(c => c._id === data.comment._id)) return prev
            return [data.comment, ...prev]
          })
        }
      }
      const handleCommentUpdated = (data: any) => {
        if (data.postId === post._id) {
          setComments(prev => prev.map(c => c._id === data.comment._id ? data.comment : c))
        }
      }
      socket.on("post_comment_added", handleCommentAdded)
      socket.on("post_comment_updated", handleCommentUpdated)
      return () => {
        socket.off("post_comment_added", handleCommentAdded)
        socket.off("post_comment_updated", handleCommentUpdated)
      }
    }
  }, [socket, isOpen, post._id])

  const fetchComments = async () => {
    setLoading(true)
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      const res = await fetch(`${API}/posts/${post._id}/comments`)
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (data.success) {
        setComments(data.comments)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return toast.error("Please login to comment")
    if (!newText.trim()) return

    setIsSubmitting(true)
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      const res = await fetch(`${API}/posts/${post._id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid: user.uid,
          text: newText.trim(),
          parentId: replyingTo?._id || null
        })
      })
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (data.success) {
        setNewText("")
        setReplyingTo(null)
        setShowEmoji(false)
        if (!socket) setComments(prev => [data.comment, ...prev])
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" })
      } else throw new Error(data.error)
    } catch (err: any) {
      toast.error(err.message || "Failed to post comment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAction = async (commentId: string, actionType: string) => {
    if (!user) return toast.error("Please login first")
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      const res = await fetch(`${API}/posts/${post._id}/comment/${commentId}/action`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseUid: user.uid, actionType })
      })
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      if (actionType === "delete" && !socket) {
        setComments(prev => prev.filter(c => c._id !== commentId))
      } else if (!socket) {
        setComments(prev => prev.map(c => c._id === commentId ? data.comment : c))
      }
      setActiveMenu(null)
    } catch (err: any) {
      toast.error(err.message || `Failed to ${actionType} comment`)
    }
  }

  const onEmojiClick = (emojiData: any) => {
    setNewText(prev => prev + emojiData.emoji)
  }

  // Filter and build tree
  const filteredComments = comments.filter(c => c.text.toLowerCase().includes(searchQuery.toLowerCase()))
  const parentComments = filteredComments.filter(c => !c.parentId)
  
  const getReplies = (parentId: string) => {
    return filteredComments.filter(c => c.parentId === parentId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }

  const renderComment = (comment: any, isReply = false) => {
    const hasLiked = user && comment.reactions?.like?.includes(user.uid) // Approximated, ideally should check _id
    const isCommentAuthor = user && (comment.authorId?._id === user.uid || comment.authorId?.firebaseUid === user.uid)
    const isPostAuthor = user && (post.author?._id === user.uid || post.author?.firebaseUid === user.uid)
    const canDelete = isCommentAuthor || isPostAuthor

    return (
      <div key={comment._id} className={`flex gap-3 ${isReply ? "ml-10 mt-3" : "mt-4"}`}>
        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-zinc-800">
          {comment.authorId?.avatar ? (
            <img src={comment.authorId.avatar} alt={comment.authorName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
              {comment.authorName?.charAt(0) || "U"}
            </div>
          )}
        </div>
        <div className="flex flex-col w-full">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm">
              {comment.authorId?.username || comment.authorName}
              <span className={`ml-2 text-xs font-normal ${isDark ? "text-white/50" : "text-gray-500"}`}>
                {formatDistanceToNow(new Date(comment.createdAt))}
              </span>
            </span>
            <div className="relative">
              <button onClick={() => setActiveMenu(activeMenu === comment._id ? null : comment._id)} className="p-1 opacity-50 hover:opacity-100">
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {activeMenu === comment._id && (
                <div className={`absolute right-0 top-6 w-32 rounded-lg shadow-xl overflow-hidden z-10 text-sm ${isDark ? "bg-[#333] border border-white/10" : "bg-white border border-gray-200"}`}>
                  {canDelete && <button onClick={() => handleAction(comment._id, "delete")} className="w-full text-left px-4 py-2 text-red-500 hover:bg-black/10 transition-colors">Delete</button>}
                  <button onClick={() => handleAction(comment._id, "report")} className="w-full text-left px-4 py-2 hover:bg-black/10 transition-colors">Report</button>
                </div>
              )}
            </div>
          </div>
          
          <p className="text-sm mt-0.5">{comment.text}</p>
          
          <div className="flex items-center gap-4 mt-1">
            <button onClick={() => handleAction(comment._id, "like")} className={`flex items-center gap-1 text-xs font-bold transition-colors ${hasLiked ? "text-red-500" : isDark ? "text-white/50 hover:text-white" : "text-gray-500 hover:text-black"}`}>
              <Heart className={`w-3.5 h-3.5 ${hasLiked ? "fill-current" : ""}`} />
              {comment.reactions?.like?.length > 0 && comment.reactions.like.length}
            </button>
            <button onClick={() => setReplyingTo(comment)} className={`text-xs font-bold transition-colors ${isDark ? "text-white/50 hover:text-white" : "text-gray-500 hover:text-black"}`}>
              Reply
            </button>
          </div>

          {/* Render Replies */}
          {!isReply && getReplies(comment._id).map(reply => renderComment(reply, true))}
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[330] bg-black/60 backdrop-blur-sm" />
          
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed bottom-0 left-0 right-0 z-[340] h-[85vh] md:h-[700px] md:max-w-xl md:mx-auto md:bottom-1/2 md:translate-y-1/2 md:rounded-2xl rounded-t-2xl flex flex-col overflow-hidden shadow-2xl ${isDark ? "bg-[#262626] text-white" : "bg-white text-black"}`}
          >
            {/* Header & Search */}
            <div className={`p-4 border-b flex flex-col gap-3 ${isDark ? "border-white/10" : "border-gray-200"}`}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold mx-auto">Comments</h2>
                <button onClick={onClose} className="absolute right-4 p-1 hover:opacity-70"><X className="w-6 h-6" /></button>
              </div>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${isDark ? "bg-[#161616]" : "bg-gray-100"}`}>
                <Search className="w-4 h-4 opacity-50" />
                <input 
                  type="text" 
                  placeholder="Search comments..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none text-sm w-full outline-none"
                />
              </div>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4" onClick={() => setActiveMenu(null)}>
              {post.caption && (
                <div className="flex gap-3 pb-4 border-b border-white/10 mb-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-zinc-800">
                    {post.author?.avatar ? <img src={post.author.avatar} alt="Author" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">{post.author?.name?.charAt(0) || "U"}</div>}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">{post.author?.username || post.author?.name} <span className={`ml-2 text-xs font-normal ${isDark ? "text-white/50" : "text-gray-500"}`}>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }).replace("about ", "")}</span></span>
                    <p className="text-sm mt-0.5 whitespace-pre-wrap">{post.caption}</p>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin opacity-50" /></div>
              ) : comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 opacity-50 text-center"><h3 className="text-lg font-bold mb-2">No comments yet.</h3><p className="text-sm">Start the conversation.</p></div>
              ) : (
                parentComments.map(comment => renderComment(comment))
              )}
              <div ref={endOfMessagesRef} className="h-4" />
            </div>

            {/* Input Form */}
            <div className={`relative border-t ${isDark ? "border-white/10 bg-[#262626]" : "border-gray-200 bg-white"}`}>
              {showEmoji && (
                <div className="absolute bottom-full left-0 z-50 mb-2 shadow-2xl">
                  <EmojiPicker onEmojiClick={onEmojiClick} theme={(isDark ? "dark" : "light") as any} />
                </div>
              )}
              {replyingTo && (
                <div className={`px-4 py-2 text-xs flex justify-between items-center ${isDark ? "bg-[#111]" : "bg-gray-100"}`}>
                  <span>Replying to <span className="font-bold">{replyingTo.authorId?.username || replyingTo.authorName}</span></span>
                  <button onClick={() => setReplyingTo(null)} className="opacity-70 hover:opacity-100"><X className="w-3 h-3" /></button>
                </div>
              )}
              <form onSubmit={handleSubmit} className="p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-zinc-800">
                  {user?.photoURL ? <img src={user.photoURL} alt="Me" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">{user?.displayName?.charAt(0) || "U"}</div>}
                </div>
                <div className={`flex-1 flex items-center rounded-full px-4 py-2 ${isDark ? "bg-[#111]" : "bg-gray-100"}`}>
                  <input
                    type="text"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
                    className={`flex-1 bg-transparent border-none focus:ring-0 text-sm outline-none ${isDark ? "placeholder:text-white/50" : "placeholder:text-gray-400"}`}
                  />
                  <button type="button" onClick={() => setShowEmoji(!showEmoji)} className="ml-2 opacity-50 hover:opacity-100 transition-opacity">
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
                <button type="submit" disabled={!newText.trim() || isSubmitting} className="text-blue-500 disabled:opacity-50 font-bold transition-opacity">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Post"}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
