import multer from "multer"
import { v2 as cloudinary } from "cloudinary"
import { Request } from "express"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Multer memory storage
const storage = multer.memoryStorage()

// File filter to allow only videos
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith("video/")) {
    cb(null, true)
  } else {
    cb(new Error("Only video files are allowed!"))
  }
}

export const uploadVideo = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
})

// Helper to upload buffer to Cloudinary
export const uploadBufferToCloudinary = (buffer: Buffer, folder: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "video",
      },
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      }
    )
    uploadStream.end(buffer)
  })
}
