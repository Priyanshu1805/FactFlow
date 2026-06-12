import mongoose, { Document } from "mongoose";
export interface IHistory extends Document {
    user: mongoose.Types.ObjectId;
    itemId: string;
    itemType: "post" | "reel" | "story";
    category: string;
    engagement: "viewed" | "liked" | "saved";
    timestamp: Date;
}
export declare const History: mongoose.Model<IHistory, {}, {}, {}, mongoose.Document<unknown, {}, IHistory, {}, {}> & IHistory & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=History.d.ts.map