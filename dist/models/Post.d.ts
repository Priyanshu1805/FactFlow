import mongoose, { Document } from "mongoose";
export interface IPost extends Document {
    author: mongoose.Types.ObjectId;
    media: Array<{
        url: string;
        type: "image" | "video";
    }>;
    caption: string;
    hashtags: string[];
    location?: string;
    likes: mongoose.Types.ObjectId[];
    commentsCount: number;
    savesCount: number;
    isPinned: boolean;
    hideLikes: boolean;
    commentsDisabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Post: mongoose.Model<IPost, {}, {}, {}, mongoose.Document<unknown, {}, IPost, {}, {}> & IPost & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Post.d.ts.map