"use client"
import { useEffect } from "react"

export function GoogleTranslate() {
  useEffect(() => {
    if (!document.getElementById("google_translate_element")) {
      const div = document.createElement("div")
      div.id = "google_translate_element"
      div.style.display = "none"
      document.body.appendChild(div)
    }

    if (!document.getElementById("google-translate-script")) {
      ;(window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement(
          { pageLanguage: "en", includedLanguages: "en,hi,mr,ta,te,bn,gu,pa", autoDisplay: false },
          "google_translate_element"
        )
      }
      const script = document.createElement("script")
      script.id = "google-translate-script"
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
      script.async = true
      document.body.appendChild(script)
    }
  }, [])
  return null
}
