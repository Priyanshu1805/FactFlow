import mongoose, { Document, Schema } from "mongoose"

export interface IPost extends Document {
  author: mongoose.Types.ObjectId
  media: Array<{
    url: string
    type: "image" | "video"
  }>
  caption: string
  hashtags: string[]
  location?: string
  likes: mongoose.Types.ObjectId[]
  commentsCount: number
  savesCount: number
  isPinned: boolean
  hideLikes: boolean
  commentsDisabled: boolean
  createdAt: Date
  updatedAt: Date
}

const PostSchema = new Schema<IPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    media: [
      {
        url: { type: String, required: true },
        type: { type: String, enum: ["image", "video"], required: true },
      },
    ],
    caption: { type: String, default: "", maxlength: 2200 },
    hashtags: [{ type: String, trim: true }],
    location: { type: String },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    commentsCount: { type: Number, default: 0 },
    savesCount: { type: Number, default: 0 },
    isPinned: { type: Boolean, default: false },
    hideLikes: { type: Boolean, default: false },
    commentsDisabled: { type: Boolean, default: false },
  },
  { timestamps: true }
)

// Indexes for feed querying
PostSchema.index({ createdAt: -1 })
PostSchema.index({ author: 1, createdAt: -1 })
PostSchema.index({ hashtags: 1 })

export const Post = mongoose.model<IPost>("Post", PostSchema)
