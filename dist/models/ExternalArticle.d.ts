import mongoose, { Document } from "mongoose";
export interface IExternalArticle extends Document {
    url: string;
    likedBy: string[];
    dislikedBy: string[];
    savedBy: string[];
    shares: number;
}
export declare const ExternalArticle: mongoose.Model<IExternalArticle, {}, {}, {}, mongoose.Document<unknown, {}, IExternalArticle, {}, {}> & IExternalArticle & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=ExternalArticle.d.ts.map