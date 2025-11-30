"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  isTransitioning: boolean
  transitionOrigin: { x: number; y: number } | null
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionOrigin, setTransitionOrigin] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    }
  }, [])

  const toggleTheme = useCallback(() => {
    const button = document.querySelector("[data-theme-toggle]") as HTMLElement
    const rect = button?.getBoundingClientRect()

    if (rect) {
      setTransitionOrigin({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      })
    }

    setIsTransitioning(true)

    setTimeout(() => {
      const newTheme = theme === "light" ? "dark" : "light"
      setTheme(newTheme)
      document.documentElement.classList.toggle("dark", newTheme === "dark")
      localStorage.setItem("theme", newTheme)

      setTimeout(() => {
        setIsTransitioning(false)
        setTransitionOrigin(null)
      }, 600)
    }, 300)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isTransitioning, transitionOrigin }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
