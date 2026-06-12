import mongoose, { Document } from "mongoose";
export interface IAd extends Document {
    title: string;
    imageUrl: string;
    targetUrl: string;
    isActive: boolean;
    views: number;
    clicks: number;
    cpc: number;
    cpm: number;
    expiresAt?: Date;
    createdBy: mongoose.Types.ObjectId;
}
export declare const Ad: mongoose.Model<IAd, {}, {}, {}, mongoose.Document<unknown, {}, IAd, {}, {}> & IAd & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Ad.d.ts.map