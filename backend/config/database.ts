import mongoose from "mongoose"
import { configureDBSecurity } from "./dbSecurity"

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error("❌ CRITICAL: MONGODB_URI is not set. Server cannot start.")
    console.error("   Set MONGODB_URI in your environment (e.g., mongodb://localhost:27017/factflow)")
    process.exit(1)
  }

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
