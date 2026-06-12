"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMemeContentTracker = runMemeContentTracker;
const axios_1 = __importDefault(require("axios"));
const NewsArticle_1 = require("../models/NewsArticle");
const MEME_SOURCES = [
    "https://www.reddit.com/r/memes/hot.json?limit=10",
    "https://www.reddit.com/r/IndianMeyMeys/hot.json?limit=5",
];
const AI_PROMPT = `Tu ek meme to news converter AI hai. Viral meme ya trending content ko proper news article format mein convert kar.

USE: Causal Hinglish, News IT formally.
LENGTH: 150-200 words.

FORMAT:
- Catchy headline [max 10 words]
- Lead paragraph [kya hua, kahan se viral hua]
- Context [background kya hai]
- Public reaction [log kya bol rahe hain]
- Social media stats [mentions, shares approx]
- Tags: #viral #meme #trending

IMPORTANT:
- Format rules: Saari information strictly ek JSON object mein de (jisme "headline", "content", "tags" array, aur "stats" object ho).
- Source credit zaroor de
- Agar harmful content hai toh skip kare

OUTPUT FORMAT (JSON object or array of objects):
[{
  "headline": "...",
  "content": "...",
  "tags": ["#tag1", "#tag2"],
  "stats": { "mentions": "100k+", "shares": "50k+" },
  "source": "Reddit"
}]

Meme/Viral content description (raw JSON): `;
async function runMemeContentTracker() {
    console.log("[Meme Tracker] Starting meme tracking...");
    try {
        const rawMemes = [];
        for (const url of MEME_SOURCES) {
            try {
                const response = await axios_1.default.get(url);
                const memes = response.data.data.children
                    .filter((c) => !c.data.is_video && c.data.url?.endsWith(".jpg")) // Get image memes only
                    .map((child) => ({
                    title: child.data.title,
                    ups: child.data.ups,
                    num_comments: child.data.num_comments,
                    url: child.data.url,
                    subreddit: child.data.subreddit,
                }));
                rawMemes.push(...memes);
            }
            catch (err) {
                console.error(`[Meme Tracker] Failed to fetch ${url}`, err);
            }
        }
        if (rawMemes.length === 0)
            return;
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.error("[Meme Tracker] Missing OPENAI_API_KEY");
            return;
        }
        const payload = JSON.stringify(rawMemes);
        const response = await axios_1.default.post("https://api.openai.com/v1/chat/completions", {
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You strictly output valid JSON arrays. Do not output markdown code blocks. Just the raw JSON array." },
                { role: "user", content: AI_PROMPT + payload }
            ],
            temperature: 0.5
        }, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`
            }
        });
        let aiContent = response.data.choices[0]?.message?.content || "[]";
        aiContent = aiContent.replace(/```json/g, "").replace(/```/g, "").trim();
        let processedMemes = [];
        try {
            processedMemes = JSON.parse(aiContent);
            if (!Array.isArray(processedMemes)) {
                processedMemes = [processedMemes];
            }
        }
        catch (err) {
            console.error("[Meme Tracker] Failed to parse JSON from AI", err);
            return;
        }
        let i = 0;
        for (const meme of processedMemes) {
            if (!meme.headline || !meme.content)
                continue;
            const rawMeme = rawMemes[i] || rawMemes[0];
            const existing = await NewsArticle_1.NewsArticle.findOne({ title: meme.headline });
            if (!existing) {
                await NewsArticle_1.NewsArticle.create({
                    title: meme.headline,
                    excerpt: meme.content.substring(0, 150) + "...",
                    content: meme.content + "\\n\\nStats: " + JSON.stringify(meme.stats),
                    category: "Memes",
                    source: meme.source || "Reddit",
                    sourceUrl: rawMeme?.url || "",
                    publishedAt: new Date(),
                    author: "FactFlow Viral Desk",
                    language: "Hinglish",
                    tags: meme.tags || ["#viral", "#meme"],
                    isPremium: false,
                    score: Math.min(10, Math.ceil((rawMeme?.ups || 1000) / 1000)), // Scale based on upvotes
                });
            }
            i++;
        }
        console.log(`[Meme Tracker] Successfully processed ${processedMemes.length} meme articles.`);
    }
    catch (error) {
        console.error("[Meme Tracker] Error:", error);
    }
}
//# sourceMappingURL=memeContentTracker.js.map