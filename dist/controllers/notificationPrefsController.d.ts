import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare function getNotificationPrefs(req: AuthRequest, res: Response): Promise<void>;
export declare function updateNotificationPrefs(req: AuthRequest, res: Response): Promise<void>;
export declare function savePushSubscription(req: AuthRequest, res: Response): Promise<void>;
export declare function testNotifications(req: AuthRequest, res: Response): Promise<void>;
export declare function testEmailDigest(req: AuthRequest, res: Response): Promise<void>;
//# sourceMappingURL=notificationPrefsController.d.ts.map