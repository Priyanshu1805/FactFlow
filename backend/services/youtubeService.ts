import axios from "axios"
import { Reel } from "../models/Reel"

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID

export async function syncYoutubeReels(): Promise<void> {
  if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
    console.warn("⚠️  YouTube credentials not set, skipping sync")
    return
  }

  try {
    // We search for short videos from the channel using the YouTube Data API
    // A common way to find shorts is by querying videos and checking their duration, 
    // or sometimes fetching from the channel's uploads playlist and filtering.
    // For simplicity, we search the channel for videos.
    const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        part: "snippet",
        channelId: YOUTUBE_CHANNEL_ID,
        maxResults: 10,
        order: "date",
        type: "video",
        // 'videoDuration: short' is a valid param in YouTube API
        videoDuration: "short", 
        key: YOUTUBE_API_KEY,
      },
      timeout: 15000,
    })

    const items = response.data.items || []

    for (const item of items) {
      const videoId = item.id.videoId
      if (!videoId) continue

      const exists = await Reel.findOne({ youtubeId: videoId })
      if (exists) continue

      const snippet = item.snippet
      const title = snippet.title
      const description = snippet.description
      // Use YouTube shorts URL
      const videoUrl = `https://www.youtube.com/shorts/${videoId}`
      const thumbnailUrl = snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url

      await Reel.create({
        title: title.slice(0, 200),
        description: description,
        videoUrl: videoUrl,
        thumbnailUrl: thumbnailUrl,
        duration: 60, // Default duration for shorts
        publishedAt: new Date(snippet.publishedAt),
        youtubeId: videoId,
        source: "youtube",
        tags: ["YouTube", "Shorts"],
        author: snippet.channelTitle || "Fact Flow",
      })

      console.log(`✅ Synced YouTube Short: ${videoId}`)
    }
  } catch (error: any) {
    console.error("❌ YouTube sync failed:", error.response?.data || error.message)
  }
}
