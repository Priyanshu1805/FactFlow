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

const DEFAULTS: AudioVideoSettings = {
  autoPlayVideos: true,
  autoPlayOnWifiOnly: true,
  muteByDefault: true,
  showSubtitles: false,
  hdOnWifi: true,
  videoQuality: "auto",
  enableAudioNews: false,
  backgroundAudio: false,
  voiceSpeed: "0.75x",
}

export function useVideoSettings() {
  const [settings, setSettings] = useState<AudioVideoSettings>(DEFAULTS)
  const { user } = useAuthStore()

  useEffect(() => {
    if (!user?.uid) return

    const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

    axios.get(`${API_URL}/preferences?firebaseUid=${user.uid}`)
      .then(res => {
        setSettings({ ...DEFAULTS, ...res.data })
      })
      .catch(err => {
        console.error("Failed to load video settings", err)
      })
  }, [user?.uid])

  return settings
}
