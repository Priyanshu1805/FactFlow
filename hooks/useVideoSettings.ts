import { useEffect, useState } from "react"
import axios from "axios"
import { useAuthStore } from "@/store/auth-store"

export interface AudioVideoSettings {
  autoPlayVideos: boolean
  autoPlayOnWifiOnly: boolean
  muteByDefault: boolean
  showSubtitles: boolean
  hdOnWifi: boolean
  videoQuality: "auto" | "360p" | "720p" | "1080p"
  enableAudioNews: boolean
  backgroundAudio: boolean
  voiceSpeed: string
}

const STORAGE_KEY = "factflow_av_settings"

// Default: audio OFF (user must explicitly enable it in Settings)
const DEFAULTS: AudioVideoSettings = {
  autoPlayVideos: true,
  autoPlayOnWifiOnly: true,
  muteByDefault: true,
  showSubtitles: false,
  hdOnWifi: true,
  videoQuality: "auto",
  enableAudioNews: false,  // OFF by default
  backgroundAudio: false,
  voiceSpeed: "1x",
}

// Read from localStorage instantly (SSR-safe)
function getLocalSettings(): AudioVideoSettings {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {}
  return DEFAULTS
}

// Write a patch to localStorage (called by settings page on every toggle/change)
export function saveLocalAVSettings(patch: Partial<AudioVideoSettings>) {
  try {
    const current = getLocalSettings()
    const merged = { ...current, ...patch }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
    // Dispatch a storage event so other tabs/hooks re-read immediately
    window.dispatchEvent(new StorageEvent("storage", {
      key: STORAGE_KEY,
      newValue: JSON.stringify(merged),
    }))
  } catch {}
}

export function useVideoSettings() {
  const [settings, setSettings] = useState<AudioVideoSettings>(getLocalSettings)
  const { user } = useAuthStore()

  // Re-read from localStorage whenever the settings page updates it
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setSettings({ ...DEFAULTS, ...JSON.parse(e.newValue) })
        } catch {}
      }
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  // Also fetch from server on login to get saved preferences
  useEffect(() => {
    if (!user?.uid) return

    const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

    axios.get(`${API_URL}/preferences?firebaseUid=${user.uid}`)
      .then(res => {
        const merged = { ...DEFAULTS, ...res.data }
        setSettings(merged)
        // Cache to localStorage so it loads instantly next visit
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(merged)) } catch {}
      })
      .catch(() => {}) // Silently fail — localStorage fallback is sufficient
  }, [user?.uid])

  return settings
}
