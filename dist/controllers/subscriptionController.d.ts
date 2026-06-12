import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare function createOrder(req: AuthRequest, res: Response): Promise<void>;
export declare function verifyPayment(req: AuthRequest, res: Response): Promise<void>;
export declare function getMySubscription(req: AuthRequest, res: Response): Promise<void>;
export declare function getBillingHistory(req: AuthRequest, res: Response): Promise<void>;
export declare function cancelSubscription(req: AuthRequest, res: Response): Promise<void>;
export declare function subscribeNewsletter(req: AuthRequest, res: Response): Promise<void>;
export declare function getPrices(_req: any, res: Response): Promise<void>;
//# sourceMappingURL=subscriptionController.d.ts.map