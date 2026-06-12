"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = createOrder;
exports.verifyPayment = verifyPayment;
exports.getMySubscription = getMySubscription;
exports.getBillingHistory = getBillingHistory;
exports.cancelSubscription = cancelSubscription;
exports.subscribeNewsletter = subscribeNewsletter;
exports.getPrices = getPrices;
// @ts-ignore
const paytmchecksum_1 = __importDefault(require("paytmchecksum"));
const https_1 = __importDefault(require("https"));
const Subscription_1 = require("../models/Subscription");
const Payment_1 = require("../models/Payment");
const PRICES = {
    weekly: 1500, // in paise (₹15)
    monthly: 9900, // in paise (₹99)
    yearly: 39900, // in paise (₹399)
};
const COUPONS = {
    GLOW20: { type: "percent", value: 20 },
    WELCOME: { type: "flat", value: 5000 }, // ₹50 = 5000 paise
};
// ─── Helper: calculate final amount ────────────────────────────────────────
function calcAmount(plan, coupon) {
    let amount = PRICES[plan] ?? 0;
    if (coupon) {
        const c = COUPONS[coupon.toUpperCase()];
        if (c) {
            if (c.type === "percent")
                amount = Math.round(amount * (1 - c.value / 100));
            else
                amount = Math.max(0, amount - c.value);
        }
    }
    return amount;
}
// ─── POST /api/subscription/create-order ───────────────────────────────────
// Frontend calls this when user clicks "Proceed to Payment"
async function createOrder(req, res) {
    try {
        const { plan, coupon } = req.body;
        const userId = req.user?.id;
        if (!plan) {
            res.status(400).json({ success: false, error: "plan required" });
            return;
        }
        if (!PRICES[plan]) {
            res.status(400).json({ success: false, error: "Invalid plan" });
            return;
        }
        const amount = calcAmount(plan, coupon);
        const orderId = `ff_${String(userId).slice(-8)}_${Date.now()}`;
        const paytmParams = {};
        paytmParams.body = {
            requestType: "Payment",
            mid: process.env.PAYTM_MID,
            websiteName: process.env.PAYTM_WEBSITE || "WEBSTAGING",
            orderId: orderId,
            callbackUrl: `${process.env.FRONTEND_URL}/api/paytm-callback`,
            txnAmount: {
                value: (amount / 100).toFixed(2),
                currency: "INR",
            },
            userInfo: {
                custId: userId,
            },
        };
        const checksum = await paytmchecksum_1.default.generateSignature(JSON.stringify(paytmParams.body), process.env.PAYTM_MERCHANT_KEY);
        paytmParams.head = { signature: checksum };
        const post_data = JSON.stringify(paytmParams);
        const options = {
            hostname: process.env.PAYTM_ENVIRONMENT === "PRODUCTION" ? "securegw.paytm.in" : "securegw-stage.paytm.in",
            port: 443,
            path: `/theia/api/v1/initiateTransaction?mid=${process.env.PAYTM_MID}&orderId=${orderId}`,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": post_data.length,
            },
        };
        const response = await new Promise((resolve, reject) => {
            const post_req = https_1.default.request(options, (post_res) => {
                let chunkData = "";
                post_res.on("data", (chunk) => { chunkData += chunk; });
                post_res.on("end", () => resolve(JSON.parse(chunkData)));
            });
            post_req.on("error", reject);
            post_req.write(post_data);
            post_req.end();
        });
        if (response.body.resultInfo.resultStatus === "S") {
            const payment = await Payment_1.Payment.create({
                userId,
                paytmOrderId: orderId,
                amount: amount / 100, // store in rupees
                status: "created",
                plan,
                billingCycle: plan,
            });
            res.json({
                success: true,
                data: {
                    orderId,
                    txnToken: response.body.txnToken,
                    amount,
                    mid: process.env.PAYTM_MID,
                    paymentId: payment._id,
                },
            });
        }
        else {
            res.status(500).json({ success: false, error: "Paytm token generation failed" });
        }
    }
    catch (err) {
        console.error("createOrder error:", err.message);
        res.status(500).json({ success: false, error: "Could not create payment order" });
    }
}
// ─── POST /api/subscription/verify-payment ─────────────────────────────────
// Called after Razorpay popup closes with success
async function verifyPayment(req, res) {
    try {
        const { paytm_order_id, paytm_transaction_id, plan, paymentMethod, } = req.body;
        const userId = req.user?.id;
        // 2. Calculate subscription end date
        const now = new Date();
        const endDate = new Date(now);
        if (plan === "yearly")
            endDate.setFullYear(endDate.getFullYear() + 1);
        else if (plan === "monthly")
            endDate.setMonth(endDate.getMonth() + 1);
        else if (plan === "weekly")
            endDate.setDate(endDate.getDate() + 7);
        // 3. Upsert subscription
        const subscription = await Subscription_1.Subscription.findOneAndUpdate({ userId }, {
            userId,
            plan,
            billingCycle: plan,
            status: "active",
            startDate: now,
            endDate,
            paytmOrderId: paytm_order_id,
            paymentMethod: paymentMethod || "Paytm",
            amount: calcAmount(plan) / 100,
        }, { upsert: true, new: true });
        // 4. Mark payment as paid
        await Payment_1.Payment.findOneAndUpdate({ paytmOrderId: paytm_order_id }, {
            paytmTransactionId: paytm_transaction_id,
            status: "paid",
            subscriptionId: subscription._id,
            method: paymentMethod,
        });
        // 5. Update user plan in User model
        const { User } = await Promise.resolve().then(() => __importStar(require("../models/User")));
        await User.findByIdAndUpdate(userId, { plan, subscriptionId: subscription._id });
        res.json({
            success: true,
            message: "Payment verified! Subscription activated.",
            data: { subscription },
        });
    }
    catch (err) {
        console.error("verifyPayment error:", err.message);
        res.status(500).json({ success: false, error: "Payment verification failed" });
    }
}
// ─── GET /api/subscription/me ───────────────────────────────────────────────
async function getMySubscription(req, res) {
    try {
        const userId = req.user?.id;
        const subscription = await Subscription_1.Subscription.findOne({ userId }).sort({ createdAt: -1 });
        if (!subscription) {
            res.json({ success: true, data: { plan: "free", status: "inactive" } });
            return;
        }
        // Auto-expire if past endDate
        if (subscription.status === "active" && subscription.endDate < new Date()) {
            subscription.status = "expired";
            await subscription.save();
        }
        // Days until expiry
        const daysLeft = subscription.endDate
            ? Math.ceil((subscription.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : 0;
        res.json({ success: true, data: { ...subscription.toObject(), daysLeft } });
    }
    catch (err) {
        res.status(500).json({ success: false, error: "Failed to fetch subscription" });
    }
}
// ─── GET /api/subscription/billing-history ─────────────────────────────────
async function getBillingHistory(req, res) {
    try {
        const userId = req.user?.id;
        const payments = await Payment_1.Payment.find({ userId, status: "paid" })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json({ success: true, data: payments });
    }
    catch (err) {
        res.status(500).json({ success: false, error: "Failed to fetch billing history" });
    }
}
// ─── POST /api/subscription/cancel ─────────────────────────────────────────
async function cancelSubscription(req, res) {
    try {
        const userId = req.user?.id;
        const subscription = await Subscription_1.Subscription.findOne({ userId, status: "active" });
        if (!subscription) {
            res.status(404).json({ success: false, error: "No active subscription found" });
            return;
        }
        // Don't remove access immediately — mark as cancelled, access till endDate
        subscription.status = "cancelled";
        await subscription.save();
        const { User } = await Promise.resolve().then(() => __importStar(require("../models/User")));
        await User.findByIdAndUpdate(userId, { plan: "free" });
        res.json({
            success: true,
            message: `Subscription cancelled. Access continues until ${subscription.endDate.toLocaleDateString("en-IN")}`,
            data: { endDate: subscription.endDate },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: "Failed to cancel subscription" });
    }
}
// ─── POST /api/subscription/newsletter ─────────────────────────────────────
async function subscribeNewsletter(req, res) {
    try {
        const userId = req.user?.id;
        const { email, preferences } = req.body;
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            res.status(400).json({ success: false, error: "Valid email required" });
            return;
        }
        const { NewsletterSubscriber } = await Promise.resolve().then(() => __importStar(require("../models/NewsletterSubscriber")));
        // Upsert subscriber — works for both guests and logged-in users
        const existing = await NewsletterSubscriber.findOne({ email: email.toLowerCase() });
        if (existing) {
            if (existing.isActive) {
                res.json({ success: true, message: "You are already subscribed!" });
                return;
            }
            // Re-activate
            existing.isActive = true;
            if (userId)
                existing.userId = userId;
            await existing.save();
        }
        else {
            await NewsletterSubscriber.create({
                email: email.toLowerCase(),
                userId: userId ? userId : null,
            });
        }
        // Also update User model if logged in
        if (userId) {
            const { User } = await Promise.resolve().then(() => __importStar(require("../models/User")));
            await User.findByIdAndUpdate(userId, {
                "newsletter.email": email,
                "newsletter.subscribed": true,
                "newsletter.preferences": preferences || {},
            });
        }
        // Send welcome confirmation email
        try {
            const nodemailer = await Promise.resolve().then(() => __importStar(require("nodemailer")));
            const transporter = nodemailer.default.createTransport({
                host: process.env.SMTP_HOST || "smtp.gmail.com",
                port: parseInt(process.env.SMTP_PORT || "587", 10),
                secure: process.env.SMTP_SECURE === "true",
                auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
            });
            await transporter.sendMail({
                from: `"Fact Flow" <${process.env.SMTP_USER}>`,
                to: email,
                subject: "🎉 You're subscribed to Fact Flow!",
                html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f3f4f6;margin:0;padding:0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 20px;">
              <tr><td align="center">
                <table width="100%" style="max-width:600px;">
                  <tr><td style="background:#111111;padding:30px;border-radius:16px 16px 0 0;text-align:center;">
                    <h1 style="color:white;margin:0;font-size:28px;font-weight:900;">FACT<span style="color:#ff3040;">FLOW</span></h1>
                    <p style="color:#9ca3af;margin:8px 0 0;font-size:14px;">Digital News Platform</p>
                  </td></tr>
                  <tr><td style="background:#ffffff;padding:40px 30px;border-radius:0 0 16px 16px;text-align:center;">
                    <div style="width:64px;height:64px;background:#fef2f2;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;">
                      <span style="font-size:28px;">🎉</span>
                    </div>
                    <h2 style="color:#111827;margin:0 0 16px;font-size:24px;">You're officially subscribed!</h2>
                    <p style="color:#4b5563;font-size:15px;line-height:1.7;margin:0 0 24px;">
                      Welcome to the Fact Flow newsletter! You'll now receive the latest breaking news, trending stories, and weekly digests directly in your inbox.
                    </p>
                    <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}" style="display:inline-block;background:#ff3040;color:white;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:700;font-size:15px;">
                      Read Today's News →
                    </a>
                    <p style="color:#9ca3af;font-size:12px;margin-top:32px;">
                      You can unsubscribe at any time from your account settings.<br/>
                      Fact Flow · factflow1819@gmail.com · India
                    </p>
                  </td></tr>
                </table>
              </td></tr>
            </table>
          </body>
          </html>
        `,
            });
        }
        catch (emailErr) {
            console.error("Welcome email failed:", emailErr.message);
            // Don't fail the request even if email fails
        }
        res.json({ success: true, message: "Successfully subscribed to newsletter!" });
    }
    catch (err) {
        console.error("subscribeNewsletter error:", err.message);
        res.status(500).json({ success: false, error: "Failed to subscribe" });
    }
}
// ─── GET /api/subscription/prices ──────────────────────────────────────────
// Public endpoint — frontend uses to show prices
async function getPrices(_req, res) {
    res.json({
        success: true,
        data: {
            weekly: 15,
            monthly: 99,
            yearly: 399,
            coupons: ["GLOW20 (20% off)", "WELCOME (₹50 off)"],
        },
    });
}
//# sourceMappingURL=subscriptionController.js.map