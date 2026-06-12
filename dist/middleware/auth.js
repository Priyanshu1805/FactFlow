"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authenticate = void 0;
exports.authenticateFirebase = authenticateFirebase;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const authProtection_1 = require("./authProtection");
exports.authenticate = authProtection_1.requireAuth;
exports.requireRole = authProtection_1.requireRole;
async function authenticateFirebase(req, res, next) {
    try {
        let firebaseUid = req.query.firebaseUid || req.body.firebaseUid;
        if (!firebaseUid) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith("Bearer ")) {
                const token = authHeader.split(" ")[1];
                const decoded = jsonwebtoken_1.default.decode(token);
                if (decoded && (decoded.uid || decoded.user_id)) {
                    firebaseUid = decoded.uid || decoded.user_id;
                }
            }
        }
        if (!firebaseUid) {
            res.status(401).json({ success: false, error: "No firebaseUid provided." });
            return;
        }
        const user = await User_1.User.findOne({ firebaseUid });
        if (!user) {
            res.status(401).json({ success: false, error: "User not found." });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({ success: false, error: "Authentication failed." });
    }
}
//# sourceMappingURL=auth.js.map