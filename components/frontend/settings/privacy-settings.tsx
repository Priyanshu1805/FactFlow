"use client"

import { Shield, Eye, Database, Cookie, Download, Trash2 } from "lucide-react"
import { useState } from "react"

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

export function PrivacySettings() {
  const [prefs, setPrefs] = useState({
    analytics: true,
    personalized: true,
    cookies: true,
    history: true,
    location: false,
    shareData: false,
  })
  const toggle = (k: keyof typeof prefs) => setPrefs((p) => ({ ...p, [k]: !p[k] }))

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Privacy & Security</h2>
        <p className="text-gray-600 dark:text-white/[0.85] text-sm">Control your data and privacy preferences</p>
      </div>

      {/* Privacy Controls */}
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5 space-y-4">
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm flex items-center gap-2">
          <Eye className="w-4 h-4 text-red-400" />
          Privacy Controls
        </h3>
        {[
          { key: "analytics", label: "Usage Analytics", desc: "Help improve Fact Flow by sharing usage data" },
          { key: "personalized", label: "Personalized Ads", desc: "See ads relevant to your interests" },
          { key: "cookies", label: "Accept Cookies", desc: "Allow cookies for better experience" },
          { key: "history", label: "Reading History", desc: "Save articles you have read" },
          { key: "location", label: "Location-based News", desc: "Show news from your region" },
          { key: "shareData", label: "Share Data with Partners", desc: "Allow trusted partners to use your data" },
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

      {/* Data Management */}
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5 space-y-3">
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm flex items-center gap-2">
          <Database className="w-4 h-4 text-red-400" />
          Your Data
        </h3>
        <button className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-600 dark:text-white/[0.85] hover:text-gray-900 dark:text-white hover:border-white/25 transition-colors text-sm">
          <Download className="w-4 h-4 text-blue-400" />
          Download my data
          <span className="ml-auto text-gray-400 dark:text-white/30 text-xs">Export as JSON</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-600 dark:text-white/[0.85] hover:text-gray-900 dark:text-white hover:border-white/25 transition-colors text-sm">
          <Cookie className="w-4 h-4 text-yellow-400" />
          Clear cookies & cache
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-600 dark:text-white/[0.85] hover:text-red-400 hover:border-red-500/30 transition-colors text-sm">
          <Trash2 className="w-4 h-4" />
          Clear reading history
        </button>
      </div>

      {/* Security */}
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5 space-y-3">
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm flex items-center gap-2">
          <Shield className="w-4 h-4 text-red-400" />
          Security
        </h3>
        {[
          { label: "Two-Factor Authentication", desc: "Add extra security to your account", badge: "Recommended" },
          { label: "Active Sessions", desc: "See where you are logged in", badge: "2 devices" },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-4 px-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg">
            <div>
              <p className="text-gray-700 dark:text-white/80 text-sm font-medium">{item.label}</p>
              <p className="text-gray-600 dark:text-white/[0.85] text-xs">{item.desc}</p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/[0.85] rounded-full shrink-0">{item.badge}</span>
          </div>
        ))}
      </div>

      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
        <p className="text-green-400 text-xs font-semibold mb-1">🔒 Your data is safe</p>
        <p className="text-gray-600 dark:text-white/[0.85] text-xs">Fact Flow never sells your personal data. We use industry-standard encryption to protect your information.</p>
      </div>
    </div>
  )
}
