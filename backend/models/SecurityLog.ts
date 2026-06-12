import mongoose, { Document, Schema } from "mongoose"

export interface ISecurityLog extends Document {
  event: string
  userId?: mongoose.Types.ObjectId
  ip: string
  userAgent: string
  timestamp: Date
  severity: "low" | "medium" | "high" | "critical"
  details?: Record<string, any>
}

const SecurityLogSchema: Schema = new Schema({
  event: { type: String, required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  ip: { type: String, required: true, index: true },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now, index: true },
  severity: { type: String, enum: ["low", "medium", "high", "critical"], required: true },
  details: { type: Schema.Types.Mixed }
})

export const SecurityLog = mongoose.models.SecurityLog || mongoose.model<ISecurityLog>("SecurityLog", SecurityLogSchema)
