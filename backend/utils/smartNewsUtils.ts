import { NewsArticle } from "../models/NewsArticle"
import { createBulkNotifications } from "../services/notificationService"
import { getSocket } from "../services/pushService"

/**
 * 1. CLICKBAIT DETECTOR
 * Uses heuristic regex patterns to detect trash/clickbait journalism.
 */
export function isClickbait(title: string): boolean {
  if (!title) return false
  const lowerTitle = title.toLowerCase()
  
  const clickbaitPatterns = [
    /you won'?t believe/i,
    /will shock you/i,
    /this is what happens/i,
    /what happened next/i,
    /mind[- ]blowing/i,
    /jaw[- ]dropping/i,
    /here'?s why/i,
    /number \d will surprise you/i,
    /the real reason/i,
    /the secret to/i,
    /\b(shocking|insane|unbelievable)\b/i,
    /make you cry/i,
    /make you laugh/i,
    /we need to talk about/i,
    /can'?t handle/i,
    /the ultimate/i,
    /absolutely/i,
    /the internet is freaking out/i,
    /what you need to know/i,
    /everything you need to know/i,
  ]

  // If title has excessive capitalization or exclamation marks
  const capsRatio = (title.match(/[A-Z]/g)?.length || 0) / title.length
  if (capsRatio > 0.5 && title.length > 20) return true
  if ((title.match(/!/g)?.length || 0) > 2) return true

  for (const pattern of clickbaitPatterns) {
    if (pattern.test(lowerTitle)) return true
  }

  return false
}

/**
 * 2. SMART ENTITY EXTRACTION (AUTO-TAGGING)
 * Extracts capitalized words (Proper Nouns) as tags, ignoring stop words.
 */
export function extractEntities(text: string): string[] {
  if (!text) return []
  
  const stopWords = new Set([
    "The", "A", "An", "In", "On", "At", "To", "From", "By", "With", "About", "For", "Of", "And", "Or", "But", "Is", "Are", "Was", "Were", "Will", "Would", "Can", "Could", "Should", "If", "It", "They", "We", "He", "She", "This", "That", "These", "Those", "Have", "Has", "Had", "Not", "No", "Yes", "New", "How", "Why", "When", "Where", "Who", "What", "Which", "Their", "There", "Then", "Than", "As", "So", "Do", "Does", "Did", "Just", "Like", "Out", "Up", "Down", "Over", "Under", "After", "Before", "Into", "Onto", "Upon", "Its", "Our", "My", "Your", "His", "Her", "Itself", "Himself", "Herself", "Themselves", "Ourselves", "Myself", "Yourself", "Being", "Been", "Doing", "Done", "Having", "Get", "Got", "Getting", "Go", "Goes", "Going", "Went", "Gone", "Make", "Makes", "Making", "Made", "Take", "Takes", "Taking", "Took", "Taken", "See", "Sees", "Seeing", "Saw", "Seen", "Know", "Knows", "Knowing", "Knew", "Known", "Think", "Thinks", "Thinking", "Thought", "Look", "Looks", "Looking", "Looked", "Want", "Wants", "Wanting", "Wanted", "Give", "Gives", "Giving", "Gave", "Given", "Use", "Uses", "Using", "Used", "Find", "Finds", "Finding", "Found", "Tell", "Tells", "Telling", "Told", "Ask", "Asks", "Asking", "Asked", "Work", "Works", "Working", "Worked", "Seem", "Seems", "Seeming", "Seemed", "Feel", "Feels", "Feeling", "Felt", "Try", "Tries", "Trying", "Tried", "Leave", "Leaves", "Leaving", "Left", "Call", "Calls", "Calling", "Called"
  ])

  // Extract sequences of Capitalized Words (e.g., "Elon Musk", "Supreme Court")
  const matches = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g)
  if (!matches) return []

  const entities = new Set<string>()
  for (const match of matches) {
    if (!stopWords.has(match) && match.length > 2) {
      entities.add(match)
    }
  }

  // Return up to 5 top entities
  return Array.from(entities).slice(0, 5)
}

/**
 * 3. FUZZY DUPLICATE DETECTION (Jaccard Similarity)
 * Returns similarity score between 0.0 and 1.0
 */
export function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0
  
  const set1 = new Set(str1.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/))
  const set2 = new Set(str2.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/))
  
  if (set1.size === 0 || set2.size === 0) return 0

  const intersection = new Set(Array.from(set1).filter(x => set2.has(x)))
  const union = new Set([...Array.from(set1), ...Array.from(set2)])

  return intersection.size / union.size
}

/**
 * 4. VIRAL VELOCITY & DUPLICATE PREVENTION
 * Analyzes DB for duplicates. If 3+ similar articles found in last 3 hours, promotes to BREAKING!
 * Returns { isDuplicate: boolean, promoteToBreaking: boolean }
 */
export async function processSmartArticle(title: string, content: string, category: string): Promise<{ isDuplicate: boolean, promoteToBreaking: boolean }> {
  // Check articles in the same category from the last 12 hours
  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000)
  
  const recentArticles = await NewsArticle.find({
    category,
    publishedAt: { $gte: twelveHoursAgo }
  }).select('title isBreaking').lean()

  let similarCount = 0
  let isDuplicate = false

  for (const article of recentArticles) {
    const similarity = calculateSimilarity(title, article.title)
    
    // If it's 75%+ similar, it's the exact same story from a different source
    if (similarity > 0.75) {
      isDuplicate = true
      similarCount++
    } else if (similarity > 0.40) {
      // If it's 40-75% similar, it might be the same event reported differently
      similarCount++
    }
  }

  // VIRAL VELOCITY: If 4+ different sources reported the same event in the last 12 hours,
  // it's a massive story. We promote it to Breaking!
  const promoteToBreaking = similarCount >= 3

  return { isDuplicate, promoteToBreaking }
}
