import { Response } from "express"
import { UserPreferences } from "../models/UserPreferences"
import { AuthRequest } from "../middleware/auth"

const DEFAULTS = {
  lang: "en",
  region: "India",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "12-hour",
  theme: "dark",
  fontSize: "medium",
}

export async function getPreferences(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ success: false, error: "Not authenticated" })
      return
    }

    const prefs = await UserPreferences.findOne({ userId }).lean()

    if (!prefs) {
      res.json({ success: true, data: { ...DEFAULTS } })
      return
    }

    res.json({ success: true, data: prefs })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function updatePreferences(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ success: false, error: "Not authenticated" })
      return
    }

    const prefs = await UserPreferences.findOneAndUpdate(
      { userId },
      { $set: req.body },
      { upsert: true, new: true }
    )

    res.json({ success: true, data: prefs })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}
