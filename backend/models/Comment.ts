import mongoose, { Document, Schema } from "mongoose"

export interface IComment extends Document {
  articleId?: mongoose.Types.ObjectId
  postId?: mongoose.Types.ObjectId
  parentId?: mongoose.Types.ObjectId
  text: string
  authorName: string
  authorId?: mongoose.Types.ObjectId
  isHidden: boolean
  isDeleted: boolean
  mentions: mongoose.Types.ObjectId[]
  reactions: {
    like: mongoose.Types.ObjectId[]
    love: mongoose.Types.ObjectId[]
    laugh: mongoose.Types.ObjectId[]
  }
  factCheck?: {
    rating: "verified" | "misinformation" | "unverified"
    analysis: string
    requestedBy: string
    requestedAt?: Date
  }
  createdAt: Date
  updatedAt: Date
}

const CommentSchema = new Schema<IComment>(
  {
    articleId: { type: Schema.Types.ObjectId, ref: "NewsArticle" },
    postId: { type: Schema.Types.ObjectId, ref: "Post" },
    parentId: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    authorName: { type: String, required: true, default: "Anonymous" },
    authorId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    isHidden: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    mentions: [{ type: Schema.Types.ObjectId, ref: "User" }],
    reactions: {
      like: [{ type: Schema.Types.ObjectId, ref: "User" }],
      love: [{ type: Schema.Types.ObjectId, ref: "User" }],
      laugh: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
    factCheck: {
      rating: { type: String, enum: ["verified", "misinformation", "unverified"] },
      analysis: { type: String },
      requestedBy: { type: String },
      requestedAt: { type: Date, default: Date.now }
    }
  },
  { timestamps: true }
)

// Index for getting top-level comments and replies
CommentSchema.index({ articleId: 1, parentId: 1, createdAt: -1 })
CommentSchema.index({ authorId: 1 })

export const Comment = mongoose.model<IComment>("Comment", CommentSchema)
