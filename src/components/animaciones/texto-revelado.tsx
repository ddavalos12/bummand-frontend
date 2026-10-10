"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface TextoReveladoProps {
  texto: string;
  className?: string;
  duracion?: number;
  retraso?: number;
}

/**
 * Motion Primitives — Revelación de Texto Cinematográfico (Blur-In Text)
 * Emerge el texto con desenfoque gaussiano progresivo y escala sutil.
 */
export function TextoRevelado({
  texto,
  className,
  duracion = 0.5,
  retraso = 0,
}: TextoReveladoProps) {
  return (
    <motion.span
      initial={{ opacity: 0, filter: "blur(6px)", y: 4 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      transition={{
        duration: duracion,
        delay: retraso,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={cn("inline-block", className)}
    >
      {texto}
    </motion.span>
  );
}
