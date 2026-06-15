"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useAuthStore } from "@/store/auth-store"

export type Region = {
  code: string
  name: string
  language: string
  emoji: string
}

export const REGIONS: Region[] = [
  { code: "IN", name: "India", language: "English", emoji: "🇮🇳" },
  { code: "US", name: "United States", language: "English", emoji: "🇺🇸" },
  { code: "GB", name: "United Kingdom", language: "English", emoji: "🇬🇧" },
  { code: "CA", name: "Canada", language: "English", emoji: "🇨🇦" },
  { code: "AU", name: "Australia", language: "English", emoji: "🇦🇺" },
  { code: "FR", name: "France", language: "French", emoji: "🇫🇷" },
  { code: "DE", name: "Germany", language: "German", emoji: "🇩🇪" },
  { code: "JP", name: "Japan", language: "Japanese", emoji: "🇯🇵" },
  { code: "BR", name: "Brazil", language: "Portuguese", emoji: "🇧🇷" },
  { code: "AE", name: "UAE", language: "Arabic", emoji: "🇦🇪" },
  { code: "ZA", name: "South Africa", language: "English", emoji: "🇿🇦" },
  { code: "GLOBAL", name: "Global", language: "English", emoji: "🌍" }
]

const DEFAULT_REGION = REGIONS[0] // India

type RegionContextType = {
  region: Region
  setRegion: (regionCode: string) => Promise<void>
  regions: Region[]
  loading: boolean
}

const RegionContext = createContext<RegionContextType | undefined>(undefined)

export function RegionProvider({ children }: { children: ReactNode }) {
  const [region, setRegionState] = useState<Region>(DEFAULT_REGION)
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()

  useEffect(() => {
    async function loadRegion() {
      // 1. Immediately load from localStorage for fast UI
      const cached = localStorage.getItem("ff_region")
      if (cached) {
        const match = REGIONS.find(r => r.code === cached)
        if (match) setRegionState(match)
      }

      if (!user?.uid) {
        setLoading(false)
        return
      }

      // 2. Sync with backend
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/preferences/region`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        
        if (data && data.code && data.code !== cached) {
          const match = REGIONS.find(r => r.code === data.code)
          if (match) {
            setRegionState(match)
            localStorage.setItem("ff_region", match.code)
          }
        }
      } catch (err) {
        console.error("Failed to load region", err)
      } finally {
        setLoading(false)
      }
    }

    loadRegion()
  }, [user])

  const setRegion = async (code: string) => {
    const newRegion = REGIONS.find(r => r.code === code)
    if (!newRegion) return

    // Optimistic UI & localStorage update
    setRegionState(newRegion)
    localStorage.setItem("ff_region", newRegion.code)

    if (user?.uid) {
      try {
        const token = localStorage.getItem("token")
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/preferences/region`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            code: newRegion.code,
            name: newRegion.name,
            language: newRegion.language
          })
        })
      } catch (err) {
        console.error("Failed to save region", err)
      }
    }
  }

  return (
    <RegionContext.Provider value={{ region, setRegion, regions: REGIONS, loading }}>
      {children}
    </RegionContext.Provider>
  )
}

export function useRegion() {
  const context = useContext(RegionContext)
  if (context === undefined) {
    throw new Error("useRegion must be used within a RegionProvider")
  }
  return context
}
