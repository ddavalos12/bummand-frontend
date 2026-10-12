"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface BordeLuminosoProps {
  className?: string;
  tamaño?: number;
  duracion?: number;
  ancho_borde?: number;
  color_desde?: string;
  color_hacia?: string;
  radio_borde?: number;
}

/**
 * Cult UI — Borde Luminoso Canónico (Border Beam)
 * Dibuja un haz de luz perimetral continuo con motion/react
 * para resaltar elementos prioritarios, geocercas activas y estados en progreso.
 */
export function BordeLuminoso({
  className,
  tamaño = 160,
  duracion = 7,
  ancho_borde = 2,
  color_desde = "#17B4C4",
  color_hacia = "#F8C766",
  radio_borde = 16,
}: BordeLuminosoProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden",
        className
      )}
      style={{
        padding: `${ancho_borde}px`,
        maskImage: "linear-gradient(transparent, transparent), linear-gradient(white, white)",
        maskClip: "padding-box, border-box",
        maskComposite: "intersect",
        WebkitMaskComposite: "source-in",
      }}
      aria-hidden="true"
    >
      <motion.div
        className="absolute aspect-square"
        style={{
          width: tamaño,
          background: `linear-gradient(90deg, transparent, ${color_desde}, ${color_hacia}, transparent)`,
          offsetPath: `rect(0 auto auto 0 round ${radio_borde}px)`,
        }}
        animate={{
          offsetDistance: ["0%", "100%"],
        }}
        transition={{
          duration: duracion,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}
