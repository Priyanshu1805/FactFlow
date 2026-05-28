"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuthStore } from "@/store/auth-store"
import { Plus } from "lucide-react"

interface StoryTrayProps {
  onStoryClick: (userStories: any, index: number) => void
  onAddStoryClick?: () => void
}

export function StoryTray({ onStoryClick, onAddStoryClick }: StoryTrayProps) {
  const [groupedStories, setGroupedStories] = useState<any[]>([])
  const { user } = useAuthStore()

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/stories`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setGroupedStories(data.data)
      })
      .catch(err => console.error("Failed to fetch stories", err))
  }, [])

  // Find if current logged-in user has active stories
  const userStoryGroup = user
    ? groupedStories.find(g => g.user.username === (user as any).username || (user.displayName && g.user.name === user.displayName))
    : null

  const otherGroups = user
    ? groupedStories.filter(g => g.user.username !== (user as any).username && (user.displayName ? g.user.name !== user.displayName : true))
    : groupedStories

  const playbackGroups = userStoryGroup ? [userStoryGroup, ...otherGroups] : otherGroups

  return (
    <div className="w-full bg-transparent overflow-x-auto scrollbar-hide py-4 px-4 border-b border-white/5">
      <div className="flex gap-4">
        
        {/* User's Bubble (Your Story) */}
        {user && (
          userStoryGroup ? (
            /* User HAS active stories */
            <div className="flex flex-col items-center gap-1 shrink-0 w-16">
              <div className="w-16 h-16 relative">
                <div 
                  onClick={() => onStoryClick(playbackGroups, 0)}
                  className="w-full h-full rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-fuchsia-600 p-[2.5px] hover:scale-105 transition-transform cursor-pointer"
                >
                  <div className="w-full h-full rounded-full border-2 border-black overflow-hidden bg-black flex items-center justify-center">
                    {user.photoURL ? (
                      <img src={user.photoURL} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold">{user.displayName?.charAt(0) || "U"}</span>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-xs font-medium truncate w-16 text-center dark:text-white/80">Your Story</span>
            </div>
          ) : (
            /* User does NOT have active stories */
            <div 
              onClick={onAddStoryClick}
              className="flex flex-col items-center gap-1 shrink-0 w-16 cursor-pointer"
            >
              <div className="w-16 h-16 relative hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full bg-gray-200 dark:bg-white/10 p-0.5 overflow-hidden flex items-center justify-center">
                   {user.photoURL ? (
                     <img src={user.photoURL} className="w-full h-full rounded-full object-cover border-2 border-transparent" />
                   ) : (
                     <span className="text-xl font-bold dark:text-white/50">{user.displayName?.charAt(0) || "U"}</span>
                   )}
                </div>
                <div className="absolute bottom-0 right-0 z-10 w-5 h-5 bg-blue-500 rounded-full border-2 border-black flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                </div>
             </div>
              <span className="text-xs font-medium truncate w-16 text-center dark:text-white/80">Your Story</span>
            </div>
          )
        )}

        {/* Other Users' Stories */}
        {otherGroups.map((group, idx) => {
          const playbackIndex = userStoryGroup ? idx + 1 : idx
          return (
            <motion.div 
              key={group.user._id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onStoryClick(playbackGroups, playbackIndex)}
              className="flex flex-col items-center gap-1 shrink-0 w-16 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-fuchsia-600 p-[2.5px] hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full border-2 border-black overflow-hidden bg-black flex items-center justify-center">
                  {group.user.avatar ? (
                    <img src={group.user.avatar} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold">{group.user.username?.charAt(0) || group.user.name?.charAt(0) || "U"}</span>
                  )}
                </div>
              </div>
              <span className="text-xs font-medium truncate w-16 text-center dark:text-white/80">
                {group.user.username || group.user.name.split(" ")[0]}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
