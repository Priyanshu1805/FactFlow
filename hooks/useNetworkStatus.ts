"use client"
import { useState, useEffect } from "react"

export function useNetworkStatus() {
  const [isWifi, setIsWifi] = useState(true)

  useEffect(() => {
    const updateConnectionStatus = () => {
      if (typeof navigator !== "undefined" && "connection" in navigator) {
        const conn = (navigator as any).connection
        // We consider "wifi" or "4g" (effectiveType) as high speed "wifi-like" connections
        const highSpeed = conn.type === "wifi" || conn.effectiveType === "4g"
        setIsWifi(highSpeed)
      } else {
        // Fallback to true if the API is not supported
        setIsWifi(true)
      }
    }

    updateConnectionStatus()

    if (typeof navigator !== "undefined" && "connection" in navigator) {
      const conn = (navigator as any).connection
      conn.addEventListener("change", updateConnectionStatus)
      return () => conn.removeEventListener("change", updateConnectionStatus)
    }
  }, [])

  return { isWifi }
}
