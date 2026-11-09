import type { Metadata } from "next";
import "./globals.css";
import { Proveedores } from "@/components/proveedores";

export const metadata: Metadata = {
  title: "BUMAND - Panel de Control Institucional",
  description: "Portal Central Diaconía FRIF-IFD · BUMAND",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className="h-full antialiased font-sans"
      style={{
        // @ts-ignore
        "--font-montserrat": "Montserrat, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        // @ts-ignore
        "--font-poppins": "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        // @ts-ignore
        "--font-mono": "'IBM Plex Mono', Menlo, Monaco, Consolas, monospace",
      }}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#F8FAFC] text-[#1A1A1A]">
        <Proveedores>
          {children}
        </Proveedores>
      </body>
    </html>
  );
}

