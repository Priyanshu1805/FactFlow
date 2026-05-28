"use client"

import { useState } from "react"
import { Rss, Check, ArrowUpDown, Languages } from "lucide-react"

const CATEGORIES = [
  { id: "breaking", label: "Breaking News", emoji: "🔴", desc: "Urgent news updates" },
  { id: "sports", label: "Sports", emoji: "⚽", desc: "Cricket, football, IPL & more" },
  { id: "entertainment", label: "Entertainment", emoji: "🎬", desc: "Bollywood, Hollywood, OTT" },
  { id: "technology", label: "Technology", emoji: "💻", desc: "AI, gadgets, startups" },
  { id: "crypto", label: "Crypto & Finance", emoji: "💰", desc: "Bitcoin, stocks, markets" },
  { id: "celebrities", label: "Celebrities", emoji: "⭐", desc: "Stars, gossip, events" },
  { id: "science", label: "Science", emoji: "🔬", desc: "Research, space, health" },
  { id: "world", label: "World News", emoji: "🌍", desc: "International headlines" },
  { id: "memes", label: "Memes & Viral", emoji: "😂", desc: "Trending funny content" },
  { id: "politics", label: "Politics", emoji: "🏛️", desc: "Government & policy news" },
]

const LANGUAGES = ["English", "Hindi", "Marathi", "Tamil", "Telugu", "Bengali"]
const SORT_OPTIONS = ["Latest First", "Most Popular", "Breaking First", "Personalized"]

export function FeedSettings() {
  const [selected, setSelected] = useState(["breaking", "sports", "technology"])
  const [language, setLanguage] = useState("English")
  const [sort, setSort] = useState("Latest First")
  const [autoPlay, setAutoPlay] = useState(true)

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">News Feed</h2>
        <p className="text-gray-600 dark:text-white/[0.85] text-sm">Personalize your news experience</p>
      </div>

      {/* Categories */}
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5">
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm mb-1 flex items-center gap-2">
          <Rss className="w-4 h-4 text-red-400" />
          Topics I Follow
        </h3>
        <p className="text-gray-600 dark:text-white/[0.85] text-xs mb-4">Select categories to see in your feed</p>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = selected.includes(cat.id)
            return (
              <button
                key={cat.id}
                onClick={() => toggle(cat.id)}
                className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                  isSelected
                    ? "border-red-500/50 bg-red-500/10"
                    : "border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-white/20"
                }`}
              >
                <span className="text-lg">{cat.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold truncate ${isSelected ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-white/[0.85]"}`}>
                    {cat.label}
                  </p>
                  <p className="text-gray-400 dark:text-white/30 text-xs truncate">{cat.desc}</p>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-red-400 shrink-0" />}
              </button>
            )
          })}
        </div>
        <p className="text-gray-400 dark:text-white/30 text-xs mt-3">{selected.length} of {CATEGORIES.length} topics selected</p>
      </div>

      {/* Sort Order */}
      <div className="space-y-3">
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm flex items-center gap-2 px-2">
          <ArrowUpDown className="w-4 h-4 text-red-400" />
          Feed Sort Order
        </h3>
        <div className="neu-radiogroup">
          {SORT_OPTIONS.map((opt) => (
            <div key={opt} className="neu-wrapper">
              <input
                className="neu-state"
                type="radio"
                name="sort"
                id={`sort-${opt}`}
                value={opt}
                checked={sort === opt}
                onChange={() => setSort(opt)}
              />
              <label className="neu-label" htmlFor={`sort-${opt}`}>
                <div className="neu-indicator"></div>
                <span className="neu-text">{opt}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Language */}
      <div className="space-y-3">
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm flex items-center gap-2 px-2">
          <Languages className="w-4 h-4 text-red-400" />
          News Language
        </h3>
        <div className="neu-radiogroup">
          {LANGUAGES.map((lang) => (
            <div key={lang} className="neu-wrapper">
              <input
                className="neu-state"
                type="radio"
                name="language"
                id={`lang-${lang}`}
                value={lang}
                checked={language === lang}
                onChange={() => setLanguage(lang)}
              />
              <label className="neu-label" htmlFor={`lang-${lang}`}>
                <div className="neu-indicator"></div>
                <span className="neu-text">{lang}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Auto-play Reels */}
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5">
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm mb-4">Reels & Video</h3>
        {[
          { label: "Auto-play reels", desc: "Reels play automatically while scrolling", key: "autoplay" },
          { label: "Auto-play on Wi-Fi only", desc: "Save mobile data", key: "wifi" },
          { label: "Show captions by default", desc: "Display subtitles on videos", key: "captions" },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-4 py-2">
            <div>
              <p className="text-gray-700 dark:text-white/80 text-sm font-medium">{item.label}</p>
              <p className="text-gray-600 dark:text-white/[0.85] text-xs">{item.desc}</p>
            </div>
            <button
              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                item.key === "autoplay" && autoPlay ? "bg-red-500" : "bg-white/15"
              }`}
              onClick={() => item.key === "autoplay" && setAutoPlay(!autoPlay)}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                item.key === "autoplay" && autoPlay ? "translate-x-5" : "translate-x-0.5"
              }`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
