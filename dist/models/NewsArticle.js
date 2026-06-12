"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsArticle = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const NewsArticleSchema = new mongoose_1.Schema({
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
    viewedByUsers: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    viewedByDevices: [{ type: String }],
    likedByUsers: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    likedByDevices: [{ type: String }],
    dislikes: { type: Number, default: 0 },
    dislikedByUsers: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    dislikedByDevices: [{ type: String }],
    // === AUTO-CLASSIFICATION FIELDS (added, do not remove existing fields) ===
    sections: { type: [String], default: [] },
    primarySection: { type: String, default: '' },
    classifiedBy: { type: String, enum: ['keyword', 'ai', 'manual', ''], default: '' },
    classifiedAt: { type: Date },
}, { timestamps: true });
// Auto-generate slug from title before save
NewsArticleSchema.pre("save", function (next) {
    if (this.isModified("title")) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .slice(0, 100) + "-" + Date.now();
    }
    next();
});
// Auto-delete articles older than 48 hours (172800 seconds)
NewsArticleSchema.index({ publishedAt: 1 }, { expireAfterSeconds: 172800 });
// Indexes for fast queries
NewsArticleSchema.index({ category: 1, publishedAt: -1 });
NewsArticleSchema.index({ category: 1, location: 1, publishedAt: -1 });
NewsArticleSchema.index({ isTrending: 1, publishedAt: -1 });
NewsArticleSchema.index({ isBreaking: 1 });
NewsArticleSchema.index({ isFeatured: 1 });
NewsArticleSchema.index({ isPremium: 1 });
NewsArticleSchema.index({ tags: 1 });
// Note: slug index is auto-created by unique:true — no duplicate needed
// === AUTO-CLASSIFICATION INDEXES ===
NewsArticleSchema.index({ sections: 1, publishedAt: -1 });
NewsArticleSchema.index({ primarySection: 1, publishedAt: -1 });
exports.NewsArticle = mongoose_1.default.model("NewsArticle", NewsArticleSchema);
//# sourceMappingURL=NewsArticle.js.map