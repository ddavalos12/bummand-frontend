"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, Printer, CheckCircle, Clock, ShieldCheck, Sparkles } from "lucide-react";

interface ReporteItem {
  id: number;
  titulo: string;
  tipo: "asistencia" | "pasajes" | "evaluacion_f03" | "consolidado_360";
  periodo: string;
  fecha_generacion: string;
  becario_nombre: string;
  tamano_kb: number;
  estado: "emitido" | "en_proceso";
}

const REPORTES_INICIALES: ReporteItem[] = [
  {
    id: 1,
    titulo: "Informe Mensual de Horas y Prácticas Preprofesionales",
    tipo: "asistencia",
    periodo: "Septiembre 2026",
    fecha_generacion: "2026-09-30 18:30",
    becario_nombre: "Nilda Amalia Churata Paye",
    tamano_kb: 420,
    estado: "emitido",
  },
  {
    id: 2,
    titulo: "Formulario Oficial de Devolución del 80% de Pasajes",
    tipo: "pasajes",
    periodo: "Septiembre 2026",
    fecha_generacion: "2026-09-28 14:15",
    becario_nombre: "Nilda Amalia Churata Paye",
    tamano_kb: 310,
    estado: "emitido",
  },
  {
    id: 3,
    titulo: "Formulario F-03: Evaluación Pastoral y Eclesiástica",
    tipo: "evaluacion_f03",
    periodo: "Semestre II - 2026",
    fecha_generacion: "2026-09-20 11:00",
    becario_nombre: "Edgar Elias Alarcon Huanca",
    tamano_kb: 285,
    estado: "emitido",
  },
  {
    id: 4,
    titulo: "Certificado Integral de Desempeño y Liderazgo 360°",
    tipo: "consolidado_360",
    periodo: "Semestre I - 2026",
    fecha_generacion: "2026-07-02 09:45",
    becario_nombre: "Adai Belen Huayta Cardozo",
    tamano_kb: 650,
    estado: "emitido",
  },
];

export function VisorReportesPdf() {
  const [reportes, set_reportes] = useState<ReporteItem[]>(REPORTES_INICIALES);
  const [generando, set_generando] = useState(false);
  const [mensaje_exito, set_mensaje_exito] = useState("");

  const manejarGenerarNuevoReporte = (tipo: ReporteItem["tipo"], titulo: string) => {
    set_generando(true);
    set_mensaje_exito("");

    setTimeout(() => {
      const nuevo: ReporteItem = {
        id: reportes.length + 1,
        titulo,
        tipo,
        periodo: "Octubre 2026",
        fecha_generacion: new Date().toISOString().replace("T", " ").substring(0, 16),
        becario_nombre: "Nilda Amalia Churata Paye",
        tamano_kb: 380,
        estado: "emitido",
      };
      set_reportes([nuevo, ...reportes]);
      set_generando(false);
      set_mensaje_exito(`Reporte "${titulo}" generado exitosamente en formato oficial BUMAND.`);
    }, 1200);
  };

  const simularDescarga = (titulo: string) => {
    alert(`Descargando reporte oficial: ${titulo}.pdf\nConforme a los estándares de Diaconía FRIF-IFD.`);
  };

  return (
    <div className="space-y-6">
      {/* Botones de Emisión Inmediata de Reportes */}
      <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-xl">
        <CardHeader className="pb-3 border-b border-[#E3DCCB]/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-bold font-display text-[#063A6B] flex items-center gap-2">
              <Printer className="w-5 h-5 text-[#17B4C4]" />
              Generador Oficial de Documentos y Reportes PDF
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Emite documentos con formato institucional idéntico a las planillas físicas originales para archivo y auditoría.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <img src="/logos/logo-bumand.svg" alt="BUMAND" className="h-8 w-auto object-contain" />
            <img src="/logos/logo-diaconia.svg" alt="Diaconía IFD" className="h-5 w-auto object-contain opacity-80" />
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {mensaje_exito && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              {mensaje_exito}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              disabled={generando}
              onClick={() =>
                manejarGenerarNuevoReporte(
                  "asistencia",
                  "Informe Mensual de Horas y Prácticas Preprofesionales"
                )
              }
              className="h-11 bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold text-xs rounded-xl flex items-center gap-2 justify-center"
            >
              <FileText className="w-4 h-4 text-[#7FE0E6]" />
              Emitir Planilla Horas
            </Button>

            <Button
              disabled={generando}
              onClick={() =>
                manejarGenerarNuevoReporte(
                  "pasajes",
                  "Formulario de Devolución 80% Pasajes"
                )
              }
              className="h-11 bg-[#17B4C4] hover:bg-[#17B4C4]/90 text-[#063A6B] font-bold text-xs rounded-xl flex items-center gap-2 justify-center"
            >
              <Sparkles className="w-4 h-4" />
              Emitir 80% Pasajes
            </Button>

            <Button
              disabled={generando}
              onClick={() =>
                manejarGenerarNuevoReporte(
                  "evaluacion_f03",
                  "Formulario Pastoral F-03"
                )
              }
              variant="outline"
              className="h-11 border-[#E3DCCB] text-[#063A6B] font-bold text-xs rounded-xl flex items-center gap-2 justify-center hover:bg-slate-50"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              Emitir Formulario F-03
            </Button>

            <Button
              disabled={generando}
              onClick={() =>
                manejarGenerarNuevoReporte(
                  "consolidado_360",
                  "Certificado Semestral 360°"
                )
              }
              variant="outline"
              className="h-11 border-[#063A6B] text-[#063A6B] font-bold text-xs rounded-xl flex items-center gap-2 justify-center hover:bg-[#063A6B]/5"
            >
              <Printer className="w-4 h-4 text-[#063A6B]" />
              Consolidado 360°
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Historial de Documentos Emitidos */}
      <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-xl">
        <CardHeader className="pb-3 border-b border-[#E3DCCB]/60">
          <CardTitle className="text-base font-bold font-display text-[#063A6B]">
            Historial de Reportes Emitidos y Archivados
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Auditoría de documentos digitales generados y firmados.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/60">
              <TableRow className="border-b border-[#E3DCCB]">
                <TableHead className="font-bold text-[#063A6B]">Documento Oficial</TableHead>
                <TableHead className="font-bold text-[#063A6B]">Periodo</TableHead>
                <TableHead className="font-bold text-[#063A6B]">Becario</TableHead>
                <TableHead className="font-bold text-[#063A6B]">Fecha Emisión</TableHead>
                <TableHead className="font-bold text-[#063A6B]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportes.map((r) => (
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
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => simularDescarga(r.titulo)}
                      className="h-8 px-2.5 border-[#17B4C4] text-[#063A6B] hover:bg-[#17B4C4]/10 rounded-lg text-xs font-bold flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-[#17B4C4]" />
                      Descargar PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
