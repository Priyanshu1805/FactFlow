"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureDBSecurity = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * 🧱 LAYER 3: Advanced Database Security Configurations
 * Applied globally to the Mongoose connection.
 */
const configureDBSecurity = () => {
    // 1. Prevent $where NoSQL injections globally (if Mongoose supports it)
    // mongoose.set("sanitizeFilter", true) // DISABLED: Breaks internal queries. We rely on mongo-sanitize middleware instead.
    // 2. Strict Query Mode: Only allows querying fields defined in the schema
    mongoose_1.default.set("strictQuery", true);
    // 3. Remove __v and other internal fields from ALL JSON outputs by default across all models
    mongoose_1.default.plugin((schema) => {
        schema.set("toJSON", {
            virtuals: true,
            transform: (doc, ret) => {
                delete ret.__v;
                // Prevent accidental leaking of common sensitive fields
                delete ret.password;
                delete ret.token;
                delete ret.secret;
                return ret;
            }
        });
    });
};
exports.configureDBSecurity = configureDBSecurity;
//# sourceMappingURL=dbSecurity.js.map