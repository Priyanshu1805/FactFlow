import { Request, Response, NextFunction } from "express";
import { IUser } from "../models/User";
export interface AuthRequest extends Request {
    user?: IUser;
    body: any;
}
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requireRole: (...allowedRoles: Array<"superadmin" | "admin" | "editor" | "viewer">) => (req: Request, res: Response, next: NextFunction) => void;
export declare function authenticateFirebase(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=auth.d.ts.map