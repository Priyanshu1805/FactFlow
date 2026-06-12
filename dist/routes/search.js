"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const router = express_1.default.Router();
router.get("/", async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            res.status(400).json({ message: "Search query 'q' is required" });
            return;
        }
        const encodedQuery = encodeURIComponent(query);
        const lowerQuery = query.toLowerCase();
        // --- SMART INTENT ENGINE ---
        const foodKeywords = ["pizza", "burger", "kfc", "domino", "zomato", "swiggy", "chicken", "pasta", "coffee", "restaurant", "food", "biryani"];
        const shoppingKeywords = ["iphone", "samsung", "laptop", "shoes", "nike", "adidas", "shirt", "watch", "amazon", "flipkart", "buy", "price", "macbook", "phone"];
        let simulatedCards = [];
        // 1. Check for Food Intent
        if (foodKeywords.some(kw => lowerQuery.includes(kw))) {
            simulatedCards.push({
                _id: `food-${Date.now()}`,
                title: `Order ${query.charAt(0).toUpperCase() + query.slice(1)} - 30 Mins Delivery`,
                excerpt: `Get the best ${query} delivered hot and fresh. Order now via Zomato/Swiggy.`,
                content: `Discover top-rated restaurants near you serving ${query}. Enjoy free delivery on your first order.`,
                category: "Food Delivery",
                image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
                author: "Zomato / Swiggy Network",
                publishedAt: new Date().toISOString(),
                source: `https://www.zomato.com/search?q=${encodedQuery}`,
                tags: ["Food", "Local", "Delivery"],
            });
        }
        // 2. Check for Shopping Intent
        if (shoppingKeywords.some(kw => lowerQuery.includes(kw))) {
            simulatedCards.push({
                _id: `shop-${Date.now()}`,
                title: `Buy ${query.charAt(0).toUpperCase() + query.slice(1)} Online - Best Prices`,
                excerpt: `Shop the latest ${query} on Amazon and Flipkart. Huge discounts available!`,
                content: `Find the lowest prices and best deals on ${query}. Read reviews, compare features, and buy online instantly.`,
                category: "Online Shopping",
                image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80",
                author: "Amazon / Flipkart",
                publishedAt: new Date().toISOString(),
                source: `https://www.amazon.in/s?k=${encodedQuery}`,
                tags: ["Shopping", "Store", "Buy"],
            });
        }
        // --- EXTERNAL APIS ---
        const fetchWikipedia = axios_1.default.get(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodedQuery}&utf8=&format=json`, { timeout: 8000 });
        const fetchNewsData = axios_1.default.get(`https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_KEY}&q=${encodedQuery}&language=en`, { timeout: 8000 });
        const fetchReddit = axios_1.default.get(`https://www.reddit.com/search.json?q=${encodedQuery}&limit=10&sort=relevance`, {
            headers: { "User-Agent": "FactFlow/1.0" },
            timeout: 8000
        });
        // DuckDuckGo Instant Answers for Google-like definitions
        const fetchDuck = axios_1.default.get(`https://api.duckduckgo.com/?q=${encodedQuery}&format=json`, { timeout: 8000 });
        const [wikiResult, newsResult, redditResult, duckResult] = await Promise.allSettled([
            fetchWikipedia,
            fetchNewsData,
            fetchReddit,
            fetchDuck
        ]);
        let allResults = [...simulatedCards];
        // 1. Process Wikipedia Results
        if (wikiResult.status === "fulfilled" && wikiResult.value.data?.query?.search) {
            const wikiItems = wikiResult.value.data.query.search.slice(0, 5).map((item) => {
                // Wikipedia snippet comes with HTML tags (like <span class="searchmatch">), we remove them roughly
                const cleanSnippet = item.snippet.replace(/<\/?[^>]+(>|$)/g, "");
                return {
                    _id: `wiki-${item.pageid}`,
                    title: item.title,
                    excerpt: cleanSnippet,
                    content: cleanSnippet,
                    category: "Wikipedia",
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/800px-Wikipedia-logo-v2.svg.png",
                    author: "Wikipedia",
                    publishedAt: item.timestamp,
                    source: `https://en.wikipedia.org/?curid=${item.pageid}`,
                    tags: ["Encyclopedia", "Factual"],
                };
            });
            allResults.push(...wikiItems);
        }
        // 2. Process NewsData API Results
        if (newsResult.status === "fulfilled" && newsResult.value.data?.results) {
            const newsItems = newsResult.value.data.results.map((article, index) => ({
                _id: `news-${Date.now()}-${index}`,
                title: article.title,
                excerpt: article.description || article.title,
                content: article.content || article.description || article.title,
                category: article.category?.[0] || "News",
                image: article.image_url || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80",
                author: article.source_id || "Global News",
                publishedAt: article.pubDate,
                source: article.link,
                tags: ["News"],
            }));
            allResults.push(...newsItems);
        }
        // 3. Process Reddit Results
        if (redditResult.status === "fulfilled" && redditResult.value.data?.data?.children) {
            const redditItems = redditResult.value.data.data.children
                .filter((post) => post.data && post.data.title && !post.data.over_18)
                .map((post) => {
                const data = post.data;
                let imageUrl = "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80";
                if (data.url && (data.url.endsWith(".jpg") || data.url.endsWith(".png") || data.url.endsWith(".jpeg"))) {
                    imageUrl = data.url;
                }
                else if (data.thumbnail && data.thumbnail.startsWith("http")) {
                    imageUrl = data.thumbnail;
                }
                return {
                    _id: `reddit-${data.id}`,
                    title: data.title,
                    excerpt: data.selftext ? data.selftext.slice(0, 150) + "..." : data.title,
                    content: data.selftext || data.title,
                    category: `r/${data.subreddit}`,
                    image: imageUrl,
                    author: `u/${data.author}`,
                    publishedAt: new Date(data.created_utc * 1000).toISOString(),
                    source: `https://reddit.com${data.permalink}`,
                    tags: ["Discussion", "Social"],
                };
            });
            allResults.push(...redditItems);
        }
        // 4. Process DuckDuckGo (Google-like) Results
        if (duckResult.status === "fulfilled" && duckResult.value.data?.RelatedTopics) {
            const duckItems = duckResult.value.data.RelatedTopics
                .filter((topic) => topic.Text && topic.FirstURL)
                .slice(0, 3)
                .map((topic, index) => ({
                _id: `google-${Date.now()}-${index}`,
                title: topic.Text.split(" - ")[0] || query,
                excerpt: topic.Text,
                content: topic.Text,
                category: "Google Search",
                image: topic.Icon?.URL ? `https://duckduckgo.com${topic.Icon.URL}` : "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
                author: "Web Result",
                publishedAt: new Date().toISOString(),
                source: topic.FirstURL,
                tags: ["Google", "Web"],
            }));
            allResults.push(...duckItems);
        }
        // If nothing returned
        if (allResults.length === 0) {
            res.json([]);
            return;
        }
        // Sort all results by Date (newest first), but give Wikipedia and Shopping/Food bumps
        allResults.sort((a, b) => {
            // Prioritize Shopping, Food, and Wikipedia at the top
            const getPriority = (cat) => {
                if (cat === "Food Delivery" || cat === "Online Shopping")
                    return 3;
                if (cat === "Wikipedia")
                    return 2;
                if (cat === "Google Search")
                    return 1;
                return 0;
            };
            const priorityA = getPriority(a.category);
            const priorityB = getPriority(b.category);
            if (priorityA !== priorityB)
                return priorityB - priorityA;
            return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        });
        res.json(allResults);
    }
    catch (error) {
        console.error("❌ Multi-Platform Search Error:", error);
        res.status(500).json({ message: "Failed to perform global search" });
    }
});
exports.default = router;
//# sourceMappingURL=search.js.map