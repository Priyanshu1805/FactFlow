"use client"
import { useEffect, useState } from "react"
import { useRssStore } from "@/lib/rss/rssStore"
import { useLanguageStore } from "@/lib/i18n/languageStore"
import { useRegion } from "@/components/providers/region-provider"
import { RssNewsCard } from "./RssNewsCard"
import { Loader2, RefreshCw } from "lucide-react"

export function RssNewsFeed({ limit }: { limit?: number }) {
  const { items, loading, error, fetchNews } = useRssStore()
  const { lang } = useLanguageStore()
  const { region } = useRegion()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchNews(true, region.code)
  }, [lang, region.code, fetchNews])

  if (!mounted) return null

  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-red-500 animate-spin mb-4" />
        <p className="text-gray-500 dark:text-zinc-400">Fetching latest news for {region.name} in {lang}...</p>
      </div>
    )
  }

  if (error && items.length === 0) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-xl text-center border border-red-100 dark:border-red-900/30">
        <p className="mb-4">Failed to load news: {error}</p>
        <button onClick={() => fetchNews(true, region.code)} className="flex items-center gap-2 mx-auto bg-red-100 dark:bg-red-900/40 px-4 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors">
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        No news available for the selected region and language.
      </div>
    )
  }

  const displayItems = limit ? items.slice(0, limit) : items

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayItems.map((item) => (
        <RssNewsCard key={item.id} item={item} />
      ))}
    </div>
  )
}
