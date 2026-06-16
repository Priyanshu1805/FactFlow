"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import { Volume2, Video, Settings2 } from "lucide-react"
import { toast } from "sonner"
import { useAuthStore } from "@/store/auth-store"
import { saveLocalAVSettings } from "@/hooks/useVideoSettings"

const DEFAULTS = {
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

export function AudioVideoSettings() {
  const [settings, setSettings] = useState(DEFAULTS)
  const [saving, setSaving] = useState(false)
  const { user } = useAuthStore()

  const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

  useEffect(() => {
    if (!user?.uid) return

    axios.get(`${API_URL}/preferences?firebaseUid=${user.uid}`)
      .then(res => setSettings(prev => ({ ...prev, ...res.data })))
      .catch(err => console.error("Failed to load preferences", err))
  }, [API_URL, user?.uid])

  const save = async (patch: Record<string, any>) => {
    // 1. Update localStorage immediately so all sections see the change right away
    saveLocalAVSettings(patch)

    // 2. Persist to backend if logged in
    setSaving(true)
    try {
      if (!user?.uid) {
        // Not logged in — localStorage update is enough for now
        toast.success("Setting saved locally ✓")
        setSaving(false)
        return
      }
      await axios.patch(`${API_URL}/preferences/audio-video`, {
        firebaseUid: user.uid,
        ...patch
      })
      toast.success("Setting saved ✓")
    } catch (err: any) {
      console.error("Save failed", err?.response?.data || err)
      toast.error("Failed to save setting")
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (key: keyof typeof DEFAULTS) => {
    const updated = { ...settings, [key]: !settings[key] }
    setSettings(updated)
    await save({ [key]: !settings[key] })
  }

  const handleSelect = async (key: string, value: string) => {
    const updated = { ...settings, [key]: value }
    setSettings(updated)
    await save({ [key]: value })
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Audio & Video</h2>
          {saving && <span className="text-xs text-green-600 dark:text-green-400 font-medium">Saving...</span>}
        </div>
        <p className="text-gray-600 dark:text-white/[0.85] text-sm">Control how media plays on Fact Flow</p>
      </div>

      {/* Video Playback Section */}
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5">
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm mb-4 flex items-center gap-2">
          <Video className="w-4 h-4 text-red-400" />
          Video Playback
        </h3>
        
        <div className="space-y-4">
          {[
            { key: "autoPlayVideos",     label: "Auto-play videos",       desc: "Videos play automatically as you scroll" },
            { key: "autoPlayOnWifiOnly", label: "Auto-play on Wi-Fi only", desc: "Save mobile data usage" },
            { key: "muteByDefault",      label: "Mute videos by default",  desc: "Videos start without sound" },
            { key: "showSubtitles",      label: "Show subtitles/captions", desc: "Display captions on all videos" },
            { key: "hdOnWifi",           label: "HD quality on Wi-Fi",     desc: "Play highest quality on Wi-Fi" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between pt-4 first:pt-0 border-t border-gray-100 dark:border-white/10 first:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-500 dark:text-zinc-500">{desc}</p>
              </div>
              <Toggle on={settings[key as keyof typeof DEFAULTS] as boolean} onToggle={() => handleToggle(key as keyof typeof DEFAULTS)} />
            </div>
          ))}
        </div>
      </div>

      {/* Video Quality Section */}
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5">
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm mb-1 flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-blue-400" />
          Video Quality
        </h3>
        <p className="text-gray-600 dark:text-white/[0.85] text-xs mb-4">Default quality for reel playback</p>
        
        <div className="flex flex-wrap gap-2">
          {["auto", "360p", "720p", "1080p"].map(q => (
            <button
              key={q}
              onClick={() => handleSelect("videoQuality", q)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                settings.videoQuality === q
                  ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                  : "bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
              }`}
            >
              {q === "auto" ? "Auto" : q}
            </button>
          ))}
        </div>
      </div>

      {/* Audio News TTS Section */}
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5">
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm mb-4 flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-purple-400" />
          Audio News (TTS)
        </h3>
        <p className="text-gray-600 dark:text-white/[0.85] text-xs mb-4">Listen to articles read aloud</p>
        
        <div className="space-y-4">
          {[
            { key: "enableAudioNews",  label: "Enable Audio News",  desc: "Read articles aloud using text-to-speech" },
            { key: "backgroundAudio",  label: "Background audio",   desc: "Continue playing when app is minimized" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between pt-4 first:pt-0 border-t border-gray-100 dark:border-white/10 first:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-500 dark:text-zinc-500">{desc}</p>
              </div>
              <Toggle on={settings[key as keyof typeof DEFAULTS] as boolean} onToggle={() => handleToggle(key as keyof typeof DEFAULTS)} />
            </div>
          ))}

          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/10">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Voice Speed</p>
              <p className="text-xs text-gray-500 dark:text-zinc-500">Adjust reading speed</p>
            </div>
            <select
              value={settings.voiceSpeed}
              onChange={e => handleSelect("voiceSpeed", e.target.value)}
              className="bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white text-sm rounded-lg px-3 py-1.5 border-none outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="0.75x">0.75x — Slow</option>
              <option value="1x">1x — Normal</option>
              <option value="1.25x">1.25x — Fast</option>
              <option value="1.5x">1.5x — Faster</option>
              <option value="2x">2x — Very Fast</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button 
      onClick={onToggle}
      className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${on ? "bg-red-500" : "bg-gray-300 dark:bg-zinc-700"}`}
    >
      <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${on ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  )
}
