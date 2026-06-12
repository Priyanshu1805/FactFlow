import { Router, Request, Response } from "express"
import { Story } from "../models/Story"
import { User } from "../models/User"

const router = Router()

// ─────────────────────────────────────────────
// POST /api/stories
// Create a new story
// ─────────────────────────────────────────────
router.post("/", async (req: Request, res: Response) => {
  try {
    const { firebaseUid, mediaUrl, mediaType, caption } = req.body

    if (!firebaseUid || !mediaUrl || !mediaType) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const user = await User.findOne({ firebaseUid })
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    const newStory = new Story({
      user: user._id,
      mediaUrl,
      mediaType,
      caption
    })

    await newStory.save()

    res.json({ success: true, story: newStory })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────
// GET /api/stories
// Get all active stories grouped by user
// ─────────────────────────────────────────────
router.get("/", async (req: Request, res: Response) => {
  try {
    // Only fetch stories that haven't expired
    const activeStories = await Story.find({ expiresAt: { $gt: new Date() } })
      .populate("user", "username name avatar")
      .sort({ createdAt: 1 })

    // Group by user
    const groupedStories: Record<string, any> = {}

    activeStories.forEach(story => {
      const user = story.user as any
      if (!user) return

      const userId = user._id.toString()
      if (!groupedStories[userId]) {
        groupedStories[userId] = {
          user: {
            _id: user._id,
            username: user.username,
            name: user.name,
            avatar: user.avatar
          },
          stories: []
        }
      }
      groupedStories[userId].stories.push({
        _id: story._id,
        mediaUrl: story.mediaUrl,
        mediaType: story.mediaType,
        caption: story.caption,
        createdAt: story.createdAt,
        expiresAt: story.expiresAt
      })
    })

    res.json({ success: true, data: Object.values(groupedStories) })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────
// DELETE /api/stories/:id
// Delete a story
// ─────────────────────────────────────────────
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const story = await Story.findByIdAndDelete(id)
    if (!story) {
      return res.status(404).json({ error: "Story not found" })
    }
    res.json({ success: true, message: "Story deleted successfully" })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
