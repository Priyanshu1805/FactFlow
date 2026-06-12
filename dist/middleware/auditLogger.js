"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogger = void 0;
const securityMonitor_1 = require("../services/securityMonitor");
/**
 * 👁️ LAYER 4: Audit Logger & Intrusion Detection Middleware
 */
const auditLogger = async (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '0.0.0.0';
    const userAgent = req.headers['user-agent'] || 'unknown';
    // 1. Run Intrusion Detection System
    const isAttack = (0, securityMonitor_1.detectIntrusion)(req);
    if (isAttack) {
        // Log the attack
        await (0, securityMonitor_1.logSecurityEvent)({
            event: "Intrusion Attempt Detected",
            ip,
            userAgent,
            severity: "critical",
            details: {
                url: req.originalUrl,
                method: req.method,
                body: req.body,
                query: req.query
            }
        });
        // Auto-ban the IP
        await (0, securityMonitor_1.autoBanIp)(ip, "Detected malicious payload matching intrusion signatures.");
        res.status(403).json({ success: false, error: "Access denied. Malicious activity detected." });
        return;
    }
    // 2. Log Admin/Editor actions (Mutations only)
    if (req.user && ['admin', 'editor', 'superadmin'].includes(req.user.role)) {
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
            // We wait for the response to finish to log success/failure
            res.on('finish', async () => {
                await (0, securityMonitor_1.logSecurityEvent)({
                    event: "Admin Action",
                    userId: req.user?._id,
                    ip,
                    userAgent,
                    severity: "low",
                    details: {
                        action: `${req.method} ${req.originalUrl}`,
                        status: res.statusCode
                    }
                });
            });
        }
    }
    next();
};
exports.auditLogger = auditLogger;
//# sourceMappingURL=auditLogger.js.map