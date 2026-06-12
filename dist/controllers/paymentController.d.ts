import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare function getPaymentMethods(req: AuthRequest, res: Response): Promise<void>;
export declare function addPaymentMethod(req: AuthRequest, res: Response): Promise<void>;
export declare function removePaymentMethod(req: AuthRequest, res: Response): Promise<void>;
export declare function setDefaultPaymentMethod(req: AuthRequest, res: Response): Promise<void>;
export declare function processPayment(req: AuthRequest, res: Response): Promise<void>;
//# sourceMappingURL=paymentController.d.ts.map