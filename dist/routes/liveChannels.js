"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const LiveChannel_1 = require("../models/LiveChannel");
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    try {
        const channels = await LiveChannel_1.LiveChannel.find().sort({ lastUpdated: -1 });
        res.json({ success: true, channels });
    }
    catch (error) {
        console.error('Error fetching live channels:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch live channels' });
    }
});
exports.default = router;
//# sourceMappingURL=liveChannels.js.map