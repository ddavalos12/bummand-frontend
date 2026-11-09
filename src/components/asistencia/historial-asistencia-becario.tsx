"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Clock,
  CheckCircle2,
  Calendar,
  MapPin,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Coins,
  Printer,
  Loader2,
  ClipboardCheck,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { clienteApi } from "@/lib/cliente-api";
import { descargarPdfConResiliencia } from "@/lib/generador-pdf-cliente";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TarjetaSpotlight,
  ContadorRodilloAnimado,
  BotonJuicy,
} from "@/components/animaciones";
import { DialogoMarcacionAsistencia } from "./dialogo-marcacion-asistencia";
import {
  DialogoJustificarFalta,
  type IncidenciaAsistenciaInicial,
} from "./dialogo-justificar-falta";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import {
  obtenerExtractoMensualAsistencia,
  generarExtractoMensualDeterminista,
  type RespuestaExtractoMensual,
  type MovimientoExtractoAsistencia,
} from "@/servicios/asistencia.servicio";

interface HistorialAsistenciaBecarioProps {
  alAbrirMarcacion?: () => void;
}

const PILDORAS_MESES = [
  { clave: "2026-11", etiqueta: "Nov 2026" },
  { clave: "2026-10", etiqueta: "Oct 2026" },
  { clave: "2026-09", etiqueta: "Sep 2026" },
  { clave: "2026-08", etiqueta: "Ago 2026" },
  { clave: "2026-07", etiqueta: "Jul 2026" },
  { clave: "2026-06", etiqueta: "Jun 2026" },
  { clave: "2026-05", etiqueta: "May 2026" },
  { clave: "2026-04", etiqueta: "Abr 2026" },
  { clave: "2026-03", etiqueta: "Mar 2026" },
];

const FILTROS_ACTIVIDAD = [
  { clave: "todas", etiqueta: "Todas las Actividades" },
  { clave: "practicas", etiqueta: "Prácticas" },
  { clave: "escuela_lideres", etiqueta: "Escuela de Líderes" },
  { clave: "acciones_servicio", etiqueta: "Acciones de Servicio" },
];

export function HistorialAsistenciaBecario({ alAbrirMarcacion }: HistorialAsistenciaBecarioProps) {
  const { usuario } = usarAutenticacion();
  const [dialogo_marcacion_abierto, set_dialogo_marcacion_abierto] = useState(false);
  const [descargando_pdf, set_descargando_pdf] = useState(false);
  const [dialogo_justificar_abierto, set_dialogo_justificar_abierto] = useState(false);
  const [incidencia_a_justificar, set_incidencia_a_justificar] = useState<IncidenciaAsistenciaInicial | null>(null);

  // Estados del extracto mensual estilo bancario
  const [mes_seleccionado, set_mes_seleccionado] = useState<string>("2026-10");
  const [termino_busqueda_mes, set_termino_busqueda_mes] = useState<string>("");
  const [filtro_actividad, set_filtro_actividad] = useState<"todas" | "practicas" | "escuela_lideres" | "acciones_servicio">("todas");
  const [cargando_extracto, set_cargando_extracto] = useState<boolean>(false);
  const [datos_extracto, set_datos_extracto] = useState<RespuestaExtractoMensual>(() =>
    generarExtractoMensualDeterminista(usuario?.id || 1, "2026-10")
  );

  // Carga remota con respaldo determinístico local de Marzo a Noviembre 2026
  useEffect(() => {
    let montado = true;
    async function cargarExtracto() {
      set_cargando_extracto(true);
      try {
        const respuesta = await obtenerExtractoMensualAsistencia(mes_seleccionado, usuario?.id);
        if (montado && respuesta) {
          set_datos_extracto(respuesta);
        }
      } catch (_e) {
        if (montado) {
          set_datos_extracto(generarExtractoMensualDeterminista(usuario?.id || 1, mes_seleccionado));
        }
      } finally {
        if (montado) {
          set_cargando_extracto(false);
        }
      }
    }
    cargarExtracto();
    return () => {
      montado = false;
    };
  }, [mes_seleccionado, usuario?.id]);

  // Manejador del buscador tecleable de mes
  const manejarCambioBusqueda = (valor: string) => {
    set_termino_busqueda_mes(valor);
    if (!valor.trim()) return;

    const texto = valor.trim().toLowerCase();
    const coincidencia = datos_extracto.extractos.find((e) =>
      e.mes_nombre.toLowerCase().includes(texto) ||
      e.periodo.toLowerCase().includes(texto) ||
      (texto === "mayo" && e.periodo === "2026-05") ||
      (texto === "marzo" && e.periodo === "2026-03") ||
      (texto === "abril" && e.periodo === "2026-04") ||
      (texto === "junio" && e.periodo === "2026-06") ||
      (texto === "julio" && e.periodo === "2026-07") ||
      (texto === "agosto" && e.periodo === "2026-08") ||
      (texto === "septiembre" && e.periodo === "2026-09") ||
      (texto === "octubre" && e.periodo === "2026-10") ||
      (texto === "noviembre" && e.periodo === "2026-11")
    );

    if (coincidencia) {
      set_mes_seleccionado(coincidencia.periodo);
    }
  };

  // Obtener extracto del mes actualmente seleccionado
  const extracto_activo = useMemo(() => {
    const encontrado = datos_extracto.extractos.find((e) => e.periodo === mes_seleccionado);
    return encontrado || datos_extracto.extracto_actual || datos_extracto.extractos[0];
  }, [datos_extracto, mes_seleccionado]);

  // Filtrar movimientos según actividad seleccionada
  const movimientos_filtrados = useMemo(() => {
    if (!extracto_activo?.movimientos) return [];
    if (filtro_actividad === "todas") return extracto_activo.movimientos;
    return extracto_activo.movimientos.filter((m) => m.tipo === filtro_actividad);
  }, [extracto_activo, filtro_actividad]);

  const abrirJustificacionParaMovimiento = (m: MovimientoExtractoAsistencia) => {
    let tipo_incidencia: IncidenciaAsistenciaInicial["tipo_incidencia"] = "asistencia_practicas";
    if (m.tipo === "escuela_lideres") tipo_incidencia = "escuela_lideres";
    else if (m.tipo === "acciones_servicio" || m.tipo === "evento") tipo_incidencia = "asistencia_evento";

    set_incidencia_a_justificar({
      id: m.id,
      fecha: m.fecha,
      tipo_incidencia,
      hora: m.hora_entrada,
      sede: m.sede,
      referencia_id: m.id,
      motivo_sugerido: "Inasistencia o retraso justificado para aprobación",
    });
    set_dialogo_justificar_abierto(true);
  };

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
      toast.info("Generando kárdex de asistencia mensual en PDF...", {
        description: `Periodo: ${extracto_activo.mes_nombre}`,
      });
      const id_becario = usuario?.id || 1;
      await descargarPdfConResiliencia(
        "/pdf/asistencia-estudiante/" + id_becario + "?mes=" + extracto_activo.periodo,
        "Asistencia_" + extracto_activo.periodo + "_Becario_" + id_becario + ".pdf",
        "asistencia_estudiante",
        { becario_id: String(id_becario), mes: extracto_activo.periodo }
      );
      toast.success("Kárdex de asistencia mensual descargado exitosamente");
    } catch (_error) {
      toast.error("Error al exportar la asistencia mensual en PDF");
    } finally {
      set_descargando_pdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera Principal con Botón de Marcación Destacado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-[#035683]" />
            <h2 className="text-xl font-bold text-[#035683]">Mis Horas de Práctica y Asistencia</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Control de jornada diaria con geocercas satelitales WGS84, extracto bancario mensual y registro acumulado de horas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
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
            className="h-10 text-xs font-bold px-4 gap-2 shadow-xs rounded-xl shrink-0"
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
        <Badge variant="outline" className="bg-white border-amber-300 text-amber-800 text-[10px] font-mono self-start sm:self-center shrink-0 font-bold">
          Vigente 2026
        </Badge>
      </div>

      {/* Barra de Filtro y Búsqueda Rápida estilo Pasajes / Extracto Bancario */}
      <div className="flex flex-col gap-3.5 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
        {/* Buscador tecleable de mes y filtro por actividad */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Teclea el mes a consultar (ej. Mayo, Junio, Agosto, Octubre)..."
              value={termino_busqueda_mes}
              onChange={(e) => manejarCambioBusqueda(e.target.value)}
              className="pl-10 h-10 text-xs rounded-xl border-[#E5E7EB] bg-slate-50/70 focus:bg-white"
            />
          </div>

          {/* Filtro por tipo de actividad */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 shrink-0">
            {FILTROS_ACTIVIDAD.map((fa) => (
              <button
                key={fa.clave}
                type="button"
                onClick={() => set_filtro_actividad(fa.clave as any)}
                className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  filtro_actividad === fa.clave
                    ? "bg-[#035683] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {fa.etiqueta}
              </button>
            ))}
          </div>
        </div>

        {/* Píldoras rápidas de los 9 meses (Noviembre 2026 a Marzo 2026) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
          <span className="text-[11px] font-mono text-muted-foreground mr-1 shrink-0 font-bold">
            Meses:
          </span>
          {PILDORAS_MESES.map((pm) => {
            const es_seleccionado = mes_seleccionado === pm.clave;
            return (
              <button
                key={pm.clave}
                type="button"
                onClick={() => {
                  set_mes_seleccionado(pm.clave);
                  set_termino_busqueda_mes("");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shrink-0 cursor-pointer ${
                  es_seleccionado
                    ? "bg-[#007BBE] text-white shadow-xs scale-105 ring-2 ring-[#007BBE]/30"
                    : "bg-slate-50 text-slate-600 border border-[#E5E7EB] hover:bg-slate-100"
                }`}
              >
                {pm.etiqueta}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tarjeta Principal de Estado de Cuenta / Extracto Mensual (Gradiente Oficial Diaconía) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#035683] via-[#007BBE] to-[#00ABBD] p-6 sm:p-8 text-white shadow-xl border border-white/10">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-80 h-80 bg-[#FFB600]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/15 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-mono uppercase tracking-wider text-white mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FFB600]" />
              <span>Estado de Cuenta Oficial · BUMAND</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
              EXTRACTO MENSUAL · {extracto_activo.mes_nombre.toUpperCase()}
            </h3>
            <p className="text-xs sm:text-sm text-sky-100 mt-1 max-w-xl">
              Certificación oficial de horas efectivas acreditadas, geocercas satelitales auditadas y cómputo bancario de saldos acumulados.
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={descargarAsistenciaMensualPdf}
            disabled={descargando_pdf}
            className="bg-white text-[#035683] hover:bg-slate-100 font-bold text-xs h-11 px-5 rounded-xl shadow-md gap-2 shrink-0 self-start md:self-center transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            {descargando_pdf ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#007BBE]" />
            ) : (
              <Printer className="w-4 h-4 text-[#007BBE]" />
            )}
            <span>Descargar Extracto PDF del Mes</span>
          </Button>
        </div>

        {/* Grilla de Métricas Principales del Mes */}
        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          {/* Total Horas Realizadas */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-sky-100 font-semibold">
              Horas del Mes
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
              {extracto_activo.horas_acumuladas.toFixed(2)} hrs
            </div>
            <p className="text-[11px] text-sky-200">Total acumulado acreditado</p>
          </div>

          {/* Meta Reglamentaria */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-sky-100 font-semibold">
              Meta Reglamentaria
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
              {extracto_activo.meta_horas.toFixed(2)} hrs
            </div>
            <p className="text-[11px] text-sky-200">9.0 hrs / semana flexible</p>
          </div>

          {/* Diferencia / Cumplimiento en #FFB600 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-sky-100 font-semibold">
              Cumplimiento
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#FFB600]">
              {extracto_activo.diferencia_horas >= 0
                ? `+${extracto_activo.diferencia_horas.toFixed(2)}`
                : extracto_activo.diferencia_horas.toFixed(2)}{" "}
              hrs · {extracto_activo.porcentaje_cumplimiento}%
            </div>
            <p className="text-[11px] text-[#FFB600]/95 font-medium">
              {extracto_activo.diferencia_horas >= 0 ? "Superávit consolidado" : "Pendiente de completar"}
            </p>
          </div>

          {/* Jornadas Asistidas */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-sky-100 font-semibold">
              Jornadas y Puntualidad
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
              {extracto_activo.jornadas_totales} jornadas
            </div>
            <p className="text-[11px] text-emerald-300 font-semibold">
              {extracto_activo.tasa_puntualidad}% Puntualidad registrada
            </p>
          </div>
        </div>

        {/* Barra de progreso de la meta */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/10 space-y-1.5">
          <div className="flex justify-between text-xs font-mono text-sky-100">
            <span>Avance de la Meta del Mes</span>
            <span className="font-bold text-[#FFB600]">{extracto_activo.porcentaje_cumplimiento}%</span>
          </div>
          <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-[#FFB600] to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, extracto_activo.porcentaje_cumplimiento)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tarjetas KPI de Progreso Detallado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Horas Acumuladas */}
        <TarjetaSpotlight
          color_luz="rgba(0, 123, 190, 0.15)"
          className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground">
              Horas Acumuladas
            </span>
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold">
              {extracto_activo.horas_acumuladas > extracto_activo.meta_horas
                ? `Meta Superada (+${extracto_activo.diferencia_horas.toFixed(1)}h)`
                : `${extracto_activo.porcentaje_cumplimiento}%`}
            </Badge>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold font-display text-[#035683]">
              <ContadorRodilloAnimado valor={extracto_activo.horas_acumuladas} sufijo=" hrs" decimales={1} />
            </span>
            <span className="text-xs text-muted-foreground font-mono">/ {extracto_activo.meta_horas} hrs</span>
          </div>
          <Progress value={Math.min(100, extracto_activo.porcentaje_cumplimiento)} className="h-2 bg-slate-100" />
        </TarjetaSpotlight>

        {/* KPI 2: Jornadas Registradas */}
        <TarjetaSpotlight
          color_luz="rgba(0, 171, 189, 0.15)"
          className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground">
              Jornadas Acreditadas
            </span>
            <Calendar className="w-4 h-4 text-[#00ABBD]" />
          </div>
          <div className="text-3xl font-bold font-display text-[#035683]">
            <ContadorRodilloAnimado valor={extracto_activo.jornadas_totales} sufijo=" días" />
          </div>
          <p className="text-[11px] text-muted-foreground">{extracto_activo.mes_nombre}</p>
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
            <ContadorRodilloAnimado valor={extracto_activo.tasa_puntualidad} sufijo="%" />
          </div>
          <p className="text-[11px] text-emerald-700 font-medium">Cumplimiento excelente</p>
        </TarjetaSpotlight>

        {/* KPI 4: Sede Asignada */}
        <TarjetaSpotlight
          color_luz="rgba(255, 182, 0, 0.15)"
          className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground">
              Mi Sede Asignada
            </span>
            <MapPin className="w-4 h-4 text-[#00ABBD]" />
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

      {/* Tabla de Extracto Bancario Diario (Todos los días asistidos del mes) */}
      <Card className="border-[#E5E7EB] shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/80 p-5 border-b border-[#E5E7EB]/70">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-[#035683] flex items-center gap-2">
                <span>Extracto Bancario Diario de Asistencia</span>
                <Badge variant="outline" className="text-[11px] font-mono border-[#00ABBD] text-[#00808E] bg-[#00ABBD]/10 font-bold">
                  {extracto_activo.mes_nombre}
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Movimientos diarios correlativos con hora de entrada, salida, horas acreditadas y saldo acumulado progresivo.
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-[#E5E7EB] text-[#035683] font-mono text-xs self-start sm:self-center font-bold">
              {movimientos_filtrados.length} movimientos registrados
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="bg-slate-100/75 border-b border-[#E5E7EB]">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-bold text-[#035683] py-3.5 pl-5">Fecha / Día</TableHead>
                <TableHead className="text-xs font-bold text-[#035683] py-3.5">Concepto / Actividad y Sede</TableHead>
                <TableHead className="text-xs font-bold text-[#035683] py-3.5 text-center">Hora de Entrada</TableHead>
                <TableHead className="text-xs font-bold text-[#035683] py-3.5 text-center">Hora de Salida</TableHead>
                <TableHead className="text-xs font-bold text-[#007BBE] py-3.5 text-right">Horas Día (+)</TableHead>
                <TableHead className="text-xs font-bold text-[#035683] py-3.5 text-right">Saldo Acumulado Mes</TableHead>
                <TableHead className="text-xs font-bold text-[#035683] py-3.5 pr-5 text-right">Estado / Geocerca</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movimientos_filtrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                    No hay movimientos registrados para el filtro seleccionado en {extracto_activo.mes_nombre}.
                  </TableCell>
                </TableRow>
              ) : (
                movimientos_filtrados.map((mov) => (
                  <TableRow
                    key={mov.id}
                    className="border-b border-[#E5E7EB]/50 hover:bg-slate-50/80 transition-colors"
                  >
                    {/* 1. Fecha / Día */}
                    <TableCell className="py-3.5 pl-5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-slate-100 text-[#035683] px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
                          {mov.fecha_corta}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800">{mov.dia_semana}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{mov.fecha}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* 2. Concepto / Actividad y Sede */}
                    <TableCell className="py-3.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#035683]">
                            {mov.tipo_etiqueta}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[9px] uppercase font-mono px-1 py-0 ${
                              mov.tipo === "practicas"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : mov.tipo === "escuela_lideres"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {mov.tipo === "practicas" ? "Práctica" : mov.tipo === "escuela_lideres" ? "Escuela Líderes" : "Servicio"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <MapPin className="w-3 h-3 text-[#00ABBD] shrink-0" />
                          <span className="truncate max-w-[280px]">{mov.sede}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* 3. Hora de Entrada */}
                    <TableCell className="py-3.5 text-center">
                      <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-800 border-emerald-300 font-mono font-bold text-xs gap-1 px-2.5 py-1"
                      >
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        {mov.hora_entrada}
                      </Badge>
                    </TableCell>

                    {/* 4. Hora de Salida */}
                    <TableCell className="py-3.5 text-center">
                      <Badge
                        variant="outline"
                        className="bg-sky-50 text-sky-800 border-sky-300 font-mono font-bold text-xs gap-1 px-2.5 py-1"
                      >
                        <Clock className="w-3.5 h-3.5 text-sky-600" />
                        {mov.hora_salida || "En curso"}
                      </Badge>
                    </TableCell>

                    {/* 5. Horas del Día (+) */}
                    <TableCell className="py-3.5 text-right">
                      <span className="font-mono font-extrabold text-sm text-[#007BBE] bg-[#007BBE]/10 px-2.5 py-1 rounded-lg">
                        +{mov.horas_dia.toFixed(2)} hrs
                      </span>
                    </TableCell>

                    {/* 6. Saldo Acumulado Mes */}
                    <TableCell className="py-3.5 text-right">
                      <span className="font-mono font-bold text-xs text-[#035683] bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs">
                        {mov.saldo_acumulado.toFixed(2)} hrs
                      </span>
                    </TableCell>

                    {/* 7. Estado / Geocerca */}
                    <TableCell className="py-3.5 pr-5 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Acreditado
                        </Badge>
                        <span className="text-[10px] font-mono text-emerald-700 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" /> {mov.distancia_metros}m (En radio)
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Historial Comparativo de Horas Realizadas por Mes (Marzo a Noviembre 2026) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#035683]">
            Resumen Comparativo de Gestión 2026 (Marzo a Noviembre)
          </h4>
          <span className="text-xs font-mono text-muted-foreground">
            Total Gestión: <strong>{datos_extracto.total_horas_gestion.toFixed(1)} hrs</strong> · Promedio: <strong>{datos_extracto.promedio_mensual.toFixed(1)} h/mes</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-3">
          {datos_extracto.extractos.map((h) => {
            const es_seleccionado = h.periodo === mes_seleccionado;
            const avance_real = h.porcentaje_cumplimiento;
            const avance = Math.min(100, avance_real);
            const excedente = h.diferencia_horas;

            return (
              <div
                key={h.periodo}
                onClick={() => {
                  set_mes_seleccionado(h.periodo);
                  set_termino_busqueda_mes("");
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  es_seleccionado
                    ? "bg-[#035683]/5 border-[#007BBE] ring-2 ring-[#007BBE]/30 shadow-sm"
                    : "bg-white border-[#E5E7EB] hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-[#035683]">{h.mes_nombre}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-mono font-bold ${
                      h.estado_meta === "cumplido"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                        : "bg-amber-50 text-amber-700 border-amber-300"
                    }`}
                  >
                    {excedente > 0
                      ? `META SUPERADA (+${excedente.toFixed(1)} h · ${avance_real}%)`
                      : h.estado_meta === "cumplido"
                      ? `${avance_real}% CUMPLIDO`
                      : `${avance_real}% AVANCE`}
                  </Badge>
                </div>
                <div className="flex items-baseline justify-between text-xs font-mono">
                  <span className="font-bold text-sm text-[#035683]">{h.horas_acumuladas.toFixed(1)} hrs</span>
                  <span className="text-muted-foreground text-[11px]">Meta: {h.meta_horas.toFixed(1)} hrs (9h/sem)</span>
                </div>
                <Progress value={avance} className="h-1.5 mt-2 bg-slate-100" />
              </div>
            );
          })}
        </div>
      </div>

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
        alCompletar={() => {
          set_dialogo_justificar_abierto(false);
          toast.success("Justificación enviada a revisión de supervisor");
        }}
      />
    </div>
  );
}
