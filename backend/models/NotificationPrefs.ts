import mongoose, { Document, Schema } from "mongoose"

export interface INotificationPrefs extends Document {
  userId: mongoose.Types.ObjectId
  pushEnabled: boolean
  pushSubscription?: any
  breakingNews: boolean
  liveUpdates: boolean
  commentReplies: boolean
  mentions: boolean
  dailyDigest: {
    enabled: boolean
    time: "7AM" | "12PM" | "6PM" | "9PM"
  }
  weeklySummary: boolean
  quietHours: {
    enabled: boolean
    from: string
    to: string
  }
}

const NotificationPrefsSchema = new Schema<INotificationPrefs>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    pushEnabled: { type: Boolean, default: false },
    pushSubscription: { type: Schema.Types.Mixed },
    breakingNews: { type: Boolean, default: false },
    liveUpdates: { type: Boolean, default: false },
    commentReplies: { type: Boolean, default: true },
    mentions: { type: Boolean, default: true },
    dailyDigest: {
      enabled: { type: Boolean, default: true },
      time: { type: String, enum: ["7AM", "12PM", "6PM", "9PM"], default: "7AM" },
    },
    weeklySummary: { type: Boolean, default: false },
    quietHours: {
      enabled: { type: Boolean, default: false },
      from: { type: String, default: "22:00" },
      to: { type: String, default: "07:00" },
    }
  },
  { timestamps: true }
)

export const NotificationPrefs = mongoose.model<INotificationPrefs>("NotificationPrefs", NotificationPrefsSchema)
