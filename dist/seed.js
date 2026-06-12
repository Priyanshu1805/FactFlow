"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const NewsArticle_1 = require("./models/NewsArticle");
const Reel_1 = require("./models/Reel");
dotenv_1.default.config();
const dummyNews = [
    {
        title: "AI Revolution: How Machine Learning is Transforming Industries",
        excerpt: "Discover the latest breakthroughs in artificial intelligence and how they're reshaping every sector.",
        content: "Full content here...",
        category: "Technology",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop",
        author: "AI Insider",
        tags: ["Tech", "AI"],
        isBreaking: true,
        isFeatured: true,
    },
    {
        title: "Champions League: Epic Semifinal Match Results Revealed",
        excerpt: "An unforgettable night of football with stunning goals and dramatic last-minute moments.",
        content: "Full content here...",
        category: "Sports",
        image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop",
        author: "Sports Daily",
        tags: ["Sports", "Football"],
        isBreaking: false,
        isFeatured: false,
    },
    {
        title: "Box Office Smash: New Superhero Film Breaks All Records",
        excerpt: "The latest blockbuster has audiences worldwide amazed with its stunning visual effects.",
        content: "Full content here...",
        category: "Entertainment",
        image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=300&fit=crop",
        author: "Cinema Weekly",
        tags: ["Entertainment", "Movies"],
        isBreaking: false,
        isFeatured: false,
    },
    {
        title: "Bitcoin Surge: Cryptocurrency Markets See Major Rally",
        excerpt: "Digital currencies are experiencing unprecedented growth as institutional investors pour in.",
        content: "Full content here...",
        category: "Crypto",
        image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&h=300&fit=crop",
        author: "Crypto News",
        tags: ["Crypto", "Finance"],
        isBreaking: false,
        isFeatured: false,
    },
];
const dummyReels = [
    {
        title: "AI Creates Stunning Viral Art",
        description: "Check out this AI-generated masterpiece.",
        videoUrl: "https://www.youtube.com/shorts/2bYtxvcO1qA",
        thumbnailUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=300&h=500&fit=crop",
        duration: 45,
        tags: ["Tech", "YouTube"],
        views: 2300000,
        likes: 156000,
        source: "youtube",
        youtubeId: "2bYtxvcO1qA"
    },
    {
        title: "Incredible Sports Moment Goes Viral",
        description: "What a save!",
        videoUrl: "https://www.youtube.com/shorts/5qap5aO4i9A",
        thumbnailUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&h=500&fit=crop",
        duration: 32,
        tags: ["Sports", "YouTube"],
        views: 1800000,
        likes: 98000,
        source: "youtube",
        youtubeId: "5qap5aO4i9A"
    },
    {
        title: "New Tech Gadget Review 2026",
        description: "Is it worth the hype?",
        videoUrl: "https://www.youtube.com/shorts/8bZ9hWq2a8w",
        thumbnailUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=500&fit=crop",
        duration: 62,
        tags: ["Tech", "YouTube"],
        views: 890000,
        likes: 45000,
        source: "youtube",
        youtubeId: "8bZ9hWq2a8w"
    },
    {
        title: "Breaking News Update",
        description: "Important update right now.",
        videoUrl: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
        thumbnailUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=300&h=500&fit=crop",
        duration: 28,
        tags: ["News", "YouTube"],
        views: 3100000,
        likes: 210000,
        source: "youtube",
        youtubeId: "dQw4w9WgXcQ"
    }
];
async function seed() {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB for seeding...");
        await NewsArticle_1.NewsArticle.deleteMany({});
        await Reel_1.Reel.deleteMany({});
        await NewsArticle_1.NewsArticle.insertMany(dummyNews);
        await Reel_1.Reel.insertMany(dummyReels);
        console.log("✅ Seed data inserted successfully!");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
}
seed();
//# sourceMappingURL=seed.js.map