"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bus,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Building2,
  Check,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/i18n-context";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

// Mock de dados para as empresas (substitua pela sua lógica real depois)
const companies = [
  { name: "Pass", id: 1, active: true },
  { name: "Allinsys", id: 2, active: false },
  { name: "Google", id: 3, active: false },
];

export function AppSidebar({ isCollapsed, onToggle }: AppSidebarProps) {
  const pathname = usePathname();
  const { t } = useI18n();

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: t.nav.dashboard,
      href: "/dashboard",
    },
    {
      icon: Bus,
      label: t.nav.vehicles,
      href: "/vehicles",
    },
  ];

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 64 : 240 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="left-0 top-0 z-40 h-screen bg-sidebar flex flex-col "
      >
        {/* Header com Logo e Dropdown */}
        <div className="flex h-[72px] items-center px-2 border-b border-sidebar-border">
          {/* A Logo permanece fixa e clicável para home */}
          <Link href="/dashboard" className="-mr-6 mt-1">
            <img
              src="/assets/Logo.png"
              className={cn(
                "hover:scale-105 duration-500 object-cover ",
                isCollapsed ? "w-14" : "w-16 "
              )}
              alt="Logo"
            />
          </Link>

          {/* O Texto e o Chevron viram o DropdownTrigger */}
          {!isCollapsed && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="ml-1 flex flex-1 items-center justify-between px-2 py-6 hover:bg-sidebar-accent/50 group"
                >
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-start"
                  >
                    <span className="text-sm font-semibold text-sidebar-foreground">
                      Pass Enterprise
                    </span>
                    {/* Opcional: subtítulo ou cargo */}
                  </motion.span>
                  <ChevronsUpDown className="w-4 h-4 text-muted-foreground group-hover:text-sidebar-foreground" />
                </Button>
              </DropdownMenuTrigger>

              {/* Conteúdo do Dropdown posicionado à direita */}
              <DropdownMenuContent
                side="right"
                align="start"
                className="w-56 ml-2"
                sideOffset={10}
              >
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2 py-1.5">
                  Empresas
                </DropdownMenuLabel>

                {companies.map((company) => (
                  <DropdownMenuItem
                    key={company.id}
                    className="flex items-center justify-between cursor-pointer px-2 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-sm border border-border bg-background">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <span className="font-medium">{company.name}</span>
                    </div>
                    {company.active && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />

                <DropdownMenuItem className="cursor-pointer gap-2 px-2 py-2 text-muted-foreground hover:text-foreground">
                  <Plus className="h-4 w-4" />
                  <span>Adicionar Organização</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto mt-2">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0",
                        isActive && "text-sidebar-primary"
                      )}
                    />
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </Link>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" sideOffset={10}>
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>

        {/* Collapse Button */}
        <div className="border-t border-sidebar-border p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-full justify-center text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
