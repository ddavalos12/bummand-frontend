import type { Metadata } from "next";
import { Montserrat, Poppins, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Proveedores } from "@/components/proveedores";

const FUENTE_MONTSERRAT = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const FUENTE_POPPINS = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const FUENTE_PLEX_MONO = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BUMAND - Panel de Control Institucional",
  description: "Portal Central Diaconía FRIF-IFD · BUMAND",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${FUENTE_MONTSERRAT.variable} ${FUENTE_POPPINS.variable} ${FUENTE_PLEX_MONO.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#F8FAFC] text-[#1A1A1A]">
        <Proveedores>
          {children}
        </Proveedores>
      </body>
    </html>
  );
}
