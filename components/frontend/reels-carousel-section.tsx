"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Play, TrendingUp } from "lucide-react"

export function ReelsCarouselSection() {
  const [reels, setReels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/reels?limit=6`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setReels(data.data)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading || reels.length === 0) return null

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden relative">
      <div className="flex items-end justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-lg shadow-red-500/20">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Trending Shorts</h2>
            <p className="text-white/50 text-sm mt-1 font-medium">Bite-sized news updates</p>
          </div>
        </div>
        <Link 
          href="/reels" 
          className="text-sm font-bold text-red-500 hover:text-red-400 flex items-center gap-1 group transition-colors"
        >
          Watch All <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>

      {/* Horizontal Carousel */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {reels.map((reel, idx) => (
          <Link 
            key={reel._id || idx} 
            href="/reels"
            className="snap-start shrink-0 relative group rounded-2xl overflow-hidden shadow-2xl transition-all hover:-translate-y-2 hover:shadow-red-500/20"
            style={{ width: "240px", aspectRatio: "9/16" }}
          >
            <img 
              src={reel.thumbnailUrl || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=700&fit=crop"} 
              alt={reel.caption || "Reel Thumbnail"} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
            
            {/* Play Button Overlay (Visible on hover) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-[2px]">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg">
                <Play className="w-6 h-6 text-white fill-white ml-1" />
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-white font-bold text-sm line-clamp-2 leading-tight drop-shadow-md mb-2">
                {reel.caption || "Breaking News Update"}
              </p>
              
              <div className="flex items-center gap-2">
                {reel.user?.profilePic ? (
                  <img src={reel.user.profilePic} alt="Author" className="w-5 h-5 rounded-full border border-white/20" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-[8px] text-white font-bold">FF</div>
                )}
                <span className="text-white/70 text-xs font-semibold">
                  {reel.user?.username || "factflownews"}
                </span>
              </div>
            </div>
          </Link>
        ))}
        
        {/* View More Card */}
        <Link 
          href="/reels"
          className="snap-start shrink-0 relative group rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex flex-col items-center justify-center transition-all hover:-translate-y-2 hover:bg-white/10"
          style={{ width: "240px", aspectRatio: "9/16" }}
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 text-white ml-1 fill-white" />
          </div>
          <span className="mt-4 text-white font-bold text-lg">Watch More</span>
          <span className="text-white/50 text-sm mt-1">Infinite Scroll</span>
        </Link>
      </div>
    </section>
  )
}
