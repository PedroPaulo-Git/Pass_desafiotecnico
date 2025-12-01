"use client";

import { motion } from "framer-motion";
import {
  Moon,
  Sun,
  Globe,
  Menu,
  PanelLeft,
  Search,
  LayoutGrid,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "@/lib/theme/theme-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Language } from "@/lib/i18n/translations";
import { useEffect } from "react";

interface AppHeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
}

export function AppHeader({
  onMenuClick,
  showMenuButton,
  isCollapsed,
  onToggle,
}: AppHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useI18n();

  const languages: { value: Language; label: string; flag: string }[] = [
    { value: "pt", label: "Português", flag: "🇧🇷" },
    { value: "en", label: "English", flag: "🇺🇸" },
    { value: "es", label: "Español", flag: "🇪🇸" },
  ];
  useEffect(() => {
    console.log("isCollapsed", isCollapsed);
    console.log("onToggle", onToggle);
  }, [isCollapsed, onToggle]);

  // Encontra o label da linguagem atual para exibir no botão
  const currentLanguageLabel =
    languages.find((l) => l.value === language)?.label || "English";

  return (
    <header className="sticky top-0 flex h-16 w-full items-center justify-between border-b border-border bg-background px-4 rounded-t-2xl">
      {/* --- LEFT SECTION: Sidebar Toggle & Breadcrumb --- */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Desktop Sidebar Toggle (Visual match for image) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="hidden text-muted-foreground lg:flex"
        >
          <PanelLeft className="h-5 w-5" />
        </Button>

        {/* Separator */}
        <Separator orientation="vertical" className="hidden h-6 lg:block" />

        {/* Page Title / Breadcrumb */}
        <span className="text-sm font-medium">Availability</span>
      </div>

      {/* --- CENTER SECTION: Search Bar --- */}
      <div className="hidden flex-1 items-center justify-center px-4 md:flex">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="h-9 w-full rounded-md bg-muted/50 pl-9 pr-14 text-sm shadow-none focus-visible:ring-1"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-2.5 inline-flex h-4 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">CTRL+K</span>
          </kbd>
        </div>
      </div>

      {/* --- RIGHT SECTION: Actions & Profile --- */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-muted-foreground"
        >
          <motion.div
            initial={false}
            animate={{ rotate: theme === "dark" ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {theme === "dark" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </motion.div>
          <span className="sr-only">{t.theme[theme]}</span>
        </Button>

        {/* Language Selector (With Text) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="gap-2 px-2 text-muted-foreground"
            >
              <Globe className="h-5 w-5" />
              <span className="hidden text-sm font-medium sm:inline-block">
                {currentLanguageLabel}
              </span>
              <ChevronDown className="h-3 w-3 opacity-50" />
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

        {/* App Grid Icon */}
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <LayoutGrid className="h-5 w-5" />
        </Button>

        {/* User Avatar */}
        <Avatar className="h-8 w-8 cursor-pointer bg-black text-white dark:bg-white dark:text-black">
          <AvatarImage src="" alt="JD" />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
            PP
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
