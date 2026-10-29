"use client";

import { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { clienteApi } from "@/lib/cliente-api";

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

export const LISTA_23_BECARIOS_REPORTES = [
  { id: 1, nombre: "Adai Belen Huayta Cardozo", ci: "13696496", carrera: "Estadística", sede: "Sede Central Blq. A" },
  { id: 2, nombre: "Daniel Davalos Quiñonez", ci: "9107373", carrera: "Informática", sede: "Seguridad Física" },
  { id: 3, nombre: "Edgar Elías Alarcon Huanca", ci: "9160054", carrera: "Medicina", sede: "Consultorio Médico" },
  { id: 4, nombre: "Nilda Amalia Churata Paye", ci: "10028341", carrera: "Educación Parvularia", sede: "Seguridad Física" },
  { id: 5, nombre: "Alejandro Roberth Paredes Tarquino", ci: "10064956", carrera: "Comunicación Social", sede: "Marketing y Comunicación" },
  { id: 6, nombre: "Aydee Ruth Ali Condori", ci: "9952878", carrera: "Contaduría Pública", sede: "Finanzas y Tesorería" },
  { id: 7, nombre: "Carlos Oscar Luna Lizarraga", ci: "9943280", carrera: "Economía", sede: "Auditoría Interna" },
  { id: 8, nombre: "Isaías Daniel Herrera Mamani", ci: "10920862", carrera: "Arquitectura", sede: "Administración" },
  { id: 9, nombre: "José Marcos Suñagua Quispe", ci: "14378720", carrera: "Informática", sede: "Riesgos" },
  { id: 10, nombre: "Mariela Dayana Jimenez Chambi", ci: "12959656", carrera: "Contaduría Pública", sede: "Seguros" },
  { id: 11, nombre: "Mayherli Alejandra Loza Villalobos", ci: "9925727", carrera: "Contaduría Pública", sede: "Finanzas y Tesorería" },
  { id: 12, nombre: "Noemi Callisaya Alvarez", ci: "7093658", carrera: "Psicomotricidad y Deportes", sede: "Consultorio Médico" },
  { id: 13, nombre: "Ronald Mauricio Quiquijana Mayta", ci: "6172054", carrera: "Telecomunicaciones", sede: "Seguridad de la Información" },
  { id: 14, nombre: "Ruddy Flores Tapia", ci: "9974211", carrera: "Informática", sede: "Planificación" },
  { id: 15, nombre: "Gonzalo Valencia Laura", ci: "8416501", carrera: "Contaduría Pública", sede: "Contabilidad" },
  { id: 16, nombre: "Gustavo Ariel Condori Montaño", ci: "13088041", carrera: "Contaduría Pública", sede: "Captaciones" },
  { id: 17, nombre: "Lisbeth Pacasi Machaca", ci: "13603536", carrera: "Bioquímica y Farmacia", sede: "Consultorio Médico" },
  { id: 18, nombre: "Selena Fernanda Pillco Mamani", ci: "13693151", carrera: "Economía", sede: "Captaciones" },
];

const REPORTES_DISPONIBLES: ReporteItem[] = [
  {
    id: 1,
    titulo: "Evaluación del Semestre II - 2026 (2 Páginas Landscape)",
    tipo: "evaluacion_semestral_ii",
    periodo: "Semestre II - 2026",
    fecha_generacion: "2026-10-18 10:00",
    becario_nombre: "Consolidado Institucional (21 Becarios)",
    tamano_kb: 76,
    endpoint: "/pdf/evaluacion-semestral?periodo=II_2026",
    nombre_archivo: "Evaluacion_Semestre_II_2026.pdf",
  },
  {
    id: 2,
    titulo: "Expediente Mensual de Recorridos (Por Estudiante)",
    tipo: "pasajes",
    periodo: "Octubre 2026",
    fecha_generacion: "2026-10-22 10:00",
    becario_nombre: "Carlos Oscar Luna Lizarraga",
    tamano_kb: 320,
    endpoint: "/pdf/recorridos-estudiante/7?mes=2026-10",
    nombre_archivo: "Expediente_Recorridos_Carlos_Luna_Octubre_2026.pdf",
  },
  {
    id: 3,
    titulo: "Kárdex Individual de Asistencia Mensual",
    tipo: "asistencia",
    periodo: "Octubre 2026",
    fecha_generacion: "2026-10-22 10:00",
    becario_nombre: "Adai Belen Huayta Cardozo",
    tamano_kb: 360,
    endpoint: "/pdf/asistencia-estudiante/1?mes=2026-10",
    nombre_archivo: "Asistencia_Mensual_Adai_Huayta_Octubre_2026.pdf",
  },
  {
    id: 4,
    titulo: "Corte Oficial de Horas y Prácticas Preprofesionales",
    tipo: "asistencia",
    periodo: "Octubre 2026",
    fecha_generacion: "2026-10-20 18:30",
    becario_nombre: "Auditoría General de Prácticas",
    tamano_kb: 420,
    endpoint: "/pdf/corte-asistencia?tipo=todas",
    nombre_archivo: "Corte_Horas_Practicas_Octubre_2026.pdf",
  },
  {
    id: 5,
    titulo: "Formulario F-03: Evaluación Pastoral y Eclesiástica",
    tipo: "evaluacion_f03",
    periodo: "Semestre II - 2026",
    fecha_generacion: "2026-10-15 11:00",
    becario_nombre: "María Catunta Laime",
    tamano_kb: 285,
    endpoint: "/pdf/evaluacion/1",
    nombre_archivo: "Formulario_F03_Evaluacion_Pastoral.pdf",
  },
  {
    id: 6,
    titulo: "Acta de Asistencia a Encuentro y Acción de Servicio",
    tipo: "evento",
    periodo: "Gestión 2026",
    fecha_generacion: "2026-10-12 16:45",
    becario_nombre: "Control Geodésico de Convocatoria",
    tamano_kb: 310,
    endpoint: "/pdf/evento/1",
    nombre_archivo: "Acta_Asistencia_Evento_Oficial.pdf",
  },
  {
    id: 7,
    titulo: "Corte Semanal de Horas de Escuela de Líderes (Viernes)",
    tipo: "asistencia",
    periodo: "Octubre 2026",
    fecha_generacion: "2026-10-17 19:00",
    becario_nombre: "Módulo Teológico CETI",
    tamano_kb: 340,
    endpoint: "/pdf/corte-asistencia?tipo=escuela_lideres",
    nombre_archivo: "Corte_Asistencia_Escuela_Lideres.pdf",
  },
  {
    id: 8,
    titulo: "Reporte de Refrigerios (Devolución 100% y Duplas)",
    tipo: "refrigerios",
    periodo: "Gestión 2026",
    fecha_generacion: "2026-10-24 16:00",
    becario_nombre: "Nómina de Duplas y Rendiciones (23 Becarios)",
    tamano_kb: 295,
    endpoint: "/pdf/refrigerios",
    nombre_archivo: "Reporte_Oficial_Refrigerios_Diaconia.pdf",
  },
  {
    id: 9,
    titulo: "Consolidado Integral de Auditoría BUMAND (Multas, Horas, Refrigerios y Pasajes)",
    tipo: "consolidado-auditoria",
    periodo: "Octubre 2026",
    fecha_generacion: "2026-10-25 18:00",
    becario_nombre: "Auditoría Financiera y Operativa General",
    tamano_kb: 512,
    endpoint: "/pdf/consolidado-auditoria",
    nombre_archivo: "Consolidado_Auditoria_General_BUMAND.pdf",
  },
];

export function VisorReportesPdf() {
  const [reportes] = useState<ReporteItem[]>(REPORTES_DISPONIBLES);
  const [descargando_id, set_descargando_id] = useState<string | null>(null);

  // Estados para exportación individual por estudiante
  const [estudiante_seleccionado_id, set_estudiante_seleccionado_id] = useState<number>(7);
  const [mes_individual, set_mes_individual] = useState<string>("2026-10");

  // Estados para panel de auditoría por intervalo de fechas
  const [modulo_auditoria, set_modulo_auditoria] = useState<string>("refrigerios");
  const [fecha_inicio_auditoria, set_fecha_inicio_auditoria] = useState<string>("2026-10-01");
  const [fecha_fin_auditoria, set_fecha_fin_auditoria] = useState<string>("2026-10-31");
  const [descargando_auditoria, set_descargando_auditoria] = useState<boolean>(false);

  const estudiante_actual =
    LISTA_23_BECARIOS_REPORTES.find((b) => b.id === estudiante_seleccionado_id) ||
    LISTA_23_BECARIOS_REPORTES[0];

  const descargarReportePuppeteer = async (clave: string, endpoint: string, nombre_archivo: string) => {
    try {
      set_descargando_id(clave);
      toast.info("Generando informe oficial con Puppeteer en el servidor...", {
        description: `Procesando "${nombre_archivo}" en formato PDF.`,
      });

      const blob = await clienteApi.descargarBlob(endpoint);
      const url = window.URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = nombre_archivo;
      document.body.appendChild(enlace);
      enlace.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(enlace);

      toast.success("Documento PDF descargado exitosamente", {
        description: `Archivo "${nombre_archivo}" generado con Puppeteer.`,
      });
    } catch (_error) {
      toast.error("Error al descargar PDF con Puppeteer", {
        description: "Verifique que el backend de BUMAND esté en ejecución.",
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
        ruta_base = "/pdf/recorridos-estudiante/todos";
        nombre_doc = "Expediente_Pasajes";
      } else if (mod === "evaluaciones") {
        ruta_base = "/pdf/evaluacion-semestral";
        nombre_doc = "Evaluaciones_Semestrales";
      } else if (mod === "consolidado-auditoria") {
        ruta_base = "/pdf/consolidado-auditoria";
        nombre_doc = "Consolidado_Auditoria_BUMAND";
      }

      const separador = ruta_base.includes("?") ? "&" : "?";
      const ruta_completa = `${ruta_base}${separador}fecha_inicio=${fecha_inicio_auditoria}&fecha_fin=${fecha_fin_auditoria}`;
      const nombre_archivo = `Reporte_Auditoria_${nombre_doc}_${fecha_inicio_auditoria}_al_${fecha_fin_auditoria}.pdf`;

      toast.info(`Generando Reporte de Auditoría (${nombre_doc}) en PDF...`, {
        description: `Rango: ${fecha_inicio_auditoria} a ${fecha_fin_auditoria}.`,
      });

      const blob = await clienteApi.descargarBlob(ruta_completa);
      const url = window.URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = nombre_archivo;
      document.body.appendChild(enlace);
      enlace.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(enlace);

      toast.success("Reporte PDF para auditoría generado exitosamente", {
        description: `Archivo "${nombre_archivo}" listo.`,
      });
    } catch (_error) {
      toast.error("Error al extraer reporte PDF para auditoría", {
        description: "Verifique los parámetros de fecha o el servicio backend.",
      });
    } finally {
      set_descargando_auditoria(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* PANEL DESTACADO: EXTRACCIÓN DE REPORTES POR INTERVALO DE FECHA */}
      {/* ============================================================== */}
      <Card className="border-[#00ABBD]/40 shadow-sm bg-gradient-to-r from-white via-slate-50 to-[#00ABBD]/5 rounded-2xl overflow-hidden ring-1 ring-[#00ABBD]/20">
        <CardHeader className="pb-3 border-b border-[#E5E7EB]/80 bg-[#035683]/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold font-display text-[#035683] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#00ABBD]" />
                Extracción de Reportes PDF por Intervalos de Fecha para Auditoría
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Emisión de informes institucionales certificados filtrados por un intervalo exacto (fecha_inicio a fecha_fin) para auditoría interna y financiera.
              </CardDescription>
            </div>
            <Badge className="bg-[#035683] text-[#FFB600] border-none text-[11px] font-mono self-start sm:self-center">
              AUDITORÍA OFICIAL
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Selector de Tipo de Reporte */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-[#00ABBD]" />
                Tipo de Reporte Institucional para Auditoría
              </label>
              <Select value={modulo_auditoria} onValueChange={(val) => val && set_modulo_auditoria(val)}>
                <SelectTrigger className="h-10 text-xs font-semibold border-[#E5E7EB] bg-white rounded-xl">
                  <SelectValue placeholder="Seleccione reporte para auditar" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E5E7EB]">
                  <SelectItem value="refrigerios">
                    🥟 Reporte de Refrigerios (Devolución 100% y Duplas)
                  </SelectItem>
                  <SelectItem value="asistencia">
                    ⏱️ Auditoría de Asistencia y Puntualidad (Corte Institucional)
                  </SelectItem>
                  <SelectItem value="pasajes">
                    🚌 Expediente Consolidado de Recorridos y Pasajes
                  </SelectItem>
                  <SelectItem value="evaluaciones">
                    📋 Evaluaciones Semestrales Institucionales
                  </SelectItem>
                  <SelectItem value="consolidado-auditoria">
                    📊 Consolidado Integral de Auditoría BUMAND
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
              <span>Extraer Reporte PDF para Auditoría</span>
            </Button>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Botón 1: Evaluación Semestre II */}
            <Button
              disabled={descargando_id !== null}
              onClick={() =>
                descargarReportePuppeteer(
                  "semestre_ii",
                  "/pdf/evaluacion-semestral?periodo=II_2026",
                  "Evaluacion_Semestre_II_2026.pdf"
                )
              }
              className="h-11 bg-[#035683] hover:bg-[#035683]/90 text-white font-bold text-xs rounded-xl flex items-center gap-2 justify-center shadow-sm"
            >
              {descargando_id === "semestre_ii" ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#FFB600]" />
              ) : (
                <Printer className="w-4 h-4 text-[#FFB600]" />
              )}
              <span>Semestre II (2 Páginas)</span>
            </Button>

            {/* Botón 2: Corte de Horas */}
            <Button
              disabled={descargando_id !== null}
              onClick={() =>
                descargarReportePuppeteer(
                  "horas",
                  "/pdf/corte-asistencia?tipo=todas",
                  "Corte_Oficial_Horas_Practicas.pdf"
                )
              }
              variant="outline"
              className="h-11 border-slate-300 text-[#035683] font-bold text-xs rounded-xl flex items-center gap-2 justify-center hover:bg-slate-50"
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
                  "Reporte_Oficial_Refrigerios.pdf"
                )
              }
              variant="outline"
              className="h-11 border-emerald-300 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-100 font-bold text-xs rounded-xl flex items-center gap-2 justify-center"
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
                  "Formulario_F03_Pastoral.pdf"
                )
              }
              variant="outline"
              className="h-11 border-slate-300 text-[#035683] font-bold text-xs rounded-xl flex items-center gap-2 justify-center hover:bg-slate-50"
            >
              {descargando_id === "f03" ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-amber-600" />
              )}
              <span>Formulario F-03</span>
            </Button>

            {/* Botón 5: Acta de Evento */}
            <Button
              disabled={descargando_id !== null}
              onClick={() =>
                descargarReportePuppeteer(
                  "evento",
                  "/pdf/evento/1",
                  "Acta_Asistencia_Evento.pdf"
                )
              }
              variant="outline"
              className="h-11 border-slate-300 text-[#035683] font-bold text-xs rounded-xl flex items-center gap-2 justify-center hover:bg-slate-50"
            >
              {descargando_id === "evento" ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#00ABBD]" />
              ) : (
                <Sparkles className="w-4 h-4 text-[#00ABBD]" />
              )}
              <span>Acta de Evento</span>
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
                  {LISTA_23_BECARIOS_REPORTES.map((becario) => (
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
                  <SelectItem value="2026-10">Octubre 2026 (Actual)</SelectItem>
                  <SelectItem value="2026-09">Septiembre 2026</SelectItem>
                  <SelectItem value="2026-08">Agosto 2026</SelectItem>
                  <SelectItem value="2026-07">Julio 2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tarjeta Informativa del Becario Seleccionado */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#035683] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {estudiante_actual.nombre.charAt(0)}
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
                    `/pdf/recorridos-estudiante/${estudiante_actual.id}?mes=${mes_individual}`,
                    `Expediente_Recorridos_${estudiante_actual.nombre.replace(/\s+/g, "_")}_${mes_individual}.pdf`
                  )
                }
                className="h-9 px-3.5 bg-[#035683] hover:bg-[#035683]/90 text-white font-bold text-xs rounded-xl shadow-xs gap-1.5"
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
                    `/pdf/asistencia-estudiante/${estudiante_actual.id}?mes=${mes_individual}`,
                    `Asistencia_Mensual_${estudiante_actual.nombre.replace(/\s+/g, "_")}_${mes_individual}.pdf`
                  )
                }
                className="h-9 px-3.5 border-[#035683] text-[#035683] hover:bg-slate-100 font-bold text-xs rounded-xl shadow-2xs gap-1.5"
              >
                {descargando_id === `asistencia_${estudiante_actual.id}` ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00ABBD]" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-[#00ABBD]" />
                )}
                <span>Asistencia Mensual (PDF)</span>
              </Button>
            </div>
          </div>
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
              {reportes.map((r) => {
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
                        onClick={() => descargarReportePuppeteer(String(r.id), r.endpoint, r.nombre_archivo)}
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
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
