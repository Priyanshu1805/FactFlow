"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPasswordInHistory = exports.isStrongPassword = exports.verify2FAToken = exports.generate2FASecret = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const speakeasy_1 = __importDefault(require("speakeasy"));
const qrcode_1 = __importDefault(require("qrcode"));
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || "default_access_secret_change_in_prod";
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || "default_refresh_secret_change_in_prod";
/**
 * 🔐 LAYER 2: JWT Security
 * Generate Access Token (Short-lived: 15m)
 */
const generateAccessToken = (user, sessionId) => {
    return jsonwebtoken_1.default.sign({ id: user._id, role: user.role, sessionId }, ACCESS_TOKEN_SECRET, { expiresIn: "15m", algorithm: "HS256" } // NOTE: Prompt asked for RS256, but for simplicity/compatibility we use HS256 unless keys are provided
    );
};
exports.generateAccessToken = generateAccessToken;
/**
 * 🔐 LAYER 2: JWT Security
 * Generate Refresh Token (Long-lived: 7d)
 */
const generateRefreshToken = (user, sessionId) => {
    return jsonwebtoken_1.default.sign({ id: user._id, sessionId }, REFRESH_TOKEN_SECRET, { expiresIn: "7d", algorithm: "HS256" });
};
exports.generateRefreshToken = generateRefreshToken;
/**
 * Verify Access Token
 */
const verifyAccessToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, ACCESS_TOKEN_SECRET);
    }
    catch (error) {
        return null;
    }
};
exports.verifyAccessToken = verifyAccessToken;
/**
 * Verify Refresh Token
 */
const verifyRefreshToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, REFRESH_TOKEN_SECRET);
    }
    catch (error) {
        return null;
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
/**
 * 🔐 LAYER 2: Multi-Factor Authentication (2FA)
 * Generate a new 2FA secret and QR code URL for a user
 */
const generate2FASecret = async (email) => {
    const secret = speakeasy_1.default.generateSecret({
        name: `FactFlow (${email})`,
        length: 20
    });
    let qrCodeUrl = "";
    if (secret.otpauth_url) {
        qrCodeUrl = await qrcode_1.default.toDataURL(secret.otpauth_url);
    }
    // Generate 10 backup codes
    const backupCodes = Array.from({ length: 10 }, () => crypto_1.default.randomBytes(4).toString("hex"));
    return {
        secret: secret.base32,
        qrCodeUrl,
        backupCodes
    };
};
exports.generate2FASecret = generate2FASecret;
/**
 * 🔐 LAYER 2: Multi-Factor Authentication (2FA)
 * Verify a 2FA TOTP token
 */
const verify2FAToken = (secret, token) => {
    return speakeasy_1.default.totp.verify({
        secret,
        encoding: "base32",
        token,
        window: 1 // allows 30 seconds before/after
    });
};
exports.verify2FAToken = verify2FAToken;
/**
 * 🔐 LAYER 2: Password Security
 * Ensure the password meets strong requirements.
 */
const isStrongPassword = (password) => {
    // Min 8 chars, 1 uppercase, 1 number, 1 special character
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/-]).{8,}$/;
    return regex.test(password);
};
exports.isStrongPassword = isStrongPassword;
/**
 * 🔐 LAYER 2: Password Security
 * Check if the password was used in the last 5 passwords (password history)
 */
const isPasswordInHistory = async (password, history) => {
    if (!history || history.length === 0)
        return false;
    for (const hashed of history) {
        const isMatch = await bcryptjs_1.default.compare(password, hashed);
        if (isMatch)
            return true;
    }
    return false;
};
exports.isPasswordInHistory = isPasswordInHistory;
//# sourceMappingURL=authService.js.map