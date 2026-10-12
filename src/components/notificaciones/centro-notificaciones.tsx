"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bell, Check, Clock, AlertTriangle, FileCheck, Send, CheckCheck } from "lucide-react";
import {
  BotonConEstado,
  ContadorRodilloAnimado,
  InsigniaPulsoVivo,
  TarjetaSpotlight,
} from "@/components/animaciones";

interface NotificacionVista {
  id: number;
  tipo: "asistencia" | "pasajes" | "evaluacion" | "general";
  titulo: string;
  mensaje: string;
  tiempo: string;
  leido: boolean;
}

const NOTIFICACIONES_INICIALES: NotificacionVista[] = [
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
    tipo: "evaluacion",
    titulo: "Formulario F-03 Completado",
    mensaje: "El Pastor de tu congregación ha subido la evaluación pastoral F-03 correspondiente al Semestre II.",
    tiempo: "Ayer",
    leido: true,
  },
  {
    id: 4,
    tipo: "general",
    titulo: "Habilitación de Declaración de Pasajes",
    mensaje: "El periodo del 24 al 30 de Septiembre está habilitado para el envío de formularios de pasajes.",
    tiempo: "Hace 3 días",
    leido: true,
  },
];

export function CentroNotificaciones() {
  const [notificaciones, set_notificaciones] = useState<NotificacionVista[]>(NOTIFICACIONES_INICIALES);

  const no_leidas = notificaciones.filter((n) => !n.leido).length;

  const marcarComoLeida = (id: number) => {
    set_notificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leido: true } : n))
    );
  };

  const manejarMarcarTodoLeido = async () => {
    await new Promise((resolver) => setTimeout(resolver, 650));
    set_notificaciones((prev) => prev.map((n) => ({ ...n, leido: true })));
  };

  return (
    <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-2xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-[#E3DCCB]/60 bg-gradient-to-r from-white via-slate-50/50 to-blue-50/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#063A6B]/5 rounded-2xl text-[#063A6B] border border-[#063A6B]/10">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold font-display text-[#063A6B]">
                  Centro de Notificaciones y Alertas Push
                </CardTitle>
                {no_leidas > 0 && (
                  <InsigniaPulsoVivo color="coral" tamaño="sm" etiqueta="En vivo" />
                )}
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Comunicaciones automáticas sincronizadas con la app móvil (FCM)
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {no_leidas > 0 && (
              <span className="text-xs font-mono font-bold text-[#E2694B] bg-[#E2694B]/10 px-2.5 py-1 rounded-xl flex items-center gap-1.5">
                <ContadorRodilloAnimado valor={no_leidas} />
                <span>pendientes</span>
              </span>
            )}
            <BotonConEstado
              variante="contorno"
              tamaño="sm"
              alHacerClic={manejarMarcarTodoLeido}
              texto_reposo="Marcar todo leído"
              texto_cargando="Actualizando..."
              texto_exito="Todo al día"
              icono_reposo={CheckCheck}
              disabled={no_leidas === 0}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-3">
        {notificaciones.length === 0 ? (
          <p className="text-center py-12 text-xs text-muted-foreground">
            No tienes notificaciones registradas.
          </p>
        ) : (
          <AnimatePresence>
            {notificaciones.map((n) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <TarjetaSpotlight
                  color_luz={n.leido ? "rgba(23, 180, 196, 0.08)" : "rgba(23, 180, 196, 0.22)"}
                  className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    n.leido
                      ? "bg-slate-50/40 border-[#E3DCCB]/40 opacity-75"
                      : "bg-white border-[#17B4C4]/50 shadow-xs"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        n.tipo === "asistencia"
                          ? "bg-blue-50 text-blue-600"
                          : n.tipo === "pasajes"
                          ? "bg-amber-50 text-amber-600"
                          : n.tipo === "evaluacion"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {n.tipo === "asistencia" ? (
                        <Clock className="w-4 h-4" />
                      ) : n.tipo === "pasajes" ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : n.tipo === "evaluacion" ? (
                        <FileCheck className="w-4 h-4" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#063A6B]">{n.titulo}</h4>
                        {!n.leido && (
                          <span className="w-2 h-2 rounded-full bg-[#17B4C4] animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{n.mensaje}</p>
                      <span className="text-[10px] font-mono text-muted-foreground block pt-0.5">
                        {n.tiempo}
                      </span>
                    </div>
                  </div>

                  {!n.leido && (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => marcarComoLeida(n.id)}
                      className="h-8 px-3 text-xs font-semibold text-[#063A6B] hover:bg-[#17B4C4]/15 rounded-xl border border-[#17B4C4]/30 shrink-0 flex items-center gap-1 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5 text-[#17B4C4]" />
                      <span>Leído</span>
                    </motion.button>
                  )}
                </TarjetaSpotlight>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}
