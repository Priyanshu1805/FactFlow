"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.keywordClassify = keywordClassify;
exports.classifyWithAI = classifyWithAI;
exports.classifyArticle = classifyArticle;
const openai_1 = __importDefault(require("openai"));
const crypto_1 = __importDefault(require("crypto"));
const cacheService_1 = require("./cacheService");
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key'
});
// KEYWORD MAP for all 9 sections:
const KEYWORD_MAP = {
    live: ['breaking', 'live', 'just in', 'urgent', 'alert', 'happening now', 'developing'],
    politics: [
        'BJP', 'Congress', 'Modi', 'parliament', 'election', 'government', 'minister', 'CM', 'PM', 'Lok Sabha', 'Rajya Sabha', 'policy', 'vote', 'White House', 'NATO',
        // NEW CODE ADDED
        'Arvind Kejriwal', 'Mamata', 'Yogi', 'Shivraj', 'Hemant Soren', 'assembly election', 'by-election', 'MLA', 'MP', 'Governor', 'Supreme Court', 'High Court', 'CBI', 'ED', 'Income Tax raid', 'INDIA alliance', 'NDA', 'UPA', 'third front', 'G20', 'BRICS', 'SCO', 'bilateral', 'foreign minister', 'Xi Jinping', 'Biden', 'Putin', 'Ukraine', 'Gaza', 'Middle East'
    ],
    sports: [
        'cricket', 'IPL', 'football', 'FIFA', 'tennis', 'NBA', 'Olympics', 'match', 'wicket', 'goal', 'champion', 'league', 'Virat Kohli', 'Rohit Sharma', 'T20', 'ODI',
        // NEW CODE ADDED
        'PKL', 'Pro Kabaddi', 'ISL', 'Indian Super League', 'badminton', 'PV Sindhu', 'Saina Nehwal', 'Neeraj Chopra', 'Mary Kom', 'Sania Mirza', 'Leander Paes', 'chess', 'Viswanathan Anand', 'wrestling', 'Bajrang Punia', 'Vinesh Phogat', 'shooting', 'F1', 'Formula 1', 'MotoGP', 'boxing', 'UFC', 'WWE', 'marathon', 'cycling', 'swimming', 'athletics'
    ],
    tech: [
        'AI', 'artificial intelligence', 'smartphone', 'iPhone', 'Android', 'startup', 'ChatGPT', 'OpenAI', 'Google', 'Apple', 'Microsoft', 'crypto', 'machine learning', 'EV',
        // NEW CODE ADDED
        'Jio', 'Reliance', 'Tata Digital', 'Infosys', 'Wipro', 'TCS', 'Flipkart', 'Meesho', 'Razorpay', 'Zerodha', 'CRED', 'PhonePe', 'UPI', 'digital payment', 'fintech', 'edtech', 'healthtech', 'ISRO', 'Chandrayaan', 'Aditya', 'space mission', 'semiconductor', '5G', '6G', 'data center', 'cloud computing', 'cybercrime', 'deepfake', 'generative AI', 'LLM', 'GPT'
    ],
    lifestyle: [
        'health', 'fitness', 'fashion', 'food', 'travel', 'beauty', 'wellness', 'diet', 'recipe', 'yoga', 'skincare', 'restaurant', 'vacation', 'mental health',
        // NEW CODE ADDED
        'ayurveda', 'homeopathy', 'diabetes', 'cancer', 'heart disease', 'weight loss', 'keto', 'intermittent fasting', 'gut health', 'skin care routine', 'haircare', 'monsoon fashion', 'ethnic wear', 'street food', 'biryani', 'South Indian', 'vegan', 'organic', 'Goa', 'Rajasthan', 'Kerala tourism', 'hill station', 'backpacking', 'home decor', 'interior design', 'vastu', 'feng shui'
    ],
    art: [
        'movie', 'film', 'Bollywood', 'Hollywood', 'music', 'album', 'Netflix', 'OTT', 'celebrity', 'actor', 'actress', 'Amazon Prime', 'web series', 'Oscar', 'Filmfare',
        // NEW CODE ADDED
        'Shah Rukh Khan', 'Salman Khan', 'Deepika', 'Ranveer', 'Alia Bhatt', 'Priyanka', 'Akshay Kumar', 'Hrithik', 'Katrina', 'Kangana', 'IIFA', 'Zee Cine', 'box office', 'collection', 'trailer', 'teaser', 'OTT release', 'streaming', 'season 2', 'Spotify', 'YouTube music', 'concert', 'tour', 'album launch', 'Cannes', 'Emmy', 'Grammy', 'BAFTA', 'Golden Globe'
    ],
    trending: [
        'viral', 'trending', 'most read', 'popular', 'social media', 'gone viral', 'meme',
        // NEW CODE ADDED
        'Twitter storm', 'X trending', 'Instagram reel', 'YouTube shorts', 'challenge', 'hashtag', 'thread', 'controversy', 'debate', 'fact check', 'fake news busted', 'exposed', 'leaked', 'went viral', 'internet sensation', 'netizens react'
    ]
};
function keywordClassify(title, description) {
    const t = title.toLowerCase();
    const d = description.toLowerCase();
    // Always return live immediately
    if (t.includes('breaking') || t.includes('live')) {
        return 'live';
    }
    let bestSection = 'newspaper';
    let highestScore = 0;
    for (const [section, keywords] of Object.entries(KEYWORD_MAP)) {
        let score = 0;
        for (const kw of keywords) {
            const lowerKw = kw.toLowerCase();
            if (t.includes(lowerKw))
                score += 2;
            if (d.includes(lowerKw))
                score += 1;
        }
        if (score > highestScore) {
            highestScore = score;
            bestSection = section;
        }
    }
    return bestSection;
}
async function classifyWithAI(title, description) {
    const hash = crypto_1.default.createHash('sha256').update(title).digest('hex');
    const cacheKey = `classify:${hash}`;
    const cached = await (0, cacheService_1.getCached)(cacheKey);
    if (cached)
        return cached;
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy_key') {
        return 'newspaper';
    }
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'Classify this news article into EXACTLY ONE of these sections: live, politics, sports, tech, lifestyle, art, trending, newspaper. Respond with just the single word.'
                },
                {
                    role: 'user',
                    content: `Title: ${title}\nDescription: ${description}`
                }
            ],
            max_tokens: 10,
            temperature: 0.1
        });
        let section = response.choices[0]?.message?.content?.trim().toLowerCase() || 'newspaper';
        const validSections = ['live', 'politics', 'sports', 'tech', 'lifestyle', 'art', 'trending', 'newspaper'];
        if (!validSections.includes(section)) {
            section = 'newspaper';
        }
        await (0, cacheService_1.setCached)(cacheKey, section, 3600); // 1 hour cache
        return section;
    }
    catch (error) {
        console.error('AI Classification failed:', error);
        return 'newspaper';
    }
}
async function classifyArticle(title, description) {
    try {
        const kwResult = keywordClassify(title, description);
        if (kwResult !== 'newspaper') {
            return kwResult;
        }
        return await classifyWithAI(title, description);
    }
    catch (error) {
        return 'newspaper';
    }
}
//# sourceMappingURL=newsClassifier.js.map