"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, AlertCircle, Bus, MapPin, Calendar, Clock, DollarSign } from "lucide-react";

interface RecorridoItem {
  id: number;
  fecha: string;
  tramo: "ida" | "vuelta";
  origen: string;
  destino: string;
  tarifa: number;
  apoyo_realizado: string;
  tiene_gps: boolean;
}

interface SolicitudPasajeVista {
  id: number;
  becario_nombre: string;
  carrera: string;
  periodo: string;
  monto_total_centavos: number;
  monto_devolucion_centavos: number;
  estado: "pendiente" | "aprobado" | "rechazado";
  observaciones?: string;
  fecha_envio: string;
  recorridos: RecorridoItem[];
}

const SOLICITUDES_INICIALES: SolicitudPasajeVista[] = [
  {
    id: 101,
    becario_nombre: "Nilda Amalia Churata Paye",
    carrera: "Educación Parvularia",
    periodo: "Septiembre 2026",
    monto_total_centavos: 34500, // Bs 345.00
    monto_devolucion_centavos: 27600, // 80% = Bs 276.00
    estado: "pendiente",
    fecha_envio: "2026-09-25",
    recorridos: [
      {
        id: 1,
        fecha: "2026-09-24",
        tramo: "ida",
        origen: "Zona 16 de Julio (El Alto)",
        destino: "Oficina Central Diaconía Bloque A",
        tarifa: 2.5,
        apoyo_realizado: "Revisión de carpetas parvularias",
        tiene_gps: true,
      },
      {
        id: 2,
        fecha: "2026-09-24",
        tramo: "vuelta",
        origen: "Oficina Central Diaconía Bloque A",
        destino: "Zona 16 de Julio (El Alto)",
        tarifa: 2.5,
        apoyo_realizado: "Retorno a domicilio",
        tiene_gps: true,
      },
      {
        id: 3,
        fecha: "2026-09-25",
        tramo: "ida",
        origen: "Zona 16 de Julio",
        destino: "Iglesia Central El Alto",
        tarifa: 3.0,
        apoyo_realizado: "Taller Escuela de Líderes",
        tiene_gps: true,
      },
    ],
  },
  {
    id: 102,
    becario_nombre: "Edgar Elias Alarcon Huanca",
    carrera: "Medicina",
    periodo: "Septiembre 2026",
    monto_total_centavos: 42000, // Bs 420.00
    monto_devolucion_centavos: 33600, // 80% = Bs 336.00
    estado: "pendiente",
    fecha_envio: "2026-09-26",
    recorridos: [
      {
        id: 4,
        fecha: "2026-09-25",
        tramo: "ida",
        origen: "Villa Adela",
        destino: "Sucursal Juan Pablo II",
        tarifa: 3.5,
        apoyo_realizado: "Apoyo en campaña de salud preventiva",
        tiene_gps: true,
      },
    ],
  },
];

export function AprobacionPasajes() {
  const [solicitudes, set_solicitudes] = useState<SolicitudPasajeVista[]>(SOLICITUDES_INICIALES);
  const [solicitud_seleccionada, set_solicitud_seleccionada] = useState<SolicitudPasajeVista | null>(null);
  const [modal_observacion, set_modal_observacion] = useState(false);
  const [texto_observacion, set_texto_observacion] = useState("");
  const [error_rechazo, set_error_rechazo] = useState("");

  const manejarAprobar = (id: number) => {
    set_solicitudes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, estado: "aprobado", observaciones: "Aprobado conforme por tutor" } : s))
    );
  };

  const abrirModalRechazo = (sol: SolicitudPasajeVista) => {
    set_solicitud_seleccionada(sol);
    set_texto_observacion("");
    set_error_rechazo("");
    set_modal_observacion(true);
  };

  const manejarConfirmarRechazo = () => {
    if (!texto_observacion.trim()) {
      set_error_rechazo("Es obligatorio ingresar el motivo o justificación del rechazo.");
      return;
    }
    if (!solicitud_seleccionada) return;

    set_solicitudes((prev) =>
      prev.map((s) =>
        s.id === solicitud_seleccionada.id
          ? { ...s, estado: "rechazado", observaciones: texto_observacion.trim() }
          : s
      )
    );
    set_modal_observacion(false);
  };

  return (
    <div className="space-y-6">
      {/* Alerta de Regla Institucional: Día 24 */}
      <div className="p-4 bg-[#063A6B]/5 rounded-xl border border-[#17B4C4]/30 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-[#17B4C4] shrink-0 mt-0.5" />
        <div className="text-xs text-[#1E293B] space-y-1">
          <p className="font-bold text-[#063A6B]">
            Regla de Liquidación: Devolución del 80% de Viáticos y Pasajes
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Conforme al reglamento institucional, los becarios declaran sus recorridos y el sistema calcula
            el 80% en centavos enteros exactos para evitar redondeos erróneos. El envío formal de la solicitud
            se habilita únicamente a partir del <strong className="text-[#063A6B]">día 24 de cada mes</strong>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {solicitudes.map((sol) => (
          <Card key={sol.id} className="border-[#E3DCCB] shadow-sm bg-white rounded-xl overflow-hidden">
            <CardHeader className="bg-slate-50/60 pb-3 border-b border-[#E3DCCB]/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-[#063A6B]">{sol.becario_nombre}</span>
                    <Badge variant="outline" className="border-[#E3DCCB] text-[#063A6B] text-[11px] font-medium">
                      {sol.carrera}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-[#17B4C4]" /> {sol.periodo}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" /> Enviado: {sol.fecha_envio}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[11px] uppercase font-mono text-muted-foreground font-bold">
                      Reembolso (80%)
                    </p>
                    <p className="text-lg font-bold font-display text-[#063A6B]">
                      Bs {(sol.monto_devolucion_centavos / 100).toFixed(2)}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      Total: Bs {(sol.monto_total_centavos / 100).toFixed(2)}
                    </p>
                  </div>

                  {sol.estado === "pendiente" ? (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => manejarAprobar(sol.id)}
                        className="h-9 px-3 bg-[#17B4C4] hover:bg-[#17B4C4]/90 text-[#063A6B] font-bold rounded-lg text-xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => abrirModalRechazo(sol)}
                        className="h-9 px-3 border-[#E2694B]/40 text-[#E2694B] hover:bg-[#E2694B]/10 font-bold rounded-lg text-xs flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        Observar
                      </Button>
                    </div>
                  ) : sol.estado === "aprobado" ? (
                    <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-3 py-1 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      APROBADO
                    </Badge>
                  ) : (
                    <Badge className="bg-rose-100 text-rose-800 border border-rose-300 font-bold px-3 py-1 text-xs">
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      OBSERVADO
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              <h5 className="text-xs font-bold text-[#063A6B] uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Bus className="w-3.5 h-3.5 text-[#17B4C4]" />
                Detalle de Tramos Declarados ({sol.recorridos.length})
              </h5>

              <div className="space-y-2">
                {sol.recorridos.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-lg bg-slate-50 border border-[#E3DCCB]/60 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`font-mono text-[10px] font-bold uppercase ${
                            r.tramo === "ida" ? "border-[#17B4C4] text-[#063A6B]" : "border-[#F8C766] text-amber-800"
                          }`}
                        >
                          {r.tramo}
                        </Badge>
                        <span className="font-semibold text-[#1E293B]">
                          {r.origen} &rarr; {r.destino}
                        </span>
                        {r.tiene_gps && (
                          <span className="flex items-center text-[10px] text-emerald-600 font-mono gap-0.5">
                            <MapPin className="w-3 h-3" /> GPS Verificado
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-[11px] italic">
                        Labor: {r.apoyo_realizado}
                      </p>
                    </div>

                    <div className="text-right font-mono font-bold text-[#063A6B] shrink-0">
                      Bs {r.tarifa.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {sol.observaciones && (
                <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <strong>Observación del Tutor:</strong> {sol.observaciones}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Diálogo de Observación / Rechazo Obligatorio */}
      <Dialog open={modal_observacion} onOpenChange={set_modal_observacion}>
        <DialogContent className="sm:max-w-[440px] bg-white rounded-2xl border-[#E3DCCB]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#063A6B] flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#E2694B]" />
              Observar Solicitud de Pasajes
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-xs text-muted-foreground">
              Para rechazar u observar la solicitud de <strong>{solicitud_seleccionada?.becario_nombre}</strong>,
              debes justificar formalmente el motivo para que el becario pueda corregir sus datos.
            </p>

            {error_rechazo && (
              <div className="p-2 rounded bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
                {error_rechazo}
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#122029]">
                Motivo de la Observación (Obligatorio)
              </Label>
              <textarea
                rows={3}
                placeholder="Ej. La tarifa declarada para el tramo 2 excede la tarifa oficial de transporte público..."
                value={texto_observacion}
                onChange={(e) => set_texto_observacion(e.target.value)}
                className="w-full p-2.5 text-xs rounded-lg border border-[#E3DCCB] focus:outline-none focus:ring-2 focus:ring-[#17B4C4]"
              />
            </div>
          </div>
          <DialogFooter className="pt-2 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => set_modal_observacion(false)}
              className="h-9 border-[#E3DCCB]"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={manejarConfirmarRechazo}
              className="h-9 bg-[#E2694B] hover:bg-[#E2694B]/90 text-white font-bold"
            >
              Confirmar Observación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
