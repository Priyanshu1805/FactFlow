"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdTracking = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const adTrackingSchema = new mongoose_1.default.Schema({
    adId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Ad", required: true },
    action: { type: String, enum: ["view", "click"], required: true },
    identifier: { type: String, required: true }, // IP address or Firebase UID
}, { timestamps: true });
// Compound index to enforce uniqueness: One specific action per ad per user/IP
adTrackingSchema.index({ adId: 1, action: 1, identifier: 1 }, { unique: true });
exports.AdTracking = mongoose_1.default.model("AdTracking", adTrackingSchema);
//# sourceMappingURL=AdTracking.js.map