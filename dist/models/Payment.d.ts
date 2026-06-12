import mongoose, { Document } from "mongoose";
export interface IPayment extends Document {
    userId: mongoose.Types.ObjectId;
    subscriptionId: mongoose.Types.ObjectId;
    paytmOrderId: string;
    paytmTransactionId?: string;
    amount: number;
    currency: string;
    status: "created" | "paid" | "failed";
    method?: string;
    plan: string;
    billingCycle: string;
    createdAt: Date;
}
export declare const Payment: mongoose.Model<IPayment, {}, {}, {}, mongoose.Document<unknown, {}, IPayment, {}, {}> & IPayment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Payment.d.ts.map