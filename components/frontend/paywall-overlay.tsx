"use client"

import { Crown, Lock, Star, Zap } from "lucide-react"
import Link from "next/link"

export function PaywallOverlay() {
  return (
    <div className="relative">
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center py-16 px-4">
        <div className="max-w-md w-full mx-auto text-center bg-gray-900/95 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-8 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-yellow-500/20">
            <Crown className="w-8 h-8 text-black" />
          </div>

          <h3 className="text-white text-2xl font-black mb-2">Premium Article</h3>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            This article is exclusive to our subscribers. Upgrade your plan to unlock unlimited access to premium journalism, ad-free reading, and more.
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Zap className="w-5 h-5 text-blue-400 shrink-0" />
              <div className="text-left">
                <p className="text-white text-sm font-semibold">Weekly Pass — ₹15/week</p>
                <p className="text-gray-400 text-xs">Ad-free, all categories, premium articles</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 border-red-500/30">
              <Star className="w-5 h-5 text-red-400 shrink-0" />
              <div className="text-left">
                <p className="text-white text-sm font-semibold">Monthly Pro — ₹99/month</p>
                <p className="text-gray-400 text-xs">Weekly features + offline reading, HD reels</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-12 h-12 bg-yellow-500/20 blur-xl"></div>
              <Crown className="w-5 h-5 text-yellow-400 shrink-0" />
              <div className="text-left">
                <p className="text-white text-sm font-semibold">Yearly Premium — ₹399/year</p>
                <p className="text-gray-400 text-xs">Monthly features + Custom Digest & priority support</p>
              </div>
            </div>
          </div>

          <Link
            href="/subscription"
            className="block w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold text-sm hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all mb-3"
          >
            <span className="flex items-center justify-center gap-2">
              <Star className="w-4 h-4" />
              View Plans & Upgrade
            </span>
          </Link>

          <Link
            href="/settings?tab=subscription"
            className="block text-gray-500 text-xs hover:text-gray-300 transition-colors"
          >
            Already a subscriber? Manage your plan
          </Link>
        </div>
      </div>

      <div className="pointer-events-none select-none blur-sm opacity-30 scale-95">
        <div className="flex items-center justify-center p-8 bg-gray-900/30 rounded-xl border border-white/10 min-h-[300px]">
          <Lock className="w-12 h-12 text-gray-500" />
        </div>
      </div>
    </div>
  )
}
