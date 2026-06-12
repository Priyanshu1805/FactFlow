import mongoose, { Schema, Document } from "mongoose"

export interface IStory extends Document {
  user: mongoose.Types.ObjectId
  mediaUrl: string
  mediaType: "image" | "video"
  caption?: string
  expiresAt: Date
  createdAt: Date
}

const StorySchema = new Schema<IStory>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  mediaUrl: { type: String, required: true },
  mediaType: { type: String, enum: ["image", "video"], required: true },
  caption: { type: String },
  expiresAt: { 
    type: Date, 
    required: true, 
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) 
  }, // 24 hours from now
  createdAt: { type: Date, default: Date.now },
})

// TTL Index to automatically delete expired stories
StorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const Story = mongoose.model<IStory>("Story", StorySchema)
