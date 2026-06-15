"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Search, AlertCircle, MoreVertical } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { AccessibleImage as Image } from "@/components/frontend/accessible-image"

function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const { theme } = useTheme()
  const isDark = theme !== "light"

  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchSearch() {
      if (!query) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(false)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/search?q=${encodeURIComponent(query)}`)
        if (!res.ok) throw new Error("Search failed")
        const data = await res.json()
        setResults(data)
      } catch (err) {
        console.error(err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchSearch()
  }, [query])

  if (!query) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[50vh] text-center px-4 ${isDark ? "bg-[#202124]" : "bg-white"}`}>
        <Search className={`w-16 h-16 mb-4 ${isDark ? "text-white/20" : "text-gray-300"}`} />
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
          What are you looking for?
        </h2>
        <p className={isDark ? "text-white/[0.85]" : "text-gray-500"}>
          Type something in the search bar above to explore global news.
        </p>
      </div>
    )
  }

  // Helper to extract domain for URL display
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#202124]" : "bg-white"} pt-4 pb-16`}>
      <div className="max-w-[700px] mx-auto px-4 sm:px-6">
        
        {loading ? (
          <div className="space-y-6 mt-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`p-4 rounded animate-pulse ${isDark ? "bg-[#303134]" : "bg-gray-50"}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-7 h-7 rounded-full ${isDark ? "bg-[#3c4043]" : "bg-gray-200"}`} />
                  <div>
                    <div className={`h-3 rounded w-24 mb-1 ${isDark ? "bg-[#3c4043]" : "bg-gray-200"}`} />
                    <div className={`h-2 rounded w-32 ${isDark ? "bg-[#3c4043]" : "bg-gray-200"}`} />
                  </div>
                </div>
                <div className={`h-5 rounded w-3/4 mb-3 ${isDark ? "bg-[#3c4043]" : "bg-gray-200"}`} />
                <div className={`h-3 rounded w-full mb-1 ${isDark ? "bg-[#3c4043]" : "bg-gray-200"}`} />
                <div className={`h-3 rounded w-5/6 ${isDark ? "bg-[#3c4043]" : "bg-gray-200"}`} />
              </div>
            ))}
          </div>
        ) : error || results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="w-12 h-12 mb-4 text-gray-400" />
            <p className={isDark ? "text-[#bdc1c6]" : "text-gray-600"}>
              Your search - <strong>{query}</strong> - did not match any documents.
            </p>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {results.map((article, index) => {
              const domain = getDomain(article.source)
              return (
                <div key={index} className="flex flex-col py-2">
                  
                  {/* Top Row: Favicon + Source + URL */}
                  <div className="flex items-center justify-between mb-2">
                    <Link href={article.source} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center overflow-hidden shrink-0 ${isDark ? "bg-[#3c4043]" : "bg-gray-100"}`}>
                        {/* Fallback Favicon using Google's Favicon fetcher if image isn't a reliable favicon, but we'll use a generic or domain first letter */}
                        {domain.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-[14px] leading-tight ${isDark ? "text-[#e8eaed]" : "text-[#202124]"}`}>
                          {article.sourceName || domain}
                        </span>
                        <span className={`text-[12px] leading-tight ${isDark ? "text-[#bdc1c6]" : "text-[#4d5156]"}`}>
                          {article.source}
                        </span>
                      </div>
                    </Link>
                    <button className={`p-1 rounded-full ${isDark ? "text-[#bdc1c6] hover:bg-[#303134]" : "text-gray-500 hover:bg-gray-100"}`}>
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Middle Row: Title */}
                  <Link href={article.source} target="_blank" rel="noopener noreferrer" className="group block mb-1">
                    <h3 className={`text-[20px] leading-[1.3] font-normal group-hover:underline ${isDark ? "text-[#8ab4f8]" : "text-[#1a0dab]"}`}>
                      {article.title}
                    </h3>
                  </Link>

                  {/* Bottom Row: Date + Snippet */}
                  <div className={`text-[14px] leading-relaxed break-words ${isDark ? "text-[#bdc1c6]" : "text-[#4d5156]"}`}>
                    <span className={isDark ? "text-[#9aa0a6]" : "text-[#70757a]"}>
                      {new Date(article.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} — 
                    </span>
                    {" "}{article.excerpt}
                  </div>

                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  const { theme } = useTheme()
  const isDark = theme !== "light"
  
  return (
    <main className={`min-h-screen ${isDark ? "bg-[#202124]" : "bg-white"} pt-[70px]`}>
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        </div>
      }>
        <SearchResults />
      </Suspense>
    </main>
  )
}
