"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

const PageShell = dynamic(() => import("@/components/frontend/page-shell").then(m => ({ default: m.PageShell })), { ssr: false })
const LiveTvSection = dynamic(() => import("@/components/frontend/live-tv-section").then(m => ({ default: m.LiveTvSection })), { ssr: false })
const NewsTicker = dynamic(() => import("@/components/frontend/news-ticker").then(m => ({ default: m.NewsTicker })), { ssr: false })
const ReelsSection = dynamic(() => import("@/components/frontend/reels-section").then(m => ({ default: m.ReelsSection })), { ssr: false })

function LiveLoader() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function LivePage() {
  return (
    <Suspense fallback={<LiveLoader />}>
      <PageShell className="min-h-screen bg-black transition-colors duration-500 overflow-x-hidden">
        {/* Premium Header Section */}
        <div className="relative pt-24 pb-8 w-full">
          {/* Background Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-red-900/20 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Global Command Center
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 drop-shadow-lg">
              Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Broadcast</span>
            </h1>
            <p className="text-white/[0.85] max-w-2xl mx-auto text-sm md:text-base font-medium">
              Watch top global and regional news networks live, ad-free, and in real-time. Stay updated with our breaking news coverage.
            </p>
          </div>
        </div>

        <div className="relative z-20 pb-20">
          <LiveTvSection />
          
          <div className="my-8">
            <NewsTicker />
          </div>

          {/* News Shorts Section */}
          <ReelsSection />
        </div>
      </PageShell>
    </Suspense>
  )
}
