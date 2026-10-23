"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  AlertTriangle,
  FileCheck,
  Send,
  X,
  Sparkles,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { InsigniaPulsoVivo } from "@/components/animaciones/insignia-pulso-vivo";
import { BotonConEstado } from "@/components/animaciones/boton-con-estado";
import { useTiempoReal } from "@/hooks/useTiempoReal";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import { peticionApi } from "@/lib/cliente-api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface NotificacionItem {
  id: number;
  tipo: "asistencia" | "pasajes" | "evaluacion" | "evento" | "general";
  titulo: string;
  mensaje: string;
  tiempo: string;
  leido: boolean;
}

const NOTIFICACIONES_BASE: NotificacionItem[] = [
  {
    id: 1,
    tipo: "asistencia",
    titulo: "Recordatorio de Marcación de Salida",
    mensaje: "Tienes un ingreso activo en Oficina Central Bloque A desde las 08:30. Recuerda registrar tu salida.",
    tiempo: "Hace 20 min",
    leido: false,
  },
  {
    id: 2,
    tipo: "pasajes",
    titulo: "Solicitud de Pasajes Observada",
    mensaje: "El supervisor observó la tarifa del tramo 2 en tu formulario de Septiembre. Por favor revisa las observaciones.",
    tiempo: "Hace 2 horas",
    leido: false,
  },
  {
    id: 3,
    tipo: "evento",
    titulo: "Encuentro Diaconal Convocado",
    mensaje: "Se ha publicado el Encuentro Juvenil con geocerca temporal WGS84 habilitada para este sábado.",
    tiempo: "Hace 5 horas",
    leido: false,
  },
  {
    id: 4,
    tipo: "evaluacion",
    titulo: "Formulario F-03 Completado",
    mensaje: "El Pastor de tu congregación ha subido la evaluación pastoral F-03 correspondiente al Semestre II.",
    tiempo: "Ayer",
    leido: true,
  },
  {
    id: 5,
    tipo: "general",
    titulo: "Habilitación de Declaración de Pasajes",
    mensaje: "El periodo del 24 al 30 de Septiembre está habilitado para el envío de formularios de pasajes.",
    tiempo: "Hace 3 días",
    leido: true,
  },
];

interface PropiedadesGloboNotificaciones {
  alAbrirHistorialCompleto?: () => void;
  alNavegarASeccion?: (seccion: string) => void;
  className?: string;
}

export function GloboNotificaciones({
  alAbrirHistorialCompleto,
  alNavegarASeccion,
  className,
}: PropiedadesGloboNotificaciones) {
  const { usuario } = usarAutenticacion();
  const [abierto, set_abierto] = useState<boolean>(false);
  const [notificaciones, set_notificaciones] = useState<NotificacionItem[]>(NOTIFICACIONES_BASE);
  const [filtro, set_filtro] = useState<"todas" | "pendientes">("todas");

  const ref_contenedor = useRef<HTMLDivElement>(null);

  useTiempoReal({
    eventos: {
      codigo_verificacion_tutor: (datos: unknown) => {
        // El código sólo le llega a los administradores, ya no al supervisor
        if (usuario && usuario.rol !== "administrador") {
          return;
        }

        const carga = (datos || {}) as {
          codigo?: string;
          becario_nombre?: string;
          supervisor_nombre?: string;
          mensaje?: string;
        };
        const codigo_str = carga.codigo || "000000";
        const becario_str = carga.becario_nombre || "Becario";
        const nueva: NotificacionItem = {
          id: Date.now(),
          tipo: "evaluacion",
          titulo: `🔐 Código de Administrador: ${codigo_str}`,
          mensaje:
            carga.mensaje ||
            `Código de 6 dígitos para autorizar evaluación de ${becario_str}: ${codigo_str} (válido por 10 min).`,
          tiempo: "Ahora mismo",
          leido: false,
        };
        set_notificaciones((prev) => [nueva, ...prev]);
        set_abierto(true);
        toast.info(`Código de Verificación (Administración): ${codigo_str}`, {
          description: `Ingresa el código ${codigo_str} para autorizar la evaluación de ${becario_str}.`,
          duration: 15000,
        });
      },
    },
  });

  useEffect(() => {
    let cancelado = false;
    async function cargarNotificacionesRemotas() {
      try {
        const remotas = await peticionApi<
          Array<{ id: number; tipo: string; mensaje: string; fecha_envio: string; leido: boolean }>
        >("/notificaciones");
        if (cancelado || !Array.isArray(remotas) || remotas.length === 0) return;
        const mapeadas: NotificacionItem[] = remotas.slice(0, 15).map((r) => {
          const es_codigo = r.tipo.includes("codigo_tutor");
          const tipo_item: NotificacionItem["tipo"] =
            r.tipo.includes("evaluacion") || es_codigo
              ? "evaluacion"
              : r.tipo.includes("pasaje")
                ? "pasajes"
                : r.tipo.includes("asistencia") || r.tipo.includes("multa")
                  ? "asistencia"
                  : "general";
          return {
            id: r.id + 10000,
            tipo: tipo_item,
            titulo: es_codigo ? "🔐 Código de Autorización de Administración" : "Notificación Institucional",
            mensaje: r.mensaje,
            tiempo: "Reciente",
            leido: Boolean(r.leido),
          };
        });
        set_notificaciones((prev) => {
          const ids = new Set(mapeadas.map((m) => m.id));
          return [...mapeadas, ...prev.filter((p) => !ids.has(p.id))];
        });
      } catch {
        // Conservar notificaciones locales en caso de desconexión
      }
    }
    cargarNotificacionesRemotas();
    return () => {
      cancelado = true;
    };
  }, [abierto]);

  const conteo_no_leidas = notificaciones.filter((n) => !n.leido).length;

  // Cierre al hacer clic fuera del globo
  useEffect(() => {
    function manejarClicFuera(evento: MouseEvent) {
      if (ref_contenedor.current && !ref_contenedor.current.contains(evento.target as Node)) {
        set_abierto(false);
      }
    }

    if (abierto) {
      document.addEventListener("mousedown", manejarClicFuera);
    }
    return () => {
      document.removeEventListener("mousedown", manejarClicFuera);
    };
  }, [abierto]);

  const marcarComoLeida = (id: number) => {
    set_notificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leido: true } : n))
    );
  };

  const manejarMarcarTodoLeido = async () => {
    // Simular latencia de red sutil para apreciar el botón con estado
    await new Promise((resolver) => setTimeout(resolver, 600));
    set_notificaciones((prev) => prev.map((n) => ({ ...n, leido: true })));
  };

  const manejarClicNotificacion = (item: NotificacionItem) => {
    marcarComoLeida(item.id);
    set_abierto(false);
    if (!alNavegarASeccion) return;
    switch (item.tipo) {
      case "asistencia":
        alNavegarASeccion("asistencia");
        break;
      case "pasajes":
        alNavegarASeccion("pasajes");
        break;
      case "evaluacion":
        alNavegarASeccion("evaluacion_360");
        break;
      case "evento":
        alNavegarASeccion("eventos");
        break;
      case "general":
        alNavegarASeccion("resumen");
        break;
    }
  };

  const lista_filtrada =
    filtro === "pendientes"
      ? notificaciones.filter((n) => !n.leido)
      : notificaciones;

  const obtenerIconoTipo = (tipo: NotificacionItem["tipo"]) => {
    switch (tipo) {
      case "asistencia":
        return <Clock className="w-3.5 h-3.5 text-blue-600" />;
      case "pasajes":
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
      case "evaluacion":
        return <FileCheck className="w-3.5 h-3.5 text-emerald-600" />;
      case "evento":
        return <Calendar className="w-3.5 h-3.5 text-[#17B4C4]" />;
      default:
        return <Send className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div ref={ref_contenedor} className={cn("relative inline-block", className)}>
      {/* Botón Campana Interactivo con micro-animación al toque */}
      <motion.button
        type="button"
        onClick={() => set_abierto(!abierto)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 450, damping: 20 }}
        aria-label="Abrir centro de notificaciones"
        title="Notificaciones y avisos institucionales"
        className={cn(
          "relative w-9 h-9 rounded-xl border flex items-center justify-center transition-colors select-none",
          abierto
            ? "bg-[#063A6B] text-white border-[#063A6B] shadow-sm"
            : "border-[#E3DCCB] text-[#063A6B] bg-white hover:bg-[#F0F4F8] hover:border-[#17B4C4]/50"
        )}
      >
        <Bell className="w-4 h-4" />

        {/* Insignia de pulso vivo si hay pendientes */}
        {conteo_no_leidas > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#E2694B] text-white text-[9px] font-mono font-bold shadow-xs">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E2694B] opacity-40" />
            {conteo_no_leidas}
          </span>
        )}
      </motion.button>

      {/* Mini Diálogo Flotante — Estilo Globo de Idea / Pensamiento */}
      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.94 }}
            transition={{
              type: "spring",
              stiffness: 420,
              damping: 24,
            }}
            className="absolute right-0 mt-2.5 w-80 sm:w-96 z-50 rounded-2xl bg-white border border-[#E3DCCB] shadow-2xl shadow-[#063A6B]/15 overflow-hidden"
          >
            {/* Puntero triangular que forma el "globo de idea/diálogo" */}
            <div className="absolute -top-2 right-3 w-4 h-4 bg-white border-t border-l border-[#E3DCCB] rotate-45 z-10" />

            {/* Cabecera del Globo */}
            <div className="p-3.5 border-b border-[#E3DCCB]/70 bg-gradient-to-r from-slate-50 via-white to-blue-50/20 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#063A6B]/10 flex items-center justify-center text-[#063A6B] shrink-0">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#063A6B] leading-tight flex items-center gap-1.5">
                    <span>Notificaciones</span>
                    {conteo_no_leidas > 0 && (
                      <InsigniaPulsoVivo
                        color="coral"
                        tamaño="sm"
                        etiqueta={`${conteo_no_leidas} nuevas`}
                      />
                    )}
                  </h3>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Alertas reactivas en tiempo real
                  </p>
                </div>
              </div>

              {/* Botón Con Estado: Marcar todo leído */}
              {conteo_no_leidas > 0 && (
                <BotonConEstado
                  variante="contorno"
                  tamaño="sm"
                  alHacerClic={manejarMarcarTodoLeido}
                  texto_reposo="Leído todo"
                  texto_cargando="Guardando..."
                  texto_exito="Listo"
                  icono_reposo={CheckCheck}
                  disparar_confeti_al_exito={false}
                  className="h-7 text-[10px] px-2"
                />
              )}
            </div>

            {/* Filtros Píldora: Todas / Pendientes */}
            <div className="px-3 py-1.5 bg-slate-50/70 border-b border-[#E3DCCB]/50 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => set_filtro("todas")}
                className={cn(
                  "px-2.5 py-0.5 rounded-lg text-[10px] font-bold font-mono transition-all",
                  filtro === "todas"
                    ? "bg-[#063A6B] text-white shadow-2xs"
                    : "text-slate-600 hover:bg-slate-200/60"
                )}
              >
                Todas ({notificaciones.length})
              </button>
              <button
                type="button"
                onClick={() => set_filtro("pendientes")}
                className={cn(
                  "px-2.5 py-0.5 rounded-lg text-[10px] font-bold font-mono transition-all",
                  filtro === "pendientes"
                    ? "bg-[#063A6B] text-white shadow-2xs"
                    : "text-slate-600 hover:bg-slate-200/60"
                )}
              >
                No leídas ({conteo_no_leidas})
              </button>
            </div>

            {/* Lista de Notificaciones con Scroll Suave */}
            <div className="max-h-72 overflow-y-auto p-2 space-y-1.5 divide-y divide-slate-100">
              {lista_filtrada.length === 0 ? (
                <div className="py-8 px-4 text-center space-y-1.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <p className="text-xs font-bold text-[#063A6B]">
                    ¡Estás al día!
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    No tienes alertas pendientes en este momento.
                  </p>
                </div>
              ) : (
                lista_filtrada.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => manejarClicNotificacion(item)}
                    className={cn(
                      "p-2.5 rounded-xl cursor-pointer transition-all flex items-start gap-2.5 group pt-2",
                      item.leido
                        ? "hover:bg-slate-50 opacity-75"
                        : "bg-blue-50/30 border border-[#17B4C4]/20 hover:bg-blue-50/50 shadow-2xs"
                    )}
                  >
                    {/* Icono temático */}
                    <div className="w-7 h-7 rounded-lg bg-white border border-[#E3DCCB]/60 shadow-2xs flex items-center justify-center shrink-0 mt-0.5">
                      {obtenerIconoTipo(item.tipo)}
                    </div>

                    {/* Contenido textual */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-[#063A6B] truncate">
                          {item.titulo}
                        </p>
                        <span className="text-[9px] font-mono text-muted-foreground shrink-0">
                          {item.tiempo}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug line-clamp-2 mt-0.5">
                        {item.mensaje}
                      </p>
                    </div>

                    {/* Indicador de no leído */}
                    {!item.leido && (
                      <span
                        title="Marcar como leída"
                        className="w-2 h-2 rounded-full bg-[#17B4C4] shrink-0 mt-1.5"
                      />
                    )}
                  </motion.div>
                ))
              )}
            </div>

            {/* Pie del Globo: enlace opcional para ver historial o cerrar */}
            {alAbrirHistorialCompleto && (
              <div className="p-2 border-t border-[#E3DCCB]/70 bg-slate-50/60 text-center">
                <button
                  type="button"
                  onClick={() => {
                    set_abierto(false);
                    alAbrirHistorialCompleto();
                  }}
                  className="text-[11px] font-bold text-[#063A6B] hover:text-[#17B4C4] transition-colors inline-flex items-center gap-1"
                >
                  <span>Ver historial completo de alertas</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
