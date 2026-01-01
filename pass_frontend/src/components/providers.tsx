"use client";

import type { ReactNode } from "react";
import { QueryProvider } from "@/lib/query-client";
import { I18nProvider } from "@/lib/i18n/i18n-context";
import { ThemeProvider } from "@/lib/theme/theme-context";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth/auth-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
