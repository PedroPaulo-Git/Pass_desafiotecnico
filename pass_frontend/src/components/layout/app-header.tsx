"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Moon,
  Sun,
  Globe,
  PanelLeft,
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  Activity,
  BusFront,
  Package,
  BedDouble,
  Ticket,
  Camera,
  DollarSign,
  Map,
  MapPin,
  Puzzle,
  CalendarDays,
} from "lucide-react";
import { useTheme } from "@/lib/theme/theme-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Language } from "@/lib/i18n/translations";
// React Icons para o grid de apps
import { BsGrid3X3Gap, BsPeople } from "react-icons/bs";
import { RiBusLine, RiStore2Line } from "react-icons/ri";
import { TbChartBar } from "react-icons/tb";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { PiFlowArrow } from "react-icons/pi";
import { HiOutlineSignal } from "react-icons/hi2";
import { LuLink2 } from "react-icons/lu";
import { SearchModal } from "../ui/search-modal";

interface AppHeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
  currentPageTitle?: string;
}

export function AppHeader({
  onMenuClick,
  onToggle,
  currentPageTitle,
}: AppHeaderProps) {
  const [openSearchDialog, setOpenSearchDialog] = useState(false);
  const { theme, toggleTheme, pendingTheme } = useTheme();
  const { language, setLanguage, t } = useI18n();

  // Usa o tema pendente (se existir) para o ícone mudar imediatamente
  const displayTheme = pendingTheme || theme;

  const languages: { value: Language; label: string; flag: string }[] = [
    { value: "pt", label: "Português", flag: "🇧🇷" },
    { value: "en", label: "English", flag: "🇺🇸" },
    { value: "es", label: "Español", flag: "🇪🇸" },
  ];

  // Encontra o label da linguagem atual para exibir no botão
  const currentLanguageLabel =
    languages.find((l) => l.value === language)?.label || "English";

  const [chatRole, setChatRole] = useState<string>(() => {
    try {
      return typeof window !== "undefined" ? localStorage.getItem("chat_role") || "agent" : "agent";
    } catch {
      return "agent";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("chat_role", chatRole);
      if (!localStorage.getItem("chat_uuid")) {
        try {
          localStorage.setItem("chat_uuid", crypto.randomUUID());
        } catch {
          // noop in environments without crypto
        }
      }
    } catch (e) {
      // ignore
    }
  }, [chatRole]);

  return (
    <header className="sticky top-0 flex h-14 w-full items-center justify-between border-b border-border px-4 rounded-t-2xl bg-background">
      {/* --- LEFT SECTION: Sidebar Toggle & Breadcrumb --- */}
      <div className="flex items-center gap-1 sm:gap-4">
        {/* Mobile Menu */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <PanelLeft className="h-5 w-5 text-foreground" />
        </Button>

        {/* Desktop Sidebar Toggle (Visual match for image) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="hidden text-muted-foreground lg:flex"
        >
          <PanelLeft className="h-5 w-5 text-foreground" />
        </Button>

        {/* Separator */}
        <div className="flex h-4 w-2 items-center">
          <Separator orientation="vertical" className="bg-muted w-2 h-5 z-40" />
        </div>

        {/* Page Title / Breadcrumb */}
        {currentPageTitle && (
          <span className="text-sm font-medium text-foreground">
            {currentPageTitle}
          </span>
        )}
      </div>

      {/* --- CENTER SECTION: Search Bar --- */}
      <div className="hidden flex-1 items-center justify-center px-4 lg:flex">
        <div className="relative w-full max-w-md">
          <Search
            onClick={() => setOpenSearchDialog(true)}
            className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
          />
          <Input
            variant="modal"
            placeholder={t.common.search + "..."}
            onClick={() => setOpenSearchDialog(true)}
            className="h-9 w-1/2 rounded-md pl-9 pr-14 text-sm shadow-none focus-visible:ring-1"
          />
          <SearchModal
            openSearchDialog={openSearchDialog}
            setOpenSearchDialog={setOpenSearchDialog}
          />

          <kbd
            className="pointer-events-none absolute border 
          right-58 top-2.5 inline-flex h-4 select-none items-center gap-1 rounded bg-card px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"
          >
            <span className="text-xs">CTRL+K</span>
          </kbd>
        </div>
      </div>

      {/* --- RIGHT SECTION: Actions & Profile --- */}
      <div className="flex items-center gap-1">
        <Search
          onClick={() => setOpenSearchDialog(true)}
          className=" flex lg:hidden h-4 w-4 text-muted-foreground "
        />

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-muted-foreground"
        >
          <motion.div
            initial={false}
            // animate={{ rotate: displayTheme === "dark" ? 0 : 180 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {displayTheme === "dark" ? (
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
              className="gap-1.5 px-2 text-muted-foreground"
            >
              <Globe className="h-4 w-4" />
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

        {/* App Grid Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
            >
              <BsGrid3X3Gap className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-3">
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  icon: BsPeople,
                  label: "Workspace",
                  color: "text-muted-foreground",
                },
                {
                  icon: RiBusLine,
                  label: "Transfer",
                  color: "text-muted-foreground",
                },
                {
                  icon: RiStore2Line,
                  label: "Marketplace",
                  color: "text-muted-foreground",
                },
                {
                  icon: PiFlowArrow,
                  label: "Flow",
                  color: "text-muted-foreground",
                },
                {
                  icon: TbChartBar,
                  label: "Balance",
                  color: "text-muted-foreground",
                },
                {
                  icon: HiOutlineOfficeBuilding,
                  label: "Office",
                  color: "text-muted-foreground",
                },
                {
                  icon: HiOutlineSignal,
                  label: "Channel",
                  color: "text-muted-foreground",
                },
                {
                  icon: LuLink2,
                  label: "Connect",
                  color: "text-muted-foreground",
                },
              ].map((app, idx) => (
                <button
                  key={idx}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <app.icon className={`h-5 w-5 ${app.color}`} />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {app.label}
                  </span>
                </button>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* role toggle moved to profile dropdown */}

        {/* User Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage src="" alt="JD" />
              <AvatarFallback className="bg-foreground text-primary-foreground text-xs font-bold">
                JD
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center gap-3 p-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-foreground text-primary-foreground font-bold">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Jonathan Doe</span>
                <span className="text-xs text-muted-foreground">
                  jondoe@example.com
                </span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <User className="h-4 w-4" />
              <span>Conta</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => {
                const newRole = chatRole === "agent" ? "client" : "agent";
                setChatRole(newRole);
                try {
                  window.dispatchEvent(new CustomEvent("chat_role_change", { detail: { role: newRole } }));
                } catch (e) {
                  // ignore in non-browser environments
                }
              }}
            >
              <Ticket className="h-4 w-4" />
              <span>Entrar como {chatRole === "agent" ? "Cliente" : "Agente"}</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Settings className="h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
