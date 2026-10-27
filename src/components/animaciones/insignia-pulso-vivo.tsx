"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface PropiedadesInsigniaPulsoVivo {
  etiqueta?: string;
  color?: "turquesa" | "esmeralda" | "dorado" | "coral" | "marino";
  tamaño?: "sm" | "md" | "lg";
  className?: string;
  con_onda?: boolean;
}

const MAPA_COLORES = {
  turquesa: {
    fondo: "bg-[#00ABBD]/10",
    borde: "border-[#00ABBD]/30",
    texto: "text-[#035683] dark:text-[#00ABBD]",
    punto: "bg-[#00ABBD]",
    onda: "bg-[#00ABBD]/40",
  },
  esmeralda: {
    fondo: "bg-emerald-500/10",
    borde: "border-emerald-500/30",
    texto: "text-emerald-700 dark:text-emerald-400",
    punto: "bg-emerald-500",
    onda: "bg-emerald-500/40",
  },
  dorado: {
    fondo: "bg-[#FFB600]/15",
    borde: "border-[#FFB600]/40",
    texto: "text-[#035683] dark:text-[#FFB600]",
    punto: "bg-[#FFB600]",
    onda: "bg-[#FFB600]/50",
  },
  coral: {
    fondo: "bg-[#E2694B]/10",
    borde: "border-[#E2694B]/30",
    texto: "text-[#E2694B]",
    punto: "bg-[#E2694B]",
    onda: "bg-[#E2694B]/40",
  },
  marino: {
    fondo: "bg-[#007BBE]/10",
    borde: "border-[#007BBE]/30",
    texto: "text-[#035683] dark:text-white",
    punto: "bg-[#007BBE]",
    onda: "bg-[#007BBE]/30",
  },
};

/**
 * Watermelon UI — Insignia de Pulso Vivo (Living Pulse Badge)
 * Proyecta una onda de pulso concéntrica continua para comunicar
 * sincronización en tiempo real, geocerca activa o alertas pendientes.
 */
export function InsigniaPulsoVivo({
  etiqueta,
  color = "turquesa",
  tamaño = "md",
  className,
  con_onda = true,
}: PropiedadesInsigniaPulsoVivo) {
  const paleta = MAPA_COLORES[color] || MAPA_COLORES.turquesa;

  const tamaños_estilo = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3.5 py-1.5 text-sm",
  };

  const tamaños_punto = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold font-mono rounded-full border transition-colors",
        paleta.fondo,
        paleta.borde,
        paleta.texto,
        tamaños_estilo[tamaño],
        className
      )}
    >
      <span className="relative flex items-center justify-center shrink-0">
        {con_onda && (
          <motion.span
            className={cn("absolute rounded-full", paleta.onda, tamaños_punto[tamaño])}
            animate={{
              scale: [1, 2.4],
              opacity: [0.8, 0],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        )}
        <span className={cn("relative rounded-full", paleta.punto, tamaños_punto[tamaño])} />
      </span>
      {etiqueta && <span>{etiqueta}</span>}
    </span>
  );
}
