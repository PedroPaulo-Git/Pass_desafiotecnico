import React from "react";
import Link from "next/link";
import {
  useSidebar,
  SidebarTrigger,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarFooter,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Menu } from "lucide-react";

export function AppSidebar() {
  // useSidebar is kept for possible future needs; Sidebar handles mobile internally.
  useSidebar();

  return (
    <>
      {/* Mobile trigger */}
      <div className="md:hidden fixed left-4 top-4 z-30">
        <SidebarTrigger>
          <Menu size={20} />
        </SidebarTrigger>
      </div>

      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <img src="/assets/Logo_pass.svg" alt="Logo PASS" className="w-10" />
            <span className="font-bold text-pass-blue text-lg">PASS</span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Main</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/modules/vehicles" className="block w-full">
                  <SidebarMenuButton asChild>
                    <a>Vehicles</a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/modules/fueling" className="block w-full">
                  <SidebarMenuButton asChild>
                    <a>Fueling</a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Resources</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/modules/incidents" className="block w-full">
                  <SidebarMenuButton asChild>
                    <a>Incidents</a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/modules/documents" className="block w-full">
                  <SidebarMenuButton asChild>
                    <a>Documents</a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/modules/images" className="block w-full">
                  <SidebarMenuButton asChild>
                    <a>Images</a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="text-sm text-pass-gray-500">Logged in as <strong className="text-pass-gray-700">User</strong></div>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
