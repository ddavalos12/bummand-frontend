"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface BotonJuicyProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: "primario" | "secundario" | "dorado" | "exito";
  tamaño?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

/**
 * Watermelon UI — Botón Táctil de Máxima Satisfacción (Juicy Button)
 * Ofrece compresión elástica al toque (`active:scale-95`), elevación suave y
 * aura luminosa de confirmación.
 */
export function BotonJuicy({
  variante = "primario",
  tamaño = "md",
  children,
  className,
  ...props
}: BotonJuicyProps) {
  const [esta_pulsando, set_esta_pulsando] = useState(false);

  const estilos_variante = {
    primario: "bg-[#063A6B] text-white hover:bg-[#084885] active:bg-[#052e54] shadow-sm hover:shadow-md",
    secundario: "bg-[#17B4C4] text-[#063A6B] font-bold hover:bg-[#15a4b3] shadow-sm hover:shadow-md",
    dorado: "bg-[#F8C766] text-[#063A6B] font-bold hover:bg-[#f6bd48] shadow-sm hover:shadow-md",
    exito: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow-md",
  };

  const estilos_tamaño = {
    sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
    md: "h-10 px-4 text-xs font-semibold rounded-xl gap-2",
    lg: "h-12 px-6 text-sm font-bold rounded-2xl gap-2.5",
  };

  return (
    <button
      onMouseDown={() => set_esta_pulsando(true)}
      onMouseUp={() => set_esta_pulsando(false)}
      onMouseLeave={() => set_esta_pulsando(false)}
      onTouchStart={() => set_esta_pulsando(true)}
      onTouchEnd={() => set_esta_pulsando(false)}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-150 select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17B4C4] focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none",
        esta_pulsando ? "scale-95" : "hover:scale-[1.02]",
        estilos_variante[variante],
        estilos_tamaño[tamaño],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
