"use client";

import { type ReactNode } from "react";
import { AppHeader } from "./app-header";
import { usePageTitle } from "@/lib/contexts/page-title-context";

interface MainContentProps {
  children: ReactNode;
  sidebarWidth: number;
  onOpenMobileMenu: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

export function MainContent({
  children,
  sidebarWidth,
  onOpenMobileMenu,
  isCollapsed,
  onToggle,
}: MainContentProps) {
  const { title } = usePageTitle();

  return (
    // Main Content
    <div
      className="flex flex-col w-full h-full duration-200 ease-in-out md:rounded-2xl shadow-sm bg-background"
    >
      {/* Desktop Header */}
      <div className="hidden lg:block rounded-tl-4xl">
        <AppHeader 
          isCollapsed={isCollapsed} 
          onToggle={onToggle} 
          currentPageTitle={title}
        />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <AppHeader 
          showMenuButton 
          onMenuClick={onOpenMobileMenu} 
          isCollapsed={isCollapsed} 
          onToggle={onToggle} 
          currentPageTitle={title}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-6 ">{children}</main>
    </div>  
  );
}
