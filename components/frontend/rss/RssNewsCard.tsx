"use client"
import { RSSItem } from "@/lib/rss/fetchRSS"
import { useSavedStore } from "@/lib/rss/savedStore"
import { Clock, Bookmark, Share2, Headphones } from "lucide-react"
import Link from "next/link"
import { useVideoSettings } from "@/hooks/useVideoSettings"
import { useTTS } from "@/hooks/useTTS"

export function RssNewsCard({ item, variant = "default" }: { item: RSSItem, variant?: "default" | "compact" | "hero" }) {
  const { saveItem, removeItem, isSaved } = useSavedStore()
  const saved = isSaved(item.id)
  
  const settings = useVideoSettings()
  const { speak, stop, isPlaying } = useTTS(settings?.voiceSpeed || "1x")

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    if (saved) removeItem(item.id)
    else saveItem(item)
  }

  const handleListen = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isPlaying) {
      stop()
    } else {
      speak(`${item.title}. ${item.summary || ""}`)
    }
  }

  const dateStr = new Date(item.published).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })

  if (variant === "hero") {
    return (
      <div className="relative group rounded-2xl overflow-hidden shadow-lg h-full min-h-[400px]">
        {item.image && (
          <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10 flex flex-col justify-end h-full">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full uppercase tracking-wider">
              {item.category}
            </span>
            <span className="text-white/80 text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" /> {dateStr}
            </span>
          </div>
          
          <a href={item.link} target="_blank" rel="noopener noreferrer">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight group-hover:text-red-400 transition-colors">
              {item.title}
            </h2>
          </a>
          
          <p className="text-white/70 line-clamp-2 mb-4 text-sm md:text-base">
            {item.summary}
          </p>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs">
                {item.source.charAt(0)}
              </div>
              <span className="text-white font-medium text-sm">{item.source}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {settings?.enableAudioNews && (
                <button onClick={handleListen} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm group/btn">
                  <Headphones className={`w-4 h-4 ${isPlaying ? "text-blue-400 animate-pulse" : "text-white group-hover/btn:text-blue-300"}`} />
                </button>
              )}
              <button onClick={toggleSave} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm group/btn">
                <Bookmark className={`w-4 h-4 ${saved ? "fill-red-500 text-red-500" : "text-white group-hover/btn:text-red-400"}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`group bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 ${variant === 'compact' ? 'flex h-32' : 'flex flex-col h-full'}`}>
      {item.image && (
        <div className={`relative overflow-hidden ${variant === 'compact' ? 'w-1/3 min-w-[120px]' : 'aspect-video w-full'}`}>
          <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          {variant !== 'compact' && (
            <div className="absolute top-3 left-3 flex gap-2">
              <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-semibold rounded-md">
                {item.category}
              </span>
            </div>
          )}
        </div>
      )}
      
      <div className={`p-4 flex flex-col flex-1 ${variant === 'compact' ? 'justify-between' : ''}`}>
        {variant === 'compact' && (
          <div className="flex items-center justify-between mb-1">
            <span className="text-red-500 text-xs font-bold uppercase tracking-wider">{item.category}</span>
            <button onClick={toggleSave} className="text-gray-400 hover:text-red-500">
              <Bookmark className={`w-4 h-4 ${saved ? "fill-red-500 text-red-500" : ""}`} />
            </button>
          </div>
        )}

        <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex-1">
          <h3 className={`font-bold text-gray-900 dark:text-white group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors ${variant === 'compact' ? 'text-sm line-clamp-2' : 'text-lg mb-2 line-clamp-2'}`}>
            {item.title}
          </h3>
          {variant !== 'compact' && (
            <p className="text-gray-600 dark:text-zinc-400 text-sm line-clamp-2 mb-4">
              {item.summary}
            </p>
          )}
        </a>

        <div className={`flex items-center justify-between text-xs text-gray-500 dark:text-zinc-500 ${variant !== 'compact' ? 'mt-auto pt-4 border-t border-gray-100 dark:border-zinc-800' : ''}`}>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-zinc-300">{item.source}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-zinc-700"></span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {dateStr}
            </span>
          </div>
          
          {variant !== 'compact' && (
            <div className="flex items-center gap-2">
              {settings?.enableAudioNews && (
                <button onClick={handleListen} className="p-2 bg-gray-50 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors group/btn">
                  <Headphones className={`w-4 h-4 ${isPlaying ? "text-blue-500 animate-pulse" : "text-gray-400 group-hover/btn:text-blue-500"}`} />
                </button>
              )}
              <button onClick={toggleSave} className="p-2 bg-gray-50 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors group/btn">
                <Bookmark className={`w-4 h-4 ${saved ? "fill-red-500 text-red-500" : "text-gray-400 group-hover/btn:text-red-500"}`} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
