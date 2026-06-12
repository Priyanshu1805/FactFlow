import mongoose, { Document } from "mongoose";
export interface ISecurityLog extends Document {
    event: string;
    userId?: mongoose.Types.ObjectId;
    ip: string;
    userAgent: string;
    timestamp: Date;
    severity: "low" | "medium" | "high" | "critical";
    details?: Record<string, any>;
}
export declare const SecurityLog: mongoose.Model<any, {}, {}, {}, any, any>;
//# sourceMappingURL=SecurityLog.d.ts.map