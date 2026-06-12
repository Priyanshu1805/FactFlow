"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function run() {
    await mongoose_1.default.connect(process.env.MONGODB_URI);
    const counts = await mongoose_1.default.connection.db.collection('newsarticles').aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
    ]).toArray();
    console.log(counts);
    process.exit(0);
}
run();
//# sourceMappingURL=check-db.js.map