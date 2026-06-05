"use client"
import { useSavedStore } from "@/lib/rss/savedStore"
import { RssNewsCard } from "@/components/frontend/rss/RssNewsCard"
import { Bookmark, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SavedPage() {
  const { savedItems } = useSavedStore()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Saved Articles</h1>
              <p className="text-gray-500 dark:text-zinc-400 text-sm">Read later</p>
            </div>
          </div>
        </div>

        {savedItems.length === 0 ? (
          <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-12 text-center">
            <Bookmark className="w-12 h-12 text-gray-300 dark:text-zinc-700 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No saved articles yet</h2>
            <p className="text-gray-500 dark:text-zinc-400 mb-6 max-w-md mx-auto">
              Articles you save using the bookmark icon will appear here so you can read them later.
            </p>
            <Link href="/" className="inline-flex items-center justify-center px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-full transition-colors">
              Discover News
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedItems.map((item) => (
              <RssNewsCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
