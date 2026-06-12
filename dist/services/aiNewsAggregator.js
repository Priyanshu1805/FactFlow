"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAiNewsAggregator = runAiNewsAggregator;
const axios_1 = __importDefault(require("axios"));
const rss_parser_1 = __importDefault(require("rss-parser"));
const NewsArticle_1 = require("../models/NewsArticle");
const parser = new rss_parser_1.default({
    customFields: {
        item: [
            ['media:content', 'mediaContent'],
            ['enclosure', 'enclosure'],
        ]
    }
});
const RSS_SOURCES = [
    "https://www.thehindu.com/news/national/feeder/default.rss",
    "https://timesofindia.indiatimes.com/rssfeeds/4719148.cms",
];
const REDDIT_SOURCES = [
    "https://www.reddit.com/r/india/hot.json?limit=5",
    "https://www.reddit.com/r/technology/hot.json?limit=5",
];
const AI_PROMPT = `Tu ek news aggregation AI hai. Tujhe niche diye sources se news fetch karni hai aur unhe process karna hai.

RULES:
- Duplicate news hata do (same story alag sources se)
- Category assign karo: Politics | Tech | Entertainment | Sports | Business | Lifestyle | Science | Memes | General
- IMPORTANT: No matter what language the input news is in (Hindi, Marathi, etc.), you MUST translate the "headline" and "summary" into purely ENGLISH.
- Language detect karo: Output the ORIGINAL language of the article (Hindi | English | Marathi | Mixed), even though your output headline/summary will be in English.
- Importance score do: 1-10 (breaking=9-10, regular=4-6, evergreen=1-3)
- Detect content attributes and output boolean values for:
  - isMisinformation: If the article seems like fake news, highly unverified, or known conspiracy.
  - isVerifiedSource: If the source is a known, reputable publisher.
  - isClickbait: If the headline is overly sensationalized or misleading.
  - isSensitive: If it contains graphic violence, adult content, or highly disturbing material.

OUTPUT FORMAT (JSON array of objects):
[{
  "headline": "...",
  "summary": "150 words max",
  "category": "...",
  "language": "...",
  "importance": 8,
  "sources": ["url1"],
  "image_url": "url",
  "tags": ["tag1","tag2"],
  "isMisinformation": false,
  "isVerifiedSource": true,
  "isClickbait": false,
  "isSensitive": false
}]

Input news: `;
async function runAiNewsAggregator() {
    console.log("[AI Aggregator] Fetching from multiple sources...");
    try {
        const rawItems = [];
        // Fetch RSS
        for (const url of RSS_SOURCES) {
            try {
                const feed = await parser.parseURL(url);
                rawItems.push(...feed.items.slice(0, 5).map(item => {
                    let imageUrl = "";
                    if (item.enclosure?.url)
                        imageUrl = item.enclosure.url;
                    else if (item.mediaContent?.$?.url)
                        imageUrl = item.mediaContent.$.url;
                    else {
                        // Regex to find image inside content
                        const imgMatch = item.content?.match(/<img[^>]+src="([^">]+)"/);
                        if (imgMatch)
                            imageUrl = imgMatch[1];
                    }
                    return {
                        title: item.title,
                        link: item.link,
                        content: item.contentSnippet || item.content,
                        image_url: imageUrl
                    };
                }));
            }
            catch (err) {
                console.error(`[AI Aggregator] Failed RSS ${url}`);
            }
        }
        // Fetch Reddit
        for (const url of REDDIT_SOURCES) {
            try {
                const response = await axios_1.default.get(url);
                rawItems.push(...response.data.data.children.map((child) => ({
                    title: child.data.title,
                    link: `https://reddit.com${child.data.permalink}`,
                    content: child.data.selftext?.substring(0, 300) || "",
                    image_url: child.data.url?.endsWith(".jpg") ? child.data.url : ""
                })));
            }
            catch (err) {
                console.error(`[AI Aggregator] Failed Reddit ${url}`);
            }
        }
        if (rawItems.length === 0)
            return;
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey)
            return;
        const payload = JSON.stringify(rawItems);
        let processedNews = [];
        let usedFallback = false;
        try {
            const response = await axios_1.default.post("https://api.openai.com/v1/chat/completions", {
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You strictly output valid JSON arrays. Do not output markdown. Just the raw JSON array." },
                    { role: "user", content: AI_PROMPT + payload }
                ],
                temperature: 0.2
            }, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` } });
            let content = response.data.choices[0]?.message?.content || "[]";
            content = content.replace(/```json/g, "").replace(/```/g, "").trim();
            processedNews = JSON.parse(content);
        }
        catch (err) {
            console.warn("[AI Aggregator] OpenAI Failed (Status " + err.response?.status + "). Using raw fallback.");
            usedFallback = true;
        }
        if (usedFallback) {
            processedNews = rawItems.map((item) => ({
                headline: item.title,
                summary: item.content?.substring(0, 200),
                category: "General",
                language: "English",
                importance: 5,
                sources: [item.link],
                image_url: item.image_url || "",
                tags: ["news"]
            }));
        }
        for (const news of processedNews) {
            if (!news.headline)
                continue;
            const existing = await NewsArticle_1.NewsArticle.findOne({ title: news.headline });
            if (!existing) {
                await NewsArticle_1.NewsArticle.create({
                    title: news.headline,
                    excerpt: news.summary,
                    content: news.summary,
                    category: news.category,
                    source: news.sources[0] || "AI Aggregator",
                    sourceUrl: news.sources[0] || "",
                    imageUrl: news.image_url || "",
                    publishedAt: new Date(),
                    author: "FactFlow AI",
                    language: news.language || "English",
                    tags: news.tags || [],
                    isPremium: news.importance >= 9,
                    score: news.importance,
                    isMisinformation: news.isMisinformation || false,
                    isVerifiedSource: news.isVerifiedSource !== undefined ? news.isVerifiedSource : true,
                    isClickbait: news.isClickbait || false,
                    isSensitive: news.isSensitive || false
                });
            }
        }
        console.log(`[AI Aggregator] Successfully saved ${processedNews.length} multi-source news items.`);
    }
    catch (error) {
        console.error("[AI Aggregator] Error:", error);
    }
}
//# sourceMappingURL=aiNewsAggregator.js.map