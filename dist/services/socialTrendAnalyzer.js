"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSocialTrendAnalyzer = runSocialTrendAnalyzer;
const axios_1 = __importDefault(require("axios"));
const SocialTrend_1 = require("../models/SocialTrend");
const pushService_1 = require("./pushService");
const REDDIT_SOURCES = [
    "https://www.reddit.com/r/news/hot.json?limit=15",
    "https://www.reddit.com/r/worldnews/hot.json?limit=15",
];
const AI_PROMPT = `Tu social media trend analyzer hai. Niche diye social posts ko analyze karke trending topics nikaalo.

TASK:
1. Top 10 trending topics identify karo
2. Har topic ka sentiment batao (positive/negative/mixed/neutral)
3. Viral potential score do (1-10)
4. Kya yeh news worthy hai? (yes/no + reason)
5. Related hashtags suggest karo

OUTPUT FORMAT (JSON array of objects):
[{
  "topic": "...",
  "mentions": 1240,
  "sentiment": "positive",
  "viral_score": 8,
  "news_worthy": true,
  "reason": "...",
  "hashtags": ["#tag1","#tag2"],
  "platforms": ["reddit","bluesky"]
}]

Social data: `;
async function runSocialTrendAnalyzer() {
    console.log("[Social Analyzer] Starting social trend analysis...");
    try {
        const rawPosts = [];
        for (const url of REDDIT_SOURCES) {
            try {
                const response = await axios_1.default.get(url);
                const posts = response.data.data.children.map((child) => ({
                    title: child.data.title,
                    ups: child.data.ups,
                    num_comments: child.data.num_comments,
                    subreddit: child.data.subreddit,
                }));
                rawPosts.push(...posts);
            }
            catch (err) {
                console.error(`[Social Analyzer] Failed to fetch ${url}`, err);
            }
        }
        if (rawPosts.length === 0)
            return;
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.error("[Social Analyzer] Missing OPENAI_API_KEY");
            return;
        }
        const payload = JSON.stringify(rawPosts);
        const response = await axios_1.default.post("https://api.openai.com/v1/chat/completions", {
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You strictly output valid JSON arrays. Do not output markdown code blocks. Just the raw JSON array." },
                { role: "user", content: AI_PROMPT + payload }
            ],
            temperature: 0.3
        }, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`
            }
        });
        let content = response.data.choices[0]?.message?.content || "[]";
        content = content.replace(/```json/g, "").replace(/```/g, "").trim();
        let processedTrends = [];
        try {
            processedTrends = JSON.parse(content);
        }
        catch (err) {
            console.error("[Social Analyzer] Failed to parse JSON from AI", err);
            return;
        }
        for (const trend of processedTrends) {
            const existing = await SocialTrend_1.SocialTrend.findOne({ topic: trend.topic });
            if (!existing) {
                await SocialTrend_1.SocialTrend.create({
                    topic: trend.topic,
                    mentions: trend.mentions || 0,
                    sentiment: trend.sentiment || "neutral",
                    viral_score: trend.viral_score || 1,
                    news_worthy: trend.news_worthy || false,
                    reason: trend.reason || "",
                    hashtags: trend.hashtags || [],
                    platforms: trend.platforms || ["reddit"],
                });
                const io = (0, pushService_1.getSocket)();
                if (io) {
                    io.emit("trending_story", trend);
                }
            }
            else {
                existing.mentions += trend.mentions || 0;
                existing.viral_score = Math.max(existing.viral_score, trend.viral_score || 1);
                await existing.save();
            }
        }
        console.log(`[Social Analyzer] Successfully processed ${processedTrends.length} trending topics.`);
    }
    catch (error) {
        console.error("[Social Analyzer] Error:", error);
    }
}
//# sourceMappingURL=socialTrendAnalyzer.js.map