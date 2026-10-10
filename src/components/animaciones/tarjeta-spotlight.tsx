"use client";

import React, { useRef, useState, MouseEvent } from "react";
import { cn } from "@/lib/utils";

interface TarjetaSpotlightProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  color_luz?: string;
  radio_luz?: number;
}

/**
 * Cult UI — Tarjeta con Reflector de Cursor (Spotlight Card)
 * Proyecta una fuente de luz radial interactiva que sigue el cursor del mouse,
 * iluminando delicadamente el fondo y los bordes con la paleta de BUMAND.
 */
export function TarjetaSpotlight({
  children,
  className,
  color_luz = "rgba(23, 180, 196, 0.15)",
  radio_luz = 280,
  ...props
}: TarjetaSpotlightProps) {
  const ref_tarjeta = useRef<HTMLDivElement>(null);
  const [posicion, set_posicion] = useState<{ x: number; y: number } | null>(null);
  const [esta_sobre, set_esta_sobre] = useState(false);

  const manejarMovimientoMouse = (evento: MouseEvent<HTMLDivElement>) => {
    if (!ref_tarjeta.current) return;
    const rect = ref_tarjeta.current.getBoundingClientRect();
    set_posicion({
      x: evento.clientX - rect.left,
      y: evento.clientY - rect.top,
    });
  };

  const manejarEntradaMouse = () => set_esta_sobre(true);
  const manejarSalidaMouse = () => {
    set_esta_sobre(false);
    set_posicion(null);
  };

  return (
    <div
      ref={ref_tarjeta}
      onMouseMove={manejarMovimientoMouse}
      onMouseEnter={manejarEntradaMouse}
      onMouseLeave={manejarSalidaMouse}
      className={cn(
        "relative overflow-hidden rounded-xl border border-[#E3DCCB] bg-white transition-shadow duration-300 hover:shadow-md",
        className
      )}
      {...props}
    >
      {/* Halo de luz dinámico (Spotlight) */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity: esta_sobre && posicion ? 1 : 0,
          background: posicion
            ? `radial-gradient(${radio_luz}px circle at ${posicion.x}px ${posicion.y}px, ${color_luz}, transparent 80%)`
            : "none",
        }}
        aria-hidden="true"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
