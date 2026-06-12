"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reclassifyArticle = reclassifyArticle;
const NewsArticle_1 = require("../../models/NewsArticle");
// PATCH /api/admin/articles/:id/section
async function reclassifyArticle(req, res) {
    try {
        const { id } = req.params;
        const { section } = req.body;
        if (!section) {
            return res.status(400).json({ success: false, error: 'Section is required' });
        }
        const article = await NewsArticle_1.NewsArticle.findByIdAndUpdate(id, {
            $set: {
                sections: [section],
                primarySection: section,
                classifiedBy: 'manual',
                classifiedAt: new Date()
            }
        }, { new: true });
        if (!article) {
            return res.status(404).json({ success: false, error: 'Article not found' });
        }
        // Optionally log to ClassificationCorrections if needed
        // await ClassificationCorrections.create({ articleId: id, originalSection: article.primarySection, newSection: section })
        return res.json({ success: true, data: article });
    }
    catch (error) {
        console.error('Reclassify error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
//# sourceMappingURL=reclassify.js.map