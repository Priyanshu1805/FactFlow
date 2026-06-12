"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
function sendSuccess(res, data, message, statusCode = 200) {
    res.status(statusCode).json({ success: true, data, ...(message && { message }) });
}
function sendError(res, error, statusCode = 500) {
    res.status(statusCode).json({ success: false, error });
}
//# sourceMappingURL=response.js.map