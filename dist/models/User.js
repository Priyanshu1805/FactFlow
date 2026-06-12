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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserSchema = new mongoose_1.Schema({
    firebaseUid: { type: String, index: true },
    username: { type: String, unique: true, sparse: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, minlength: 6 },
    avatar: { type: String },
    coverImage: { type: String, default: "" },
    phone: { type: String, unique: true, sparse: true },
    bio: { type: String, maxlength: 500 },
    role: { type: String, enum: ["admin", "editor", "viewer"], default: "viewer" },
    isVerified: { type: Boolean, default: false },
    verificationStatus: { type: String, enum: ["unverified", "pending", "verified", "rejected"], default: "unverified" },
    twoFactorSecret: { type: String },
    isTwoFactorEnabled: { type: Boolean, default: false },
    backupCodes: [{ type: String }],
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    passwordHistory: [{ type: String }],
    activeSessions: [{
            sessionId: { type: String, required: true },
            ip: { type: String, required: true },
            userAgent: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }],
    deletionScheduledFor: { type: Date },
    isDisabled: { type: Boolean, default: false },
    accountActionReason: { type: String },
    subscriptionTier: { type: String, enum: ["free", "premium", "pro"], default: "free" },
    subscriptionValidUntil: { type: Date },
    paymentMethods: [
        {
            methodId: { type: String, required: true },
            type: { type: String, default: "card" },
            lastFour: { type: String, required: true },
            expiryMonth: { type: Number, required: true },
            expiryYear: { type: Number, required: true },
            cardholderName: { type: String, required: true },
            isDefault: { type: Boolean, default: false },
            addedAt: { type: Date, default: Date.now },
        },
    ],
    plan: {
        type: String,
        enum: ["free", "pro", "premium"],
        default: "free",
    },
    subscriptionId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Subscription",
    },
    newsletter: {
        email: { type: String },
        subscribed: { type: Boolean, default: false },
        preferences: {
            morning: { type: Boolean, default: false },
            breaking: { type: Boolean, default: false },
            weekly: { type: Boolean, default: false },
        },
    },
    followers: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    settings: {
        appearance: {
            theme: { type: String, default: "system" },
            fontSize: { type: String, default: "default" },
            fontStyle: { type: String, default: "sans" },
        },
        notifications: {
            breakingNews: { type: Boolean, default: true },
            trendingStories: { type: Boolean, default: true },
            personalizedUpdates: { type: Boolean, default: true },
            systemAlerts: { type: Boolean, default: true },
            communityInteraction: { type: Boolean, default: true },
            dailyDigest: { type: Boolean, default: true },
            locationBased: { type: Boolean, default: false },
            recommendations: { type: Boolean, default: true },
            emailAlerts: { type: Boolean, default: true },
            pushNotifications: { type: Boolean, default: true },
            newsletter: { type: Boolean, default: false },
        },
        feed: {
            autoplayVideos: { type: Boolean, default: true },
            dataSaver: { type: Boolean, default: false },
        },
        privacy: {
            profileVisibility: { type: String, default: "public" },
            incognitoMode: { type: Boolean, default: false },
            anonymousFactCheck: { type: Boolean, default: false },
            hideLiveStatus: { type: Boolean, default: false },
            blurGraphicImagery: { type: Boolean, default: false },
            commentVisibility: { type: String, enum: ["public", "followers", "private"], default: "public" },
            allowAITraining: { type: Boolean, default: true },
        },
        language: { type: String, default: "en" },
        audio: {
            volume: { type: Number, default: 80 },
        },
        accessibility: {
            highContrast: { type: Boolean, default: false },
            reduceMotion: { type: Boolean, default: false },
            largeTapTargets: { type: Boolean, default: false },
            boldText: { type: Boolean, default: false },
            textSize: { type: Number, default: 100 },
            screenReaderSupport: { type: Boolean, default: false },
            imageAltText: { type: Boolean, default: true },
        },
        content: {
            mutedKeywords: { type: [String], default: [] },
            sensitiveContent: { type: String, enum: ["strict", "standard", "off"], default: "standard" },
            verifiedSourcesOnly: { type: Boolean, default: false },
            filterMisinformation: { type: Boolean, default: true },
            topicPreferences: {
                type: Map,
                of: String,
                default: { sports: "medium", politics: "medium", entertainment: "medium" }
            },
            clickbaitReduction: { type: Boolean, default: false },
            hiddenPublishers: { type: [String], default: [] },
            autoTranslate: { type: Boolean, default: false },
        },
        layout: { type: String, enum: ["compact", "comfortable", "spacious"], default: "comfortable" },
        displayOptions: {
            thumbnails: { type: Boolean, default: true },
            readingTime: { type: Boolean, default: true },
            authorName: { type: Boolean, default: true },
            shareCount: { type: Boolean, default: false },
            reduceAnimations: { type: Boolean, default: false },
        },
    },
    savedItems: [
        {
            itemId: { type: String, required: true },
            itemType: { type: String, enum: ["post", "video", "short", "social_post"], required: true },
            savedAt: { type: Date, default: Date.now },
        },
    ],
}, { timestamps: true });
// Hash password before saving
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password") || !this.password)
        return next();
    this.password = await bcryptjs_1.default.hash(this.password, 12);
    next();
});
// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password)
        return false;
    return bcryptjs_1.default.compare(candidatePassword, this.password);
};
// Never send sensitive fields in JSON responses
UserSchema.set("toJSON", {
    transform: (_doc, ret) => {
        delete ret.password;
        delete ret.twoFactorSecret;
        delete ret.backupCodes;
        delete ret.passwordHistory;
        return ret;
    },
});
exports.User = mongoose_1.default.model("User", UserSchema);
//# sourceMappingURL=User.js.map