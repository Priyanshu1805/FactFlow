"use client"

import { useState } from "react"
import { Check, Zap, Crown, Star, CreditCard, Calendar, AlertCircle } from "lucide-react"

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "forever",
    icon: Star,
    color: "border-white/20",
    badge: null,
    features: [
      "Latest news updates",
      "Basic reels feed",
      "5 categories",
      "Standard notifications",
      "Web access only",
    ],
    disabled: ["Ad-free experience", "Premium articles", "Offline reading", "Priority support"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹99",
    period: "per month",
    icon: Zap,
    color: "border-red-500/60",
    badge: "Most Popular",
    features: [
      "Everything in Free",
      "Ad-free experience",
      "All categories unlocked",
      "Breaking news alerts",
      "Premium articles access",
      "HD reels",
      "Mobile + Web",
    ],
    disabled: ["Offline reading", "Priority support"],
  },
  {
    id: "premium",
    name: "Premium",
    price: "₹199",
    period: "per month",
    icon: Crown,
    color: "border-yellow-500/60",
    badge: "Best Value",
    features: [
      "Everything in Pro",
      "Offline reading",
      "Early access to features",
      "Priority customer support",
      "Custom news digest email",
      "No ads ever",
      "Multi-device sync",
    ],
    disabled: [],
  },
]

export function SubscriptionSettings() {
  const [currentPlan] = useState("free")
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly")

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Subscription</h2>
        <p className="text-gray-600 dark:text-white/[0.85] text-sm">Manage your plan and billing</p>
      </div>

      {/* Current Plan Banner */}
      <div className="flex items-center gap-4 p-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl">
        <div className="p-2.5 bg-red-500/15 rounded-lg">
          <Star className="w-5 h-5 text-red-400" />
        </div>
        <div className="flex-1">
          <p className="text-gray-900 dark:text-white font-semibold text-sm">You are on the Free Plan</p>
          <p className="text-gray-600 dark:text-white/[0.85] text-xs">Upgrade to unlock premium features</p>
        </div>
        <span className="px-3 py-1 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/[0.85] text-xs font-semibold rounded-full">Active</span>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-1 p-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl w-fit mx-auto">
        {(["monthly", "yearly"] as const).map((b) => (
          <button
            key={b}
            onClick={() => setBilling(b)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${
              billing === b ? "bg-red-500 text-gray-900 dark:text-white" : "text-gray-600 dark:text-white/[0.85] hover:text-gray-900 dark:text-white"
            }`}
          >
            {b}
            {b === "yearly" && (
              <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-md">-20%</span>
            )}
          </button>
        ))}
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const Icon = plan.icon
          const isActive = currentPlan === plan.id
          const yearlyPrice = plan.price !== "₹0"
            ? `₹${Math.round(parseInt(plan.price.replace("₹", "")) * 12 * 0.8)}`
            : "₹0"

          return (
            <div
              key={plan.id}
              className={`relative rounded-xl border p-5 transition-all ${plan.color} ${
                isActive ? "bg-white/8" : "bg-white/3 hover:bg-white/6"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    plan.id === "pro" ? "bg-red-500 text-gray-900 dark:text-white" : "bg-yellow-500 text-black"
                  }`}>
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 mb-4 mt-1">
                <Icon className={`w-5 h-5 ${
                  plan.id === "premium" ? "text-yellow-400" : plan.id === "pro" ? "text-red-400" : "text-gray-600 dark:text-white/[0.85]"
                }`} />
                <span className="text-gray-900 dark:text-white font-bold">{plan.name}</span>
              </div>

              <div className="mb-5">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {billing === "yearly" ? yearlyPrice : plan.price}
                </span>
                <span className="text-gray-600 dark:text-white/[0.85] text-sm ml-1">
                  {billing === "yearly" && plan.price !== "₹0" ? "/year" : `/${plan.period}`}
                </span>
              </div>

              <ul className="space-y-2 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-gray-600 dark:text-white/[0.85]">
                    <Check className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
                {plan.disabled.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-gray-400 dark:text-white/25 line-through">
                    <Check className="w-3.5 h-3.5 text-gray-300 dark:text-white/20 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/[0.85] cursor-default"
                    : plan.id === "premium"
                    ? "bg-yellow-500 text-black hover:bg-yellow-400"
                    : plan.id === "pro"
                    ? "bg-red-500 text-gray-900 dark:text-white hover:bg-red-600"
                    : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/[0.85]"
                }`}
              >
                {isActive ? "Current Plan" : `Upgrade to ${plan.name}`}
              </button>
            </div>
          )
        })}
      </div>

      {/* Billing Info */}
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5">
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-red-400" />
          Billing Information
        </h3>
        <div className="flex items-center gap-3 p-3 bg-white dark:bg-white/5 rounded-lg text-gray-600 dark:text-white/[0.85] text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          No active subscription. Upgrade a plan to manage billing.
        </div>
      </div>

      {/* Newsletter Subscription */}
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5">
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm mb-1 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-red-400" />
          Newsletter Subscription
        </h3>
        <p className="text-gray-600 dark:text-white/[0.85] text-xs mb-4">Get daily news digest in your inbox — free forever</p>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-2.5 bg-white/8 border border-gray-200 dark:border-white/15 rounded-lg text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:text-white/30 focus:outline-none focus:border-red-500 transition-colors"
          />
          <button className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-gray-900 dark:text-white text-sm font-semibold rounded-lg transition-colors">
            Subscribe
          </button>
        </div>
        <div className="mt-3 space-y-2">
          {["Daily Morning Digest", "Breaking News Alerts", "Weekly Trending Roundup"].map((item) => (
            <label key={item} className="flex items-center gap-3 cursor-pointer group">
              <div className="w-4 h-4 rounded border border-white/20 bg-white dark:bg-white/5 flex items-center justify-center group-hover:border-red-500/50 transition-colors">
                <Check className="w-2.5 h-2.5 text-red-500 opacity-0 group-hover:opacity-50" />
              </div>
              <span className="text-gray-600 dark:text-white/[0.85] text-sm group-hover:text-gray-700 dark:text-white/80 transition-colors">{item}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
