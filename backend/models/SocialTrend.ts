import mongoose, { Schema, Document } from "mongoose"

export interface ISocialTrend extends Document {
  topic: string
  mentions: number
  sentiment: "positive" | "negative" | "mixed" | "neutral"
  viral_score: number
  news_worthy: boolean
  reason: string
  hashtags: string[]
  platforms: string[]
  createdAt: Date
}

const SocialTrendSchema: Schema = new Schema(
  {
    topic: { type: String, required: true },
    mentions: { type: Number, default: 0 },
    sentiment: { type: String, enum: ["positive", "negative", "mixed", "neutral"], default: "neutral" },
    viral_score: { type: Number, default: 1 },
    news_worthy: { type: Boolean, default: false },
    reason: { type: String },
    hashtags: { type: [String], default: [] },
    platforms: { type: [String], default: [] },
  },
  { timestamps: true }
)

export const SocialTrend = mongoose.model<ISocialTrend>("SocialTrend", SocialTrendSchema)
