"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Maximize, Radio, Bookmark } from "lucide-react"
import { useAuthStore } from "@/store/auth-store"
import { getSavedItems, saveItem, unsaveItem } from "@/lib/api/saved"
import { toast } from "sonner"
import { useVideoSettings } from "@/hooks/useVideoSettings"
import { useNetworkStatus } from "@/hooks/useNetworkStatus"

interface Channel {
  id: string
  name: string
  ytId: string
  isChannel?: boolean
  short: string
  color: string
}

const CHANNELS: Channel[] = [
  // Indian News
  { id: "aajtak", name: "Aaj Tak", ytId: "UCt4t-jeY85JegMlZ-E5UWtA", isChannel: true, short: "AT", color: "bg-red-600" },
  { id: "ndtv", name: "NDTV India", ytId: "UC9CYT9gSNLevX5ey2_6CK0Q", isChannel: true, short: "ND", color: "bg-blue-600" },
  { id: "loksatta", name: "Loksatta Live", ytId: "UCQ1591pS2_5N52Vb6w_L66A", isChannel: true, short: "LS", color: "bg-red-500" },
  { id: "ani", name: "ANI News", ytId: "UCtFQDgA8J8_iiwc5-KoAQlg", isChannel: true, short: "ANI", color: "bg-blue-600" },
  { id: "timesnownavbharat", name: "Times Now Navbharat", ytId: "UCwBT56Y3BvQyO4gS6H459wA", isChannel: true, short: "TNN", color: "bg-orange-600" },
  { id: "republic", name: "Republic Bharat", ytId: "6qbpkpYqLQk", short: "RB", color: "bg-orange-600" },
  { id: "indiatoday", name: "India Today", ytId: "0IXniqWlmQc", short: "IT", color: "bg-red-700" },
  { id: "cnbc", name: "CNBC TV18", ytId: "NkBlsN71VTo", short: "CN", color: "bg-blue-800" },
  { id: "ddnews", name: "DD News", ytId: "qD6GkaU2lD0", short: "DD", color: "bg-indigo-600" },
  { id: "zeenews", name: "Zee News", ytId: "UCi_gLPf_MqA7W3RQm2CJ6gg", isChannel: true, short: "ZN", color: "bg-yellow-600" },
  { id: "abpnews", name: "ABP News", ytId: "UC2G1G_s-1tFyMYo6mL-IGmA", isChannel: true, short: "ABP", color: "bg-red-700" },
  { id: "news18", name: "News18 India", ytId: "UCj3o7K1ceCrA9QeO2PBRrvw", isChannel: true, short: "N18", color: "bg-blue-800" },
  { id: "indiatv", name: "India TV", ytId: "UCq4IseHboBwX4R1xFVmpR7A", isChannel: true, short: "ITV", color: "bg-green-700" },
  { id: "tv9bharatvarsh", name: "TV9 Bharatvarsh", ytId: "UCxOv2PlCRRHFlXiJ8G1qjWQ", isChannel: true, short: "TV9", color: "bg-orange-600" },
  // Global News
  { id: "aljazeera", name: "Al Jazeera", ytId: "gCNeDWCI0vo", short: "AJ", color: "bg-yellow-600" },
  { id: "skynews", name: "Sky News", ytId: "3ix8C2VqCY0", short: "SN", color: "bg-blue-700" },
  { id: "dwnews", name: "DW News", ytId: "LuKwFajn37U", short: "DW", color: "bg-blue-500" },
  { id: "france24", name: "France 24", ytId: "Ap-UM1O9RBU", short: "F24", color: "bg-teal-600" },
  { id: "nbcnews", name: "NBC News", ytId: "x5ZBVQxuHu8", short: "NBC", color: "bg-indigo-700" },
  { id: "wion", name: "WION", ytId: "JXwquw3WLYg", short: "WN", color: "bg-slate-700" },
  { id: "bbcnews", name: "BBC News", ytId: "blHI_IKoZ08", short: "BBC", color: "bg-red-800" },
  { id: "nyt", name: "New York Times", ytId: "jb_mrI8ypiI", short: "NYT", color: "bg-gray-800" }
]

export function LiveTvSection() {
  const [activeChannel, setActiveChannel] = useState<Channel>(CHANNELS[0])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const { user } = useAuthStore()
  const settings = useVideoSettings()
  const { isWifi } = useNetworkStatus()

  // Fetch saved state when active channel changes
  useEffect(() => {
    if (user?.uid) {
      getSavedItems(user.uid).then(res => {
        if (res.success) {
          setIsSaved(res.data.videos.includes(activeChannel.id))
        }
      }).catch(() => {})
    }
  }, [activeChannel.id, user?.uid])

  const handleChannelChange = (channel: Channel) => {
    if (activeChannel.id === channel.id) return
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
    if (!user?.uid) {
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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
        <h2 className="text-3xl font-black tracking-tight text-white uppercase">Live News TV</h2>
        <div className="h-[2px] flex-1 bg-gradient-to-r from-red-600/50 to-transparent ml-4" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Video Section */}
        <div className="flex-[3] flex flex-col gap-4">
          <div 
            id="video-wrapper"
            className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group"
          >
            {/* Loading Overlay */}
            <AnimatePresence>
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center"
                >
                  <div className="w-12 h-12 border-4 border-white/20 border-t-red-600 rounded-full animate-spin mb-4" />
                  <p className="text-red-500 font-bold tracking-widest text-sm uppercase animate-pulse">Connecting to Live Stream...</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* YouTube iframe */}
            <iframe
              key={activeChannel.id}
              className="absolute inset-0 w-full h-full border-none z-10"
              src={
                activeChannel.isChannel
                  ? `https://www.youtube.com/embed/live_stream?channel=${activeChannel.ytId}&autoplay=${settings?.autoPlayVideos && (!settings.autoPlayOnWifiOnly || isWifi) ? 1 : 0}&mute=${settings?.muteByDefault ? 1 : 0}&playsinline=1`
                  : `https://www.youtube.com/embed/${activeChannel.ytId}?autoplay=${settings?.autoPlayVideos && (!settings.autoPlayOnWifiOnly || isWifi) ? 1 : 0}&mute=${settings?.muteByDefault ? 1 : 0}&playsinline=1`
              }
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
            />
          </div>

          {/* Video Controls & Info */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-lg ${activeChannel.color} shadow-lg`}>
                {activeChannel.short}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                  {activeChannel.name}
                </h3>
                <div className="flex items-center gap-2 text-red-400 text-sm font-bold uppercase tracking-wider mt-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  Live Broadcast
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleSaveToggle}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-colors border ${
                  isSaved 
                    ? "bg-red-500/20 text-red-500 border-red-500/50 hover:bg-red-500/30" 
                    : "bg-white/10 text-white border-white/10 hover:bg-white/20"
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                {isSaved ? "Saved" : "Save"}
              </button>
              <button 
                onClick={toggleFullScreen}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors border border-white/10"
              >
                <Maximize className="w-4 h-4" /> Fullscreen
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Channels */}
        <div className="flex-[1] flex flex-col gap-4">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 h-full max-h-[600px] overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-4 pb-4 border-b border-white/10">
              <Radio className="w-5 h-5 text-red-500" /> Channels List
            </div>
            
            <div className="flex flex-col gap-3 overflow-y-auto pr-2 scrollbar-hide flex-1">
              {CHANNELS.map((channel) => {
                const isActive = activeChannel.id === channel.id
                return (
                  <button
                    key={channel.id}
                    onClick={() => handleChannelChange(channel)}
                    className={`relative w-full text-left flex items-center gap-4 p-4 rounded-xl transition-all duration-300 border ${
                      isActive 
                        ? "bg-gradient-to-r from-red-600/20 to-transparent border-red-500/50" 
                        : "bg-white/5 border-transparent hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="activeIndicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] rounded-l-xl"
                      />
                    )}
                    
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm transition-colors ${isActive ? channel.color : 'bg-white/10'}`}>
                      {channel.short}
                    </div>
                    
                    <div className="flex-1">
                      <div className={`font-bold ${isActive ? 'text-white' : 'text-gray-300'}`}>
                        {channel.name}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                        {isActive ? 'Watching Now' : 'Live Stream'}
                      </div>
                    </div>
                    
                    {isActive ? (
                      <div className="flex items-end gap-0.5 h-4 opacity-80">
                        <motion.div className="w-1 bg-red-500 rounded-full" animate={{ height: ["40%", "100%", "40%"] }} transition={{ duration: 0.8, repeat: Infinity }} />
                        <motion.div className="w-1 bg-red-500 rounded-full" animate={{ height: ["100%", "40%", "100%"] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }} />
                        <motion.div className="w-1 bg-red-500 rounded-full" animate={{ height: ["60%", "100%", "60%"] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }} />
                      </div>
                    ) : (
                      <Play className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors opacity-50" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
