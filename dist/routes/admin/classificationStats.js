"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClassificationStats = getClassificationStats;
const NewsArticle_1 = require("../../models/NewsArticle");
// GET /api/admin/classification-stats
async function getClassificationStats(req, res) {
    try {
        const pipeline = [
            {
                $facet: {
                    bySection: [
                        { $unwind: "$sections" },
                        { $group: { _id: "$sections", count: { $sum: 1 } } }
                    ],
                    byMethod: [
                        { $group: { _id: "$classifiedBy", count: { $sum: 1 } } }
                    ],
                    unclassified: [
                        { $match: { sections: { $size: 0 } } },
                        { $count: "count" }
                    ]
                }
            }
        ];
        const stats = await NewsArticle_1.NewsArticle.aggregate(pipeline);
        return res.json({
            success: true,
            data: {
                sections: stats[0].bySection,
                methods: stats[0].byMethod,
                unclassified: stats[0].unclassified[0]?.count || 0
            }
        });
    }
    catch (error) {
        console.error('Stats error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
//# sourceMappingURL=classificationStats.js.map