"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useTheme } from "@/components/theme-provider"
import { useAuthStore } from "@/store/auth-store"
import { Navbar } from "@/components/frontend/navbar"
import { MessageSquare, Grid, Bookmark, Play, Trash2, Plus, CheckCircle, Users, Eye, Sparkles, Globe, Rss, ChevronLeft, Calendar } from "lucide-react"
import { getSavedItems, unsaveItem } from "@/lib/api/saved"
import { toast } from "sonner"
import { CreateMenuSheet } from "@/components/frontend/create-menu-sheet"
import { UploadFlowModal } from "@/components/frontend/upload-flow-modal"
import { EditProfileModal } from "@/components/frontend/settings/edit-profile-modal"
import { StoryViewer } from "@/components/frontend/stories/story-viewer"
import { useSocket } from "@/hooks/use-socket"
import { PostCard } from "@/components/frontend/social/post-card"

export default function PublicProfilePage() {
  const { username } = useParams()
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme !== "light"
  const { user } = useAuthStore()
  
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState<any>({ posts: 0, followers: 0, following: 0 })
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Upload Flow & Edit Profile state
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [uploadType, setUploadType] = useState<"story" | "post" | "shorts">("post")
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)

  // Stories playback state
  const [stories, setStories] = useState<any[]>([])
  const [activeStoryGroup, setActiveStoryGroup] = useState<any[] | null>(null)

  // Followers & Following state
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  // Tabs state
  const [activeTab, setActiveTab] = useState<"activity" | "shorts" | "saved">("activity")
  const [userShorts, setUserShorts] = useState<any[]>([])
  const [loadingShorts, setLoadingShorts] = useState(false)

  // Saved tab state
  const [savedTab, setSavedTab] = useState<"posts" | "videos" | "shorts">("posts")
  const [savedData, setSavedData] = useState<{ posts: any[], videos: string[], shorts: any[] } | null>(null)
  const [fetchingSaved, setFetchingSaved] = useState(false)

  // Socket state
  const { socket } = useSocket()
  const isOwnProfile = Boolean(
    (user?.username && username && user.username.toLowerCase() === (typeof username === 'string' ? username.toLowerCase() : username)) ||
    user?.uid === username ||
    (profile && user?.uid === profile.firebaseUid)
  )
  // Fetch Profile Details
  const fetchProfileDetails = () => {
    const viewerParam = user?.uid ? `?viewerUid=${user.uid}` : ""
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/public/${username}${viewerParam}`)
      .then(res => {
        if (!res.ok) throw new Error("Fetch failed")
        return res.json()
      })
      .then(data => {
        if (data.success && data.user) {
          setProfile(data.user)
          setStats(data.stats)
          setIsFollowing(data.isFollowing || false)
          setPosts(data.posts || [])
        } else {
          setError(true)
        }
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchProfileDetails()
  }, [username, user?.uid])

  // Load active stories
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/stories`)
      .then(res => {
        if (!res.ok) throw new Error("Fetch failed")
        return res.json()
      })
      .then(data => {
        if (data.success && data.data) {
          setStories(data.data)
        }
      })
      .catch(() => {})
  }, [])

  // Socket.io Real-time follow / profile update integration
  useEffect(() => {
    if (!socket || !profile) return

    socket.emit("join_profile", profile._id)

    const handleProfileStatsUpdate = (payload: { followers: number; following: number }) => {
      setStats((prev: any) => ({
        ...prev,
        followers: payload.followers,
        following: payload.following
      }))
    }

    const handleNewPost = (post: any) => {
      if (post.author?._id === profile?._id || post.author?.username === profile?.username) {
        setPosts((prev) => [post, ...prev])
        setStats((prev: any) => ({ ...prev, posts: prev.posts + 1 }))
      }
    }

    const handlePostDeleted = (data: any) => {
      setPosts((prev) => {
        const index = prev.findIndex(p => p._id === data.postId)
        if (index !== -1) {
          setStats((s: any) => ({ ...s, posts: Math.max(0, s.posts - 1) }))
        }
        return prev.filter(p => p._id !== data.postId)
      })
    }

    const handlePostUpdated = (updatedPost: any) => {
      setPosts((prev) => prev.map(p => p._id === updatedPost._id ? { ...p, ...updatedPost } : p))
    }

    socket.on("profile_stats_update", handleProfileStatsUpdate)
    socket.on("new_post", handleNewPost)
    socket.on("post_deleted", handlePostDeleted)
    socket.on("post_updated", handlePostUpdated)

    return () => {
      socket.emit("leave_profile", profile._id)
      socket.off("profile_stats_update", handleProfileStatsUpdate)
      socket.off("new_post", handleNewPost)
      socket.off("post_deleted", handlePostDeleted)
      socket.off("post_updated", handlePostUpdated)
    }
  }, [profile, socket])

  // Fetch saved data when switching to Saved tab
  useEffect(() => {
    if (activeTab === "saved" && !savedData && isOwnProfile && user?.uid) {
      setFetchingSaved(true)
      getSavedItems(user.uid)
        .then(res => {
          if (res.success) setSavedData(res.data)
        })
        .finally(() => setFetchingSaved(false))
    }
  }, [activeTab, isOwnProfile, user?.uid, savedData])

  // Fetch user's uploaded shorts
  useEffect(() => {
    if (activeTab === "shorts" && userShorts.length === 0 && profile) {
      setLoadingShorts(true)
      const queryAuthor = profile.username || profile.name
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/reels?author=${encodeURIComponent(queryAuthor)}`)
        .then(res => {
          if (!res.ok) throw new Error("Fetch failed")
          return res.json()
        })
        .then(data => {
          if (data.success && data.data) {
            setUserShorts(data.data)
          }
        })
        .catch(() => {})
        .finally(() => setLoadingShorts(false))
    }
  }, [activeTab, profile, userShorts.length])



  const handleFollowToggle = async () => {
    if (!user?.uid) {
      toast.error("Please login to follow users!")
      router.push("/login")
      return
    }
    setFollowLoading(true)
    try {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/users/${profile._id}/${isFollowing ? "unfollow" : "follow"}`
      const method = isFollowing ? "DELETE" : "POST"

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ viewerUid: user.uid })
      })

      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      
      if (data.success) {
        setIsFollowing(!isFollowing)
        // Note: The actual follower counts will update immediately via Socket.io `profile_stats_update`
        toast.success(isFollowing ? `Unfollowed @${profile.username}` : `Followed @${profile.username}`)
      } else {
        toast.error(data.error || "Failed to process follow request")
      }
    } catch {
      toast.error("Failed to process follow request")
    } finally {
      setFollowLoading(false)
    }
  }

  const handleUnsave = async (itemId: string, itemType: "post" | "video" | "short", e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user?.uid) return
    
    try {
      await unsaveItem(user.uid, itemId, itemType)
      toast.success("Removed from saved items")
      
      // Optimistic update
      if (savedData) {
        setSavedData({
          ...savedData,
          [itemType + "s"]: itemType === "video" 
            ? savedData.videos.filter(id => id !== itemId)
            : (savedData as any)[itemType + "s"].filter((i: any) => i._id !== itemId)
        })
      }
    } catch (err) {
      toast.error("Failed to remove item")
    }
  }

  return (
    <div className={`min-h-screen ${isDark ? "bg-black text-white" : "bg-white text-gray-900"}`}>
      <Navbar />
      
      <main className="max-w-4xl mx-auto pt-16 pb-16 px-4">
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => router.back()}
            className={`p-2 rounded-xl border flex items-center justify-center transition-all active:scale-95 ${
              isDark 
                ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" 
                : "bg-gray-100 border-gray-200 hover:bg-gray-200 text-black"
            }`}
            title="Go Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className={`text-sm font-bold ${isDark ? "text-white/60" : "text-gray-500"}`}>Back</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : error || !profile ? (
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-4">User not found</h1>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>The link you followed may be broken, or the page may have been removed.</p>
            <button onClick={() => router.push("/")} className="mt-6 px-6 py-2 bg-red-500 text-white font-bold rounded-full">Go Back Home</button>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Futuristic Profile Header Card */}
            <div className={`relative rounded-3xl overflow-hidden border ${isDark ? "bg-white/[0.02] border-white/10" : "bg-gray-50 border-gray-200"} shadow-2xl backdrop-blur-md`}>
              
              {/* Cover Banner */}
              <div className="w-full h-44 sm:h-56 md:h-72 lg:h-80 relative overflow-hidden bg-gradient-to-r from-red-900/40 via-purple-950/40 to-blue-900/40 border-b border-white/5 group">
                {profile.coverImage ? (
                  <img src={profile.coverImage} alt="Cover" className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-600/10 via-transparent to-transparent animate-pulse" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80" />
                {/* Futuristic Grid Effect on banner */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjAzIi8+Cjwvc3ZnPg==')] mix-blend-overlay opacity-30" />
              </div>

              {/* Profile Details Container */}
              <div className="px-4 md:px-6 pb-6 pt-14 md:pt-8 md:pl-52 relative flex flex-col md:flex-row gap-4 md:gap-6 items-start text-left">
                
                {/* Profile Picture Overlaying Banner */}
                <div className="absolute -top-12 left-4 md:left-10 md:-top-20 z-10">
                  <div className="relative w-24 h-24 md:w-36 md:h-36">
                    {(() => {
                      const userStoryGroup = stories.find((g: any) => g.user.username === profile.username)
                      return (
                        <div 
                          onClick={() => {
                            if (userStoryGroup) {
                              setActiveStoryGroup([userStoryGroup])
                            }
                          }}
                          className={`w-full h-full rounded-full flex items-center justify-center text-3xl md:text-4xl font-black text-white shrink-0 transition-transform shadow-xl ${
                            userStoryGroup 
                              ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-fuchsia-600 p-[3px] md:p-[4px] cursor-pointer hover:scale-105" 
                              : "bg-gradient-to-br from-red-500 to-purple-600 p-[2px] md:p-[3px]"
                          }`}
                        >
                          <div className="w-full h-full rounded-full overflow-hidden bg-black border-4 border-black flex items-center justify-center">
                            {profile.avatar ? (
                              <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                            ) : (
                              profile.name.charAt(0).toUpperCase()
                            )}
                          </div>
                        </div>
                      )
                    })()}
                    {isOwnProfile && (
                      <button 
                        onClick={() => setIsMenuOpen(true)}
                        className="absolute bottom-0 right-0 sm:bottom-1 sm:right-1 w-7 h-7 md:w-8 md:h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 md:border-4 border-white dark:border-black hover:scale-110 transition-transform shadow-lg z-20"
                      >
                        <Plus className="w-4 h-4 md:w-5 md:h-5 text-white" strokeWidth={3} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Profile Info details */}
                <div className="flex-1 w-full space-y-3 pt-0 md:pt-0">
                  {/* Mobile Action Buttons (Right Aligned) */}
                  <div className="flex justify-end md:hidden h-10 mb-2">
                      {isOwnProfile ? (
                        <button 
                          onClick={() => setIsEditProfileOpen(true)} 
                          className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-full border transition-all shadow-sm active:scale-95 ${
                            isDark ? "bg-white/10 hover:bg-white/15 border-white/10 text-white" : "bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-900"
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Edit Profile
                        </button>
                      ) : (
                        <button 
                          onClick={handleFollowToggle}
                          disabled={followLoading}
                          className={`px-5 py-1.5 text-xs font-bold rounded-full transition-all shadow-md active:scale-95 flex items-center gap-1.5 ${
                            isFollowing 
                              ? isDark ? "bg-white/5 border border-white/10 text-white hover:bg-white/10" : "bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200" 
                              : "bg-gradient-to-r from-red-600 to-pink-600 text-white hover:opacity-95 shadow-red-500/10"
                          }`}
                        >
                          <Users className="w-3.5 h-3.5" />
                          {isFollowing ? "Following" : "Follow"}
                        </button>
                      )}
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2 md:mt-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-xl md:text-2xl font-black tracking-tight">{profile.name}</h1>
                        {profile.isVerified && (
                          <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-400 fill-blue-400/20" aria-label="Verified Creator" />
                        )}
                        {profile.role === "admin" && (
                          <span className="text-[9px] md:text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 font-bold uppercase tracking-wider">Admin</span>
                        )}
                      </div>
                      <p className="text-red-400 text-xs md:text-sm font-semibold mt-0.5">@{profile.username}</p>
                    </div>

                    {/* Desktop Action Buttons */}
                    <div className="hidden md:flex gap-3 justify-center">
                      {isOwnProfile ? (
                        <button 
                          onClick={() => setIsEditProfileOpen(true)} 
                          className={`flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-xl border transition-all shadow-md active:scale-95 ${
                            isDark ? "bg-white/10 hover:bg-white/15 border-white/10 text-white" : "bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-900"
                          }`}
                        >
                          <Sparkles className="w-4 h-4 text-purple-400" /> Edit Profile
                        </button>
                      ) : (
                        <button 
                          onClick={handleFollowToggle}
                          disabled={followLoading}
                          className={`px-6 py-2 text-sm font-bold rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2 ${
                            isFollowing 
                              ? isDark ? "bg-white/5 border border-white/10 text-white hover:bg-white/10" : "bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200" 
                              : "bg-gradient-to-r from-red-600 to-pink-600 text-white hover:opacity-95 shadow-red-500/10"
                          }`}
                        >
                          <Users className="w-4 h-4" />
                          {isFollowing ? "Following" : "Follow"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Follow stats bar */}
                  <div className={`flex items-center gap-4 md:gap-6 text-sm font-medium p-3 md:p-4 rounded-xl md:rounded-2xl ${isDark ? "bg-white/5 border border-white/10" : "bg-gray-100 border border-gray-200"}`}>
                    <div className="flex flex-col items-center md:items-start">
                      <span className={`font-black text-lg md:text-xl ${isDark ? "text-white" : "text-gray-900"}`}>{stats.posts || 0}</span>
                      <span className={`${isDark ? "text-white/50" : "text-gray-500"} text-[9px] md:text-[10px] uppercase tracking-wider font-bold`}>posts</span>
                    </div>
                    <div className={`w-px h-6 md:h-8 ${isDark ? "bg-white/10" : "bg-gray-300"}`} />
                    <div className="flex flex-col items-center md:items-start">
                      <span className={`font-black text-lg md:text-xl ${isDark ? "text-white" : "text-gray-900"}`}>{stats.followers || 0}</span>
                      <span className={`${isDark ? "text-white/50" : "text-gray-500"} text-[9px] md:text-[10px] uppercase tracking-wider font-bold`}>followers</span>
                    </div>
                    <div className={`w-px h-6 md:h-8 ${isDark ? "bg-white/10" : "bg-gray-300"}`} />
                    <div className="flex flex-col items-center md:items-start">
                      <span className={`font-black text-lg md:text-xl ${isDark ? "text-white" : "text-gray-900"}`}>{stats.following || 0}</span>
                      <span className={`${isDark ? "text-white/50" : "text-gray-500"} text-[9px] md:text-[10px] uppercase tracking-wider font-bold`}>following</span>
                    </div>
                  </div>

                  {/* Bio Description */}
                  <p className="text-sm md:text-[15px] opacity-80 leading-relaxed max-w-xl whitespace-pre-wrap font-medium">
                    {profile.bio || "This user hasn't added a bio yet."}
                  </p>
                  <div className={`flex items-center gap-1.5 text-[11px] md:text-xs font-semibold ${isDark ? "text-white/40" : "text-gray-400"}`}>
                    <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5" /> Joined {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "recently"}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Navigation Tabs (Insta + TikTok styling) */}
            <div className={`flex justify-center border-b ${isDark ? "border-white/10" : "border-gray-200"} pb-1 overflow-x-auto scrollbar-none`}>
              <div className="flex gap-2 sm:gap-6 text-xs font-bold tracking-widest uppercase whitespace-nowrap min-w-max">
                {[
                  { id: "activity", label: "Activity", icon: Grid },
                  { id: "shorts", label: "News Shorts", icon: Play },
                  ...(isOwnProfile ? [{ id: "saved", label: "Saved", icon: Bookmark }] : []),
                ].map(tab => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-3 py-3 border-b-2 transition-colors -mb-[2px] ${
                        isActive 
                          ? "text-red-500 border-red-500" 
                          : isDark ? "text-white/50 border-transparent hover:text-white" : "text-gray-400 border-transparent hover:text-gray-900"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Content Area Switcher */}
            <div className="pt-4">
              
              {/* Activity Tab - User uploaded posts only */}
              {activeTab === "activity" && (
                (() => {
                  const userPosts = posts
                  return userPosts.length > 0 ? (
                    <div className="w-full max-w-[600px] mx-auto py-6">
                      {userPosts.map((post: any) => (
                        <PostCard key={post._id} post={post} isDark={isDark} socket={socket} />
                      ))}
                    </div>
                  ) : (
                    <div className={`text-center py-20 border-2 border-dashed rounded-3xl ${isDark ? "border-white/5" : "border-gray-200"}`}>
                      <MessageSquare className={`w-12 h-12 mx-auto mb-4 ${isDark ? "text-white/20" : "text-gray-300"}`} />
                      <h3 className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>No uploads yet</h3>
                      <p className={`text-sm ${isDark ? "text-white/40" : "text-gray-500"}`}>Posts uploaded from device will appear here.</p>
                    </div>
                  )
                })()
              )}

              {/* News Shorts Tab */}
              {activeTab === "shorts" && (
                loadingShorts ? (
                  <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
                  </div>
                ) : userShorts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-in fade-in duration-300">
                    {userShorts.map(short => (
                      <div 
                        key={short._id} 
                        onClick={() => router.push(`/reels?id=${short._id}`)} 
                        className={`group relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:scale-[1.02] transition-all ${isDark ? "bg-gray-900 border border-white/5" : "bg-gray-100 border border-gray-200"}`}
                      >
                        <img src={short.thumbnailUrl || "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=300&h=500&fit=crop"} alt={short.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                          <h4 className="text-white text-xs font-bold line-clamp-2">{short.title}</h4>
                          <div className="flex items-center gap-1 text-white/70 text-[10px] mt-1">
                            <Play className="w-3 h-3 fill-current" /> {short.views || 0}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                    <div className={`text-center py-20 border-2 border-dashed rounded-3xl ${isDark ? "border-white/5" : "border-gray-200"}`}>
                      <Play className={`w-12 h-12 mx-auto mb-4 ${isDark ? "text-white/20" : "text-gray-300"} text-red-500`} />
                      <h3 className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>No News Shorts uploaded</h3>
                      <p className={`text-sm ${isDark ? "text-white/40" : "text-gray-500"}`}>Videos uploaded by this user will appear here.</p>
                    </div>
                )
              )}

              {/* Saved Tab */}
              {activeTab === "saved" && isOwnProfile && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className={`flex items-center justify-center gap-3 border-b pb-4 ${isDark ? "border-white/5" : "border-gray-200"}`}>
                    {[
                      { id: "posts", label: "Posts" },
                      { id: "shorts", label: "Shorts" }
                    ].map(tab => (
                      <button 
                        key={tab.id}
                        onClick={() => setSavedTab(tab.id as any)}
                        className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${
                          savedTab === tab.id 
                            ? isDark ? "bg-white text-black border-white" : "bg-gray-900 text-white border-gray-900"
                            : isDark ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {fetchingSaved ? (
                    <div className="flex justify-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
                    </div>
                  ) : savedTab === "posts" ? (
                    savedData?.posts.length ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedData.posts.map(post => (
                          <div 
                            key={post._id} 
                            onClick={() => router.push(`/article/${post._id}`)} 
                            className={`group flex flex-col relative cursor-pointer rounded-2xl overflow-hidden p-0 transition-all hover:-translate-y-1 hover:shadow-2xl ${isDark ? "bg-[#111] hover:bg-[#1a1a1a] border border-white/5" : "bg-white hover:bg-gray-50 border border-gray-100 shadow-lg"}`}
                          >
                            <div className="relative w-full aspect-video overflow-hidden bg-black">
                              <img src={post.image} alt={post.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-105 duration-700" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="p-5 flex-1 flex flex-col justify-between">
                              <h3 className="text-[15px] font-black line-clamp-2 leading-snug tracking-tight mb-2 group-hover:text-red-500 transition-colors">{post.title}</h3>
                              <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-white/40" : "text-gray-500"}`}>{post.category || "News"}</p>
                            </div>
                            <button 
                              onClick={(e) => handleUnsave(post._id, "post", e)} 
                              className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-md border border-white/10 hover:bg-red-500 rounded-full text-white shadow-lg transition-colors opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : <EmptyState icon={<Bookmark />} text="No saved articles" isDark={isDark} />
                  ) : (
                    savedData?.shorts.length ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {savedData.shorts.map(short => (
                          <div 
                            key={short._id} 
                            onClick={() => router.push(`/reels?id=${short._id}`)} 
                            className={`group relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer ${isDark ? "bg-gray-900 border border-white/5" : "bg-gray-100 border border-gray-200"}`}
                          >
                            <img src={short.thumbnailUrl} alt={short.title} className="w-full h-full object-cover opacity-80" />
                            <button 
                              onClick={(e) => handleUnsave(short._id, "short", e)} 
                              className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-red-500 rounded-full text-white transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : <EmptyState icon={<Play />} text="No saved shorts" isDark={isDark} />
                  )}
                </div>
              )}

            </div>

          </div>
        )}
      </main>

      {/* Upload Menu Sheet */}
      <CreateMenuSheet 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        isDark={isDark} 
        onSelect={(type) => {
          setUploadType(type)
          setIsUploadOpen(true)
        }} 
      />
      
      {/* Upload flow Modal */}
      <UploadFlowModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        type={uploadType} 
        isDark={isDark} 
      />

      {/* Story Viewer Modal */}
      {activeStoryGroup && (
        <StoryViewer 
          groupedStories={activeStoryGroup} 
          initialGroupIndex={0}
          onClose={() => setActiveStoryGroup(null)} 
        />
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal 
        isOpen={isEditProfileOpen} 
        onClose={() => setIsEditProfileOpen(false)} 
        onSuccess={(updatedFields) => {
          setProfile((prev: any) => ({ ...prev, ...updatedFields }))
          fetchProfileDetails()
          toast.success("Profile updated successfully!")
        }} 
        isDark={isDark} 
      />
    </div>
  )
}

function EmptyState({ icon, text, isDark }: { icon: any, text: string, isDark: boolean }) {
  return (
    <div className={`text-center py-20 border-2 border-dashed rounded-3xl ${isDark ? "border-white/5" : "border-gray-200"}`}>
      <div className={`w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
        <div className={`w-6 h-6 ${isDark ? "text-white/40" : "text-gray-400"}`}>{icon}</div>
      </div>
      <h3 className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>{text}</h3>
      <p className={`text-sm ${isDark ? "text-white/40" : "text-gray-500"}`}>Saved content will appear here.</p>
    </div>
  )
}
