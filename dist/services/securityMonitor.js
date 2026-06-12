"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoBanIp = exports.detectIntrusion = exports.logSecurityEvent = exports.sendSecurityAlert = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const SecurityLog_1 = require("../models/SecurityLog");
const BlockedIP_1 = require("../models/BlockedIP");
// Configured for alerting admins
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});
const sendSecurityAlert = async (subject, html) => {
    if (!process.env.ADMIN_EMAIL)
        return; // Don't send if no admin email configured
    try {
        await transporter.sendMail({
            from: `"FactFlow Security" <${process.env.SMTP_USER}>`,
            to: process.env.ADMIN_EMAIL,
            subject: `🚨 [SECURITY ALERT] ${subject}`,
            html
        });
    }
    catch (error) {
        console.error("Failed to send security alert email:", error);
    }
};
exports.sendSecurityAlert = sendSecurityAlert;
/**
 * 👁️ LAYER 4: Security Event Logging
 */
const logSecurityEvent = async (params) => {
    try {
        await SecurityLog_1.SecurityLog.create(params);
        // Automatically alert admin for critical events
        if (params.severity === "critical") {
            await (0, exports.sendSecurityAlert)(`Critical Event: ${params.event}`, `
        <h3>Critical Security Event Detected</h3>
        <p><strong>Event:</strong> ${params.event}</p>
        <p><strong>IP:</strong> ${params.ip}</p>
        <p><strong>UserAgent:</strong> ${params.userAgent}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <pre>${JSON.stringify(params.details, null, 2)}</pre>
        `);
        }
    }
    catch (error) {
        console.error("Failed to log security event:", error);
    }
};
exports.logSecurityEvent = logSecurityEvent;
/**
 * 👁️ LAYER 4: Intrusion Detection System (IDS)
 * Checks the request URL, body, and query for common attack signatures.
 * Returns true if an attack is detected.
 */
const detectIntrusion = (req) => {
    const payload = [
        req.originalUrl,
        JSON.stringify(req.body || {}),
        JSON.stringify(req.query || {})
    ].join(" ").toLowerCase();
    // 1. SQL Injection Patterns
    const sqlPatterns = /(' or 1=1|drop table|union select|--|; waitfor delay)/i;
    // 2. NoSQL Injection Patterns
    const noSqlPatterns = /(\$gt:|\$where:|{\s*\$ne)/i;
    // 3. XSS Patterns
    const xssPatterns = /(<script>|javascript:|onerror=|onload=)/i;
    // 4. Path Traversal
    const pathTraversal = /(\.\.\/|\.\.%2f|\/etc\/passwd)/i;
    if (sqlPatterns.test(payload) || noSqlPatterns.test(payload) || xssPatterns.test(payload) || pathTraversal.test(payload)) {
        return true;
    }
    // Scanner user-agents
    const ua = (req.headers['user-agent'] || '').toLowerCase();
    if (ua.includes('sqlmap') || ua.includes('nikto') || ua.includes('burpsuite')) {
        return true;
    }
    return false;
};
exports.detectIntrusion = detectIntrusion;
/**
 * 👁️ LAYER 4: Auto-Ban IP
 */
const autoBanIp = async (ip, reason) => {
    try {
        const existing = await BlockedIP_1.BlockedIP.findOne({ ip });
        if (existing)
            return;
        await BlockedIP_1.BlockedIP.create({
            ip,
            reason,
            blockedAt: new Date(),
            isPermanent: true
        });
        await (0, exports.sendSecurityAlert)(`IP Banned: ${ip}`, `<p>IP <strong>${ip}</strong> has been permanently banned.</p><p>Reason: ${reason}</p>`);
    }
    catch (error) {
        console.error("Failed to ban IP:", error);
    }
};
exports.autoBanIp = autoBanIp;
//# sourceMappingURL=securityMonitor.js.map