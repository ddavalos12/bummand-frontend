"use client";

import React, { useRef, useState, useCallback } from "react";
import { motion, HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

interface PropiedadesBotonHalo
  extends Omit<
    HTMLMotionProps<"button">,
    "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd" | "children"
  > {
  color_halo?: string;
  radio_px?: number;
  children: React.ReactNode;
}

/**
 * Cult UI — Botón Halo (Halo Button)
 * Botón con foco radial interactivo que sigue el puntero del usuario
 * proyectando un halo de luz sofisticado.
 */
export function BotonHalo({
  color_halo = "rgba(0, 171, 189, 0.4)",
  radio_px = 140,
  children,
  className,
  disabled,
  ...props
}: PropiedadesBotonHalo) {
  const ref_boton = useRef<HTMLButtonElement>(null);
  const [posicion, set_posicion] = useState<{ x: number; y: number } | null>(null);

  const manejarMovimientoPuntero = useCallback((_evento: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref_boton.current) return;
    const rect = ref_boton.current.getBoundingClientRect();
    set_posicion({
      x: _evento.clientX - rect.left,
      y: _evento.clientY - rect.top,
    });
  }, []);

  return (
    <motion.button
      ref={ref_boton}
      onMouseMove={manejarMovimientoPuntero}
      onMouseLeave={() => set_posicion(null)}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.94 }}
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
      disabled={disabled}
      className={cn(
        "relative overflow-hidden rounded-xl border border-[#035683]/20 bg-[#035683] text-white px-4 py-2.5 text-xs font-bold shadow-sm transition-all select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ABBD]",
        "disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      {...props}
    >
      {/* Capa de halo luminoso */}
      {posicion && (
        <span
          className="pointer-events-none absolute -inset-px transition-opacity duration-300"
          style={{
            background: `radial-gradient(${radio_px}px circle at ${posicion.x}px ${posicion.y}px, ${color_halo}, transparent 80%)`,
          }}
          aria-hidden="true"
        />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  );
}
