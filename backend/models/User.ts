import mongoose, { Document, Schema } from "mongoose"
import bcrypt from "bcryptjs"

export interface IUser extends Document {
  firebaseUid?: string
  username?: string
  name: string
  email: string
  password?: string
  avatar?: string
  coverImage?: string
  phone?: string
  bio?: string
  role: "admin" | "editor" | "viewer"
  isVerified: boolean
  verificationStatus: "unverified" | "pending" | "verified" | "rejected"
  twoFactorSecret?: string
  isTwoFactorEnabled: boolean
  deletionScheduledFor?: Date
  isDisabled: boolean
  accountActionReason?: string
  subscriptionTier?: string
  subscriptionValidUntil?: Date
  paymentMethods?: Array<{
    methodId: string
    type: string
    lastFour: string
    expiryMonth: number
    expiryYear: number
    cardholderName: string
    isDefault: boolean
    addedAt: Date
  }>
  followers?: string[]
  following?: string[]
  settings: {
    appearance: { theme: string; fontSize: string; fontStyle: string }
    feed: { autoplayVideos: boolean; dataSaver: boolean }
    notifications: { 
      breakingNews: boolean
      trendingStories: boolean
      personalizedUpdates: boolean
      systemAlerts: boolean
      communityInteraction: boolean
      dailyDigest: boolean
      locationBased: boolean
      recommendations: boolean
      emailAlerts: boolean
      pushNotifications: boolean
      newsletter: boolean 
    }
    privacy: { 
      profileVisibility: string
      incognitoMode: boolean
      anonymousFactCheck: boolean
      hideLiveStatus: boolean
      blurGraphicImagery: boolean
      commentVisibility: "public" | "followers" | "private"
      allowAITraining: boolean
    }
    language: string
    audio: { volume: number }
    accessibility: { 
      highContrast: boolean; 
      reduceMotion: boolean; 
      largeTapTargets: boolean;
      boldText: boolean;
      textSize: number;
      screenReaderSupport: boolean;
      imageAltText: boolean;
    }
    content: { 
      mutedKeywords: string[]
      sensitiveContent: string
      verifiedSourcesOnly: boolean
      filterMisinformation: boolean
      topicPreferences: Record<string, string>
      clickbaitReduction: boolean
      hiddenPublishers: string[]
      autoTranslate: boolean 
    }
    layout: string
    displayOptions: { thumbnails: boolean; readingTime: boolean; authorName: boolean; shareCount: boolean; reduceAnimations: boolean }
  }
  savedItems: Array<{
    itemId: string
    itemType: "post" | "video" | "short" | "social_post"
    savedAt: Date
  }>
  plan?: "free" | "pro" | "premium"
  subscriptionId?: mongoose.Types.ObjectId
  newsletter?: {
    email?: string
    subscribed: boolean
    preferences: {
      morning: boolean
      breaking: boolean
      weekly: boolean
    }
  }
  passwordHistory?: string[]
  backupCodes?: string[]
  failedLoginAttempts: number
  lockUntil?: Date
  activeSessions: Array<{ sessionId: string; ip: string; userAgent: string; createdAt: Date }>
  createdAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>(
  {
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
    },
    newsletter: {
      email:       { type: String },
      subscribed:  { type: Boolean, default: false },
      preferences: {
        morning:  { type: Boolean, default: false },
        breaking: { type: Boolean, default: false },
        weekly:   { type: Boolean, default: false },
      },
    },
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
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
  },
  { timestamps: true }
)

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false
  return bcrypt.compare(candidatePassword, this.password)
}

// Never send sensitive fields in JSON responses
UserSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete (ret as any).password
    delete (ret as any).twoFactorSecret
    delete (ret as any).backupCodes
    delete (ret as any).passwordHistory
    return ret
  },
})

export const User = mongoose.model<IUser>("User", UserSchema)
