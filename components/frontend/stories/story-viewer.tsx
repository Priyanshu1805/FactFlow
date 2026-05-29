"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight, MoreHorizontal, Heart, Send, Trash2 } from "lucide-react"
import { useAuthStore } from "@/store/auth-store"
import { toast } from "sonner"

interface StoryViewerProps {
  groupedStories: any[]
  initialGroupIndex: number
  onClose: () => void
}

export function StoryViewer({ groupedStories, initialGroupIndex, onClose }: StoryViewerProps) {
  const { user } = useAuthStore()
  const [localGroupedStories, setLocalGroupedStories] = useState(groupedStories)
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex)
  const [storyIndex, setStoryIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [showMenu, setShowMenu] = useState(false)
  const [storyMessage, setStoryMessage] = useState("")
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [sendingReaction, setSendingReaction] = useState(false)

  const currentGroup = localGroupedStories[groupIndex]
  const currentStory = currentGroup?.stories[storyIndex]

  const isOwner = user && currentGroup && (
    currentGroup.user.username === (user as any).username ||
    (user.displayName && currentGroup.user.name === user.displayName)
  )

  // Auto-advance logic (pauses when dropdown menu is open OR when user is typing a reply)
  useEffect(() => {
    if (!currentStory || showMenu || isInputFocused) return

    const STORY_DURATION = 5000 // 5 seconds per image story
    let timer: NodeJS.Timeout
    let startTime = Date.now() - (progress / 100) * STORY_DURATION
    
    const tick = () => {
      const elapsed = Date.now() - startTime
      const newProgress = (elapsed / STORY_DURATION) * 100
      
      if (newProgress >= 100) {
        handleNext()
      } else {
        setProgress(newProgress)
        timer = setTimeout(tick, 50)
      }
    }

    timer = setTimeout(tick, 50)
    
    return () => clearTimeout(timer)
  }, [groupIndex, storyIndex, currentStory, showMenu, isInputFocused])

  const handleNext = () => {
    if (storyIndex < currentGroup.stories.length - 1) {
      setStoryIndex(s => s + 1)
      setProgress(0)
    } else if (groupIndex < localGroupedStories.length - 1) {
      setGroupIndex(g => g + 1)
      setStoryIndex(0)
      setProgress(0)
    } else {
      onClose()
    }
  }

  const handlePrev = () => {
    if (storyIndex > 0) {
      setStoryIndex(s => s - 1)
      setProgress(0)
    } else if (groupIndex > 0) {
      setGroupIndex(g => g - 1)
      setStoryIndex(localGroupedStories[groupIndex - 1].stories.length - 1)
      setProgress(0)
    }
  }

  const handleDeleteStory = async () => {
    if (!currentStory) return
    if (!confirm("Are you sure you want to delete this story?")) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stories/${currentStory._id}`, {
        method: "DELETE"
      })
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (data.success) {
        toast.success("Story deleted!")
        
        // Optimistic delete inside local state
        const updatedStories = currentGroup.stories.filter((s: any) => s._id !== currentStory._id)
        if (updatedStories.length === 0) {
          // No stories left in this group, remove the group
          const updatedGroups = localGroupedStories.filter((_, idx) => idx !== groupIndex)
          if (updatedGroups.length === 0) {
            onClose()
            window.location.reload()
          } else {
            setLocalGroupedStories(updatedGroups)
            // Shift group index if out of bounds
            setGroupIndex(prev => Math.min(prev, updatedGroups.length - 1))
            setStoryIndex(0)
            setProgress(0)
          }
        } else {
          // Still have stories, update this group
          const updatedGroups = localGroupedStories.map((g, idx) => {
            if (idx === groupIndex) {
              return { ...g, stories: updatedStories }
            }
            return g
          })
          setLocalGroupedStories(updatedGroups)
          setStoryIndex(prev => Math.min(prev, updatedStories.length - 1))
          setProgress(0)
        }
        setShowMenu(false)
      } else {
        toast.error("Failed to delete story: " + (data.error || "Unknown error"))
      }
    } catch (err) {
      toast.error("Failed to delete story")
    }
  }

  const sendStoryReply = async (textToSend: string, isReaction = false) => {
    if (!user) {
      toast.error("Please login to send replies")
      return
    }
    if (isOwner) {
      toast.error("You cannot reply to your own story")
      return
    }
    setSendingReaction(true)
    try {
      // 1. Access or create chat
      const chatRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/chats/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseUid: user.uid, userId: currentGroup.user._id })
      })
      if (!chatRes.ok) throw new Error("Fetch failed")
      const chatData = await chatRes.json()
      
      if (!chatData.success) {
        throw new Error(chatData.error || "Could not access chat")
      }

      // 2. Send message
      const formData = new FormData()
      formData.append("firebaseUid", user.uid)
      formData.append("chatId", chatData.chat._id)
      formData.append("content", isReaction ? `${textToSend} (Reacted to story)` : `Replied to story: "${textToSend}"`)
      
      const msgRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/messages`, {
        method: "POST",
        body: formData
      })
      if (!msgRes.ok) throw new Error("Fetch failed")
      const msgData = await msgRes.json()

      if (msgData.success) {
        toast.success(isReaction ? "Reaction sent!" : "Reply sent!")
        setStoryMessage("")
        setIsInputFocused(false)
      } else {
        toast.error("Failed to send message")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send message")
    } finally {
      setSendingReaction(false)
    }
  }

  if (!currentGroup || !currentStory) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-[300] bg-black text-white flex flex-col"
      >
        {/* Progress Bars */}
        <div className="absolute top-0 left-0 right-0 z-30 pt-4 px-2 flex gap-1">
          {currentGroup.stories.map((_: any, idx: number) => (
            <div key={idx} className="h-0.5 flex-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-md">
              <div 
                className="h-full bg-white transition-all duration-75"
                style={{ 
                  width: idx < storyIndex ? "100%" : idx === storyIndex ? `${progress}%` : "0%" 
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-6 left-0 right-0 z-30 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-800">
              {currentGroup.user.avatar ? (
                <img src={currentGroup.user.avatar} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold">
                  {currentGroup.user.username?.charAt(0) || "U"}
                </div>
              )}
            </div>
            <span className="font-bold text-sm drop-shadow-md">{currentGroup.user.username}</span>
            <span className="text-white/60 text-xs drop-shadow-md">
              {Math.floor((Date.now() - new Date(currentStory.createdAt).getTime()) / (1000 * 60 * 60))}h
            </span>
          </div>
          
          <div className="flex items-center gap-4 relative">
            {isOwner && (
              <div className="relative">
                <MoreHorizontal 
                  className="w-6 h-6 drop-shadow-md cursor-pointer hover:scale-110 transition-transform pointer-events-auto" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                />
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-zinc-900 border border-white/10 rounded-xl shadow-xl p-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteStory();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-white/5 rounded-lg text-sm font-semibold transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Story
                    </button>
                  </div>
                )}
              </div>
            )}
            <X className="w-6 h-6 cursor-pointer drop-shadow-md hover:scale-110 transition-transform pointer-events-auto" onClick={(e) => { e.stopPropagation(); onClose(); }} />
          </div>
        </div>

        {/* Media */}
        <div className="flex-1 relative flex items-center justify-center bg-zinc-900">
          {/* Tap Zones */}
          <div className="absolute inset-y-0 left-0 w-1/3 z-20 cursor-pointer" onClick={handlePrev} />
          <div className="absolute inset-y-0 right-0 w-2/3 z-20 cursor-pointer" onClick={handleNext} />
          
          {currentStory.mediaType === "video" ? (
            <video 
              src={currentStory.mediaUrl} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-contain"
              onEnded={handleNext}
            />
          ) : (
            <img 
              src={currentStory.mediaUrl} 
              className="w-full h-full object-contain" 
              alt="Story" 
            />
          )}

          {currentStory.caption && (
            <div className="absolute bottom-24 left-4 right-4 text-center z-10">
              <span className="bg-black/50 text-white px-4 py-2 rounded-xl backdrop-blur-md text-sm font-medium">
                {currentStory.caption}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-30 flex items-center gap-4 pb-safe bg-gradient-to-t from-black/80 to-transparent pointer-events-auto">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (storyMessage.trim()) sendStoryReply(storyMessage.trim());
            }} 
            className="flex-1 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <input 
              type="text" 
              value={storyMessage}
              onChange={(e) => setStoryMessage(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
              placeholder="Send message" 
              className="w-full bg-transparent border border-white/30 rounded-full py-2.5 px-4 text-sm text-white placeholder:text-white/70 focus:outline-none focus:border-white transition-colors backdrop-blur-md"
            />
          </form>
          <Heart 
            className="w-7 h-7 cursor-pointer hover:scale-110 transition-transform drop-shadow-md text-white hover:text-red-500 hover:fill-red-500" 
            onClick={(e) => {
              e.stopPropagation();
              sendStoryReply("❤️", true);
            }} 
          />
          <Send 
            className="w-7 h-7 cursor-pointer hover:scale-110 transition-transform drop-shadow-md text-white hover:text-blue-400" 
            onClick={(e) => {
              e.stopPropagation();
              if (storyMessage.trim()) sendStoryReply(storyMessage.trim());
            }} 
          />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

