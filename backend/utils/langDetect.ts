const HINDI_MARKERS = ["है", "का", "की", "के", "में", "को", "से", "पर", "और", "एक", "यह", "वह", "लिए", "बाद", "सकता", "सकती", "कर", "ना", "था", "थी"]
const MARATHI_MARKERS = ["आहे", "चा", "ची", "चे", "मध्ये", "ला", "पासून", "वर", "आणि", "हे", "ती", "साठी", "नंतर", "शकतो", "शकते", "करू", "नये", "होते", "होती"]

export function detectLanguage(text: string): string {
  if (!text) return "English"

  const chars = [...text]
  let devanagariCount = 0
  let tamilCount = 0
  let teluguCount = 0
  let bengaliCount = 0
  let gujaratiCount = 0
  let gurmukhiCount = 0

  for (const ch of chars) {
    const code = ch.codePointAt(0) || 0
    if (code >= 0x0900 && code <= 0x097F) devanagariCount++
    else if (code >= 0x0B80 && code <= 0x0BFF) tamilCount++
    else if (code >= 0x0C00 && code <= 0x0C7F) teluguCount++
    else if (code >= 0x0980 && code <= 0x09FF) bengaliCount++
    else if (code >= 0x0A80 && code <= 0x0AFF) gujaratiCount++
    else if (code >= 0x0A00 && code <= 0x0A7F) gurmukhiCount++
  }

  if (gujaratiCount > 0) return "Gujarati"
  if (gurmukhiCount > 0) return "Punjabi"
  if (tamilCount > 0) return "Tamil"
  if (teluguCount > 0) return "Telugu"
  if (bengaliCount > 0) return "Bengali"

  if (devanagariCount > 0) {
    const lower = text.toLowerCase()
    let hindiScore = 0
    let marathiScore = 0

    for (const word of HINDI_MARKERS) {
      if (lower.includes(word)) hindiScore++
    }
    for (const word of MARATHI_MARKERS) {
      if (lower.includes(word)) marathiScore++
    }

    return marathiScore > hindiScore ? "Marathi" : "Hindi"
  }

  return "English"
}
