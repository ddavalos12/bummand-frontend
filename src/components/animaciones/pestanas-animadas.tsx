"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface ElementoPestana {
  id: string;
  etiqueta: string;
  contador?: number;
}

interface PropiedadesPestanasAnimadas {
  pestanas: ElementoPestana[];
  pestana_activa_id: string;
  al_cambiar_pestana: (_id_pestana: string) => void;
  identificador_diseno?: string;
  clase_personalizada?: string;
}

/**
 * Motion Primitives — Pestañas Animadas con Morfología Continua (Animated Tabs)
 * Utiliza layoutId de Framer Motion para proyectar una pastilla deslizante
 * con física elástica entre selecciones sin saltos abruptos.
 */
export const PestanasAnimadas: React.FC<PropiedadesPestanasAnimadas> = ({
  pestanas,
  pestana_activa_id,
  al_cambiar_pestana,
  identificador_diseno = "pastilla_activa_indicador",
  clase_personalizada = "",
}) => {
  return (
    <div
      role="tablist"
      aria-label="Pestañas de navegación"
      className={cn(
        "inline-flex items-center gap-1 p-1.5 rounded-2xl bg-neutral-100/90 dark:bg-neutral-900/90 border border-neutral-200/70 dark:border-neutral-800/70 backdrop-blur-sm",
        clase_personalizada
      )}
    >
      {pestanas.map((_pestana) => {
        const esta_activa = _pestana.id === pestana_activa_id;

        return (
          <button
            key={_pestana.id}
            role="tab"
            type="button"
            aria-selected={esta_activa}
            onClick={() => al_cambiar_pestana(_pestana.id)}
            className={`relative px-4 py-2 text-sm font-semibold rounded-xl transition-colors duration-200 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17B4C4] ${
              esta_activa
                ? "text-white"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
            }`}
          >
            {esta_activa && (
              <motion.div
                layoutId={identificador_diseno}
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#063A6B] to-[#17B4C4] shadow-md shadow-[#17B4C4]/20"
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 32,
                }}
                style={{ zIndex: -1 }}
              />
            )}
            <span className="flex items-center gap-2">
              {_pestana.etiqueta}
              {_pestana.contador !== undefined && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                    esta_activa
                      ? "bg-white/20 text-white"
                      : "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                  }`}
                >
                  {_pestana.contador}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};
