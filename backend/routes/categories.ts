import { Router } from "express"

const router = Router()

const categories = [
  { id: "1", name: "Technology", slug: "technology", icon: "Cpu", color: "#3b82f6" },
  { id: "2", name: "Sports", slug: "sports", icon: "Gamepad2", color: "#22c55e" },
  { id: "3", name: "Entertainment", slug: "entertainment", icon: "Film", color: "#a855f7" },
  { id: "4", name: "Crypto", slug: "crypto", icon: "TrendingUp", color: "#f97316" },
  { id: "5", name: "Celebrities", slug: "celebrities", icon: "Star", color: "#ec4899" },
  { id: "6", name: "World", slug: "world", icon: "Globe", color: "#06b6d4" },
  { id: "7", name: "Science", slug: "science", icon: "FlaskConical", color: "#84cc16" },
  { id: "8", name: "Memes", slug: "memes", icon: "Laugh", color: "#eab308" },
]

// GET /api/categories
router.get("/", (_req, res) => {
  res.json({ success: true, data: categories })
})

export default router
