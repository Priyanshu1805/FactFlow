"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHomeBalanced = getHomeBalanced;
const NewsArticle_1 = require("../../models/NewsArticle");
// GET /api/news/home-balanced
async function getHomeBalanced(req, res) {
    try {
        const sections = ['live', 'newspaper', 'politics', 'lifestyle', 'sports', 'tech', 'art', 'trending'];
        const results = await Promise.all(sections.map(s => NewsArticle_1.NewsArticle.find({ sections: { $in: [s] } })
            .sort({ qualityScore: -1, publishedAt: -1 })
            .limit(5)
            .lean()));
        const flatResults = results.flat().sort((a, b) => {
            const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
            const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
            return bTime - aTime;
        });
        return res.json({ success: true, data: flatResults });
    }
    catch (error) {
        console.error('Home balanced error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
//# sourceMappingURL=homeBalanced.js.map