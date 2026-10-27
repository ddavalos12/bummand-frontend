"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertTriangle, Trash2, ShieldAlert, Loader2 } from "lucide-react";

export type TipoConfirmacion = "destructivo" | "advertencia" | "primario";

export interface OpcionesEliminacionRegistro {
  titulo?: string;
  descripcion: string;
  nombre_item?: string;
  onConfirmar: () => void | Promise<void>;
  mensaje_exito?: string;
}

export interface OpcionesAccionInstitucional {
  titulo: string;
  descripcion: string;
  texto_confirmar?: string;
  texto_cancelar?: string;
  tipo?: TipoConfirmacion;
  onConfirmar: () => void | Promise<void>;
  mensaje_exito?: string;
}

interface EstadoDialogoConfirmacion {
  abierto: boolean;
  titulo: string;
  descripcion: string;
  texto_cancelar: string;
  texto_confirmar: string;
  tipo: TipoConfirmacion;
  onConfirmar: () => void | Promise<void>;
  onCancelar?: () => void;
  mensaje_exito?: string;
  nombre_item?: string;
  es_cierre_formulario?: boolean;
}

const ESTADO_INICIAL_DIALOGO: EstadoDialogoConfirmacion = {
  abierto: false,
  titulo: "",
  descripcion: "",
  texto_cancelar: "Cancelar",
  texto_confirmar: "Confirmar",
  tipo: "primario",
  onConfirmar: () => {},
};

/**
 * Hook institucional para la gestión unificada de diálogos de confirmación modales y toasts.
 * Reemplaza de forma definitiva cualquier uso de alert() o confirm() nativos.
 */
export function useConfirmacionDialogo() {
  const [estado_dialogo, set_estado_dialogo] =
    useState<EstadoDialogoConfirmacion>(ESTADO_INICIAL_DIALOGO);
  const [esta_ejecutando, set_esta_ejecutando] = useState<boolean>(false);

  const cerrarDialogo = useCallback(() => {
    if (esta_ejecutando) return;
    set_estado_dialogo((prev) => ({ ...prev, abierto: false }));
  }, [esta_ejecutando]);

  /**
   * 1. Confirmar salida o descarte de formulario con datos pendientes sin guardar.
   */
  const confirmarCierreSinCompletar = useCallback(
    (
      hay_cambios_sin_guardar: boolean,
      onConfirmarCierre: () => void,
      nombre_formulario?: string
    ) => {
      if (!hay_cambios_sin_guardar) {
        onConfirmarCierre();
        return;
      }

      const titulo_cierre = nombre_formulario
        ? `¿Salir sin completar ${nombre_formulario}?`
        : "¿Salir sin completar el formulario?";

      set_estado_dialogo({
        abierto: true,
        titulo: titulo_cierre,
        descripcion:
          "¿Está seguro de que desea salir? Los datos ingresados que no hayan sido guardados se descartarán permanentemente.",
        texto_cancelar: "Seguir completando",
        texto_confirmar: "Descartar cambios y salir",
        tipo: "destructivo",
        es_cierre_formulario: true,
        onConfirmar: () => {
          onConfirmarCierre();
          toast.info("Formulario cerrado sin guardar cambios");
        },
      });
    },
    []
  );

  /**
   * 2. Confirmar eliminación de un registro de forma destructiva y estilo institucional coral (#E2694B).
   */
  const confirmarEliminacionRegistro = useCallback(
    (opciones: OpcionesEliminacionRegistro) => {
      set_estado_dialogo({
        abierto: true,
        titulo: opciones.titulo || "¿Confirmar eliminación de registro?",
        descripcion: opciones.descripcion,
        texto_cancelar: "Cancelar",
        texto_confirmar: "Sí, eliminar registro",
        tipo: "destructivo",
        nombre_item: opciones.nombre_item,
        mensaje_exito: opciones.mensaje_exito,
        onConfirmar: async () => {
          await opciones.onConfirmar();
          const mensaje_final =
            opciones.mensaje_exito || "Registro eliminado correctamente";
          const descripcion_final = opciones.nombre_item
            ? `El registro "${opciones.nombre_item}" fue eliminado permanentemente.`
            : "La operación de eliminación fue completada con éxito.";
          toast.success(mensaje_final, {
            description: descripcion_final,
          });
        },
      });
    },
    []
  );

  /**
   * 3. Confirmar acciones institucionales destacadas (validaciones, convalidaciones, cierres de ciclo).
   */
  const confirmarAccionInstitucional = useCallback(
    (opciones: OpcionesAccionInstitucional) => {
      set_estado_dialogo({
        abierto: true,
        titulo: opciones.titulo,
        descripcion: opciones.descripcion,
        texto_cancelar: opciones.texto_cancelar || "Cancelar",
        texto_confirmar: opciones.texto_confirmar || "Confirmar",
        tipo: opciones.tipo || "primario",
        mensaje_exito: opciones.mensaje_exito,
        onConfirmar: async () => {
          await opciones.onConfirmar();
          if (opciones.mensaje_exito) {
            toast.success(opciones.mensaje_exito);
          }
        },
      });
    },
    []
  );

  const manejarConfirmacion = useCallback(async () => {
    try {
      set_esta_ejecutando(true);
      await estado_dialogo.onConfirmar();
      set_estado_dialogo((prev) => ({ ...prev, abierto: false }));
    } catch (error) {
      const mensaje_error =
        error instanceof Error ? error.message : "Error al procesar la operación.";
      toast.error("No se pudo completar la operación", {
        description: mensaje_error,
      });
    } finally {
      set_esta_ejecutando(false);
    }
  }, [estado_dialogo]);

  const manejarCambioAbierto = useCallback(
    (nuevo_abierto: boolean) => {
      if (esta_ejecutando) return;
      if (!nuevo_abierto && estado_dialogo.onCancelar) {
        estado_dialogo.onCancelar();
      }
      set_estado_dialogo((prev) => ({ ...prev, abierto: nuevo_abierto }));
    },
    [esta_ejecutando, estado_dialogo]
  );

  /**
   * 4. Elemento JSX institucional para renderizar en el componente padre.
   */
  const DialogoConfirmacionInstitucional = useMemo(() => {
    if (!estado_dialogo.abierto) return null;

    const es_destructivo = estado_dialogo.tipo === "destructivo";
    const es_advertencia = estado_dialogo.tipo === "advertencia";

    return (
      <AlertDialog
        open={estado_dialogo.abierto}
        onOpenChange={manejarCambioAbierto}
      >
        <AlertDialogContent className="sm:max-w-md p-6 bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl">
          <AlertDialogHeader className="space-y-2 text-left">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  es_destructivo
                    ? "bg-[#E2694B]/10 text-[#E2694B]"
                    : es_advertencia
                    ? "bg-amber-100 text-amber-700"
                    : "bg-[#035683]/10 text-[#035683]"
                }`}
              >
                {es_destructivo ? (
                  estado_dialogo.es_cierre_formulario ? (
                    <AlertTriangle className="w-5 h-5 text-[#E2694B]" />
                  ) : (
                    <Trash2 className="w-5 h-5 text-[#E2694B]" />
                  )
                ) : es_advertencia ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-[#035683]" />
                )}
              </div>
              <AlertDialogTitle
                className={`text-base font-bold font-display ${
                  es_destructivo ? "text-[#E2694B]" : "text-[#035683]"
                }`}
              >
                {estado_dialogo.titulo}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs text-[#5B6D77] leading-relaxed pt-1 font-body">
              {estado_dialogo.descripcion}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="pt-4 mt-2 border-t border-[#E5E7EB]/60 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <AlertDialogCancel
              disabled={esta_ejecutando}
              onClick={cerrarDialogo}
              render={
                <Button
                  type="button"
                  variant="outline"
                  disabled={esta_ejecutando}
                  className="h-9 px-4 rounded-xl text-xs font-semibold border-[#E5E7EB] text-[#5B6D77] hover:bg-slate-50 transition-all"
                >
                  {estado_dialogo.texto_cancelar}
                </Button>
              }
            >
              {estado_dialogo.texto_cancelar}
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={esta_ejecutando}
              onClick={(e) => {
                e.preventDefault();
                manejarConfirmacion();
              }}
              render={
                <Button
                  type="button"
                  disabled={esta_ejecutando}
                  className={`h-9 px-4 rounded-xl text-xs font-bold text-white shadow-sm transition-all flex items-center gap-1.5 ${
                    es_destructivo
                      ? "bg-[#E2694B] hover:bg-[#c9573b] focus-visible:ring-[#E2694B]"
                      : es_advertencia
                      ? "bg-[#FFB600] hover:bg-[#FFB600]/90 text-[#035683] focus-visible:ring-[#FFB600]"
                      : "bg-[#007BBE] hover:bg-[#035683] focus-visible:ring-[#007BBE]"
                  }`}
                >
                  {esta_ejecutando && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  {estado_dialogo.texto_confirmar}
                </Button>
              }
            >
              {estado_dialogo.texto_confirmar}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }, [
    estado_dialogo,
    esta_ejecutando,
    manejarCambioAbierto,
    cerrarDialogo,
    manejarConfirmacion,
  ]);

  return {
    confirmarCierreSinCompletar,
    confirmarEliminacionRegistro,
    confirmarAccionInstitucional,
    cerrarDialogo,
    DialogoConfirmacionInstitucional,
    estado_dialogo,
    esta_ejecutando,
  };
}
