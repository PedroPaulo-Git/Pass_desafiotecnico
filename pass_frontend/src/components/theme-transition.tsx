"use client"

import { useTheme } from "@/lib/theme/theme-context"
import { motion, AnimatePresence } from "framer-motion"

export function ThemeTransition() {
  // Cast to a relaxed shape to satisfy type-check in build environments
  const { isTransitioning, transitionOrigin, theme } = useTheme() as {
    isTransitioning?: boolean
    transitionOrigin?: { x: number; y: number } | null
    theme?: "light" | "dark" | string
  }

  return (
    <AnimatePresence>
      {isTransitioning && transitionOrigin && (
        <motion.div
          className="fixed inset-0 z-50 pointer-events-none"
          initial={{ clipPath: `circle(0% at ${transitionOrigin.x}px ${transitionOrigin.y}px)` }}
          animate={{ clipPath: `circle(150% at ${transitionOrigin.x}px ${transitionOrigin.y}px)` }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          style={{
            backgroundColor: theme === "light" ? "#0a0a0a" : "#ffffff",
          }}
        />
      )}
    </AnimatePresence>
  )
}
