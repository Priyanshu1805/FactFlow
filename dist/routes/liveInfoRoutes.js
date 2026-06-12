"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const liveInfoController_1 = require("../controllers/liveInfoController");
const router = express_1.default.Router();
// POST /api/live-info
// Using POST so we can easily send a JSON body with an array of requested widgets
router.post("/", liveInfoController_1.getLiveInfo);
exports.default = router;
//# sourceMappingURL=liveInfoRoutes.js.map