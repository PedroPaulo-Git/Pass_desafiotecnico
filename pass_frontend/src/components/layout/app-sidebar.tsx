"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Building2,
  Check,
  Plus,
  Star,
  BusFront,
  Activity,
  BedDouble, 
  CalendarDays, 
  Camera, 
  DollarSign, 
  FileText, 
  LayoutDashboard, 
  Map, 
  MapPin, 
  Package, 
  Puzzle, 
  Settings, 
  Ticket

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
// React Icons para ícones exatos das imagens
import { BsGrid } from "react-icons/bs";
import { TbActivity } from "react-icons/tb";
import { RiBusLine, RiCompassLine, RiTicketLine, RiSettings4Line, RiHotelLine } from "react-icons/ri";
import { MdOutlineTour } from "react-icons/md";
import { IoGitBranchOutline } from "react-icons/io5";
import { PiFlowArrow, PiMapPinArea } from "react-icons/pi";
import { LuCalendarDays, LuFileText } from "react-icons/lu";
import { FiDollarSign } from "react-icons/fi";

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

// Mock de dados para as empresas
const companies = [
  { name: "Pass", id: 1, active: true },
  { name: "Allinsys", id: 2, active: false },
  { name: "Google", id: 3, active: false },
];

export function AppSidebar({ isCollapsed, onToggle }: AppSidebarProps) {
  const pathname = usePathname();
  const { t } = useI18n();

  const [selectedCompanyId, setSelectedCompanyId] = useState(
    companies.find((c) => c.active)?.id ?? companies[0].id
  );

  // Estrutura de navegação baseada exatamente nas imagens de referência
  const navGroups = [
    {
      title: "Main",
      items: [
        { icon: LayoutDashboard, label: "Panel", href: "/dashboard" },
        { icon: Activity, label: "Activity", href: "#activity" },
      ],
    },
    {
      title: "Services",
      items: [
        { icon: BusFront, label: "Transfer", href: "/vehicles" },
        { icon: Package, label: "Combo", href: "#combo" },
        { icon: BedDouble, label: "Accommodation", href: "#accommodation" },
        { icon: Ticket, label: "Ticket", href: "#ticket" },
        { icon: Camera, label: "Tour", href: "#tour" },
        { icon: Star, label: "Experience", href: "#experience" },
        { icon: Map, label: "Circuit", href: "#circuit" },
      ],
    },
    {
      title: "Commercial",
      items: [
        { icon: DollarSign, label: "Tariff", href: "#tariff" },
        { icon: CalendarDays, label: "Availability", href: "#availability" },
      ],
    },
    {
      title: "Complements",
      items: [
        { icon: Puzzle, label: "Slots", href: "#slots" },
        { icon: MapPin, label: "Perimeters", href: "#perimeters" },
        { icon: LuFileText, label: "Guidelines", href: "#guidelines" },
      ],
    },
    {
      title: "Organization",
      items: [
        { icon: Settings, label: "Settings", href: "#settings" },
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
        <div className="flex h-[65px] items-center px-2 border-b border-sidebar-border shrink-0">
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
        <nav className="flex-1 overflow-y-auto py-5 pr-2 pl-4 space-y-8 scrollbar-hidden">
          {navGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              {/* Título do Grupo */}
              {!isCollapsed && (
                <div className="first:mt-1.5 mb-1.5 px-2 text-[11px] font-bold tracking-wide text-muted-foreground">
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
                            "flex items-center gap-2.5 rounded-md px-3.5 py-2 text-[13px] font-medium transition-colors duration-150",
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-bold "
                              : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                          )}
                        >
                          <item.icon
                            className={cn(
                              "h-4 w-4 shrink-0",
                              isActive ? "text-foreground" : "text-muted-foreground",
                              isCollapsed && "mx-auto"
                            )}
                          />
                          {!isCollapsed && (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="truncate"
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </Link>
                      </TooltipTrigger>
                      {/* {isCollapsed && (
                        <TooltipContent side="right" sideOffset={8} className="bg-foreground text-background text-xs">
                          {item.label}
                        </TooltipContent>
                      )} */}
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
            className="w-full justify-center text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
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