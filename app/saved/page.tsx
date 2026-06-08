"use client"
import { useSavedStore } from "@/lib/rss/savedStore"
import { useAuthStore } from "@/store/auth-store"
import { RssNewsCard } from "@/components/frontend/rss/RssNewsCard"
import { PostCard } from "@/components/frontend/social/post-card"
import { Bookmark, ArrowLeft, Loader2, Play } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getSavedItems } from "@/lib/api/saved"

export default function SavedPage() {
  const { savedItems: localSavedItems } = useSavedStore()
  const { user } = useAuthStore()
  
  const [loading, setLoading] = useState(true)
  const [backendItems, setBackendItems] = useState<{
    posts: any[],
    shorts: any[],
    socialPosts: any[]
  }>({ posts: [], shorts: [], socialPosts: [] })

  useEffect(() => {
    const fetchBackendSaved = async () => {
      if (!user?.uid) {
        setLoading(false)
        return
      }
      try {
        const res = await getSavedItems(user.uid)
        if (res.success && res.data) {
          setBackendItems(res.data)
        }
      } catch (err) {
        console.error("Failed to fetch backend saved items", err)
      } finally {
        setLoading(false)
      }
    }
    fetchBackendSaved()
  }, [user])

  // Convert backend posts to RSSItem format so they can be rendered in RssNewsCard
  const mappedBackendPosts = backendItems.posts.map((post: any) => ({
    id: post._id,
    title: post.title || "",
    link: `/article/${post._id}`,
    source: post.source || "Fact Flow",
    author: "",
    summary: post.excerpt || post.title || "",
    image: post.image || "",
    country: "in",
    language: "en",
    category: post.category || "News",
    published: new Date(post.createdAt)
  }))

  const allArticles = [...localSavedItems, ...mappedBackendPosts]
  
  const hasAnything = allArticles.length > 0 || backendItems.shorts.length > 0 || backendItems.socialPosts.length > 0

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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Saved Items</h1>
              <p className="text-gray-500 dark:text-zinc-400 text-sm">Read later</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          </div>
        ) : !hasAnything ? (
          <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-12 text-center">
            <Bookmark className="w-12 h-12 text-gray-300 dark:text-zinc-700 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No saved items yet</h2>
            <p className="text-gray-500 dark:text-zinc-400 mb-6 max-w-md mx-auto">
              Articles, shorts, and social posts you save using the bookmark icon will appear here so you can view them later.
            </p>
            <Link href="/" className="inline-flex items-center justify-center px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-full transition-colors">
              Discover Content
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* Articles Section */}
            {allArticles.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  Saved Articles <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{allArticles.length}</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allArticles.map((item) => (
                    <RssNewsCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {/* Social Posts Section */}
            {backendItems.socialPosts.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  Saved Social Posts <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">{backendItems.socialPosts.length}</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {backendItems.socialPosts.map((post) => (
                    <PostCard key={post._id} post={post} isDark={true} />
                  ))}
                </div>
              </section>
            )}

            {/* Shorts Section */}
            {backendItems.shorts.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  Saved Shorts <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">{backendItems.shorts.length}</span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {backendItems.shorts.map((short) => (
                    <Link 
                      href="/social" 
                      key={short._id}
                      className="group relative aspect-[9/16] bg-zinc-900 rounded-xl overflow-hidden block"
                    >
                      <img 
                        src={short.thumbnailUrl || (short.source === "youtube" ? `https://i.ytimg.com/vi/${short.youtubeId}/hqdefault.jpg` : "/placeholder.jpg")} 
                        alt={short.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                          <Play className="w-6 h-6 text-white fill-white" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-white text-xs font-medium line-clamp-2">{short.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </div>
  )
}
