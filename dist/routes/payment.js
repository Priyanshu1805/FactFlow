"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentController_1 = require("../controllers/paymentController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/methods", auth_1.authenticate, paymentController_1.getPaymentMethods);
router.post("/methods", auth_1.authenticate, paymentController_1.addPaymentMethod);
router.delete("/methods/:methodId", auth_1.authenticate, paymentController_1.removePaymentMethod);
router.put("/methods/default", auth_1.authenticate, paymentController_1.setDefaultPaymentMethod);
router.post("/charge", auth_1.authenticate, paymentController_1.processPayment);
exports.default = router;
//# sourceMappingURL=payment.js.map