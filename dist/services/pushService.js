"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSocket = setSocket;
exports.getSocket = getSocket;
exports.sendPushNotification = sendPushNotification;
const web_push_1 = __importDefault(require("web-push"));
// Trigger restart
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";
if (vapidPublicKey && vapidPrivateKey) {
    web_push_1.default.setVapidDetails("mailto:support@factflow.app", vapidPublicKey, vapidPrivateKey);
}
let ioInstance = null;
function setSocket(io) {
    ioInstance = io;
}
function getSocket() {
    return ioInstance;
}
async function sendPushNotification(subscription, payload) {
    try {
        await web_push_1.default.sendNotification(subscription, JSON.stringify(payload));
        return true;
    }
    catch (err) {
        if (err.statusCode === 410) {
            console.warn("🔔 Push subscription expired");
        }
        else {
            console.error("❌ Push send failed:", err.message);
        }
        return false;
    }
}
//# sourceMappingURL=pushService.js.map