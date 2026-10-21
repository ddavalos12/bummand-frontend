"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
} from "lucide-react";
import { toast } from "sonner";
import { clienteApi } from "@/lib/cliente-api";

interface ReporteItem {
  id: number;
  titulo: string;
  tipo: "evaluacion_semestral_ii" | "asistencia" | "pasajes" | "evaluacion_f03" | "evento";
  periodo: string;
  fecha_generacion: string;
  becario_nombre: string;
  tamano_kb: number;
  endpoint: string;
  nombre_archivo: string;
}

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
    id: 3,
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
    id: 4,
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
    id: 5,
    titulo: "Corte Semanal de Horas de Escuela de Líderes (Viernes)",
    tipo: "asistencia",
    periodo: "Octubre 2026",
    fecha_generacion: "2026-10-17 19:00",
    becario_nombre: "Módulo Teológico CETI",
    tamano_kb: 340,
    endpoint: "/pdf/corte-asistencia?tipo=escuela_lideres",
    nombre_archivo: "Corte_Asistencia_Escuela_Lideres.pdf",
  },
];

export function VisorReportesPdf() {
  const [reportes] = useState<ReporteItem[]>(REPORTES_DISPONIBLES);
  const [descargando_id, set_descargando_id] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      {/* Botones de Emisión Inmediata de Reportes con Puppeteer */}
      <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-xl">
        <CardHeader className="pb-3 border-b border-[#E3DCCB]/60">
          <div>
            <CardTitle className="text-lg font-bold font-display text-[#063A6B] flex items-center gap-2">
              <Printer className="w-5 h-5 text-[#17B4C4]" />
              Emisión Oficial de Documentos y Reportes PDF
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Generación directa de archivos binarios PDF mediante Puppeteer headless en el servidor institucional.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
              className="h-11 bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold text-xs rounded-xl flex items-center gap-2 justify-center shadow-sm"
            >
              {descargando_id === "semestre_ii" ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#F8C766]" />
              ) : (
                <Printer className="w-4 h-4 text-[#F8C766]" />
              )}
              <span>Descargar PDF Semestre II (2 Páginas)</span>
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
              className="h-11 border-slate-300 text-[#063A6B] font-bold text-xs rounded-xl flex items-center gap-2 justify-center hover:bg-slate-50"
            >
              {descargando_id === "horas" ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#17B4C4]" />
              ) : (
                <FileText className="w-4 h-4 text-[#17B4C4]" />
              )}
              <span>Descargar Planilla Horas</span>
            </Button>

            {/* Botón 3: Formulario F-03 */}
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
              className="h-11 border-slate-300 text-[#063A6B] font-bold text-xs rounded-xl flex items-center gap-2 justify-center hover:bg-slate-50"
            >
              {descargando_id === "f03" ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-amber-600" />
              )}
              <span>Descargar Formulario F-03</span>
            </Button>

            {/* Botón 4: Acta de Evento */}
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
              className="h-11 border-slate-300 text-[#063A6B] font-bold text-xs rounded-xl flex items-center gap-2 justify-center hover:bg-slate-50"
            >
              {descargando_id === "evento" ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#17B4C4]" />
              ) : (
                <Sparkles className="w-4 h-4 text-[#17B4C4]" />
              )}
              <span>Descargar Acta de Evento</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Historial de Documentos Oficiales Disponibles */}
      <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-xl">
        <CardHeader className="pb-3 border-b border-[#E3DCCB]/60">
          <CardTitle className="text-base font-bold font-display text-[#063A6B]">
            Historial de Reportes Emitidos y Archivados
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Documentos oficiales certificados disponibles para descarga directa en formato PDF.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/60">
              <TableRow className="border-b border-[#E3DCCB]">
                <TableHead className="font-bold text-[#063A6B]">Documento Oficial</TableHead>
                <TableHead className="font-bold text-[#063A6B]">Periodo</TableHead>
                <TableHead className="font-bold text-[#063A6B]">Destinatario / Alcance</TableHead>
                <TableHead className="font-bold text-[#063A6B]">Fecha Emisión</TableHead>
                <TableHead className="font-bold text-[#063A6B] text-center">Descarga Puppeteer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportes.map((r) => {
                const en_descarga = descargando_id === String(r.id);
                return (
                  <TableRow key={r.id} className="border-b border-[#E3DCCB]/40 hover:bg-[#17B4C4]/5 text-xs">
                    <TableCell className="font-semibold text-[#1E293B]">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-[#063A6B]/5 text-[#063A6B]">
                          <FileText className="w-4 h-4" />
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
                        className="h-8 px-3 border-[#17B4C4] text-[#063A6B] hover:bg-[#17B4C4]/10 rounded-lg text-xs font-bold inline-flex items-center gap-1.5"
                      >
                        {en_descarga ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#17B4C4]" />
                            <span>Generando...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5 text-[#17B4C4]" />
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
