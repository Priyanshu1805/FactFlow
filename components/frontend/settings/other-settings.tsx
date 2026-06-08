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

// ─── Language Settings ────────────────────────────────────────
import { useLanguageStore, type LangCode, type RegionCode } from "@/lib/i18n/languageStore"

const LANG_OPTIONS: { code: LangCode; native: string; english: string; flag: string }[] = [
  { code: "english", native: "English", english: "English", flag: "🇬🇧" },
  { code: "hindi", native: "हिन्दी", english: "Hindi", flag: "🇮🇳" },
  { code: "marathi", native: "मराठी", english: "Marathi", flag: "🇮🇳" },
  { code: "tamil", native: "தமிழ்", english: "Tamil", flag: "🇮🇳" },
  { code: "telugu", native: "తెలుగు", english: "Telugu", flag: "🇮🇳" },
  { code: "bengali", native: "বাংলা", english: "Bengali", flag: "🇮🇳" },
  { code: "gujarati", native: "ગુજરાતી", english: "Gujarati", flag: "🇮🇳" },
  { code: "punjabi", native: "ਪੰਜਾਬੀ", english: "Punjabi", flag: "🇮🇳" },
]

const REGION_OPTIONS: { value: RegionCode; label: string; flag: string }[] = [
  { value: "india", label: "India", flag: "🇮🇳" },
  { value: "us", label: "USA", flag: "🇺🇸" },
  { value: "uk", label: "UK", flag: "🇬🇧" },
  { value: "global", label: "Global", flag: "🌍" },
]

export function LanguageSettings() {
  const { lang, region, setLang, setRegion } = useLanguageStore()

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Language & Region</h2>
        <p className="text-gray-600 dark:text-white/60 text-sm">Choose your preferred language and region for news</p>
      </div>

      {/* Interface Language */}
      <Section title="Interface Language" icon={Globe}>
        <p className="text-gray-500 dark:text-white/50 text-xs mb-3">
          This changes the interface and news content language
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {LANG_OPTIONS.map((l) => {
            const isSelected = lang === l.code
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => setLang(l.code)}
                className={`relative flex items-center gap-2.5 px-3 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  isSelected
                    ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20"
                    : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-white/25 hover:bg-gray-100 dark:hover:bg-white/8"
                }`}
              >
                <span className="text-base">{l.flag}</span>
                <div className="flex flex-col items-start min-w-0">
                  <span className="font-semibold truncate leading-tight">{l.native}</span>
                  {l.code !== "english" && (
                    <span className={`text-[10px] leading-tight ${isSelected ? "text-white/70" : "text-gray-400 dark:text-white/40"}`}>
                      {l.english}
                    </span>
                  )}
                </div>
                {isSelected && (
                  <svg className="w-3.5 h-3.5 shrink-0 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
        {lang !== "english" && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 dark:text-green-400 text-xs">
            <span>✓</span>
            <span>News content will also update to {LANG_OPTIONS.find(l => l.code === lang)?.english || lang}</span>
          </div>
        )}
      </Section>

      {/* News Region */}
      <Section title="News Region" icon={Globe}>
        <p className="text-gray-500 dark:text-white/50 text-xs mb-3">Get news relevant to your region</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {REGION_OPTIONS.map((r) => {
            const isSelected = region === r.value
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => setRegion(r.value)}
                className={`flex items-center gap-2.5 px-3 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  isSelected
                    ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20"
                    : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-white/25 hover:bg-gray-100 dark:hover:bg-white/8"
                }`}
              >
                <span className="text-lg">{r.flag}</span>
                <span>{r.label}</span>
                {isSelected && (
                  <svg className="w-3.5 h-3.5 shrink-0 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      </Section>

      {/* Date & Time Format */}
      <Section title="Date & Time Format" icon={Globe}>
        {[
          { label: "Date format", options: ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"] },
          { label: "Time format", options: ["12-hour (AM/PM)", "24-hour"] },
        ].map((item) => (
          <div key={item.label}>
            <label className="text-gray-600 dark:text-white/60 text-xs mb-1.5 block">{item.label}</label>
            <select className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/15 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500 transition-colors">
              {item.options.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </Section>
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

// ─── Audio & Video Settings ───────────────────────────────────
export function AudioSettings() {
  const [videoQuality, setVideoQuality] = useState("Auto")

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Audio & Video</h2>
        <p className="text-gray-600 dark:text-white/[0.85] text-sm">Control how media plays on Fact Flow</p>
      </div>

      <Section title="Video Playback" icon={Volume2}>
        {[
          { label: "Auto-play videos", desc: "Videos play automatically as you scroll", on: true },
          { label: "Auto-play on Wi-Fi only", desc: "Save mobile data usage", on: true },
          { label: "Mute videos by default", desc: "Videos start without sound", on: true },
          { label: "Show subtitles/captions", desc: "Display captions on all videos", on: false },
          { label: "HD quality on Wi-Fi", desc: "Play highest quality on Wi-Fi", on: true },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-4">
            <div>
              <p className="text-gray-700 dark:text-white/80 text-sm font-medium">{item.label}</p>
              <p className="text-gray-600 dark:text-white/[0.85] text-xs">{item.desc}</p>
            </div>
            <Toggle on={item.on} />
          </div>
        ))}
      </Section>

      <div className="space-y-3">
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm flex items-center gap-2 px-2">
          <Volume2 className="w-4 h-4 text-red-400" />
          Video Quality
        </h3>
        <p className="text-gray-600 dark:text-white/[0.85] text-xs px-2">Default quality for reel playback</p>
        <div className="neu-radiogroup">
          {["Auto", "360p", "720p", "1080p"].map((q) => (
            <div key={q} className="neu-wrapper">
              <input
                className="neu-state"
                type="radio"
                name="video-quality"
                id={`vq-${q}`}
                value={q}
                checked={videoQuality === q}
                onChange={() => setVideoQuality(q)}
              />
              <label className="neu-label" htmlFor={`vq-${q}`}>
                <div className="neu-indicator"></div>
                <span className="neu-text">{q}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <Section title="Audio News (TTS)" icon={Volume2}>
        <p className="text-gray-600 dark:text-white/[0.85] text-xs mb-1">Listen to articles read aloud</p>
        {[
          { label: "Enable Audio News", desc: "Read articles aloud using text-to-speech", on: false },
          { label: "Background audio", desc: "Continue playing when app is minimized", on: false },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-4">
            <div>
              <p className="text-gray-700 dark:text-white/80 text-sm font-medium">{item.label}</p>
              <p className="text-gray-600 dark:text-white/[0.85] text-xs">{item.desc}</p>
            </div>
            <Toggle on={item.on} />
          </div>
        ))}
        <div>
          <label className="text-gray-600 dark:text-white/[0.85] text-xs mb-1.5 block">Voice Speed</label>
          <select className="w-full px-3 py-2.5 bg-white/8 border border-gray-200 dark:border-white/15 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500">
            {["0.75x — Slow", "1x — Normal", "1.25x — Fast", "1.5x — Very Fast"].map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
      </Section>
    </div>
  )
}
