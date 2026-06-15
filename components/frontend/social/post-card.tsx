"use client"

import { useState, useRef, useEffect } from "react"
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal, ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { useAuthStore } from "@/store/auth-store"
import { toast } from "sonner"
import Link from "next/link"
import { PostOptionsMenu } from "./post-options-menu"
import { EditPostModal } from "./edit-post-modal"
import { SharePostModal } from "./share-post-modal"
import { PostCommentsSheet } from "./post-comments-sheet"
import { io } from "socket.io-client"
import { useVideoSettings } from "@/hooks/useVideoSettings"
import { useNetworkStatus } from "@/hooks/useNetworkStatus"

interface PostCardProps {
  post: any
  isDark: boolean
  socket?: any
}

export function PostCard({ post, isDark, socket }: PostCardProps) {
  const { user } = useAuthStore()
  const settings = useVideoSettings()
  const { isWifi } = useNetworkStatus()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isMuted, setIsMuted] = useState(true)

  useEffect(() => {
    if (settings) {
      setIsMuted(settings.muteByDefault)
    }
  }, [settings?.muteByDefault])
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0)
  const [isLiked, setIsLiked] = useState(post.likes?.includes(user?.uid) || false) // Temporary logic, actually user._id is in likes but we have firebaseUid on client. It's safer to rely on API response, but for optimism we guess.
  const [savesCount, setSavesCount] = useState(post.savesCount || 0)
  const [isSaved, setIsSaved] = useState(false)
  const [showFullCaption, setShowFullCaption] = useState(false)
  const [showHeartAnim, setShowHeartAnim] = useState(false)

  // Modal States
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  
  // To handle the double tap
  const lastTapRef = useRef<number>(0)
  
  useEffect(() => {
    // If socket is provided, listen to like updates
    if (socket) {
      const handleLikeUpdate = (data: any) => {
        if (data.postId === post._id) {
          setLikesCount(data.likesCount)
        }
      }
      socket.on("post_like_update", handleLikeUpdate)
      return () => {
        socket.off("post_like_update", handleLikeUpdate)
      }
    }
  }, [socket, post._id])

  const nextSlide = () => {
    if (post.media && currentSlide < post.media.length - 1) setCurrentSlide((p) => p + 1)
  }

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide((p) => p - 1)
  }

  const handleDoubleTap = () => {
    const now = Date.now()
    if (now - lastTapRef.current < 300) {
      if (!isLiked) handleLike()
      setShowHeartAnim(true)
      setTimeout(() => setShowHeartAnim(false), 1000)
    }
    lastTapRef.current = now
  }

  const handleLike = async () => {
    if (!user) {
      toast.error("Please login to like this post")
      return
    }
    // Optimistic UI
    const currentlyLiked = isLiked
    setIsLiked(!currentlyLiked)
    setLikesCount((prev: number) => currentlyLiked ? prev - 1 : prev + 1)
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/posts/${post._id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseUid: user.uid }),
      })
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (data.success) {
        setIsLiked(data.hasLiked)
        setLikesCount(data.likesCount)
      }
    } catch (err) {
      // Revert on error
      setIsLiked(currentlyLiked)
      setLikesCount((prev: number) => currentlyLiked ? prev + 1 : prev - 1)
    }
  }

  const handleSave = async () => {
    if (!user) {
      toast.error("Please login to save this post")
      return
    }
    const currentlySaved = isSaved
    setIsSaved(!currentlySaved)
    setSavesCount((prev: number) => currentlySaved ? prev - 1 : prev + 1)
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/posts/${post._id}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseUid: user.uid }),
      })
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (data.success) {
        setIsSaved(data.hasSaved)
        setSavesCount(data.savesCount)
      }
    } catch (err) {
      setIsSaved(currentlySaved)
      setSavesCount((prev: number) => currentlySaved ? prev + 1 : prev - 1)
    }
  }

  return (
    <article className={`w-full max-w-[470px] mx-auto mb-8 border-b ${isDark ? "border-white/10" : "border-gray-200"} pb-6`}>
      {/* Header */}
      <div className="flex items-center justify-between px-2 mb-3">
        <Link href={`/u/${post.author?.username || post.author?._id}`} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-yellow-400 to-fuchsia-600 p-[2px]">
            <div className="w-full h-full rounded-full border border-black overflow-hidden bg-zinc-800">
              {post.author?.avatar ? (
                <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold bg-zinc-800">
                  {post.author?.name?.charAt(0) || "U"}
                </div>
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className={`font-bold text-sm ${isDark ? "text-white" : "text-black"}`}>
                {post.author?.username || post.author?.name}
              </span>
              {post.author?.isVerified && (
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-blue-500 fill-current" aria-label="Verified">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7L6 12.6l1.5-1.5 2.6 2.6 6.4-6.4 1.5 1.5-7.9 7.9z" />
                </svg>
              )}
              <span className={`text-xs ml-2 ${isDark ? "text-white/50" : "text-gray-500"}`}>
                • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }).replace("about ", "")}
              </span>
            </div>
            {post.location && (
              <span className={`text-xs ${isDark ? "text-white/60" : "text-gray-600"}`}>{post.location}</span>
            )}
          </div>
        </Link>
        <button 
          onClick={() => setIsOptionsOpen(true)}
          className={`p-2 hover:opacity-50 transition-opacity ${isDark ? "text-white" : "text-black"}`}
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Media Carousel */}
      {post.media && post.media.length > 0 && (
        <div 
          className="relative w-full aspect-[4/5] bg-black rounded-sm overflow-hidden flex items-center justify-center cursor-pointer"
          onClick={handleDoubleTap}
        >
          {post.media[currentSlide]?.type === "video" ? (
            <video 
              src={post.media[currentSlide].url} 
              className="w-full h-full object-cover"
              autoPlay={settings ? (settings.autoPlayVideos && (!settings.autoPlayOnWifiOnly || isWifi)) : true} 
              loop 
              muted={isMuted} 
              playsInline 
            >
              {settings?.showSubtitles && <track kind="captions" src="/captions.vtt" default />}
            </video>
          ) : (
            <img 
              src={post.media[currentSlide]?.url} 
              alt="Post media" 
              className="w-full h-full object-cover select-none" 
              draggable={false}
            />
          )}

          {/* Video Audio Toggle */}
          {post.media[currentSlide]?.type === "video" && (
            <button 
              onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted) }}
              className="absolute bottom-4 right-4 p-2 bg-black/50 backdrop-blur-sm text-white rounded-full transition-opacity hover:bg-black/70"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}

          {/* Navigation Arrows */}
          {post.media.length > 1 && (
            <>
              {currentSlide > 0 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); prevSlide() }} 
                  className="absolute left-2 p-1.5 bg-black/50 backdrop-blur-sm text-white rounded-full hover:bg-black/70 transition-all shadow-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {currentSlide < post.media.length - 1 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); nextSlide() }} 
                  className="absolute right-2 p-1.5 bg-black/50 backdrop-blur-sm text-white rounded-full hover:bg-black/70 transition-all shadow-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
              
              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {post.media.map((_: any, i: number) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentSlide ? "bg-blue-500 scale-110" : "bg-white/50"}`} />
                ))}
              </div>
            </>
          )}

          {/* Big Heart Animation */}
          <AnimatePresence>
            {showHeartAnim && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none drop-shadow-2xl"
              >
                <Heart className="w-24 h-24 text-red-500 fill-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Action Buttons */}
      <div className={`flex items-center justify-between pt-3 px-2 ${isDark ? "text-white" : "text-black"}`}>
        <div className="flex items-center gap-4">
          <button onClick={handleLike} className="hover:opacity-50 transition-opacity active:scale-90">
            <Heart className={`w-6 h-6 transition-colors ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
          </button>
          <button onClick={() => setIsCommentsOpen(true)} className="hover:opacity-50 transition-opacity">
            <MessageCircle className="w-6 h-6" />
          </button>
          <button onClick={() => setIsShareOpen(true)} className="hover:opacity-50 transition-opacity">
            <Share2 className="w-6 h-6" />
          </button>
        </div>
        <button onClick={handleSave} className="hover:opacity-50 transition-opacity active:scale-90">
          <Bookmark className={`w-6 h-6 transition-colors ${isSaved ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Likes Count */}
      <div className={`px-2 pt-2 font-bold text-sm ${isDark ? "text-white" : "text-black"}`}>
        {likesCount.toLocaleString()} likes
      </div>

      {/* Caption */}
      {post.caption && (
        <div className={`px-2 pt-1 text-sm ${isDark ? "text-white" : "text-black"}`}>
          <Link href={`/u/${post.author?.username || post.author?._id}`} className="font-bold mr-2 hover:underline">
            {post.author?.username || post.author?.name}
          </Link>
          <span>
            {showFullCaption ? post.caption : post.caption.slice(0, 100)}
            {!showFullCaption && post.caption.length > 100 && "... "}
          </span>
          {post.caption.length > 100 && (
            <button 
              onClick={() => setShowFullCaption(!showFullCaption)} 
              className={`text-xs ml-1 font-semibold ${isDark ? "text-white/50" : "text-gray-500"}`}
            >
              {showFullCaption ? "less" : "more"}
            </button>
          )}
        </div>
      )}

      {/* View Comments */}
      {post.commentsCount > 0 && (
        <button 
          onClick={() => setIsCommentsOpen(true)}
          className={`px-2 pt-1 text-sm ${isDark ? "text-white/50" : "text-gray-500"} hover:underline`}
        >
          View all {post.commentsCount} comments
        </button>
      )}

      {/* Modals */}
      <PostOptionsMenu 
        isOpen={isOptionsOpen}
        onClose={() => setIsOptionsOpen(false)}
        post={post}
        isDark={isDark}
        onEdit={() => setIsEditOpen(true)}
      />
      <EditPostModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        post={post}
        isDark={isDark}
      />
      <SharePostModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        post={post}
        isDark={isDark}
      />
      <PostCommentsSheet
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        post={post}
        isDark={isDark}
        socket={socket}
      />
    </article>
  )
}
