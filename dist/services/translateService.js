"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateArticle = translateArticle;
exports.getTranslatedArticle = getTranslatedArticle;
const axios_1 = __importDefault(require("axios"));
const google_translate_api_1 = require("@vitalets/google-translate-api");
const NewsArticle_1 = require("../models/NewsArticle");
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
const TARGET_LANGUAGES = ["Hindi", "Marathi", "Tamil", "Telugu", "Bengali", "Gujarati", "Punjabi", "English"];
const LANG_CODE = {
    hindi: "hi",
    marathi: "mr",
    tamil: "ta",
    telugu: "te",
    bengali: "bn",
    gujarati: "gu",
    punjabi: "pa",
    english: "en", // ✅ FIX 1: English add kiya
};
function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}
async function callGemini(prompt) {
    if (!GEMINI_API_KEY)
        return null;
    try {
        const { data } = await axios_1.default.post(GEMINI_URL, {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 500 },
        }, { timeout: 20000 });
        return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
    }
    catch {
        return null;
    }
}
async function translateViaGoogle(text, target, source) {
    try {
        const shortText = text.length > 200 ? text.slice(0, 200) : text;
        const options = { to: target };
        if (source)
            options.from = source;
        const result = await (0, google_translate_api_1.translate)(shortText, options);
        return result.text || null;
    }
    catch (err) {
        console.error(`Google translate failed for ${target}: ${err?.message || err}`);
        return null;
    }
}
async function translateArticle(articleId, title, excerpt, sourceLang = "English") {
    const translations = {};
    // ✅ FIX 2: Source language ka original content bhi translations mein save karo
    const sourceLangKey = sourceLang.toLowerCase();
    translations[sourceLangKey] = { title, excerpt };
    // ✅ FIX 3: Sirf un languages ko translate karo jo source se alag hain
    const langsToTranslate = TARGET_LANGUAGES.filter((l) => l.toLowerCase() !== sourceLangKey);
    // Try Gemini batch translation first
    if (GEMINI_API_KEY) {
        const prompt = `Translate the following news article from ${sourceLang} into ${langsToTranslate.join(", ")}.
Return ONLY a JSON object where keys are language names (lowercase: hindi, marathi, tamil, telugu, bengali, gujarati, punjabi, english) and each value has "title" and "excerpt".
Do NOT include any other text.

Title: ${title}
Excerpt: ${excerpt}`;
        const response = await callGemini(prompt);
        if (response) {
            try {
                const cleaned = response
                    .replace(/```json\s*/g, "")
                    .replace(/```\s*/g, "")
                    .trim();
                const start = cleaned.indexOf("{");
                const end = cleaned.lastIndexOf("}");
                if (start !== -1 && end !== -1) {
                    const parsed = JSON.parse(cleaned.slice(start, end + 1));
                    let hasAny = false;
                    for (const lang of langsToTranslate.map((l) => l.toLowerCase())) {
                        const entry = parsed[lang];
                        if (typeof entry === "object" &&
                            entry !== null &&
                            entry.title &&
                            entry.excerpt) {
                            translations[lang] = {
                                title: entry.title,
                                excerpt: entry.excerpt,
                            };
                            hasAny = true;
                        }
                    }
                    if (hasAny) {
                        await NewsArticle_1.NewsArticle.findByIdAndUpdate(articleId, {
                            $set: { translations },
                        }).catch(() => { });
                        return translations;
                    }
                }
            }
            catch { }
        }
    }
    // Fallback: Google Translate
    const sourceCode = LANG_CODE[sourceLangKey] || "en";
    for (const lang of langsToTranslate) {
        const langKey = lang.toLowerCase();
        if (translations[langKey])
            continue;
        const code = LANG_CODE[langKey];
        if (!code)
            continue;
        // ✅ FIX 4: English mein translate karne ke liye bhi handle karo
        const translatedText = await translateViaGoogle(`${title}. ${excerpt}`, code, sourceCode);
        if (!translatedText)
            continue;
        const dotIndex = translatedText.indexOf("。");
        const dotEn = translatedText.indexOf(". ");
        const splitAt = dotIndex !== -1
            ? dotIndex
            : dotEn !== -1
                ? dotEn + 1
                : Math.floor(translatedText.length / 2);
        const tTitle = translatedText
            .slice(0, splitAt + 1)
            .replace(/^["""]|["""]$/g, "")
            .trim();
        const tExcerpt = translatedText
            .slice(splitAt + 1)
            .replace(/^["""]|["""]$/g, "")
            .trim();
        if (tTitle && tExcerpt) {
            translations[langKey] = { title: tTitle, excerpt: tExcerpt };
        }
        await sleep(500);
    }
    if (Object.keys(translations).length > 0) {
        await NewsArticle_1.NewsArticle.findByIdAndUpdate(articleId, {
            $set: { translations },
        }).catch(() => { });
    }
    return translations;
}
function getTranslatedArticle(article, targetLang) {
    const lang = targetLang.toLowerCase();
    // ✅ FIX 5: Pehle translations check karo
    if (article.translations?.[lang]?.title) {
        return {
            title: article.translations[lang].title,
            excerpt: article.translations[lang].excerpt,
        };
    }
    // ✅ FIX 6: Agar English maanga aur original English mein hai toh seedha do
    if (lang === "english") {
        return {
            title: article.title,
            excerpt: article.excerpt,
        };
    }
    // ✅ FIX 7: Agar koi translation nahi mili — original hi do, Gujarati nahi dikhega
    // kyunki translateArticle ab source language bhi save karta hai
    return {
        title: article.title,
        excerpt: article.excerpt,
    };
}
//# sourceMappingURL=translateService.js.map