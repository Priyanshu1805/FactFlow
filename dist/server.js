"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const dns_1 = __importDefault(require("dns"));
dns_1.default.setDefaultResultOrder("ipv4first");
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const next_1 = __importDefault(require("next"));
const dev = process.env.NODE_ENV !== "production";
const nextApp = (0, next_1.default)({ dev, dir: process.cwd() });
const nextHandler = nextApp.getRequestHandler();
const database_1 = require("./config/database");
const helmetConfig_1 = require("./config/helmetConfig");
const networkProtection_1 = require("./middleware/networkProtection");
const dataProtection_1 = require("./middleware/dataProtection");
const auditLogger_1 = require("./middleware/auditLogger");
const news_1 = __importDefault(require("./routes/news"));
const reels_1 = __importDefault(require("./routes/reels"));
const auth_1 = __importDefault(require("./routes/auth"));
const categories_1 = __importDefault(require("./routes/categories"));
const settings_1 = __importDefault(require("./routes/settings"));
const search_1 = __importDefault(require("./routes/search"));
const users_1 = __importDefault(require("./routes/users"));
const upload_1 = __importDefault(require("./routes/upload"));
const stories_1 = __importDefault(require("./routes/stories"));
const posts_1 = __importDefault(require("./routes/posts"));
const chats_1 = __importDefault(require("./routes/chats"));
const messages_1 = __importDefault(require("./routes/messages"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const subscription_1 = __importDefault(require("./routes/subscription"));
const payment_1 = __importDefault(require("./routes/payment"));
const newsFeedRoutes_1 = __importDefault(require("./routes/newsFeedRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const contact_1 = __importDefault(require("./routes/contact"));
const ollama_1 = __importDefault(require("./routes/ollama"));
const userPreferencesRoutes_1 = __importDefault(require("./routes/userPreferencesRoutes"));
const preferences_1 = __importDefault(require("./routes/preferences"));
const adRoutes_1 = __importDefault(require("./routes/adRoutes"));
const newsCycleManager_1 = require("./services/newsCycleManager");
const emailCronService_1 = require("./services/emailCronService");
const liveStreamUpdater_1 = require("./services/liveStreamUpdater");
const liveInfoRoutes_1 = __importDefault(require("./routes/liveInfoRoutes"));
const youtubeService_1 = require("./services/youtubeService");
const app = (0, express_1.default)();
exports.app = app;
const httpServer = (0, http_1.createServer)(app);
// ─────────────────────────────────────────────
// Socket.IO — Real-time live updates
// ─────────────────────────────────────────────
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: (origin, callback) => {
            if (process.env.NODE_ENV !== "production") {
                return callback(null, true);
            }
            const isAllowed = !origin ||
                origin.includes("localhost") ||
                origin.includes("127.0.0.1") ||
                origin === process.env.FRONTEND_URL ||
                /^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin) ||
                origin.includes("ngrok");
            if (isAllowed) {
                callback(null, true);
            }
            else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        methods: ["GET", "POST"],
        credentials: true
    },
});
// Track online users: userId -> socket.id
const onlineUsers = new Map();
io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);
    socket.on("join_article", (articleId) => {
        socket.join(`article_${articleId}`);
        console.log(`🔌 Client ${socket.id} joined article_${articleId}`);
    });
    socket.on("leave_article", (articleId) => {
        socket.leave(`article_${articleId}`);
        console.log(`🔌 Client ${socket.id} left article_${articleId}`);
    });
    // Profile Rooms for Real-Time Social Counts
    socket.on("join_profile", (profileId) => {
        socket.join(`profile_${profileId}`);
        console.log(`🔌 Client ${socket.id} joined profile_${profileId}`);
    });
    socket.on("leave_profile", (profileId) => {
        socket.leave(`profile_${profileId}`);
        console.log(`🔌 Client ${socket.id} left profile_${profileId}`);
    });
    // Chat Rooms
    socket.on("join_chat", (chatId) => {
        socket.join(`chat_${chatId}`);
        console.log(`🔌 Client ${socket.id} joined chat_${chatId}`);
    });
    socket.on("leave_chat", (chatId) => {
        socket.leave(`chat_${chatId}`);
        console.log(`🔌 Client ${socket.id} left chat_${chatId}`);
    });
    // Typing Indicators
    socket.on("typing", (data) => {
        socket.in(`chat_${data.chatId}`).emit("typing", data);
    });
    socket.on("stop_typing", (data) => {
        socket.in(`chat_${data.chatId}`).emit("stop_typing", data);
    });
    // ─────────────────────────────────────────────
    // WebRTC Call Signaling Handlers
    // ─────────────────────────────────────────────
    socket.on("register_user", (userId) => {
        socket.join(`user_${userId}`);
        // Track online presence
        onlineUsers.set(userId, socket.id);
        // Notify all other sockets that this user came online
        socket.broadcast.emit("user_online", { userId });
        console.log(`🔌 User registered calling room: user_${userId} [online: ${onlineUsers.size}]`);
    });
    socket.on("call_user", (data) => {
        socket.to(`user_${data.targetUserId}`).emit("incoming_call", {
            fromUserId: data.fromUserId,
            offer: data.offer,
            callerName: data.callerName,
            callType: data.callType
        });
    });
    socket.on("answer_call", (data) => {
        socket.to(`user_${data.targetUserId}`).emit("call_answered", {
            answer: data.answer
        });
    });
    socket.on("ice_candidate", (data) => {
        socket.to(`user_${data.targetUserId}`).emit("ice_candidate", {
            candidate: data.candidate
        });
    });
    socket.on("end_call", (data) => {
        socket.to(`user_${data.targetUserId}`).emit("call_ended");
    });
    // Check if a specific user is online
    socket.on("check_online_status", (data, callback) => {
        const isOnline = onlineUsers.has(data.userId);
        if (typeof callback === "function") {
            callback({ userId: data.userId, isOnline });
        }
        else {
            socket.emit("online_status_result", { userId: data.userId, isOnline });
        }
    });
    socket.on("disconnect", () => {
        // Find which userId this socket belonged to
        let disconnectedUserId = null;
        for (const [userId, sid] of onlineUsers.entries()) {
            if (sid === socket.id) {
                disconnectedUserId = userId;
                break;
            }
        }
        if (disconnectedUserId) {
            onlineUsers.delete(disconnectedUserId);
            socket.broadcast.emit("user_offline", { userId: disconnectedUserId });
            console.log(`🔌 User offline: ${disconnectedUserId} [online: ${onlineUsers.size}]`);
        }
        console.log(`🔌 Client disconnected: ${socket.id}`);
    });
});
// Make io accessible in controllers
app.set("io", io);
// ─────────────────────────────────────────────
// Core Middleware
// ─────────────────────────────────────────────
app.use(helmetConfig_1.helmetConfig);
// 🛡️ LAYER 1: Entry Gate Security
app.use(networkProtection_1.checkBlockedIP);
// app.use(geoBlocker) // Optional toggle
app.use(networkProtection_1.globalRateLimiter);
app.use(networkProtection_1.ddosSlowDown);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || process.env.NODE_ENV !== "production") {
            return callback(null, true);
        }
        const isAllowed = origin.includes("localhost") ||
            origin.includes("127.0.0.1") ||
            origin === process.env.FRONTEND_URL ||
            /^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin) ||
            origin.includes("ngrok");
        if (isAllowed) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Layer 1: Whitelist methods
}));
app.use(express_1.default.json({ limit: "10mb" })); // Limit body size
app.use(express_1.default.urlencoded({ extended: true }));
// 🧱 LAYER 3: Data Protection
app.use(dataProtection_1.dataProtectionSuite);
// 👁️ LAYER 4: Audit Logger & IDS
app.use(auditLogger_1.auditLogger);
if (process.env.NODE_ENV !== "production") {
    app.use((0, morgan_1.default)("dev"));
}
// Trust proxy is needed because Next.js rewrites forward traffic from localhost
app.set("trust proxy", 1);
// ─────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────
app.use("/api/auth", auth_1.default);
const homeBalanced_1 = require("./routes/news/homeBalanced");
app.get("/api/news/home-balanced", homeBalanced_1.getHomeBalanced);
app.use("/api/news", news_1.default);
app.use("/api/reels", reels_1.default);
app.use("/api/categories", categories_1.default);
app.use("/api/settings", settings_1.default);
app.use("/api/search", search_1.default);
app.use("/api/users", users_1.default);
app.use("/api/upload", upload_1.default);
app.use("/api/stories", stories_1.default);
app.use("/api/posts", posts_1.default);
app.use("/api/chats", chats_1.default);
app.use("/api/messages", messages_1.default);
app.use("/api/notifications", notifications_1.default);
app.use("/api/live-info", liveInfoRoutes_1.default);
app.use("/api/subscription", subscription_1.default);
app.use("/api/payment", payment_1.default);
app.use("/api/newsfeed/prefs", newsFeedRoutes_1.default);
app.use("/api/notifications/prefs", notificationRoutes_1.default);
app.use("/api/ollama", ollama_1.default);
app.use("/api/user/preferences", userPreferencesRoutes_1.default);
const liveChannels_1 = __importDefault(require("./routes/liveChannels"));
app.use("/api/live-channels", liveChannels_1.default);
const externalArticles_1 = __importDefault(require("./routes/externalArticles"));
app.use("/api/external-articles", externalArticles_1.default);
app.use("/api", preferences_1.default);
app.use("/api/contact", contact_1.default);
app.use("/api/ads", adRoutes_1.default);
const security_1 = __importDefault(require("./routes/admin/security"));
app.use("/api/admin/security", security_1.default);
const reclassify_1 = require("./routes/admin/reclassify");
const classificationStats_1 = require("./routes/admin/classificationStats");
const auth_2 = require("./middleware/auth");
app.patch("/api/admin/articles/:id/section", auth_2.authenticate, (0, auth_2.requireRole)("admin", "editor"), reclassify_1.reclassifyArticle);
app.get("/api/admin/classification-stats", auth_2.authenticate, (0, auth_2.requireRole)("admin", "editor"), classificationStats_1.getClassificationStats);
const adminDashboard_1 = __importDefault(require("./routes/adminDashboard"));
app.use("/api/admin-dashboard", adminDashboard_1.default);
// Health check endpoint
app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        service: "Fact Flow Backend API",
        version: "1.0.0",
    });
});
// Next.js handler for all other routes
app.all("*", (req, res) => {
    return nextHandler(req, res);
});
// Global error handler
app.use((err, _req, res, _next) => {
    console.error("Unhandled error:", err.message);
    res.status(500).json({ success: false, error: "Internal server error" });
});
// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || "5000", 10);
async function start() {
    await (0, database_1.connectDB)();
    console.log("Preparing Next.js app...");
    await nextApp.prepare();
    console.log("Next.js app prepared!");
    httpServer.listen(PORT, () => {
        console.log("\n╔══════════════════════════════════════╗");
        console.log("║     🔥 FACT FLOW BACKEND RUNNING     ║");
        console.log("╠══════════════════════════════════════╣");
        console.log(`║  URL  : http://localhost:${PORT}         ║`);
        console.log(`║  Mode : ${(process.env.NODE_ENV || "development").padEnd(28)}║`);
        console.log("╚══════════════════════════════════════╝\n");
    });
    // Start smart automated news pipeline
    (0, newsCycleManager_1.startNewsCycleManager)();
    // Start email digest cron jobs
    (0, emailCronService_1.startEmailCronJobs)();
    // Start Live TV stream updater cron
    (0, liveStreamUpdater_1.startLiveStreamCron)();
    // Sync YouTube reels on startup if token provided
    if (process.env.YOUTUBE_API_KEY) {
        console.log("📸 Syncing YouTube shorts...");
        try {
            await (0, youtubeService_1.syncYoutubeReels)();
        }
        catch (syncError) {
            console.error("❌ YouTube sync failed on startup:", syncError.message || syncError);
        }
    }
}
if (process.env.NODE_ENV !== "test") {
    start().catch((err) => {
        console.error("Failed to start server:", err);
        process.exit(1);
    });
}
//# sourceMappingURL=server.js.map