import mongoose, { Schema, Document } from "mongoose"

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId
  content: string
  chat: mongoose.Types.ObjectId
  readBy: mongoose.Types.ObjectId[]
  mediaUrl?: string
  mediaType?: "image" | "video"
  createdAt: Date
  updatedAt: Date
}

const MessageSchema: Schema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, trim: true },
    chat: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    mediaUrl: { type: String },
    mediaType: { type: String, enum: ["image", "video"] },
  },
  { timestamps: true }
)

export const Message = mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema)
