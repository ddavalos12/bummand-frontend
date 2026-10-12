"use client";

import React from "react";
import { motion, HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

interface PropiedadesBotonJuicy extends Omit<HTMLMotionProps<"button">, "children"> {
  variante?: "primario" | "secundario" | "dorado" | "exito" | "fantasma";
  tamaño?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const ESTILOS_VARIANTE = {
  primario: "bg-[#063A6B] text-white hover:bg-[#084885] shadow-xs hover:shadow-md",
  secundario: "bg-[#17B4C4] text-[#063A6B] font-bold hover:bg-[#15a4b3] shadow-xs hover:shadow-md",
  dorado: "bg-[#F8C766] text-[#063A6B] font-bold hover:bg-[#f6bd48] shadow-xs hover:shadow-md",
  exito: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs hover:shadow-md",
  fantasma: "bg-transparent text-[#063A6B] hover:bg-[#063A6B]/5 border border-transparent",
};

const ESTILOS_TAMAÑO = {
  sm: "h-8 px-3 text-xs rounded-xl gap-1.5",
  md: "h-10 px-4 text-xs font-semibold rounded-xl gap-2",
  lg: "h-12 px-6 text-sm font-bold rounded-2xl gap-2.5",
};

/**
 * Watermelon UI — Botón Táctil de Máxima Satisfacción (Juicy Button)
 * Ofrece compresión elástica reactiva al clic (`whileTap={{ scale: 0.92 }}`),
 * elevación amortiguada con física de resorte (`stiffness: 420, damping: 22`).
 */
export function BotonJuicy({
  variante = "primario",
  tamaño = "md",
  children,
  className,
  disabled,
  ...props
}: PropiedadesBotonJuicy) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.92 }}
      transition={{
        type: "spring",
        stiffness: 420,
        damping: 22,
      }}
      disabled={disabled}
      className={cn(
        "relative inline-flex items-center justify-center font-medium select-none cursor-pointer transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17B4C4] focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        ESTILOS_VARIANTE[variante],
        ESTILOS_TAMAÑO[tamaño],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
