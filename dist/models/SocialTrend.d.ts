import mongoose, { Document } from "mongoose";
export interface ISocialTrend extends Document {
    topic: string;
    mentions: number;
    sentiment: "positive" | "negative" | "mixed" | "neutral";
    viral_score: number;
    news_worthy: boolean;
    reason: string;
    hashtags: string[];
    platforms: string[];
    createdAt: Date;
}
export declare const SocialTrend: mongoose.Model<ISocialTrend, {}, {}, {}, mongoose.Document<unknown, {}, ISocialTrend, {}, {}> & ISocialTrend & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=SocialTrend.d.ts.map