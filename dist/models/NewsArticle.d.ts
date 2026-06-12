import mongoose, { Document } from "mongoose";
export interface INewsArticle extends Document {
    title: string;
    excerpt: string;
    content: string;
    category: string;
    image: string;
    author: string;
    publishedAt: Date;
    views: number;
    likes: number;
    comments: number;
    tags: string[];
    isBreaking: boolean;
    isFeatured: boolean;
    isPremium: boolean;
    isSponsored: boolean;
    qualityScore: number;
    isTrending: boolean;
    slug: string;
    source?: string;
    location?: string;
    language?: string;
    aiGenerated: boolean;
    isMisinformation?: boolean;
    isVerifiedSource?: boolean;
    isClickbait?: boolean;
    isSensitive?: boolean;
    viewedByUsers: mongoose.Types.ObjectId[];
    viewedByDevices: string[];
    likedByUsers: mongoose.Types.ObjectId[];
    likedByDevices: string[];
    dislikes: number;
    dislikedByUsers: mongoose.Types.ObjectId[];
    dislikedByDevices: string[];
    sections: string[];
    primarySection: string;
    classifiedBy: string;
    classifiedAt?: Date;
}
export declare const NewsArticle: mongoose.Model<INewsArticle, {}, {}, {}, mongoose.Document<unknown, {}, INewsArticle, {}, {}> & INewsArticle & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=NewsArticle.d.ts.map