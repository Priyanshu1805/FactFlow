import mongoose, { Document } from "mongoose";
export interface INotificationPrefs extends Document {
    userId: mongoose.Types.ObjectId;
    pushEnabled: boolean;
    pushSubscription?: any;
    breakingNews: boolean;
    liveUpdates: boolean;
    commentReplies: boolean;
    mentions: boolean;
    dailyDigest: {
        enabled: boolean;
        time: "7AM" | "12PM" | "6PM" | "9PM";
    };
    weeklySummary: boolean;
    quietHours: {
        enabled: boolean;
        from: string;
        to: string;
    };
}
export declare const NotificationPrefs: mongoose.Model<INotificationPrefs, {}, {}, {}, mongoose.Document<unknown, {}, INotificationPrefs, {}, {}> & INotificationPrefs & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=NotificationPrefs.d.ts.map