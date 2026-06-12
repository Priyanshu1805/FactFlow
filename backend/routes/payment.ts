import { Router } from "express"
import {
  getPaymentMethods,
  addPaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod,
  processPayment,
} from "../controllers/paymentController"
import { authenticate } from "../middleware/auth"

const router = Router()

router.get("/methods", authenticate, getPaymentMethods)
router.post("/methods", authenticate, addPaymentMethod)
router.delete("/methods/:methodId", authenticate, removePaymentMethod)
router.put("/methods/default", authenticate, setDefaultPaymentMethod)
router.post("/charge", authenticate, processPayment)

export default router
