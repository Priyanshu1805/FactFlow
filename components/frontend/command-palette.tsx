"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Sparkles, Sun, Moon, LayoutDashboard, Newspaper, MonitorPlay, Settings, ShieldCheck, CornerDownLeft, ArrowRight, Bot } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTheme } from "@/components/theme-provider"
import { useAuthStore } from "@/store/auth-store"

// Removed mock function as we use real AI backend now

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { user } = useAuthStore()
  const isDark = theme !== "light"

  // Open/Close Hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsOpen((open) => !open)
      }
      if (e.key === "Escape") {
        setIsOpen(false)
        setQuery("")
      }
    }

    const handleCustomEvent = () => {
      setIsOpen(true)
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("open-command-palette", handleCustomEvent)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("open-command-palette", handleCustomEvent)
    }
  }, [])

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery("")
    }
  }, [isOpen])

  // Define commands
  const commands = [
    { id: "nav-dash", title: "Go to Dashboard", icon: LayoutDashboard, color: "text-blue-400", bg: "bg-blue-500/10", action: () => routeTo("/") },
    { id: "nav-news", title: "Read Newspaper", icon: Newspaper, color: "text-green-400", bg: "bg-green-500/10", action: () => routeTo("/newspaper") },
    { id: "nav-reels", title: "Watch Reels", icon: MonitorPlay, color: "text-red-400", bg: "bg-red-500/10", action: () => routeTo("/reels") },
    ...(user?.role === "admin" ? [{ id: "nav-admin", title: "Admin Panel", icon: ShieldCheck, color: "text-orange-400", bg: "bg-orange-500/10", action: () => routeTo("/admin") }] : []),
    { id: "nav-settings", title: "Settings", icon: Settings, color: "text-gray-400", bg: "bg-gray-500/10", action: () => routeTo("/settings") },
    { id: "theme-dark", title: "Switch to Dark Theme", icon: Moon, color: "text-indigo-400", bg: "bg-indigo-500/10", action: () => { setTheme("dark"); setIsOpen(false) } },
    { id: "theme-light", title: "Switch to Light Theme", icon: Sun, color: "text-yellow-400", bg: "bg-yellow-500/10", action: () => { setTheme("light"); setIsOpen(false) } },
    ...(query.trim().length > 0 ? [{
      id: "search",
      title: `Search News for "${query}"`,
      icon: Search,
      color: "text-white",
      bg: "bg-white/10",
      action: () => routeTo(`/search?q=${encodeURIComponent(query)}`)
    }] : []),
  ]

  // Filter commands
  const filteredCommands = commands.filter(cmd => {
    if (cmd.id === "search") return true
    if (!query) return true
    return cmd.title.toLowerCase().includes(query.toLowerCase())
  })

  // Keyboard navigation within the list
  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setActiveIndex(prev => (prev + 1) % filteredCommands.length)
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setActiveIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length)
      }
      if (e.key === "Enter") {
        e.preventDefault()
        if (filteredCommands[activeIndex]) {
          filteredCommands[activeIndex].action()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, activeIndex, filteredCommands])

  const routeTo = (path: string) => {
    router.push(path)
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
          className={`relative w-full max-w-2xl overflow-hidden rounded-2xl border shadow-2xl ${
            isDark ? "bg-[#0A0A0A] border-white/10 shadow-black" : "bg-white border-gray-200 shadow-gray-200/50"
          }`}
        >
          {/* Search Input Area */}
          <div className={`flex items-center px-4 py-4 border-b ${isDark ? "border-white/5" : "border-gray-100"}`}>
            <Search className={`w-6 h-6 shrink-0 ${isDark ? "text-white/[0.85]" : "text-gray-400"}`} />
            <input
              ref={inputRef}
              type="text"
              placeholder={"Search commands or website features..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`flex-1 mx-4 bg-transparent outline-none text-lg font-medium placeholder:font-normal ${
                isDark ? "text-white placeholder:text-white/30" : "text-gray-900 placeholder:text-gray-400"
              }`}
            />
            <div className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${isDark ? "bg-white/5 text-white/[0.85]" : "bg-gray-100 text-gray-400"}`}>
              <span>ESC</span>
            </div>
          </div>

          {/* Commands List View */}
            <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-hide">
              {filteredCommands.length === 0 ? (
                <div className={`py-14 text-center text-sm font-medium ${isDark ? "text-white/[0.85]" : "text-gray-500"}`}>
                  No results found for "{query}"
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {filteredCommands.map((cmd, index) => {
                    const isActive = index === activeIndex
                    return (
                      <button
                        key={cmd.id}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => cmd.action()}
                        className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all ${
                          isActive 
                            ? (isDark ? "bg-white/10" : "bg-gray-100") 
                            : "hover:bg-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cmd.bg}`}>
                            <cmd.icon className={`w-4 h-4 ${cmd.color}`} />
                          </div>
                          <span className={`text-sm font-semibold ${isDark ? "text-white/90" : "text-gray-900"}`}>
                            {cmd.title}
                          </span>
                        </div>
                        {isActive && (
                          <div className={`flex items-center gap-1 text-[10px] font-bold ${isDark ? "text-white/[0.85]" : "text-gray-400"}`}>
                            <span>ENTER</span>
                            <CornerDownLeft className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          
          {/* Footer Footer */}
          <div className={`flex items-center justify-between px-4 py-3 border-t text-[10px] font-bold tracking-wider uppercase ${isDark ? "border-white/5 text-white/30" : "border-gray-100 text-gray-400"}`}>
            <div className="flex gap-4">
              <span className="flex items-center gap-1">
                <kbd className={`px-1.5 py-0.5 rounded ${isDark ? "bg-white/10" : "bg-gray-200"}`}>↑</kbd>
                <kbd className={`px-1.5 py-0.5 rounded ${isDark ? "bg-white/10" : "bg-gray-200"}`}>↓</kbd>
                <span>Navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className={`px-1.5 py-0.5 rounded ${isDark ? "bg-white/10" : "bg-gray-200"}`}>↵</kbd>
                <span>Select</span>
              </span>
            </div>
            <div>Fact Flow Intelligence</div>
          </div>
        </motion.div>
      </div>

    </AnimatePresence>
  )
}
