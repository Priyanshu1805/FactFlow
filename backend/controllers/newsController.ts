import { Request, Response } from "express"
import { NewsArticle } from "../models/NewsArticle"
import { User } from "../models/User"

import { getCached, setCached } from "../services/cacheService"

// GET /api/news
export async function getAllNews(req: Request, res: Response): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(150, parseInt(req.query.limit as string) || 10)
    const { category, featured, breaking, tag, search, longform, language, firebaseUid, region } = req.query

    // Bypassed sections block removed to support full filtering

    // Only cache if there's no user-specific filters or search
    const canCache = !search && !firebaseUid
    const cacheKey = `news:${category ? (category as string).toLowerCase() : "global"}:page${page}:region${region ? (region as string).toLowerCase() : "global"}:lang${language ? (language as string).toLowerCase() : "all"}`

    if (canCache) {
      const cachedData = await getCached(cacheKey)
      if (cachedData) {
        res.setHeader("X-Cache", "HIT")
        res.json(cachedData)
        return
      }
    }

    res.setHeader("X-Cache", "MISS")

    const query: Record<string, any> = {}

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
        const locationMap: Record<string, string[]> = {
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

    if (language) query.language = { $regex: new RegExp(`^${language}$`, "i") }
    if (featured === "true") query.isFeatured = true
    if (breaking === "true") query.isBreaking = true
    if (tag) query.tags = { $in: [tag] }
    if (search) query.$text = { $search: search as string }
    if (longform === "true") {
      query.$expr = { $gt: [{ $strLenCP: { $ifNull: ["$content", ""] } }, 50] }
    }

    if (firebaseUid) {
      const user = await User.findOne({ firebaseUid }).lean();
      if (user && user.settings?.content) {
        const { mutedKeywords, hiddenPublishers, filterMisinformation, clickbaitReduction, verifiedSourcesOnly, sensitiveContent } = user.settings.content;
        
        if (hiddenPublishers && hiddenPublishers.length > 0) {
          query.$and = query.$and || [];
          const regexes = hiddenPublishers.map((p: string) => new RegExp(p.trim(), "i"));
          query.$and.push({
            source: { $not: { $in: regexes } },
            author: { $not: { $in: regexes } }
          });
        }
        
        if (mutedKeywords && mutedKeywords.length > 0) {
          query.$and = query.$and || [];
          const regexStr = mutedKeywords.map((kw: string) => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
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

    const total = await NewsArticle.countDocuments(query)
    let articles = await NewsArticle.find(query)
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // STRICT PERMANENT FIX: Drop any articles containing untranslated Hindi/Regional scripts
    const indicRegex = /[\u0900-\u0DFF]/;
    articles = articles.filter(a => !indicRegex.test(a.title) && !indicRegex.test(a.excerpt || ""));

    const responsePayload = {
      success: true,
      data: articles,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }

    if (canCache) {
      await setCached(cacheKey, responsePayload, 60 * 15) // 15 mins cache
    }

    res.json(responsePayload)
  } catch (error) {
    console.error("News fetch error:", error)
    res.status(500).json({ success: false, error: "Failed to fetch news" })
  }
}

// GET /api/news/:id — just fetch, no side effects
export async function getNewsById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    
    const article = await NewsArticle.findOne(isObjectId ? { _id: id } : { slug: id }).lean()
    
    if (!article) {
      res.status(404).json({ success: false, error: "Article not found" })
      return
    }
    res.json({ success: true, data: article })
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch article" })
  }
}

// POST /api/news/:id/view — smart increment (unique per device/user)
export async function viewNews(req: Request, res: Response): Promise<void> {
  try {
    const { deviceId, userId } = req.body

    if (!deviceId && !userId) {
      res.status(400).json({ success: false, error: "Missing deviceId or userId" })
      return
    }

    const article = await NewsArticle.findById(req.params.id)
    if (!article) {
      res.status(404).json({ success: false, error: "Article not found" })
      return
    }

    let isNewView = false
    let identityKey = 'Devices'
    let identityValue: any = deviceId

    if (userId) {
      // Resolve Firebase UID to MongoDB ObjectId
      const { User } = await import('../models/User')
      const dbUser = await User.findOne({ firebaseUid: userId })
      if (dbUser) {
        identityKey = 'Users'
        identityValue = dbUser._id
      }
    }

    if (identityKey === 'Users') {
      if (!article.viewedByUsers.some(id => id.toString() === identityValue.toString())) {
        article.viewedByUsers.push(identityValue)
        isNewView = true
      }
    } else if (deviceId) {
      if (!article.viewedByDevices.includes(deviceId)) {
        article.viewedByDevices.push(deviceId)
        isNewView = true
      }
    }

    if (isNewView) {
      article.views += 1
      await article.save()

      // Broadcast live view count
      const io = req.app.get("io")
      if (io) {
        io.to(`article_${article._id}`).emit("view_update", { views: article.views })
      }
    }

    res.json({ success: true, isNewView, views: article.views })
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to record view" })
  }
}

// POST /api/news — Admin only
export async function createNews(req: Request, res: Response): Promise<void> {
  try {
    const { title, excerpt, content, categories, image, author, tags, isBreaking, isFeatured, location, isSponsored } = req.body

    if (!title || !excerpt || !content || !categories || categories.length === 0 || !image) {
      res.status(400).json({ success: false, error: "Missing required fields: title, excerpt, content, categories, image" })
      return
    }

    const primaryCategory = categories[0]

    const article = await NewsArticle.create({
      title, excerpt, content, category: primaryCategory, sections: categories, image,
      author: author || "Fact Flow Editorial Desk",
      tags: tags || [],
      isBreaking: isBreaking || false,
      isFeatured: isFeatured || false,
      isSponsored: isSponsored || false,
      location: location || "Global",
    })

    // Broadcast the new article via Socket.io so frontend updates instantly
    const io = req.app.get("io")
    if (io) {
      const payload = { count: 1, articles: [article] }
      // Emit to each specific category
      categories.forEach((cat: string) => {
        io.emit(`news:${cat.toLowerCase()}`, payload)
      })
      // Emit to "all" and "global" for main feeds
      io.emit(`news:all`, payload)
      io.emit(`news:global`, payload)
    }

    res.status(201).json({ success: true, data: article, message: "Article created successfully" })
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to create article" })
  }
}

// PUT /api/news/:id — Admin / Editor only
export async function updateNews(req: Request, res: Response): Promise<void> {
  try {
    const article = await NewsArticle.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
    if (!article) {
      res.status(404).json({ success: false, error: "Article not found" })
      return
    }
    res.json({ success: true, data: article, message: "Article updated successfully" })
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to update article" })
  }
}

// DELETE /api/news/:id — Admin only
export async function deleteNews(req: Request, res: Response): Promise<void> {
  try {
    const article = await NewsArticle.findByIdAndDelete(req.params.id)
    if (!article) {
      res.status(404).json({ success: false, error: "Article not found" })
      return
    }
    res.json({ success: true, message: "Article deleted successfully" })
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to delete article" })
  }
}

// POST /api/news/:id/like — smart increment (unique per device/user)
export async function likeNews(req: Request, res: Response): Promise<void> {
  try {
    const { deviceId, userId } = req.body

    if (!deviceId && !userId) {
      res.status(400).json({ success: false, error: "Missing deviceId or userId" })
      return
    }

    const article = await NewsArticle.findById(req.params.id)
    if (!article) {
      res.status(404).json({ success: false, error: "Article not found" })
      return
    }

    let isNewLike = false

    if (userId) {
      if (!article.likedByUsers.some(id => id.toString() === userId)) {
        article.likedByUsers.push(userId)
        isNewLike = true
      }
    } else if (deviceId) {
      if (!article.likedByDevices.includes(deviceId)) {
        article.likedByDevices.push(deviceId)
        isNewLike = true
      }
    }

    if (isNewLike) {
      article.likes += 1
      await article.save()
    }

    res.json({ success: true, data: { likes: article.likes }, isNewLike })
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to like article" })
  }
}

// POST /api/news/:id/unlike — smart decrement
export async function unlikeNews(req: Request, res: Response): Promise<void> {
  try {
    const { deviceId, userId } = req.body

    if (!deviceId && !userId) {
      res.status(400).json({ success: false, error: "Missing deviceId or userId" })
      return
    }

    const article = await NewsArticle.findById(req.params.id)
    if (!article) {
      res.status(404).json({ success: false, error: "Article not found" })
      return
    }

    let isUnlike = false

    if (userId) {
      const index = article.likedByUsers.findIndex(id => id.toString() === userId)
      if (index !== -1) {
        article.likedByUsers.splice(index, 1)
        isUnlike = true
      }
    } else if (deviceId) {
      const index = article.likedByDevices.indexOf(deviceId)
      if (index !== -1) {
        article.likedByDevices.splice(index, 1)
        isUnlike = true
      }
    }

    if (isUnlike) {
      article.likes = Math.max(0, article.likes - 1)
      await article.save()
    }

    res.json({ success: true, data: { likes: article.likes }, isUnlike })
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to unlike article" })
  }
}

// POST /api/news/:id/interact
export async function interactNews(req: Request, res: Response): Promise<void> {
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

    const updateQuery: any = {};
    let identityKey = 'Devices';
    let identityValue: any = deviceId;

    if (userId) {
      // Lookup the MongoDB ObjectId for the user because likedByUsers is an ObjectId array
      const { User } = await import('../models/User'); // Import here if not at top level
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
    } else if (action === 'unlike') {
      updateQuery.$pull = { [`likedBy${identityKey}`]: identityValue };
    } else if (action === 'dislike') {
      updateQuery.$addToSet = { [`dislikedBy${identityKey}`]: identityValue };
      updateQuery.$pull = { [`likedBy${identityKey}`]: identityValue };
    } else if (action === 'undislike') {
      updateQuery.$pull = { [`dislikedBy${identityKey}`]: identityValue };
    }

    const updated = await NewsArticle.findByIdAndUpdate(
      req.params.id,
      updateQuery,
      { new: true }
    );

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

  } catch (error) {
    console.error("News interaction error:", error);
    res.status(500).json({ success: false, error: "Failed to interact with article" });
  }
}

