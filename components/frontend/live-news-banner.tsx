"use client"

import { useLiveNews } from "@/lib/hooks/useLiveNews"
import { motion, AnimatePresence } from "framer-motion"
import { RefreshCw } from "lucide-react"

interface LiveNewsBannerProps {
  category: string
}

export function LiveNewsBanner({ category }: LiveNewsBannerProps) {
  const { newCount, applyLiveUpdates } = useLiveNews(category)

  return (
    <AnimatePresence>
      {newCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
        >
          <button
            onClick={applyLiveUpdates}
            className="flex items-center gap-3 px-6 py-3 rounded-full bg-red-600 text-white font-bold shadow-[0_10px_40px_-10px_rgba(220,38,38,0.7)] hover:bg-red-700 hover:shadow-[0_10px_50px_-5px_rgba(220,38,38,0.8)] transition-all duration-300 backdrop-blur-md"
          >
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </div>
            {newCount} New Article{newCount > 1 ? "s" : ""}
            <RefreshCw className="w-4 h-4 ml-1" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
