"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrendingSocialVideos = getTrendingSocialVideos;
const axios_1 = __importDefault(require("axios"));
async function getTrendingSocialVideos(req, res) {
    try {
        const apiKey = process.env.YOUTUBE_API_KEY;
        if (!apiKey) {
            res.status(500).json({ success: false, error: "YouTube API key not configured" });
            return;
        }
        const regions = ["IN", "US", "GB"];
        const fetchPromises = regions.map((region) => axios_1.default.get(`https://www.googleapis.com/youtube/v3/videos`, {
            params: {
                part: "snippet,player",
                chart: "mostPopular",
                regionCode: region,
                videoCategoryId: "25", // 25 is News & Politics
                maxResults: 6,
                key: apiKey,
            },
        }).then(r => ({ region, data: r.data.items })));
        const results = await Promise.allSettled(fetchPromises);
        const combinedVideos = [];
        results.forEach((result) => {
            if (result.status === "fulfilled" && result.value.data) {
                result.value.data.forEach((video) => {
                    combinedVideos.push({
                        id: video.id,
                        platform: "YouTube",
                        source: video.snippet.channelTitle,
                        title: video.snippet.title,
                        url: `https://www.youtube.com/watch?v=${video.id}`,
                        thumbnail: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.default?.url,
                        publishedAt: video.snippet.publishedAt,
                        region: result.value.region,
                    });
                });
            }
        });
        // Shuffle array for dynamic mix
        for (let i = combinedVideos.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [combinedVideos[i], combinedVideos[j]] = [combinedVideos[j], combinedVideos[i]];
        }
        res.json({
            success: true,
            data: combinedVideos,
        });
    }
    catch (error) {
        console.error("Failed to fetch trending social videos:", error);
        res.status(500).json({ success: false, error: "Failed to fetch trending social videos" });
    }
}
//# sourceMappingURL=socialTrendingController.js.map