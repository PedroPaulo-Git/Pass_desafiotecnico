"use client";

import type { ReactNode } from "react";
import { QueryProvider } from "@/lib/query-client";
import { I18nProvider } from "@/lib/i18n/i18n-context";
import { ThemeProvider } from "@/lib/theme/theme-context";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth/auth-context";
import { SocketManager } from "@/components/notifications/SocketManager";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            <SocketManager />
            {children}
            <Toaster position="bottom-right" expand={true} richColors />
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
