"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Play, Heart, Share2, ArrowRight, Eye } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import Image from "next/image"
import Link from "next/link"
import { io } from "socket.io-client"

export function ReelsSection() {
  const { theme } = useTheme()
  const isDark = theme !== "light"
  const [reels, setReels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeReel, setActiveReel] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/reels?limit=10`)
      .then((res) => {
        if (!res.ok) throw new Error("Fetch failed")
        return res.json()
      })
      .then((data) => {
        if (data.success && data.data) {
          const formatted = data.data.map((item: any) => ({
            id: item._id,
            title: item.title || item.description || "Reel",
            views: item.views || 0,
            likes: item.likes || 0,
            thumbnail: item.thumbnailUrl || "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=300&h=500&fit=crop",
            duration: typeof item.duration === "number" ? `${Math.floor(item.duration / 60)}:${(item.duration % 60).toString().padStart(2, '0')}` : item.duration || "0:30",
            tag: item.tags?.[0] || "Reel",
            videoUrl: item.videoUrl,
          }))
          setReels(formatted)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const [socket, setSocket] = useState<any>(null)

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL && process.env.NEXT_PUBLIC_SOCKET_URL !== "/"
      ? process.env.NEXT_PUBLIC_SOCKET_URL
      : "http://localhost:5000"
      
    const newSocket = io(socketUrl, {
      path: "/socket.io",
      transports: ["websocket", "polling"]
    })
    setSocket(newSocket)
    
    return () => {
      newSocket.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!socket) return
    socket.on("new_reel", (item: any) => {
      const formatted = {
        id: item._id,
        title: item.title || item.description || "Reel",
        views: item.views || 0,
        likes: item.likes || 0,
        thumbnail: item.thumbnailUrl || "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=300&h=500&fit=crop",
        duration: typeof item.duration === "number" ? `${Math.floor(item.duration / 60)}:${(item.duration % 60).toString().padStart(2, '0')}` : item.duration || "0:30",
        tag: item.tags?.[0] || "Reel",
        videoUrl: item.videoUrl,
      }
      setReels(prev => [formatted, ...prev].slice(0, 10))
    })
    return () => {
      socket.off("new_reel")
    }
  }, [socket])

  return (
    <section id="news-shorts" className={`py-16 px-4 ${
      isDark ? "bg-gradient-to-b from-transparent via-red-950/10 to-transparent" : "bg-white"
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-10"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/15 rounded-lg">
              <Play className="w-5 h-5 text-red-500 fill-red-500" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                News Shorts
              </h2>
              <p className={`text-sm ${isDark ? "text-white/[0.85]" : "text-gray-500"}`}>
                Quick updates in short format
              </p>
            </div>
          </div>
          <Link href="/reels" className="flex items-center gap-1.5 text-pink-500 text-sm font-semibold hover:text-pink-400 transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Reels Scroll */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          {reels.map((reel, index) => (
            <motion.div
              key={reel.id}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07 }}
              onClick={() => setActiveReel(reel.videoUrl)}
              className="group relative shrink-0 w-44 cursor-pointer snap-start"
            >
              <div className="relative aspect-[9/16] rounded-xl overflow-hidden">
                <Image
                  src={reel.thumbnail}
                  alt={reel.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                {/* Tag */}
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-md">
                    {reel.tag}
                  </span>
                </div>

                {/* Duration */}
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-md bg-black/60 text-white`}>
                    {reel.duration}
                  </span>
                </div>

                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-red-500/80 transition-colors duration-300">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                </div>

                {/* Bottom Info */}
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white text-xs font-semibold line-clamp-2 mb-2">{reel.title}</p>
                  <div className="flex items-center justify-between text-white/[0.85] text-xs">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />{reel.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />{reel.likes}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      {activeReel && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          onClick={() => setActiveReel(null)}
        >
          <div className="relative w-full max-w-[400px] aspect-[9/16] bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <button 
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-red-500 rounded-full flex items-center justify-center text-white transition-colors"
              onClick={() => setActiveReel(null)}
            >
              ✕
            </button>
            <iframe 
              src={activeReel.replace('shorts/', 'embed/')} 
              className="w-full h-full" 
              allow="autoplay; encrypted-media; picture-in-picture" 
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  )
}
