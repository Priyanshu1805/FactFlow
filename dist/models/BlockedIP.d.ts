import mongoose, { Document } from "mongoose";
export interface IBlockedIP extends Document {
    ip: string;
    reason: string;
    blockedAt: Date;
    expiresAt?: Date;
    isPermanent: boolean;
}
export declare const BlockedIP: mongoose.Model<any, {}, {}, {}, any, any>;
//# sourceMappingURL=BlockedIP.d.ts.map