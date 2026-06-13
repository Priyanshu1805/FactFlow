import mongoose, { Schema, Document } from "mongoose";

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
  gatewayOrderId?: string;
  paymentMethod?: string;
  amount: number;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    plan: { type: String, enum: ["free", "weekly", "monthly", "yearly"], default: "free", required: true },
    billingCycle: { type: String, enum: ["weekly", "monthly", "yearly"], default: "monthly" },
    status: { type: String, enum: ["active", "inactive", "expired", "cancelled"], default: "inactive" },
    startDate: { type: Date },
    endDate: { type: Date },
    gatewayOrderId: { type: String },
    paymentMethod: { type: String },
    amount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model<ISubscription>("Subscription", SubscriptionSchema);
