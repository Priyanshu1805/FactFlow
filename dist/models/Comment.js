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
exports.Comment = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const CommentSchema = new mongoose_1.Schema({
    articleId: { type: mongoose_1.Schema.Types.ObjectId, ref: "NewsArticle" },
    postId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Post" },
    parentId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Comment", default: null },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    authorName: { type: String, required: true, default: "Anonymous" },
    authorId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", default: null },
    isHidden: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    mentions: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    reactions: {
        like: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
        love: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
        laugh: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    },
    factCheck: {
        rating: { type: String, enum: ["verified", "misinformation", "unverified"] },
        analysis: { type: String },
        requestedBy: { type: String },
        requestedAt: { type: Date, default: Date.now }
    }
}, { timestamps: true });
// Index for getting top-level comments and replies
CommentSchema.index({ articleId: 1, parentId: 1, createdAt: -1 });
CommentSchema.index({ authorId: 1 });
exports.Comment = mongoose_1.default.model("Comment", CommentSchema);
//# sourceMappingURL=Comment.js.map