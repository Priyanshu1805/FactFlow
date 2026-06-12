"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPreferences = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const UserPreferencesSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    lang: { type: String, default: "en" },
    region: {
        code: { type: String, default: "IN" },
        name: { type: String, default: "India" },
        language: { type: String, default: "English" }
    },
    dateFormat: { type: String, default: "DD/MM/YYYY" },
    timeFormat: { type: String, default: "12-hour" },
    theme: { type: String, enum: ["light", "dark", "glass"], default: "dark" },
    fontSize: { type: String, enum: ["small", "medium", "large"], default: "medium" },
    audioVideo: {
        autoPlayVideos: { type: Boolean, default: true },
        autoPlayOnWifiOnly: { type: Boolean, default: true },
        muteByDefault: { type: Boolean, default: true },
        showSubtitles: { type: Boolean, default: false },
        hdOnWifi: { type: Boolean, default: true },
        videoQuality: { type: String, enum: ["auto", "360p", "720p", "1080p"], default: "auto" },
        enableAudioNews: { type: Boolean, default: false },
        backgroundAudio: { type: Boolean, default: false },
        voiceSpeed: { type: String, enum: ["0.75x", "1x", "1.25x", "1.5x", "2x"], default: "0.75x" },
    },
}, { timestamps: true });
exports.UserPreferences = mongoose_1.default.model("UserPreferences", UserPreferencesSchema);
//# sourceMappingURL=UserPreferences.js.map