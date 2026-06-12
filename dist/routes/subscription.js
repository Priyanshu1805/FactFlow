"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const subscriptionController_1 = require("../controllers/subscriptionController");
const router = (0, express_1.Router)();
// Public routes (no auth needed)
router.get("/prices", subscriptionController_1.getPrices);
router.post("/newsletter", subscriptionController_1.subscribeNewsletter); // Allow guest subscriptions
// Protected (user must be logged in)
router.use(auth_1.authenticateFirebase);
router.get("/me", subscriptionController_1.getMySubscription);
router.get("/billing-history", subscriptionController_1.getBillingHistory);
router.post("/create-order", subscriptionController_1.createOrder);
router.post("/verify-payment", subscriptionController_1.verifyPayment);
router.post("/cancel", subscriptionController_1.cancelSubscription);
exports.default = router;
//# sourceMappingURL=subscription.js.map