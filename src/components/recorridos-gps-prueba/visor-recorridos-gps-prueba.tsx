"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Compass,
  Fingerprint,
  Hash,
  MapPin,
  Radio,
  RefreshCw,
  Route,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTiempoReal } from "@/hooks/use-tiempo-real";
import {
  AlertaAntifraudeGps,
  eliminarRecorridoGpsPrueba,
  listarRecorridosGpsPrueba,
  PuntoGpsPrueba,
  RecorridoGpsPruebaRegistro,
} from "@/servicios/recorridos-gps-prueba.servicio";
import { LogoGpsCpp } from "./logo-gps-cpp";
import { MapaRecorridoLeaflet } from "./mapa-recorrido-leaflet";
import {
  calcularTramosRecorrido,
  formatearDistanciaMetros,
  formatearDuracionSegundos,
  formatearFechaHoraCorta,
  formatearHoraCorta,
  obtenerResumenDispositivo,
  obtenerVelocidadPuntoKmh,
} from "./utilidades-gps-prueba";

function normalizarPuntos(crudo: unknown): PuntoGpsPrueba[] {
  if (Array.isArray(crudo)) {
    return crudo;
  }
  if (typeof crudo === "string") {
    try {
      const parseado = JSON.parse(crudo);
      return Array.isArray(parseado) ? parseado : [];
    } catch {
      return [];
    }
  }
  return [];
}

function normalizarAlertas(crudo: unknown): AlertaAntifraudeGps[] {
  if (Array.isArray(crudo)) {
    return crudo;
  }
  if (typeof crudo === "string") {
    try {
      const parseado = JSON.parse(crudo);
      return Array.isArray(parseado) ? parseado : [];
    } catch {
      return [];
    }
  }
  return [];
}

function formatearOffsetZonaHoraria(offset_min: number): string {
  if (!Number.isFinite(offset_min)) return "UTC";
  const signo = offset_min >= 0 ? "+" : "-";
  const abs = Math.abs(offset_min);
  const horas = Math.floor(abs / 60);
  const mins = abs % 60;
  return mins > 0
    ? `UTC${signo}${String(horas).padStart(2, "0")}:${String(mins).padStart(2, "0")}`
    : `UTC${signo}${horas}`;
}

export function VisorRecorridosGpsPrueba() {
  const [recorridos, set_recorridos] = useState<RecorridoGpsPruebaRegistro[]>([]);
  const [cargando, set_cargando] = useState<boolean>(true);
  const [actualizando, set_actualizando] = useState<boolean>(false);
  const [recorrido_seleccionado_id, set_recorrido_seleccionado_id] = useState<number | null>(null);
  const [tramo_seleccionado_indice, set_tramo_seleccionado_indice] = useState<number | null>(null);
  const [punto_seleccionado_secuencia, set_punto_seleccionado_secuencia] = useState<number | null>(
    null
  );
  const [pestana_detalle, set_pestana_detalle] = useState<"tramos" | "puntos">("tramos");
  const [recorrido_a_eliminar, set_recorrido_a_eliminar] =
    useState<RecorridoGpsPruebaRegistro | null>(null);
  const [eliminando, set_eliminando] = useState<boolean>(false);

  const cargarRecorridos = useCallback(async (silencioso = false) => {
    if (silencioso) {
      set_actualizando(true);
    } else {
      set_cargando(true);
    }
    try {
      const lista = await listarRecorridosGpsPrueba();
      const ordenados = [...(Array.isArray(lista) ? lista : [])].sort(
        (a, b) => Date.parse(b.creado_en) - Date.parse(a.creado_en)
      );
      set_recorridos(ordenados);
      set_recorrido_seleccionado_id((actual) => {
        if (actual !== null && ordenados.some((r) => r.id === actual)) {
          return actual;
        }
        return ordenados.length > 0 ? ordenados[0].id : null;
      });
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : "No se pudieron cargar los recorridos GPS.";
      toast.error("Error al consultar recorridos GPS", { description: mensaje });
    } finally {
      set_cargando(false);
      set_actualizando(false);
    }
  }, []);

  useEffect(() => {
    cargarRecorridos(false);
  }, [cargarRecorridos]);

  const { conectado } = useTiempoReal({
    eventos: {
      recorrido_gps_prueba_actualizado: () => {
        cargarRecorridos(true);
        toast.info("Nuevo recorrido GPS C++ sincronizado");
      },
    },
  });

  const recorrido_activo = useMemo(() => {
    if (recorridos.length === 0) return null;
    return recorridos.find((r) => r.id === recorrido_seleccionado_id) || recorridos[0];
  }, [recorridos, recorrido_seleccionado_id]);

  const puntos_activos = useMemo(
    () => (recorrido_activo ? normalizarPuntos(recorrido_activo.puntos_json) : []),
    [recorrido_activo]
  );

  const alertas_activas = useMemo(
    () => (recorrido_activo ? normalizarAlertas(recorrido_activo.alertas_antifraude_json) : []),
    [recorrido_activo]
  );

  const tramos_activos = useMemo(
    () => calcularTramosRecorrido(puntos_activos),
    [puntos_activos]
  );

  const kpis = useMemo(() => {
    const total_pruebas = recorridos.length;
    const total_puntos = recorridos.reduce((acc, r) => acc + Number(r.total_puntos || 0), 0);
    const distancia_acumulada_m = recorridos.reduce(
      (acc, r) => acc + Number(r.distancia_total_metros || 0),
      0
    );
    const duracion_acumulada_seg = recorridos.reduce(
      (acc, r) => acc + Number(r.duracion_monotonica_seg || 0),
      0
    );
    const verificados_sha256 = recorridos.filter((r) => r.integridad_verificada).length;
    const con_alertas = recorridos.filter((r) => r.tiene_alerta_fraude).length;

    return {
      total_pruebas,
      total_puntos,
      distancia_acumulada_m,
      duracion_acumulada_seg,
      verificados_sha256,
      con_alertas,
    };
  }, [recorridos]);

  const seleccionarRecorrido = (id: number) => {
    set_recorrido_seleccionado_id(id);
    set_tramo_seleccionado_indice(null);
    set_punto_seleccionado_secuencia(null);
  };

  const confirmarEliminacion = async () => {
    if (!recorrido_a_eliminar) return;
    set_eliminando(true);
    try {
      await eliminarRecorridoGpsPrueba(recorrido_a_eliminar.id);
      toast.success("Recorrido eliminado", {
        description: `Se eliminó la prueba "${recorrido_a_eliminar.etiqueta_prueba}".`,
      });
      set_recorrido_a_eliminar(null);
      await cargarRecorridos(true);
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : "No se pudo eliminar el recorrido.";
      toast.error("Error al eliminar recorrido", { description: mensaje });
    } finally {
      set_eliminando(false);
    }
  };

  return (
    <div className="space-y-6 font-poppins text-[#1A1A1A]">
      {/* Encabezado del Laboratorio */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <LogoGpsCpp variante="insignia" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-lg sm:text-xl font-bold text-[#035683] tracking-tight truncate">
                Recorridos GPS C++ · Laboratorio de Pruebas
              </h2>
              <Badge className="bg-[#FFB600]/20 text-[#035683] border border-[#FFB600] text-[10px] font-bold rounded-xl">
                Temporal · Prueba Offline/Online
              </Badge>
            </div>
            <p className="text-xs text-[#808080] mt-1">
              Auditoría geodésica por tramos, reloj monótono anti-manipulación e integridad SHA-256 del motor móvil nativo.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-mono font-semibold ${
              conectado
                ? "bg-[#16A34A]/10 border-[#16A34A]/30 text-[#16A34A]"
                : "bg-[#F8FAFC] border-[#E5E7EB] text-[#808080]"
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${conectado ? "animate-pulse" : ""}`} />
            <span>{conectado ? "WS En Vivo" : "WS Desconectado"}</span>
          </span>

          <Button
            type="button"
            size="sm"
            onClick={() => cargarRecorridos(true)}
            disabled={actualizando}
            className="h-9 px-3.5 rounded-xl bg-[#035683] hover:bg-[#007BBE] text-white font-semibold text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${actualizando ? "animate-spin" : ""}`} />
            <span>Actualizar</span>
          </Button>
        </div>
      </div>

      {/* 4 KPIs Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-[#E5E7EB] bg-white py-4">
          <CardContent className="px-5 pb-0 flex items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#808080]">
                Total de Pruebas
              </span>
              <p className="font-display text-2xl font-bold text-[#035683] mt-1">
                {kpis.total_pruebas}
              </p>
              <span className="text-[11px] text-[#808080]">
                Sesiones recibidas del motor C++
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#007BBE]/10 text-[#007BBE] flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[#E5E7EB] bg-white py-4">
          <CardContent className="px-5 pb-0 flex items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#808080]">
                Puntos Capturados
              </span>
              <p className="font-display text-2xl font-bold text-[#00808E] mt-1">
                {kpis.total_puntos}
              </p>
              <span className="text-[11px] text-[#808080]">
                {recorrido_activo
                  ? `Activo: ${puntos_activos.length} puntos`
                  : "Sin sesión seleccionada"}
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#00ABBD]/15 text-[#00808E] flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[#E5E7EB] bg-white py-4">
          <CardContent className="px-5 pb-0 flex items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#808080]">
                Distancia y Duración Monótona
              </span>
              <p className="font-display text-2xl font-bold text-[#035683] mt-1">
                {recorrido_activo
                  ? formatearDistanciaMetros(recorrido_activo.distancia_total_metros)
                  : formatearDistanciaMetros(kpis.distancia_acumulada_m)}
              </p>
              <span className="text-[11px] text-[#808080] font-mono">
                {recorrido_activo
                  ? `Monótono: ${formatearDuracionSegundos(recorrido_activo.duracion_monotonica_seg)}`
                  : `Total: ${formatearDuracionSegundos(kpis.duracion_acumulada_seg)}`}
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#FFB600]/20 text-[#035683] flex items-center justify-center shrink-0">
              <Route className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[#E5E7EB] bg-white py-4">
          <CardContent className="px-5 pb-0 flex items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#808080]">
                Integridad Anti-Fraude
              </span>
              <p className="font-display text-2xl font-bold text-[#16A34A] mt-1">
                {kpis.verificados_sha256}/{kpis.total_pruebas}
              </p>
              <span
                className={`text-[11px] font-semibold ${
                  kpis.con_alertas > 0 ? "text-[#EF4444]" : "text-[#16A34A]"
                }`}
              >
                {kpis.con_alertas > 0
                  ? `${kpis.con_alertas} con alertas detectadas`
                  : "Sin anomalías registradas"}
              </span>
            </div>
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                kpis.con_alertas > 0
                  ? "bg-[#EF4444]/10 text-[#EF4444]"
                  : "bg-[#16A34A]/10 text-[#16A34A]"
              }`}
            >
              {kpis.con_alertas > 0 ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid Principal 12 Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda (4 cols): Lista de Recorridos */}
        <Card className="lg:col-span-4 rounded-2xl border-[#E5E7EB] bg-white">
          <CardHeader className="border-b border-[#E5E7EB] pb-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="font-display text-sm font-bold text-[#035683]">
                Recorridos Recibidos ({recorridos.length})
              </CardTitle>
              <Badge
                variant="outline"
                className="text-[10px] font-mono border-[#00ABBD]/40 text-[#00808E] rounded-lg"
              >
                Orden reciente
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-3 space-y-2.5 max-h-[780px] overflow-y-auto">
            {cargando ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-[#808080]">
                <Compass className="w-7 h-7 text-[#00ABBD] animate-spin" />
                <span className="text-xs">Cargando sesiones de prueba...</span>
              </div>
            ) : recorridos.length === 0 ? (
              <div className="py-10 px-4 text-center rounded-xl border border-dashed border-[#E5E7EB] bg-[#F8FAFC] space-y-2">
                <MapPin className="w-7 h-7 text-[#00ABBD] mx-auto" />
                <p className="text-xs font-bold text-[#035683]">
                  Aún no hay recorridos de prueba
                </p>
                <p className="text-[11px] text-[#808080]">
                  Inicia una grabación desde el módulo móvil GPS C++ y sincronízala para auditarla aquí.
                </p>
              </div>
            ) : (
              recorridos.map((rec) => {
                const activo = recorrido_activo?.id === rec.id;
                return (
                  <div
                    key={rec.id}
                    onClick={() => seleccionarRecorrido(rec.id)}
                    className={`group rounded-xl border p-3.5 transition-all cursor-pointer space-y-2.5 ${
                      activo
                        ? "border-[#007BBE] bg-[#007BBE]/5 shadow-xs ring-1 ring-[#007BBE]/30"
                        : "border-[#E5E7EB] bg-white hover:border-[#00ABBD] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-display text-xs font-bold text-[#035683] truncate">
                          {rec.etiqueta_prueba || `Prueba #${rec.id}`}
                        </p>
                        <p className="text-[10px] font-mono text-[#808080] truncate mt-0.5">
                          UUID: {rec.uuid_sesion}
                        </p>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          set_recorrido_a_eliminar(rec);
                        }}
                        className="h-7 w-7 p-0 rounded-lg text-[#808080] hover:text-[#EF4444] hover:bg-[#EF4444]/10 shrink-0"
                        title="Eliminar recorrido de prueba"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {rec.integridad_verificada ? (
                        <Badge className="bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/30 text-[10px] rounded-lg">
                          SHA-256 OK
                        </Badge>
                      ) : (
                        <Badge className="bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 text-[10px] rounded-lg">
                          Hash Inválido
                        </Badge>
                      )}

                      {rec.tiene_alerta_fraude ? (
                        <Badge className="bg-[#EF4444] text-white text-[10px] rounded-lg">
                          Alerta Fraude
                        </Badge>
                      ) : (
                        <Badge className="bg-[#00ABBD]/15 text-[#00808E] text-[10px] rounded-lg">
                          Limpio
                        </Badge>
                      )}

                      <Badge
                        variant="outline"
                        className="text-[10px] font-mono border-[#E5E7EB] text-[#1A1A1A] rounded-lg"
                      >
                        Cada {rec.intervalo_minutos}m
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E5E7EB]/80 text-[11px]">
                      <div>
                        <span className="text-[#808080] block text-[10px]">Puntos</span>
                        <span className="font-bold text-[#035683]">{rec.total_puntos}</span>
                      </div>
                      <div>
                        <span className="text-[#808080] block text-[10px]">Distancia</span>
                        <span className="font-bold text-[#007BBE]">
                          {formatearDistanciaMetros(rec.distancia_total_metros)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#808080] block text-[10px]">Duración</span>
                        <span className="font-bold text-[#1A1A1A]">
                          {formatearDuracionSegundos(rec.duracion_monotonica_seg)}
                        </span>
                      </div>
                    </div>

                    <div className="text-[10px] font-mono text-[#808080] flex items-center justify-between">
                      <span>{formatearFechaHoraCorta(rec.hora_inicio_dispositivo)}</span>
                      <span className="uppercase font-semibold text-[#00808E]">{rec.estado}</span>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Columna Derecha (8 cols): Mapa + Auditoría Anti-Fraude + Desglose */}
        <div className="lg:col-span-8 space-y-6">
          {!recorrido_activo ? (
            <Card className="rounded-2xl border-[#E5E7EB] bg-white py-12">
              <CardContent className="flex flex-col items-center justify-center text-center gap-2 text-[#808080]">
                <Compass className="w-10 h-10 text-[#00ABBD]" />
                <p className="text-sm font-bold text-[#035683]">
                  Selecciona un recorrido para inspeccionar el trazado GPS
                </p>
                <p className="text-xs max-w-md">
                  Visualiza cada pedazo del trayecto en mapa interactivo, verifica la firma SHA-256 y audita alertas de ubicación simulada.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Mapa Interactivo por Pedazos */}
              <Card className="rounded-2xl border-[#E5E7EB] bg-white overflow-hidden">
                <CardHeader className="border-b border-[#E5E7EB] pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <CardTitle className="font-display text-base font-bold text-[#035683]">
                        {recorrido_activo.etiqueta_prueba}
                      </CardTitle>
                      <p className="text-[11px] text-[#808080] flex items-center gap-1.5 mt-0.5">
                        <Smartphone className="w-3.5 h-3.5 text-[#00ABBD]" />
                        <span>{obtenerResumenDispositivo(recorrido_activo.dispositivo_info)}</span>
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {(tramo_seleccionado_indice !== null ||
                        punto_seleccionado_secuencia !== null) && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            set_tramo_seleccionado_indice(null);
                            set_punto_seleccionado_secuencia(null);
                          }}
                          className="h-7 px-2.5 rounded-xl border-[#E5E7EB] text-[11px] text-[#035683]"
                        >
                          Limpiar selección
                        </Button>
                      )}
                      <Badge className="bg-[#035683] text-white text-[11px] font-mono rounded-xl">
                        {puntos_activos.length} pts · {tramos_activos.length} tramos
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <MapaRecorridoLeaflet
                    puntos={puntos_activos}
                    tramo_seleccionado_indice={tramo_seleccionado_indice}
                    punto_seleccionado_secuencia={punto_seleccionado_secuencia}
                    alSeleccionarTramo={set_tramo_seleccionado_indice}
                    alSeleccionarPunto={set_punto_seleccionado_secuencia}
                  />
                </CardContent>
              </Card>

              {/* Auditoría Anti-Fraude y Tiempos */}
              <Card className="rounded-2xl border-[#E5E7EB] bg-white">
                <CardHeader className="border-b border-[#E5E7EB] pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="font-display text-sm font-bold text-[#035683] flex items-center gap-2">
                      <Fingerprint className="w-4 h-4 text-[#00ABBD]" />
                      <span>Auditoría Anti-Fraude, Relojes e Integridad SHA-256</span>
                    </CardTitle>
                    {recorrido_activo.tiene_alerta_fraude ? (
                      <Badge className="bg-[#EF4444] text-white text-[11px] rounded-xl flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{alertas_activas.length} alerta(s) detectada(s)</span>
                      </Badge>
                    ) : (
                      <Badge className="bg-[#16A34A]/15 text-[#16A34A] border border-[#16A34A]/30 text-[11px] rounded-xl flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Telemetría íntegra</span>
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-[#035683]">
                        <Clock className="w-3.5 h-3.5 text-[#00ABBD]" />
                        <span>Comparativa Temporal y Reloj Monótono</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#808080]">Inicio dispositivo:</span>
                        <span className="font-mono">
                          {formatearFechaHoraCorta(recorrido_activo.hora_inicio_dispositivo)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#808080]">Inicio satelital GPS:</span>
                        <span className="font-mono">
                          {formatearFechaHoraCorta(recorrido_activo.hora_inicio_gps)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#808080]">Recepción servidor:</span>
                        <span className="font-mono">
                          {formatearFechaHoraCorta(recorrido_activo.hora_recepcion_servidor)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-dashed border-[#E5E7EB]">
                        <span className="text-[#808080]">Duración monótona / Zona:</span>
                        <span className="font-mono font-bold text-[#035683]">
                          {formatearDuracionSegundos(recorrido_activo.duracion_monotonica_seg)} ·{" "}
                          {formatearOffsetZonaHoraria(recorrido_activo.zona_horaria_offset_min)}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-[#035683]">
                        <Hash className="w-3.5 h-3.5 text-[#007BBE]" />
                        <span>Firma Criptográfica SHA-256</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#808080]">Validación servidor:</span>
                        {recorrido_activo.integridad_verificada ? (
                          <span className="font-bold text-[#16A34A]">Verificada</span>
                        ) : (
                          <span className="font-bold text-[#EF4444]">No coincide</span>
                        )}
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-[#E5E7EB] font-mono text-[10px] break-all text-[#1A1A1A]">
                        {recorrido_activo.hash_integridad_cliente || "Sin hash registrado"}
                      </div>
                      <div className="text-[11px] text-[#808080]">
                        Intervalo configurado:{" "}
                        <strong className="text-[#035683]">
                          {recorrido_activo.intervalo_minutos} min
                        </strong>
                      </div>
                    </div>
                  </div>

                  {alertas_activas.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-[#EF4444]">
                        Hallazgos Anti-Fraude ({alertas_activas.length})
                      </p>
                      <div className="space-y-1.5">
                        {alertas_activas.map((alerta, idx) => (
                          <div
                            key={`${alerta.tipo}_${idx}`}
                            className="p-2.5 rounded-xl bg-[#EF4444]/5 border border-[#EF4444]/30 flex items-start justify-between gap-3 text-xs"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#EF4444]">{alerta.tipo}</span>
                                {alerta.secuencia_punto !== null &&
                                  alerta.secuencia_punto !== undefined && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] border-[#EF4444]/40 text-[#EF4444] rounded-lg"
                                    >
                                      Punto #{alerta.secuencia_punto}
                                    </Badge>
                                  )}
                              </div>
                              <p className="text-[#1A1A1A] text-[11px]">{alerta.descripcion}</p>
                            </div>
                            <Badge className="bg-[#EF4444] text-white text-[10px] uppercase rounded-lg shrink-0">
                              {alerta.severidad || "alta"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Desglose Interactivo por Pedazos/Tramos y Puntos */}
              <Card className="rounded-2xl border-[#E5E7EB] bg-white">
                <CardHeader className="border-b border-[#E5E7EB] pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="font-display text-sm font-bold text-[#035683]">
                      Desglose Interactivo del Recorrido
                    </CardTitle>
                    <div className="flex items-center p-1 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
                      <Button
                        type="button"
                        size="sm"
                        variant={pestana_detalle === "tramos" ? "default" : "ghost"}
                        onClick={() => set_pestana_detalle("tramos")}
                        className={`h-7 px-3 text-[11px] rounded-lg font-semibold ${
                          pestana_detalle === "tramos"
                            ? "bg-[#035683] text-white"
                            : "text-[#035683]"
                        }`}
                      >
                        Por Tramos / Pedazos ({tramos_activos.length})
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={pestana_detalle === "puntos" ? "default" : "ghost"}
                        onClick={() => set_pestana_detalle("puntos")}
                        className={`h-7 px-3 text-[11px] rounded-lg font-semibold ${
                          pestana_detalle === "puntos"
                            ? "bg-[#035683] text-white"
                            : "text-[#035683]"
                        }`}
                      >
                        Por Puntos GPS ({puntos_activos.length})
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4">
                  {pestana_detalle === "tramos" ? (
                    tramos_activos.length === 0 ? (
                      <div className="py-8 text-center text-xs text-[#808080]">
                        Se requieren al menos 2 puntos para conformar tramos individuales.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                        {tramos_activos.map((tramo) => {
                          const seleccionado = tramo_seleccionado_indice === tramo.indice;
                          return (
                            <button
                              key={tramo.indice}
                              type="button"
                              onClick={() => {
                                set_punto_seleccionado_secuencia(null);
                                set_tramo_seleccionado_indice(
                                  seleccionado ? null : tramo.indice
                                );
                              }}
                              className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer ${
                                seleccionado
                                  ? "border-[#FFB600] bg-[#FFB600]/10 ring-1 ring-[#FFB600]"
                                  : "border-[#E5E7EB] bg-[#F8FAFC] hover:border-[#00ABBD]"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={`w-7 h-7 rounded-xl text-white font-bold text-[11px] flex items-center justify-center shrink-0 ${
                                    tramo.es_velocidad_anomala
                                      ? "bg-[#EF4444]"
                                      : seleccionado
                                      ? "bg-[#FFB600] text-[#1A1A1A]"
                                      : tramo.indice % 2 === 0
                                      ? "bg-[#007BBE]"
                                      : "bg-[#00ABBD]"
                                  }`}
                                >
                                  T{tramo.indice + 1}
                                </span>
                                <div>
                                  <p className="text-xs font-bold text-[#035683]">
                                    Punto #{tramo.punto_origen.secuencia} &rarr; Punto #
                                    {tramo.punto_destino.secuencia}
                                  </p>
                                  <p className="text-[11px] font-mono text-[#808080]">
                                    {formatearHoraCorta(tramo.punto_origen.hora_dispositivo)} &rarr;{" "}
                                    {formatearHoraCorta(tramo.punto_destino.hora_dispositivo)} (
                                    {formatearDuracionSegundos(tramo.delta_monotonico_seg)})
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                                <Badge
                                  variant="outline"
                                  className="font-mono border-[#E5E7EB] bg-white text-[#035683] rounded-lg"
                                >
                                  {formatearDistanciaMetros(tramo.distancia_metros)}
                                </Badge>
                                <Badge
                                  className={`font-mono rounded-lg ${
                                    tramo.es_velocidad_anomala
                                      ? "bg-[#EF4444] text-white"
                                      : "bg-[#00808E]/15 text-[#00808E]"
                                  }`}
                                >
                                  {tramo.velocidad_kmh.toFixed(1)} km/h
                                </Badge>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )
                  ) : puntos_activos.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#808080]">
                      No existen puntos registrados en esta sesión.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                      {puntos_activos.map((punto) => {
                        const seleccionado = punto_seleccionado_secuencia === punto.secuencia;
                        const vel_kmh = obtenerVelocidadPuntoKmh(punto);
                        return (
                          <button
                            key={punto.secuencia}
                            type="button"
                            onClick={() => {
                              set_tramo_seleccionado_indice(null);
                              set_punto_seleccionado_secuencia(
                                seleccionado ? null : punto.secuencia
                              );
                            }}
                            className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer ${
                              seleccionado
                                ? "border-[#FFB600] bg-[#FFB600]/10 ring-1 ring-[#FFB600]"
                                : "border-[#E5E7EB] bg-[#F8FAFC] hover:border-[#00ABBD]"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span
                                className={`w-7 h-7 rounded-full text-white font-bold text-[11px] flex items-center justify-center shrink-0 ${
                                  punto.es_ubicacion_simulada ? "bg-[#EF4444]" : "bg-[#035683]"
                                }`}
                              >
                                #{punto.secuencia}
                              </span>
                              <div className="min-w-0">
                                <p className="text-xs font-mono font-bold text-[#035683] truncate">
                                  {Number(punto.latitud).toFixed(6)},{" "}
                                  {Number(punto.longitud).toFixed(6)}
                                </p>
                                <p className="text-[11px] text-[#808080] font-mono">
                                  Disp: {formatearHoraCorta(punto.hora_dispositivo)} · GPS:{" "}
                                  {formatearHoraCorta(punto.hora_gps)} · Monótono:{" "}
                                  {formatearDuracionSegundos(punto.tiempo_monotonico_seg)}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                              <Badge
                                variant="outline"
                                className="font-mono border-[#E5E7EB] bg-white text-[#1A1A1A] rounded-lg"
                              >
                                &plusmn;{Math.round(Number(punto.precision_metros ?? 0))}m
                              </Badge>
                              <Badge
                                variant="outline"
                                className="font-mono border-[#E5E7EB] bg-white text-[#007BBE] rounded-lg"
                              >
                                {vel_kmh.toFixed(1)} km/h
                              </Badge>
                              <Badge className="bg-[#00ABBD]/15 text-[#00808E] uppercase rounded-lg">
                                {punto.modo_captura || "offline"}
                              </Badge>
                              {punto.es_ubicacion_simulada && (
                                <Badge className="bg-[#EF4444] text-white rounded-lg">
                                  Simulado
                                </Badge>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Confirmación Institucional de Eliminación */}
      <AlertDialog
        open={Boolean(recorrido_a_eliminar)}
        onOpenChange={(abierto) => {
          if (!abierto && !eliminando) {
            set_recorrido_a_eliminar(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-[#EF4444]" />
              ¿Eliminar recorrido GPS de prueba?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará permanentemente la sesión{" "}
              <strong>{recorrido_a_eliminar?.etiqueta_prueba}</strong> (
              {recorrido_a_eliminar?.total_puntos} puntos capturados). Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={eliminando}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarEliminacion}
              disabled={eliminando}
              className="bg-[#EF4444] hover:bg-[#EF4444]/90 text-white font-bold"
            >
              {eliminando ? "Eliminando..." : "Eliminar prueba"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
