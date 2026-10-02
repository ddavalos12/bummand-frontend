"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, Clock, AlertTriangle, FileCheck, Send, CheckCheck } from "lucide-react";

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

  const marcarTodasComoLeidas = () => {
    set_notificaciones((prev) => prev.map((n) => ({ ...n, leido: true })));
  };

  return (
    <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-xl">
      <CardHeader className="pb-3 border-b border-[#E3DCCB]/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#063A6B]/5 rounded-xl text-[#063A6B]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold font-display text-[#063A6B]">
                Centro de Notificaciones y Alertas Push
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Comunicaciones automáticas sincronizadas con la app móvil (FCM)
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {no_leidas > 0 && (
              <Badge className="bg-[#E2694B] text-white font-mono text-xs px-2.5 py-0.5">
                {no_leidas} pendientes
              </Badge>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={marcarTodasComoLeidas}
              className="h-9 px-3 border-[#E3DCCB] text-[#063A6B] text-xs font-bold rounded-lg flex items-center gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Marcar todo leído
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {notificaciones.length === 0 ? (
          <p className="text-center py-8 text-xs text-muted-foreground">
            No tienes notificaciones registradas.
          </p>
        ) : (
          notificaciones.map((n) => (
            <div
              key={n.id}
              className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                n.leido
                  ? "bg-slate-50/50 border-[#E3DCCB]/40 opacity-75"
                  : "bg-white border-[#17B4C4]/50 shadow-sm"
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
                  <span className="text-[10px] font-mono text-muted-foreground">{n.tiempo}</span>
                </div>
              </div>

              {!n.leido && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => marcarComoLeida(n.id)}
                  className="h-8 px-2 text-xs text-[#063A6B] hover:bg-[#17B4C4]/10 shrink-0"
                >
                  <Check className="w-3.5 h-3.5 mr-1 text-[#17B4C4]" />
                  Leído
                </Button>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
