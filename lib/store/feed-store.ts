import { create } from "zustand"
import { persist } from "zustand/middleware"

// Canonical topic IDs used throughout the frontend
const TOPIC_LABEL_TO_ID: Record<string, string> = {
  "Politics": "politics",
  "Trending": "trending",
  "Lifestyle": "lifestyle",
  "Sports": "sports",
  "Tech": "tech",
  "Art": "art",
}

/** Normalize a topic that may be a display label or already an ID into lowercase ID */
function normalizeTopicId(topic: string): string {
  return TOPIC_LABEL_TO_ID[topic] || topic.toLowerCase()
}

interface FeedState {
  followedTopics: string[]
  feedSortOrder: string
  autoPlay: boolean
  setFollowedTopics: (topics: string[]) => void
  setFeedSortOrder: (order: string) => void
  setAutoPlay: (autoPlay: boolean) => void
  initFromBackend: (data: any) => void
}

export const useFeedStore = create<FeedState>()(
  persist(
    (set) => ({
      followedTopics: [],
      feedSortOrder: "latest",
      autoPlay: true,
      
      setFollowedTopics: (topics) => set({ followedTopics: topics }),
      setFeedSortOrder: (order) => set({ feedSortOrder: order }),
      setAutoPlay: (autoPlay) => set({ autoPlay }),
      
      initFromBackend: (data) => {
        if (data) {
          // Normalize topic labels to IDs for consistent filtering
          const rawTopics: string[] = data.followedTopics || []
          const normalizedTopics = rawTopics.map(normalizeTopicId)
          set({
            followedTopics: normalizedTopics,
            feedSortOrder: data.feedSortOrder || "latest",
            autoPlay: data.reels?.autoPlay ?? true
          })
        }
      }
    }),
    {
      name: "ff_feed_preferences",
    }
  )
)
