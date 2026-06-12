import mongoose, { Document } from "mongoose";
export interface INewsletterSubscriber extends Document {
    email: string;
    userId?: mongoose.Types.ObjectId;
    subscribedAt: Date;
    isActive: boolean;
}
export declare const NewsletterSubscriber: mongoose.Model<INewsletterSubscriber, {}, {}, {}, mongoose.Document<unknown, {}, INewsletterSubscriber, {}, {}> & INewsletterSubscriber & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=NewsletterSubscriber.d.ts.map