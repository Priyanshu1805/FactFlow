"use client"
import { useState, useEffect } from "react"
import { Rss, Check, ArrowUpDown, Languages } from "lucide-react"
import { useLanguageStore, useTranslation, LangCode } from "@/lib/i18n/languageStore"
import { useFeedStore } from "@/lib/store/feed-store"
import { NEWS_SOURCES } from "@/lib/rss/newsSources"
import { useAuthStore } from "@/store/auth-store"
import { useRegion } from "@/components/providers/region-provider"
import { toast } from "sonner"

const API = process.env.NEXT_PUBLIC_API_URL || "/api"

const CATEGORIES = [
  { id: "politics", label: "Politics", emoji: "🏛️", desc: "Government & policy news" },
  { id: "trending", label: "Trending", emoji: "🔥", desc: "Most viral and discussed news" },
  { id: "lifestyle", label: "Lifestyle", emoji: "✨", desc: "Health, fashion, travel & life" },
  { id: "sports", label: "Sports", emoji: "⚽", desc: "Cricket, football, IPL & more" },
  { id: "tech", label: "Tech", emoji: "💻", desc: "AI, gadgets, startups" },
  { id: "art", label: "Art", emoji: "🎨", desc: "Global Arts & Culture" },
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





export function FeedSettings() {
  const { user } = useAuthStore()
  const { lang, setLang, init } = useLanguageStore()
  const { t } = useTranslation()
  const { region: globalRegion, setRegion: setGlobalRegion, regions } = useRegion()
  const { setFollowedTopics, initFromBackend } = useFeedStore()
  
  const DEFAULT_TOPICS = CATEGORIES.map(c => c.id)
  const [selected, setSelected] = useState<string[]>(DEFAULT_TOPICS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    init()
  }, [init])

  useEffect(() => {
    if (!user?.uid) return
    const fetchPrefs = async () => {
      try {
        const token = localStorage.getItem("ff_token") || ""
        const res = await fetch(`${API}/newsfeed/prefs?firebaseUid=${user.uid}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success && data.data) {
          // Map backend labels to frontend IDs for local UI state
          const backendTopics = data.data.followedTopics || []
          const mappedIds = backendTopics.map((topic: string) => {
            if (topic.toLowerCase() === "memes") return "art"
            const match = CATEGORIES.find(c => c.label === topic || c.id === topic)
            return match ? match.id : null
          }).filter((id): id is string => id !== null)
          
          const uniqueIds = Array.from(new Set(mappedIds)) as string[]
          const finalIds = uniqueIds.length > 0 ? uniqueIds : DEFAULT_TOPICS
          setSelected(finalIds)
          // initFromBackend normalizes topics to IDs and updates the feed store
          initFromBackend(data.data)
        }
      } catch (err) {
        console.error("Failed to load feed prefs", err)
      } finally {
        setLoading(false)
      }
    }
    fetchPrefs()
  }, [user])

  const savePrefs = async (updates: any) => {
    if (!user?.uid) return
    setSaving(true)
    try {
      const token = localStorage.getItem("ff_token") || ""
      const res = await fetch(`${API}/newsfeed/prefs?firebaseUid=${user.uid}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(updates)
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error("Failed to save")
      toast.success("Preferences updated")
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const toggleCategory = (id: string) => {
    const newSelected = selected.includes(id) 
      ? selected.filter((i) => i !== id) 
      : [...selected, id]
    
    setSelected(newSelected)
    
    // Map IDs back to labels for backend
    const labelsToSave = newSelected.map(sel => CATEGORIES.find(c => c.id === sel)?.label || sel)
    savePrefs({ followedTopics: labelsToSave })
    // Store IDs (not labels) in the feed store so home-page filtering works
    setFollowedTopics(newSelected)
  }


  const handleLangChange = async (l: LangCode) => {
    const label = LANGUAGES.find(x => x.id === l)?.label || "English"
    await savePrefs({ newsLanguages: [label] })
    setLang(l)
  }

  if (loading) {
    return (
      <div className="space-y-8 max-w-2xl animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-white/10 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-2/3 mb-8"></div>
        <div className="h-32 bg-gray-200 dark:bg-white/10 rounded-xl w-full"></div>
        <div className="h-32 bg-gray-200 dark:bg-white/10 rounded-xl w-full"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{t("newsFeedSettings")}</h2>
        <p className="text-gray-600 dark:text-white/[0.85] text-sm">{t("newsFeedDesc")}</p>
      </div>

      {/* Global Region Selector */}
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5">
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm mb-1 flex items-center gap-2">
          {t("globalRegion")}
        </h3>
        <p className="text-gray-600 dark:text-white/[0.85] text-xs mb-4">
          {t("globalRegionDesc")}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {regions.map((r) => {
            const isActive = globalRegion.code === r.code
            return (
              <button
                key={r.code}
                onClick={() => setGlobalRegion(r.code)}
                className={`relative flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 border ${
                  isActive
                    ? "bg-[#3a4a5c] border-[#fc5c65] shadow-[0_0_15px_rgba(252,92,101,0.15)]"
                    : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10"
                }`}
              >
                {isActive && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-[#fc5c65] rounded-full flex items-center justify-center shadow-md">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
                <span className="text-3xl mb-2 drop-shadow-sm">{r.emoji}</span>
                <span className={`font-semibold text-xs text-center ${isActive ? "text-white" : "text-gray-800 dark:text-white/80"}`}>
                  {r.name}
                </span>
                <span className={`text-[10px] mt-0.5 ${isActive ? "text-white/60" : "text-gray-500 dark:text-white/40"}`}>
                  {r.language}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Languages */}
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5">
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm mb-1 flex items-center gap-2">
          <Languages className="w-4 h-4 text-blue-400" />
          {t("newsLanguage")}
        </h3>
        <p className="text-gray-600 dark:text-white/[0.85] text-xs mb-4">{t("newsLanguageDesc")}</p>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((l) => {
            const isAvailable = true // Assuming all languages available since we changed regions
            const isSelected = lang === l.id

            if (!isAvailable && !isSelected) return null

            return (
              <button
                key={l.id}
                onClick={() => handleLangChange(l.id)}
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
      </div>

      {/* Categories */}
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-gray-900 dark:text-white font-semibold text-sm flex items-center gap-2">
            <Rss className="w-4 h-4 text-red-400" />
            {t("topicsIFollow")}
          </h3>
          {saving && <span className="text-xs text-gray-400">{t("saving")}</span>}
        </div>
        <p className="text-gray-600 dark:text-white/[0.85] text-xs mb-4">{t("topicsDesc")}</p>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = selected.includes(cat.id)
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
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


    </div>
  )
}
