"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Maximize, Radio, Bookmark, LayoutGrid, Globe, TrendingUp, MonitorPlay } from "lucide-react"
import { useAuthStore } from "@/store/auth-store"
import { getSavedItems, saveItem, unsaveItem } from "@/lib/api/saved"
import { toast } from "sonner"
import { useVideoSettings } from "@/hooks/useVideoSettings"
import { useNetworkStatus } from "@/hooks/useNetworkStatus"
import { NewsTicker } from "./news-ticker"

type Category = "All" | "Indian" | "Global" | "Business"

interface Channel {
  id: string
  name: string
  youtubeHandle: string
  currentVideoId?: string
  short: string
  color: string
  category: "Indian" | "Global" | "Business"
}

const CATEGORIES = [
  { id: "All", icon: LayoutGrid },
  { id: "Indian", icon: MonitorPlay },
  { id: "Global", icon: Globe },
  { id: "Business", icon: TrendingUp }
]

export function LiveTvSection() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null)
  const [activeCategory, setActiveCategory] = useState<Category>("All")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [originUrl, setOriginUrl] = useState("")
  
  const { user } = useAuthStore()
  const settings = useVideoSettings()
  const { isWifi } = useNetworkStatus()

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

  useEffect(() => {
    setOriginUrl(window.location.origin)
  }, [])

  // Auto-refresh mechanism
  const fetchChannels = async (silent = false) => {
    try {
      const res = await fetch(`${API_URL}/live-channels`)
      const data = await res.json()
      if (data.success && data.channels.length > 0) {
        setChannels(data.channels)
        if (!silent || !activeChannel) {
          // Only set active channel on first load, or if current one is missing
          setActiveChannel(data.channels[0])
        } else {
          // If silent refresh, check if the currently active channel has a new video ID!
          const updatedActive = data.channels.find((c: Channel) => c.id === activeChannel.id)
          if (updatedActive && updatedActive.currentVideoId !== activeChannel.currentVideoId) {
            setActiveChannel(updatedActive)
            toast.success(`${updatedActive.name} stream refreshed`)
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch live channels:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch and 5-minute background polling
  useEffect(() => {
    fetchChannels()
    const interval = setInterval(() => fetchChannels(true), 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const filteredChannels = useMemo(() => {
    if (activeCategory === "All") return channels
    return channels.filter(c => c.category === activeCategory)
  }, [activeCategory, channels])

  useEffect(() => {
    if (user?.uid && activeChannel) {
      getSavedItems(user.uid).then(res => {
        if (res.success) {
          setIsSaved(res.data.videos.includes(activeChannel.id))
        }
      }).catch(() => {})
    }
  }, [activeChannel?.id, user?.uid])

  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (isLoading && channels.length > 0) {
      timeout = setTimeout(() => {
        setIsLoading(false)
      }, 2500)
    }
    return () => clearTimeout(timeout)
  }, [isLoading, channels])

  const handleChannelChange = (channel: Channel) => {
    if (activeChannel?.id === channel.id) return
    setIsLoading(true)
    setActiveChannel(channel)
  }

  const toggleFullScreen = () => {
    const wrapper = document.getElementById("video-wrapper")
    if (!wrapper) return
    if (!document.fullscreenElement) {
      wrapper.requestFullscreen().catch(err => console.log(err))
    } else {
      document.exitFullscreen()
    }
  }

  const handleSaveToggle = async () => {
    if (!user?.uid || !activeChannel) {
      toast.error("Please login to save channels")
      return
    }
    try {
      if (isSaved) {
        setIsSaved(false)
        await unsaveItem(user.uid, activeChannel.id, "video")
        toast.success("Removed from saved items")
      } else {
        setIsSaved(true)
        await saveItem(user.uid, activeChannel.id, "video")
        toast.success("Channel saved")
      }
    } catch (err) {
      setIsSaved(!isSaved)
      toast.error("Failed to update saved state")
    }
  }

  // Generate robust video URL
  const getVideoUrl = () => {
    if (!activeChannel || !originUrl) return ""
    
    const autoplay = settings?.autoPlayVideos ? 1 : 1 // Force autoplay for Live TV
    const mute = settings?.muteByDefault ? 1 : 1 // Mute required for autoplay to work reliably in browsers
    const params = `autoplay=${autoplay}&mute=${mute}&playsinline=1&origin=${originUrl}`

    // If backend found a direct video ID, use it with native embed
    if (activeChannel.currentVideoId) {
      return `https://www.youtube.com/embed/${activeChannel.currentVideoId}?${params}`
    }
    
    return ""
  }

  if (channels.length === 0) {
    return (
      <div className="w-full max-w-[1400px] mx-auto px-4 py-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
          <p className="text-red-500 font-bold uppercase tracking-widest text-sm animate-pulse">Initializing Live Engine...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col">
      <NewsTicker />
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
          <h2 className="text-3xl font-black tracking-tight text-white uppercase">Live News TV</h2>
          <div className="h-[2px] flex-1 bg-gradient-to-r from-red-600/50 to-transparent ml-4" />
        </div>

      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-[3] flex flex-col gap-6">
          <div 
            id="video-wrapper"
            className="relative w-full aspect-video bg-black/50 rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_60px_-15px_rgba(220,38,38,0.2)] group backdrop-blur-sm"
          >
            <AnimatePresence>
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/90 backdrop-blur-md z-20 flex flex-col items-center justify-center pointer-events-none"
                >
                  <div className="w-12 h-12 border-4 border-white/10 border-t-red-600 rounded-full animate-spin mb-4" />
                  <p className="text-red-500 font-bold tracking-widest text-sm uppercase animate-pulse">Connecting to Live Stream...</p>
                </motion.div>
              )}
            </AnimatePresence>

            {activeChannel && originUrl && getVideoUrl() && (
              <iframe
                key={activeChannel.id + (activeChannel.currentVideoId || '')}
                className="absolute inset-0 w-full h-full border-none z-10"
                src={getVideoUrl()}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
              />
            )}
          </div>

          {activeChannel && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-xl ${activeChannel.color} shadow-[0_0_20px_rgba(0,0,0,0.5)]`}>
                  {activeChannel.short}
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                    {activeChannel.name}
                  </h3>
                  <div className="flex items-center gap-2 text-red-400 text-xs sm:text-sm font-bold uppercase tracking-widest mt-1.5">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]" />
                    Live Broadcast
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button 
                  onClick={handleSaveToggle}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all border ${
                    isSaved 
                      ? "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30" 
                      : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
                  {isSaved ? "Saved" : "Save"}
                </button>
                <button 
                  onClick={toggleFullScreen}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10"
                >
                  <Maximize className="w-5 h-5" /> Fullscreen
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-[1.2] flex flex-col gap-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 h-[650px] flex flex-col shadow-xl">
            
            <div className="flex items-center gap-2 text-white font-black text-xl mb-5 pb-5 border-b border-white/10">
              <Radio className="w-6 h-6 text-red-500" /> 
              Networks
            </div>

            <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 pb-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon
                const isActive = activeCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id as Category)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap font-bold text-sm transition-all ${
                      isActive 
                        ? "bg-white text-black shadow-lg" 
                        : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.id}
                  </button>
                )
              })}
            </div>
            
            <div className="flex flex-col gap-3 overflow-y-auto pr-2 scrollbar-hide flex-1 pb-4">
              <AnimatePresence mode="popLayout">
                {filteredChannels.map((channel) => {
                  const isActive = activeChannel?.id === channel.id
                  return (
                    <motion.button
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      key={channel.id}
                      onClick={() => handleChannelChange(channel)}
                      className={`relative w-full text-left flex items-center gap-4 p-4 rounded-xl transition-all duration-300 border ${
                        isActive 
                          ? "bg-gradient-to-r from-red-600/20 to-transparent border-red-500/30" 
                          : "bg-white/5 border-transparent hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      {isActive && (
                        <motion.div 
                          layoutId="activeIndicator"
                          className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] rounded-l-xl"
                        />
                      )}
                      
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-base transition-all ${isActive ? channel.color + " shadow-lg shadow-black/50 scale-110" : 'bg-white/10'}`}>
                        {channel.short}
                      </div>
                      
                      <div className="flex-1 overflow-hidden">
                        <div className={`font-black truncate ${isActive ? 'text-white text-lg' : 'text-gray-300 text-base'}`}>
                          {channel.name}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-1 font-semibold uppercase tracking-wider">
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                          {isActive ? 'Watching Now' : 'Live Stream'}
                        </div>
                      </div>
                      
                      {isActive ? (
                        <div className="flex items-end gap-1 h-5 opacity-80">
                          <motion.div className="w-1.5 bg-red-500 rounded-full" animate={{ height: ["40%", "100%", "40%"] }} transition={{ duration: 0.8, repeat: Infinity }} />
                          <motion.div className="w-1.5 bg-red-500 rounded-full" animate={{ height: ["100%", "40%", "100%"] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }} />
                          <motion.div className="w-1.5 bg-red-500 rounded-full" animate={{ height: ["60%", "100%", "60%"] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }} />
                        </div>
                      ) : (
                        <Play className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors opacity-50" />
                      )}
                    </motion.button>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      </div>
    </div>
  )
}
