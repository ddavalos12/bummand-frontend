import React from "react";
import Link from "next/link";
import { AcercaDeNosotros } from "@/components/institucional/acerca-de-nosotros";
import { ArrowLeft, Home, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Acerca de Nosotros · Diaconía BUMAND",
  description:
    "Información institucional, principios diaconales, historia y evolución del programa BUMAND de la Fundación Diaconía FRIF-IFD hasta el 24 de octubre de 2026.",
};

export default function PaginaAcercaDeNosotros() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Barra superior de navegación institucional */}
      <header className="sticky top-0 z-40 w-full border-b border-[#E5E7EB] bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 group transition-transform active:scale-95"
            >
              <img
                src="/logos/ALTA1.svg"
                alt="Diaconía IFD"
                className="h-8 w-auto object-contain"
              />
              <div className="h-6 w-px bg-slate-200 hidden sm:block" />
              <img
                src="/logos/LOGO-BUMAND_2023.svg"
                alt="BUMAND"
                className="h-7 w-auto object-contain hidden sm:block"
              />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-[#E5E7EB] text-[#035683] font-bold text-xs hover:bg-slate-50 gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver al Panel</span>
              </Button>
            </Link>
            <Link href="/inicio-sesion">
              <Button
                size="sm"
                className="rounded-xl bg-[#007BBE] hover:bg-[#035683] text-white font-bold text-xs gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-[#FFB600]" />
                <span className="hidden sm:inline">Iniciar Sesión</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AcercaDeNosotros rol_usuario="becario" />
      </main>

      {/* Pie de página institucional */}
      <footer className="w-full bg-white border-t border-[#E5E7EB] py-6 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <img
              src="/logos/ALTA1.svg"
              alt="Diaconía IFD"
              className="h-4 w-auto object-contain opacity-75"
            />
            <span className="font-semibold text-[#035683]">
              BUMAND · Fundación Diaconía FRIF-IFD
            </span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline italic text-[11px] text-[#5B6D77]">
              «Junto a aguas de reposo me pastoreará» (Salmo 23:2)
            </span>
          </div>

          <div className="flex items-center gap-4 font-poppins text-[11px]">
            <span>Regulado por ASFI</span>
            <span>Gestión II-2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
