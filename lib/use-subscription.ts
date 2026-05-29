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
  const [subscription, setSubscription] = useState<SubscriptionInfo>(FREE_TIER)
  const [loading, setLoading] = useState(true)

  const token = (user as any)?.accessToken || (user as any)?.stsTokenManager?.accessToken

  const fetchSubscription = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setSubscription(FREE_TIER)
      setLoading(false)
      return
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/subscription`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (data.success) {
        setSubscription({
          tier: data.subscription.tier || "free",
          validUntil: data.subscription.validUntil,
          isValid: data.subscription.isValid,
        })
      }
    } catch {
      setSubscription(FREE_TIER)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, token])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  const canAccess = useCallback(
    (requiredTier: "free" | "pro" | "premium") => {
      if (requiredTier === "free") return true
      if (!subscription.isValid) return false
      const tiers = ["free", "pro", "premium"]
      return tiers.indexOf(subscription.tier) >= tiers.indexOf(requiredTier)
    },
    [subscription]
  )

  return { subscription, loading, canAccess, refetch: fetchSubscription }
}
