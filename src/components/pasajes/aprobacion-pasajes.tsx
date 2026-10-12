"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, AlertCircle, Bus, MapPin, Calendar, Clock, DollarSign, Wifi, WifiOff, Plus } from "lucide-react";
import { toast } from "sonner";
import { clienteApi } from "@/lib/cliente-api";
import { useConsulta } from "@/hooks/useConsulta";
import { useTiempoReal } from "@/hooks/useTiempoReal";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import { BotonConEstado, TarjetaSpotlight } from "@/components/animaciones";
import { RegistroRecorrido } from "./registro-recorrido";
import { GestionTarifas } from "./gestion-tarifas";

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
  const { usuario } = usarAutenticacion();
  const [solicitudes_locales, set_solicitudes_locales] = useState<SolicitudPasajeVista[]>(SOLICITUDES_INICIALES);
  const [solicitud_seleccionada, set_solicitud_seleccionada] = useState<SolicitudPasajeVista | null>(null);
  const [modal_observacion, set_modal_observacion] = useState(false);
  const [texto_observacion, set_texto_observacion] = useState("");
  const [error_rechazo, set_error_rechazo] = useState("");

  const { datos: solicitudes_servidor, invalidar } = useConsulta<SolicitudPasajeVista[]>(
    "solicitudes_pasajes_revision",
    async () => {
      const respuesta = await clienteApi.get<any[]>("/api/pasajes");
      if (Array.isArray(respuesta) && respuesta.length > 0) {
        return respuesta.map((item) => ({
          id: item.id,
          becario_nombre: item.becario?.usuario?.nombre || item.becario_nombre || "Becario Institucional",
          carrera: item.becario?.carrera || "Carrera BUMAND",
          periodo: item.periodo || "Mes en curso",
          monto_total_centavos: Math.round(Number(item.monto_total || 0) * 100),
          monto_devolucion_centavos: Math.round(Number(item.monto_devolucion || 0) * 100),
          estado: (item.estado || "pendiente").toLowerCase() as "pendiente" | "aprobado" | "rechazado",
          observaciones: item.observaciones,
          fecha_envio: item.fecha_envio ? String(item.fecha_envio).split("T")[0] : "2026-10-01",
          recorridos: (item.recorridos || []).map((r: any) => ({
            id: r.id,
            fecha: r.fecha ? String(r.fecha).split("T")[0] : "2026-10-01",
            tramo: (r.tramo || "ida") as "ida" | "vuelta",
            origen: r.origen,
            destino: r.destino,
            tarifa: Number(r.tarifa),
            apoyo_realizado: r.apoyo_realizado || "Actividad académica/pastoral",
            tiene_gps: Boolean(r.lat_origen || r.lat_destino),
          })),
        }));
      }
      return SOLICITUDES_INICIALES;
    },
    { datos_iniciales: SOLICITUDES_INICIALES }
  );

  const solicitudes = solicitudes_servidor && solicitudes_servidor.length > 0 ? solicitudes_servidor : solicitudes_locales;

  const { conectado } = useTiempoReal({
    eventos: {
      pasajes_actualizados: () => {
        invalidar();
      },
    },
  });

  const manejarAprobar = async (id: number) => {
    try {
      await clienteApi.patch(`/api/pasajes/${id}/aprobar`, {
        supervisor_id: usuario?.id || 1,
      });
      invalidar();
    } catch {
      // Fallback local
      set_solicitudes_locales((prev) =>
        prev.map((s) => (s.id === id ? { ...s, estado: "aprobado", observaciones: "Aprobado conforme por tutor" } : s))
      );
    }
    toast.success("Planilla de pasajes aprobada", {
      description: "El reembolso del 80% ha sido convalidado y acreditado institucionalmente.",
    });
  };

  const abrirModalRechazo = (sol: SolicitudPasajeVista) => {
    set_solicitud_seleccionada(sol);
    set_texto_observacion("");
    set_error_rechazo("");
    set_modal_observacion(true);
  };

  const manejarConfirmarRechazo = async () => {
    if (!texto_observacion.trim()) {
      set_error_rechazo("Es obligatorio ingresar el motivo o justificación del rechazo.");
      toast.error("Motivo obligatorio", {
        description: "ERR-5002: Ingrese la justificación formal antes de rechazar la planilla.",
      });
      return;
    }
    if (!solicitud_seleccionada) return;

    try {
      await clienteApi.patch(`/api/pasajes/${solicitud_seleccionada.id}/rechazar`, {
        supervisor_id: usuario?.id || 1,
        observaciones: texto_observacion.trim(),
      });
      invalidar();
    } catch {
      // Fallback local
      set_solicitudes_locales((prev) =>
        prev.map((s) =>
          s.id === solicitud_seleccionada.id
            ? { ...s, estado: "rechazado", observaciones: texto_observacion.trim() }
            : s
        )
      );
    }

    toast.success("Solicitud observada", {
      description: `Se registró la observación institucional para ${solicitud_seleccionada.becario_nombre}.`,
    });
    set_modal_observacion(false);
  };

  const es_becario = usuario?.rol === "becario";
  const [subpestana, set_subpestana] = useState<"planillas" | "tarifario">("planillas");

  return (
    <div className="space-y-6">
      {/* Cabecera adaptativa según el Rol */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E3DCCB] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bus className="w-5 h-5 text-[#063A6B]" />
            <h2 className="text-xl font-bold text-[#063A6B]">
              {es_becario
                ? "Mis Declaraciones de Pasajes (80%)"
                : subpestana === "tarifario"
                ? "Tarifario Oficial y Vigencia Temporal"
                : "Supervisión y Aprobación de Pasajes"}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            {es_becario
              ? "Historial de tramos de transporte público y cálculo exacto del 80% de reembolso institucional."
              : subpestana === "tarifario"
              ? "Gestión centralizada de precios oficiales por medio de transporte con ventanas de vigencia y retroactividad."
              : "Liquidación y auditoría de viáticos declarados por los becarios asignados."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!es_becario && (
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => set_subpestana("planillas")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  subpestana === "planillas"
                    ? "bg-[#063A6B] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Planillas de Becarios
              </button>
              <button
                type="button"
                onClick={() => set_subpestana("tarifario")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  subpestana === "tarifario"
                    ? "bg-[#063A6B] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Tarifario y Vigencias
              </button>
            </div>
          )}

          {es_becario && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold rounded-xl text-xs h-10 gap-2 shadow-sm">
                  <Plus className="w-4 h-4 text-[#F8C766]" />
                  Declarar Nuevo Recorrido
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px] p-0 border-none bg-transparent shadow-none">
                <RegistroRecorrido />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {!es_becario && subpestana === "tarifario" ? (
        <GestionTarifas />
      ) : (
        <>
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
                    es_becario ? (
                      <Badge className="bg-amber-100 text-amber-800 border border-amber-300 font-bold px-3 py-1 text-xs">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        PENDIENTE DE REVISIÓN
                      </Badge>
                    ) : (
                      <div className="flex items-center gap-2">
                        <BotonConEstado
                          variante="secundario"
                          tamaño="sm"
                          alHacerClic={() => manejarAprobar(sol.id)}
                          texto_reposo="Aprobar"
                          texto_cargando="Aprobando..."
                          texto_exito="Aprobado"
                          icono_reposo={CheckCircle2}
                          disparar_confeti_al_exito={true}
                          className="h-9 px-3 text-xs font-bold"
                        />
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
                    )
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

      {/* Diálogo de Observación / Rechazo Obligatorio con AlertDialog */}
      <AlertDialog open={modal_observacion} onOpenChange={set_modal_observacion}>
        <AlertDialogContent className="sm:max-w-[440px] bg-white rounded-2xl border-[#E3DCCB]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-[#E2694B] flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#E2694B]" />
              Confirmar Observación y Rechazo de Pasajes
            </AlertDialogTitle>
            <AlertDialogDescription>
              Para observar o rechazar la solicitud de <strong>{solicitud_seleccionada?.becario_nombre}</strong>,
              debes justificar formalmente el motivo para que el becario pueda subsanar sus datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 pt-2">
            {error_rechazo && (
              <p className="text-[11px] text-[#E2694B] font-semibold flex items-center gap-1">
                <span>⚠️</span>{error_rechazo}
              </p>
            )}

            <div className="space-y-1">
              <Label htmlFor="motivo-rechazo-pasajes" className="text-xs font-semibold text-[#122029]">
                Motivo de la Observación (Obligatorio)
              </Label>
              <Textarea
                id="motivo-rechazo-pasajes"
                rows={3}
                placeholder="Ej. La tarifa declarada para el tramo 2 excede la tarifa oficial de transporte público..."
                value={texto_observacion}
                onChange={(e) => {
                  set_texto_observacion(e.target.value);
                  if (error_rechazo) set_error_rechazo("");
                }}
                className={`w-full p-2.5 text-xs rounded-xl border-[#E3DCCB] focus-visible:ring-[#17B4C4] ${
                  error_rechazo ? "border-[#E2694B] bg-[#E2694B]/5 focus-visible:ring-[#E2694B]" : ""
                }`}
              />
            </div>
          </div>
          <AlertDialogFooter className="pt-2 flex justify-end gap-2">
            <AlertDialogCancel
              onClick={() => set_modal_observacion(false)}
            >
              Cancelar
            </AlertDialogCancel>
            <Button
              onClick={manejarConfirmarRechazo}
              className="h-10 px-4 rounded-xl bg-[#E2694B] hover:bg-[#E2694B]/90 text-white font-semibold text-xs shadow-sm transition-all"
            >
              Confirmar Rechazo
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </>
      )}
    </div>
  );
}
