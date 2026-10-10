"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface ContenedorEscalonadoProps {
  children: React.ReactNode;
  className?: string;
  retraso_inicial?: number;
  intervalo_escalon?: number;
}

const variantes_contenedor = {
  oculto: { opacity: 0 },
  visible: (custom: { retraso_inicial: number; intervalo_escalon: number }) => ({
    opacity: 1,
    transition: {
      delayChildren: custom.retraso_inicial,
      staggerChildren: custom.intervalo_escalon,
    },
  }),
};

const variantes_elemento = {
  oculto: { opacity: 0, y: 14, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 24,
    },
  },
};

/**
 * Motion Primitives — Contenedor Escalonado (Stagger Container)
 * Coreografía la entrada en cascada cinematográfica de tarjetas, filas de datos y métricas.
 */
export function ContenedorEscalonado({
  children,
  className,
  retraso_inicial = 0.05,
  intervalo_escalon = 0.07,
}: ContenedorEscalonadoProps) {
  return (
    <motion.div
      variants={variantes_contenedor}
      initial="oculto"
      animate="visible"
      custom={{ retraso_inicial, intervalo_escalon }}
      className={cn("w-full", className)}
    >
      {children}
    </motion.div>
  );
}

/**
 * Motion Primitives — Elemento Escalonado Hijo (Stagger Item)
 * Elemento individual animado dentro del ContenedorEscalonado.
 */
export function ElementoEscalonado({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={variantes_elemento} className={cn("w-full", className)}>
      {children}
    </motion.div>
  );
}
