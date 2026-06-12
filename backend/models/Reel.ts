import mongoose, { Document, Schema } from "mongoose"

export interface IReel extends Document {
  title: string
  description: string
  videoUrl: string
  thumbnailUrl: string
  duration: number
  views: number
  likes: number
  comments: number
  shares: number
  author: string
  publishedAt: Date
  tags: string[]
  youtubeId?: string
  cloudinaryId?: string
  source: "youtube" | "manual" | "ai_generated"
}

const ReelSchema = new Schema<IReel>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 500 },
    videoUrl: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    duration: { type: Number, required: true }, // seconds
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    author: { type: String, default: "Fact Flow" },
    publishedAt: { type: Date, default: Date.now },
    tags: [{ type: String, trim: true }],
    youtubeId: { type: String, unique: true, sparse: true }, // for YouTube sync
    cloudinaryId: { type: String },
    source: { type: String, enum: ["youtube", "manual", "ai_generated"], default: "manual" },
  },
  { timestamps: true }
)

ReelSchema.index({ publishedAt: -1 })
ReelSchema.index({ views: -1 })
ReelSchema.index({ tags: 1 })

export const Reel = mongoose.model<IReel>("Reel", ReelSchema)
