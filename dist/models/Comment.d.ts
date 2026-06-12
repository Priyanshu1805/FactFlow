import mongoose, { Document } from "mongoose";
export interface IComment extends Document {
    articleId?: mongoose.Types.ObjectId;
    postId?: mongoose.Types.ObjectId;
    parentId?: mongoose.Types.ObjectId;
    text: string;
    authorName: string;
    authorId?: mongoose.Types.ObjectId;
    isHidden: boolean;
    isDeleted: boolean;
    mentions: mongoose.Types.ObjectId[];
    reactions: {
        like: mongoose.Types.ObjectId[];
        love: mongoose.Types.ObjectId[];
        laugh: mongoose.Types.ObjectId[];
    };
    factCheck?: {
        rating: "verified" | "misinformation" | "unverified";
        analysis: string;
        requestedBy: string;
        requestedAt?: Date;
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare const Comment: mongoose.Model<IComment, {}, {}, {}, mongoose.Document<unknown, {}, IComment, {}, {}> & IComment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Comment.d.ts.map