import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Proveedores } from "@/components/proveedores";

const FUENTE_BRICOLAGE = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
});

const FUENTE_INTER = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const FUENTE_PLEX_MONO = IBM_Plex_Mono({
  weight: ['400', '500', '600', '700'],
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BUMAND - Panel de Control",
  description: "Portal Central BUMAND",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${FUENTE_BRICOLAGE.variable} ${FUENTE_INTER.variable} ${FUENTE_PLEX_MONO.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background">
        <Proveedores>
          {children}
        </Proveedores>
      </body>
    </html>
  );
}
