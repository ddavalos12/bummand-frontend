"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";

export interface PropiedadesEstadoVacio {
  icono?: LucideIcon | React.ElementType;
  titulo: string;
  descripcion?: string;
  accion?: {
    texto: string;
    alHacerClic: () => void;
    icono?: LucideIcon | React.ElementType;
    variante?: "default" | "outline" | "secondary";
  };
  className?: string;
  children?: React.ReactNode;
}

export function EstadoVacio({
  icono: Icono,
  titulo,
  descripcion,
  accion,
  className,
  children,
}: PropiedadesEstadoVacio) {
  return (
    <div
      className={cn(
        "p-8 sm:p-12 text-center bg-white rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col items-center justify-center space-y-3.5 my-2 w-full",
        className
      )}
    >
      {Icono && (
        <div className="w-14 h-14 rounded-2xl bg-[#035683]/5 border border-[#00ABBD]/25 flex items-center justify-center text-[#035683] shadow-inner">
          <Icono className="w-7 h-7 text-[#035683]" />
        </div>
      )}

      <div className="space-y-1 max-w-md">
        <h3 className="font-display font-bold text-base sm:text-lg text-[#035683] tracking-tight">
          {titulo}
        </h3>
        {descripcion && (
          <p className="text-xs sm:text-[13px] text-[#5B6D77] font-body leading-relaxed">
            {descripcion}
          </p>
        )}
      </div>

      {accion && (
        <Button
          onClick={accion.alHacerClic}
          variant={accion.variante || "default"}
          className={cn(
            "mt-2 h-9 px-4 rounded-xl text-xs font-semibold gap-1.5 transition-all shadow-xs",
            (!accion.variante || accion.variante === "default") &&
              "bg-[#035683] hover:bg-[#035683]/90 text-white"
          )}
        >
          {accion.icono && <accion.icono className="w-3.5 h-3.5" />}
          <span>{accion.texto}</span>
        </Button>
      )}

      {children}
    </div>
  );
}
