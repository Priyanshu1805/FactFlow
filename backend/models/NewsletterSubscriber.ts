import mongoose, { Schema, Document } from "mongoose"

export interface INewsletterSubscriber extends Document {
  email: string
  userId?: mongoose.Types.ObjectId
  subscribedAt: Date
  isActive: boolean
}

const NewsletterSubscriberSchema = new Schema<INewsletterSubscriber>({
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  userId:       { type: Schema.Types.ObjectId, ref: "User", default: null },
  subscribedAt: { type: Date, default: Date.now },
  isActive:     { type: Boolean, default: true },
})

export const NewsletterSubscriber = mongoose.model<INewsletterSubscriber>("NewsletterSubscriber", NewsletterSubscriberSchema)
