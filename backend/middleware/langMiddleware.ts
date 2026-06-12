import { Request, Response, NextFunction } from "express"
import { detectLanguage } from "../utils/langDetect"

export function languageMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const acceptLang = req.headers["accept-language"]
  if (acceptLang) {
    const preferred = acceptLang.split(",")[0]?.split("-")[0]?.toLowerCase()
    if (preferred && ["en", "hi", "mr", "ta", "te", "bn", "gu", "pa"].includes(preferred)) {
      ;(req as any).detectedLang = preferred
    }
  }

  if (req.body?.text) {
    ;(req as any).detectedLang = detectLanguage(req.body.text).toLowerCase()
  }

  next()
}
