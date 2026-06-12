"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.getMe = getMe;
const User_1 = require("../models/User");
const authService_1 = require("../services/authService");
const uuid_1 = require("uuid");
// POST /api/auth/register
async function register(req, res) {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ success: false, error: "Name, email, and password are required" });
            return;
        }
        if (!(0, authService_1.isStrongPassword)(password)) {
            res.status(400).json({ success: false, error: "Password must be at least 8 characters, include an uppercase letter, a number, and a special character." });
            return;
        }
        const existingUser = await User_1.User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            res.status(409).json({ success: false, error: "An account with this email already exists" });
            return;
        }
        const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || email)}`;
        const user = await User_1.User.create({
            name,
            email,
            password,
            avatar: defaultAvatar,
            failedLoginAttempts: 0,
            activeSessions: []
        });
        const sessionId = (0, uuid_1.v4)();
        const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '0.0.0.0';
        const userAgent = req.headers['user-agent'] || 'unknown';
        user.activeSessions.push({ sessionId, ip, userAgent, createdAt: new Date() });
        await user.save();
        const accessToken = (0, authService_1.generateAccessToken)(user, sessionId);
        const refreshToken = (0, authService_1.generateRefreshToken)(user, sessionId);
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.status(201).json({
            success: true,
            data: { user, token: accessToken }, // Maintain compatibility with frontend
            message: "Account created successfully",
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Registration failed. Please try again." });
    }
}
// POST /api/auth/login
async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, error: "Email and password are required" });
            return;
        }
        const user = await User_1.User.findOne({ email: email.toLowerCase() }).select("+password +passwordHistory");
        if (!user) {
            res.status(401).json({ success: false, error: "Invalid email or password" });
            return;
        }
        // LAYER 2: Brute Force Protection (Account Lock)
        if (user.lockUntil && user.lockUntil > new Date()) {
            const remainingMinutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
            res.status(423).json({ success: false, error: `Account locked due to multiple failed attempts. Try again in ${remainingMinutes} minutes.` });
            return;
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            // Increment failed login attempts
            user.failedLoginAttempts += 1;
            if (user.failedLoginAttempts >= 5) {
                user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
            }
            await user.save();
            res.status(401).json({ success: false, error: "Invalid email or password" });
            return;
        }
        // Reset failed attempts on successful login
        user.failedLoginAttempts = 0;
        user.lockUntil = undefined;
        // Session Management (Max 3 sessions)
        const sessionId = (0, uuid_1.v4)();
        const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '0.0.0.0';
        const userAgent = req.headers['user-agent'] || 'unknown';
        if (user.activeSessions.length >= 3) {
            user.activeSessions.shift(); // Remove oldest session
        }
        user.activeSessions.push({ sessionId, ip, userAgent, createdAt: new Date() });
        await user.save();
        const accessToken = (0, authService_1.generateAccessToken)(user, sessionId);
        const refreshToken = (0, authService_1.generateRefreshToken)(user, sessionId);
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.json({
            success: true,
            data: { user, token: accessToken }, // Maintain compatibility with frontend
            message: "Login successful",
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Login failed. Please try again." });
    }
}
// GET /api/auth/me
async function getMe(req, res) {
    try {
        const user = await User_1.User.findById(req.user?._id);
        if (!user) {
            res.status(404).json({ success: false, error: "User not found" });
            return;
        }
        res.json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch user" });
    }
}
//# sourceMappingURL=authController.js.map