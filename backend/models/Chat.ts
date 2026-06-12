import mongoose, { Schema, Document } from "mongoose"

export interface IChat extends Document {
  participants: mongoose.Types.ObjectId[]
  isGroupChat: boolean
  chatName?: string
  groupAdmin?: mongoose.Types.ObjectId
  latestMessage?: mongoose.Types.ObjectId
  category: string
  status: string
  requestRecipient?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const ChatSchema: Schema = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isGroupChat: { type: Boolean, default: false },
    chatName: { type: String, trim: true },
    groupAdmin: { type: Schema.Types.ObjectId, ref: "User" },
    latestMessage: { type: Schema.Types.ObjectId, ref: "Message" },
    category: { type: String, enum: ["primary", "general"], default: "primary" },
    status: { type: String, enum: ["accepted", "requested"], default: "accepted" },
    requestRecipient: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
)

export const Chat = mongoose.models.Chat || mongoose.model<IChat>("Chat", ChatSchema)
