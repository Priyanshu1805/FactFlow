export declare const sendSecurityAlert: (subject: string, html: string) => Promise<void>;
/**
 * 👁️ LAYER 4: Security Event Logging
 */
export declare const logSecurityEvent: (params: {
    event: string;
    userId?: any;
    ip: string;
    userAgent: string;
    severity: "low" | "medium" | "high" | "critical";
    details?: Record<string, any>;
}) => Promise<void>;
/**
 * 👁️ LAYER 4: Intrusion Detection System (IDS)
 * Checks the request URL, body, and query for common attack signatures.
 * Returns true if an attack is detected.
 */
export declare const detectIntrusion: (req: any) => boolean;
/**
 * 👁️ LAYER 4: Auto-Ban IP
 */
export declare const autoBanIp: (ip: string, reason: string) => Promise<void>;
//# sourceMappingURL=securityMonitor.d.ts.map