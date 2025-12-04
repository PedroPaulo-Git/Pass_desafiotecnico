"use client";

import { type ReactNode } from "react";
import { AppHeader } from "./app-header";

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
  return (
    // Main Content
    <div
      className="flex flex-col w-full h-full duration-200 ease-in-out md:rounded-2xl shadow-sm bg-card border border-border"
    >
      {/* Desktop Header */}
      <div className="hidden lg:block rounded-tl-4xl">
        <AppHeader isCollapsed={isCollapsed} onToggle={onToggle} />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <AppHeader showMenuButton onMenuClick={onOpenMobileMenu} isCollapsed={isCollapsed} onToggle={onToggle} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-6">{children}</main>
    </div>  
  );
}
