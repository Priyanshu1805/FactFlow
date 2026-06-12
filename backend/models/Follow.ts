import mongoose, { Document, Schema } from "mongoose"

export interface IFollow extends Document {
  followerId: mongoose.Types.ObjectId
  followingId: mongoose.Types.ObjectId
  createdAt: Date
}

const FollowSchema = new Schema<IFollow>(
  {
    followerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    followingId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

// Prevent duplicate follows (Composite Primary Key alternative)
FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true })

// Indexes to speed up queries for follower and following counts
FollowSchema.index({ followingId: 1 })
FollowSchema.index({ followerId: 1 })

export const Follow = mongoose.model<IFollow>("Follow", FollowSchema)
