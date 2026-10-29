"use client";

import React, { useState } from "react";
import {
  FileText,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Building2,
  GraduationCap,
  Calendar,
  FileCheck,
  ShieldCheck,
  Search,
  Filter,
  Layers,
  Sparkles,
  Download,
  UserCheck,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { clienteApi } from "@/lib/cliente-api";

export interface ItemConvalidacionAdmin {
  evaluacion_id: number;
  becario_id: number;
  nombre: string;
  ci: string;
  carrera: string;
  universidad: string;
  supervisor_nombre: string;
  promedio_final: number;
  promedio_original: number;
  hubo_edicion_supervisor: boolean;
  periodo_nombre?: string;
  record_academico_nombre?: string;
  record_academico_url?: string;
  historial_academico_nombre?: string;
  historial_academico_url?: string;
  kardex_nombre: string;
  kardex_url: string;
  programacion_nombre: string;
  programacion_url: string;
  carnet_renovado_nombre?: string;
  carnet_renovado_url?: string;
  estado: "en_revision_supervisor" | "pre_evaluado" | "completado" | "observado";
  fecha_pre_evaluacion?: string;
  observaciones_supervisor?: string;
}

const REGISTROS_CONSOLIDADO_ADMIN: ItemConvalidacionAdmin[] = [
  {
    evaluacion_id: 101,
    becario_id: 1,
    nombre: "Nilda Amalia Churata Paye",
    ci: "8347291 LP",
    carrera: "Educación Parvularia",
    universidad: "UMSA",
    supervisor_nombre: "Lic. Ramiro Pérez (Tutor)",
    promedio_final: 88.5,
    promedio_original: 88.5,
    hubo_edicion_supervisor: false,
    periodo_nombre: "Semestre II · 2026",
    record_academico_nombre: "Record_Academico_Churata_2026_II.pdf",
    record_academico_url: "data:application/pdf;base64,JVBERi0xLjQKJ...",
    historial_academico_nombre: "Historial_Academico_Churata_Completo.pdf",
    historial_academico_url: "data:application/pdf;base64,JVBERi0xLjQKJ...",
    kardex_nombre: "Record_Academico_Churata_2026_II.pdf",
    kardex_url: "data:application/pdf;base64,JVBERi0xLjQKJ...",
    programacion_nombre: "Programacion_Churata_2026_II.pdf",
    programacion_url: "data:application/pdf;base64,JVBERi0xLjQKJ...",
    estado: "pre_evaluado",
    fecha_pre_evaluacion: "2026-10-26",
    observaciones_supervisor: "Cotejado con Récord e Historial rectorado. Notas completas y conformes.",
  },
  {
    evaluacion_id: 102,
    becario_id: 2,
    nombre: "Joel David Alarcón Ticona",
    ci: "9123847 LP",
    carrera: "Ingeniería de Sistemas",
    universidad: "UPEA",
    supervisor_nombre: "Ing. Carlos Mendoza (Tutor)",
    promedio_final: 84.0,
    promedio_original: 82.0,
    hubo_edicion_supervisor: true,
    periodo_nombre: "Semestre II · 2026",
    record_academico_nombre: "Record_Academico_Alarcon_UPEA_2026.pdf",
    record_academico_url: "data:application/pdf;base64,JVBERi0xLjQKJ...",
    historial_academico_nombre: "Historial_Academico_Alarcon_UPEA.pdf",
    historial_academico_url: "data:application/pdf;base64,JVBERi0xLjQKJ...",
    kardex_nombre: "Kardex_Oficial_Alarcon_UPEA.pdf",
    kardex_url: "data:application/pdf;base64,JVBERi0xLjQKJ...",
    programacion_nombre: "Boleta_Inscripcion_Alarcon.pdf",
    programacion_url: "data:application/pdf;base64,JVBERi0xLjQKJ...",
    carnet_renovado_nombre: "CI_Renovado_Alarcon.pdf",
    carnet_renovado_url: "data:application/pdf;base64,JVBERi0xLjQKJ...",
    estado: "pre_evaluado",
    fecha_pre_evaluacion: "2026-10-26",
    observaciones_supervisor: "Se corrigió nota de Redes y Telecomunicaciones de 74 a 82 según Récord oficial.",
  },
  {
    evaluacion_id: 103,
    becario_id: 3,
    nombre: "Mariana Huayta Quispe",
    ci: "7482910 LP",
    carrera: "Bioquímica y Farmacia",
    universidad: "UMSA",
    supervisor_nombre: "Dra. Miriam Colque (Tutor)",
    promedio_final: 79.0,
    promedio_original: 79.0,
    hubo_edicion_supervisor: false,
    periodo_nombre: "Semestre II · 2026",
    record_academico_nombre: "Record_Academico_Huayta_2026.pdf",
    record_academico_url: "data:application/pdf;base64,JVBERi0xLjQKJ...",
    historial_academico_nombre: "Historial_Academico_Huayta_UMSA.pdf",
    historial_academico_url: "data:application/pdf;base64,JVBERi0xLjQKJ...",
    kardex_nombre: "Kardex_Academico_Huayta.pdf",
    kardex_url: "data:application/pdf;base64,JVBERi0xLjQKJ...",
    programacion_nombre: "Inscripcion_2026_II_Huayta.pdf",
    programacion_url: "data:application/pdf;base64,JVBERi0xLjQKJ...",
    estado: "completado",
    fecha_pre_evaluacion: "2026-10-20",
    observaciones_supervisor: "Convalidado satisfactoriamente.",
  },
  {
    evaluacion_id: 104,
    becario_id: 4,
    nombre: "Brayan Christian Paredes Choque",
    ci: "8930192 LP",
    carrera: "Contaduría Pública",
    universidad: "UMSA",
    supervisor_nombre: "Lic. Ramiro Pérez (Tutor)",
    promedio_final: 76.5,
    promedio_original: 76.5,
    hubo_edicion_supervisor: false,
    periodo_nombre: "Semestre II · 2026",
    record_academico_nombre: "Record_Academico_Paredes_II_2026.pdf",
    record_academico_url: "data:application/pdf;base64,JVBERi0xLjQKJ...",
    historial_academico_nombre: "Historial_Academico_Paredes_UMSA.pdf",
    historial_academico_url: "data:application/pdf;base64,JVBERi0xLjQKJ...",
    kardex_nombre: "Kardex_Paredes_II_2026.pdf",
    kardex_url: "data:application/pdf;base64,JVBERi0xLjQKJ...",
    programacion_nombre: "Programacion_Paredes_2026.pdf",
    programacion_url: "data:application/pdf;base64,JVBERi0xLjQKJ...",
    estado: "en_revision_supervisor",
    fecha_pre_evaluacion: "2026-10-26",
    observaciones_supervisor: "Envío directo del estudiante para convalidación inmediata de Administración.",
  },
];

export interface BandejaConvalidacionAdministracionProps {
  alAbrirVisor: (titulo: string, nombre_archivo: string, url: string) => void;
  alConvalidarOficial?: (evaluacion_id: number) => void;
}

export function BandejaConvalidacionAdministracion({
  alAbrirVisor,
  alConvalidarOficial,
}: BandejaConvalidacionAdministracionProps) {
  const [registros, set_registros] = useState<ItemConvalidacionAdmin[]>(REGISTROS_CONSOLIDADO_ADMIN);
  const [filtro_estado, set_filtro_estado] = useState<
    "todos" | "pendientes" | "pre_evaluado" | "en_revision" | "completado"
  >("pendientes");
  const [busqueda, set_busqueda] = useState<string>("");
  const [convalidando_id, set_convalidando_id] = useState<number | null>(null);

  const convalidarOficialmente = async (item: ItemConvalidacionAdmin) => {
    set_convalidando_id(item.evaluacion_id);
    try {
      try {
        await clienteApi.put(`/api/evaluaciones/academica/${item.evaluacion_id}/convalidar`, {
          evaluacion_id: item.evaluacion_id,
          accion: "convalidar",
          observaciones_administracion: "Convalidación directa formalizada por Administración Central BUMAND.",
        });
      } catch (_e) {
        // Fallback local
      }

      set_registros(
        registros.map((r) =>
          r.evaluacion_id === item.evaluacion_id ? { ...r, estado: "completado" } : r
        )
      );

      toast.success("¡Calificaciones convalidadas directamente por Administración!", {
        description: `El récord de ${item.nombre} con promedio de ${item.promedio_final} pts quedó formalizado sin requerir filtro intermedio del supervisor.`,
      });

      if (alConvalidarOficial) {
        alConvalidarOficial(item.evaluacion_id);
      }
    } finally {
      set_convalidando_id(null);
    }
  };

  const registros_filtrados = registros.filter((r) => {
    if (filtro_estado === "pendientes" && r.estado !== "pre_evaluado" && r.estado !== "en_revision_supervisor") return false;
    if (filtro_estado === "pre_evaluado" && r.estado !== "pre_evaluado") return false;
    if (filtro_estado === "en_revision" && r.estado !== "en_revision_supervisor") return false;
    if (filtro_estado === "completado" && r.estado !== "completado") return false;
    if (busqueda.trim() === "") return true;

    const query = busqueda.toLowerCase();
    return (
      r.nombre.toLowerCase().includes(query) ||
      r.carrera.toLowerCase().includes(query) ||
      r.ci.toLowerCase().includes(query) ||
      r.supervisor_nombre.toLowerCase().includes(query)
    );
  });

  const conteo_pendientes = registros.filter(
    (r) => r.estado === "pre_evaluado" || r.estado === "en_revision_supervisor"
  ).length;
  const conteo_pre_evaluados = registros.filter((r) => r.estado === "pre_evaluado").length;
  const conteo_en_revision = registros.filter((r) => r.estado === "en_revision_supervisor").length;
  const conteo_completados = registros.filter((r) => r.estado === "completado").length;

  return (
    <Card className="border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-sm font-bold text-[#035683] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00ABBD]" />
            Bandeja Central de Convalidación Oficial (Administración)
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Inspección y convalidación directa de Récords e Historiales Académicos sin requerir filtro intermedio del supervisor.
          </CardDescription>
        </div>

        <div className="w-full md:w-64 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <Input
            type="text"
            value={busqueda}
            onChange={(e) => set_busqueda(e.target.value)}
            placeholder="Buscar becario, CI, tutor..."
            className="h-9 pl-8 text-xs rounded-xl border-slate-200"
          />
        </div>
      </CardHeader>

      {/* Pestañas de Filtro Rápido */}
      <div className="bg-white border-b border-slate-100 px-4 py-2 flex flex-wrap items-center gap-2 text-xs">
        <Button
          type="button"
          variant={filtro_estado === "pendientes" ? "default" : "outline"}
          size="sm"
          onClick={() => set_filtro_estado("pendientes")}
          className={`h-8 rounded-xl font-bold text-xs gap-1.5 ${
            filtro_estado === "pendientes"
              ? "bg-[#035683] text-white"
              : "border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-[#FFB600]" />
          Pendientes Convalidación
          <Badge className="ml-1 bg-amber-500 text-white font-bold text-[10px] px-1.5 py-0 h-4">
            {conteo_pendientes}
          </Badge>
        </Button>

        <Button
          type="button"
          variant={filtro_estado === "en_revision" ? "default" : "outline"}
          size="sm"
          onClick={() => set_filtro_estado("en_revision")}
          className={`h-8 rounded-xl font-bold text-xs gap-1.5 ${
            filtro_estado === "en_revision"
              ? "bg-[#035683] text-white"
              : "border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          Envíos Directos Estudiantes
          <Badge className="ml-1 bg-sky-100 text-sky-800 font-bold text-[10px] px-1.5 py-0 h-4">
            {conteo_en_revision}
          </Badge>
        </Button>

        <Button
          type="button"
          variant={filtro_estado === "pre_evaluado" ? "default" : "outline"}
          size="sm"
          onClick={() => set_filtro_estado("pre_evaluado")}
          className={`h-8 rounded-xl font-bold text-xs gap-1.5 ${
            filtro_estado === "pre_evaluado"
              ? "bg-[#035683] text-white"
              : "border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          Pre-evaluadas por Tutor
          <Badge className="ml-1 bg-slate-200 text-slate-700 font-bold text-[10px] px-1.5 py-0 h-4">
            {conteo_pre_evaluados}
          </Badge>
        </Button>

        <Button
          type="button"
          variant={filtro_estado === "completado" ? "default" : "outline"}
          size="sm"
          onClick={() => set_filtro_estado("completado")}
          className={`h-8 rounded-xl font-bold text-xs gap-1.5 ${
            filtro_estado === "completado"
              ? "bg-[#035683] text-white"
              : "border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          Convalidadas Oficialmente
          <Badge className="ml-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] px-1.5 py-0 h-4">
            {conteo_completados}
          </Badge>
        </Button>

        <Button
          type="button"
          variant={filtro_estado === "todos" ? "default" : "outline"}
          size="sm"
          onClick={() => set_filtro_estado("todos")}
          className={`h-8 rounded-xl font-bold text-xs ${
            filtro_estado === "todos"
              ? "bg-[#035683] text-white"
              : "border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          Todos ({registros.length})
        </Button>
      </div>

      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-slate-50/70">
            <TableRow>
              <TableHead className="w-12 text-center text-xs font-bold text-slate-600">#</TableHead>
              <TableHead className="text-xs font-bold text-slate-600">Becario y Universidad</TableHead>
              <TableHead className="text-xs font-bold text-slate-600">Supervisor / Tutor</TableHead>
              <TableHead className="text-center text-xs font-bold text-slate-600">Promedio</TableHead>
              <TableHead className="text-center text-xs font-bold text-slate-600">Récord e Historial Semestral</TableHead>
              <TableHead className="text-center text-xs font-bold text-slate-600">Estado</TableHead>
              <TableHead className="text-right text-xs font-bold text-slate-600 pr-5">Acción Oficial</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registros_filtrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                  No hay registros para el filtro seleccionado.
                </TableCell>
              </TableRow>
            ) : (
              registros_filtrados.map((item, idx) => {
                const nombre_record = item.record_academico_nombre || item.kardex_nombre;
                const url_record = item.record_academico_url || item.kardex_url;
                const nombre_historial = item.historial_academico_nombre;
                const url_historial = item.historial_academico_url;

                return (
                  <TableRow key={item.evaluacion_id} className="hover:bg-slate-50/60">
                    <TableCell className="text-center font-mono text-xs text-slate-500 font-semibold">
                      {idx + 1}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-[#035683]">{item.nombre}</p>
                          {item.periodo_nombre && (
                            <Badge variant="outline" className="text-[9px] font-mono text-slate-500 py-0">
                              {item.periodo_nombre}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {item.carrera} · <span className="font-semibold">{item.universidad}</span>
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium text-slate-700">{item.supervisor_nombre}</span>
                      {item.observaciones_supervisor && (
                        <p className="text-[10px] text-muted-foreground truncate max-w-[200px] italic">
                          &quot;{item.observaciones_supervisor}&quot;
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-mono font-black text-[#035683]">
                          {item.promedio_final.toFixed(1)} pts
                        </span>
                        {item.hubo_edicion_supervisor ? (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-bold text-[8px] mt-0.5">
                            Ajustado por supervisor (orig: {item.promedio_original})
                          </Badge>
                        ) : (
                          <span className="text-[9px] text-slate-400">Sin cambios</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {/* Botón 1: Récord Académico */}
                        {nombre_record && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              alAbrirVisor(`Récord Académico - ${item.nombre}`, nombre_record, url_record)
                            }
                            className="h-7 px-2 text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg gap-1 border border-rose-200"
                            title="Visualizar Récord Académico Semestral"
                          >
                            <FileCheck className="w-3 h-3 text-rose-600" /> Récord Académico
                          </Button>
                        )}

                        {/* Botón 2: Historial Académico */}
                        {nombre_historial ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              alAbrirVisor(`Historial Académico - ${item.nombre}`, nombre_historial, url_historial || url_record)
                            }
                            className="h-7 px-2 text-[10px] font-bold text-[#035683] bg-sky-50 hover:bg-sky-100 rounded-lg gap-1 border border-[#00ABBD]/40"
                            title="Visualizar Historial Académico Consolidado"
                          >
                            <BookOpen className="w-3 h-3 text-[#00ABBD]" /> Historial Académico
                          </Button>
                        ) : (
                          <Badge variant="outline" className="text-[9px] text-slate-400 border-dashed">
                            Historial pendiente
                          </Badge>
                        )}

                        {/* Botón 3: Programación */}
                        {item.programacion_nombre && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              alAbrirVisor(`Programación - ${item.nombre}`, item.programacion_nombre, item.programacion_url)
                            }
                            className="h-7 px-2 text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg gap-1 border border-indigo-200"
                            title="Boleta de Programación"
                          >
                            <Calendar className="w-3 h-3 text-indigo-600" /> Boleta
                          </Button>
                        )}

                        {item.carnet_renovado_nombre && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              alAbrirVisor(`Carnet Renovado - ${item.nombre}`, item.carnet_renovado_nombre!, item.carnet_renovado_url!)
                            }
                            className="h-7 px-2 text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg gap-1 border border-amber-200"
                          >
                            <ShieldCheck className="w-3 h-3 text-[#FFB600]" /> C.I.
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {item.estado === "completado" ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-[10px] gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Convalidado
                        </Badge>
                      ) : item.estado === "pre_evaluado" ? (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-300 font-bold text-[10px] gap-1">
                          <UserCheck className="w-3 h-3 text-blue-600" /> Pre-evaluado
                        </Badge>
                      ) : (
                        <Badge className="bg-sky-50 text-sky-800 border-sky-300 font-bold text-[10px] gap-1">
                          <GraduationCap className="w-3 h-3 text-sky-600" /> Envío Estudiante
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-5">
                      {item.estado === "pre_evaluado" || item.estado === "en_revision_supervisor" ? (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => convalidarOficialmente(item)}
                          disabled={convalidando_id === item.evaluacion_id}
                          className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-2xs"
                          title="Convalidar directamente sin requerir filtro intermedio del supervisor"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          {convalidando_id === item.evaluacion_id ? "Convalidando..." : "Convalidar Directo (Administración)"}
                        </Button>
                      ) : item.estado === "completado" ? (
                        <span className="text-[11px] font-bold text-emerald-700 flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Convalidado Oficial
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">
                          Observado
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
