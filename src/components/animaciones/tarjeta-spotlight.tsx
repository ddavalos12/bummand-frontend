"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TarjetaSpotlightProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  color_luz?: string;
  radio_luz?: number;
  clase_contenido?: string;
  con_halo?: boolean;
}

/**
 * Tarjeta sobria e institucional sin halos ni destellos distractores.
 * Cumple con la regla de bordes redondeados orgánicos del Manual de Marca Diaconía FRIF-IFD.
 */
export function TarjetaSpotlight({
  children,
  className,
  clase_contenido,
  color_luz: _color_luz,
  radio_luz: _radio_luz,
  con_halo: _con_halo,
  ...props
}: TarjetaSpotlightProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white transition-shadow duration-300 hover:shadow-sm [--card-spacing:1.5rem]",
        className
      )}
      {...props}
    >
      <div className={cn("relative z-10 h-full w-full", clase_contenido)}>{children}</div>
    </div>
  );
}
