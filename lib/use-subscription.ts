"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuthStore } from "@/store/auth-store"

export interface SubscriptionInfo {
  tier: string
  validUntil: string | null
  isValid: boolean
}

const FREE_TIER: SubscriptionInfo = { tier: "free", validUntil: null, isValid: true }

export function useSubscription() {
  const { user, isAuthenticated } = useAuthStore()
  const [subscription, setSubscription] = useState<SubscriptionInfo>(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("ff_sub_cache")
      if (cached) return JSON.parse(cached)
    }
    return FREE_TIER
  })
  
  // Start with loading = false if we already have a cached subscription, to prevent UI flicker
  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined") {
      return !localStorage.getItem("ff_sub_cache")
    }
    return true
  })

  const token = (user as any)?.accessToken || (user as any)?.stsTokenManager?.accessToken

  const fetchSubscription = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setSubscription(FREE_TIER)
      if (typeof window !== "undefined") localStorage.removeItem("ff_sub_cache")
      setLoading(false)
      return
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/subscription/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (data.success && data.data) {
        const subData = {
          tier: data.data.plan || "free",
          validUntil: data.data.endDate || null,
          isValid: data.data.status === "active",
        }
        setSubscription(subData)
        if (typeof window !== "undefined") localStorage.setItem("ff_sub_cache", JSON.stringify(subData))
      }
    } catch {
      setSubscription(FREE_TIER)
      if (typeof window !== "undefined") localStorage.removeItem("ff_sub_cache")
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, token])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  const canAccess = useCallback(
    (requiredTier: "free" | "weekly" | "monthly" | "yearly") => {
      if (requiredTier === "free") return true
      if (!subscription.isValid) return false
      const tiers = ["free", "weekly", "monthly", "yearly"]
      return tiers.indexOf(subscription.tier) >= tiers.indexOf(requiredTier)
    },
    [subscription]
  )

  return { subscription, loading, canAccess, refetch: fetchSubscription }
}
