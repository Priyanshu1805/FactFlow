import mongoose, { Document, Schema } from "mongoose"

export interface INewsArticle extends Document {
  title: string
  excerpt: string
  content: string
  category: string
  image: string
  author: string
  publishedAt: Date
  views: number
  likes: number
  comments: number
  tags: string[]
  isBreaking: boolean
  isFeatured: boolean
  isPremium: boolean
  isSponsored: boolean
  qualityScore: number
  isTrending: boolean
  slug: string
  source?: string
  location?: string
  language?: string
  aiGenerated: boolean
  isMisinformation?: boolean
  isVerifiedSource?: boolean
  isClickbait?: boolean
  isSensitive?: boolean
  viewedByUsers: mongoose.Types.ObjectId[]
  viewedByDevices: string[]
  likedByUsers: mongoose.Types.ObjectId[]
  likedByDevices: string[]
  dislikes: number
  dislikedByUsers: mongoose.Types.ObjectId[]
  dislikedByDevices: string[]
  // === AUTO-CLASSIFICATION FIELDS (added, do not remove existing fields) ===
  sections: string[]
  primarySection: string
  classifiedBy: string
  classifiedAt?: Date
}

const NewsArticleSchema = new Schema<INewsArticle>(
  {
    title: { type: String, required: true, trim: true, maxlength: 300 },
    excerpt: { type: String, required: true, trim: true, maxlength: 600 },
    content: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["Technology", "Tech", "Sports", "Entertainment", "Lifestyle", "Crypto", "World", "Celebrities", "Science", "Memes", "Breaking", "Politics", "Art", "Trending", "Live", "Newspaper"],
    },
    image: { type: String, required: true },
    author: { type: String, default: "Fact Flow Team" },
    publishedAt: { type: Date, default: Date.now },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    tags: [{ type: String, trim: true }],
    isBreaking: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    isSponsored: { type: Boolean, default: false },
    qualityScore: { type: Number, default: 50 },
    isTrending: { type: Boolean, default: false },
    slug: { type: String, unique: true, sparse: true },
    source: { type: String },
    location: { type: String, default: "Global" },
    language: { type: String, default: "english" },
    aiGenerated: { type: Boolean, default: false },
    isMisinformation: { type: Boolean, default: false },
    isVerifiedSource: { type: Boolean, default: true },
    isClickbait: { type: Boolean, default: false },
    isSensitive: { type: Boolean, default: false },
    viewedByUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    viewedByDevices: [{ type: String }],
    likedByUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    likedByDevices: [{ type: String }],
    dislikes: { type: Number, default: 0 },
    dislikedByUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    dislikedByDevices: [{ type: String }],
    // === AUTO-CLASSIFICATION FIELDS (added, do not remove existing fields) ===
    sections: { type: [String], default: [] },
    primarySection: { type: String, default: '' },
    classifiedBy: { type: String, enum: ['keyword', 'ai', 'manual', ''], default: '' },
    classifiedAt: { type: Date },
  },
  { timestamps: true }
)

// Auto-generate slug from title before save
NewsArticleSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 100) + "-" + Date.now()
  }
  next()
})

// Auto-delete articles older than 48 hours (172800 seconds)
NewsArticleSchema.index({ publishedAt: 1 }, { expireAfterSeconds: 172800 })

// Indexes for fast queries
NewsArticleSchema.index({ category: 1, publishedAt: -1 })
NewsArticleSchema.index({ category: 1, location: 1, publishedAt: -1 })
NewsArticleSchema.index({ isTrending: 1, publishedAt: -1 })
NewsArticleSchema.index({ isBreaking: 1 })
NewsArticleSchema.index({ isFeatured: 1 })
NewsArticleSchema.index({ isPremium: 1 })
NewsArticleSchema.index({ tags: 1 })
// Note: slug index is auto-created by unique:true — no duplicate needed

// === AUTO-CLASSIFICATION INDEXES ===
NewsArticleSchema.index({ sections: 1, publishedAt: -1 })
NewsArticleSchema.index({ primarySection: 1, publishedAt: -1 })

export const NewsArticle = mongoose.model<INewsArticle>("NewsArticle", NewsArticleSchema)
