"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Combobox, OpcionCombobox } from "@/components/ui/combobox";
import {
  Download,
  Printer,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Users,
  GraduationCap,
  BookOpen,
  Award,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { clienteApi } from "@/lib/cliente-api";
import {
  BECARIOS_SEMESTRE_II,
  NOTAS_CETI_SEMESTRE_II,
  EVALUACIONES_MENTORES_SEMESTRE_II,
  RANGOS_APROBACION_OFICIALES,
  BecarioEvaluacionSemestral,
} from "./evaluaciones-datos-semestre";

const OPCIONES_FILTRO_CALIFICACION: OpcionCombobox[] = [
  { valor: "todos", etiqueta: "Todas las calificaciones" },
  {
    valor: "optima",
    etiqueta: "Aprobación Óptima (≥ 70)",
    colorPunto: "bg-emerald-500",
  },
  {
    valor: "condicionada",
    etiqueta: "Aprobación Condicionada (51-69)",
    colorPunto: "bg-amber-500",
  },
  {
    valor: "abandonar",
    etiqueta: "Abandonar Programa (≤ 50)",
    colorPunto: "bg-rose-500",
  },
];

const OPCIONES_FILTRO_BECA: OpcionCombobox[] = [
  { valor: "todos", etiqueta: "Todos los tipos de beca" },
  {
    valor: "650",
    etiqueta: "Beca Bs 650",
    colorPunto: "bg-[#063A6B]",
    badge: "Bs 650",
  },
  {
    valor: "250",
    etiqueta: "Beca Bs 250",
    colorPunto: "bg-[#17B4C4]",
    badge: "Bs 250",
  },
];

export function SabanaConsolidadoSemestral() {
  const [busqueda, set_busqueda] = useState<string>("");
  const [filtro_calificacion, set_filtro_calificacion] = useState<string>("todos");
  const [becario_detalle, set_becario_detalle] = useState<BecarioEvaluacionSemestral | null>(null);
  const [filtro_beca, set_filtro_beca] = useState<string>("todos");
  const [pestaña_activa, set_pestaña_activa] = useState<string>("consolidado");

  // Filtrado de becarios
  const becarios_filtrados = BECARIOS_SEMESTRE_II.filter((b) => {
    const coincide_busqueda =
      b.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
      b.ci.includes(busqueda) ||
      b.carrera.toLowerCase().includes(busqueda.toLowerCase()) ||
      b.universidad.toLowerCase().includes(busqueda.toLowerCase());

    const coincide_calificacion =
      filtro_calificacion === "todos" ||
      b.total_calificacion.toLowerCase().includes(filtro_calificacion.toLowerCase());

    const coincide_beca =
      filtro_beca === "todos" || b.tipo_beca.toString() === filtro_beca;

    return coincide_busqueda && coincide_calificacion && coincide_beca;
  });

  const [descargando_pdf, set_descargando_pdf] = useState(false);

  // Descarga del reporte consolidado oficial generado mediante Puppeteer headless en el backend
  const descargarReportePuppeteerPdf = async () => {
    try {
      set_descargando_pdf(true);
      toast.info("Generando informe semestral con Puppeteer en el servidor...", {
        description: "Compilando tabla apaisada de 14 columnas, promedios y dictamen oficial.",
      });

      const blob = await clienteApi.descargarBlob("/pdf/evaluacion-semestral?periodo=II_2026");
      const url = window.URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = "Evaluacion_Semestre_II_2026.pdf";
      document.body.appendChild(enlace);
      enlace.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(enlace);

      toast.success("PDF oficial descargado exitosamente", {
        description: "Documento oficial generado con Puppeteer en el backend.",
      });
    } catch (_error) {
      toast.error("Error al descargar PDF con Puppeteer", {
        description: "Verifique la conectividad con el servicio de generación de PDF.",
      });
    } finally {
      set_descargando_pdf(false);
    }
  };

  return (
    <Card className="border-[#E3DCCB] shadow-md bg-white rounded-2xl overflow-hidden">
      {/* Cabecera de la Sábana Consolidada */}
      <CardHeader className="bg-gradient-to-r from-[#063A6B] via-[#09477e] to-[#063A6B] text-white p-6 pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-[#F8C766] text-[#063A6B] font-bold text-xs uppercase px-2.5 py-0.5">
                Consolidado Oficial Semestre II
              </Badge>
              <span className="text-xs text-[#7FE0E6] font-mono">
                Evaluacion Semestre II (2) · 21 Becarios Titulares
              </span>
            </div>
            <CardTitle className="text-xl md:text-2xl font-bold font-display text-white">
              Sábana Consolidada Semestral y Registro Central de Notas
            </CardTitle>
            <CardDescription className="text-xs md:text-sm text-white/80">
              Matriz maestra con las 14 columnas oficiales, subtablas CETI (12 Tareas) y Evaluaciones de Mentores.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              size="sm"
              disabled={descargando_pdf}
              onClick={descargarReportePuppeteerPdf}
              className="h-10 px-4 bg-[#17B4C4] hover:bg-[#17B4C4]/90 text-[#063A6B] font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>{descargando_pdf ? "Generando con Puppeteer..." : "Descargar PDF Oficial"}</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Pestañas de Navegación de la Sábana */}
        <Tabs value={pestaña_activa} onValueChange={set_pestaña_activa} className="space-y-5">
          <TabsList className="bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="consolidado" className="text-xs font-bold rounded-lg px-4">
              <Award className="w-3.5 h-3.5 mr-1.5 text-[#17B4C4]" />
              Matriz Maestra (14 Columnas)
            </TabsTrigger>
            <TabsTrigger value="comentarios" className="text-xs font-bold rounded-lg px-4">
              <BookOpen className="w-3.5 h-3.5 mr-1.5 text-[#063A6B]" />
              Comentarios y Rangos (Página 2)
            </TabsTrigger>
            <TabsTrigger value="ceti" className="text-xs font-bold rounded-lg px-4">
              <GraduationCap className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              Notas CETI (12 Tareas Classroom)
            </TabsTrigger>
            <TabsTrigger value="mentores" className="text-xs font-bold rounded-lg px-4">
              <Users className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
              Evaluación Mentores (EV.MENTORES II)
            </TabsTrigger>
          </TabsList>

          {/* ============================================================== */}
          {/* PESTAÑA 1: MATRIZ MAESTRA DE 14 COLUMNAS (21 BECARIOS)        */}
          {/* ============================================================== */}
          <TabsContent value="consolidado" className="space-y-4">
            {/* Barra de Filtros y Búsqueda */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-[#E3DCCB] rounded-xl text-xs">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={busqueda}
                  onChange={(e) => set_busqueda(e.target.value)}
                  placeholder="Buscar por nombre, CI, universidad o carrera..."
                  className="pl-9 h-8 text-xs bg-white border-[#E3DCCB]"
                />
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
                <Combobox
                  valor={filtro_calificacion}
                  alCambiar={set_filtro_calificacion}
                  opciones={OPCIONES_FILTRO_CALIFICACION}
                  placeholder="Calificación..."
                  tamaño="sm"
                  className="w-full sm:w-[210px]"
                />

                <Combobox
                  valor={filtro_beca}
                  alCambiar={set_filtro_beca}
                  opciones={OPCIONES_FILTRO_BECA}
                  placeholder="Tipo de beca..."
                  tamaño="sm"
                  className="w-full sm:w-[190px]"
                />

                <Badge variant="outline" className="font-mono text-xs shrink-0 self-center">
                  {becarios_filtrados.length} / {BECARIOS_SEMESTRE_II.length}
                </Badge>
              </div>
            </div>

            {/* Tabla con las 14 Columnas Exactas */}
            <div className="border border-[#E3DCCB] rounded-xl overflow-x-auto bg-white shadow-xs">
              <Table className="text-[11px]">
                <TableHeader className="bg-[#063A6B] text-white">
                  <TableRow className="border-b border-[#04284d] hover:bg-[#063A6B]">
                    <TableHead className="text-white font-bold whitespace-nowrap">Nombre completo</TableHead>
                    <TableHead className="text-white font-bold text-center whitespace-nowrap">Número de CI</TableHead>
                    <TableHead className="text-white font-bold whitespace-nowrap">Universidad</TableHead>
                    <TableHead className="text-white font-bold whitespace-nowrap">Carrera</TableHead>
                    <TableHead className="text-white font-bold text-center whitespace-nowrap">Modalidad</TableHead>
                    <TableHead className="text-white font-bold text-center whitespace-nowrap">Promedio</TableHead>
                    <TableHead className="text-white font-bold text-center whitespace-nowrap">Académica</TableHead>
                    <TableHead className="text-white font-bold text-center whitespace-nowrap">Liderazgo Iglesia</TableHead>
                    <TableHead className="text-white font-bold text-center whitespace-nowrap">Pract. Preprof.</TableHead>
                    <TableHead className="text-white font-bold text-center whitespace-nowrap">Esc. Líderes (/20)</TableHead>
                    <TableHead className="text-white font-bold text-center whitespace-nowrap">Socioeconómico (20)</TableHead>
                    <TableHead className="text-white font-bold text-center whitespace-nowrap bg-[#04284d]">TOTAL</TableHead>
                    <TableHead className="text-white font-bold text-center whitespace-nowrap">Total Calificación</TableHead>
                    <TableHead className="text-white font-bold text-center whitespace-nowrap">Tipo Beca</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {becarios_filtrados.map((b) => {
                    const es_optima = b.total_calificacion.toLowerCase().includes("optima");
                    const es_condicionada = b.total_calificacion.toLowerCase().includes("condicionada");

                    return (
                      <TableRow key={b.id} className="hover:bg-slate-50 border-b border-[#E3DCCB]/60">
                        <TableCell className="font-semibold text-slate-800 whitespace-nowrap">
                          {b.nombre_completo}
                        </TableCell>
                        <TableCell className="font-mono text-center text-muted-foreground whitespace-nowrap">
                          {b.ci}
                        </TableCell>
                        <TableCell className="text-slate-600 whitespace-nowrap">{b.universidad}</TableCell>
                        <TableCell className="text-slate-600 whitespace-nowrap">{b.carrera}</TableCell>
                        <TableCell className="text-center whitespace-nowrap">{b.modalidad_carrera}</TableCell>
                        <TableCell className="font-mono font-bold text-center">
                          {b.promedio !== null ? b.promedio : "-"}
                        </TableCell>
                        <TableCell className="font-mono text-center font-bold text-[#063A6B]">{b.academica}</TableCell>
                        <TableCell className="font-mono text-center font-bold text-[#063A6B]">{b.liderazgo_iglesia}</TableCell>
                        <TableCell className="font-mono text-center font-bold text-[#063A6B]">{b.practicas_preprofesionales}</TableCell>
                        <TableCell className="font-mono text-center font-bold text-[#063A6B]">{b.escuela_lideres.toFixed(1)}</TableCell>
                        <TableCell className="font-mono text-center font-bold text-[#063A6B]">{b.socioeconomico}</TableCell>
                        <TableCell className="font-mono text-center font-bold text-sm bg-slate-100 text-[#063A6B]">
                          {b.total}
                        </TableCell>
                        <TableCell className="text-center whitespace-nowrap">
                          <Badge
                            className={`font-mono text-[10px] font-bold ${
                              es_optima
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : es_condicionada
                                ? "bg-amber-100 text-amber-800 border-amber-300"
                                : "bg-rose-100 text-rose-800 border-rose-300"
                            }`}
                          >
                            {b.total_calificacion}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono font-bold text-center text-[#063A6B]">
                          Bs {b.tipo_beca}
                        </TableCell>
                        <TableCell className="text-center whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => set_becario_detalle(b)}
                            className="h-7 px-2 text-[#063A6B] hover:text-[#17B4C4] hover:bg-[#063A6B]/5 font-bold text-xs gap-1"
                            title="Auditar expediente individual"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Auditar</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ============================================================== */}
          {/* PESTAÑA 2: COMENTARIOS ACADÉMICOS Y DE IGLESIA (PÁGINA 2 PDF)   */}
          {/* ============================================================== */}
          <TabsContent value="comentarios" className="space-y-6">
            <div className="border border-[#E3DCCB] rounded-xl overflow-hidden bg-white shadow-xs">
              <Table className="text-xs">
                <TableHeader className="bg-[#063A6B] text-white">
                  <TableRow className="border-b border-[#04284d] hover:bg-[#063A6B]">
                    <TableHead className="text-white font-bold w-[25%]">Nombre completo</TableHead>
                    <TableHead className="text-white font-bold w-[35%]">Comentario Académico</TableHead>
                    <TableHead className="text-white font-bold w-[40%]">Comentario de la Iglesia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {BECARIOS_SEMESTRE_II.map((b) => (
                    <TableRow key={b.id} className="hover:bg-slate-50 border-b border-[#E3DCCB]/60">
                      <TableCell className="font-bold text-[#063A6B]">{b.nombre_completo}</TableCell>
                      <TableCell className="text-slate-700">{b.comentario_academico || "-"}</TableCell>
                      <TableCell className="text-slate-700">{b.comentario_iglesia || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Rangos Oficiales de Aprobación */}
            <div className="p-4 bg-slate-50 border border-[#E3DCCB] rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-[#063A6B] uppercase tracking-wider">
                Rangos de Aprobación Oficiales (Pie de Página 2)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {RANGOS_APROBACION_OFICIALES.map((r, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                      r.color === "emerald"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                        : r.color === "amber"
                        ? "bg-amber-50 border-amber-300 text-amber-800"
                        : "bg-rose-50 border-rose-300 text-rose-800"
                    }`}
                  >
                    <span>{r.calificacion}</span>
                    <Badge className="font-mono text-xs">{r.rango}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ============================================================== */}
          {/* PESTAÑA 3: NOTAS CETI (12 TAREAS CLASSROOM)                   */}
          {/* ============================================================== */}
          <TabsContent value="ceti" className="space-y-4">
            <div className="border border-[#E3DCCB] rounded-xl overflow-x-auto bg-white shadow-xs">
              <Table className="text-[11px]">
                <TableHeader className="bg-[#063A6B] text-white">
                  <TableRow className="border-b border-[#04284d] hover:bg-[#063A6B]">
                    <TableHead className="text-white font-bold whitespace-nowrap">Nombre completo</TableHead>
                    <TableHead className="text-white font-bold text-center whitespace-nowrap">CI</TableHead>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((t) => (
                      <TableHead key={t} className="text-white font-bold text-center whitespace-nowrap">
                        T{t}
                      </TableHead>
                    ))}
                    <TableHead className="text-white font-bold text-center whitespace-nowrap bg-[#04284d]">
                      PROMEDIO
                    </TableHead>
                    <TableHead className="text-white font-bold text-center whitespace-nowrap bg-[#17B4C4] text-[#063A6B]">
                      Puntaje / 20
                    </TableHead>
                    <TableHead className="text-white font-bold whitespace-nowrap">Observaciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {NOTAS_CETI_SEMESTRE_II.map((c) => (
                    <TableRow key={c.id} className="hover:bg-slate-50 border-b border-[#E3DCCB]/60">
                      <TableCell className="font-semibold text-slate-800 whitespace-nowrap">
                        {c.nombre_completo}
                      </TableCell>
                      <TableCell className="font-mono text-center text-muted-foreground whitespace-nowrap">
                        {c.ci}
                      </TableCell>
                      {c.tareas.map((nt, idx) => (
                        <TableCell key={idx} className="font-mono text-center text-slate-600">
                          {nt}
                        </TableCell>
                      ))}
                      <TableCell className="font-mono font-bold text-center bg-slate-100 text-[#063A6B]">
                        {c.promedio.toFixed(1)}%
                      </TableCell>
                      <TableCell className="font-mono font-bold text-center bg-emerald-50 text-emerald-800">
                        {c.puntaje_20.toFixed(1)} pts
                      </TableCell>
                      <TableCell className="text-slate-600 text-[10px] whitespace-nowrap">
                        {c.observaciones}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ============================================================== */}
          {/* PESTAÑA 4: EVALUACIONES DE MENTORES (EV.MENTORES II)          */}
          {/* ============================================================== */}
          <TabsContent value="mentores" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {EVALUACIONES_MENTORES_SEMESTRE_II.map((em) => (
                <div
                  key={em.id}
                  className="p-4 bg-slate-50 border border-[#E3DCCB] rounded-xl space-y-3 text-xs"
                >
                  <div className="flex items-start justify-between pb-2 border-b border-[#E3DCCB]">
                    <div>
                      <span className="font-bold text-sm text-[#063A6B] block">{em.becario_nombre}</span>
                      <span className="text-[11px] text-muted-foreground">
                        Mentor: <strong>{em.mentor_nombre}</strong> · {em.unidad_agencia}
                      </span>
                    </div>
                    <Badge className="bg-[#063A6B] text-white font-mono text-xs font-bold">
                      {em.puntaje_20.toFixed(1)} / 20 pts
                    </Badge>
                  </div>

                  <div className="space-y-1.5 text-slate-700 text-[11px]">
                    <p>
                      <strong>P19 (Apoyo recibido):</strong> &ldquo;{em.respuesta_19}&rdquo;
                    </p>
                    <p>
                      <strong>P20 (Destacó positivamente):</strong> &ldquo;{em.respuesta_20}&rdquo;
                    </p>
                    <p>
                      <strong>P21 (Sugerencias):</strong> &ldquo;{em.respuesta_21}&rdquo;
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E3DCCB]/60 flex justify-between items-center text-[10px] text-muted-foreground font-mono">
                    <span>Promedio Bloque 1 (1-18): {em.promedio_10} / 10 pts</span>
                    <span className="text-emerald-700 font-bold">Acreditado por Supervisor</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
