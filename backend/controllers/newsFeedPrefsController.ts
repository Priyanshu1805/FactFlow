import { Request, Response } from "express"
import { NewsFeedPrefs } from "../models/NewsFeedPrefs"
import { AuthRequest } from "../middleware/auth"

export async function getFeedPrefs(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ success: false, error: "Not authenticated" })
      return
    }

    const prefs = await NewsFeedPrefs.findOne({ userId })

    if (!prefs) {
      res.json({
        success: true,
        data: {
          followedTopics: ["politics", "trending", "lifestyle", "sports", "tech", "art"],
          feedSortOrder: "latest",
          newsLanguages: ["English"],
          reels: { autoPlay: true, wifiOnly: false, captions: false },
          saved: { offlineReading: false, autoRemove: false, autoRemoveDays: 30 },
        },
      })
      return
    }

    res.json({ success: true, data: prefs })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function updateFeedPrefs(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ success: false, error: "Not authenticated" })
      return
    }

    const prefs = await NewsFeedPrefs.findOneAndUpdate(
      { userId },
      { $set: (req as any).body },
      { upsert: true, new: true }
    )

    res.json({ success: true, data: prefs })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}
