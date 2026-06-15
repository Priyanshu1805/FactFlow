"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { ReelPlayer } from "@/components/frontend/reel-player"
import { UploadReelModal } from "@/components/frontend/upload-reel-modal"
import { useSocket } from "@/hooks/use-socket"

export default function ReelsPage() {
  const [reels, setReels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/reels`)
      .then((res) => {
        if (!res.ok) throw new Error("Fetch failed")
        return res.json()
      })
      .then((data) => {
        if (data.success && data.data) {
          setReels(data.data)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const { socket } = useSocket()

  useEffect(() => {
    if (!socket) return
    socket.on("new_reel", (newReel: any) => {
      setReels((prev) => [newReel, ...prev])
    })
    return () => {
      socket.off("new_reel")
    }
  }, [socket])

  // Intersection Observer for scroll snapping
  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"))
            if (!isNaN(index)) {
              setActiveIndex(index)
            }
          }
        })
      },
      {
        root: containerRef.current,
        threshold: 0.6, // Trigger when 60% of the reel is visible
      }
    )

    const children = containerRef.current.children
    for (let i = 0; i < children.length; i++) {
      observer.observe(children[i])
    }

    return () => observer.disconnect()
  }, [reels])

  const handleUploadSuccess = (newReel: any) => {
    setReels((prev) => [newReel, ...prev])
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      {/* Top Navigation Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 z-50 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <Link href="/" className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-colors pointer-events-auto">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-white font-bold text-xl tracking-wide shadow-black drop-shadow-md">Fact Flow Reels</h1>
        <button 
          onClick={() => setIsUploadOpen(true)}
          className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition-colors pointer-events-auto"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Snap Scrolling Container */}
      <div 
        ref={containerRef}
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      >
        {reels.map((reel, idx) => (
          <div 
            key={reel._id || idx} 
            data-index={idx}
            className="w-full h-full snap-start snap-always"
          >
            <ReelPlayer reel={reel} isActive={activeIndex === idx} />
          </div>
        ))}
        {reels.length === 0 && (
          <div className="w-full h-full flex items-center justify-center text-white/[0.85]">
            No reels found. Be the first to upload!
          </div>
        )}
      </div>

      <UploadReelModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onUploadSuccess={handleUploadSuccess} 
      />
    </div>
  )
}
