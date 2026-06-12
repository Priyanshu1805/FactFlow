import mongoose, { Document } from "mongoose";
export type PlanType = "free" | "weekly" | "monthly" | "yearly";
export type BillingCycle = "weekly" | "monthly" | "yearly";
export type SubStatus = "active" | "inactive" | "expired" | "cancelled";
export interface ISubscription extends Document {
    userId: mongoose.Types.ObjectId;
    plan: PlanType;
    billingCycle: BillingCycle;
    status: SubStatus;
    startDate: Date;
    endDate: Date;
    paytmOrderId?: string;
    paymentMethod?: string;
    amount: number;
}
export declare const Subscription: mongoose.Model<ISubscription, {}, {}, {}, mongoose.Document<unknown, {}, ISubscription, {}, {}> & ISubscription & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Subscription.d.ts.map