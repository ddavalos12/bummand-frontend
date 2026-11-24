"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SeleccionadorFecha } from "@/components/ui/seleccionador-fecha";
import {
  FileText,
  Download,
  Printer,
  CheckCircle,
  Clock,
  ShieldCheck,
  Sparkles,
  Loader2,
  Calendar,
  Users,
  Bus,
  MapPin,
  User,
  Coffee,
  Coins,
  Receipt,
  FileCheck2,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { clienteApi } from "@/lib/cliente-api";
import { descargarPdfConResiliencia } from "@/lib/generador-pdf-cliente";
import {
  descargarExcelInstitucional,
  exportarFormularioContabilidadRsdExcel,
  exportarSabanaEvaluacionesExcel,
  exportarAuditoriaAsistenciaExcel,
} from "@/lib/generador-excel-cliente";
import { RUTAS_API } from "@/servicios/rutas-api.constantes";
import { obtenerCalculoPagoPasajes } from "@/servicios/pasajes.servicio";
import { SelectorPlanillaDonacion } from "@/components/reportes/selector-planilla-donacion";

interface ReporteItem {
  id: number;
  titulo: string;
  tipo:
    | "evaluacion_semestral_ii"
    | "asistencia"
    | "pasajes"
    | "evaluacion_f03"
    | "evento"
    | "refrigerios"
    | "consolidado-auditoria";
  periodo: string;
  fecha_generacion: string;
  becario_nombre: string;
  tamano_kb: number;
  endpoint: string;
  nombre_archivo: string;
}

interface BecarioReporteItem {
  id: number;
  nombre: string;
  ci: string;
  carrera: string;
  universidad: string;
  sede: string;
}

const REPORTES_DISPONIBLES: ReporteItem[] = [];

const NOMBRES_MESES_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function obtenerMesActualYFechas() {
  const ahora = new Date();
  const ano = ahora.getFullYear();
  const mes_idx = ahora.getMonth();
  const mes_num = String(mes_idx + 1).padStart(2, "0");
  const ultimo_dia = new Date(ano, mes_idx + 1, 0).getDate();
  const mes_iso = `${ano}-${mes_num}`;
  const fecha_inicio = `${mes_iso}-01`;
  const fecha_fin = `${mes_iso}-${String(ultimo_dia).padStart(2, "0")}`;

  const opciones_meses: Array<{ valor: string; etiqueta: string }> = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(ano, mes_idx - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const valor = `${y}-${String(m + 1).padStart(2, "0")}`;
    const etiqueta = `${NOMBRES_MESES_ES[m]} ${y}${i === 0 ? " (Actual)" : ""}`;
    opciones_meses.push({ valor, etiqueta });
  }
  return { mes_iso, fecha_inicio, fecha_fin, opciones_meses };
}

export function VisorReportesPdf() {
  const { mes_iso: mes_actual_iso, fecha_inicio: inicio_actual, fecha_fin: fin_actual, opciones_meses } =
    obtenerMesActualYFechas();
  const [reportes] = useState<ReporteItem[]>(REPORTES_DISPONIBLES);
  const [descargando_id, set_descargando_id] = useState<string | null>(null);

  // Filtro Global de Rango de Fechas
  const [fecha_inicio_global, set_fecha_inicio_global] = useState<string>(inicio_actual);
  const [fecha_fin_global, set_fecha_fin_global] = useState<string>(fin_actual);

  // Estados para exportación individual por estudiante
  const [lista_becarios, set_lista_becarios] = useState<BecarioReporteItem[]>([]);
  const [estudiante_seleccionado_id, set_estudiante_seleccionado_id] = useState<number>(1);
  const [mes_individual, set_mes_individual] = useState<string>(mes_actual_iso);

  useEffect(() => {
    let cancelado = false;
    async function cargarBecariosReales() {
      try {
        const { clienteApi } = await import("@/lib/cliente-api");
        const resp = await clienteApi.get<any>("/becarios");
        const datos = Array.isArray(resp) ? resp : resp?.items || resp?.data || [];
        if (!cancelado && Array.isArray(datos)) {
          const mapeados = datos.map((b: any) => ({
            id: Number(b.id),
            nombre: String(b.usuario?.nombre || b.nombre || `Becario #${b.id}`),
            ci: String(b.ci || "Sin CI"),
            carrera: String(b.carrera || "Carrera BUMAND"),
            universidad: String(b.universidad || "Universidad"),
            sede: String(b.lugar_practica?.nombre || b.ubicacion || "Oficina Central Diaconía IFD - El Alto"),
            m1: 0,
            m2: 0,
            m3: 0,
            m4: 0,
            m5: 0,
          }));
          set_lista_becarios(mapeados);
          if (mapeados.length > 0 && !mapeados.some((m: any) => m.id === estudiante_seleccionado_id)) {
            set_estudiante_seleccionado_id(mapeados[0].id);
          }
        }
      } catch {
        set_lista_becarios([]);
      }
    }
    cargarBecariosReales();
    return () => { cancelado = true; };
  }, []);

  // Estados para panel de auditoría por intervalo de fechas
  const [modulo_auditoria, set_modulo_auditoria] = useState<string>("refrigerios");
  const [fecha_inicio_auditoria, set_fecha_inicio_auditoria] = useState<string>(inicio_actual);
  const [fecha_fin_auditoria, set_fecha_fin_auditoria] = useState<string>(fin_actual);
  const descontar_multas = false;
  const [descargando_auditoria, set_descargando_auditoria] = useState<boolean>(false);
  const [exportando_excel_auditoria, set_exportando_excel_auditoria] = useState<boolean>(false);
  const [exportando_excel_individual, set_exportando_excel_individual] = useState<boolean>(false);

  const estudiante_actual =
    lista_becarios.find((b) => b.id === estudiante_seleccionado_id) ||
    lista_becarios[0];

  const descargarReportePuppeteer = async (
    clave: string,
    endpoint: string,
    nombre_archivo: string,
    tipo?:
      | "evaluacion_semestral_ii"
      | "horas"
      | "refrigerios"
      | "f03"
      | "evento"
      | "recorridos_estudiante"
      | "asistencia_estudiante"
      | "pasajes_general"
      | "justificaciones_general"
      | "asistencia_general"
      | "escuela_lideres"
      | "consolidado_auditoria"
      | "auditoria",
    params?: {
      becario_id?: number;
      nombre_becario?: string;
      mes?: string;
      fecha_inicio?: string;
      fecha_fin?: string;
      modulo?: string;
      descontar_multas?: boolean;
    }
  ) => {
    try {
      set_descargando_id(clave);
      toast.info("Generando informe oficial certificado en PDF...", {
        description: `Procesando "${nombre_archivo}".`,
      });

      let tipo_final = tipo;
      if (!tipo_final) {
        if (endpoint.includes("evaluacion-semestral")) tipo_final = "evaluacion_semestral_ii";
        else if (endpoint.includes("corte-asistencia")) tipo_final = "horas";
        else if (endpoint.includes("refrigerios")) tipo_final = "refrigerios";
        else if (endpoint.includes("evaluacion/")) tipo_final = "f03";
        else if (endpoint.includes("evento/")) tipo_final = "evento";
        else if (endpoint.includes("recorridos-estudiante")) tipo_final = "recorridos_estudiante";
        else if (endpoint.includes("asistencia-estudiante")) tipo_final = "asistencia_estudiante";
        else if (endpoint.includes("pasajes-general")) tipo_final = "pasajes_general";
        else if (endpoint.includes("justificaciones-general")) tipo_final = "justificaciones_general";
        else if (endpoint.includes("asistencia-escuela-lideres")) tipo_final = "escuela_lideres";
        else if (endpoint.includes("asistencia-general")) tipo_final = "asistencia_general";
        else if (endpoint.includes("consolidado-auditoria") || endpoint.includes("consolidado-contabilidad")) {
          tipo_final = "consolidado_auditoria";
        }
        else tipo_final = "auditoria";
      }

      await descargarPdfConResiliencia(endpoint, nombre_archivo, tipo_final, params);

      toast.success("Documento PDF generado y descargado exitosamente", {
        description: `Archivo "${nombre_archivo}" listo.`,
      });
    } catch (_error) {
      toast.error("Error al procesar el archivo PDF", {
        description: "Ocurrió un inconveniente al generar el documento.",
      });
    } finally {
      set_descargando_id(null);
    }
  };

  const descargarReporteAuditoriaIntervalo = async (modulo_forzado?: string) => {
    const mod = modulo_forzado || modulo_auditoria;
    try {
      set_descargando_auditoria(true);
      let ruta_base = "/pdf/refrigerios";
      let nombre_doc = "Refrigerios";

      if (mod === "asistencia") {
        ruta_base = "/pdf/corte-asistencia";
        nombre_doc = "Corte_Asistencia";
      } else if (mod === "pasajes") {
        ruta_base = "/pdf/pasajes-general";
        nombre_doc = "Expediente_Pasajes";
      } else if (mod === "evaluaciones") {
        ruta_base = "/pdf/evaluacion-semestral";
        nombre_doc = "Evaluaciones_Semestrales";
      } else if (mod === "consolidado-auditoria") {
        ruta_base = "/pdf/consolidado-auditoria";
        nombre_doc = "Consolidado_Contabilidad_BUMAND";
      }

      const separador = ruta_base.includes("?") ? "&" : "?";
      const incluye_descuento = mod === "pasajes" || mod === "consolidado-auditoria";
      const parametro_multas = incluye_descuento
        ? `&descontar_multas=${descontar_multas ? "true" : "false"}`
        : "";
      const ruta_completa = `${ruta_base}${separador}fecha_inicio=${fecha_inicio_auditoria}&fecha_fin=${fecha_fin_auditoria}${parametro_multas}`;
      const nombre_archivo = `Reporte_Contabilidad_${nombre_doc}_${fecha_inicio_auditoria}_al_${fecha_fin_auditoria}.pdf`;

      toast.info(`Generando Reporte para Contabilidad (${nombre_doc}) en PDF...`, {
        description: `Rango: ${fecha_inicio_auditoria} a ${fecha_fin_auditoria}.`,
      });

      await descargarPdfConResiliencia(ruta_completa, nombre_archivo, "auditoria", {
        modulo: mod,
        fecha_inicio: fecha_inicio_auditoria,
        fecha_fin: fecha_fin_auditoria,
        descontar_multas,
      });

      toast.success("Reporte PDF para Contabilidad generado exitosamente", {
        description: `Archivo "${nombre_archivo}" listo.`,
      });
    } catch (_error) {
      toast.error("Error al extraer reporte PDF para Contabilidad", {
        description: "Ocurrió un inconveniente al procesar el documento.",
      });
    } finally {
      set_descargando_auditoria(false);
    }
  };

  const manejarExportarExcelAuditoria = async () => {
    const periodo = `${fecha_inicio_auditoria}_al_${fecha_fin_auditoria}`;
    try {
      set_exportando_excel_auditoria(true);

      if (modulo_auditoria === "pasajes" || modulo_auditoria === "consolidado-auditoria") {
        const calculo = await obtenerCalculoPagoPasajes({
          fecha_inicio: fecha_inicio_auditoria,
          fecha_fin: fecha_fin_auditoria,
          descontar_multas,
        });
        await exportarFormularioContabilidadRsdExcel(calculo.becarios, periodo, descontar_multas);
        toast.success("Reporte de pasajes para Contabilidad exportado a Excel (.xlsx)", {
          description: `${calculo.becarios.length} becarios · ${
            descontar_multas ? "Con descuento de multas" : "Sin descuento de multas"
          }.`,
        });
        return;
      }

      if (modulo_auditoria === "evaluaciones") {
        const resp = await clienteApi.get<
          Array<Record<string, unknown>> | { registros?: Array<Record<string, unknown>> }
        >(RUTAS_API.EVALUACIONES.CONSOLIDADO_SEMESTRAL);
        const registros = Array.isArray(resp) ? resp : resp?.registros || [];
        await exportarSabanaEvaluacionesExcel(registros, periodo);
        toast.success("Sábana de evaluaciones exportada a Excel (.xlsx)");
        return;
      }

      if (modulo_auditoria === "refrigerios") {
        const resp = await clienteApi.get<Array<Record<string, unknown>>>(RUTAS_API.REFRIGERIOS.BASE);
        const lista_cruda = Array.isArray(resp) ? resp : [];
        const filtrados = lista_cruda.filter((r) => {
          const fecha_reg = r.fecha ? String(r.fecha).split("T")[0] : "";
          if (!fecha_reg) return true;
          return fecha_reg >= fecha_inicio_auditoria && fecha_reg <= fecha_fin_auditoria;
        });

        let suma_costo = 0;
        let suma_devolucion = 0;
        const filas_refrigerios = filtrados.map((r, idx) => {
          const fecha_texto = r.fecha ? String(r.fecha).split("T")[0] : "-";
          const dupla =
            [r.becario_encargado_1_nombre, r.becario_encargado_2_nombre]
              .filter(Boolean)
              .map(String)
              .join(" / ") ||
            String(r.becario_nombre || r.responsable_entrega || "Dupla BUMAND");
          const costo_total = Number(r.costo_total_bs ?? 0);
          const monto_devolucion = Number(r.monto_devolucion_bs ?? costo_total);
          suma_costo += costo_total;
          suma_devolucion += monto_devolucion;

          return [
            String(idx + 1),
            fecha_texto,
            String(r.descripcion || "Refrigerio Escuela de Líderes"),
            dupla,
            String(r.cantidad_raciones ?? 0),
            Number(costo_total.toFixed(2)),
            Number(monto_devolucion.toFixed(2)),
            String(r.becario_receptor_devolucion_nombre || "-"),
            String(r.estado_reposicion || "programado").toUpperCase(),
          ];
        });

        await descargarExcelInstitucional({
          nombre_archivo: `Reporte_Refrigerios_${periodo}.xlsx`,
          nombre_hoja: "Refrigerios 100%",
          titulo_reporte: "REPORTE OFICIAL DE CONTROL Y LIQUIDACIÓN DE REFRIGERIOS",
          subtitulo: `Periodo: ${fecha_inicio_auditoria} al ${fecha_fin_auditoria} · Reembolso 100%`,
          columnas: [
            "N°",
            "Fecha",
            "Descripción",
            "Dupla / Encargado",
            "Raciones",
            "Costo Total Bs",
            "Devolución 100% Bs",
            "Receptor",
            "Estado",
          ],
          filas: filas_refrigerios,
          fila_totales: [
            "",
            "TOTALES",
            "",
            "",
            "",
            Number(suma_costo.toFixed(2)),
            Number(suma_devolucion.toFixed(2)),
            "",
            "",
          ],
        });
        toast.success("Reporte de refrigerios exportado a Excel (.xlsx)");
        return;
      }

      const consulta_asistencia = `${RUTAS_API.ASISTENCIA.BASE}?fecha_inicio=${encodeURIComponent(
        fecha_inicio_auditoria
      )}&fecha_fin=${encodeURIComponent(fecha_fin_auditoria)}`;
      const [asistencias_resp, multas_resp] = await Promise.all([
        clienteApi.get<Array<Record<string, unknown>>>(consulta_asistencia),
        clienteApi.get<Array<Record<string, unknown>>>(RUTAS_API.ASISTENCIA.MULTAS).catch(() => []),
      ]);

      const multas_por_asistencia = new Map<number, number>();
      const multas_por_becario_fecha = new Map<string, number>();
      if (Array.isArray(multas_resp)) {
        multas_resp.forEach((m) => {
          const monto = Number(m.monto_bs ?? 0);
          if (monto <= 0) return;
          if (m.asistencia_id) {
            multas_por_asistencia.set(
              Number(m.asistencia_id),
              (multas_por_asistencia.get(Number(m.asistencia_id)) || 0) + monto
            );
          } else if (m.becario_id && m.fecha_aplicacion) {
            const clave = `${m.becario_id}_${String(m.fecha_aplicacion).split("T")[0]}`;
            multas_por_becario_fecha.set(clave, (multas_por_becario_fecha.get(clave) || 0) + monto);
          }
        });
      }

      const registros_asistencia = (Array.isArray(asistencias_resp) ? asistencias_resp : []).map(
        (reg) => {
          const fecha_reg = reg.fecha ? String(reg.fecha).split("T")[0] : "";
          const es_escuela_lideres = (reg.tipo ?? reg.tipo_actividad) === "escuela_lideres";
          const multa_asociada = es_escuela_lideres
            ? reg.monto_multa_bs !== undefined
              ? Number(reg.monto_multa_bs)
              : multas_por_asistencia.get(Number(reg.id)) ??
                multas_por_becario_fecha.get(`${reg.becario_id}_${fecha_reg}`) ??
                0
            : 0;
          return {
            ...reg,
            monto_multa_bs: Number(multa_asociada.toFixed(2)),
          };
        }
      );

      await exportarAuditoriaAsistenciaExcel(registros_asistencia, periodo);
      toast.success("Auditoría de asistencia exportada a Excel (.xlsx)");
    } catch (error) {
      toast.error("Error al consultar datos reales para exportar Excel (.xlsx)", {
        description:
          error instanceof Error ? error.message : "Verifique la conexión con el servidor.",
      });
    } finally {
      set_exportando_excel_auditoria(false);
    }
  };

  const manejarExportarExcelIndividual = async () => {
    if (!estudiante_actual) {
      toast.warning("No hay ningún estudiante cargado para exportar.");
      return;
    }
    try {
      set_exportando_excel_individual(true);
      const calculo = await obtenerCalculoPagoPasajes({
        becario_id: estudiante_actual.id,
        periodo: mes_individual,
        descontar_multas,
      });
      await exportarFormularioContabilidadRsdExcel(
        calculo.becarios,
        mes_individual,
        descontar_multas
      );
      toast.success("Excel Contabilidad y RSD del becario exportado (.xlsx)", {
        description: `${estudiante_actual.nombre} · ${
          descontar_multas ? "Con descuento de multas" : "Sin descuento de multas"
        }.`,
      });
    } catch (error) {
      toast.error("Error al exportar Excel individual desde el servidor", {
        description:
          error instanceof Error ? error.message : "Verifique la conexión con el servidor.",
      });
    } finally {
      set_exportando_excel_individual(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* BARRA GLOBAL DE FILTRO POR RANGO DE FECHAS                    */}
      {/* ============================================================== */}
      <Card className="border-[#035683]/20 shadow-sm bg-gradient-to-r from-blue-50/40 via-white to-slate-50 rounded-2xl overflow-hidden ring-1 ring-[#035683]/10">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#035683]" />
                <span className="font-bold text-sm text-[#035683]">
                  Filtro Global de Rango de Fechas para Emisión Oficial
                </span>
                <Badge variant="outline" className="text-[10px] text-[#00ABBD] border-[#00ABBD]/40 font-mono">
                  PARAMÉTRICO
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Define el periodo que se aplicará a la emisión consolidada de pasajes, asistencias, justificaciones y exportaciones individuales.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Desde:</span>
                <SeleccionadorFecha
                  valorString={fecha_inicio_global}
                  alCambiarString={(val) => {
                    set_fecha_inicio_global(val);
                    set_fecha_inicio_auditoria(val);
                  }}
                  className="h-9 w-36 text-xs bg-white border-slate-200 rounded-xl"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Hasta:</span>
                <SeleccionadorFecha
                  valorString={fecha_fin_global}
                  alCambiarString={(val) => {
                    set_fecha_fin_global(val);
                    set_fecha_fin_auditoria(val);
                  }}
                  className="h-9 w-36 text-xs bg-white border-slate-200 rounded-xl"
                />
              </div>

              {/* Botones rápidos */}
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    set_fecha_inicio_global("2026-10-01");
                    set_fecha_fin_global("2026-10-31");
                    set_fecha_inicio_auditoria("2026-10-01");
                    set_fecha_fin_auditoria("2026-10-31");
                    set_mes_individual("2026-10");
                  }}
                  className="h-8 px-2.5 text-[11px] font-semibold border-slate-200 bg-white hover:bg-slate-100 cursor-pointer"
                >
                  Este Mes
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    set_fecha_inicio_global("2026-09-01");
                    set_fecha_fin_global("2026-09-30");
                    set_fecha_inicio_auditoria("2026-09-01");
                    set_fecha_fin_auditoria("2026-09-30");
                    set_mes_individual("2026-09");
                  }}
                  className="h-8 px-2.5 text-[11px] font-semibold border-slate-200 bg-white hover:bg-slate-100 cursor-pointer"
                >
                  Mes Anterior
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    set_fecha_inicio_global("2026-07-01");
                    set_fecha_fin_global("2026-11-30");
                    set_fecha_inicio_auditoria("2026-07-01");
                    set_fecha_fin_auditoria("2026-11-30");
                  }}
                  className="h-8 px-2.5 text-[11px] font-semibold border-[#00ABBD]/40 bg-[#00ABBD]/5 text-[#035683] hover:bg-[#00ABBD]/15 cursor-pointer"
                >
                  Semestre II-2026
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <SelectorPlanillaDonacion
        tipo_disponible="ambos"
        fecha_inicio={fecha_inicio_global}
        fecha_fin={fecha_fin_global}
        al_cambiar_fechas={(ini, fin) => {
          set_fecha_inicio_global(ini);
          set_fecha_fin_global(fin);
          set_fecha_inicio_auditoria(ini);
          set_fecha_fin_auditoria(fin);
        }}
        titulo="Planillas Oficiales de Donación (Contabilidad y Archivo del Área)"
        subtitulo="Emite las planillas oficiales de Donación para Refrigerio BUMAN-D y Donación para Transporte BUMAN-D eligiendo mes o rango de fechas, destino (Sin firma / Con firma) y los 2 firmantes."
      />

      {/* ============================================================== */}
      {/* PANEL DESTACADO: EXTRACCIÓN DE REPORTES POR INTERVALO DE FECHA */}
      {/* ============================================================== */}
      <Card className="border-[#00ABBD]/40 shadow-sm bg-gradient-to-r from-white via-slate-50 to-[#00ABBD]/5 rounded-2xl overflow-hidden ring-1 ring-[#00ABBD]/20">
        <CardHeader className="pb-3 border-b border-[#E5E7EB]/80 bg-[#035683]/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold font-display text-[#035683] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#00ABBD]" />
                Extracción de Reportes PDF por Intervalos de Fecha para Contabilidad
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Emisión de informes institucionales certificados filtrados por un intervalo exacto (fecha_inicio a fecha_fin) para contabilidad interna y financiera.
              </CardDescription>
            </div>
            <Badge className="bg-[#035683] text-[#FFB600] border-none text-[11px] font-mono self-start sm:self-center">
              CONTABILIDAD OFICIAL
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Selector de Tipo de Reporte */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-[#00ABBD]" />
                Tipo de Reporte Institucional para Contabilidad
              </label>
              <Select value={modulo_auditoria} onValueChange={(val) => val && set_modulo_auditoria(val)}>
                <SelectTrigger className="h-10 text-xs font-semibold border-[#E5E7EB] bg-white rounded-xl">
                  <SelectValue placeholder="Seleccione reporte para contabilidad" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E5E7EB]">
                  <SelectItem value="refrigerios">
                    🥟 Reporte de Refrigerios (Devolución 100% y Duplas)
                  </SelectItem>
                  <SelectItem value="asistencia">
                    ⏱️ Auditoría de Asistencia y Puntualidad (Corte Institucional)
                  </SelectItem>
                  <SelectItem value="pasajes">
                    🚌 Formulario para Contabilidad y RSD (Recorridos y Pasajes)
                  </SelectItem>
                  <SelectItem value="evaluaciones">
                    📋 Evaluaciones Semestrales Institucionales
                  </SelectItem>
                  <SelectItem value="consolidado-auditoria">
                    📊 Consolidado Integral de Contabilidad BUMAND
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fecha Inicio */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#00ABBD]" />
                Fecha Inicio
              </label>
              <SeleccionadorFecha
                valorString={fecha_inicio_auditoria}
                alCambiarString={(val) => set_fecha_inicio_auditoria(val)}
                className="h-10 text-xs border-[#E5E7EB] bg-white rounded-xl"
              />
            </div>

            {/* Fecha Fin */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#00ABBD]" />
                Fecha Fin
              </label>
              <SeleccionadorFecha
                valorString={fecha_fin_auditoria}
                alCambiarString={(val) => set_fecha_fin_auditoria(val)}
                className="h-10 text-xs border-[#E5E7EB] bg-white rounded-xl"
              />
            </div>
          </div>

          {/* Botones de acción de auditoría */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <span className="font-semibold text-slate-700">Acceso Rápido:</span>
              <button
                type="button"
                onClick={() => descargarReporteAuditoriaIntervalo("refrigerios")}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-[#00ABBD]/10 text-[#035683] font-bold text-[11px] transition-all cursor-pointer"
              >
                Refrigerios (PDF)
              </button>
              <button
                type="button"
                onClick={() => descargarReporteAuditoriaIntervalo("asistencia")}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-[#00ABBD]/10 text-[#035683] font-bold text-[11px] transition-all cursor-pointer"
              >
                Asistencia (PDF)
              </button>
              <button
                type="button"
                onClick={() => descargarReporteAuditoriaIntervalo("pasajes")}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-[#00ABBD]/10 text-[#035683] font-bold text-[11px] transition-all cursor-pointer"
              >
                Pasajes (PDF)
              </button>
              <button
                type="button"
                onClick={() => descargarReporteAuditoriaIntervalo("consolidado-auditoria")}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-[#00ABBD]/10 text-[#035683] font-bold text-[11px] transition-all cursor-pointer"
              >
                Consolidado Integral
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                variant="outline"
                disabled={exportando_excel_auditoria}
                onClick={manejarExportarExcelAuditoria}
                className="h-10 px-4 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold text-xs rounded-xl shadow-xs gap-2 cursor-pointer"
              >
                {exportando_excel_auditoria ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                )}
                <span>Exportar Excel</span>
              </Button>

              <Button
                disabled={descargando_auditoria}
                onClick={() => descargarReporteAuditoriaIntervalo()}
                className="h-10 px-5 bg-[#035683] hover:bg-[#035683]/90 text-white font-bold text-xs rounded-xl shadow-sm gap-2 shrink-0 cursor-pointer"
              >
                {descargando_auditoria ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#FFB600]" />
                ) : (
                  <Printer className="w-4 h-4 text-[#FFB600]" />
                )}
                <span>Extraer Reporte PDF para Contabilidad</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ============================================================== */}
      {/* BOTONES DE EMISIÓN INMEDIATA CON PUPPETEER                     */}
      {/* ============================================================== */}
      <Card className="border-[#E5E7EB] shadow-sm bg-white rounded-xl">
        <CardHeader className="pb-3 border-b border-[#E5E7EB]/60">
          <div>
            <CardTitle className="text-lg font-bold font-display text-[#035683] flex items-center gap-2">
              <Printer className="w-5 h-5 text-[#00ABBD]" />
              Emisión Oficial de Documentos y Reportes PDF
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Generación directa de archivos binarios PDF mediante Puppeteer headless en el servidor institucional.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* Botón 1: Evaluación Semestre II */}
            <Button
              disabled={descargando_id !== null}
              onClick={() =>
                descargarReportePuppeteer(
                  "semestre_ii",
                  "/pdf/evaluacion-semestral?periodo=II_2026",
                  "Evaluacion_Semestre_II_2026.pdf",
                  "evaluacion_semestral_ii"
                )
              }
              className="h-11 bg-[#035683] hover:bg-[#035683]/90 text-white font-bold text-xs rounded-xl flex items-center gap-2 justify-center shadow-sm cursor-pointer"
            >
              {descargando_id === "semestre_ii" ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#FFB600]" />
              ) : (
                <Printer className="w-4 h-4 text-[#FFB600]" />
              )}
              <span>Semestre II (2 Páginas)</span>
            </Button>

            {/* Botón: Formulario para Contabilidad y RSD (Pasajes General 80%) */}
            <Button
              disabled={descargando_id !== null}
              onClick={() =>
                descargarReportePuppeteer(
                  "pasajes_general",
                  `/pdf/pasajes-general?fecha_inicio=${fecha_inicio_global}&fecha_fin=${fecha_fin_global}&descontar_multas=${descontar_multas ? "true" : "false"}`,
                  `Formulario_Contabilidad_RSD_Pasajes_${fecha_inicio_global}_al_${fecha_fin_global}.pdf`,
                  "pasajes_general",
                  {
                    fecha_inicio: fecha_inicio_global,
                    fecha_fin: fecha_fin_global,
                    descontar_multas,
                  }
                )
              }
              variant="outline"
              className="h-11 border-blue-300 text-blue-900 bg-blue-50/50 hover:bg-blue-100 font-bold text-xs rounded-xl flex items-center gap-2 justify-center cursor-pointer shadow-xs"
            >
              {descargando_id === "pasajes_general" ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#035683]" />
              ) : (
                <Bus className="w-4 h-4 text-[#035683]" />
              )}
              <span>Formulario Contabilidad y RSD</span>
            </Button>

            {/* Botón: Reporte de Permisos y Justificaciones */}
            <Button
              disabled={descargando_id !== null}
              onClick={() =>
                descargarReportePuppeteer(
                  "justificaciones_general",
                  `/pdf/justificaciones-general?fecha_inicio=${fecha_inicio_global}&fecha_fin=${fecha_fin_global}`,
                  `Reporte_General_Justificaciones_${fecha_inicio_global}_al_${fecha_fin_global}.pdf`,
                  "justificaciones_general",
                  { fecha_inicio: fecha_inicio_global, fecha_fin: fecha_fin_global }
                )
              }
              variant="outline"
              className="h-11 border-amber-300 text-amber-900 bg-amber-50/50 hover:bg-amber-100 font-bold text-xs rounded-xl flex items-center gap-2 justify-center cursor-pointer shadow-xs"
            >
              {descargando_id === "justificaciones_general" ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
              ) : (
                <FileCheck2 className="w-4 h-4 text-amber-600" />
              )}
              <span>Permisos y Justificaciones</span>
            </Button>

            {/* Botón: Reporte Consolidado de Asistencias y Horas */}
            <Button
              disabled={descargando_id !== null}
              onClick={() =>
                descargarReportePuppeteer(
                  "asistencia_general",
                  `/pdf/asistencia-general?fecha_inicio=${fecha_inicio_global}&fecha_fin=${fecha_fin_global}`,
                  `Reporte_Consolidado_Asistencias_${fecha_inicio_global}_al_${fecha_fin_global}.pdf`,
                  "asistencia_general",
                  { fecha_inicio: fecha_inicio_global, fecha_fin: fecha_fin_global }
                )
              }
              variant="outline"
              className="h-11 border-cyan-300 text-cyan-900 bg-cyan-50/50 hover:bg-cyan-100 font-bold text-xs rounded-xl flex items-center gap-2 justify-center cursor-pointer shadow-xs"
            >
              {descargando_id === "asistencia_general" ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#00ABBD]" />
              ) : (
                <Clock className="w-4 h-4 text-[#00ABBD]" />
              )}
              <span>Consolidado Asistencia</span>
            </Button>

            {/* Botón 2: Corte de Horas */}
            <Button
              disabled={descargando_id !== null}
              onClick={() =>
                descargarReportePuppeteer(
                  "horas",
                  "/pdf/corte-asistencia?tipo=todas",
                  "Corte_Oficial_Horas_Practicas.pdf",
                  "horas"
                )
              }
              variant="outline"
              className="h-11 border-slate-300 text-[#035683] font-bold text-xs rounded-xl flex items-center gap-2 justify-center hover:bg-slate-50 cursor-pointer"
            >
              {descargando_id === "horas" ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#00ABBD]" />
              ) : (
                <FileText className="w-4 h-4 text-[#00ABBD]" />
              )}
              <span>Planilla Horas</span>
            </Button>

            {/* Botón 3: Reporte Refrigerios 100% */}
            <Button
              disabled={descargando_id !== null}
              onClick={() =>
                descargarReportePuppeteer(
                  "refrigerios",
                  "/pdf/refrigerios",
                  "Reporte_Oficial_Refrigerios.pdf",
                  "refrigerios"
                )
              }
              variant="outline"
              className="h-11 border-emerald-300 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-100 font-bold text-xs rounded-xl flex items-center gap-2 justify-center cursor-pointer"
            >
              {descargando_id === "refrigerios" ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              ) : (
                <Coffee className="w-4 h-4 text-emerald-600" />
              )}
              <span>Refrigerios (100% Devolución)</span>
            </Button>

            {/* Botón 4: Formulario F-03 */}
            <Button
              disabled={descargando_id !== null}
              onClick={() =>
                descargarReportePuppeteer(
                  "f03",
                  "/pdf/evaluacion/1",
                  "Formulario_F03_Pastoral.pdf",
                  "f03",
                  { becario_id: 1 }
                )
              }
              variant="outline"
              className="h-11 border-slate-300 text-[#035683] font-bold text-xs rounded-xl flex items-center gap-2 justify-center hover:bg-slate-50 cursor-pointer"
            >
              {descargando_id === "f03" ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-amber-600" />
              )}
              <span>Formulario F-03</span>
            </Button>

            {/* Botón 5: Asistencia de Escuela de Líderes (Enlazado con Multas y Permisos) */}
            <Button
              disabled={descargando_id !== null}
              onClick={() =>
                descargarReportePuppeteer(
                  "asistencia_escuela_lideres",
                  `/pdf/asistencia-escuela-lideres?fecha_inicio=${fecha_inicio_global}&fecha_fin=${fecha_fin_global}`,
                  `Asistencia_Escuela_Lideres_Multas_Permisos_${fecha_inicio_global}_al_${fecha_fin_global}.pdf`,
                  "escuela_lideres",
                  {
                    modulo: "escuela_lideres",
                    fecha_inicio: fecha_inicio_global,
                    fecha_fin: fecha_fin_global,
                  }
                )
              }
              variant="outline"
              className="h-11 border-indigo-300 text-indigo-900 bg-indigo-50/50 hover:bg-indigo-100 font-bold text-xs rounded-xl flex items-center gap-2 justify-center cursor-pointer shadow-xs"
              title="Reporte de Asistencia de Escuela de Líderes (todos los becarios, entrada 14:30) enlazado con multas y permisos"
            >
              {descargando_id === "asistencia_escuela_lideres" ? (
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              ) : (
                <Sparkles className="w-4 h-4 text-indigo-600" />
              )}
              <span>Asistencia Escuela de Líderes</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ============================================================== */}
      {/* MÓDULO ESPECIAL: EXPORTACIÓN INDIVIDUAL POR ESTUDIANTE         */}
      {/* ============================================================== */}
      <Card className="border-[#035683]/30 shadow-md bg-white rounded-xl overflow-hidden ring-1 ring-[#035683]/10">
        <CardHeader className="pb-3 border-b border-[#E5E7EB]/80 bg-gradient-to-r from-[#035683]/5 via-white to-[#00ABBD]/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold font-display text-[#035683] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#035683]" />
                Exportación Individual de Expediente y Asistencia por Estudiante
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Genera el expediente mensual de recorridos con liquidación del 80% o el kárdex individual de asistencia mensual mediante Puppeteer.
              </CardDescription>
            </div>
            <Badge className="bg-[#035683] text-[#FFB600] border-none text-[11px] font-mono self-start sm:self-center">
              PUPPETEER ENGINE
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Selector de Estudiante */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#00ABBD]" />
                Seleccionar Estudiante Becario (Nómina BUMAND)
              </label>
              <Select
                value={String(estudiante_seleccionado_id)}
                onValueChange={(val) => val && set_estudiante_seleccionado_id(Number(val))}
              >
                <SelectTrigger className="h-10 text-xs font-semibold border-[#E5E7EB] bg-slate-50 rounded-xl">
                  <SelectValue placeholder="Seleccione un estudiante" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E5E7EB] max-h-72">
                  {lista_becarios.map((becario) => (
                    <SelectItem
                      key={becario.id}
                      value={String(becario.id)}
                      etiqueta={`${becario.nombre} (${becario.carrera})`}
                    >
                      <div className="flex flex-col py-0.5 text-left">
                        <span className="font-semibold text-slate-800">{becario.nombre}</span>
                        <span className="text-[11px] text-slate-500">CI: {becario.ci} · {becario.carrera}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selector de Mes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#00ABBD]" />
                Mes del Expediente
              </label>
              <Select value={mes_individual} onValueChange={(val) => val && set_mes_individual(val)}>
                <SelectTrigger className="h-10 text-xs font-semibold border-[#E5E7EB] bg-slate-50 rounded-xl">
                  <SelectValue placeholder="Mes" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E5E7EB]">
                  {opciones_meses.map((op) => (
                    <SelectItem key={op.valor} value={op.valor}>
                      {op.etiqueta}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tarjeta Informativa del Becario Seleccionado */}
          {!estudiante_actual ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-[#00ABBD]" />
              <span>Cargando o sin becarios disponibles en la nómina para exportación individual...</span>
            </div>
          ) : (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#035683] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {(estudiante_actual.nombre || "B").charAt(0)}
              </div>
              <div>
                <span className="font-bold text-[#035683]">{estudiante_actual.nombre}</span>
                <p className="text-[11px] text-muted-foreground">
                  CI: {estudiante_actual.ci} LP · Carrera: {estudiante_actual.carrera} · Sede: {estudiante_actual.sede}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Botón A: Expediente de Recorridos Mensual */}
              <Button
                size="sm"
                disabled={descargando_id !== null}
                onClick={() =>
                  descargarReportePuppeteer(
                    `recorridos_${estudiante_actual.id}`,
                    `/pdf/recorridos-estudiante/${estudiante_actual.id}?mes=${mes_individual}&fecha_inicio=${fecha_inicio_global}&fecha_fin=${fecha_fin_global}`,
                    `Expediente_Recorridos_${estudiante_actual.nombre.replace(/\s+/g, "_")}_${mes_individual}.pdf`,
                    "recorridos_estudiante",
                    {
                      becario_id: estudiante_actual.id,
                      nombre_becario: estudiante_actual.nombre,
                      mes: mes_individual,
                      fecha_inicio: fecha_inicio_global,
                      fecha_fin: fecha_fin_global,
                    }
                  )
                }
                className="h-9 px-3.5 bg-[#035683] hover:bg-[#035683]/90 text-white font-bold text-xs rounded-xl shadow-xs gap-1.5 cursor-pointer"
              >
                {descargando_id === `recorridos_${estudiante_actual.id}` ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FFB600]" />
                ) : (
                  <Bus className="w-3.5 h-3.5 text-[#FFB600]" />
                )}
                <span>Expediente de Recorridos (PDF)</span>
              </Button>

              {/* Botón B: Asistencia Mensual */}
              <Button
                size="sm"
                variant="outline"
                disabled={descargando_id !== null}
                onClick={() =>
                  descargarReportePuppeteer(
                    `asistencia_${estudiante_actual.id}`,
                    `/pdf/asistencia-estudiante/${estudiante_actual.id}?mes=${mes_individual}&fecha_inicio=${fecha_inicio_global}&fecha_fin=${fecha_fin_global}`,
                    `Asistencia_Mensual_${estudiante_actual.nombre.replace(/\s+/g, "_")}_${mes_individual}.pdf`,
                    "asistencia_estudiante",
                    {
                      becario_id: estudiante_actual.id,
                      nombre_becario: estudiante_actual.nombre,
                      mes: mes_individual,
                      fecha_inicio: fecha_inicio_global,
                      fecha_fin: fecha_fin_global,
                    }
                  )
                }
                className="h-9 px-3.5 border-[#035683] text-[#035683] hover:bg-slate-100 font-bold text-xs rounded-xl shadow-2xs gap-1.5 cursor-pointer"
              >
                {descargando_id === `asistencia_${estudiante_actual.id}` ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00ABBD]" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-[#00ABBD]" />
                )}
                <span>Asistencia Mensual (PDF)</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                disabled={exportando_excel_individual}
                onClick={manejarExportarExcelIndividual}
                className="h-9 px-3 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold text-xs rounded-xl shadow-2xs gap-1.5 cursor-pointer"
              >
                {exportando_excel_individual ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                ) : (
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span>Exportar Excel</span>
              </Button>
            </div>
          </div>
          )}
        </CardContent>
      </Card>

      {/* ============================================================== */}
      {/* HISTORIAL DE DOCUMENTOS OFICIALES DISPONIBLES                  */}
      {/* ============================================================== */}
      <Card className="border-[#E5E7EB] shadow-sm bg-white rounded-xl">
        <CardHeader className="pb-3 border-b border-[#E5E7EB]/60">
          <CardTitle className="text-base font-bold font-display text-[#035683]">
            Historial de Reportes Emitidos y Archivados
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Documentos oficiales certificados disponibles para descarga directa en formato PDF.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/60">
              <TableRow className="border-b border-[#E5E7EB]">
                <TableHead className="font-bold text-[#035683]">Documento Oficial</TableHead>
                <TableHead className="font-bold text-[#035683]">Periodo</TableHead>
                <TableHead className="font-bold text-[#035683]">Destinatario / Alcance</TableHead>
                <TableHead className="font-bold text-[#035683]">Fecha Emisión</TableHead>
                <TableHead className="font-bold text-[#035683] text-center">Descarga Puppeteer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                    No hay reportes emitidos ni archivados en este período. Utilice los controles superiores para generar un reporte PDF desde base de datos.
                  </TableCell>
                </TableRow>
              ) : (
              reportes.map((r) => {
                const en_descarga = descargando_id === String(r.id);
                return (
                  <TableRow key={r.id} className="border-b border-[#E5E7EB]/40 hover:bg-[#00ABBD]/5 text-xs">
                    <TableCell className="font-semibold text-[#1E293B]">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-[#035683]/5 text-[#035683]">
                          {r.tipo === "refrigerios" ? (
                            <Coffee className="w-4 h-4 text-emerald-600" />
                          ) : r.tipo === "pasajes" ? (
                            <Bus className="w-4 h-4 text-[#00ABBD]" />
                          ) : r.tipo === "consolidado-auditoria" ? (
                            <ShieldCheck className="w-4 h-4 text-[#035683]" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                        </div>
                        <span>{r.titulo}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-[11px] font-bold text-muted-foreground">
                      {r.periodo}
                    </TableCell>
                    <TableCell>{r.becario_nombre}</TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                      {r.fecha_generacion}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={descargando_id !== null}
                        onClick={() => {
                          const mapaTipos: Record<string, any> = {
                            evaluacion_semestral_ii: "evaluacion_semestral_ii",
                            asistencia: "horas",
                            pasajes: "recorridos_estudiante",
                            evaluacion_f03: "f03",
                            evento: "evento",
                            refrigerios: "refrigerios",
                            "consolidado-auditoria": "auditoria",
                          };
                          const endpoint_reporte =
                            r.tipo === "consolidado-auditoria"
                              ? `${r.endpoint}?descontar_multas=${descontar_multas ? "true" : "false"}`
                              : r.endpoint;
                          descargarReportePuppeteer(
                            String(r.id),
                            endpoint_reporte,
                            r.nombre_archivo,
                            mapaTipos[r.tipo] || "evaluacion_semestral_ii",
                            { becario_id: r.id, mes: mes_individual, descontar_multas }
                          );
                        }}
                        className="h-8 px-3 border-[#00ABBD] text-[#035683] hover:bg-[#00ABBD]/10 rounded-lg text-xs font-bold inline-flex items-center gap-1.5"
                      >
                        {en_descarga ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00ABBD]" />
                            <span>Generando...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5 text-[#00ABBD]" />
                            <span>Descargar PDF</span>
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
