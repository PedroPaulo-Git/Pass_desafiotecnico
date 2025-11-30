"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const showSidebar = pathname.startsWith("/modules");

  return (
    <div className="min-h-screen">
      {showSidebar && (
        <SidebarProvider>
          <div className="flex">
            <AppSidebar />
            <main className="flex-1 ml-64">{children}</main>
          </div>
        </SidebarProvider>
      )}
      {!showSidebar && <main>{children}</main>}
    </div>
  );
}
