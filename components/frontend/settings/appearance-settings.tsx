"use client"

import { useTheme } from "@/components/theme-provider"
import { Moon, Sun, Layers, Type, Monitor, ChevronDown, Check } from "lucide-react"
import { useSettings } from "@/lib/use-settings"
import { useEffect, useState, useRef } from "react"

const THEMES = [
  { id: "dark",  label: "Dark",  icon: Moon,    desc: "Dark background — easy on eyes at night" },
  { id: "light", label: "Light", icon: Sun,     desc: "Clean white — ideal for daytime reading" },
  { id: "glass", label: "Glass", icon: Layers,  desc: "Glassmorphism — modern & stylish" },
] as const

const FONT_SIZES = [
  { id: "small", label: "Small" },
  { id: "default", label: "Default" },
  { id: "large", label: "Large" },
  { id: "extraLarge", label: "Extra Large" }
] as const

const FONT_STYLES = [
  { id: "Inter", label: "Inter (Modern Sans)" },
  { id: "Roboto", label: "Roboto (Clean Sans)" },
  { id: "Open Sans", label: "Open Sans (Friendly)" },
  { id: "Lato", label: "Lato (Elegant)" },
  { id: "Montserrat", label: "Montserrat (Geometric)" },
  { id: "Oswald", label: "Oswald (Condensed)" },
  { id: "Source Sans Pro", label: "Source Sans Pro (Legible)" },
  { id: "Slabo 27px", label: "Slabo (Newspaper)" },
  { id: "Raleway", label: "Raleway (Stylish)" },
  { id: "PT Sans", label: "PT Sans (Crisp)" },
  { id: "Merriweather", label: "Merriweather (Classic Serif)" },
  { id: "Nunito", label: "Nunito (Rounded)" },
  { id: "Playfair Display", label: "Playfair (Decorative Serif)" },
  { id: "Lora", label: "Lora (Contemporary Serif)" },
  { id: "Mukta", label: "Mukta (Versatile)" },
  { id: "Rubik", label: "Rubik (Soft & Bold)" },
  { id: "Work Sans", label: "Work Sans (Grotesque)" },
  { id: "Fira Sans", label: "Fira Sans (Tech)" },
  { id: "Quicksand", label: "Quicksand (Round Sans)" },
  { id: "Poppins", label: "Poppins (Geometric Sans)" },
  { id: "Ubuntu", label: "Ubuntu (Humanist)" },
  { id: "Pacifico", label: "Pacifico (Handwriting)" },
  { id: "Dancing Script", label: "Dancing Script (Cursive)" },
  { id: "Inconsolata", label: "Inconsolata (Coding)" },
  { id: "Space Mono", label: "Space Mono (Tech Typewriter)" }
] as const

const LAYOUTS = [
  { id: "compact", label: "Compact" },
  { id: "comfortable", label: "Comfortable" },
  { id: "spacious", label: "Spacious" }
] as const

const DISPLAY_OPTIONS_MAP = [
  { key: "thumbnails", label: "Show article thumbnails", desc: "Display images in news feed" },
] as const

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme()
  const { settings, updateSetting } = useSettings()

  const currentTheme = settings?.appearance?.theme || 'light'
  const currentFontSize = settings?.appearance?.fontSize || 'default'
  const currentFontStyle = settings?.appearance?.fontStyle || 'Inter'
  const currentLayout = settings?.layout || 'comfortable'
  const displayOptions = settings?.displayOptions || {
    thumbnails: true
  }

  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false)
  const [selectedFont, setSelectedFont] = useState(currentFontStyle)
  const [previewFont, setPreviewFont] = useState(currentFontStyle)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSelectedFont(currentFontStyle)
    setPreviewFont(currentFontStyle)
  }, [currentFontStyle])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFontDropdownOpen(false)
        setPreviewFont(selectedFont)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [selectedFont])

  // Inject preview font link dynamically
  useEffect(() => {
    if (previewFont && previewFont !== currentFontStyle) {
      const fontId = `preview-font-${previewFont.replace(/\s+/g, '-')}`
      if (!document.getElementById(fontId)) {
        const link = document.createElement('link')
        link.id = fontId
        link.rel = 'stylesheet'
        link.href = `https://fonts.googleapis.com/css2?family=${previewFont.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`
        document.head.appendChild(link)
      }
    }
  }, [previewFont, currentFontStyle])

  useEffect(() => {
    if (settings?.appearance?.theme && settings.appearance.theme !== theme && settings.appearance.theme !== 'system') {
      setTheme(settings.appearance.theme as Parameters<typeof setTheme>[0])
    }
  }, [settings?.appearance?.theme, theme, setTheme])

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as Parameters<typeof setTheme>[0])
    updateSetting('theme', newTheme)
  }

  const handleFontSizeChange = (size: string) => {
    updateSetting('fontSize', size)
  }

  const applyFontStyle = () => {
    updateSetting('fontStyle', selectedFont)
  }

  const handleLayoutChange = (layoutId: string) => {
    updateSetting('layout', layoutId)
  }

  const handleDisplayOptionToggle = (key: string, currentValue: boolean) => {
    const currentOptions = settings?.displayOptions || {}
    updateSetting('displayOptions', { ...currentOptions, [key]: !currentValue })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Appearance</h2>
        <p className="text-gray-600 dark:text-white/[0.85] text-sm">Customize how Fact Flow looks for you</p>
      </div>

      {/* Theme */}
      <div className="space-y-3 mt-8">
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm flex items-center gap-2 px-2">
          <Monitor className="w-4 h-4 text-red-400" />
          Theme
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {THEMES.map((t) => {
            const Icon = t.icon
            const isActive = currentTheme === t.id
            return (
              <label 
                key={t.id} 
                className={`cursor-pointer flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  isActive 
                    ? 'border-red-500 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' 
                    : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300'
                }`}
              >
                <input 
                  className="sr-only" 
                  type="radio" 
                  name="theme" 
                  value={t.id} 
                  checked={isActive}
                  onChange={() => handleThemeChange(t.id)}
                />
                <Icon className={`w-6 h-6 mb-2 ${isActive ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`} />
                <span className="font-semibold text-sm">{t.label}</span>
              </label>
            )
          })}
        </div>
        <p className="text-gray-500 dark:text-white/35 text-xs mt-3">
          {THEMES.find((t) => t.id === currentTheme)?.desc}
        </p>
      </div>

      {/* Font Size & Style */}
      <div className="space-y-6 mt-10">
        <div className="space-y-3">
          <h3 className="text-gray-900 dark:text-white font-semibold text-sm flex items-center gap-2 px-2">
            <Type className="w-4 h-4 text-red-400" />
            Font Size
          </h3>
          <div className="flex flex-wrap gap-2">
            {FONT_SIZES.map((size) => {
              const isActive = currentFontSize === size.id
              return (
                <label 
                  key={size.id} 
                  className={`cursor-pointer px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                    isActive 
                      ? 'border-red-500 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 shadow-sm' 
                      : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <input 
                    className="sr-only" 
                    type="radio" 
                    name="fontsize" 
                    value={size.id} 
                    checked={isActive}
                    onChange={() => handleFontSizeChange(size.id)}
                  />
                  {size.label}
                </label>
              )
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-white/10 pb-4">
          <p className="text-gray-500 dark:text-white/35 text-xs mb-2">Live Preview:</p>
          <div 
            className={`p-4 bg-white dark:bg-black/20 border border-gray-200 dark:border-transparent rounded-lg font-${currentFontSize.toLowerCase()}`}
            style={{ fontFamily: `'${previewFont}', sans-serif`, transition: 'font-family 0.2s ease' }}
          >
            <span className="text-gray-900 dark:text-white">India beats Australia in World Cup Final — Breaking News</span>
          </div>
        </div>

        <div>
          <h3 className="text-gray-900 dark:text-white font-semibold text-sm mb-4">Font Style</h3>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsFontDropdownOpen(!isFontDropdownOpen)}
              className="w-full flex items-center justify-between bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm rounded-lg px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
            >
              <span>{FONT_STYLES.find(f => f.id === selectedFont)?.label || selectedFont}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isFontDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isFontDropdownOpen && (
              <div className="absolute z-50 mt-2 w-full max-h-60 overflow-y-auto bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-lg shadow-xl custom-scrollbar font-dropdown">
                {FONT_STYLES.map((style) => (
                  <div
                    key={style.id}
                    onClick={() => {
                      setSelectedFont(style.id)
                      setPreviewFont(style.id)
                      setIsFontDropdownOpen(false)
                    }}
                    onMouseEnter={() => setPreviewFont(style.id)}
                    onMouseLeave={() => setPreviewFont(selectedFont)}
                    className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-between transition-colors"
                  >
                    <span className="text-gray-900 dark:text-white text-sm" style={{ fontFamily: `'${style.id}', sans-serif` }}>{style.label}</span>
                    {selectedFont === style.id && <Check className="w-4 h-4 text-red-500 dark:text-red-400" />}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {selectedFont !== currentFontStyle && (
            <button 
              onClick={applyFontStyle}
              className="mt-3 w-full py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg text-sm transition-colors"
            >
              Apply Global Font
            </button>
          )}
        </div>
      </div>

      {/* Layout Density */}
      <div className="space-y-3 mt-10">
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm px-2">News Feed Layout</h3>
        <div className="flex flex-wrap gap-2 mt-3">
          {LAYOUTS.map((layout) => {
            const isActive = currentLayout === layout.id
            return (
              <label 
                key={layout.id} 
                className={`cursor-pointer px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'border-red-500 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 shadow-sm' 
                    : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300'
                }`}
              >
                <input 
                  className="sr-only" 
                  type="radio" 
                  name="layout" 
                  value={layout.id} 
                  checked={isActive}
                  onChange={() => handleLayoutChange(layout.id)}
                />
                {layout.label}
              </label>
            )
          })}
        </div>
      </div>

      {/* Toggle Options */}
      <div className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5 space-y-4">
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm">Display Options</h3>
        {DISPLAY_OPTIONS_MAP.map((item) => {
          const isOn = !!displayOptions[item.key as keyof typeof displayOptions]
          return (
            <div key={item.key} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-gray-800 dark:text-white/80 text-sm font-medium">{item.label}</p>
                <p className="text-gray-500 dark:text-white/[0.85] text-xs">{item.desc}</p>
              </div>
              <button
                onClick={() => handleDisplayOptionToggle(item.key, isOn)}
                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                  isOn ? "bg-red-500" : "bg-gray-300 dark:bg-white/15"
                }`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  isOn ? "translate-x-5" : "translate-x-0.5"
                }`} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
