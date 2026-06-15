"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/store/auth-store"
import { useFeedStore } from "@/lib/store/feed-store"

const API = process.env.NEXT_PUBLIC_API_URL || "/api"

export function FeedInitializer() {
  const { user, setUser } = useAuthStore()
  const { initFromBackend } = useFeedStore()

  useEffect(() => {
    if (!user?.uid) return

    const syncUserProfile = async () => {
      if (!user?._id || !user?.id) {
        try {
          const res = await fetch(`${API}/users/profile?firebaseUid=${user.uid}`)
          const data = await res.json()
          if (data.success && data.user) {
            setUser({
              ...user,
              _id: data.user._id,
              id: data.user._id,
              username: data.user.username || user.username,
              role: data.user.role || user.role
            })
          }
        } catch (err) {
          console.error("Failed to sync user profile in FeedInitializer", err)
        }
      }
    }

    const fetchPrefs = async () => {
      try {
        const token = localStorage.getItem("ff_token") || ""
        const res = await fetch(`${API}/newsfeed/prefs?firebaseUid=${user.uid}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success && data.data) {
          initFromBackend(data.data)
        }
      } catch (err) {
        console.error("Failed to load global feed prefs", err)
      }
    }

    syncUserProfile()
    fetchPrefs()
  }, [user?.uid, user?._id, initFromBackend, setUser])

  return null
}
