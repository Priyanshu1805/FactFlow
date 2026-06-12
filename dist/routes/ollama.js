"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ollamaController_1 = require("../controllers/ollamaController");
const router = (0, express_1.Router)();
router.post("/generate", ollamaController_1.generateContent);
router.post("/summarize", ollamaController_1.summarizeArticle);
exports.default = router;
//# sourceMappingURL=ollama.js.map