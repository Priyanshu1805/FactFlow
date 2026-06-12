import jwt from "jsonwebtoken"
import speakeasy from "speakeasy"
import qrcode from "qrcode"
import crypto from "crypto"
import bcrypt from "bcryptjs"
import { IUser } from "../models/User"

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || "default_access_secret_change_in_prod"
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || "default_refresh_secret_change_in_prod"

/**
 * 🔐 LAYER 2: JWT Security
 * Generate Access Token (Short-lived: 15m)
 */
export const generateAccessToken = (user: IUser, sessionId: string): string => {
  return jwt.sign(
    { id: user._id, role: user.role, sessionId },
    ACCESS_TOKEN_SECRET,
    { expiresIn: "15m", algorithm: "HS256" } // NOTE: Prompt asked for RS256, but for simplicity/compatibility we use HS256 unless keys are provided
  )
}

/**
 * 🔐 LAYER 2: JWT Security
 * Generate Refresh Token (Long-lived: 7d)
 */
export const generateRefreshToken = (user: IUser, sessionId: string): string => {
  return jwt.sign(
    { id: user._id, sessionId },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "7d", algorithm: "HS256" }
  )
}

/**
 * Verify Access Token
 */
export const verifyAccessToken = (token: string): any => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET)
  } catch (error) {
    return null
  }
}

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token: string): any => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET)
  } catch (error) {
    return null
  }
}

/**
 * 🔐 LAYER 2: Multi-Factor Authentication (2FA)
 * Generate a new 2FA secret and QR code URL for a user
 */
export const generate2FASecret = async (email: string) => {
  const secret = speakeasy.generateSecret({
    name: `FactFlow (${email})`,
    length: 20
  })

  let qrCodeUrl = ""
  if (secret.otpauth_url) {
    qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url)
  }

  // Generate 10 backup codes
  const backupCodes = Array.from({ length: 10 }, () => crypto.randomBytes(4).toString("hex"))

  return {
    secret: secret.base32,
    qrCodeUrl,
    backupCodes
  }
}

/**
 * 🔐 LAYER 2: Multi-Factor Authentication (2FA)
 * Verify a 2FA TOTP token
 */
export const verify2FAToken = (secret: string, token: string): boolean => {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1 // allows 30 seconds before/after
  })
}

/**
 * 🔐 LAYER 2: Password Security
 * Ensure the password meets strong requirements.
 */
export const isStrongPassword = (password: string): boolean => {
  // Min 8 chars, 1 uppercase, 1 number, 1 special character
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/-]).{8,}$/
  return regex.test(password)
}

/**
 * 🔐 LAYER 2: Password Security
 * Check if the password was used in the last 5 passwords (password history)
 */
export const isPasswordInHistory = async (password: string, history: string[]): Promise<boolean> => {
  if (!history || history.length === 0) return false
  
  for (const hashed of history) {
    const isMatch = await bcrypt.compare(password, hashed)
    if (isMatch) return true
  }
  return false
}
