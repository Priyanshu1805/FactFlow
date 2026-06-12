import mongoose, { Document } from "mongoose";
export interface IReel extends Document {
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    duration: number;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    author: string;
    publishedAt: Date;
    tags: string[];
    youtubeId?: string;
    cloudinaryId?: string;
    source: "youtube" | "manual" | "ai_generated";
}
export declare const Reel: mongoose.Model<IReel, {}, {}, {}, mongoose.Document<unknown, {}, IReel, {}, {}> & IReel & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Reel.d.ts.map