"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { PostCard } from "./post-card"
import { Loader2 } from "lucide-react"
import { useSocket } from "@/hooks/use-socket"
import { useAuthStore } from "@/store/auth-store"

interface SocialFeedProps {
  isDark: boolean
}

export function SocialFeed({ isDark }: SocialFeedProps) {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { socket } = useSocket()
  
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return
    if (observerRef.current) observerRef.current.disconnect()
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1)
      }
    })
    
    if (node) observerRef.current.observe(node)
  }, [loading, hasMore])

  useEffect(() => {
    if (!socket) return

    const handleNewPost = (post: any) => setPosts((prev) => [post, ...prev])
    const handlePostDeleted = (data: any) => setPosts((prev) => prev.filter(p => p._id !== data.postId))
    const handlePostUpdated = (updatedPost: any) => setPosts((prev) => prev.map(p => p._id === updatedPost._id ? { ...p, caption: updatedPost.caption, hashtags: updatedPost.hashtags } : p))

    socket.on("new_post", handleNewPost)
    socket.on("post_deleted", handlePostDeleted)
    socket.on("post_updated", handlePostUpdated)

    return () => {
      socket.off("new_post", handleNewPost)
      socket.off("post_deleted", handlePostDeleted)
      socket.off("post_updated", handlePostUpdated)
    }
  }, [socket])

  const { user } = useAuthStore()

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      try {
        const uidParam = user?.uid ? `&firebaseUid=${user.uid}` : ""
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/posts/feed?page=${page}&limit=5${uidParam}`)
        const data = await res.json()
        
        if (data.success) {
          if (data.posts.length === 0) {
            setHasMore(false)
          } else {
            setPosts(prev => {
              // avoid duplicates
              const newPosts = data.posts.filter((p: any) => !prev.find(existing => existing._id === p._id))
              return [...prev, ...newPosts]
            })
          }
        }
      } catch (err) {
        console.error("Failed to fetch posts", err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchPosts()
  }, [page, user?.uid])

  if (loading && page === 1) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className={`w-8 h-8 animate-spin ${isDark ? "text-white" : "text-black"}`} />
      </div>
    )
  }

  return (
    <div className="w-full max-w-[600px] mx-auto py-6">
      {posts.map((post, index) => {
        if (posts.length === index + 1) {
          return (
            <div ref={lastPostElementRef} key={post._id}>
              <PostCard post={post} isDark={isDark} socket={socket} />
            </div>
          )
        } else {
          return <PostCard key={post._id} post={post} isDark={isDark} socket={socket} />
        }
      })}
      
      {loading && page > 1 && (
        <div className="flex justify-center py-4">
          <Loader2 className={`w-6 h-6 animate-spin ${isDark ? "text-white" : "text-black"}`} />
        </div>
      )}
      
      {!hasMore && posts.length > 0 && (
        <p className={`text-center py-8 text-sm ${isDark ? "text-white/50" : "text-gray-500"}`}>
          You've caught up on all posts.
        </p>
      )}
      
      {!loading && posts.length === 0 && (
        <div className={`text-center py-20 ${isDark ? "text-white/50" : "text-gray-500"}`}>
          <div className={`w-24 h-24 mx-auto rounded-full border-2 flex items-center justify-center mb-4 ${isDark ? "border-white/10" : "border-gray-200"}`}>
             <svg viewBox="0 0 24 24" className="w-12 h-12 fill-current opacity-50" aria-label="Camera">
               <circle cx="12" cy="13" r="3.2"/>
               <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
             </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">No Posts Yet</h2>
          <p>Follow users to see their posts here.</p>
        </div>
      )}
    </div>
  )
}
