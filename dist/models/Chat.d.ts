import mongoose, { Document } from "mongoose";
export interface IChat extends Document {
    participants: mongoose.Types.ObjectId[];
    isGroupChat: boolean;
    chatName?: string;
    groupAdmin?: mongoose.Types.ObjectId;
    latestMessage?: mongoose.Types.ObjectId;
    category: string;
    status: string;
    requestRecipient?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Chat: mongoose.Model<any, {}, {}, {}, any, any>;
//# sourceMappingURL=Chat.d.ts.map