import { IUser } from "../models/User";
/**
 * 🔐 LAYER 2: JWT Security
 * Generate Access Token (Short-lived: 15m)
 */
export declare const generateAccessToken: (user: IUser, sessionId: string) => string;
/**
 * 🔐 LAYER 2: JWT Security
 * Generate Refresh Token (Long-lived: 7d)
 */
export declare const generateRefreshToken: (user: IUser, sessionId: string) => string;
/**
 * Verify Access Token
 */
export declare const verifyAccessToken: (token: string) => any;
/**
 * Verify Refresh Token
 */
export declare const verifyRefreshToken: (token: string) => any;
/**
 * 🔐 LAYER 2: Multi-Factor Authentication (2FA)
 * Generate a new 2FA secret and QR code URL for a user
 */
export declare const generate2FASecret: (email: string) => Promise<{
    secret: any;
    qrCodeUrl: string;
    backupCodes: string[];
}>;
/**
 * 🔐 LAYER 2: Multi-Factor Authentication (2FA)
 * Verify a 2FA TOTP token
 */
export declare const verify2FAToken: (secret: string, token: string) => boolean;
/**
 * 🔐 LAYER 2: Password Security
 * Ensure the password meets strong requirements.
 */
export declare const isStrongPassword: (password: string) => boolean;
/**
 * 🔐 LAYER 2: Password Security
 * Check if the password was used in the last 5 passwords (password history)
 */
export declare const isPasswordInHistory: (password: string, history: string[]) => Promise<boolean>;
//# sourceMappingURL=authService.d.ts.map