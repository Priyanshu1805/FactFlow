import mongoose, { Document } from "mongoose";
export interface IReport extends Document {
    reporterId: mongoose.Types.ObjectId | string;
    reportedItemId: mongoose.Types.ObjectId | string;
    itemType: "User" | "Comment" | "NewsArticle";
    reason: string;
    status: "pending" | "resolved" | "dismissed";
    createdAt: Date;
    updatedAt: Date;
}
export declare const Report: mongoose.Model<any, {}, {}, {}, any, any>;
//# sourceMappingURL=Report.d.ts.map