"use client"

import { Globe, Eye, Accessibility, Volume2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/auth-store"
import { useSettingsStore } from "@/store/settings-store"
import { toast } from "sonner"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

function Toggle({ on, onChange }: { on: boolean; onChange?: (val: boolean) => void }) {
  return (
    <div 
      onClick={() => onChange && onChange(!on)}
      className={`relative w-11 h-6 rounded-full cursor-pointer shrink-0 ${on ? "bg-red-500" : "bg-gray-300 dark:bg-white/15"}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
    </div>
  )
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5 space-y-4">
      <h3 className="text-gray-900 dark:text-white font-semibold text-sm flex items-center gap-2">
        <Icon className="w-4 h-4 text-red-400" />
        {title}
      </h3>
      {children}
    </div>
  )
}

// ─── Content Settings ─────────────────────────────────────────
export function ContentSettings() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [keywordInput, setKeywordInput] = useState("")
  const [publisherInput, setPublisherInput] = useState("")
  
  const [contentPrefs, setContentPrefs] = useState({
    mutedKeywords: [] as string[],
    sensitiveContent: "standard",
    verifiedSourcesOnly: false,
    filterMisinformation: true,
    topicPreferences: { sports: "medium", politics: "medium", entertainment: "medium" } as Record<string, string>,
    clickbaitReduction: false,
    hiddenPublishers: [] as string[],
  })

  useEffect(() => {
    if (!user?.uid) return
    fetch(`${API}/users/settings/${user.uid}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings?.content) {
          setContentPrefs({ ...contentPrefs, ...data.settings.content })
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user])

  const saveSettings = (newPrefs: any) => {
    if (!user?.uid) return
    fetch(`${API}/users/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firebaseUid: user.uid,
        settings: { content: newPrefs }
      })
    })
    .then(res => res.json())
    .then(data => {
      if (!data.success) toast.error("Failed to save settings")
      else toast.success("Settings updated")
    })
    .catch(() => toast.error("Network error while saving"))
  }

  const updatePref = (key: string, value: any) => {
    const newPrefs = { ...contentPrefs, [key]: value }
    setContentPrefs(newPrefs)
    saveSettings(newPrefs)
  }

  const addKeyword = () => {
    if (!keywordInput.trim()) return
    const newKeywords = [...contentPrefs.mutedKeywords, keywordInput.trim()]
    updatePref("mutedKeywords", newKeywords)
    setKeywordInput("")
  }

  const removeKeyword = (kw: string) => {
    updatePref("mutedKeywords", contentPrefs.mutedKeywords.filter(k => k !== kw))
  }

  const addPublisher = () => {
    if (!publisherInput.trim()) return
    const newPubs = [...contentPrefs.hiddenPublishers, publisherInput.trim()]
    updatePref("hiddenPublishers", newPubs)
    setPublisherInput("")
  }

  const removePublisher = (pub: string) => {
    updatePref("hiddenPublishers", contentPrefs.hiddenPublishers.filter(p => p !== pub))
  }


  if (loading) return <div className="animate-pulse h-32 bg-gray-200 dark:bg-white/5 rounded-xl" />

  return (
    <div className="space-y-8 relative">
      {/* Datalists for Suggestions */}
      <datalist id="keyword-suggestions">
        <option value="Violence" />
        <option value="Politics" />
        <option value="Sports" />
        <option value="Clickbait" />
        <option value="Spoilers" />
        <option value="Crypto" />
      </datalist>
      
      <datalist id="publisher-suggestions">
        <option value="CNN" />
        <option value="Fox News" />
        <option value="BBC" />
        <option value="The Verge" />
        <option value="TechCrunch" />
      </datalist>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Content Filters</h2>
          <p className="text-gray-600 dark:text-white/[0.85] text-sm">Control what content you see on Fact Flow</p>
        </div>
      </div>

      <Section title="Content Restrictions" icon={Eye}>
        <div className="flex items-center justify-between gap-4 py-2">
          <div>
            <p className="text-gray-700 dark:text-white/80 text-sm font-medium">Verified Sources Only</p>
            <p className="text-gray-600 dark:text-white/[0.85] text-xs">Only show news from highly rated, verified publishers</p>
          </div>
          <Toggle on={contentPrefs.verifiedSourcesOnly} onChange={(on) => updatePref("verifiedSourcesOnly", on)} />
        </div>
        <div className="flex items-center justify-between gap-4 py-2">
          <div>
            <p className="text-gray-700 dark:text-white/80 text-sm font-medium">Filter Misinformation</p>
            <p className="text-gray-600 dark:text-white/[0.85] text-xs">Hide posts that have been fact-checked as false or misleading</p>
          </div>
          <Toggle on={contentPrefs.filterMisinformation} onChange={(on) => updatePref("filterMisinformation", on)} />
        </div>
        <div className="flex items-center justify-between gap-4 py-2">
          <div>
            <p className="text-gray-700 dark:text-white/80 text-sm font-medium">Clickbait Reduction</p>
            <p className="text-gray-600 dark:text-white/[0.85] text-xs">Filter out overly sensationalized headlines</p>
          </div>
          <Toggle on={contentPrefs.clickbaitReduction} onChange={(on) => updatePref("clickbaitReduction", on)} />
        </div>
      </Section>

      <Section title="Sensitive Content" icon={Eye}>
        <div className="flex items-center gap-4 py-2">
          {["strict", "standard", "off"].map(level => (
            <button
              key={level}
              onClick={() => updatePref("sensitiveContent", level)}
              className={`px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all border ${
                contentPrefs.sensitiveContent === level
                  ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20"
                  : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        <p className="text-gray-600 dark:text-white/[0.85] text-xs">
          {contentPrefs.sensitiveContent === "strict" && "Strict: Blurs or completely hides all potentially sensitive content."}
          {contentPrefs.sensitiveContent === "standard" && "Standard: Shows a warning cover over sensitive media."}
          {contentPrefs.sensitiveContent === "off" && "Off: Displays everything without warnings."}
        </p>
      </Section>

      <Section title="Muted Keywords" icon={Eye}>
        <p className="text-gray-600 dark:text-white/[0.85] text-xs mb-2">Posts containing these words will be hidden</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {contentPrefs.mutedKeywords.map((tag) => (
            <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs rounded-full font-bold">
              {tag}
              <button onClick={() => removeKeyword(tag)} className="text-red-600/60 dark:text-red-400/60 hover:text-red-600 dark:hover:text-red-400 transition-colors">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            list="keyword-suggestions"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addKeyword()}
            placeholder="Add a word to mute..."
            className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/15 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors"
          />
          <button onClick={addKeyword} className="px-5 py-2.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 border border-gray-200 dark:border-white/15 text-gray-800 dark:text-white text-sm rounded-xl transition-colors font-bold shadow-sm">
            Add
          </button>
        </div>
      </Section>

      <Section title="Hidden Publishers" icon={Eye}>
        <p className="text-gray-600 dark:text-white/[0.85] text-xs mb-2">Hide news from specific publishers or users</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {contentPrefs.hiddenPublishers.map((pub) => (
            <span key={pub} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs rounded-full font-bold">
              {pub}
              <button onClick={() => removePublisher(pub)} className="text-blue-600/60 dark:text-blue-400/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            list="publisher-suggestions"
            value={publisherInput}
            onChange={(e) => setPublisherInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addPublisher()}
            placeholder="Publisher username..."
            className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/15 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button onClick={addPublisher} className="px-5 py-2.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 border border-gray-200 dark:border-white/15 text-gray-800 dark:text-white text-sm rounded-xl transition-colors font-bold shadow-sm">
            Add
          </button>
        </div>
      </Section>
    </div>
  )
}

// ─── Accessibility Settings ───────────────────────────────────
export function AccessibilitySettings() {
  const { settings, updateSetting } = useSettingsStore()
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""
  
  const acc = {
    highContrast: settings.accessibility?.highContrast ?? false,
    reduceMotion: settings.accessibility?.reduceMotion ?? false,
    largeTapTargets: settings.accessibility?.largeTapTargets ?? false,
    boldText: settings.accessibility?.boldText ?? false,
    textSize: settings.accessibility?.textSize ?? 100,
    screenReaderSupport: settings.accessibility?.screenReaderSupport ?? false,
    imageAltText: settings.accessibility?.imageAltText ?? true,
  }

  const handleToggle = (key: keyof typeof acc) => {
    updateSetting("accessibility", { [key]: !acc[key] }, token)
  }

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSetting("accessibility", { textSize: parseInt(e.target.value) }, token)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Accessibility</h2>
        <p className="text-gray-600 dark:text-white/[0.85] text-sm">Make Fact Flow easier to use for everyone</p>
      </div>

      <Section title="Visual" icon={Accessibility}>
        {[
          { id: "highContrast", label: "High contrast mode", desc: "Increase contrast for better readability", on: acc.highContrast },
          { id: "reduceMotion", label: "Reduce motion", desc: "Minimize animations and transitions", on: acc.reduceMotion },
          { id: "largeTapTargets", label: "Large tap targets", desc: "Make buttons easier to tap on mobile", on: acc.largeTapTargets },
          { id: "boldText", label: "Bold text", desc: "Make all text bold", on: acc.boldText },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-4">
            <div>
              <p className="text-gray-700 dark:text-white/80 text-sm font-medium">{item.label}</p>
              <p className="text-gray-600 dark:text-white/[0.85] text-xs">{item.desc}</p>
            </div>
            <Toggle on={Boolean(item.on)} onChange={() => handleToggle(item.id as keyof typeof acc)} />
          </div>
        ))}
      </Section>

      <Section title="Text Size" icon={Accessibility}>
        <div className="space-y-4">
          <div className="flex justify-between text-xs text-gray-600 dark:text-white/[0.85] mb-1">
            <span>Small</span><span>Default</span><span>Extra Large</span>
          </div>
          <input 
            type="range" 
            min="80" 
            max="150" 
            step="10" 
            value={acc.textSize} 
            onChange={handleSlider}
            className="w-full accent-red-500"
          />
          <p className="text-gray-600 dark:text-white/[0.85] text-sm mt-2 flex items-center justify-between">
            <span>Preview:</span>
            <span className="text-gray-900 dark:text-white font-medium" style={{ fontSize: `${acc.textSize}%` }}>Breaking News from India</span>
          </p>
        </div>
      </Section>

      <Section title="Screen Reader" icon={Accessibility}>
        {[
          { id: "screenReaderSupport", label: "Screen reader support", desc: "Optimized for VoiceOver and TalkBack", on: acc.screenReaderSupport },
          { id: "imageAltText", label: "Image alt text", desc: "Always show descriptions for images", on: acc.imageAltText },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-4">
            <div>
              <p className="text-gray-700 dark:text-white/80 text-sm font-medium">{item.label}</p>
              <p className="text-gray-600 dark:text-white/[0.85] text-xs">{item.desc}</p>
            </div>
            <Toggle on={Boolean(item.on)} onChange={() => handleToggle(item.id as keyof typeof acc)} />
          </div>
        ))}
      </Section>
    </div>
  )
}

