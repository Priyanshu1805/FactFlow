import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"
import { useRssStore, RSSItem } from "@/lib/rss/rssStore"

let socketInstance: Socket | null = null

export function useLiveNews(categoryFilter: string) {
  const [newArticlesQueue, setNewArticlesQueue] = useState<RSSItem[]>([])
  const { prependLiveArticles } = useRssStore()

  useEffect(() => {
    if (!socketInstance) {
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      // Assuming socket connects to the root URL derived from API URL
      const socketUrl = url.replace("/api", "")
      
      socketInstance = io(socketUrl, {
        withCredentials: true,
        transports: ["websocket", "polling"],
      })

      socketInstance.on("connect", () => {
        console.log("🟢 [LiveNews] Connected to live news feed")
      })
    }

    const eventName = `news:${categoryFilter.toLowerCase()}`

    const handleNewArticles = (data: { count: number, articles: any[] }) => {
      if (!data.articles || data.articles.length === 0) return

      const formattedArticles: RSSItem[] = data.articles.map(item => ({
        id: item._id || Math.random().toString(),
        title: item.title,
        link: item.sourceUrl || `/article/${item._id}`,
        source: item.source || "FactFlow Live",
        author: item.author || "FactFlow",
        summary: item.excerpt || item.content || "",
        image: item.image || item.imageUrl || "",
        country: item.location || "GLOBAL",
        language: item.language || "english",
        category: item.category || "General",
        published: new Date(item.publishedAt || Date.now()),
        isPremium: item.isPremium || false
      }))

      setNewArticlesQueue(prev => [...formattedArticles, ...prev])
    }

    // Listen to the specific category event
    socketInstance.on(eventName, handleNewArticles)

    return () => {
      socketInstance?.off(eventName, handleNewArticles)
    }
  }, [categoryFilter])

  // Call this function to flush the queue into the actual RSS store (e.g. when user clicks the banner)
  const applyLiveUpdates = () => {
    if (newArticlesQueue.length > 0) {
      prependLiveArticles(newArticlesQueue)
      setNewArticlesQueue([]) // Clear queue
    }
  }

  return {
    newCount: newArticlesQueue.length,
    applyLiveUpdates
  }
}
