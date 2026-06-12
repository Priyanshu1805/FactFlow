import { Router, Request, Response } from "express"
import multer from "multer"
import { v2 as cloudinary } from "cloudinary"
import dotenv from "dotenv"

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const router = Router()

// Use memory storage for multer
const storage = multer.memoryStorage()
const upload = multer({ storage })

router.post("/", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" })
    }

    // Determine resource type based on mimetype
    const resourceType = req.file.mimetype.startsWith("video/") ? "video" : "image"

    // Upload to Cloudinary via stream
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType, folder: "factflow_uploads" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error)
          return res.status(500).json({ error: "Failed to upload to Cloudinary" })
        }
        res.json({
          success: true,
          url: result?.secure_url,
          format: result?.format,
          resourceType: result?.resource_type,
        })
      }
    )

    uploadStream.end(req.file.buffer)
  } catch (err: any) {
    console.error("Upload error:", err)
    res.status(500).json({ error: "Internal server error during upload" })
  }
})

export default router
