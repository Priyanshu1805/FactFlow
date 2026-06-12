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
  "Memes": "art",
  "memes": "art",
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
      followedTopics: ["politics", "trending", "lifestyle", "sports", "tech", "art"],
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
          // Ensure that if it has topics, we keep it, otherwise default to all
          const finalTopics = normalizedTopics.length > 0 ? normalizedTopics : ["politics", "trending", "lifestyle", "sports", "tech", "art"]
          set({
            followedTopics: finalTopics,
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
