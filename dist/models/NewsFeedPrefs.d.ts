import mongoose, { Document } from "mongoose";
export interface INewsFeedPrefs extends Document {
    userId: mongoose.Types.ObjectId;
    followedTopics: string[];
    feedSortOrder: "latest" | "trending" | "oldest";
    newsLanguages: string[];
    reels: {
        autoPlay: boolean;
        wifiOnly: boolean;
        captions: boolean;
    };
    saved: {
        offlineReading: boolean;
        autoRemove: boolean;
        autoRemoveDays: number;
    };
}
export declare const NewsFeedPrefs: mongoose.Model<INewsFeedPrefs, {}, {}, {}, mongoose.Document<unknown, {}, INewsFeedPrefs, {}, {}> & INewsFeedPrefs & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=NewsFeedPrefs.d.ts.map