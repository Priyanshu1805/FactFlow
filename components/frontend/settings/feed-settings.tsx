"use client"
import { useState, useEffect } from "react"
import { Rss, Check, ArrowUpDown, Languages } from "lucide-react"
import { useLanguageStore, LangCode, RegionCode } from "@/lib/i18n/languageStore"
import { NEWS_SOURCES } from "@/lib/rss/newsSources"

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

const LANGUAGES: { id: LangCode, label: string }[] = [
  { id: "english", label: "English" },
  { id: "hindi", label: "Hindi" },
  { id: "marathi", label: "Marathi" },
  { id: "tamil", label: "Tamil" },
  { id: "telugu", label: "Telugu" },
  { id: "bengali", label: "Bengali" },
  { id: "gujarati", label: "Gujarati" },
  { id: "punjabi", label: "Punjabi" },
]

const REGIONS: { id: RegionCode, label: string, emoji: string }[] = [
  { id: "india", label: "India", emoji: "🇮🇳" },
  { id: "us", label: "United States", emoji: "🇺🇸" },
  { id: "uk", label: "United Kingdom", emoji: "🇬🇧" },
  { id: "global", label: "Global", emoji: "🌍" }
]

const SORT_OPTIONS = ["Latest First", "Most Popular", "Breaking First", "Personalized"]

export function FeedSettings() {
  const [selected, setSelected] = useState(["breaking", "sports", "technology"])
  const { lang, region, setLang, setRegion, init } = useLanguageStore()
  const [sort, setSort] = useState("Latest First")
  const [autoPlay, setAutoPlay] = useState(true)

  useEffect(() => {
    init()
  }, [init])

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">News Feed Settings</h2>
        <p className="text-gray-600 dark:text-white/[0.85] text-sm">Personalize your news experience across regions and languages</p>
      </div>

      {/* Region Selection */}
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5">
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm mb-1 flex items-center gap-2">
          🌍 Region
        </h3>
        <p className="text-gray-600 dark:text-white/[0.85] text-xs mb-4">Select your primary news region</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {REGIONS.map((r) => {
            const isSelected = region === r.id
            return (
              <button
                key={r.id}
                onClick={() => setRegion(r.id)}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm transition-all duration-300 ${
                  isSelected 
                    ? "border-red-500 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 font-medium" 
                    : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-red-200 hover:bg-gray-50 dark:hover:bg-white/5"
                }`}
              >
                <span className="text-xl">{r.emoji}</span>
                {r.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Languages */}
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5">
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm mb-1 flex items-center gap-2">
          <Languages className="w-4 h-4 text-blue-400" />
          News Language
        </h3>
        <p className="text-gray-600 dark:text-white/[0.85] text-xs mb-4">Select language for news articles</p>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((l) => {
            const isAvailable = NEWS_SOURCES[region]?.[l.id] !== undefined
            const isSelected = lang === l.id

            if (!isAvailable && !isSelected) return null

            return (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                disabled={!isAvailable}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isSelected
                    ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                    : isAvailable 
                      ? "bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
                      : "bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50"
                }`}
              >
                {l.label}
              </button>
            )
          })}
        </div>
        {NEWS_SOURCES[region] && !NEWS_SOURCES[region]?.[lang] && (
          <p className="text-red-500 text-xs mt-3 flex items-center gap-1">
            ⚠️ The selected language is not available for {REGIONS.find(r => r.id === region)?.label}. Falling back to English.
          </p>
        )}
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
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-300 text-left ${
                  isSelected 
                    ? "border-red-500 bg-red-50/50 dark:bg-red-500/10" 
                    : "border-gray-200 dark:border-white/10 hover:border-red-200 hover:bg-gray-50 dark:hover:bg-white/5"
                }`}
              >
                <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center ${
                  isSelected ? "bg-red-500 border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-base">{cat.emoji}</span>
                    <span className={`text-sm font-medium ${isSelected ? "text-red-700 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}>
                      {cat.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-zinc-500 line-clamp-1">{cat.desc}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Display Settings */}
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5">
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm mb-4 flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-purple-400" />
          Feed Preferences
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-600 dark:text-white/[0.85] block mb-2">Default Sorting</label>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSort(opt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    sort === opt
                      ? "bg-gray-900 text-white dark:bg-white dark:text-black"
                      : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/10">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Auto-play Videos</p>
              <p className="text-xs text-gray-500 dark:text-zinc-500">Play news clips automatically</p>
            </div>
            <button 
              onClick={() => setAutoPlay(!autoPlay)}
              className={`w-11 h-6 rounded-full transition-colors relative ${autoPlay ? 'bg-red-500' : 'bg-gray-300 dark:bg-zinc-700'}`}
            >
              <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${autoPlay ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
