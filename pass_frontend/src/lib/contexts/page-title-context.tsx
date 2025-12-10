"use client";

import React, { createContext, useContext, useState, type ReactNode } from "react";

interface PageTitleContextType {
  title: string;
  setTitle: (title: string) => void;
}

const PageTitleContext = createContext<PageTitleContextType | undefined>(
  undefined,
);

export function PageTitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState("");

  return (
    <PageTitleContext.Provider value={{ title, setTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
}

export function usePageTitle() {
  const context = useContext(PageTitleContext);
  if (context === undefined) {
    throw new Error("usePageTitle must be used within a PageTitleProvider");
  }
  return context;
}

// Hook para definir o título da página
export function useSetPageTitle(title: string) {
  const { setTitle } = usePageTitle();
  
  // Define o título quando o componente monta
  React.useEffect(() => {
    setTitle(title);
    
    // Opcional: limpar o título quando o componente desmonta
    return () => setTitle("");
  }, [title, setTitle]);
}

// Hook alternativo que define o título automaticamente baseado na rota
export function useAutoPageTitle() {
  const { setTitle } = usePageTitle();
  
  React.useEffect(() => {
    // Função para atualizar o título baseado na URL
    const updateTitle = () => {
      const pathname = window.location.pathname;
      
      // Mapear rotas para títulos
      const titleMap: Record<string, string> = {
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
      };
      
      const title = titleMap[pathname] || "";
      setTitle(title);
    };
    
    // Definir título inicial
    updateTitle();
    
    // Escutar mudanças de rota (para SPAs)
    const handlePopState = () => updateTitle();
    window.addEventListener("popstate", handlePopState);
    
    return () => {
      window.removeEventListener("popstate", handlePopState);
      setTitle("");
    };
  }, [setTitle]);
}