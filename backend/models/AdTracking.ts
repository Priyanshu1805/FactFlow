import mongoose from "mongoose"

const adTrackingSchema = new mongoose.Schema({
  adId: { type: mongoose.Schema.Types.ObjectId, ref: "Ad", required: true },
  action: { type: String, enum: ["view", "click"], required: true },
  identifier: { type: String, required: true }, // IP address or Firebase UID
}, { timestamps: true })

// Compound index to enforce uniqueness: One specific action per ad per user/IP
adTrackingSchema.index({ adId: 1, action: 1, identifier: 1 }, { unique: true })

export const AdTracking = mongoose.model("AdTracking", adTrackingSchema)
