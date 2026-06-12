"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.smartProcessor = smartProcessor;
const axios_1 = __importDefault(require("axios"));
const langDetect_1 = require("../utils/langDetect");
const AI_PROMPT = `You are a smart news processor. Given these raw news items with numeric IDs, assign a category/section to each.
Valid sections: Newspaper, Politics, Trending, Lifestyle, Sports, Tech, Memes

Also output "isTrending: true" if the news is highly viral/breaking.

CRITICAL: If the title or description (desc) is in any language other than English (such as Hindi, Marathi, etc.), you MUST translate them to English. The output "title" and "description" must be in English.
If description (desc) is missing or brief, you can output a short, clean description snippet in English based on the title.

Output ONLY a JSON array of objects with fields: { id, title, description, section, isTrending }
Input data: `;
// Lightning-fast Set-based Jaccard similarity instead of Levenshtein
function getSimilarity(a, b) {
    const wordsA = new Set(a.match(/\b\w+\b/g) || []);
    const wordsB = new Set(b.match(/\b\w+\b/g) || []);
    if (wordsA.size === 0 && wordsB.size === 0)
        return 1.0;
    if (wordsA.size === 0 || wordsB.size === 0)
        return 0.0;
    let intersection = 0;
    for (const word of wordsA) {
        if (wordsB.has(word))
            intersection++;
    }
    const union = wordsA.size + wordsB.size - intersection;
    return intersection / union;
}
function fallbackClassifier(title, description, defaultCat) {
    const text = (title + " " + description).toLowerCase();
    if (/\b(cricket|football|ipl|fifa|tennis|nba|olympics|kohli|messi)\b/.test(text))
        return "Sports";
    if (/\b(ai|iphone|android|startup|coding|software|gadget|google|microsoft|apple)\b/.test(text))
        return "Tech";
    if (/\b(bjp|congress|pm modi|election|parliament|government|minister|biden|trump)\b/.test(text))
        return "Politics";
    if (/\b(meme|funny|viral|lol|rofl|reddit)\b/.test(text))
        return "Memes";
    if (/\b(health|fitness|fashion|travel|food|wellness|beauty)\b/.test(text))
        return "Lifestyle";
    if (/\b(breaking|just in|live)\b/.test(text))
        return "Trending";
    return defaultCat || "Newspaper";
}
function calculateQualityScore(item) {
    let score = 50; // Base score
    // 1. Source Credibility
    const topSources = ["bbc", "reuters", "nytimes", "the hindu", "associated press"];
    if (item.source && topSources.some(s => item.source.toLowerCase().includes(s)))
        score += 20;
    else if (item.type === "reddit")
        score += 5; // user generated
    else if (item.type === "nitter")
        score += 10;
    // 2. Engagement (for reddit/social)
    if (item.score && item.score > 1000)
        score += 15;
    else if (item.score && item.score > 100)
        score += 5;
    // 3. Media presence
    if (item.imageUrl && item.imageUrl.length > 5)
        score += 10;
    // 4. Recency (within last 2 hours)
    const ageInHours = (Date.now() - new Date(item.publishedAt).getTime()) / (1000 * 60 * 60);
    if (ageInHours <= 2)
        score += 10;
    return Math.min(score, 100); // Max 100
}
async function smartProcessor(rawItems, existingTitles = []) {
    console.log(`🧠 [SmartProcessor] Processing ${rawItems.length} items...`);
    // 1. DEDUPLICATION (Levenshtein distance)
    const uniqueItems = [];
    const currentTitles = [...existingTitles];
    for (const item of rawItems) {
        if (!item.title)
            continue;
        let maxSimilarity = 0;
        for (const title of currentTitles) {
            const sim = getSimilarity(item.title.toLowerCase(), title.toLowerCase());
            if (sim > maxSimilarity)
                maxSimilarity = sim;
        }
        if (maxSimilarity < 0.8) { // Only keep if less than 80% similar to existing
            uniqueItems.push(item);
            currentTitles.push(item.title);
        }
    }
    console.log(`🧠 [SmartProcessor] ${rawItems.length - uniqueItems.length} duplicates removed.`);
    // 2. AI CLASSIFICATION & TRANSLATION
    let aiResults = [];
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && uniqueItems.length > 0) {
        const chunks = [];
        for (let i = 0; i < uniqueItems.length; i += 50) {
            chunks.push(uniqueItems.slice(i, i + 50));
        }
        console.log(`🧠 [SmartProcessor] Dispatching ${chunks.length} chunks to OpenAI in parallel...`);
        const promises = chunks.map(async (chunk, chunkIdx) => {
            const startIndex = chunkIdx * 50;
            const payload = chunk.map((item, idx) => ({
                id: startIndex + idx,
                title: item.title,
                desc: item.description?.slice(0, 100)
            }));
            try {
                const res = await axios_1.default.post("https://api.openai.com/v1/chat/completions", {
                    model: "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: "You output valid JSON array." },
                        { role: "user", content: AI_PROMPT + JSON.stringify(payload) }
                    ],
                    temperature: 0.1
                }, { headers: { Authorization: `Bearer ${apiKey}` } });
                let content = res.data.choices[0]?.message?.content || "[]";
                content = content.replace(/```json/g, "").replace(/```/g, "").trim();
                const chunkResults = JSON.parse(content);
                if (Array.isArray(chunkResults)) {
                    return chunkResults;
                }
            }
            catch (e) {
                console.warn(`⚠️ [SmartProcessor] OpenAI failed for chunk ${chunkIdx}:`, e.message);
            }
            return [];
        });
        const results = await Promise.allSettled(promises);
        results.forEach(r => {
            if (r.status === "fulfilled" && r.value) {
                aiResults.push(...r.value);
            }
        });
        console.log(`🧠 [SmartProcessor] Completed parallel processing of all chunks.`);
    }
    // 3. APPLY CLASSIFICATION, TRANSLATION & SCORES
    const processedItems = uniqueItems.map((item, idx) => {
        // Try to find AI classification by id
        const aiMatch = aiResults.find(a => a.id === idx);
        const title = aiMatch?.title || item.title;
        const description = aiMatch?.description || item.description || item.title;
        const category = aiMatch?.section || fallbackClassifier(title, description, item.category);
        const isTrending = aiMatch?.isTrending || false;
        const qualityScore = calculateQualityScore(item);
        const detectedLang = (0, langDetect_1.detectLanguage)(title).toLowerCase();
        return {
            ...item,
            title,
            description,
            category,
            isTrending,
            qualityScore,
            language: detectedLang
        };
    });
    // 4. TRENDING DETECTION (If same keywords appear multiple times)
    // Simple heuristic: if a keyword > 5 chars appears in 3+ titles, boost them to Trending
    const wordCounts = {};
    processedItems.forEach(item => {
        const words = item.title.toLowerCase().match(/\b[a-z]{5,}\b/g) || [];
        words.forEach((w) => {
            // ignore common stop words
            if (!["about", "which", "their", "there", "would", "could"].includes(w)) {
                wordCounts[w] = (wordCounts[w] || 0) + 1;
            }
        });
    });
    const trendingWords = Object.keys(wordCounts).filter(w => wordCounts[w] >= 3);
    if (trendingWords.length > 0) {
        processedItems.forEach(item => {
            const titleLower = item.title.toLowerCase();
            if (trendingWords.some(w => titleLower.includes(w))) {
                item.isTrending = true;
                item.qualityScore = Math.min(item.qualityScore + 15, 100);
            }
        });
    }
    return processedItems;
}
//# sourceMappingURL=smartProcessor.js.map