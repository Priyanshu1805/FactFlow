import { create } from "zustand"
import { translations } from "./translations"

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
      
      // Google Translate Integration
      const gLang: Record<LangCode, string> = {
        english: "en", hindi: "hi", marathi: "mr", tamil: "ta", telugu: "te", bengali: "bn", gujarati: "gu", punjabi: "pa"
      }
      const targetGLang = gLang[lang] || "en"
      
      const triggerGoogleTranslate = () => {
        const clearGoogleCookies = () => {
          const domain = window.location.hostname;
          document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
          document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain};`;
        }

        if (targetGLang === "en") {
          clearGoogleCookies();
          setTimeout(() => window.location.reload(), 100);
          return;
        }

        const combos = document.querySelectorAll(".goog-te-combo")
        if (combos.length > 0) {
          combos.forEach(c => {
            const el = c as HTMLSelectElement
            el.value = targetGLang
            el.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }))
          })
        } else {
          // Fallback if widget not loaded
          if (targetGLang !== "en") {
            document.cookie = `googtrans=/en/${targetGLang}; path=/;`;
            document.cookie = `googtrans=/en/${targetGLang}; path=/; domain=${window.location.hostname};`;
            setTimeout(() => window.location.reload(), 300);
          }
        }
      }
      
      triggerGoogleTranslate();
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
        
        // Sync Google Translate cookie
        const gLang: Record<LangCode, string> = {
          english: "en", hindi: "hi", marathi: "mr", tamil: "ta", telugu: "te", bengali: "bn", gujarati: "gu", punjabi: "pa"
        }
        const targetGLang = gLang[savedLang] || "en"
        
        if (targetGLang !== "en") {
          document.cookie = `googtrans=/en/${targetGLang}; path=/;`;
          document.cookie = `googtrans=/en/${targetGLang}; path=/; domain=${window.location.hostname};`;
        }
      }
      if (savedRegion) set({ region: savedRegion })
    }
  }
}))

export const useTranslation = () => {
  const { lang } = useLanguageStore()
  
  const t = (key: string): string => {
    return translations[lang]?.[key] || translations.english[key] || key
  }

  return { t, lang }
}
