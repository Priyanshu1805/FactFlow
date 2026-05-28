import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { EyeOff, Trash2, ThumbsUp, MoreVertical } from "lucide-react"
import { useAuthStore } from "@/store/auth-store"
import { timeAgo } from "./utils"

interface CommentItemProps {
  comment: any
  onReplyClick?: () => void
  onHide?: (id: string) => void
  onDelete?: (id: string) => void
}

export function CommentItem({ comment, onReplyClick, onHide, onDelete }: CommentItemProps) {
  const { user } = useAuthStore()
  const [reactions, setReactions] = useState(comment.reactions || { like: [], love: [], laugh: [] })
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleReaction = async (type: string) => {
    if (!user) return
    const userId = user._id || user.id
    
    // Optimistic UI
    const newReactions = { ...reactions }
    const index = newReactions[type as keyof typeof newReactions].findIndex((uid: string) => uid === userId)
    if (index > -1) {
      newReactions[type as keyof typeof newReactions].splice(index, 1)
    } else {
      newReactions[type as keyof typeof newReactions].push(userId)
    }
    setReactions(newReactions)

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/${comment._id}/reaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, userId })
      })
    } catch (e) {
      console.error(e)
    }
  }

  const userId = user?._id || user?.id
  const isAuthor = comment.authorId === userId
  const isHidden = comment.isHidden || comment.text === "[This comment has been hidden]"

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="flex gap-4 group relative"
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex-shrink-0 flex items-center justify-center font-bold text-sm dark:text-white/[0.85] text-gray-700">
        {comment.authorId?.avatar ? (
          <img src={comment.authorId.avatar} className="w-full h-full rounded-full object-cover" alt="" />
        ) : (
          comment.authorName?.[0]?.toUpperCase() || "U"
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`font-bold text-[0.85rem] ${isAuthor ? "text-purple-600 dark:text-purple-400" : "dark:text-white/[0.85] text-gray-900"}`}>
            @{comment.authorId?.username || comment.authorName?.replace(/\s+/g, "").toLowerCase() || "user"}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {timeAgo(comment.createdAt)}
          </span>
        </div>
        
        <p className={`text-[0.95rem] leading-relaxed mb-2 whitespace-pre-wrap ${isHidden ? "italic text-gray-500" : "dark:text-white/[0.85] text-gray-800"}`}>
          {comment.text}
        </p>
        
        {!isHidden && (
          <div className="flex gap-4 items-center mt-1">
            {/* Single Like Button */}
            <div className="flex items-center gap-3">
              <ReactionButton icon={<ThumbsUp className="w-4 h-4" />} count={reactions.like?.length} onClick={() => handleReaction('like')} active={reactions.like?.includes(userId)} />
            </div>

            {/* Reply Button */}
            {onReplyClick && (
              <button 
                onClick={onReplyClick}
                className="text-xs font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white/[0.85] transition-colors px-2 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
              >
                Reply
              </button>
            )}

            {/* Actions via 3-dot Menu (Always visible now) */}
            <div className="ml-auto relative" ref={menuRef}>
              <button 
                onClick={() => setShowMenu(!showMenu)} 
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 dark:text-white/[0.85] text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              <AnimatePresence>
                {showMenu && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 py-1"
                  >
                    {/* Hide for everyone (local hide or soft hide) */}
                    {onHide && (
                      <button 
                        onClick={() => { onHide(comment._id); setShowMenu(false); }} 
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white/[0.85] hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <EyeOff className="w-4 h-4" /> Hide
                      </button>
                    )}
                    
                    {/* Delete only for authors/admins */}
                    {(isAuthor || user?.role === 'admin') && onDelete && (
                      <button 
                        onClick={() => { onDelete(comment._id); setShowMenu(false); }} 
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function ReactionButton({ icon, count, onClick, active }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-full text-xs font-semibold transition-colors ${
        active 
          ? "dark:text-white text-black" 
          : "dark:text-gray-400 text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10"
      }`}
    >
      {icon}
      {count > 0 && <span className="text-xs">{count}</span>}
    </button>
  )
}
