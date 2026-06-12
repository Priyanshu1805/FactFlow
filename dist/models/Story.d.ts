import mongoose, { Document } from "mongoose";
export interface IStory extends Document {
    user: mongoose.Types.ObjectId;
    mediaUrl: string;
    mediaType: "image" | "video";
    caption?: string;
    expiresAt: Date;
    createdAt: Date;
}
export declare const Story: mongoose.Model<IStory, {}, {}, {}, mongoose.Document<unknown, {}, IStory, {}, {}> & IStory & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Story.d.ts.map