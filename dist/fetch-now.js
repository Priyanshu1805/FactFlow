"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const newsCronService_1 = require("./services/newsCronService");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function run() {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected');
        await (0, newsCronService_1.fetchAllNewsNow)();
        console.log('Done!');
    }
    catch (error) {
        console.error(error);
    }
    finally {
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
}
run();
//# sourceMappingURL=fetch-now.js.map