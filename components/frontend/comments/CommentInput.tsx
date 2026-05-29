import { useState, useEffect, useRef } from "react"
import { useAuthStore } from "@/store/auth-store"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Smile } from "lucide-react"

interface CommentInputProps {
  articleId: string
  parentId?: string
  onCommentAdded?: (comment: any) => void
  placeholder?: string
  autoFocus?: boolean
  onCancel?: () => void
}

const EMOJIS = [
  "😀", "😂", "🤣", "😊", "😍", "😘", "😜", "😎", "😭", "😤", 
  "😡", "🥺", "👍", "👎", "👏", "🙌", "❤️", "🔥", "✨", "💯"
]

export function CommentInput({ articleId, parentId, onCommentAdded, placeholder = "Add a comment...", autoFocus, onCancel }: CommentInputProps) {
  const { user } = useAuthStore()
  const [text, setText] = useState("")
  const [isFocused, setIsFocused] = useState(autoFocus || false)
  const [mentionSuggestions, setMentionSuggestions] = useState<any[]>([])
  const [mentionQuery, setMentionQuery] = useState("")
  const [isSearchingMentions, setIsSearchingMentions] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const emojiRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Simple Mention detection
  useEffect(() => {
    const match = text.match(/@([a-zA-Z0-9_]+)$/)
    if (match) {
      setMentionQuery(match[1])
      fetchMentions(match[1])
    } else {
      setMentionSuggestions([])
    }
  }, [text])

  const fetchMentions = async (query: string) => {
    if (query.length < 1) return
    setIsSearchingMentions(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/search-mentions?q=${query}`)
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (data.success) {
        setMentionSuggestions(data.users)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsSearchingMentions(false)
    }
  }

  const handleSelectMention = (username: string) => {
    const newText = text.replace(/@([a-zA-Z0-9_]+)$/, `@${username} `)
    setText(newText)
    setMentionSuggestions([])
    if (inputRef.current) inputRef.current.focus()
  }

  const handleEmojiSelect = (emoji: string) => {
    setText(prev => prev + emoji)
    if (inputRef.current) inputRef.current.focus()
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!text.trim()) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/${articleId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text, 
          authorName: user?.displayName || user?.email?.split('@')[0] || "Anonymous",
          authorId: user?._id || user?.id,
          parentId
        }),
      })
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (data.success) {
        setText("")
        setIsFocused(false)
        setShowEmojiPicker(false)
        if (onCommentAdded) onCommentAdded(data.data)
      }
    } catch (error) {
      console.error("Failed to post comment", error)
    }
  }

  if (!user) {
    return (
      <div className="mb-6 flex gap-4 items-center">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex-shrink-0 flex items-center justify-center text-gray-500 font-bold text-sm shadow-sm">
          ?
        </div>
        <div className="flex-1 flex justify-between items-center border-b border-gray-300 dark:border-gray-600 py-2">
          <span className="text-gray-500 text-sm">Add a comment...</span>
          <Link href="/login" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-4 mb-6 relative">
      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm mt-0.5 shadow-sm">
        {(user.displayName || user.email)?.[0]?.toUpperCase() || "U"}
      </div>
      <div className="flex-1 relative">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-gray-900 dark:focus:border-white outline-none transition-colors py-1.5 text-[0.95rem] dark:text-white/[0.85] text-gray-900 placeholder:text-gray-500"
        />
        
        {/* Mentions Dropdown */}
        <AnimatePresence>
          {mentionSuggestions.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full mb-2 left-0 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden z-50"
            >
              {mentionSuggestions.map(u => (
                <button
                  key={u._id}
                  onClick={() => handleSelectMention(u.username)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">
                    {u.avatar ? <img src={u.avatar} className="w-full h-full rounded-full object-cover" alt="" /> : u.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold dark:text-white/[0.85]">{u.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">@{u.username}</div>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        {(isFocused || text.trim().length > 0) && (
          <div className="flex justify-between items-center mt-3">
            <div className="relative" ref={emojiRef}>
              <button 
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white/[0.85] rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <Smile className="w-5 h-5" />
              </button>
              
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-3 w-64 z-50"
                  >
                    <div className="grid grid-cols-5 gap-2">
                      {EMOJIS.map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => handleEmojiSelect(emoji)}
                          className="hover:bg-gray-100 dark:hover:bg-gray-700 text-xl p-1.5 rounded transition-colors text-center"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setText("")
                  setIsFocused(false)
                  setShowEmojiPicker(false)
                  if (onCancel) onCancel()
                }}
                className="px-4 py-2 text-sm font-semibold rounded-full hover:bg-gray-100 dark:hover:bg-white/10 dark:text-white/[0.85] text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmit()}
                disabled={!text.trim()}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                  text.trim() 
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm" 
                    : "bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-white/30 cursor-not-allowed"
                }`}
              >
                {parentId ? "Reply" : "Comment"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
