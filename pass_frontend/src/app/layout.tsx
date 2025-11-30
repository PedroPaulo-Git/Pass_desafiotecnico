import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers"
import { ThemeTransition } from "@/components/theme-transition"

const plus = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PASS - Sistema de Gestão de Frota",
  description: "Sistema de gerenciamento de frota de veículos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${plus.className} antialiased`} >
        <Providers>
          <ThemeTransition />
          {children}
        </Providers>
      </body>
    </html>
  );
}
