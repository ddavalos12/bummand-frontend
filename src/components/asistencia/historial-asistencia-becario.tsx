"use client";

import React, { useState } from "react";
import {
  Clock,
  CheckCircle2,
  Calendar,
  MapPin,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  FileCheck,
  Plus,
  Coins,
  Printer,
  Loader2,
  ClipboardCheck,
} from "lucide-react";
import { toast } from "sonner";
import { clienteApi } from "@/lib/cliente-api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TarjetaSpotlight,
  ContadorRodilloAnimado,
  BotonJuicy,
  InsigniaPulsoVivo,
} from "@/components/animaciones";
import { DialogoMarcacionAsistencia } from "./dialogo-marcacion-asistencia";
import {
  DialogoJustificarFalta,
  type IncidenciaAsistenciaInicial,
} from "./dialogo-justificar-falta";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";

interface RegistroJornadaBecario {
  id: number;
  fecha: string;
  dia_semana: string;
  tipo: "practicas" | "escuela_lideres" | "acciones_servicio" | "evento";
  hora_ingreso: string;
  hora_salida: string | null;
  horas_computadas: number;
  sede: string;
  distancia_m: number;
  estado: "acreditado" | "en_curso" | "convalidado" | "observado" | "falta";
  justificado?: boolean;
  motivo_observacion?: string;
}

const JORNADAS_INICIALES: RegistroJornadaBecario[] = [
  {
    id: 1,
    fecha: "2026-10-10",
    dia_semana: "Sábado",
    tipo: "practicas",
    hora_ingreso: "08:15",
    hora_salida: null,
    horas_computadas: 4.25,
    sede: "Oficina Central - Bloque A",
    distancia_m: 35,
    estado: "en_curso",
  },
  {
    id: 2,
    fecha: "2026-10-09",
    dia_semana: "Viernes",
    tipo: "escuela_lideres",
    hora_ingreso: "14:28",
    hora_salida: "16:45",
    horas_computadas: 2.28,
    sede: "Auditorio Central Diaconía",
    distancia_m: 22,
    estado: "acreditado",
  },
  {
    id: 3,
    fecha: "2026-10-08",
    dia_semana: "Jueves",
    tipo: "practicas",
    hora_ingreso: "08:00",
    hora_salida: "17:05",
    horas_computadas: 8.5,
    sede: "Oficina Central - Bloque A",
    distancia_m: 48,
    estado: "acreditado",
  },
  {
    id: 4,
    fecha: "2026-10-07",
    dia_semana: "Miércoles",
    tipo: "practicas",
    hora_ingreso: "08:05",
    hora_salida: "17:00",
    horas_computadas: 8.42,
    sede: "Oficina Central - Bloque A",
    distancia_m: 40,
    estado: "acreditado",
  },
  {
    id: 5,
    fecha: "2026-10-06",
    dia_semana: "Martes",
    tipo: "practicas",
    hora_ingreso: "08:30",
    hora_salida: "17:00",
    horas_computadas: 8.0,
    sede: "Oficina Central - Bloque A",
    distancia_m: 135,
    estado: "convalidado",
  },
  {
    id: 6,
    fecha: "2026-10-05",
    dia_semana: "Lunes",
    tipo: "practicas",
    hora_ingreso: "08:00",
    hora_salida: "17:15",
    horas_computadas: 8.75,
    sede: "Oficina Central - Bloque A",
    distancia_m: 30,
    estado: "acreditado",
  },
  {
    id: 7,
    fecha: "2026-10-02",
    dia_semana: "Viernes",
    tipo: "escuela_lideres",
    hora_ingreso: "--:--",
    hora_salida: null,
    horas_computadas: 0,
    sede: "Auditorio Central Diaconía",
    distancia_m: 0,
    estado: "falta",
    motivo_observacion: "Inasistencia a sesión formativa por cruce con examen universitario",
  },
  {
    id: 8,
    fecha: "2026-09-29",
    dia_semana: "Martes",
    tipo: "practicas",
    hora_ingreso: "09:20",
    hora_salida: "17:00",
    horas_computadas: 7.66,
    sede: "Oficina Central - Bloque A",
    distancia_m: 145,
    estado: "observado",
    motivo_observacion: "Retraso prolongado por corte de ruta en la autopista La Paz - El Alto",
  },
];

interface HistorialAsistenciaBecarioProps {
  alAbrirMarcacion?: () => void;
}

export function HistorialAsistenciaBecario({ alAbrirMarcacion }: HistorialAsistenciaBecarioProps) {
  const { usuario } = usarAutenticacion();
  const [dialogo_marcacion_abierto, set_dialogo_marcacion_abierto] = useState(false);
  const [descargando_pdf, set_descargando_pdf] = useState(false);
  const [jornadas, set_jornadas] = useState<RegistroJornadaBecario[]>(JORNADAS_INICIALES);
  const [dialogo_justificar_abierto, set_dialogo_justificar_abierto] = useState(false);
  const [incidencia_a_justificar, set_incidencia_a_justificar] = useState<IncidenciaAsistenciaInicial | null>(null);

  const abrirJustificacionParaJornada = (j: RegistroJornadaBecario) => {
    let tipo_incidencia: IncidenciaAsistenciaInicial["tipo_incidencia"] = "asistencia_practicas";
    if (j.tipo === "escuela_lideres") tipo_incidencia = "escuela_lideres";
    else if (j.tipo === "acciones_servicio" || j.tipo === "evento") tipo_incidencia = "asistencia_evento";

    set_incidencia_a_justificar({
      id: j.id,
      fecha: j.fecha,
      tipo_incidencia,
      hora: j.hora_ingreso,
      sede: j.sede,
      referencia_id: j.id,
      motivo_sugerido: j.motivo_observacion,
    });
    set_dialogo_justificar_abierto(true);
  };

  const manejarJustificacionCompletada = (jornada_id?: number) => {
    if (!jornada_id) return;
    set_jornadas((prev) =>
      prev.map((j) =>
        j.id === jornada_id
          ? { ...j, justificado: true, estado: "convalidado" }
          : j
      )
    );
  };

  const [mes_seleccionado, set_mes_seleccionado] = useState<string>("2026-10");

  const horas_por_mes = [
    { mes: "Octubre 2026", clave: "2026-10", horas: 38.5, meta: 36.0, dias: 10, estado: "cumplido" },
    { mes: "Septiembre 2026", clave: "2026-09", horas: 42.0, meta: 36.0, dias: 11, estado: "cumplido" },
    { mes: "Agosto 2026", clave: "2026-08", horas: 36.0, meta: 36.0, dias: 10, estado: "cumplido" },
  ];

  const mes_actual_datos = horas_por_mes.find((m) => m.clave === mes_seleccionado) || horas_por_mes[0];
  const horas_acumuladas = mes_actual_datos.horas;
  const horas_meta = mes_actual_datos.meta;
  const porcentaje_real_meta = Math.round((horas_acumuladas / horas_meta) * 100);
  const porcentaje_meta = Math.min(100, porcentaje_real_meta);

  const abrirDialogo = () => {
    if (alAbrirMarcacion) {
      alAbrirMarcacion();
    } else {
      set_dialogo_marcacion_abierto(true);
    }
  };

  const descargarAsistenciaMensualPdf = async () => {
    try {
      set_descargando_pdf(true);
      toast.info("Generando kárdex de asistencia mensual con Puppeteer en el servidor...", {
        description: `Periodo: ${mes_seleccionado}`,
      });
      const id_becario = usuario?.id || 1;
      const blob = await clienteApi.descargarBlob(
        `/pdf/asistencia-estudiante/${id_becario}?mes=${mes_seleccionado}`
      );
      const url = window.URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `Asistencia_Mensual_${mes_seleccionado}.pdf`;
      document.body.appendChild(enlace);
      enlace.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(enlace);
      toast.success("Kárdex de asistencia mensual descargado exitosamente");
    } catch (_error) {
      toast.error("Error al exportar la asistencia mensual en PDF con Puppeteer");
    } finally {
      set_descargando_pdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera Principal con Botón de Marcación Destacado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-[#035683]" />
            <h2 className="text-xl font-bold text-[#035683]">Mis Horas de Práctica y Asistencia</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Control de jornada diaria con geocercas satelitales WGS84 y registro mensual de horas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Select value={mes_seleccionado} onValueChange={(val) => val && set_mes_seleccionado(val)}>
            <SelectTrigger className="text-xs h-10 px-3 rounded-xl border-[#E5E7EB] bg-slate-50 font-bold min-w-[170px]">
              <SelectValue placeholder="Seleccionar mes" />
            </SelectTrigger>
            <SelectContent className="bg-white border-[#E5E7EB]">
              <SelectItem value="2026-10">Octubre 2026 (Actual)</SelectItem>
              <SelectItem value="2026-09">Septiembre 2026</SelectItem>
              <SelectItem value="2026-08">Agosto 2026</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={descargarAsistenciaMensualPdf}
            disabled={descargando_pdf}
            className="h-10 text-xs font-bold px-3.5 gap-2 border-[#035683] text-[#035683] hover:bg-slate-100 rounded-xl shadow-2xs shrink-0"
            title="Exportar kárdex de asistencia mensual a PDF mediante Puppeteer"
          >
            {descargando_pdf ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#00ABBD]" />
            ) : (
              <Printer className="w-4 h-4 text-[#00ABBD]" />
            )}
            <span>Exportar Asistencia PDF</span>
          </Button>

          <BotonJuicy
            onClick={abrirDialogo}
            variante="primario"
            className="h-10 text-xs font-bold px-4 gap-2 shadow-sm rounded-xl shrink-0"
          >
            <Clock className="w-4 h-4" />
            <span>Marcar Entrada / Salida GPS</span>
          </BotonJuicy>
        </div>
      </div>

      {/* Banner Informativo Escala Oficial de Multas de Escuela de Líderes */}
      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="text-amber-900 font-medium">
            <strong>Escala de Multas de los Viernes (Escuela de Líderes):</strong> 1-10 min = 10 Bs · 11-30 min = 20 Bs · 31-60 min = 30 Bs · &gt;60 min = 50 Bs.
          </span>
        </div>
        <Badge variant="outline" className="bg-white border-amber-300 text-amber-800 text-[10px] font-mono self-start sm:self-center shrink-0">
          Vigente 2026
        </Badge>
      </div>

      {/* Historial Comparativo de Horas Realizadas por Mes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {horas_por_mes.map((h) => {
          const es_seleccionado = h.clave === mes_seleccionado;
          const avance_real = Math.round((h.horas / h.meta) * 100);
          const avance = Math.min(100, avance_real);
          const excedente = h.horas - h.meta;
          return (
            <div
              key={h.clave}
              onClick={() => set_mes_seleccionado(h.clave)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                es_seleccionado
                  ? "bg-[#035683]/5 border-[#035683] ring-1 ring-[#035683]/20"
                  : "bg-white border-[#E5E7EB] hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-[#035683]">{h.mes}</span>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-mono font-bold ${
                    h.estado === "cumplido"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : "bg-amber-50 text-amber-700 border-amber-300"
                  }`}
                >
                  {excedente > 0
                    ? `META SUPERADA (+${excedente.toFixed(1)} h · ${avance_real}%)`
                    : h.estado === "cumplido"
                    ? `${avance_real}% CUMPLIDO`
                    : `${avance_real}% AVANCE`}
                </Badge>
              </div>
              <div className="flex items-baseline justify-between text-xs font-mono">
                <span className="font-bold text-sm text-[#035683]">{h.horas.toFixed(1)} hrs</span>
                <span className="text-muted-foreground text-[11px]">Meta: {h.meta.toFixed(1)} hrs (9h/sem)</span>
              </div>
              <Progress value={avance} className="h-1.5 mt-2 bg-slate-100" />
            </div>
          );
        })}
      </div>

      {/* Tarjetas KPI de Progreso */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Horas Acumuladas */}
        <TarjetaSpotlight
          color_luz="rgba(6, 58, 107, 0.15)"
          className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground">
              Horas Acumuladas
            </span>
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold">
              {horas_acumuladas > horas_meta
                ? `Meta Superada (+${(horas_acumuladas - horas_meta).toFixed(1)}h · ${porcentaje_real_meta}%)`
                : `${porcentaje_real_meta}%`}
            </Badge>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold font-display text-[#035683]">
              <ContadorRodilloAnimado valor={horas_acumuladas} sufijo=" hrs" decimales={1} />
            </span>
            <span className="text-xs text-muted-foreground font-mono">/ {horas_meta} hrs</span>
          </div>
          <Progress value={porcentaje_meta} className="h-2 bg-slate-100" />
        </TarjetaSpotlight>

        {/* KPI 2: Jornadas Registradas */}
        <TarjetaSpotlight
          color_luz="rgba(23, 180, 196, 0.15)"
          className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground">
              Jornadas Acreditadas
            </span>
            <Calendar className="w-4 h-4 text-[#00ABBD]" />
          </div>
          <div className="text-3xl font-bold font-display text-[#035683]">
            <ContadorRodilloAnimado valor={16} sufijo=" días" />
          </div>
          <p className="text-[11px] text-muted-foreground">Mes de Octubre 2026</p>
        </TarjetaSpotlight>

        {/* KPI 3: Tasa de Puntualidad */}
        <TarjetaSpotlight
          color_luz="rgba(16, 185, 129, 0.15)"
          className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground">
              Puntualidad
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold font-display text-emerald-600">
            <ContadorRodilloAnimado valor={96} sufijo="%" />
          </div>
          <p className="text-[11px] text-emerald-700 font-medium">Cumplimiento excelente</p>
        </TarjetaSpotlight>

        {/* KPI 4: Sede Asignada */}
        <TarjetaSpotlight
          color_luz="rgba(248, 199, 102, 0.2)"
          className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground">
              Mi Sede Asignada
            </span>
            <MapPin className="w-4 h-4 text-[#E2694B]" />
          </div>
          <div className="text-sm font-bold text-[#035683] leading-tight">
            Oficina Central - Bloque A
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#00ABBD] font-semibold pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ABBD] animate-pulse" />
            <span>Radio Geodésico: 120m</span>
          </div>
        </TarjetaSpotlight>
      </div>

      {/* Listado de Jornadas Registradas */}
      <Card className="border-[#E5E7EB] shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/60 p-5 border-b border-[#E5E7EB]/60">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-[#035683]">
                Historial de Marcaciones
              </CardTitle>
              <CardDescription className="text-xs">
                Registros de ingreso y salida con coordenadas auditadas
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-[#E5E7EB] text-[#035683] font-mono text-xs">
              {jornadas.length} Registros recientes
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-[#E5E7EB]/50">
            {jornadas.map((j) => (
              <div
                key={j.id}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      j.estado === "en_curso"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-[#035683]/10 text-[#035683]"
                    }`}
                  >
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#035683]">{j.fecha}</span>
                      <span className="text-xs text-muted-foreground">({j.dia_semana})</span>
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase font-mono px-1.5 py-0 border-[#E5E7EB]"
                      >
                        {j.tipo === "acciones_servicio"
                          ? "Acciones Servicio"
                          : j.tipo === "escuela_lideres"
                          ? "Escuela Líderes"
                          : "Prácticas"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>{j.sede}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-700">
                        <MapPin className="w-3 h-3" /> {j.distancia_m}m de la sede
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                  {/* Horario */}
                  <div className="text-left md:text-right">
                    <div className="text-xs font-mono font-bold text-[#035683]">
                      {j.hora_ingreso} &rarr; {j.hora_salida || "En curso..."}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      {j.horas_computadas.toFixed(2)} horas computadas
                    </div>
                  </div>

                  {/* Estado y Acción Directa de Justificación */}
                  <div className="flex items-center gap-2">
                    {j.estado === "acreditado" && (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-bold text-xs gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Acreditado
                      </Badge>
                    )}
                    {j.estado === "en_curso" && (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-bold text-xs gap-1 animate-pulse">
                        <Clock className="w-3.5 h-3.5" />
                        Jornada Activa
                      </Badge>
                    )}
                    {j.estado === "convalidado" && (
                      <Badge className="bg-sky-100 text-sky-800 border-sky-200 font-bold text-xs gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {j.justificado ? "Justificación Radicada" : "Convalidado"}
                      </Badge>
                    )}
                    {j.estado === "falta" && (
                      <Badge className="bg-rose-100 text-rose-800 border-rose-200 font-bold text-xs gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Falta Inasistencia
                      </Badge>
                    )}
                    {j.estado === "observado" && (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-bold text-xs gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Observado
                      </Badge>
                    )}

                    {/* Botón directo "Justificar Falta" para incidencias */}
                    {(j.estado === "falta" || j.estado === "observado") && !j.justificado && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => abrirJustificacionParaJornada(j)}
                        className="h-8 rounded-xl text-xs font-bold border-amber-300 text-amber-800 bg-amber-50/80 hover:bg-amber-100 gap-1.5 shadow-2xs shrink-0 cursor-pointer"
                        title="Radicar justificación con comprobante médico o académico en PDF/imagen"
                      >
                        <ClipboardCheck className="w-3.5 h-3.5 text-amber-700" />
                        <span>Justificar Falta</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de Marcación en caso de apertura autónoma */}
      <DialogoMarcacionAsistencia
        abierto={dialogo_marcacion_abierto}
        alCambiarAbierto={set_dialogo_marcacion_abierto}
      />

      {/* Diálogo Modal de Justificación Directa con Carga de Comprobante PDF / Imagen */}
      <DialogoJustificarFalta
        abierto={dialogo_justificar_abierto}
        alCambiarAbierto={set_dialogo_justificar_abierto}
        incidencia={incidencia_a_justificar}
        alCompletar={() => manejarJustificacionCompletada(incidencia_a_justificar?.id)}
      />
    </div>
  );
}
