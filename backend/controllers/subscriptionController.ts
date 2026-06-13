import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
// @ts-ignore
import PaytmChecksum from "paytmchecksum";
import https from "https";
import { Subscription } from "../models/Subscription";
import { Payment } from "../models/Payment";

const PRICES: Record<string, number> = {
  weekly:  1500,  // in paise (₹15)
  monthly: 9900,  // in paise (₹99)
  yearly:  39900, // in paise (₹399)
};

const COUPONS: Record<string, { type: "percent" | "flat"; value: number }> = {
  GLOW20:   { type: "percent", value: 20 },
  WELCOME:  { type: "flat",    value: 5000 }, // ₹50 = 5000 paise
};

// ─── Helper: calculate final amount ────────────────────────────────────────
function calcAmount(plan: string, coupon?: string): number {
  let amount = PRICES[plan] ?? 0;
  if (coupon) {
    const c = COUPONS[coupon.toUpperCase()];
    if (c) {
      if (c.type === "percent") amount = Math.round(amount * (1 - c.value / 100));
      else amount = Math.max(0, amount - c.value);
    }
  }
  return amount;
}

// ─── POST /api/subscription/create-order ───────────────────────────────────
// Frontend calls this when user clicks "Proceed to Payment"
export async function createOrder(req: AuthRequest, res: Response) {
  try {
    const { plan, coupon } = req.body;
    const userId = req.user?.id;

    if (!plan || !PRICES[plan]) {
      res.status(400).json({ success: false, error: "Invalid plan" });
      return;
    }

    const { User } = await import("../models/User");
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    const amount = calcAmount(plan, coupon);
    const orderId = `ff_${String(userId).slice(-8)}_${Date.now()}`;

    // Load Cashfree SDK
    const { Cashfree, CFEnvironment } = await import("cashfree-pg");
    Cashfree.XClientId = process.env.CASHFREE_APP_ID!;
    Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY!;
    Cashfree.XEnvironment = process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT === "PRODUCTION" 
        ? CFEnvironment.PRODUCTION 
        : CFEnvironment.SANDBOX;

    const request = {
      order_amount: amount / 100, // Cashfree takes amount in INR
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: String(userId),
        customer_phone: user.phone || "9999999999",
        customer_email: user.email || "user@example.com",
        customer_name: user.name || "FactFlow User"
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL}/subscription?order_id={order_id}`
      }
    };

    const response = await Cashfree.PGCreateOrder("2023-08-01", request);
    const cfData = response.data;

    if (cfData && cfData.payment_session_id) {
      const payment = await Payment.create({
        userId,
        gatewayOrderId: orderId,
        amount: amount / 100, // store in rupees
        status: "created",
        plan,
        billingCycle: plan,
      });

      res.json({
        success: true,
        data: {
          orderId,
          paymentSessionId: cfData.payment_session_id,
          amount,
          paymentId: payment._id,
        },
      });
    } else {
      res.status(500).json({ success: false, error: "Cashfree session generation failed" });
    }
  } catch (err: any) {
    console.error("createOrder error:", err.message, err.response?.data);
    res.status(500).json({ success: false, error: "Could not create payment order" });
  }
}

// ─── POST /api/subscription/verify-payment ─────────────────────────────────
// Called after Cashfree popup closes with success
export async function verifyPayment(req: AuthRequest, res: Response) {
  try {
    const { orderId, plan, paymentMethod } = req.body;
    const userId = req.user?.id;

    if (!orderId) {
      res.status(400).json({ success: false, error: "Order ID missing" });
      return;
    }

    // Verify payment with Cashfree
    const { Cashfree, CFEnvironment } = await import("cashfree-pg");
    Cashfree.XClientId = process.env.CASHFREE_APP_ID!;
    Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY!;
    Cashfree.XEnvironment = process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT === "PRODUCTION" 
        ? CFEnvironment.PRODUCTION 
        : CFEnvironment.SANDBOX;

    const cfResponse = await Cashfree.PGOrderFetchPayments("2023-08-01", orderId);
    const payments = cfResponse.data;
    
    // Check if any payment for this order is SUCCESS
    const successfulPayment = payments?.find((p: any) => p.payment_status === "SUCCESS");

    if (!successfulPayment) {
      res.status(400).json({ success: false, error: "Payment verification failed or not successful" });
      return;
    }

    // Calculate subscription end date
    const now = new Date();
    const endDate = new Date(now);
    if (plan === "yearly") endDate.setFullYear(endDate.getFullYear() + 1);
    else if (plan === "monthly") endDate.setMonth(endDate.getMonth() + 1);
    else if (plan === "weekly") endDate.setDate(endDate.getDate() + 7);

    // Upsert subscription
    const subscription = await Subscription.findOneAndUpdate(
      { userId },
      {
        userId,
        plan,
        billingCycle: plan,
        status:          "active",
        startDate:       now,
        endDate,
        gatewayOrderId:  orderId,
        paymentMethod:   paymentMethod || "Cashfree",
        amount:          calcAmount(plan) / 100,
      },
      { upsert: true, new: true }
    );

    // Mark payment as paid
    await Payment.findOneAndUpdate(
      { gatewayOrderId: orderId },
      {
        gatewayPaymentId: String(successfulPayment.cf_payment_id),
        status:           "paid",
        subscriptionId:   subscription._id,
        method:           paymentMethod || "Cashfree",
      }
    );

    // Update user plan in User model
    const { User } = await import("../models/User");
    await User.findByIdAndUpdate(userId, { plan, subscriptionId: subscription._id });

    res.json({
      success: true,
      message: "Payment verified! Subscription activated.",
      data: { subscription },
    });
  } catch (err: any) {
    console.error("verifyPayment error:", err.message, err.response?.data);
    res.status(500).json({ success: false, error: "Payment verification failed" });
  }
}

// ─── GET /api/subscription/me ───────────────────────────────────────────────
export async function getMySubscription(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const subscription = await Subscription.findOne({ userId }).sort({ createdAt: -1 });

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
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Failed to fetch subscription" });
  }
}

// ─── GET /api/subscription/billing-history ─────────────────────────────────
export async function getBillingHistory(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const payments = await Payment.find({ userId, status: "paid" })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, data: payments });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Failed to fetch billing history" });
  }
}

// ─── POST /api/subscription/cancel ─────────────────────────────────────────
export async function cancelSubscription(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const subscription = await Subscription.findOne({ userId, status: "active" });

    if (!subscription) {
      res.status(404).json({ success: false, error: "No active subscription found" });
      return;
    }

    // Don't remove access immediately — mark as cancelled, access till endDate
    subscription.status = "cancelled";
    await subscription.save();

    const { User } = await import("../models/User");
    await User.findByIdAndUpdate(userId, { plan: "free" });

    res.json({
      success: true,
      message: `Subscription cancelled. Access continues until ${subscription.endDate.toLocaleDateString("en-IN")}`,
      data: { endDate: subscription.endDate },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "Failed to cancel subscription" });
  }
}

// ─── POST /api/subscription/newsletter ─────────────────────────────────────
export async function subscribeNewsletter(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { email, preferences } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ success: false, error: "Valid email required" });
      return;
    }

    const { NewsletterSubscriber } = await import("../models/NewsletterSubscriber");

    // Upsert subscriber — works for both guests and logged-in users
    const existing = await NewsletterSubscriber.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (existing.isActive) {
        res.json({ success: true, message: "You are already subscribed!" });
        return;
      }
      // Re-activate
      existing.isActive = true;
      if (userId) existing.userId = userId as any;
      await existing.save();
    } else {
      await NewsletterSubscriber.create({
        email: email.toLowerCase(),
        userId: userId ? (userId as any) : null,
      });
    }

    // Also update User model if logged in
    if (userId) {
      const { User } = await import("../models/User");
      await User.findByIdAndUpdate(userId, {
        "newsletter.email":       email,
        "newsletter.subscribed":  true,
        "newsletter.preferences": preferences || {},
      });
    }

    // Send welcome confirmation email
    try {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.default.createTransport({
        host:   process.env.SMTP_HOST || "smtp.gmail.com",
        port:   parseInt(process.env.SMTP_PORT || "587", 10),
        secure: process.env.SMTP_SECURE === "true",
        auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });

      await transporter.sendMail({
        from:    `"Fact Flow" <${process.env.SMTP_USER}>`,
        to:      email,
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
    } catch (emailErr: any) {
      console.error("Welcome email failed:", emailErr.message);
      // Don't fail the request even if email fails
    }

    res.json({ success: true, message: "Successfully subscribed to newsletter!" });
  } catch (err: any) {
    console.error("subscribeNewsletter error:", err.message);
    res.status(500).json({ success: false, error: "Failed to subscribe" });
  }
}

// ─── GET /api/subscription/prices ──────────────────────────────────────────
// Public endpoint — frontend uses to show prices
export async function getPrices(_req: any, res: Response) {
  res.json({
    success: true,
    data: {
      weekly:  15,
      monthly: 99,
      yearly:  399,
      coupons: ["GLOW20 (20% off)", "WELCOME (₹50 off)"],
    },
  });
}
