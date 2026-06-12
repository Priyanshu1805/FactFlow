import { Request, Response } from "express"
import { Reel } from "../models/Reel"
import { uploadBufferToCloudinary } from "../middleware/videoUpload"

// GET /api/reels
export async function getAllReels(req: Request, res: Response): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(50, parseInt(req.query.limit as string) || 10)
    const { tag, source, author } = req.query
    const search = req.query.search as string
    const query: Record<string, any> = {}
    if (tag) query.tags = { $in: [tag as string] }
    if (source) query.source = source
    if (author) query.author = author
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ]
    }

    const total = await Reel.countDocuments(query)
    const reels = await Reel.find(query)
      .sort({ views: -1, publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    res.json({
      success: true,
      data: reels,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch reels" })
  }
}

// GET /api/reels/:id
export async function getReelById(req: Request, res: Response): Promise<void> {
  try {
    const reel = await Reel.findById(req.params.id).lean()
    if (!reel) {
      res.status(404).json({ success: false, error: "Reel not found" })
      return
    }
    await Reel.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } })
    res.json({ success: true, data: reel })
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch reel" })
  }
}

// POST /api/reels — Admin/Editor
export async function createReel(req: Request, res: Response): Promise<void> {
  try {
    const { title, description, videoUrl, thumbnailUrl, duration, tags, author, source } = req.body

    if (!title || !videoUrl || !thumbnailUrl || !duration) {
      res.status(400).json({
        success: false,
        error: "Missing required fields: title, videoUrl, thumbnailUrl, duration",
      })
      return
    }

    const reel = await Reel.create({
      title, description, videoUrl, thumbnailUrl, duration,
      tags: tags || [],
      author: author || "Fact Flow",
      source: source || "manual",
    })

    res.status(201).json({ success: true, data: reel, message: "Reel created successfully" })
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to create reel" })
  }
}

// POST /api/reels/:id/like
export async function likeReel(req: Request, res: Response): Promise<void> {
  try {
    const reel = await Reel.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    )
    if (!reel) {
      res.status(404).json({ success: false, error: "Reel not found" })
      return
    }
    res.json({ success: true, data: { likes: reel.likes } })
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to like reel" })
  }
}

// DELETE /api/reels/:id — Admin only
export async function deleteReel(req: Request, res: Response): Promise<void> {
  try {
    const reel = await Reel.findByIdAndDelete(req.params.id)
    if (!reel) {
      res.status(404).json({ success: false, error: "Reel not found" })
      return
    }
    res.json({ success: true, message: "Reel deleted successfully" })
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to delete reel" })
  }
}

// POST /api/reels/upload — Authenticated Users
export async function uploadUserReel(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: "No video file provided" })
      return
    }

    const { title, description } = req.body
    if (!title) {
      res.status(400).json({ success: false, error: "Title is required" })
      return
    }

    // Upload to Cloudinary
    const result = await uploadBufferToCloudinary(req.file.buffer, "factflow_reels")
    
    // Create DB entry
    const reel = await Reel.create({
      title: title.slice(0, 200),
      description: description || "",
      videoUrl: result.secure_url,
      // Cloudinary auto-generates thumbnails for videos using .jpg extension
      thumbnailUrl: result.secure_url.replace(/\.[^/.]+$/, ".jpg"),
      duration: result.duration || 30,
      tags: ["UserUpload"],
      author: (req as any).user?.name || "Fact Flow User", // from auth middleware
      source: "manual",
      cloudinaryId: result.public_id,
    })

    const io = req.app.get("io")
    if (io) {
      io.emit("new_reel", reel)
    }

    res.status(201).json({ success: true, data: reel, message: "Reel uploaded successfully" })
  } catch (error: any) {
    console.error("Upload error:", error)
    res.status(500).json({ success: false, error: "Failed to upload reel" })
  }
}
