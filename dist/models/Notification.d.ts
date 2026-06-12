import mongoose, { Document } from "mongoose";
export interface INotification extends Document {
    recipientId: mongoose.Types.ObjectId;
    senderId?: mongoose.Types.ObjectId;
    senderIds?: mongoose.Types.ObjectId[];
    type: "mention" | "reply" | "reaction" | "like" | "share_post" | "follow" | "new_article" | "system" | "message_request" | "breaking_news" | "trending_story" | "personalized_update" | "daily_digest" | "location_alert" | "recommendation";
    articleId?: mongoose.Types.ObjectId;
    postId?: mongoose.Types.ObjectId;
    commentId?: mongoose.Types.ObjectId;
    message?: string;
    link?: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Notification: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification, {}, {}> & INotification & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Notification.d.ts.map