"use client";

import React from "react";
import {
  Eye,
  ShieldCheck,
  Loader2,
  AlertTriangle,
  Clock,
  Send,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type EstadoAccionEvaluacion =
  | "pendiente"
  | "completado"
  | "observado"
  | "esperando";

export interface PropiedadesBotonesAccionEvaluacion {
  estado: EstadoAccionEvaluacion;
  mostrar_revisar?: boolean;
  texto_revisar?: string;
  titulo_revisar?: string;
  alRevisar?: () => void;
  texto_pendiente?: string;
  titulo_pendiente?: string;
  alEjecutarPendiente?: () => void;
  texto_completado?: string;
  titulo_completado?: string;
  alHacerClicCompletado?: () => void;
  texto_observado?: string;
  titulo_observado?: string;
  alHacerClicObservado?: () => void;
  texto_esperando?: string;
  mostrar_observar_secundario?: boolean;
  texto_observar?: string;
  alObservar?: () => void;
  icono_pendiente?: "escudo" | "enviar" | "usuario" | "check";
  cargando?: boolean;
  deshabilitado?: boolean;
  tamano?: "sm" | "md";
  alineacion?: "derecha" | "izquierda" | "centro" | "entre";
  clase_contenedor?: string;
}

/**
 * Par de botones estandarizados para todas las vistas de evaluación (Todos los roles).
 * Refleja cambios condicionales según el estado:
 * - Revisar (botón outline turquesa/marino)
 * - Acción pendiente (píldora verde sólido) -> Completado/Aprobado/Revisado/Enviado (píldora verde suave con borde)
 */
export function BotonesAccionEvaluacion({
  estado,
  mostrar_revisar = true,
  texto_revisar = "Revisar",
  titulo_revisar = "Inspeccionar detalles y documentos de la evaluación",
  alRevisar,
  texto_pendiente = "Aprobar",
  titulo_pendiente = "Aprobar y convalidar evaluación",
  alEjecutarPendiente,
  texto_completado = "Aprobado",
  titulo_completado = "Evaluación revisada y aprobada",
  alHacerClicCompletado,
  texto_observado = "Observado",
  titulo_observado = "Evaluación con observaciones",
  alHacerClicObservado,
  texto_esperando = "Pendiente",
  mostrar_observar_secundario = false,
  texto_observar = "Observar",
  alObservar,
  icono_pendiente = "escudo",
  cargando = false,
  deshabilitado = false,
  tamano = "sm",
  alineacion = "derecha",
  clase_contenedor = "",
}: PropiedadesBotonesAccionEvaluacion) {
  const clase_altura = tamano === "md" ? "h-10 px-4 text-xs" : "h-8 px-3 text-xs";
  const clase_altura_pildora = tamano === "md" ? "h-10 px-4 text-xs" : "h-8 px-3 text-[11px]";

  const clase_alineacion =
    alineacion === "izquierda"
      ? "justify-start"
      : alineacion === "centro"
      ? "justify-center"
      : alineacion === "entre"
      ? "justify-between w-full"
      : "justify-end";

  const renderizarIconoPendiente = () => {
    if (cargando) {
      return <Loader2 className="w-3.5 h-3.5 animate-spin text-white shrink-0" />;
    }
    switch (icono_pendiente) {
      case "enviar":
        return <Send className="w-3.5 h-3.5 text-white shrink-0" />;
      case "usuario":
        return <UserCheck className="w-3.5 h-3.5 text-white shrink-0" />;
      case "check":
        return <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />;
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-white shrink-0" />;
    }
  };

  return (
    <div
      className={`flex items-center gap-1.5 flex-wrap ${clase_alineacion} ${clase_contenedor}`}
    >
      {mostrar_revisar && alRevisar && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={alRevisar}
          title={titulo_revisar}
          className={`${clase_altura} border-[#00ABBD] text-[#035683] hover:bg-[#00ABBD]/10 bg-white rounded-full font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors`}
        >
          <Eye className="w-3.5 h-3.5 text-[#00ABBD] shrink-0" />
          <span>{texto_revisar}</span>
        </Button>
      )}

      {mostrar_observar_secundario && alObservar && estado === "pendiente" && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={cargando || deshabilitado}
          onClick={alObservar}
          className={`${clase_altura} border-rose-300 text-rose-700 hover:bg-rose-50 bg-white rounded-full font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>{texto_observar}</span>
        </Button>
      )}

      {estado === "pendiente" && alEjecutarPendiente && (
        <Button
          type="button"
          size="sm"
          disabled={cargando || deshabilitado}
          onClick={alEjecutarPendiente}
          title={titulo_pendiente}
          className={`${clase_altura} bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors`}
        >
          {renderizarIconoPendiente()}
          <span>{texto_pendiente}</span>
        </Button>
      )}

      {estado === "completado" && (
        <button
          type="button"
          onClick={alHacerClicCompletado}
          disabled={!alHacerClicCompletado || cargando}
          title={titulo_completado}
          className={`${clase_altura_pildora} border border-emerald-400 bg-emerald-50 text-emerald-800 font-bold rounded-full inline-flex items-center gap-1.5 transition-colors ${
            alHacerClicCompletado
              ? "cursor-pointer hover:bg-emerald-100"
              : "cursor-default"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{texto_completado}</span>
        </button>
      )}

      {estado === "observado" && (
        <button
          type="button"
          onClick={alHacerClicObservado}
          disabled={!alHacerClicObservado || cargando}
          title={titulo_observado}
          className={`${clase_altura_pildora} border border-rose-300 bg-rose-50 text-rose-800 font-bold rounded-full inline-flex items-center gap-1.5 transition-colors ${
            alHacerClicObservado
              ? "cursor-pointer hover:bg-rose-100"
              : "cursor-default"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>{texto_observado}</span>
        </button>
      )}

      {estado === "esperando" && (
        <span
          className={`${clase_altura_pildora} border border-slate-300 bg-slate-50 text-slate-600 font-semibold rounded-full inline-flex items-center gap-1.5 cursor-default`}
        >
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{texto_esperando}</span>
        </span>
      )}
    </div>
  );
}
