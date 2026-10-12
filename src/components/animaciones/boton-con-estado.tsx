"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence, HTMLMotionProps } from "motion/react";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { RafagaCelebracion } from "./rafaga-celebracion";

export type EstadoBoton = "reposo" | "cargando" | "exito" | "error";

export interface PropiedadesBotonConEstado
  extends Omit<
    HTMLMotionProps<"button">,
    "onClick" | "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd" | "children"
  > {
  estado?: EstadoBoton;
  alHacerClic?: () => Promise<void> | void;
  texto_reposo?: React.ReactNode;
  texto_cargando?: string;
  texto_exito?: string;
  texto_error?: string;
  icono_reposo?: React.ElementType;
  disparar_confeti_al_exito?: boolean;
  variante?: "primario" | "secundario" | "dorado" | "exito" | "contorno";
  tamaño?: "sm" | "md" | "lg";
  con_halo?: boolean;
  duracion_reversion_ms?: number;
  className?: string;
  children?: React.ReactNode;
}

const ESTILOS_VARIANTE = {
  primario: "bg-[#063A6B] text-white hover:bg-[#084885] border-transparent shadow-sm hover:shadow-md",
  secundario: "bg-[#17B4C4] text-[#063A6B] font-bold hover:bg-[#15a4b3] border-transparent shadow-sm hover:shadow-md",
  dorado: "bg-[#F8C766] text-[#063A6B] font-bold hover:bg-[#f6bd48] border-transparent shadow-sm hover:shadow-md",
  exito: "bg-emerald-600 text-white hover:bg-emerald-700 border-transparent shadow-sm hover:shadow-md",
  contorno: "bg-white text-[#063A6B] border border-[#E3DCCB] hover:bg-slate-50 font-bold shadow-2xs hover:border-[#17B4C4]/60",
};

const ESTILOS_TAMAÑO = {
  sm: "h-8 px-3 text-xs rounded-xl gap-1.5",
  md: "h-10 px-4 text-xs font-semibold rounded-xl gap-2",
  lg: "h-12 px-6 text-sm font-bold rounded-2xl gap-2.5",
};

/**
 * Componente Botón con Estado Reactivo Multi-Capa (Watermelon UI + Cult UI + Skipper UI)
 * Soporta estados automáticos: 'reposo' | 'cargando' | 'exito' | 'error'
 * con física de resorte (whileTap/whileHover), halo radial de luz y ráfaga de confeti.
 */
export function BotonConEstado({
  estado: estado_controlado,
  alHacerClic,
  texto_reposo,
  texto_cargando = "Procesando...",
  texto_exito = "¡Completado!",
  texto_error = "Error al procesar",
  icono_reposo: IconoReposo,
  disparar_confeti_al_exito = false,
  variante = "primario",
  tamaño = "md",
  con_halo: _con_halo,
  duracion_reversion_ms = 2200,
  className,
  children,
  disabled,
  ...props
}: PropiedadesBotonConEstado) {
  const [estado_interno, set_estado_interno] = useState<EstadoBoton>("reposo");
  const [mostrar_confeti, set_mostrar_confeti] = useState(false);

  const ref_boton = useRef<HTMLButtonElement>(null);

  const estado_actual = estado_controlado !== undefined ? estado_controlado : estado_interno;

  const manejarClic = async () => {
    if (disabled || estado_actual === "cargando") return;

    if (!alHacerClic) return;

    try {
      const retorno = alHacerClic();
      if (retorno instanceof Promise) {
        set_estado_interno("cargando");
        await retorno;
        set_estado_interno("exito");
        if (disparar_confeti_al_exito) set_mostrar_confeti(true);

        setTimeout(() => {
          set_estado_interno("reposo");
          set_mostrar_confeti(false);
        }, duracion_reversion_ms);
      }
    } catch {
      set_estado_interno("error");
      setTimeout(() => {
        set_estado_interno("reposo");
      }, duracion_reversion_ms);
    }
  };

  const contenido_texto = children || texto_reposo;

  return (
    <>
      {mostrar_confeti && <RafagaCelebracion activo={mostrar_confeti} duracion_ms={2000} />}

      <motion.button
        ref={ref_boton}
        type="button"
        disabled={disabled || estado_actual === "cargando"}
        onClick={manejarClic}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.92 }}
        animate={
          estado_actual === "error"
            ? { x: [-6, 6, -4, 4, -2, 2, 0] }
            : { x: 0 }
        }
        transition={{
          type: "spring",
          stiffness: 450,
          damping: 24,
        }}
        className={cn(
          "relative overflow-hidden inline-flex items-center justify-center select-none cursor-pointer transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17B4C4] focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          ESTILOS_TAMAÑO[tamaño],
          estado_actual === "exito"
            ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md"
            : estado_actual === "error"
            ? "bg-[#E2694B] text-white hover:bg-[#d5593c] shadow-md"
            : ESTILOS_VARIANTE[variante],
          className
        )}
        {...props}
      >
        {/* Contenido Dinámico según Estado */}
        <AnimatePresence mode="wait">
          {estado_actual === "cargando" && (
            <motion.span
              key="cargando"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="relative z-10 flex items-center gap-2 font-bold"
            >
              <Loader2 className="w-4 h-4 animate-spin text-current" />
              <span>{texto_cargando}</span>
            </motion.span>
          )}

          {estado_actual === "exito" && (
            <motion.span
              key="exito"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className="relative z-10 flex items-center gap-2 font-bold"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ type: "spring", stiffness: 600, damping: 15 }}
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </motion.span>
              <span>{texto_exito}</span>
            </motion.span>
          )}

          {estado_actual === "error" && (
            <motion.span
              key="error"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="relative z-10 flex items-center gap-2 font-bold"
            >
              <AlertCircle className="w-4 h-4 text-white" />
              <span>{texto_error}</span>
            </motion.span>
          )}

          {estado_actual === "reposo" && (
            <motion.span
              key="reposo"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="relative z-10 flex items-center gap-2"
            >
              {IconoReposo && <IconoReposo className="w-4 h-4 shrink-0 text-current" />}
              <span>{contenido_texto}</span>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
