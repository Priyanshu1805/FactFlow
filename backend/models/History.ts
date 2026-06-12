import mongoose, { Document, Schema } from "mongoose"

export interface IHistory extends Document {
  user: mongoose.Types.ObjectId
  itemId: string
  itemType: "post" | "reel" | "story"
  category: string
  engagement: "viewed" | "liked" | "saved"
  timestamp: Date
}

const HistorySchema = new Schema<IHistory>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    itemId: { type: String, required: true },
    itemType: { type: String, enum: ["post", "reel", "story"], required: true },
    category: { type: String, default: "General" },
    engagement: { type: String, enum: ["viewed", "liked", "saved"], default: "viewed" },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
)

HistorySchema.index({ user: 1, timestamp: -1 })

export const History = mongoose.model<IHistory>("History", HistorySchema)
