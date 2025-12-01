"use client"

import { motion } from "framer-motion"
import { Moon, Sun, Globe, Menu } from "lucide-react"
import { useTheme } from "@/lib/theme/theme-context"
import { useI18n } from "@/lib/i18n/i18n-context"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Language } from "@/lib/i18n/translations"

interface AppHeaderProps {
  onMenuClick?: () => void
  showMenuButton?: boolean
}

export function AppHeader({ onMenuClick, showMenuButton }: AppHeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage, t } = useI18n()

  const languages: { value: Language; label: string; flag: string }[] = [
    { value: "pt", label: "Português", flag: "🇧🇷" },
    { value: "en", label: "English", flag: "🇺🇸" },
    { value: "es", label: "Español", flag: "🇪🇸" },
  ]

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4">
      <div className="flex items-center gap-4">
        {showMenuButton && (
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Globe className="h-5 w-5" />
              <span className="sr-only">Selecionar idioma</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.value}
                onClick={() => setLanguage(lang.value)}
                className={language === lang.value ? "bg-accent" : ""}
              >
                <span className="mr-2">{lang.flag}</span>
                {lang.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          data-theme-toggle
          className="relative overflow-hidden"
        >
          <motion.div initial={false} animate={{ rotate: theme === "dark" ? 180 : 0 }} transition={{ duration: 0.3 }}>
            {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </motion.div>
          <span className="sr-only">{t.theme[theme]}</span>
        </Button>
      </div>
    </header>
  )
}
