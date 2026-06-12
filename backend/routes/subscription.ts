import { Router } from "express";
import { authenticateFirebase } from "../middleware/auth";
import {
  createOrder,
  verifyPayment,
  getMySubscription,
  getBillingHistory,
  cancelSubscription,
  subscribeNewsletter,
  getPrices,
} from "../controllers/subscriptionController";

const router = Router();

// Public routes (no auth needed)
router.get("/prices", getPrices);
router.post("/newsletter", subscribeNewsletter); // Allow guest subscriptions

// Protected (user must be logged in)
router.use(authenticateFirebase);

router.get("/me",              getMySubscription);
router.get("/billing-history", getBillingHistory);
router.post("/create-order",   createOrder);
router.post("/verify-payment", verifyPayment);
router.post("/cancel",         cancelSubscription);

export default router;

