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

const DEFAULTS: AudioVideoSettings = {
  autoPlayVideos: true,
  autoPlayOnWifiOnly: true,
  muteByDefault: true,
  showSubtitles: false,
  hdOnWifi: true,
  videoQuality: "auto",
  enableAudioNews: false,
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

export function useVideoSettings() {
  const [settings, setSettings] = useState<AudioVideoSettings>(getLocalSettings)
  const { user } = useAuthStore()

  useEffect(() => {
    if (!user?.uid) return

    const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

    axios.get(`${API_URL}/preferences?firebaseUid=${user.uid}`)
      .then(res => {
        const merged = { ...DEFAULTS, ...res.data }
        setSettings(merged)
        // Cache in localStorage so it loads instantly next visit
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(merged)) } catch {}
      })
      .catch(err => {
        console.error("Failed to load video settings", err)
      })
  }, [user?.uid])

  return settings
}

// Also export a setter so settings page can update the cache too
export function saveLocalAVSettings(patch: Partial<AudioVideoSettings>) {
  try {
    const current = getLocalSettings()
    const merged = { ...current, ...patch }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  } catch {}
}
