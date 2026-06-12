/**
 * 1. CLICKBAIT DETECTOR
 * Uses heuristic regex patterns to detect trash/clickbait journalism.
 */
export declare function isClickbait(title: string): boolean;
/**
 * 2. SMART ENTITY EXTRACTION (AUTO-TAGGING)
 * Extracts capitalized words (Proper Nouns) as tags, ignoring stop words.
 */
export declare function extractEntities(text: string): string[];
/**
 * 3. FUZZY DUPLICATE DETECTION (Jaccard Similarity)
 * Returns similarity score between 0.0 and 1.0
 */
export declare function calculateSimilarity(str1: string, str2: string): number;
/**
 * 4. VIRAL VELOCITY & DUPLICATE PREVENTION
 * Analyzes DB for duplicates. If 3+ similar articles found in last 3 hours, promotes to BREAKING!
 * Returns { isDuplicate: boolean, promoteToBreaking: boolean }
 */
export declare function processSmartArticle(title: string, content: string, category: string): Promise<{
    isDuplicate: boolean;
    promoteToBreaking: boolean;
}>;
//# sourceMappingURL=smartNewsUtils.d.ts.map