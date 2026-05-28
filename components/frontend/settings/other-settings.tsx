"use client"

import { Globe, Eye, Accessibility, Volume2 } from "lucide-react"
import { useState } from "react"

function Toggle({ on }: { on: boolean }) {
  return (
    <div className={`relative w-11 h-6 rounded-full cursor-pointer shrink-0 ${on ? "bg-red-500" : "bg-white/15"}`}>
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
export function LanguageSettings() {
  const regions = ["India", "USA", "UK", "Australia", "Canada", "UAE"]
  const languages = ["English", "Hindi", "Marathi", "Tamil", "Telugu", "Bengali", "Gujarati", "Punjabi"]
  const [selectedLang, setSelectedLang] = useState("English")
  const [selectedRegion, setSelectedRegion] = useState("India")

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Language & Region</h2>
        <p className="text-gray-600 dark:text-white/[0.85] text-sm">Choose your preferred language and region for news</p>
      </div>

      <div className="space-y-3">
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm flex items-center gap-2 px-2">
          <Globe className="w-4 h-4 text-red-400" />
          Interface Language
        </h3>
        <div className="neu-radiogroup">
          {languages.map((lang) => (
            <div key={lang} className="neu-wrapper">
              <input
                className="neu-state"
                type="radio"
                name="iface-lang"
                id={`iface-lang-${lang}`}
                value={lang}
                checked={selectedLang === lang}
                onChange={() => setSelectedLang(lang)}
              />
              <label className="neu-label" htmlFor={`iface-lang-${lang}`}>
                <div className="neu-indicator"></div>
                <span className="neu-text">{lang}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm flex items-center gap-2 px-2">
          <Globe className="w-4 h-4 text-red-400" />
          News Region
        </h3>
        <p className="text-gray-600 dark:text-white/[0.85] text-xs px-2">Get news relevant to your region</p>
        <div className="neu-radiogroup">
          {regions.map((r) => (
            <div key={r} className="neu-wrapper">
              <input
                className="neu-state"
                type="radio"
                name="region"
                id={`region-${r}`}
                value={r}
                checked={selectedRegion === r}
                onChange={() => setSelectedRegion(r)}
              />
              <label className="neu-label" htmlFor={`region-${r}`}>
                <div className="neu-indicator"></div>
                <span className="neu-text">{r}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <Section title="Date & Time Format" icon={Globe}>
        {[
          { label: "Date format", options: ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"] },
          { label: "Time format", options: ["12-hour (AM/PM)", "24-hour"] },
        ].map((item) => (
          <div key={item.label}>
            <label className="text-gray-600 dark:text-white/[0.85] text-xs mb-1.5 block">{item.label}</label>
            <select className="w-full px-3 py-2.5 bg-white/8 border border-gray-200 dark:border-white/15 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500">
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
  const blocked = ["Violence", "Political Ads", "Gambling", "Adult Content"]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Content Filters</h2>
        <p className="text-gray-600 dark:text-white/[0.85] text-sm">Control what content you see on Fact Flow</p>
      </div>

      <Section title="Content Restrictions" icon={Eye}>
        {[
          { label: "Safe search", desc: "Filter explicit content from results", on: true },
          { label: "Hide spoilers", desc: "Blur sports results before you watch", on: false },
          { label: "Sensitive news warnings", desc: "Show warning before disturbing content", on: true },
          { label: "Paywalled article indicators", desc: "Mark articles that require paid access", on: true },
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

      <Section title="Blocked Topics" icon={Eye}>
        <p className="text-gray-600 dark:text-white/[0.85] text-xs">These topics will be hidden from your feed</p>
        <div className="flex flex-wrap gap-2">
          {blocked.map((tag) => (
            <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-full font-medium">
              {tag}
              <button className="text-red-400/60 hover:text-red-400 transition-colors">×</button>
            </span>
          ))}
          <button className="px-3 py-1.5 bg-white/8 border border-gray-200 dark:border-white/15 text-gray-600 dark:text-white/[0.85] text-xs rounded-full hover:border-white/30 hover:text-gray-900 dark:text-white transition-colors">
            + Add topic
          </button>
        </div>
      </Section>
    </div>
  )
}

// ─── Accessibility Settings ───────────────────────────────────
export function AccessibilitySettings() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Accessibility</h2>
        <p className="text-gray-600 dark:text-white/[0.85] text-sm">Make Fact Flow easier to use for everyone</p>
      </div>

      <Section title="Visual" icon={Accessibility}>
        {[
          { label: "High contrast mode", desc: "Increase contrast for better readability", on: false },
          { label: "Reduce motion", desc: "Minimize animations and transitions", on: false },
          { label: "Large tap targets", desc: "Make buttons easier to tap on mobile", on: false },
          { label: "Bold text", desc: "Make all text bold", on: false },
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

      <Section title="Text Size" icon={Accessibility}>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600 dark:text-white/[0.85] mb-1">
            <span>Small</span><span>Extra Large</span>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full relative">
            <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full shadow cursor-pointer" />
            <div className="h-full w-1/4 bg-red-500/40 rounded-full" />
          </div>
          <p className="text-gray-600 dark:text-white/[0.85] text-sm mt-2">Preview: <span className="text-gray-900 dark:text-white">Breaking News from India</span></p>
        </div>
      </Section>

      <Section title="Screen Reader" icon={Accessibility}>
        {[
          { label: "Screen reader support", desc: "Optimized for VoiceOver and TalkBack", on: false },
          { label: "Image alt text", desc: "Always show descriptions for images", on: true },
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
