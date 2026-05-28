"use client"

import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import Link from "next/link"
import { GlowingButton } from "@/components/ui/glowing-button"

const LiveWidgetsDashboard = dynamic(() => import("./widgets/live-widgets-dashboard").then(m => ({ default: m.LiveWidgetsDashboard })), { ssr: false })

export function HeroContent() {
  return (
    <div className="relative z-10 pt-32 pb-20 px-4 min-h-[90vh] flex flex-col items-center justify-center pointer-events-none">
      <div className="max-w-5xl mx-auto text-center flex-1 flex flex-col items-center justify-center">
        
        {/* Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="pointer-events-auto inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-8 shadow-xl"
        >
          <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
          <span className="text-white text-xs sm:text-sm font-bold tracking-widest uppercase">
            Breaking Update Inside
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight tracking-tight text-white drop-shadow-2xl"
        >
          Unbiased Stories.<br />
          <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
            Unfiltered Global News.
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl max-w-xl mx-auto mb-12 text-gray-400 font-medium leading-relaxed drop-shadow-md"
        >
          Fast, accurate, and entertaining reporting designed for the modern world. Stay ahead of the pulse with stories that matter.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pointer-events-auto flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto"
        >
          {/* Primary Button */}
          <GlowingButton
            asChild
            glowColor="#ef4444"
            className="w-auto !px-8 py-4 text-lg font-bold"
          >
            <Link href="/premium" className="flex items-center justify-center gap-2">
              ⭐ Subscribe to Premium
            </Link>
          </GlowingButton>
          
          {/* Secondary Button */}
          <GlowingButton
            asChild
            glowColor="#22d3ee"
            className="w-auto !px-8 py-4 text-lg font-bold"
          >
            <Link href="/live" className="flex items-center justify-center gap-3">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
              View Current Updates
            </Link>
          </GlowingButton>
        </motion.div>
      </div>

      {/* New Live Smart Widgets Dashboard */}
      <LiveWidgetsDashboard />
    </div>
  )
}
