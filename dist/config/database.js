"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const dbSecurity_1 = require("./dbSecurity");
async function connectDB() {
    const uri = process.env.MONGODB_URI;
    if (!uri)
        throw new Error("MONGODB_URI is not defined in environment variables");
    try {
        await mongoose_1.default.connect(uri);
        console.log("✅ MongoDB connected successfully");
        // 🧱 LAYER 3: Apply Advanced DB Security Policies
        (0, dbSecurity_1.configureDBSecurity)();
    }
    catch (error) {
        console.error("❌ MongoDB connection failed:", error);
        process.exit(1);
    }
    mongoose_1.default.connection.on("disconnected", () => console.warn("⚠️  MongoDB disconnected"));
    mongoose_1.default.connection.on("error", (err) => console.error("MongoDB error:", err));
}
//# sourceMappingURL=database.js.map