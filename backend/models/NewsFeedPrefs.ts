import mongoose, { Document, Schema } from "mongoose"

export interface INewsFeedPrefs extends Document {
  userId: mongoose.Types.ObjectId
  followedTopics: string[]
  feedSortOrder: "latest" | "trending" | "oldest"
  newsLanguages: string[]
  reels: {
    autoPlay: boolean
    wifiOnly: boolean
    captions: boolean
  }
  saved: {
    offlineReading: boolean
    autoRemove: boolean
    autoRemoveDays: number
  }
}

const NewsFeedPrefsSchema = new Schema<INewsFeedPrefs>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    followedTopics: { type: [String], default: ["politics", "trending", "lifestyle", "sports", "tech", "art"] },
    feedSortOrder: { type: String, enum: ["latest", "trending", "oldest"], default: "latest" },
    newsLanguages: { type: [String], default: ["English"] },
    reels: {
      autoPlay: { type: Boolean, default: true },
      wifiOnly: { type: Boolean, default: false },
      captions: { type: Boolean, default: false },
    },
    saved: {
      offlineReading: { type: Boolean, default: false },
      autoRemove: { type: Boolean, default: false },
      autoRemoveDays: { type: Number, default: 30 },
    },
  },
  { timestamps: true }
)

export const NewsFeedPrefs = mongoose.model<INewsFeedPrefs>("NewsFeedPrefs", NewsFeedPrefsSchema)
