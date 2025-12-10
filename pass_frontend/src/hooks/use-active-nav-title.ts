"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useSetPageTitle } from "@/lib/contexts/page-title-context";
import { useI18n } from "@/lib/i18n/i18n-context";

/**
 * Hook que define automaticamente o título da página baseado na navegação ativa do sidebar
 * Este hook detecta a rota atual e define o título correspondente
 */
export function useActiveNavTitle() {
  const pathname = usePathname();
  const { t } = useI18n();
  
  // Mapear rotas para as chaves de tradução
  const routeTitleMap: Record<string, string> = {
    "/dashboard": t.nav.dashboard || "Dashboard",
    "/vehicles": t.nav.vehicles || "Veículos",
    "/activity": t.nav.activity || "Atividade", 
    "/transfer": t.nav.vehicles || "Transfer",
    "/combo": "Combo",
    "/accommodation": "Accommodation", 
    "/ticket": "Ticket",
    "/tour": "Tour",
    "/experience": "Experience",
    "/circuit": "Circuit",
    "/tariff": "Tariff",
    "/availability": "Availability",
    "/slots": "Slots", 
    "/perimeters": "Perimeters",
    "/guidelines": "Guidelines",
    "/settings": t.nav.settings || "Configurações",
  };

  // Obter título baseado na rota atual
  const currentTitle = routeTitleMap[pathname] || "";
  
  // Definir o título da página
  useSetPageTitle(currentTitle);
  
  return {
    currentTitle,
    pathname,
    isActive: (href: string) => pathname === href || pathname.startsWith(`${href}/`),
  };
}