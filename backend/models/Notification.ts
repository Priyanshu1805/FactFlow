import mongoose, { Document, Schema } from "mongoose"

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId
  senderId?: mongoose.Types.ObjectId
  senderIds?: mongoose.Types.ObjectId[] // For grouping multiple senders
  type:
    | "mention"
    | "reply"
    | "reaction"
    | "like"
    | "share_post"
    | "follow"
    | "new_article"
    | "system"
    | "message_request"
    | "breaking_news"
    | "trending_story"
    | "personalized_update"
    | "daily_digest"
    | "location_alert"
    | "recommendation"
  articleId?: mongoose.Types.ObjectId
  postId?: mongoose.Types.ObjectId
  commentId?: mongoose.Types.ObjectId
  message?: string       // Human-readable preview text
  link?: string          // Frontend route to navigate to on click
  isRead: boolean
  createdAt: Date
  updatedAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User" },
    senderIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
    type: {
      type: String,
      enum: [
        "mention",
        "reply",
        "reaction",
        "like",
        "share_post",
        "follow",
        "new_article",
        "system",
        "message_request",
        "comment",
        "breaking_news",
        "trending_story",
        "personalized_update",
        "daily_digest",
        "location_alert",
        "recommendation",
      ],
      required: true,
    },
    articleId: { type: Schema.Types.ObjectId, ref: "NewsArticle" },
    postId: { type: Schema.Types.ObjectId, ref: "Post" },
    commentId: { type: Schema.Types.ObjectId, ref: "Comment" },
    message: { type: String },
    link: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
)

NotificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 })

export const Notification = mongoose.model<INotification>("Notification", NotificationSchema)
