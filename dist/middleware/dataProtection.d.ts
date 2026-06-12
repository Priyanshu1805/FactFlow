import { Request, Response, NextFunction } from "express";
/**
 * 🧱 LAYER 3: Data Protection Middleware Suite
 * This array can be directly used in server.ts to apply all data protections.
 */
export declare const dataProtectionSuite: any[];
/**
 * 🧱 LAYER 3: File Upload Validation
 * Middleware to strictly validate file types and sizes
 */
export declare const validateFileUpload: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=dataProtection.d.ts.map