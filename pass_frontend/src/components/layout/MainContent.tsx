"use client";

import { type ReactNode } from "react";
import { AppHeader } from "./app-header";
import { usePageTitle } from "@/lib/contexts/page-title-context";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();
  const isTicketRoute = Boolean(
    pathname && (pathname === "/ticket" || pathname.startsWith("/ticket"))
  );
  const isSupportRoute = Boolean(
    pathname && (pathname === "/support" || pathname.startsWith("/support"))
  );

  return (
    // Main Content
    <div
      className={
        "flex flex-col w-full h-full duration-200 ease-in-out md:rounded-2xl shadow-sm "
      }
    >
      {/* Desktop Header */}
      <div className="hidden lg:block sticky top-0  bg-sidebar z-50">
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
        <main
          className={` bg-background ${
            isTicketRoute || isSupportRoute ? "flex-1 p-0  " : "flex-1 p-6"
          }`}
        >
          {children}
        </main>
    </div>
  );
}
