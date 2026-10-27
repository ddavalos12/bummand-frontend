"use client";

import React from "react";
import { motion } from "motion/react";
import {
  Clock,
  Bus,
  BookOpen,
  Award,
  LayoutDashboard,
  CalendarDays,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ComandoAccion {
  id: string;
  etiqueta: string;
  icono: React.ElementType;
}

const COMANDOS_BECARIO: ComandoAccion[] = [
  { id: "resumen", etiqueta: "Mi Panel", icono: LayoutDashboard },
  { id: "eventos", etiqueta: "Eventos", icono: CalendarDays },
  { id: "asistencia", etiqueta: "Horas", icono: Clock },
  { id: "pasajes", etiqueta: "Pasajes", icono: Bus },
  { id: "evaluacion_360", etiqueta: "Evaluación", icono: Award },
];

const COMANDOS_ADMIN: ComandoAccion[] = [
  { id: "administracion", etiqueta: "Dashboard", icono: LayoutDashboard },
  { id: "eventos", etiqueta: "Eventos", icono: CalendarDays },
  { id: "justificaciones", etiqueta: "Justificaciones", icono: ClipboardCheck },
  { id: "asistencia", etiqueta: "Asistencia", icono: Clock },
  { id: "pasajes", etiqueta: "Pasajes", icono: Bus },
  { id: "evaluaciones", etiqueta: "Matriz de Evaluación", icono: Award },
];

interface BarraComandosFlotanteProps {
  seccion_activa: string;
  alSeleccionarSeccion: (id: string) => void;
  es_becario: boolean;
}

/**
 * Skipper UI — Barra de Comandos Flotante Táctil (Floating Action Dock)
 * Muelle inferior de acceso rápido con cristal esmerilado, pastilla indicadora
 * deslizante (layoutId) y micro-escalamiento táctil elástico.
 */
export function BarraComandosFlotante({
  seccion_activa,
  alSeleccionarSeccion,
  es_becario,
}: BarraComandosFlotanteProps) {
  const comandos = es_becario ? COMANDOS_BECARIO : COMANDOS_ADMIN;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 px-3 py-2 rounded-2xl bg-white/90 backdrop-blur-xl border border-[#E5E7EB]/90 shadow-lg shadow-black/5 flex items-center gap-1.5 transition-all max-w-[95vw] overflow-x-auto">
      {comandos.map((cmd) => {
        const Icono = cmd.icono;
        const esta_activo = seccion_activa === cmd.id;

        return (
          <button
            key={cmd.id}
            type="button"
            onClick={() => alSeleccionarSeccion(cmd.id)}
            className={cn(
              "relative px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-colors duration-200 select-none shrink-0",
              esta_activo
                ? "text-[#035683]"
                : "text-slate-500 hover:text-[#035683] hover:bg-slate-100/60"
            )}
          >
            {esta_activo && (
              <motion.div
                layoutId="pastilla_comando_flotante"
                className="absolute inset-0 rounded-xl bg-[#00ABBD]/15 border border-[#00ABBD]/30"
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
              />
            )}
            <Icono
              className={cn(
                "w-4 h-4 relative z-10 transition-transform duration-150",
                esta_activo ? "text-[#035683] scale-110" : "text-slate-400"
              )}
            />
            <span className="relative z-10 hidden md:inline">{cmd.etiqueta}</span>
          </button>
        );
      })}
    </div>
  );
}
