import { create } from "zustand"

export type LangCode = "english" | "hindi" | "marathi" | "tamil" | "telugu" | "bengali" | "gujarati" | "punjabi"
export type RegionCode = "india" | "us" | "uk" | "global"

// Maps LangCode → English language name expected by the news API
const LANG_CODE_TO_NEWS_LANG: Record<LangCode, string> = {
  english: "English",
  hindi: "Hindi",
  marathi: "Marathi",
  tamil: "Tamil",
  telugu: "Telugu",
  bengali: "Bengali",
  gujarati: "Gujarati",
  punjabi: "Punjabi",
}

interface LanguageState {
  lang: LangCode
  region: RegionCode
  setLang: (lang: LangCode) => void
  setRegion: (region: RegionCode) => void
  init: () => void
}

export const useLanguageStore = create<LanguageState>((set) => ({
  lang: "english",
  region: "india",
  setLang: (lang: LangCode) => {
    set({ lang })
    if (typeof window !== "undefined") {
      localStorage.setItem("ff_lang", lang)
      // Sync news content language so news API filter works
      const newsLang = LANG_CODE_TO_NEWS_LANG[lang] || "English"
      localStorage.setItem("ff_news_languages", JSON.stringify([newsLang]))
      window.dispatchEvent(new Event("ff_settings_changed"))
    }
  },
  setRegion: (region: RegionCode) => {
    set({ region })
    if (typeof window !== "undefined") {
      localStorage.setItem("ff_region", region)
      window.dispatchEvent(new Event("ff_settings_changed"))
    }
  },
  init: () => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("ff_lang") as LangCode
      const savedRegion = localStorage.getItem("ff_region") as RegionCode
      if (savedLang) {
        set({ lang: savedLang })
        // Also sync news language on init
        const newsLang = LANG_CODE_TO_NEWS_LANG[savedLang] || "English"
        localStorage.setItem("ff_news_languages", JSON.stringify([newsLang]))
      }
      if (savedRegion) set({ region: savedRegion })
    }
  }
}))
