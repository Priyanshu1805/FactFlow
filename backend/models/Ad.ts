import mongoose, { Document, Schema } from "mongoose"

export interface IAd extends Document {
  title: string
  imageUrl: string
  targetUrl: string
  isActive: boolean
  views: number
  clicks: number
  cpc: number
  cpm: number
  expiresAt?: Date
  createdBy: mongoose.Types.ObjectId
}

const AdSchema = new Schema<IAd>(
  {
    title: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true },
    targetUrl: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    cpc: { type: Number, default: 0 },
    cpm: { type: Number, default: 0 },
    expiresAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
)

// Index for fast lookup of active ads
AdSchema.index({ isActive: 1 })

export const Ad = mongoose.model<IAd>("Ad", AdSchema)
