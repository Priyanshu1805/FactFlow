import dns from "dns"
dns.setDefaultResultOrder("ipv4first")
import "dotenv/config"
import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import { createServer } from "http"
import { Server as SocketIOServer } from "socket.io"
import rateLimit from "express-rate-limit"
import next from "next"

const dev = process.env.NODE_ENV !== "production"
const nextApp = next({ dev, dir: process.cwd() })
const nextHandler = nextApp.getRequestHandler()

import { connectDB } from "./config/database"
import { helmetConfig } from "./config/helmetConfig"
import { globalRateLimiter, ddosSlowDown, checkBlockedIP, geoBlocker } from "./middleware/networkProtection"
import { dataProtectionSuite } from "./middleware/dataProtection"
import { auditLogger } from "./middleware/auditLogger"
import newsRoutes from "./routes/news"
import reelsRoutes from "./routes/reels"
import authRoutes from "./routes/auth"
import categoriesRoutes from "./routes/categories"
import settingsRoutes from "./routes/settings"
import searchRoutes from "./routes/search"
import usersRoutes from "./routes/users"
import uploadRoutes from "./routes/upload"
import storiesRoutes from "./routes/stories"
import postsRoutes from "./routes/posts"
import chatsRoutes from "./routes/chats"
import messagesRoutes from "./routes/messages"
import notificationsRoutes from "./routes/notifications"
import subscriptionRoutes from "./routes/subscription"
import paymentRoutes from "./routes/payment"
import newsFeedRoutes from "./routes/newsFeedRoutes"
import notificationPrefsRoutes from "./routes/notificationRoutes"
import contactRoutes from "./routes/contact"
import ollamaRoutes from "./routes/ollama"
import userPreferencesRoutes from "./routes/userPreferencesRoutes"
import preferencesRoutes from "./routes/preferences"
import adRoutes from "./routes/adRoutes"
import { startNewsCycleManager } from "./services/newsCycleManager"
import { startEmailCronJobs } from "./services/emailCronService"
import { startLiveStreamCron } from "./services/liveStreamUpdater"
import liveInfoRoutes from "./routes/liveInfoRoutes"

import { syncYoutubeReels } from "./services/youtubeService"

const app = express()
const httpServer = createServer(app)

// ─────────────────────────────────────────────
// Socket.IO — Real-time live updates
// ─────────────────────────────────────────────
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (process.env.NODE_ENV !== "production") {
        return callback(null, true)
      }
      const isAllowed = !origin || 
        origin.includes("localhost") || 
        origin.includes("127.0.0.1") ||
        origin === process.env.FRONTEND_URL ||
        /^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin) ||
        origin.includes("ngrok");
      
      if (isAllowed) {
        callback(null, true)
      } else {
        callback(new Error("Not allowed by CORS"))
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  },
})

// Track online users: userId -> socket.id
const onlineUsers = new Map<string, string>()

io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`)

  socket.on("join_article", (articleId: string) => {
    socket.join(`article_${articleId}`)
    console.log(`🔌 Client ${socket.id} joined article_${articleId}`)
  })

  socket.on("leave_article", (articleId: string) => {
    socket.leave(`article_${articleId}`)
    console.log(`🔌 Client ${socket.id} left article_${articleId}`)
  })

  // Profile Rooms for Real-Time Social Counts
  socket.on("join_profile", (profileId: string) => {
    socket.join(`profile_${profileId}`)
    console.log(`🔌 Client ${socket.id} joined profile_${profileId}`)
  })

  socket.on("leave_profile", (profileId: string) => {
    socket.leave(`profile_${profileId}`)
    console.log(`🔌 Client ${socket.id} left profile_${profileId}`)
  })

  // Chat Rooms
  socket.on("join_chat", (chatId: string) => {
    socket.join(`chat_${chatId}`)
    console.log(`🔌 Client ${socket.id} joined chat_${chatId}`)
  })

  socket.on("leave_chat", (chatId: string) => {
    socket.leave(`chat_${chatId}`)
    console.log(`🔌 Client ${socket.id} left chat_${chatId}`)
  })

  // Typing Indicators
  socket.on("typing", (data: { chatId: string; username: string }) => {
    socket.in(`chat_${data.chatId}`).emit("typing", data)
  })

  socket.on("stop_typing", (data: { chatId: string; username: string }) => {
    socket.in(`chat_${data.chatId}`).emit("stop_typing", data)
  })

  // ─────────────────────────────────────────────
  // WebRTC Call Signaling Handlers
  // ─────────────────────────────────────────────
  socket.on("register_user", (userId: string) => {
    socket.join(`user_${userId}`)
    // Track online presence
    onlineUsers.set(userId, socket.id)
    // Notify all other sockets that this user came online
    socket.broadcast.emit("user_online", { userId })
    console.log(`🔌 User registered calling room: user_${userId} [online: ${onlineUsers.size}]`)
  })

  socket.on("call_user", (data: { targetUserId: string; offer: any; callerName: string; callType: string; fromUserId: string }) => {
    socket.to(`user_${data.targetUserId}`).emit("incoming_call", {
      fromUserId: data.fromUserId,
      offer: data.offer,
      callerName: data.callerName,
      callType: data.callType
    })
  })

  socket.on("answer_call", (data: { targetUserId: string; answer: any }) => {
    socket.to(`user_${data.targetUserId}`).emit("call_answered", {
      answer: data.answer
    })
  })

  socket.on("ice_candidate", (data: { targetUserId: string; candidate: any }) => {
    socket.to(`user_${data.targetUserId}`).emit("ice_candidate", {
      candidate: data.candidate
    })
  })

  socket.on("end_call", (data: { targetUserId: string }) => {
    socket.to(`user_${data.targetUserId}`).emit("call_ended")
  })

  // Check if a specific user is online
  socket.on("check_online_status", (data: { userId: string }, callback: Function) => {
    const isOnline = onlineUsers.has(data.userId)
    if (typeof callback === "function") {
      callback({ userId: data.userId, isOnline })
    } else {
      socket.emit("online_status_result", { userId: data.userId, isOnline })
    }
  })

  socket.on("disconnect", () => {
    // Find which userId this socket belonged to
    let disconnectedUserId: string | null = null
    for (const [userId, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        disconnectedUserId = userId
        break
      }
    }
    if (disconnectedUserId) {
      onlineUsers.delete(disconnectedUserId)
      socket.broadcast.emit("user_offline", { userId: disconnectedUserId })
      console.log(`🔌 User offline: ${disconnectedUserId} [online: ${onlineUsers.size}]`)
    }
    console.log(`🔌 Client disconnected: ${socket.id}`)
  })
})

// Make io accessible in controllers
app.set("io", io)

// ─────────────────────────────────────────────
// Core Middleware
// ─────────────────────────────────────────────
app.use(helmetConfig)

// 🛡️ LAYER 1: Entry Gate Security
app.use(checkBlockedIP)
// app.use(geoBlocker) // Optional toggle
app.use(globalRateLimiter)
app.use(ddosSlowDown)

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || process.env.NODE_ENV !== "production") {
      return callback(null, true)
    }
    const isAllowed = 
      origin.includes("localhost") || 
      origin.includes("127.0.0.1") ||
      origin === process.env.FRONTEND_URL ||
      /^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin) ||
      origin.includes("ngrok");
    
    if (isAllowed) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Layer 1: Whitelist methods
}))
app.use(express.json({ limit: "10mb" })) // Limit body size
app.use(express.urlencoded({ extended: true }))

// 🧱 LAYER 3: Data Protection
app.use(dataProtectionSuite)

// 👁️ LAYER 4: Audit Logger & IDS
app.use(auditLogger)

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"))
}

// Trust proxy is needed because Next.js rewrites forward traffic from localhost
app.set("trust proxy", 1)

// ─────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────
app.use("/api/auth", authRoutes)
import { getHomeBalanced } from "./routes/news/homeBalanced"
app.get("/api/news/home-balanced", getHomeBalanced)
app.use("/api/news", newsRoutes)
app.use("/api/reels", reelsRoutes)
app.use("/api/categories", categoriesRoutes)
app.use("/api/settings", settingsRoutes)
app.use("/api/search", searchRoutes)
app.use("/api/users", usersRoutes)
app.use("/api/upload", uploadRoutes)
app.use("/api/stories", storiesRoutes)
app.use("/api/posts", postsRoutes)
app.use("/api/chats", chatsRoutes)
app.use("/api/messages", messagesRoutes)
app.use("/api/notifications", notificationsRoutes)
app.use("/api/live-info", liveInfoRoutes)
app.use("/api/subscription", subscriptionRoutes)
app.use("/api/payment", paymentRoutes)
app.use("/api/newsfeed/prefs", newsFeedRoutes)
app.use("/api/notifications/prefs", notificationPrefsRoutes)
app.use("/api/ollama", ollamaRoutes)
app.use("/api/user/preferences", userPreferencesRoutes)
import liveChannelsRoutes from "./routes/liveChannels"
app.use("/api/live-channels", liveChannelsRoutes)
import externalArticlesRoutes from "./routes/externalArticles"
app.use("/api/external-articles", externalArticlesRoutes)
app.use("/api", preferencesRoutes)
app.use("/api/contact", contactRoutes)
app.use("/api/ads", adRoutes)

import adminSecurityRoutes from "./routes/admin/security"
app.use("/api/admin/security", adminSecurityRoutes)

import { getHomeBalanced } from "./routes/news/homeBalanced"
import { reclassifyArticle } from "./routes/admin/reclassify"
import { getClassificationStats } from "./routes/admin/classificationStats"
import { authenticate, requireRole } from "./middleware/auth"

app.patch("/api/admin/articles/:id/section", authenticate, requireRole("admin", "editor"), reclassifyArticle)
app.get("/api/admin/classification-stats", authenticate, requireRole("admin", "editor"), getClassificationStats)
import adminDashboardRoutes from "./routes/adminDashboard"
app.use("/api/admin-dashboard", adminDashboardRoutes)

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "Fact Flow Backend API",
    version: "1.0.0",
  })
})

// Next.js handler for all other routes
app.all("*", (req, res) => {
  return nextHandler(req, res)
})

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err.message)
  res.status(500).json({ success: false, error: "Internal server error" })
})

// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || "5000", 10)

async function start(): Promise<void> {
  await connectDB()

  console.log("Preparing Next.js app...")
  await nextApp.prepare()
  console.log("Next.js app prepared!")

  // Render specific timeouts to prevent 502 errors
  httpServer.keepAliveTimeout = 120000; // 120 seconds
  httpServer.headersTimeout = 120000; // 120 seconds

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log("\n╔══════════════════════════════════════╗")
    console.log("║     🔥 FACT FLOW BACKEND RUNNING     ║")
    console.log("╠══════════════════════════════════════╣")
    console.log(`║  URL  : http://0.0.0.0:${PORT}         ║`)
    console.log(`║  Mode : ${(process.env.NODE_ENV || "development").padEnd(28)}║`)
    console.log("╚══════════════════════════════════════╝\n")
  })

  // Only run heavy cron jobs in production or if explicitly enabled
  const runCrons = process.env.NODE_ENV === "production" || process.env.ENABLE_CRON === "true";
  
  if (runCrons) {
    // Start smart automated news pipeline
    startNewsCycleManager()
    
    // Start email digest cron jobs
    startEmailCronJobs()

    // Start Live TV stream updater cron
    startLiveStreamCron()

    // Sync YouTube reels on startup if token provided
    if (process.env.YOUTUBE_API_KEY) {
      console.log("📸 Syncing YouTube shorts...")
      try {
        await syncYoutubeReels()
      } catch (syncError: any) {
        console.error("❌ YouTube sync failed on startup:", syncError.message || syncError)
      }
    }
  } else {
    console.log("⚡ Skipping heavy cron jobs (dev mode). Set ENABLE_CRON=true to run them.");
  }
}

if (process.env.NODE_ENV !== "test") {
  start().catch((err) => {
    console.error("Failed to start server:", err)
    process.exit(1)
  })
}

export { app }
