"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Heart, MessageCircle, UserPlus, AtSign, Settings, Bell } from "lucide-react"

export function SocialNotificationPanel({ 
  isOpen, 
  onClose, 
  isDark, 
  notifications,
  onMarkRead,
}: { 
  isOpen: boolean
  onClose: () => void
  isDark: boolean
  notifications: any[]
  onMarkRead: (id: string) => void
}) {
  const [filter, setFilter] = useState<"all" | "likes" | "comments" | "follows" | "mentions">("all")

  // Grouping logic for likes/reactions
  const groupedNotifications = useMemo(() => {
    const grouped: any[] = []
    const likeGroups = new Map<string, any>() // key: postId or articleId

    notifications.forEach((n) => {
      // Only group likes and reactions that have a target ID
      const targetId = n.postId?._id || n.articleId?._id || n.postId || n.articleId
      if ((n.type === "like" || n.type === "reaction") && targetId) {
        const key = targetId.toString()
        if (likeGroups.has(key)) {
          const group = likeGroups.get(key)
          group.senders.push(n.senderId)
          group.count += 1
          group.isRead = group.isRead && n.isRead
          group.ids.push(n._id)
        } else {
          const newGroup = {
            _id: `group_${key}`,
            isGroup: true,
            type: "like_group",
            targetId,
            targetItem: n.postId || n.articleId, // to get thumbnail if populated
            senders: [n.senderId],
            count: 1,
            isRead: n.isRead,
            createdAt: n.createdAt,
            ids: [n._id]
          }
          likeGroups.set(key, newGroup)
          grouped.push(newGroup)
        }
      } else {
        grouped.push(n)
      }
    })

    return grouped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [notifications])

  const filteredNotifications = useMemo(() => {
    return groupedNotifications.filter(n => {
      if (filter === "all") return true
      if (filter === "likes" && (n.type === "like" || n.type === "reaction" || n.type === "like_group")) return true
      if (filter === "comments" && (n.type === "comment" || n.type === "reply")) return true
      if (filter === "follows" && n.type === "follow") return true
      if (filter === "mentions" && n.type === "mention") return true
      return false
    })
  }, [groupedNotifications, filter])

  const handleNotificationClick = (n: any) => {
    if (!n.isRead) {
      if (n.isGroup) {
        n.ids.forEach((id: string) => onMarkRead(id))
      } else {
        onMarkRead(n._id)
      }
    }
    // Navigate logic could go here based on n.link or n.postId
  }

  const renderIcon = (type: string) => {
    switch (type) {
      case "like":
      case "like_group": return <div className="p-2 bg-pink-500/10 rounded-full text-pink-500"><Heart className="w-4 h-4 fill-current" /></div>
      case "reaction": return <div className="p-2 bg-yellow-500/10 rounded-full text-yellow-500"><Heart className="w-4 h-4 fill-current" /></div>
      case "comment":
      case "reply": return <div className="p-2 bg-blue-500/10 rounded-full text-blue-500"><MessageCircle className="w-4 h-4 fill-current" /></div>
      case "mention": return <div className="p-2 bg-orange-500/10 rounded-full text-orange-500"><AtSign className="w-4 h-4" /></div>
      case "follow": return <div className="p-2 bg-purple-500/10 rounded-full text-purple-500"><UserPlus className="w-4 h-4" /></div>
      case "system": return <div className="p-2 bg-gray-500/10 rounded-full text-gray-500"><Bell className="w-4 h-4" /></div>
      default: return <div className="p-2 bg-gray-500/10 rounded-full text-gray-500"><Bell className="w-4 h-4" /></div>
    }
  }

  const renderContent = (n: any) => {
    if (n.isGroup) {
      const latestSender = n.senders[0]
      return (
        <>
          <p className="text-sm">
            <span className="font-bold mr-1">{latestSender?.name || "Someone"}</span>
            and {n.count - 1} others liked your post.
          </p>
        </>
      )
    }

    const senderName = n.senderId?.name || n.senderId?.username || "Someone"
    
    switch (n.type) {
      case "like":
        return <p className="text-sm"><span className="font-bold mr-1">{senderName}</span>liked your post.</p>
      case "reaction":
        return <p className="text-sm"><span className="font-bold mr-1">{senderName}</span>reacted {n.message || "🔥"} to your story/reel.</p>
      case "comment":
      case "reply":
        return (
          <div>
            <p className="text-sm"><span className="font-bold mr-1">{senderName}</span>commented:</p>
            <p className={`text-xs mt-0.5 line-clamp-1 ${isDark ? "text-white/60" : "text-gray-500"}`}>"{n.message || "View comment"}"</p>
          </div>
        )
      case "mention":
        return (
          <div>
            <p className="text-sm"><span className="font-bold mr-1">{senderName}</span>mentioned you in a comment.</p>
            <p className={`text-xs mt-0.5 line-clamp-1 italic ${isDark ? "text-white/60" : "text-gray-500"}`}>"{n.message}"</p>
          </div>
        )
      case "follow":
        return <p className="text-sm"><span className="font-bold mr-1">{senderName}</span>started following you.</p>
      case "system":
        return (
          <div className="bg-gray-500/10 p-2 rounded-lg mt-1">
            <p className="text-sm font-semibold">{n.message || "System Update"}</p>
            <p className="text-xs mt-0.5 opacity-80">App updates, promotions, or tips.</p>
          </div>
        )
      default:
        return <p className="text-sm"><span className="font-bold mr-1">{senderName}</span>interacted with your content.</p>
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={onClose} />
          
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className={`relative w-full max-w-md h-full flex flex-col shadow-2xl ${
              isDark ? "bg-[#111111] text-white border-l border-zinc-800" : "bg-white text-gray-900 border-l border-gray-200"
            }`}
          >
            <div className={`p-5 flex items-center justify-between border-b ${isDark ? "border-zinc-800" : "border-gray-200"}`}>
              <h2 className="text-xl font-bold tracking-tight">Activity</h2>
              <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDark ? "hover:bg-zinc-800" : "hover:bg-gray-100"}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filters */}
            <div className={`flex gap-2 p-4 overflow-x-auto scrollbar-hide border-b ${isDark ? "border-zinc-800" : "border-gray-200"}`}>
              {["all", "likes", "comments", "mentions", "follows"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize whitespace-nowrap transition-all ${
                    filter === f 
                      ? (isDark ? "bg-white text-black" : "bg-black text-white")
                      : (isDark ? "bg-zinc-800 text-white/70 hover:bg-zinc-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200")
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? "bg-zinc-800" : "bg-gray-100"}`}>
                    <Heart className={`w-8 h-8 ${isDark ? "text-zinc-600" : "text-gray-400"}`} />
                  </div>
                  <h3 className="font-bold text-lg mb-1">No Activity Yet</h3>
                  <p className={`text-sm ${isDark ? "text-zinc-400" : "text-gray-500"}`}>
                    When someone likes or comments on your posts, it will show up here.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {filteredNotifications.map((n) => (
                    <div 
                      key={n._id}
                      onClick={() => handleNotificationClick(n)}
                      className={`flex items-start gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                        !n.isRead 
                          ? (isDark ? "bg-blue-500/10" : "bg-blue-50") 
                          : (isDark ? "hover:bg-zinc-800/50" : "hover:bg-gray-50")
                      }`}
                    >
                      <div className="relative shrink-0 mt-1">
                        {n.type === "system" ? (
                          <div className={`w-11 h-11 rounded-full flex items-center justify-center ${isDark ? "bg-zinc-800" : "bg-gray-100"}`}>
                            <Settings className="w-5 h-5 text-blue-500" />
                          </div>
                        ) : (
                          <div className="w-11 h-11 rounded-full overflow-hidden bg-zinc-800">
                            {(n.isGroup ? n.senders[0]?.avatar : n.senderId?.avatar) ? (
                              <img src={n.isGroup ? n.senders[0]?.avatar : n.senderId?.avatar} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-lg">
                                {(n.isGroup ? n.senders[0]?.name : n.senderId?.name)?.charAt(0).toUpperCase() || "?"}
                              </div>
                            )}
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 ring-2 ring-white dark:ring-[#111111] rounded-full">
                          {renderIcon(n.type)}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0 pt-1.5">
                        {renderContent(n)}
                        <span className={`text-[11px] mt-1 block ${
                          !n.isRead ? "text-blue-500 font-medium" : (isDark ? "text-white/40" : "text-gray-400")
                        }`}>
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Thumbnail for post-related interactions */}
                      {(n.type === "like" || n.type === "reaction" || n.type === "like_group" || n.type === "comment" || n.type === "reply") && (n.targetItem || n.postId || n.articleId) && (
                        <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-zinc-800 border border-white/10 mt-1">
                          {(n.targetItem?.image || n.targetItem?.thumbnailUrl || n.postId?.image || n.postId?.thumbnailUrl || n.articleId?.image) ? (
                            <img src={n.targetItem?.image || n.targetItem?.thumbnailUrl || n.postId?.image || n.postId?.thumbnailUrl || n.articleId?.image} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-zinc-700" />
                          )}
                        </div>
                      )}

                      {!n.isRead && (
                        <div className="shrink-0 w-2.5 h-2.5 rounded-full bg-blue-500 self-center" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
