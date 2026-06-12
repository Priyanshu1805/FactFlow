"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllNews = getAllNews;
exports.getNewsById = getNewsById;
exports.viewNews = viewNews;
exports.createNews = createNews;
exports.updateNews = updateNews;
exports.deleteNews = deleteNews;
exports.likeNews = likeNews;
exports.unlikeNews = unlikeNews;
exports.interactNews = interactNews;
const NewsArticle_1 = require("../models/NewsArticle");
const User_1 = require("../models/User");
const cacheService_1 = require("../services/cacheService");
// GET /api/news
async function getAllNews(req, res) {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(150, parseInt(req.query.limit) || 10);
        const { category, featured, breaking, tag, search, longform, language, firebaseUid, region } = req.query;
        // Bypassed sections block removed to support full filtering
        // Only cache if there's no user-specific filters or search
        const canCache = !search && !firebaseUid;
        const cacheKey = `news:${category ? category.toLowerCase() : "global"}:page${page}:region${region ? region.toLowerCase() : "global"}:lang${language ? language.toLowerCase() : "all"}`;
        if (canCache) {
            const cachedData = await (0, cacheService_1.getCached)(cacheKey);
            if (cachedData) {
                res.setHeader("X-Cache", "HIT");
                res.json(cachedData);
                return;
            }
        }
        res.setHeader("X-Cache", "MISS");
        const query = {};
        if (category) {
            query.$or = [
                { category: category },
                { sections: category }
            ];
        }
        // Apply region filtering
        if (region && typeof region === "string") {
            const normalizedRegion = region.toLowerCase();
            if (normalizedRegion !== "global") {
                const locationMap = {
                    in: ["India", "Delhi", "Mumbai", "Bengaluru", "Chennai", "Kolkata"],
                    india: ["India", "Delhi", "Mumbai", "Bengaluru", "Chennai", "Kolkata"],
                    us: ["US", "United States", "Washington", "New York", "America"],
                    uk: ["UK", "United Kingdom", "London", "Britain"],
                    gb: ["UK", "United Kingdom", "London", "Britain"],
                    ca: ["Canada", "Toronto", "Ottawa", "Vancouver"],
                    au: ["Australia", "Sydney", "Melbourne", "Canberra"],
                    fr: ["France", "Paris", "Marseille"],
                    de: ["Germany", "Berlin", "Munich"],
                    jp: ["Japan", "Tokyo", "Osaka"],
                    br: ["Brazil", "Sao Paulo", "Brasilia", "Rio"],
                    ae: ["UAE", "United Arab Emirates", "Dubai", "Abu Dhabi"],
                    za: ["South Africa", "Cape Town", "Pretoria", "Johannesburg"]
                };
                const locs = locationMap[normalizedRegion];
                if (locs) {
                    query.location = { $in: [...locs, "Global"] };
                }
            }
        }
        if (language)
            query.language = { $regex: new RegExp(`^${language}$`, "i") };
        if (featured === "true")
            query.isFeatured = true;
        if (breaking === "true")
            query.isBreaking = true;
        if (tag)
            query.tags = { $in: [tag] };
        if (search)
            query.$text = { $search: search };
        if (longform === "true") {
            query.$expr = { $gt: [{ $strLenCP: { $ifNull: ["$content", ""] } }, 50] };
        }
        if (firebaseUid) {
            const user = await User_1.User.findOne({ firebaseUid }).lean();
            if (user && user.settings?.content) {
                const { mutedKeywords, hiddenPublishers, filterMisinformation, clickbaitReduction, verifiedSourcesOnly, sensitiveContent } = user.settings.content;
                if (hiddenPublishers && hiddenPublishers.length > 0) {
                    query.$and = query.$and || [];
                    const regexes = hiddenPublishers.map((p) => new RegExp(p.trim(), "i"));
                    query.$and.push({
                        source: { $not: { $in: regexes } },
                        author: { $not: { $in: regexes } }
                    });
                }
                if (mutedKeywords && mutedKeywords.length > 0) {
                    query.$and = query.$and || [];
                    const regexStr = mutedKeywords.map((kw) => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
                    const regex = new RegExp(regexStr, "i");
                    query.$and.push({ title: { $not: regex } });
                    query.$and.push({ excerpt: { $not: regex } });
                }
                if (filterMisinformation) {
                    query.isMisinformation = { $ne: true };
                }
                if (clickbaitReduction) {
                    query.isClickbait = { $ne: true };
                }
                if (verifiedSourcesOnly) {
                    query.isVerifiedSource = true;
                }
                if (sensitiveContent === "strict") {
                    query.isSensitive = { $ne: true };
                }
            }
        }
        const total = await NewsArticle_1.NewsArticle.countDocuments(query);
        let articles = await NewsArticle_1.NewsArticle.find(query)
            .sort({ publishedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();
        // STRICT PERMANENT FIX: Drop any articles containing untranslated Hindi/Regional scripts
        const indicRegex = /[\u0900-\u0DFF]/;
        articles = articles.filter(a => !indicRegex.test(a.title) && !indicRegex.test(a.excerpt || ""));
        const responsePayload = {
            success: true,
            data: articles,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
        if (canCache) {
            await (0, cacheService_1.setCached)(cacheKey, responsePayload, 60 * 15); // 15 mins cache
        }
        res.json(responsePayload);
    }
    catch (error) {
        console.error("News fetch error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch news" });
    }
}
// GET /api/news/:id — just fetch, no side effects
async function getNewsById(req, res) {
    try {
        const { id } = req.params;
        const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
        const article = await NewsArticle_1.NewsArticle.findOne(isObjectId ? { _id: id } : { slug: id }).lean();
        if (!article) {
            res.status(404).json({ success: false, error: "Article not found" });
            return;
        }
        res.json({ success: true, data: article });
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch article" });
    }
}
// POST /api/news/:id/view — smart increment (unique per device/user)
async function viewNews(req, res) {
    try {
        const { deviceId, userId } = req.body;
        if (!deviceId && !userId) {
            res.status(400).json({ success: false, error: "Missing deviceId or userId" });
            return;
        }
        const article = await NewsArticle_1.NewsArticle.findById(req.params.id);
        if (!article) {
            res.status(404).json({ success: false, error: "Article not found" });
            return;
        }
        let isNewView = false;
        let identityKey = 'Devices';
        let identityValue = deviceId;
        if (userId) {
            // Resolve Firebase UID to MongoDB ObjectId
            const { User } = await Promise.resolve().then(() => __importStar(require('../models/User')));
            const dbUser = await User.findOne({ firebaseUid: userId });
            if (dbUser) {
                identityKey = 'Users';
                identityValue = dbUser._id;
            }
        }
        if (identityKey === 'Users') {
            if (!article.viewedByUsers.some(id => id.toString() === identityValue.toString())) {
                article.viewedByUsers.push(identityValue);
                isNewView = true;
            }
        }
        else if (deviceId) {
            if (!article.viewedByDevices.includes(deviceId)) {
                article.viewedByDevices.push(deviceId);
                isNewView = true;
            }
        }
        if (isNewView) {
            article.views += 1;
            await article.save();
            // Broadcast live view count
            const io = req.app.get("io");
            if (io) {
                io.to(`article_${article._id}`).emit("view_update", { views: article.views });
            }
        }
        res.json({ success: true, isNewView, views: article.views });
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Failed to record view" });
    }
}
// POST /api/news — Admin only
async function createNews(req, res) {
    try {
        const { title, excerpt, content, categories, image, author, tags, isBreaking, isFeatured, location, isSponsored } = req.body;
        if (!title || !excerpt || !content || !categories || categories.length === 0 || !image) {
            res.status(400).json({ success: false, error: "Missing required fields: title, excerpt, content, categories, image" });
            return;
        }
        const primaryCategory = categories[0];
        const article = await NewsArticle_1.NewsArticle.create({
            title, excerpt, content, category: primaryCategory, sections: categories, image,
            author: author || "Fact Flow Editorial Desk",
            tags: tags || [],
            isBreaking: isBreaking || false,
            isFeatured: isFeatured || false,
            isSponsored: isSponsored || false,
            location: location || "Global",
        });
        // Broadcast the new article via Socket.io so frontend updates instantly
        const io = req.app.get("io");
        if (io) {
            const payload = { count: 1, articles: [article] };
            // Emit to each specific category
            categories.forEach((cat) => {
                io.emit(`news:${cat.toLowerCase()}`, payload);
            });
            // Emit to "all" and "global" for main feeds
            io.emit(`news:all`, payload);
            io.emit(`news:global`, payload);
        }
        res.status(201).json({ success: true, data: article, message: "Article created successfully" });
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Failed to create article" });
    }
}
// PUT /api/news/:id — Admin / Editor only
async function updateNews(req, res) {
    try {
        const article = await NewsArticle_1.NewsArticle.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: new Date() }, { new: true, runValidators: true });
        if (!article) {
            res.status(404).json({ success: false, error: "Article not found" });
            return;
        }
        res.json({ success: true, data: article, message: "Article updated successfully" });
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Failed to update article" });
    }
}
// DELETE /api/news/:id — Admin only
async function deleteNews(req, res) {
    try {
        const article = await NewsArticle_1.NewsArticle.findByIdAndDelete(req.params.id);
        if (!article) {
            res.status(404).json({ success: false, error: "Article not found" });
            return;
        }
        res.json({ success: true, message: "Article deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Failed to delete article" });
    }
}
// POST /api/news/:id/like — smart increment (unique per device/user)
async function likeNews(req, res) {
    try {
        const { deviceId, userId } = req.body;
        if (!deviceId && !userId) {
            res.status(400).json({ success: false, error: "Missing deviceId or userId" });
            return;
        }
        const article = await NewsArticle_1.NewsArticle.findById(req.params.id);
        if (!article) {
            res.status(404).json({ success: false, error: "Article not found" });
            return;
        }
        let isNewLike = false;
        if (userId) {
            if (!article.likedByUsers.some(id => id.toString() === userId)) {
                article.likedByUsers.push(userId);
                isNewLike = true;
            }
        }
        else if (deviceId) {
            if (!article.likedByDevices.includes(deviceId)) {
                article.likedByDevices.push(deviceId);
                isNewLike = true;
            }
        }
        if (isNewLike) {
            article.likes += 1;
            await article.save();
        }
        res.json({ success: true, data: { likes: article.likes }, isNewLike });
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Failed to like article" });
    }
}
// POST /api/news/:id/unlike — smart decrement
async function unlikeNews(req, res) {
    try {
        const { deviceId, userId } = req.body;
        if (!deviceId && !userId) {
            res.status(400).json({ success: false, error: "Missing deviceId or userId" });
            return;
        }
        const article = await NewsArticle_1.NewsArticle.findById(req.params.id);
        if (!article) {
            res.status(404).json({ success: false, error: "Article not found" });
            return;
        }
        let isUnlike = false;
        if (userId) {
            const index = article.likedByUsers.findIndex(id => id.toString() === userId);
            if (index !== -1) {
                article.likedByUsers.splice(index, 1);
                isUnlike = true;
            }
        }
        else if (deviceId) {
            const index = article.likedByDevices.indexOf(deviceId);
            if (index !== -1) {
                article.likedByDevices.splice(index, 1);
                isUnlike = true;
            }
        }
        if (isUnlike) {
            article.likes = Math.max(0, article.likes - 1);
            await article.save();
        }
        res.json({ success: true, data: { likes: article.likes }, isUnlike });
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Failed to unlike article" });
    }
}
// POST /api/news/:id/interact
async function interactNews(req, res) {
    try {
        const { deviceId, userId, action } = req.body;
        if (!deviceId && !userId) {
            res.status(400).json({ success: false, error: "Missing deviceId or userId" });
            return;
        }
        if (!['like', 'unlike', 'dislike', 'undislike'].includes(action)) {
            res.status(400).json({ success: false, error: "Invalid action" });
            return;
        }
        const updateQuery = {};
        let identityKey = 'Devices';
        let identityValue = deviceId;
        if (userId) {
            // Lookup the MongoDB ObjectId for the user because likedByUsers is an ObjectId array
            const { User } = await Promise.resolve().then(() => __importStar(require('../models/User'))); // Import here if not at top level
            const dbUser = await User.findOne({ firebaseUid: userId });
            if (dbUser) {
                identityKey = 'Users';
                identityValue = dbUser._id;
            }
        }
        if (!identityValue) {
            res.status(400).json({ success: false, error: "Missing valid deviceId or userId" });
            return;
        }
        if (action === 'like') {
            updateQuery.$addToSet = { [`likedBy${identityKey}`]: identityValue };
            updateQuery.$pull = { [`dislikedBy${identityKey}`]: identityValue };
        }
        else if (action === 'unlike') {
            updateQuery.$pull = { [`likedBy${identityKey}`]: identityValue };
        }
        else if (action === 'dislike') {
            updateQuery.$addToSet = { [`dislikedBy${identityKey}`]: identityValue };
            updateQuery.$pull = { [`likedBy${identityKey}`]: identityValue };
        }
        else if (action === 'undislike') {
            updateQuery.$pull = { [`dislikedBy${identityKey}`]: identityValue };
        }
        const updated = await NewsArticle_1.NewsArticle.findByIdAndUpdate(req.params.id, updateQuery, { new: true });
        if (!updated) {
            res.status(404).json({ success: false, error: "Article not found" });
            return;
        }
        // Recalculate lengths
        updated.likes = updated.likedByUsers.length + updated.likedByDevices.length;
        updated.dislikes = updated.dislikedByUsers.length + updated.dislikedByDevices.length;
        await updated.save();
        const io = req.app.get("io");
        if (io) {
            io.to(`article_${updated._id}`).emit("stats_update", { likes: updated.likes, dislikes: updated.dislikes });
        }
        res.json({
            success: true,
            data: {
                likes: updated.likes,
                dislikes: updated.dislikes
            }
        });
    }
    catch (error) {
        console.error("News interaction error:", error);
        res.status(500).json({ success: false, error: "Failed to interact with article" });
    }
}
//# sourceMappingURL=newsController.js.map