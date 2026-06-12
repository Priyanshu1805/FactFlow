import mongoose, { Document, Schema } from "mongoose"

export interface IExternalArticle extends Document {
  url: string
  likedBy: string[]
  dislikedBy: string[]
  savedBy: string[]
  shares: number
}

const ExternalArticleSchema = new Schema<IExternalArticle>(
  {
    url: { type: String, required: true, unique: true },
    likedBy: { type: [String], default: [] },
    dislikedBy: { type: [String], default: [] },
    savedBy: { type: [String], default: [] },
    shares: { type: Number, default: 0 }
  },
  { timestamps: true }
)

export const ExternalArticle = mongoose.model<IExternalArticle>("ExternalArticle", ExternalArticleSchema)
