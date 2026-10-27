"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface PropiedadesIslaDinamica {
  visible: boolean;
  icono?: React.ElementType;
  titulo: string;
  subtitulo?: string;
  className?: string;
  alCerrar?: () => void;
}

/**
 * Cult UI — Isla Dinámica (Dynamic Island)
 * Notificador superior adaptable flotante con morfología continua
 * para avisos en tiempo real, sincronización y confirmación de estados.
 */
export function IslaDinamica({
  visible,
  icono: Icono,
  titulo,
  subtitulo,
  className,
  alCerrar,
}: PropiedadesIslaDinamica) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.9 }}
          transition={{
            type: "spring",
            stiffness: 450,
            damping: 28,
          }}
          onClick={alCerrar}
          className={cn(
            "fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-full",
            "bg-[#035683] text-white shadow-xl shadow-[#035683]/25 border border-[#00ABBD]/40 backdrop-blur-md cursor-pointer select-none",
            className
          )}
        >
          {Icono && (
            <div className="w-6 h-6 rounded-full bg-[#00ABBD]/20 flex items-center justify-center text-[#FFB600] shrink-0">
              <Icono className="w-3.5 h-3.5" />
            </div>
          )}
          <div className="min-w-0 pr-1">
            <p className="text-xs font-bold leading-tight truncate">{titulo}</p>
            {subtitulo && (
              <p className="text-[10px] text-white/70 leading-tight truncate">{subtitulo}</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
