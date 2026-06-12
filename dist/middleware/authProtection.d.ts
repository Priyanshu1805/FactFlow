import { Request, Response, NextFunction } from "express";
import { IUser } from "../models/User";
declare global {
    namespace Express {
        interface Request {
            user?: IUser;
            sessionId?: string;
        }
    }
}
/**
 * 🔐 LAYER 2: Session Protection & JWT Verification
 * Verifies the access token and ensures the session is still active and valid for the current IP/Device.
 */
export declare const requireAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * 🔐 LAYER 2: Role-Based Access Control (RBAC)
 * Protects routes by requiring specific roles.
 */
export declare const requireRole: (...allowedRoles: Array<"superadmin" | "admin" | "editor" | "viewer">) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * 🔐 LAYER 2: Brute Force Account Locking
 * Middleware to check if account is locked before allowing login attempt
 */
export declare const checkAccountLock: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=authProtection.d.ts.map