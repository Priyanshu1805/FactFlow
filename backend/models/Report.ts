import mongoose, { Schema, Document } from "mongoose"

export interface IReport extends Document {
  reporterId: mongoose.Types.ObjectId | string
  reportedItemId: mongoose.Types.ObjectId | string
  itemType: "User" | "Comment" | "NewsArticle"
  reason: string
  status: "pending" | "resolved" | "dismissed"
  createdAt: Date
  updatedAt: Date
}

const ReportSchema = new Schema<IReport>(
  {
    reporterId: { type: Schema.Types.Mixed, required: true },
    reportedItemId: { type: Schema.Types.Mixed, required: true },
    itemType: { type: String, enum: ["User", "Comment", "NewsArticle"], required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ["pending", "resolved", "dismissed"], default: "pending" },
  },
  { timestamps: true }
)

export const Report = mongoose.models.Report || mongoose.model<IReport>("Report", ReportSchema)
