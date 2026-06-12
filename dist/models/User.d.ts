import mongoose, { Document } from "mongoose";
export interface IUser extends Document {
    firebaseUid?: string;
    username?: string;
    name: string;
    email: string;
    password?: string;
    avatar?: string;
    coverImage?: string;
    phone?: string;
    bio?: string;
    role: "admin" | "editor" | "viewer";
    isVerified: boolean;
    verificationStatus: "unverified" | "pending" | "verified" | "rejected";
    twoFactorSecret?: string;
    isTwoFactorEnabled: boolean;
    deletionScheduledFor?: Date;
    isDisabled: boolean;
    accountActionReason?: string;
    subscriptionTier?: string;
    subscriptionValidUntil?: Date;
    paymentMethods?: Array<{
        methodId: string;
        type: string;
        lastFour: string;
        expiryMonth: number;
        expiryYear: number;
        cardholderName: string;
        isDefault: boolean;
        addedAt: Date;
    }>;
    followers?: string[];
    following?: string[];
    settings: {
        appearance: {
            theme: string;
            fontSize: string;
            fontStyle: string;
        };
        feed: {
            autoplayVideos: boolean;
            dataSaver: boolean;
        };
        notifications: {
            breakingNews: boolean;
            trendingStories: boolean;
            personalizedUpdates: boolean;
            systemAlerts: boolean;
            communityInteraction: boolean;
            dailyDigest: boolean;
            locationBased: boolean;
            recommendations: boolean;
            emailAlerts: boolean;
            pushNotifications: boolean;
            newsletter: boolean;
        };
        privacy: {
            profileVisibility: string;
            incognitoMode: boolean;
            anonymousFactCheck: boolean;
            hideLiveStatus: boolean;
            blurGraphicImagery: boolean;
            commentVisibility: "public" | "followers" | "private";
            allowAITraining: boolean;
        };
        language: string;
        audio: {
            volume: number;
        };
        accessibility: {
            highContrast: boolean;
            reduceMotion: boolean;
            largeTapTargets: boolean;
            boldText: boolean;
            textSize: number;
            screenReaderSupport: boolean;
            imageAltText: boolean;
        };
        content: {
            mutedKeywords: string[];
            sensitiveContent: string;
            verifiedSourcesOnly: boolean;
            filterMisinformation: boolean;
            topicPreferences: Record<string, string>;
            clickbaitReduction: boolean;
            hiddenPublishers: string[];
            autoTranslate: boolean;
        };
        layout: string;
        displayOptions: {
            thumbnails: boolean;
            readingTime: boolean;
            authorName: boolean;
            shareCount: boolean;
            reduceAnimations: boolean;
        };
    };
    savedItems: Array<{
        itemId: string;
        itemType: "post" | "video" | "short" | "social_post";
        savedAt: Date;
    }>;
    plan?: "free" | "pro" | "premium";
    subscriptionId?: mongoose.Types.ObjectId;
    newsletter?: {
        email?: string;
        subscribed: boolean;
        preferences: {
            morning: boolean;
            breaking: boolean;
            weekly: boolean;
        };
    };
    passwordHistory?: string[];
    backupCodes?: string[];
    failedLoginAttempts: number;
    lockUntil?: Date;
    activeSessions: Array<{
        sessionId: string;
        ip: string;
        userAgent: string;
        createdAt: Date;
    }>;
    createdAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map