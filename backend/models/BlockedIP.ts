import mongoose, { Document, Schema } from "mongoose"

export interface IBlockedIP extends Document {
  ip: string
  reason: string
  blockedAt: Date
  expiresAt?: Date
  isPermanent: boolean
}

const BlockedIPSchema: Schema = new Schema({
  ip: { type: String, required: true, unique: true, index: true },
  reason: { type: String, required: true },
  blockedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  isPermanent: { type: Boolean, default: false }
})

export const BlockedIP = mongoose.models.BlockedIP || mongoose.model<IBlockedIP>("BlockedIP", BlockedIPSchema)
