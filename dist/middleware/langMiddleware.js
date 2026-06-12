"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.languageMiddleware = languageMiddleware;
const langDetect_1 = require("../utils/langDetect");
function languageMiddleware(req, _res, next) {
    const acceptLang = req.headers["accept-language"];
    if (acceptLang) {
        const preferred = acceptLang.split(",")[0]?.split("-")[0]?.toLowerCase();
        if (preferred && ["en", "hi", "mr", "ta", "te", "bn", "gu", "pa"].includes(preferred)) {
            ;
            req.detectedLang = preferred;
        }
    }
    if (req.body?.text) {
        ;
        req.detectedLang = (0, langDetect_1.detectLanguage)(req.body.text).toLowerCase();
    }
    next();
}
//# sourceMappingURL=langMiddleware.js.map