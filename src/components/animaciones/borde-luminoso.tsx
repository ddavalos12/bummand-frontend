"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BordeLuminosoProps {
  className?: string;
  tamaño?: number;
  duracion?: number;
  ancho_borde?: number;
  color_desde?: string;
  color_hacia?: string;
}

/**
 * Cult UI — Borde Luminoso en Movimiento (Border Beam)
 * Dibuja un haz de luz resplandeciente que recorre el perímetro de la tarjeta
 * para resaltar estados clave como metas alcanzadas o periodos de liquidación activos.
 */
export function BordeLuminoso({
  className,
  tamaño = 120,
  duracion = 8,
  ancho_borde = 1.5,
  color_desde = "#17B4C4",
  color_hacia = "#F8C766",
}: BordeLuminosoProps) {
  return (
    <div
      style={
        {
          "--tamaño": tamaño,
          "--duracion": duracion,
          "--ancho-borde": ancho_borde,
          "--color-desde": color_desde,
          "--color-hacia": color_hacia,
        } as React.CSSProperties
      }
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] [border:calc(var(--ancho-borde)*1px)_solid_transparent]",
        "![mask-clip:padding-box,border-box] ![mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)]",
        "after:absolute after:aspect-square after:w-[calc(var(--tamaño)*1px)] after:animate-[girarBorde_calc(var(--duracion)*1s)_linear_infinite]",
        "after:[background:linear-gradient(to_left,var(--color-desde),var(--color-hacia),transparent)] after:[offset-anchor:calc(var(--tamaño)*0.5px)_50%]",
        "after:[offset-path:rect(0_auto_auto_0_round_calc(var(--tamaño)*1px))]",
        className
      )}
      aria-hidden="true"
    />
  );
}
