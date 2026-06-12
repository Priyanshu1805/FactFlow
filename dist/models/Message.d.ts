import mongoose, { Document } from "mongoose";
export interface IMessage extends Document {
    sender: mongoose.Types.ObjectId;
    content: string;
    chat: mongoose.Types.ObjectId;
    readBy: mongoose.Types.ObjectId[];
    mediaUrl?: string;
    mediaType?: "image" | "video";
    createdAt: Date;
    updatedAt: Date;
}
export declare const Message: mongoose.Model<any, {}, {}, {}, any, any>;
//# sourceMappingURL=Message.d.ts.map