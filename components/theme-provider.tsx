"use client"

import { createContext, useContext, useState, useEffect } from "react"

type Theme = "dark" | "light" | "glass"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark")

  useEffect(() => {
    const saved = localStorage.getItem("factflow-theme") as Theme
    if (saved) setTheme(saved)
  }, [])

  const handleSetTheme = (t: Theme) => {
    setTheme(t)
    localStorage.setItem("factflow-theme", t)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
      <div className={theme === "glass" ? "dark glass" : theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
