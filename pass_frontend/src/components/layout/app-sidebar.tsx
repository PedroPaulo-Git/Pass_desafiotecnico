"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BusFront,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Building2,
  Check,
  Plus,
  // Novos ícones adicionados para o estilo
  PieChart,
  CalendarDays,
  Users,
  Settings,
  FileText,
  Activity,
  LifeBuoy
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

// Mock de dados para as empresas
const companies = [
  { name: "Pass Company", id: 1, active: true },
  { name: "Allinsys", id: 2, active: false },
  { name: "Google", id: 3, active: false },
];

export function AppSidebar({ isCollapsed, onToggle }: AppSidebarProps) {
  const pathname = usePathname();
  const { t } = useI18n();

  const [selectedCompanyId, setSelectedCompanyId] = useState(
    companies.find((c) => c.active)?.id ?? companies[0].id
  );

  // Estrutura de navegação dividida em grupos
  const navGroups = [
    {
      title: "Main",
      items: [
        {
          icon: LayoutDashboard,
          label: t.nav.dashboard || "Dashboard", // Fallback caso a tradução falhe
          href: "/dashboard",
        },
        {
          icon: BusFront,
          label: t.nav.vehicles || "Vehicles",
          href: "/vehicles",
        },
      ],
    },
    {
      title: "Panel",
      items: [
        { icon: Activity, label: "Activity", href: "#activity" },
        { icon: PieChart, label: "Analytics", href: "#analytics" },
        { icon: CalendarDays, label: "Schedule", href: "#schedule" },
        { icon: FileText, label: "Reports", href: "#reports" },
      ],
    },
    {
      title: "System",
      items: [
        { icon: Users, label: "Team", href: "#team" },
        { icon: Settings, label: "Settings", href: "#settings" },
        { icon: LifeBuoy, label: "Help", href: "#help" },
      ],
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
        {/* --- HEADER (LOGO & DROPDOWN) --- */}
        <div className="flex h-[72px] items-center px-2 border-b border-sidebar-border shrink-0">
          <Link href="/dashboard" className="-mr-6 mt-1">
            <img
              src="/assets/Logo.png"
              className={cn(
                "hover:scale-105 duration-500 object-cover",
                isCollapsed ? "w-14" : "w-16"
              )}
              alt="Logo"
            />
          </Link>

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
                    <span className="text-sm font-semibold text-sidebar-foreground truncate max-w-[120px]">
                      {companies.find((c) => c.id === selectedCompanyId)?.name ?? "Company"}
                    </span>
                  </motion.span>
                  <ChevronsUpDown className="w-4 h-4 text-muted-foreground group-hover:text-sidebar-foreground" />
                </Button>
              </DropdownMenuTrigger>

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
                    onClick={() => setSelectedCompanyId(company.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-sm border border-border bg-background">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <span className="font-medium">{company.name}</span>
                    </div>
                    {company.id === selectedCompanyId && (
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

        {/* --- NAVIGATION --- */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
          {navGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              {/* Título do Grupo (Main, Panel, etc) */}
              {!isCollapsed && (
                <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {group.title}
                </div>
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200",
                            // Estilização condicional baseada na seleção
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                          )}
                        >
                          <item.icon
                            className={cn(
                              "h-4 w-4 shrink-0", // Ícones levemente menores para elegância
                              isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
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
                        <TooltipContent side="right" sideOffset={1} className="bg-foreground text-background">
                          {item.label}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* --- FOOTER (COLLAPSE BUTTON) --- */}
        <div className="border-t border-sidebar-border p-2 mt-auto">
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