"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentMethods = getPaymentMethods;
exports.addPaymentMethod = addPaymentMethod;
exports.removePaymentMethod = removePaymentMethod;
exports.setDefaultPaymentMethod = setDefaultPaymentMethod;
exports.processPayment = processPayment;
const User_1 = require("../models/User");
const crypto_1 = __importDefault(require("crypto"));
async function getPaymentMethods(req, res) {
    try {
        const user = await User_1.User.findById(req.user?.id).select("paymentMethods");
        if (!user) {
            res.status(404).json({ success: false, error: "User not found" });
            return;
        }
        res.json({ success: true, paymentMethods: user.paymentMethods || [] });
    }
    catch (error) {
        console.error("Error fetching payment methods:", error.message);
        res.status(500).json({ success: false, error: "Server error" });
    }
}
async function addPaymentMethod(req, res) {
    try {
        const { cardNumber, expiryMonth, expiryYear, cvv, cardholderName } = req.body;
        if (!cardNumber || !expiryMonth || !expiryYear || !cvv || !cardholderName) {
            res.status(400).json({ success: false, error: "All card fields are required." });
            return;
        }
        const cleaned = cardNumber.replace(/\s/g, "");
        if (cleaned.length < 13 || cleaned.length > 19) {
            res.status(400).json({ success: false, error: "Invalid card number." });
            return;
        }
        const now = new Date();
        const expMonth = parseInt(expiryMonth, 10);
        const expYear = parseInt(expiryYear, 10);
        const expDate = new Date(expYear, expMonth - 1);
        if (expDate <= now) {
            res.status(400).json({ success: false, error: "Card has expired." });
            return;
        }
        const user = await User_1.User.findById(req.user?.id);
        if (!user) {
            res.status(404).json({ success: false, error: "User not found" });
            return;
        }
        const methodId = `pm_${crypto_1.default.randomBytes(12).toString("hex")}`;
        const lastFour = cleaned.slice(-4);
        const isDefault = !user.paymentMethods || user.paymentMethods.length === 0;
        const newMethod = {
            methodId,
            type: "card",
            lastFour,
            expiryMonth: expMonth,
            expiryYear: expYear,
            cardholderName,
            isDefault,
            addedAt: new Date(),
        };
        if (!user.paymentMethods)
            user.paymentMethods = [];
        user.paymentMethods.push(newMethod);
        await user.save();
        console.log(`[Payment] Card saved for ${req.user?.email}: ****${lastFour}`);
        res.json({
            success: true,
            message: "Payment method added successfully.",
            paymentMethod: newMethod,
        });
    }
    catch (error) {
        console.error("Error adding payment method:", error.message);
        res.status(500).json({ success: false, error: "Server error" });
    }
}
async function removePaymentMethod(req, res) {
    try {
        const { methodId } = req.params;
        const user = await User_1.User.findById(req.user?.id);
        if (!user) {
            res.status(404).json({ success: false, error: "User not found" });
            return;
        }
        const removed = user.paymentMethods?.find((pm) => pm.methodId === methodId);
        if (!removed) {
            res.status(404).json({ success: false, error: "Payment method not found." });
            return;
        }
        user.paymentMethods = user.paymentMethods?.filter((pm) => pm.methodId !== methodId) || [];
        if (removed.isDefault && user.paymentMethods.length > 0) {
            user.paymentMethods[0].isDefault = true;
        }
        await user.save();
        res.json({
            success: true,
            message: "Payment method removed.",
            paymentMethods: user.paymentMethods,
        });
    }
    catch (error) {
        console.error("Error removing payment method:", error.message);
        res.status(500).json({ success: false, error: "Server error" });
    }
}
async function setDefaultPaymentMethod(req, res) {
    try {
        const { methodId } = req.body;
        const user = await User_1.User.findById(req.user?.id);
        if (!user) {
            res.status(404).json({ success: false, error: "User not found" });
            return;
        }
        const exists = user.paymentMethods?.find((pm) => pm.methodId === methodId);
        if (!exists) {
            res.status(404).json({ success: false, error: "Payment method not found." });
            return;
        }
        user.paymentMethods = user.paymentMethods?.map((pm) => ({
            ...pm,
            isDefault: pm.methodId === methodId,
        }));
        await user.save();
        res.json({
            success: true,
            message: "Default payment method updated.",
            paymentMethods: user.paymentMethods,
        });
    }
    catch (error) {
        console.error("Error setting default payment method:", error.message);
        res.status(500).json({ success: false, error: "Server error" });
    }
}
async function processPayment(req, res) {
    try {
        const { tier, billing, methodId } = req.body;
        if (!tier || !["pro", "premium"].includes(tier)) {
            res.status(400).json({ success: false, error: "Invalid tier." });
            return;
        }
        if (!billing || !["monthly", "yearly"].includes(billing)) {
            res.status(400).json({ success: false, error: "Invalid billing." });
            return;
        }
        const user = await User_1.User.findById(req.user?.id);
        if (!user) {
            res.status(404).json({ success: false, error: "User not found" });
            return;
        }
        const pm = methodId
            ? user.paymentMethods?.find((m) => m.methodId === methodId)
            : user.paymentMethods?.find((m) => m.isDefault) || user.paymentMethods?.[0];
        if (!pm) {
            res.status(400).json({ success: false, error: "No payment method found. Please add a card first." });
            return;
        }
        const SUBSCRIPTION_PRICES = {
            pro: { monthly: 99, yearly: 950 },
            premium: { monthly: 199, yearly: 1990 },
        };
        const amount = billing === "yearly" ? SUBSCRIPTION_PRICES[tier].yearly : SUBSCRIPTION_PRICES[tier].monthly;
        const paymentId = `pay_${crypto_1.default.randomBytes(12).toString("hex")}`;
        console.log(`[Payment] Processing ₹${amount} from card ****${pm.lastFour} — ID: ${paymentId}`);
        await new Promise((r) => setTimeout(r, 800));
        const now = new Date();
        const validUntil = new Date(now);
        if (billing === "yearly") {
            validUntil.setFullYear(validUntil.getFullYear() + 1);
        }
        else {
            validUntil.setMonth(validUntil.getMonth() + 1);
        }
        user.subscriptionTier = tier;
        user.subscriptionValidUntil = validUntil;
        await user.save();
        const io = req.app.get("io");
        if (io) {
            io.to(`user_${user._id}`).emit("subscriptionChanged", {
                tier: user.subscriptionTier,
                validUntil: user.subscriptionValidUntil,
            });
        }
        console.log(`[Subscription] Activated ${tier} (${billing}) for ${req.user?.email} — ₹${amount}`);
        res.json({
            success: true,
            message: `Payment successful! ${tier} plan is now active.`,
            payment: { id: paymentId, amount, methodLastFour: pm.lastFour, status: "completed" },
            subscription: {
                tier: user.subscriptionTier,
                validUntil: user.subscriptionValidUntil,
                billing,
            },
        });
    }
    catch (error) {
        console.error("Error processing payment:", error.message);
        res.status(500).json({ success: false, error: "Server error" });
    }
}
//# sourceMappingURL=paymentController.js.map