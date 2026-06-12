import { Router } from "express"
import { generateContent, summarizeArticle } from "../controllers/ollamaController"

const router = Router()

router.post("/generate", generateContent)
router.post("/summarize", summarizeArticle)

export default router
