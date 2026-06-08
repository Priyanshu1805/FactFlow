"use client"

import { useEffect } from "react"
import { useSettingsStore } from "@/store/settings-store"
import { MotionConfig } from "framer-motion"

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettingsStore()

  useEffect(() => {
    const acc = settings.accessibility || ({} as Partial<NonNullable<typeof settings.accessibility>>)
    const highContrast = acc.highContrast ?? false
    const reduceMotion = acc.reduceMotion ?? false
    const largeTapTargets = acc.largeTapTargets ?? false
    const boldText = acc.boldText ?? false
    const textSize = acc.textSize ?? 100
    const imageAltText = acc.imageAltText ?? true
    const screenReaderSupport = acc.screenReaderSupport ?? false
    
    const htmlClassList = document.documentElement.classList
    
    // Toggle high contrast
    if (highContrast) {
      htmlClassList.add('high-contrast')
    } else {
      htmlClassList.remove('high-contrast')
    }

    // Toggle reduce motion
    if (reduceMotion) {
      htmlClassList.add('reduce-motion')
    } else {
      htmlClassList.remove('reduce-motion')
    }

    // Toggle large tap targets
    if (largeTapTargets) {
      htmlClassList.add('large-tap-targets')
    } else {
      htmlClassList.remove('large-tap-targets')
    }

    // Toggle bold text
    if (boldText) {
      htmlClassList.add('bold-text')
    } else {
      htmlClassList.remove('bold-text')
    }

    // Screen Reader optimizations
    if (screenReaderSupport) {
      htmlClassList.add('screen-reader-optimized')
    } else {
      htmlClassList.remove('screen-reader-optimized')
    }

    // Image Alt Text
    if (imageAltText) {
      htmlClassList.add('show-alt-text')
    } else {
      htmlClassList.remove('show-alt-text')
    }

    // Set Text Size scale
    if (textSize) {
      document.documentElement.style.setProperty('--text-scale', `${textSize}%`)
      // Also set the native font-size so rem units scale correctly
      document.documentElement.style.fontSize = `${textSize}%`
    } else {
      document.documentElement.style.removeProperty('--text-scale')
      document.documentElement.style.fontSize = '100%'
    }

  }, [settings.accessibility])

  return (
    <MotionConfig reducedMotion={settings.accessibility?.reduceMotion ? "always" : "user"}>
      {children}
    </MotionConfig>
  )
}
