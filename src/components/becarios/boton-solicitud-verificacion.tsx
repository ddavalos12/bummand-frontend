"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Send, Clock, Loader2 } from "lucide-react";
import { useCooldownVerificacion } from "@/hooks/useCooldownVerificacion";
import { clienteApi } from "@/lib/cliente-api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PropiedadesBotonSolicitudVerificacion {
  total_becarios: number;
  alEmitirOrden?: () => void;
  confirmarAccionInstitucional: (opciones: {
    titulo: string;
    descripcion: string;
    texto_confirmar?: string;
    texto_cancelar?: string;
    tipo?: "destructivo" | "advertencia" | "primario";
    onConfirmar: () => void | Promise<void>;
  }) => void;
}

export function BotonSolicitudVerificacion({
  total_becarios,
  alEmitirOrden,
  confirmarAccionInstitucional,
}: PropiedadesBotonSolicitudVerificacion) {
  const {
    esta_en_cooldown,
    texto_reactivacion,
    fecha_reactivacion,
    registrarSolicitud,
    sincronizarConServidor,
  } = useCooldownVerificacion();

  const [esta_cargando, set_esta_cargando] = useState(false);

  useEffect(() => {
    let montado = true;
    const sincronizarEstadoGlobal = async () => {
      try {
        const respuesta = await clienteApi.get<{
          confirmacion_activa: boolean;
          puede_solicitar: boolean;
          dias_restantes: number;
          fecha_ultima_solicitud: string | null;
        }>("/becarios/estado-orden-global");

        if (montado && respuesta?.fecha_ultima_solicitud) {
          sincronizarConServidor(respuesta.fecha_ultima_solicitud);
        }
      } catch {
        // En caso de modo offline o sin conexión directa, mantiene el cooldown local persistido
      }
    };

    sincronizarEstadoGlobal();
    return () => {
      montado = false;
    };
  }, [sincronizarConServidor]);

  const ejecutarSolicitud = async () => {
    try {
      set_esta_cargando(true);
      const respuesta = await clienteApi.post<{
        mensaje: string;
        confirmacion_datos_requerida: boolean;
        fecha_ultima_solicitud?: string;
        dias_restantes?: number;
      }>("/becarios/orden-confirmacion-datos", {});

      registrarSolicitud(respuesta?.fecha_ultima_solicitud);
      alEmitirOrden?.();

      toast.success(
        respuesta?.mensaje || "Orden institucional de verificación emitida exitosamente.",
        {
          description: `Se notificó a los becarios. Próxima emisión disponible en 7 días.`,
        }
      );
    } catch (error: any) {
      toast.error(error?.message || "No se pudo emitir la orden institucional de verificación");
    } finally {
      set_esta_cargando(false);
    }
  };

  const manejarClic = () => {
    confirmarAccionInstitucional({
      titulo: "¿Emitir Orden Institucional de Verificación de Datos?",
      descripcion: `Esta orden cambiará el estado de los expedientes a "Pendiente Validación" y requerirá que los becarios confirmen sus datos en la aplicación móvil. El botón se desactivará de inmediato por 7 días. ¿Desea proceder?`,
      texto_confirmar: "Sí, Solicitar Verificación (7 días)",
      texto_cancelar: "Cancelar",
      tipo: "primario",
      onConfirmar: ejecutarSolicitud,
    });
  };

  if (esta_en_cooldown) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <span className="inline-block cursor-not-allowed">
              <Button
                type="button"
                disabled
                variant="outline"
                className={cn(
                  "h-10 px-3.5 border-amber-300/80 bg-amber-50/60 text-amber-800 text-xs font-semibold rounded-xl flex items-center gap-2 pointer-events-none opacity-90 shadow-2xs"
                )}
              >
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Solicitado ({texto_reactivacion})</span>
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent className="text-xs max-w-xs bg-slate-900 text-white p-2 rounded-lg">
            Orden institucional periódica activa. La próxima emisión estará habilitada el{" "}
            {fecha_reactivacion
              ? fecha_reactivacion.toLocaleDateString("es-BO", {
                  day: "2-digit",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "en 7 días"}.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Button
            type="button"
            onClick={manejarClic}
            disabled={esta_cargando}
            className="h-10 px-4 bg-[#063A6B] hover:bg-[#063A6B]/90 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
          >
            {esta_cargando ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5 text-[#17B4C4]" />
            )}
            <span>Solicitar Verificación Mensual</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-xs max-w-xs bg-slate-900 text-white p-2 rounded-lg">
          Emite una orden formal para que todos los becarios verifiquen y ratifiquen sus datos institucionales. Bloqueo automático de 7 días tras la emisión.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
