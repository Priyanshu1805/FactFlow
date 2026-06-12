import mongoose from "mongoose"
import { configureDBSecurity } from "./dbSecurity"

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error("MONGODB_URI is not defined in environment variables")

  try {
    await mongoose.connect(uri)
    console.log("✅ MongoDB connected successfully")

    // 🧱 LAYER 3: Apply Advanced DB Security Policies
    configureDBSecurity()
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error)
    process.exit(1)
  }

  mongoose.connection.on("disconnected", () => console.warn("⚠️  MongoDB disconnected"))
  mongoose.connection.on("error", (err) => console.error("MongoDB error:", err))
}
