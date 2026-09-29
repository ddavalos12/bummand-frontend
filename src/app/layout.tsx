import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600', '700'],
  variable: "--font-mono",
  subsets: ["latin"],
});

import { Proveedores } from "@/components/Proveedores";

export const metadata: Metadata = {
  title: "BUMAND - Dashboard",
  description: "Portal de BUMAND",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${bricolage.variable} ${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background">
        <Proveedores>
          {children}
        </Proveedores>
      </body>
    </html>
  );
}
