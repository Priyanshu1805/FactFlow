"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, Zap, Crown, Star, ArrowLeft, Shield, Globe, Newspaper, Bell, Wifi, Smartphone, Mail, Lock } from "lucide-react"
import Link from "next/link"
import { useTheme } from "@/components/theme-provider"
import { PageShell } from "@/components/frontend/page-shell"
import { useAuthStore } from "@/store/auth-store"
import { toast } from "sonner"

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "forever",
    icon: Star,
    gradient: "from-gray-500 to-gray-600",
    border: "border-gray-500/30",
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
    gradient: "from-red-500 to-pink-600",
    border: "border-red-500/60",
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
    gradient: "from-yellow-500 to-orange-500",
    border: "border-yellow-500/60",
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

const WHY_UPGRADE = [
  { icon: Shield, title: "Ad-Free Reading", desc: "Enjoy uninterrupted news without any advertisements cluttering your feed." },
  { icon: Newspaper, title: "Premium Articles", desc: "Access in-depth investigative reports and exclusive long-form journalism." },
  { icon: Bell, title: "Breaking Alerts", desc: "Get instant push notifications for breaking news before anyone else." },
  { icon: Wifi, title: "Offline Mode", desc: "Download articles and read them later without an internet connection." },
  { icon: Smartphone, title: "Multi-Device", desc: "Sync your reading history and preferences across all your devices." },
  { icon: Lock, title: "Priority Support", desc: "Get direct access to our support team with guaranteed fast response times." },
]

export default function PremiumPage() {
  const { theme } = useTheme()
  const isDark = theme !== "light"
  const { user } = useAuthStore()
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly")
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handleSubscribe = (planId: string) => {
    if (!user) {
      toast.error("Please login to subscribe")
      return
    }
    setSelectedPlan(planId)
    toast.success(`Redirecting to payment for ${planId.toUpperCase()} plan...`)
    // In production, this would redirect to a payment gateway
  }

  return (
    <PageShell className={`min-h-screen ${isDark ? "bg-black" : "bg-gray-50"}`}>
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-purple-900/20" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[150px]" />
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center py-16">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm font-bold tracking-widest uppercase mb-6">
                <Crown className="w-4 h-4" />
                Premium Membership
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-4xl md:text-6xl font-black mb-6 tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Upgrade to{" "}
              <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Fact Flow Pro
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-lg max-w-2xl mx-auto mb-10 ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              Get unlimited access to premium journalism, ad-free reading, breaking news alerts, and exclusive content. 
              Stay ahead with the most trusted news platform.
            </motion.p>

            {/* Billing Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-1 p-1 bg-white/5 border border-white/10 rounded-xl w-fit mx-auto"
            >
              {(["monthly", "yearly"] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${
                    billing === b 
                      ? "bg-red-500 text-white" 
                      : isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {b}
                  {b === "yearly" && (
                    <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-md">-20%</span>
                  )}
                </button>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="max-w-6xl mx-auto px-4 -mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan, idx) => {
              const Icon = plan.icon
              const yearlyPrice = plan.price !== "₹0"
                ? `₹${Math.round(parseInt(plan.price.replace("₹", "")) * 12 * 0.8)}`
                : "₹0"
              const isPopular = plan.id === "pro"

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className={`relative rounded-2xl border p-6 transition-all hover:-translate-y-1 ${
                    isPopular 
                      ? "border-red-500/60 bg-red-500/5 shadow-[0_0_30px_rgba(239,68,68,0.1)]" 
                      : isDark ? "border-white/10 bg-white/5 hover:border-white/20" : "border-gray-200 bg-white hover:border-gray-300 shadow-sm"
                  } ${selectedPlan === plan.id ? "ring-2 ring-red-500" : ""}`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className={`px-4 py-1 text-xs font-bold rounded-full shadow-lg ${
                        plan.id === "pro" ? "bg-gradient-to-r from-red-500 to-pink-500 text-white" : "bg-gradient-to-r from-yellow-500 to-orange-500 text-black"
                      }`}>
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4 mt-2">
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${plan.gradient}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>{plan.name}</h3>
                    </div>
                  </div>

                  <div className="mb-6">
                    <span className={`text-4xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>
                      {billing === "yearly" ? yearlyPrice : plan.price}
                    </span>
                    <span className={`text-sm ml-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      {billing === "yearly" && plan.price !== "₹0" ? "/year" : `/${plan.period}`}
                    </span>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className={`flex items-start gap-2.5 text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                        <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                    {plan.disabled.map((f) => (
                      <li key={f} className={`flex items-start gap-2.5 text-sm line-through ${isDark ? "text-white/20" : "text-gray-300"}`}>
                        <Check className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={plan.id === "free"}
                    className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
                      plan.id === "free"
                        ? isDark ? "bg-white/10 text-white/50 cursor-default" : "bg-gray-100 text-gray-400 cursor-default"
                        : plan.id === "premium"
                        ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:scale-[1.02]"
                        : "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:scale-[1.02]"
                    }`}
                  >
                    {plan.id === "free" ? "Current Plan" : `Subscribe to ${plan.name}`}
                  </button>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Why Upgrade Section */}
        <div className="max-w-6xl mx-auto px-4 mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className={`text-3xl font-black mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
              Why Upgrade?
            </h2>
            <p className={`max-w-xl mx-auto ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Get the most out of Fact Flow with premium features designed for news enthusiasts.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_UPGRADE.map((item, idx) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-6 rounded-2xl border transition-all hover:-translate-y-1 ${
                    isDark ? "bg-white/5 border-white/10 hover:border-red-500/30" : "bg-white border-gray-200 hover:border-red-300 shadow-sm"
                  }`}
                >
                  <div className="p-3 bg-red-500/10 rounded-xl w-fit mb-4">
                    <Icon className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className={`font-bold text-lg mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>{item.title}</h3>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>{item.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto px-4 mt-20">
          <h2 className={`text-2xl font-black text-center mb-8 ${isDark ? "text-white" : "text-gray-900"}`}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period." },
              { q: "Is there a free trial?", a: "Yes! All new users get a 7-day free trial of the Pro plan. No credit card required to start." },
              { q: "What payment methods do you accept?", a: "We accept all major credit/debit cards, UPI, net banking, and popular wallets like PhonePe and Google Pay." },
              { q: "Can I switch plans?", a: "Absolutely. You can upgrade or downgrade your plan at any time from your settings. Changes take effect immediately." },
            ].map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`p-5 rounded-xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"}`}
              >
                <h4 className={`font-bold text-sm mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>{faq.q}</h4>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </PageShell>
  )
}
