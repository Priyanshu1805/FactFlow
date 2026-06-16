"use client"

import { useEffect, useRef, useState } from "react"
import { Heart, MessageCircle, Share2, MoreVertical, Music, Bookmark } from "lucide-react"
import { useAuthStore } from "@/store/auth-store"
import { getSavedItems, saveItem, unsaveItem } from "@/lib/api/saved"
import { toast } from "sonner"
import { useVideoSettings } from "@/hooks/useVideoSettings"
import { useNetworkStatus } from "@/hooks/useNetworkStatus"

export function ReelPlayer({ reel, isActive }: { reel: any; isActive: boolean }) {
  const [liked, setLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { user } = useAuthStore()
  const settings = useVideoSettings()
  const { isWifi } = useNetworkStatus()

  // Fetch saved state
  useEffect(() => {
    if (user?.uid && reel?._id) {
      getSavedItems(user.uid).then(res => {
        if (res.success && res.data.shorts.some((s: any) => s._id === reel._id)) {
          setIsSaved(true)
        }
      }).catch(() => {})
    }
  }, [reel?._id, user?.uid])

  useEffect(() => {
    if (reel.source === "manual" && videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(() => {})
      } else {
        videoRef.current.pause()
      }
    }
  }, [isActive, reel.source])

  const handleLike = () => {
    setLiked(!liked)
    // Optional: Call API to like
  }

  const handleSaveToggle = async () => {
    if (!user?.uid) {
      toast.error("Please login to save shorts")
      return
    }
    try {
      if (isSaved) {
        setIsSaved(false)
        await unsaveItem(user.uid, reel._id, "short")
        toast.success("Removed from saved items")
      } else {
        setIsSaved(true)
        await saveItem(user.uid, reel._id, "short")
        toast.success("Short saved")
      }
    } catch (err) {
      setIsSaved(!isSaved)
      toast.error("Failed to update saved state")
    }
  }

  return (
    // Outer: full screen, black bg, centers the 9:16 column
    <div className="relative w-full h-full bg-black snap-start snap-always overflow-hidden flex items-center justify-center">

      {/* 9:16 Portrait Container — max width based on viewport height */}
      <div
        className="relative bg-black overflow-hidden"
        style={{
          // On phones: fill full width. On laptops: constrain to 9:16 using height
          width: "min(100%, calc(100vh * 9 / 16))",
          height: "100%",
        }}
      >

      {/* Media Player */}
      {reel.source === "youtube" ? (
        isActive ? (
          <iframe
            src={`https://www.youtube.com/embed/${reel.youtubeId}?autoplay=${settings?.autoPlayVideos && (!settings.autoPlayOnWifiOnly || isWifi) ? 1 : 0}&mute=${settings?.muteByDefault ? 1 : 0}&controls=1&modestbranding=1&rel=0&showinfo=0&loop=1&playlist=${reel.youtubeId}&enablejsapi=1&vq=${settings?.hdOnWifi && isWifi ? "hd1080" : settings?.videoQuality === "auto" ? "auto" : settings?.videoQuality === "360p" ? "small" : settings?.videoQuality === "720p" ? "hd720" : "hd1080"}`}
            className="absolute inset-0 w-full h-full pointer-events-auto"
            allow="autoplay; encrypted-media"
            frameBorder="0"
            allowFullScreen
          />
        ) : (
          <img src={reel.thumbnailUrl || reel.thumbnail} alt="thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-50" />
        )
      ) : (
        <video
          ref={videoRef}
          src={reel.videoUrl}
          className="absolute inset-0 w-full h-full object-cover"
          loop
          playsInline
          controls={false}
          autoPlay={settings ? (settings.autoPlayVideos && (!settings.autoPlayOnWifiOnly || isWifi)) : true}
          muted={settings ? settings.muteByDefault : false}
        />
      )}

      {/* Overlay UI */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60 pointer-events-none" />

      {/* Right Side Actions */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-10 pointer-events-auto">
        <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm group-hover:bg-black/60 transition-colors">
            <Heart className={`w-6 h-6 ${liked ? "fill-red-500 text-red-500" : "text-white"}`} />
          </div>
          <span className="text-white text-xs font-semibold">{reel.likes + (liked ? 1 : 0)}</span>
        </button>
        
        <button className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm group-hover:bg-black/60 transition-colors">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs font-semibold">124</span>
        </button>

        <button className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm group-hover:bg-black/60 transition-colors">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs font-semibold">Share</span>
        </button>

        <button onClick={handleSaveToggle} className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm group-hover:bg-black/60 transition-colors">
            <Bookmark className={`w-6 h-6 ${isSaved ? "fill-white text-white" : "text-white"}`} />
          </div>
          <span className="text-white text-xs font-semibold">{isSaved ? "Saved" : "Save"}</span>
        </button>

        <button className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm">
          <MoreVertical className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Bottom Info Section */}
      <div className="absolute bottom-0 left-0 right-16 p-4 pb-6 z-10 pointer-events-auto">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-orange-500 border border-white/20 flex items-center justify-center overflow-hidden">
              {reel.authorAvatar ? (
                <img src={reel.authorAvatar} alt="F" className="w-full h-full object-cover" />
              ) : (
               <span className="text-white font-bold text-xs">F</span>
              )}
            </div>
          <span className="text-white font-bold text-sm tracking-wide">Fact Flow User</span>
          <button className="px-3 py-1 bg-transparent border border-white/40 rounded-full text-[10px] font-bold text-white uppercase tracking-wider hover:bg-white/10 transition-colors ml-2">
            Follow
          </button>
        </div>

        <p className="text-white text-sm mb-3 max-w-[85%] leading-snug drop-shadow-md">
          {reel.description}
          {reel.tags && reel.tags.length > 0 && (
            <span className="block mt-1">
              {reel.tags.map((tag: string) => (
                <span key={tag} className="text-blue-400 font-bold mr-1 hover:underline cursor-pointer">
                  #{tag}
                </span>
              ))}
            </span>
          )}
        </p>

        <div className="flex items-center gap-2 text-white/80 text-xs bg-black/30 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
          <Music className="w-3 h-3 animate-[spin_4s_linear_infinite]" />
          <div className="overflow-hidden w-32">
            <div className="whitespace-nowrap animate-[ticker-move_5s_linear_infinite]">
              Original Audio - Fact Flow
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
