/**
 * Utilitário para gerar títulos de página baseados na navegação do sidebar
 * Mapeia as rotas para seus títulos correspondentes
 */

export const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/vehicles": "Veículos",
  "/fleet": "Frota",
  "/fuelings": "Abastecimentos", 
  "/incidents": "Incidentes",
  "/documents": "Documentos",
  "/maintenance": "Manutenção",
  "/reports": "Relatórios",
  "/analytics": "Análises",
  "/settings": "Configurações",
} as const;

/**
 * Obtém o título da página baseado na rota atual
 */
export function getPageTitleFromPath(pathname: string): string {
  return PAGE_TITLES[pathname as keyof typeof PAGE_TITLES] || "";
}

/**
 * Obtém todas as rotas disponíveis
 */
export function getAllRoutes(): string[] {
  return Object.keys(PAGE_TITLES);
}