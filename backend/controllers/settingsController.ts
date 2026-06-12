import { Response } from "express"
import { AuthRequest } from "../middleware/auth"
import { User } from "../models/User"

export async function getSettings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await User.findById(req.user?.id).select("settings")
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" })
      return
    }
    res.json({ success: true, settings: user.settings })
  } catch (error: any) {
    console.error("Error fetching settings:", error.message)
    res.status(500).json({ success: false, error: "Server error" })
  }
}

export async function updateSettings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { settingType, value } = req.body
    
    const user = await User.findById(req.user?.id)
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" })
      return
    }

    if (settingType && value !== undefined) {
      if (settingType === 'theme' || settingType === 'fontSize' || settingType === 'fontStyle') {
        user.settings.appearance[settingType as "theme" | "fontSize" | "fontStyle"] = value;
      } else if (settingType === 'layout') {
        user.settings.layout = value;
      } else if (settingType === 'displayOptions') {
        user.settings.displayOptions = { ...user.settings.displayOptions, ...value };
      } else if (settingType === 'accessibility') {
        user.settings.accessibility = { ...user.settings.accessibility, ...value };
      } else if (settingType === 'privacy') {
        user.settings.privacy = { ...user.settings.privacy, ...value };
      }

      user.markModified('settings')
      await user.save()

      // Broadcast change via WebSocket
      const io = req.app.get("io");
      if (io) {
        io.to(`user_${user._id}`).emit('settingsChanged', { settingType, value });
      }
    }

    res.json({ success: true, settings: user.settings })
  } catch (error: any) {
    console.error("Error updating settings:", error.message)
    res.status(500).json({ success: false, error: "Server error" })
  }
}
