"use client"

import { useEffect } from "react"
import { useSettingsStore } from "@/store/settings-store"

export function SettingsWrapper({ children }: { children: React.ReactNode }) {
  const { settings } = useSettingsStore()

  useEffect(() => {
    const root = document.documentElement

    // Font Size
    root.classList.remove('font-small', 'font-default', 'font-large', 'font-extralarge')
    
    if (settings?.appearance?.fontSize) {
      root.classList.add(`font-${settings.appearance.fontSize.toLowerCase()}`)
    } else {
      root.classList.add('font-default')
    }

    // Dynamic Font Style Injection & Global Override
    const fontStyle = settings?.appearance?.fontStyle || 'Inter'
    
    // Inject Google Font link if it doesn't exist
    const fontId = `dynamic-font-${fontStyle.replace(/\s+/g, '-')}`
    if (!document.getElementById(fontId)) {
      const link = document.createElement('link')
      link.id = fontId
      link.rel = 'stylesheet'
      link.href = `https://fonts.googleapis.com/css2?family=${fontStyle.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`
      document.head.appendChild(link)
    }

    // Override the root CSS variable so Tailwind picks it up everywhere
    root.style.setProperty('--font-sans', `"${fontStyle}", sans-serif`)
    // Also aggressively set it on the body just in case
    document.body.style.setProperty('font-family', `"${fontStyle}", sans-serif`, 'important')

    // Layout
    root.classList.remove('layout-compact', 'layout-comfortable', 'layout-spacious')
    if (settings?.layout) {
      root.classList.add(`layout-${settings.layout.toLowerCase()}`)
    } else {
      root.classList.add('layout-comfortable')
    }

    // Display Options
    const displayOptions = (settings?.displayOptions || {}) as { thumbnails?: boolean }
    
    if (displayOptions.thumbnails === false) {
      root.classList.add('hide-thumbnails')
    } else {
      root.classList.remove('hide-thumbnails')
    }


  }, [settings])

  return <>{children}</>
}
