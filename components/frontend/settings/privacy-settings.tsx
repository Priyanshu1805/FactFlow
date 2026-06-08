"use client"

import { useState } from "react"
import { Shield, Eye, Database, Ghost, Tv, Image as ImageIcon, BrainCircuit, UserCheck, Download, Trash2, Loader2 } from "lucide-react"
import { useSettingsStore } from "@/store/settings-store"
import { useAuthStore } from "@/store/auth-store"
import { toast } from "sonner"

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${on ? "bg-red-500" : "bg-gray-300 dark:bg-white/15"}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  )
}

export function PrivacySettings() {
  const { settings, updateSetting } = useSettingsStore()
  const { user } = useAuthStore()
  const [clearing, setClearing] = useState(false)
  const [exporting, setExporting] = useState(false)

  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""
  const privacy = settings.privacy || {
    profileVisibility: "public",
    incognitoMode: false,
    anonymousFactCheck: false,
    hideLiveStatus: false,
    blurGraphicImagery: false,
    commentVisibility: "public",
    allowAITraining: true,
  }

  const toggle = (k: keyof typeof privacy) => {
    updateSetting("privacy", { [k]: !privacy[k] }, token || "")
  }

  const setOption = (k: keyof typeof privacy, value: any) => {
    updateSetting("privacy", { [k]: value }, token || "")
  }

  const handleClearHistory = async () => {
    if (!user?.uid) {
      toast.error("Please login to clear your history.")
      return
    }
    const confirmClear = window.confirm("Are you sure you want to permanently clear all your reading history? This action cannot be undone.")
    if (!confirmClear) return

    setClearing(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/history?firebaseUid=${user.uid}`, {
        method: "DELETE"
      })
      if (!res.ok) throw new Error("API call failed")
      const data = await res.json()
      if (data.success) {
        toast.success("Reading history successfully cleared.")
      } else {
        throw new Error(data.error || "Failed to clear history")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to clear reading history.")
    } finally {
      setClearing(false)
    }
  }

  const handleExportData = async () => {
    if (!user?.uid) {
      toast.error("Please login to download your data.")
      return
    }
    setExporting(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/export-data?firebaseUid=${user.uid}`)
      if (!res.ok) throw new Error("API call failed")
      const data = await res.json()
      if (data.success && data.data) {
        const jsonStr = JSON.stringify(data.data, null, 2)
        const blob = new Blob([jsonStr], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `factflow_user_data_${user.displayName?.toLowerCase().replace(/\s+/g, "_") || "profile"}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success("Your data has been compiled and download has started!")
      } else {
        throw new Error(data.error || "Failed to compile export data")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to export data.")
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Privacy Controls</h2>
        <p className="text-gray-600 dark:text-white/[0.85] text-sm">Fine-tune how your data and identity are handled across Fact Flow.</p>
      </div>

      {/* Advanced Fact Flow Privacy */}
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5 space-y-4">
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-red-500" />
          Platform Privacy
        </h3>

        {/* Incognito Mode */}
        <div className="flex items-center justify-between gap-4 py-2">
          <div className="flex gap-3">
            <div className="mt-0.5 bg-gray-100 dark:bg-white/5 p-2 rounded-lg h-fit">
              <Ghost className="w-4 h-4 text-gray-600 dark:text-white/70" />
            </div>
            <div>
              <p className="text-gray-900 dark:text-white text-sm font-medium">Incognito News Mode</p>
              <p className="text-gray-500 dark:text-white/60 text-xs mt-0.5">Read articles without saving them to your history or altering your personalized algorithms.</p>
            </div>
          </div>
          <Toggle on={!!privacy.incognitoMode} onChange={() => toggle('incognitoMode')} />
        </div>

        {/* Anonymous Fact Check */}
        <div className="flex items-center justify-between gap-4 py-2">
          <div className="flex gap-3">
            <div className="mt-0.5 bg-gray-100 dark:bg-white/5 p-2 rounded-lg h-fit">
              <UserCheck className="w-4 h-4 text-gray-600 dark:text-white/70" />
            </div>
            <div>
              <p className="text-gray-900 dark:text-white text-sm font-medium">Anonymous Fact-Checking</p>
              <p className="text-gray-500 dark:text-white/60 text-xs mt-0.5">When you request an AI fact-check on news or comments, hide your identity from other users.</p>
            </div>
          </div>
          <Toggle on={!!privacy.anonymousFactCheck} onChange={() => toggle('anonymousFactCheck')} />
        </div>

        {/* Hide Live Status */}
        <div className="flex items-center justify-between gap-4 py-2">
          <div className="flex gap-3">
            <div className="mt-0.5 bg-gray-100 dark:bg-white/5 p-2 rounded-lg h-fit">
              <Tv className="w-4 h-4 text-gray-600 dark:text-white/70" />
            </div>
            <div>
              <p className="text-gray-900 dark:text-white text-sm font-medium">Hide Live TV Status</p>
              <p className="text-gray-500 dark:text-white/60 text-xs mt-0.5">Prevent followers from seeing what Live News channels you are currently watching.</p>
            </div>
          </div>
          <Toggle on={!!privacy.hideLiveStatus} onChange={() => toggle('hideLiveStatus')} />
        </div>

        {/* Blur Graphic Imagery */}
        <div className="flex items-center justify-between gap-4 py-2">
          <div className="flex gap-3">
            <div className="mt-0.5 bg-gray-100 dark:bg-white/5 p-2 rounded-lg h-fit">
              <ImageIcon className="w-4 h-4 text-gray-600 dark:text-white/70" />
            </div>
            <div>
              <p className="text-gray-900 dark:text-white text-sm font-medium">Blur Graphic Imagery</p>
              <p className="text-gray-500 dark:text-white/60 text-xs mt-0.5">Automatically blur potentially sensitive or graphic news thumbnails until clicked.</p>
            </div>
          </div>
          <Toggle on={!!privacy.blurGraphicImagery} onChange={() => toggle('blurGraphicImagery')} />
        </div>

        {/* AI Training Opt-Out */}
        <div className="flex items-center justify-between gap-4 py-2 border-t border-gray-100 dark:border-white/10 pt-4 mt-2">
          <div className="flex gap-3">
            <div className="mt-0.5 bg-blue-50 dark:bg-blue-500/10 p-2 rounded-lg h-fit">
              <BrainCircuit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-gray-900 dark:text-white text-sm font-medium">Allow AI Model Training</p>
              <p className="text-gray-500 dark:text-white/60 text-xs mt-0.5">Allow your search queries and interactions to be used to improve Fact Flow's AI models.</p>
            </div>
          </div>
          <Toggle on={!!privacy.allowAITraining} onChange={() => toggle('allowAITraining')} />
        </div>
      </div>

      {/* Visibility Settings */}
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5 space-y-4">
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm flex items-center gap-2 mb-2">
          <Eye className="w-4 h-4 text-red-500" />
          Visibility
        </h3>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-gray-900 dark:text-white text-sm font-medium flex items-center gap-2">
              Profile Visibility
            </label>
            <select
              value={privacy.profileVisibility || "public"}
              onChange={(e) => setOption('profileVisibility', e.target.value)}
              className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
              <option value="public">Public (Everyone can see your profile)</option>
              <option value="followers">Followers Only</option>
              <option value="private">Private (Ghost Mode)</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-900 dark:text-white text-sm font-medium flex items-center gap-2">
              Comment Visibility
            </label>
            <select
              value={privacy.commentVisibility || "public"}
              onChange={(e) => setOption('commentVisibility', e.target.value)}
              className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
              <option value="public">Public (Visible on news articles)</option>
              <option value="followers">Followers Only</option>
              <option value="private">Private (Hidden from everyone)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5 space-y-3">
        <h3 className="text-gray-950 dark:text-white font-semibold text-sm flex items-center gap-2">
          <Database className="w-4 h-4 text-red-500" />
          Data Management
        </h3>
        <button
          onClick={handleExportData}
          disabled={exporting}
          className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-700 dark:text-white/[0.85] hover:text-gray-900 dark:text-white hover:border-white/25 transition-colors text-sm disabled:opacity-50 cursor-pointer"
        >
          {exporting ? (
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
          ) : (
            <Download className="w-4 h-4 text-blue-500 shrink-0" />
          )}
          <div className="flex flex-col items-start">
            <span className="font-medium">Download Your Data</span>
            <span className="text-[10px] text-gray-500 dark:text-white/50">Export a JSON copy of all your Fact Flow activity.</span>
          </div>
        </button>
        <button
          onClick={handleClearHistory}
          disabled={clearing}
          className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-sm disabled:opacity-50 cursor-pointer"
        >
          {clearing ? (
            <Loader2 className="w-4 h-4 text-red-500 animate-spin shrink-0" />
          ) : (
            <Trash2 className="w-4 h-4 shrink-0" />
          )}
          <div className="flex flex-col items-start">
            <span className="font-medium">Clear Reading History</span>
            <span className="text-[10px] opacity-70">Permanently delete your local article history.</span>
          </div>
        </button>
      </div>

      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
        <p className="text-green-600 dark:text-green-400 text-xs font-semibold mb-1 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          Your Data is Protected
        </p>
        <p className="text-gray-600 dark:text-white/[0.85] text-xs leading-relaxed">
          Fact Flow never sells your personal data. All data is encrypted at rest and in transit.
        </p>
      </div>
    </div>
  )
}
