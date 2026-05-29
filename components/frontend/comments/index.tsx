"use client"

import { useState, useEffect } from "react"
import { io, Socket } from "socket.io-client"
import { CommentInput } from "./CommentInput"
import { CommentThread } from "./CommentThread"
import { MessageSquare, Share2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function CommentsSection({ articleId }: { articleId: string }) {
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [shareToast, setShareToast] = useState(false)

  useEffect(() => {
    fetchComments()

    // Setup Socket.IO
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000")
    setSocket(newSocket)

    newSocket.on("connect", () => {
      newSocket.emit("join_article", articleId)
    })

    newSocket.on("new_comment", (comment: any) => {
      setComments(prev => [comment, ...prev])
    })

    newSocket.on("reaction_update", ({ commentId, reactions }: any) => {
      setComments(prev => prev.map(c => c._id === commentId ? { ...c, reactions } : c))
    })

    newSocket.on("comment_updated", ({ commentId, isHidden }: any) => {
      setComments(prev => prev.map(c => c._id === commentId ? { ...c, isHidden } : c))
    })

    newSocket.on("comment_deleted", ({ commentId }: any) => {
      setComments(prev => prev.map(c => c._id === commentId ? { ...c, isDeleted: true } : c))
    })

    return () => {
      newSocket.emit("leave_article", articleId)
      newSocket.disconnect()
    }
  }, [articleId])

  const fetchComments = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/${articleId}`)
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (data.success) {
        setComments(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch comments", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/${id}`, { method: "DELETE" })
      if (res.ok) {
        setComments(prev => prev.filter((c) => c._id !== id))
      }
    } catch (error) {
      console.error("Failed to delete comment", error)
    }
  }

  const handleHide = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/${id}/hide`, { method: "PATCH" })
      if (res.ok) {
        setComments(prev => prev.map(c => c._id === id ? { ...c, isHidden: !c.isHidden } : c))
      }
    } catch (error) {
      console.error("Failed to hide comment", error)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    const title = "Fact Flow News"
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const el = document.createElement("textarea")
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
    }
    setShareToast(true)
    setTimeout(() => setShareToast(false), 3000)
  }

  const activeComments = comments.filter(c => !c.isDeleted)
  const topLevelComments = activeComments.filter(c => !c.parentId)
  const replies = activeComments.filter(c => c.parentId)

  const repliesMap = replies.reduce((acc: any, reply: any) => {
    if (!acc[reply.parentId]) acc[reply.parentId] = []
    acc[reply.parentId].push(reply)
    return acc
  }, {})

  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="mt-8 mb-12">
      
      {/* Share Toast */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold shadow-2xl transition-all duration-300 ${
          shareToast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        } bg-gray-900 text-white dark:bg-white dark:text-black`}
      >
        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
        Link copied to clipboard!
      </div>

      {/* YouTube Style Comment Preview Box */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left rounded-[20px] p-4 transition-colors bg-gray-100 hover:bg-gray-200 dark:bg-[#272727] dark:hover:bg-[#3f3f3f]"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg dark:text-white text-black">
              Comments
            </span>
            {activeComments.length > 0 && (
              <span className="text-[15px] dark:text-gray-400 text-gray-500 font-medium">
                {activeComments.length > 999 ? (activeComments.length/1000).toFixed(1) + 'K' : activeComments.length}
              </span>
            )}
          </div>
          <div className="flex gap-[3px]">
            <div className="w-[5px] h-[5px] rounded-full dark:bg-white bg-black"></div>
            <div className="w-[5px] h-[5px] rounded-full dark:bg-gray-500 bg-gray-400"></div>
            <div className="w-[5px] h-[5px] rounded-full dark:bg-gray-500 bg-gray-400"></div>
          </div>
        </div>

        {topLevelComments.length > 0 ? (
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-purple-500 shrink-0 flex items-center justify-center text-xs text-white font-bold overflow-hidden">
              {topLevelComments[0].authorId?.avatar ? (
                <img src={topLevelComments[0].authorId.avatar} className="w-full h-full object-cover" alt="" />
              ) : (
                topLevelComments[0].authorName?.[0]?.toUpperCase() || "U"
              )}
            </div>
            <p className="text-sm truncate dark:text-white/90 text-gray-800 flex-1">
              {topLevelComments[0].text}
            </p>
          </div>
        ) : (
           <p className="text-sm dark:text-gray-400 text-gray-500">
             Be the first to comment...
           </p>
        )}
      </button>

      {/* Expanded Comments */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-6"
          >
            {/* Main Comment Input */}
            <CommentInput articleId={articleId} />

            {/* Comments List */}
            {loading ? (
              <div className="py-8 text-center text-gray-500 flex justify-center">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-6 pt-2">
                {topLevelComments.map((comment) => (
                  <CommentThread
                    key={comment._id}
                    articleId={articleId}
                    comment={comment}
                    replies={repliesMap[comment._id] || []}
                    onHide={handleHide}
                    onDelete={handleDelete}
                    onReplyAdded={(reply) => {}}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
