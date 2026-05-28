"use client"

import { Bell, BellOff, Smartphone, Mail, Volume2, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/auth-store"
import { toast } from "sonner"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${on ? "bg-red-500" : "bg-white/15"}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  )
}

export function NotificationSettings() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [master, setMaster] = useState(true)
  const [prefs, setPrefs] = useState({
    breakingNews: true,
    trendingStories: true,
    personalizedUpdates: true,
    systemAlerts: true,
    communityInteraction: true,
    dailyDigest: true,
    locationBased: false,
    recommendations: true,
    emailAlerts: false,
    pushNotifications: true,
    newsletter: false,
    sound: true, // Local only for now
    vibration: true, // Local only for now
  })

  useEffect(() => {
    if (!user?.uid) return
    fetch(`${API}/users/settings/${user.uid}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.settings?.notifications) {
          setPrefs(prev => ({ ...prev, ...d.settings.notifications }))
        }
      })
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false))
  }, [user])

  const saveSettings = async (newPrefs: typeof prefs) => {
    if (!user?.uid) return
    try {
      await fetch(`${API}/users/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid: user.uid,
          settings: { notifications: newPrefs }
        })
      })
    } catch {
      toast.error("Failed to save settings")
    }
  }

  const toggle = (key: keyof typeof prefs) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] }
    setPrefs(newPrefs)
    saveSettings(newPrefs)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-red-500" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Notifications</h2>
        <p className="text-gray-600 dark:text-white/[0.85] text-sm">Control what alerts you receive and how</p>
      </div>

      {/* Master Toggle */}
      <div className={`flex items-center justify-between p-5 rounded-xl border transition-colors ${
        master ? "bg-red-500/10 border-red-500/30" : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10"
      }`}>
        <div className="flex items-center gap-3">
          {master ? <Bell className="w-5 h-5 text-red-400" /> : <BellOff className="w-5 h-5 text-gray-600 dark:text-white/[0.85]" />}
          <div>
            <p className="text-gray-900 dark:text-white font-semibold text-sm">All Notifications</p>
            <p className="text-gray-600 dark:text-white/[0.85] text-xs">{master ? "Notifications are enabled" : "All notifications muted"}</p>
          </div>
        </div>
        <Toggle on={master} onChange={setMaster} />
      </div>

      {/* Smart Alerts */}
      <div className={`bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5 space-y-4 transition-opacity ${!master ? "opacity-40 pointer-events-none" : ""}`}>
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm">Smart Alerts</h3>
        {[
          { key: "breakingNews", label: "Breaking News", desc: "Urgent news as it happens, highlighted in red" },
          { key: "trendingStories", label: "Trending Stories", desc: "Most-read articles right now" },
          { key: "personalizedUpdates", label: "Personalized Updates", desc: "Subtle updates tailored to your interests" },
          { key: "systemAlerts", label: "System Alerts", desc: "Maintenance, new features, and policy updates" },
          { key: "communityInteraction", label: "Community Interaction", desc: "Comments, replies, or likes on your posts" },
          { key: "dailyDigest", label: "Daily Digest", desc: "Scheduled notification summarizing top 5 stories" },
          { key: "locationBased", label: "Location-Based", desc: "Local weather, traffic, or city-specific alerts" },
          { key: "recommendations", label: "Recommendations", desc: "Smart suggestions like 'You may like this'" },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-4">
            <div>
              <p className="text-gray-700 dark:text-white/80 text-sm font-medium">{item.label}</p>
              <p className="text-gray-600 dark:text-white/[0.85] text-xs">{item.desc}</p>
            </div>
            <Toggle on={prefs[item.key as keyof typeof prefs]} onChange={() => toggle(item.key as keyof typeof prefs)} />
          </div>
        ))}
      </div>

      {/* Delivery Method */}
      <div className={`bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5 space-y-4 transition-opacity ${!master ? "opacity-40 pointer-events-none" : ""}`}>
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-red-400" />
          Delivery Method
        </h3>
        {[
          { key: "pushNotifications", label: "Push Notifications", desc: "Receive notifications in your browser" },
          { key: "emailAlerts", label: "Email Notifications", desc: "Get alerts in your inbox" },
          { key: "newsletter", label: "Newsletter", desc: "Receive our weekly newsletter" },
          { key: "sound", label: "Notification Sound", desc: "Play sound for alerts (local)" },
          { key: "vibration", label: "Vibration", desc: "Vibrate on mobile notifications (local)" },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-4">
            <div>
              <p className="text-gray-700 dark:text-white/80 text-sm font-medium">{item.label}</p>
              <p className="text-gray-600 dark:text-white/[0.85] text-xs">{item.desc}</p>
            </div>
            <Toggle on={prefs[item.key as keyof typeof prefs]} onChange={() => toggle(item.key as keyof typeof prefs)} />
          </div>
        ))}
      </div>

      {/* Quiet Hours */}
      <div className={`bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5 transition-opacity ${!master ? "opacity-40 pointer-events-none" : ""}`}>
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm mb-4 flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-red-400" />
          Quiet Hours
        </h3>
        <p className="text-gray-600 dark:text-white/[0.85] text-xs mb-3">No notifications during these hours</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-gray-600 dark:text-white/[0.85] text-xs mb-1 block">From</label>
            <select className="w-full px-3 py-2.5 bg-white/8 border border-gray-200 dark:border-white/15 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500">
              {["10:00 PM", "11:00 PM", "12:00 AM"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-gray-600 dark:text-white/[0.85] text-xs mb-1 block">To</label>
            <select className="w-full px-3 py-2.5 bg-white/8 border border-gray-200 dark:border-white/15 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500">
              {["6:00 AM", "7:00 AM", "8:00 AM"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
