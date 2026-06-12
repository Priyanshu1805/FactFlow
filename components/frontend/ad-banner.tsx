"use client"

import { useEffect, useState } from "react"
import { useSubscription } from "@/lib/use-subscription"
import { useTheme } from "@/components/theme-provider"
import { useAuthStore } from "@/store/auth-store"
import Link from "next/link"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export function AdBanner({ className = "" }: { className?: string }) {
  const { user } = useAuthStore()
  const { canAccess, loading: subLoading } = useSubscription()
  const { theme } = useTheme()
  const isDark = theme !== "light"
  
  const [ad, setAd] = useState<any>(null)
  const [loadingAd, setLoadingAd] = useState(true)

  useEffect(() => {
    // Only fetch if user is on Free tier (subLoading finished, and canAccess is false)
    if (subLoading || canAccess("weekly")) return

    const fetchAds = async () => {
      try {
        const res = await fetch(`${API}/ads`)
        const data = await res.json()
        if (data.success && data.data && data.data.length > 0) {
          // Pick a random ad
          const randomAd = data.data[Math.floor(Math.random() * data.data.length)]
          setAd(randomAd)
          
          // Track View if not viewed in this session
          const viewedAds = JSON.parse(sessionStorage.getItem("ff_viewed_ads") || "[]")
          if (!viewedAds.includes(randomAd._id)) {
            fetch(`${API}/ads/${randomAd._id}/track`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "view", firebaseUid: user?.uid })
            }).catch(() => {})
            sessionStorage.setItem("ff_viewed_ads", JSON.stringify([...viewedAds, randomAd._id]))
          }
        }
      } catch (err) {
        console.error("Failed to fetch ads", err)
      } finally {
        setLoadingAd(false)
      }
    }

    fetchAds()
  }, [subLoading, canAccess])

  if (subLoading || loadingAd) return null
  if (canAccess("weekly")) return null

  const handleAdClick = (e: React.MouseEvent) => {
    if (ad && ad._id) {
      // Track Click if not clicked in this session
      const clickedAds = JSON.parse(sessionStorage.getItem("ff_clicked_ads") || "[]")
      if (!clickedAds.includes(ad._id)) {
        fetch(`${API}/ads/${ad._id}/track`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "click", firebaseUid: user?.uid })
        }).catch(() => {})
        sessionStorage.setItem("ff_clicked_ads", JSON.stringify([...clickedAds, ad._id]))
      }
    }
  }

  return (
    <div className={`w-full py-6 flex flex-col items-center justify-center ${className}`}>
      {ad ? (
        // Custom Direct Banner Ad
        <a 
          href={ad.targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleAdClick}
          className={`w-full max-w-[728px] h-auto min-h-[90px] flex items-center justify-center rounded-lg border ${isDark ? "bg-[#111] border-[#333]" : "bg-gray-100 border-gray-300"} relative overflow-hidden group block`}
        >
          <div className="absolute top-1 left-2 text-[10px] uppercase font-bold text-gray-500 tracking-wider z-10 bg-black/50 px-1 rounded backdrop-blur-sm text-white">Sponsored</div>
          
          <img 
            src={ad.imageUrl} 
            alt={ad.title} 
            className="w-full h-full object-cover max-h-[250px]"
          />

          {/* Upgrade Prompt overlay on hover */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
            <div className="text-white text-sm font-bold flex flex-col items-center gap-2 text-center px-4">
              <span className="text-xl mb-1">🚀</span>
              <span>Remove Ads with Weekly Pass (₹15)</span>
              <span className="text-[10px] text-gray-400 font-normal underline">Ad: {ad.title} (Click to visit)</span>
            </div>
          </div>
        </a>
      ) : (
        // Google AdSense Fallback
        <div className={`w-full max-w-[728px] min-h-[90px] flex flex-col items-center justify-center rounded-lg border ${isDark ? "bg-[#111] border-[#333]" : "bg-gray-100 border-gray-300"} relative overflow-hidden group`}>
          <div className="absolute top-1 left-2 text-[10px] uppercase font-bold text-gray-500 tracking-wider z-10">Advertisement</div>
          
          <div className="w-full h-full flex items-center justify-center">
            {/* Google AdSense ins block */}
            <ins 
              className="adsbygoogle"
              style={{ display: "block", width: "100%", height: "90px" }}
              data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
              data-ad-slot="XXXXXXXXXX"
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>
          </div>

          {/* Upgrade Prompt */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20 pointer-events-none">
            <Link href="/subscription" className="text-white text-sm font-bold flex items-center gap-2 hover:text-yellow-400 transition-colors pointer-events-auto">
              <span className="text-xl">⚡</span> Remove Ads with Weekly Pass (₹15)
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
