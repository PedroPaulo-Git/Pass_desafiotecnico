"use client"

import { useState, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AppSidebar } from "./app-sidebar"
import { AppHeader } from "./app-header"

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const sidebarWidth = isCollapsed ? 64 : 240

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AppSidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 lg:hidden"
          >
            <AppSidebar isCollapsed={false} onToggle={() => setIsMobileOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        className="flex flex-col min-h-screen transition-[margin-left] duration-200 ease-in-out"
        style={{ marginLeft: typeof window !== "undefined" && window.innerWidth >= 1024 ? sidebarWidth : 0 }}
      >
        {/* Desktop Header */}
        <div className="hidden lg:block">
          <AppHeader />
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden">
          <AppHeader showMenuButton onMenuClick={() => setIsMobileOpen(true)} />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
