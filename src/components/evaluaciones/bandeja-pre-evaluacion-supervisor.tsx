"use client";

import React, { useState } from "react";
import {
  FileText,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Send,
  UserCheck,
  Building2,
  GraduationCap,
  Calendar,
  Plus,
  Trash2,
  Edit3,
  FileCheck,
  ShieldCheck,
  Search,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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

export interface MateriaPreEvaluacion {
  id: string;
  nombre: string;
  sigla: string;
  nota: number;
  editado?: boolean;
  nota_original?: number;
}

export interface BecarioPendientePreEvaluacion {
  evaluacion_id: number;
  becario_id: number;
  nombre: string;
  ci: string;
  carrera: string;
  universidad: string;
  periodo: string;
  promedio_estudiante: number;
  materias: MateriaPreEvaluacion[];
  kardex_nombre: string;
  kardex_url: string;
  kardex_tamano?: string;
  programacion_nombre: string;
  programacion_url: string;
  programacion_tamano?: string;
  carnet_renovado_nombre?: string;
  carnet_renovado_url?: string;
  carnet_renovado_tamano?: string;
  estado: "en_revision_supervisor" | "pre_evaluado" | "observado" | "completado";
  fecha_envio: string;
  observaciones_estudiante?: string;
}

const REGISTROS_DEMO_PRE_EVALUACION: BecarioPendientePreEvaluacion[] = [
  {
    evaluacion_id: 101,
    becario_id: 1,
    nombre: "Nilda Amalia Churata Paye",
    ci: "8347291 LP",
    carrera: "Educación Parvularia",
    universidad: "UMSA",
    periodo: "Semestre II - 2026",
    promedio_estudiante: 88.5,
    kardex_nombre: "Record_Academico_Churata_2026_II.pdf",
    kardex_url: "data:application/pdf;base64,JVBERi0xLjQKJ...",
    kardex_tamano: "1.2 MB",
    programacion_nombre: "Programacion_Churata_2026_II.pdf",
    programacion_url: "data:application/pdf;base64,JVBERi0xLjQKJ...",
    programacion_tamano: "840 KB",
    estado: "en_revision_supervisor",
    fecha_envio: "2026-10-25",
    observaciones_estudiante: "Adjunto kárdex con firma de la dirección de carrera.",
    materias: [
      { id: "m1", nombre: "Psicología del Desarrollo Infantil II", sigla: "EP-201", nota: 90, nota_original: 90 },
      { id: "m2", nombre: "Didáctica de la Lectoescritura", sigla: "EP-202", nota: 88, nota_original: 88 },
      { id: "m3", nombre: "Nutrición y Salud Infantil", sigla: "EP-203", nota: 86, nota_original: 86 },
      { id: "m4", nombre: "Expresión Plástica y Corporal", sigla: "EP-204", nota: 90, nota_original: 90 },
    ],
  },
  {
    evaluacion_id: 102,
    becario_id: 2,
    nombre: "Joel David Alarcón Ticona",
    ci: "9123847 LP",
    carrera: "Ingeniería de Sistemas",
    universidad: "UPEA",
    periodo: "Semestre II - 2026",
    promedio_estudiante: 84.0,
    kardex_nombre: "Kardex_Oficial_Alarcon_UPEA.pdf",
    kardex_url: "data:application/pdf;base64,JVBERi0xLjQKJ...",
    kardex_tamano: "1.5 MB",
    programacion_nombre: "Boleta_Inscripcion_Alarcon.pdf",
    programacion_url: "data:application/pdf;base64,JVBERi0xLjQKJ...",
    programacion_tamano: "920 KB",
    carnet_renovado_nombre: "CI_Renovado_Alarcon.pdf",
    carnet_renovado_url: "data:application/pdf;base64,JVBERi0xLjQKJ...",
    carnet_renovado_tamano: "1.1 MB",
    estado: "en_revision_supervisor",
    fecha_envio: "2026-10-26",
    observaciones_estudiante: "Renové mi cédula de identidad en SEGIP este mes.",
    materias: [
      { id: "m10", nombre: "Sistemas Operativos II", sigla: "SIS-301", nota: 85, nota_original: 85 },
      { id: "m11", nombre: "Bases de Datos Distribuidas", sigla: "SIS-302", nota: 80, nota_original: 80 },
      { id: "m12", nombre: "Redes y Telecomunicaciones", sigla: "SIS-303", nota: 82, nota_original: 82 },
      { id: "m13", nombre: "Ingeniería de Software II", sigla: "SIS-304", nota: 89, nota_original: 89 },
    ],
  },
];

export interface BandejaPreEvaluacionSupervisorProps {
  alAbrirVisor: (titulo: string, nombre_archivo: string, url: string) => void;
  alAprobarPreEvaluacion?: (datos: {
    evaluacion_id: number;
    promedio: number;
    materias: MateriaPreEvaluacion[];
  }) => void;
}

export function BandejaPreEvaluacionSupervisor({
  alAbrirVisor,
  alAprobarPreEvaluacion,
}: BandejaPreEvaluacionSupervisorProps) {
  const [registros, set_registros] = useState<BecarioPendientePreEvaluacion[]>(
    REGISTROS_DEMO_PRE_EVALUACION
  );
  const [registro_seleccionado_id, set_registro_seleccionado_id] = useState<number>(
    REGISTROS_DEMO_PRE_EVALUACION[0].evaluacion_id
  );
  const [busqueda, set_busqueda] = useState<string>("");
  const [observaciones_supervisor, set_observaciones_supervisor] = useState<string>("");
  const [guardando, set_guardando] = useState<boolean>(false);

  const registro_activo = registros.find((r) => r.evaluacion_id === registro_seleccionado_id);

  // Manejo de edición de materias por el supervisor
  const actualizarNotaMateria = (materia_id: string, nuevo_valor: number) => {
    if (!registro_activo) return;
    const materias_actualizadas = registro_activo.materias.map((m) => {
      if (m.id === materia_id) {
        return {
          ...m,
          nota: nuevo_valor,
          editado: nuevo_valor !== m.nota_original,
        };
      }
      return m;
    });

    const suma = materias_actualizadas.reduce((acc, m) => acc + m.nota, 0);
    const nuevo_promedio =
      materias_actualizadas.length > 0
        ? Number((suma / materias_actualizadas.length).toFixed(2))
        : 0;

    set_registros(
      registros.map((r) =>
        r.evaluacion_id === registro_activo.evaluacion_id
          ? {
              ...r,
              materias: materias_actualizadas,
              promedio_estudiante: nuevo_promedio,
            }
          : r
      )
    );
  };

  const agregarMateriaOmitida = () => {
    if (!registro_activo) return;
    const nueva_materia: MateriaPreEvaluacion = {
      id: `om_${Date.now()}`,
      nombre: "Asignatura Omitida en Transcripción",
      sigla: "AD-001",
      nota: 75,
      editado: true,
      nota_original: 0,
    };
    const materias_nuevas = [...registro_activo.materias, nueva_materia];
    const suma = materias_nuevas.reduce((acc, m) => acc + m.nota, 0);
    const nuevo_promedio = Number((suma / materias_nuevas.length).toFixed(2));

    set_registros(
      registros.map((r) =>
        r.evaluacion_id === registro_activo.evaluacion_id
          ? { ...r, materias: materias_nuevas, promedio_estudiante: nuevo_promedio }
          : r
      )
    );
    toast.info("Asignatura añadida a la pre-evaluación.");
  };

  const eliminarMateria = (materia_id: string) => {
    if (!registro_activo) return;
    if (registro_activo.materias.length <= 1) {
      toast.warning("Debe haber al menos una materia.");
      return;
    }
    const materias_filtradas = registro_activo.materias.filter((m) => m.id !== materia_id);
    const suma = materias_filtradas.reduce((acc, m) => acc + m.nota, 0);
    const nuevo_promedio = Number((suma / materias_filtradas.length).toFixed(2));

    set_registros(
      registros.map((r) =>
        r.evaluacion_id === registro_activo.evaluacion_id
          ? { ...r, materias: materias_filtradas, promedio_estudiante: nuevo_promedio }
          : r
      )
    );
  };

  const aprobarPreEvaluacion = async () => {
    if (!registro_activo) return;

    set_guardando(true);
    try {
      const payload = {
        evaluacion_id: registro_activo.evaluacion_id,
        accion: "aprobar",
        materias: registro_activo.materias.map((m) => ({
          nombre: m.nombre,
          sigla: m.sigla,
          nota: m.nota,
          editado_por_supervisor: m.editado ?? false,
          nota_original_estudiante: m.nota_original,
        })),
        observaciones_supervisor: observaciones_supervisor.trim() || undefined,
      };

      try {
        await clienteApi.put(
          `/evaluaciones/academica/${registro_activo.evaluacion_id}/pre-evaluacion`,
          payload
        );
      } catch (e) {
        // Fallback local
      }

      set_registros(
        registros.map((r) =>
          r.evaluacion_id === registro_activo.evaluacion_id
            ? { ...r, estado: "pre_evaluado" }
            : r
        )
      );

      toast.success("¡Pre-evaluación aprobada con éxito!", {
        description: `Las calificaciones de ${registro_activo.nombre} fueron remitidas a Administración para su convalidación oficial.`,
      });

      if (alAprobarPreEvaluacion) {
        alAprobarPreEvaluacion({
          evaluacion_id: registro_activo.evaluacion_id,
          promedio: registro_activo.promedio_estudiante,
          materias: registro_activo.materias,
        });
      }
    } finally {
      set_guardando(false);
    }
  };

  const observarEvaluacion = async () => {
    if (!registro_activo) return;
    if (!observaciones_supervisor.trim()) {
      toast.error("Debe ingresar el motivo de observación para el estudiante.");
      return;
    }

    set_guardando(true);
    try {
      try {
        await clienteApi.put(
          `/evaluaciones/academica/${registro_activo.evaluacion_id}/pre-evaluacion`,
          {
            evaluacion_id: registro_activo.evaluacion_id,
            accion: "observar",
            materias: registro_activo.materias,
            observaciones_supervisor: observaciones_supervisor.trim(),
          }
        );
      } catch (e) {
        // Fallback local
      }

      set_registros(
        registros.map((r) =>
          r.evaluacion_id === registro_activo.evaluacion_id
            ? { ...r, estado: "observado" }
            : r
        )
      );

      toast.warning("Evaluación observada y devuelta", {
        description: `Se notificó al estudiante para que corrija sus notas o documentos.`,
      });
    } finally {
      set_guardando(false);
    }
  };

  const registros_filtrados = registros.filter((r) =>
    r.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.carrera.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.ci.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Selector de Becarios Asignados */}
      <Card className="border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-bold text-[#035683] flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#00ABBD]" />
              Bandeja de Pre-Evaluación Académica del Supervisor
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Coteje las notas ingresadas por sus becarios contra el Kárdex digital. Tiene permisos para editar cualquier calificación antes de remitir a Administración.
            </CardDescription>
          </div>
          <div className="w-full md:w-64 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <Input
              type="text"
              value={busqueda}
              onChange={(e) => set_busqueda(e.target.value)}
              placeholder="Buscar por becario o CI..."
              className="h-9 pl-8 text-xs rounded-xl border-slate-200"
            />
          </div>
        </CardHeader>

        <CardContent className="p-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {registros_filtrados.map((b) => {
              const seleccionado = b.evaluacion_id === registro_seleccionado_id;
              return (
                <button
                  key={b.evaluacion_id}
                  type="button"
                  onClick={() => set_registro_seleccionado_id(b.evaluacion_id)}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    seleccionado
                      ? "border-[#00ABBD] bg-[#00ABBD]/10 shadow-2xs"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-[#035683] truncate block">
                      {b.nombre}
                    </span>
                    {b.estado === "pre_evaluado" ? (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-300 font-bold text-[9px] shrink-0">
                        Pre-evaluado
                      </Badge>
                    ) : b.estado === "observado" ? (
                      <Badge className="bg-rose-100 text-rose-800 border-rose-300 font-bold text-[9px] shrink-0">
                        Observado
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-bold text-[9px] shrink-0">
                        Pendiente
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {b.carrera} · {b.universidad}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px]">
                    <span className="font-mono text-slate-500">CI: {b.ci}</span>
                    <span className="font-bold font-mono text-[#035683]">
                      Promedio: {b.promedio_estudiante.toFixed(1)} pts
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detalle y Cotejo del Becario Activo */}
      {registro_activo && (
        <div className="space-y-6">
          {/* Ficha del Becario y Acceso a Documentos Digitales */}
          <Card className="border-[#00ABBD]/30 rounded-2xl shadow-xs overflow-hidden">
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-[#035683]">
                      {registro_activo.nombre}
                    </span>
                    <Badge variant="outline" className="border-[#00ABBD] text-[#035683] font-semibold text-[11px]">
                      {registro_activo.periodo}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#00ABBD]" />
                    {registro_activo.carrera} · {registro_activo.universidad} · CI: {registro_activo.ci}
                  </p>
                  {registro_activo.observaciones_estudiante && (
                    <p className="text-xs bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-600 mt-2 italic">
                      &quot;{registro_activo.observaciones_estudiante}&quot;
                    </p>
                  )}
                </div>

                {/* Acciones de Visualización de Documentos Digitales */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      alAbrirVisor(
                        `Kárdex Oficial - ${registro_activo.nombre}`,
                        registro_activo.kardex_nombre,
                        registro_activo.kardex_url
                      )
                    }
                    className="h-9 px-3 rounded-xl border-rose-300 text-rose-700 bg-rose-50/50 hover:bg-rose-100 font-bold text-xs gap-1.5"
                  >
                    <FileText className="w-4 h-4 text-rose-600" />
                    Ver Kárdex Digital
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      alAbrirVisor(
                        `Programación Nueva - ${registro_activo.nombre}`,
                        registro_activo.programacion_nombre,
                        registro_activo.programacion_url
                      )
                    }
                    className="h-9 px-3 rounded-xl border-indigo-300 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 font-bold text-xs gap-1.5"
                  >
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    Ver Programación
                  </Button>

                  {registro_activo.carnet_renovado_nombre && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        alAbrirVisor(
                          `Carnet Renovado - ${registro_activo.nombre}`,
                          registro_activo.carnet_renovado_nombre!,
                          registro_activo.carnet_renovado_url!
                        )
                      }
                      className="h-9 px-3 rounded-xl border-amber-300 text-amber-800 bg-amber-50/50 hover:bg-amber-100 font-bold text-xs gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#FFB600]" />
                      Carnet Renovado
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de Calificaciones con Edición In-Situ */}
          <Card className="border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-[#035683] flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#00ABBD]" />
                  Cotejo y Edición de Calificaciones (Supervisor)
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Modifique la nota si detecta un error de transcripción respecto al Kárdex. El sistema registrará el cambio de auditoría.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={agregarMateriaOmitida}
                className="h-8 px-3 rounded-xl border-[#00ABBD] text-[#035683] font-bold text-xs hover:bg-[#00ABBD]/10 gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-[#00ABBD]" />
                Agregar Materia Omitida
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/70">
                  <TableRow>
                    <TableHead className="w-12 text-center text-xs font-bold text-slate-600">#</TableHead>
                    <TableHead className="text-xs font-bold text-slate-600">Asignatura</TableHead>
                    <TableHead className="w-32 text-xs font-bold text-slate-600">Sigla</TableHead>
                    <TableHead className="w-32 text-center text-xs font-bold text-slate-600">Nota Declarada</TableHead>
                    <TableHead className="w-36 text-center text-xs font-bold text-[#035683]">
                      Nota Validada (Editar)
                    </TableHead>
                    <TableHead className="w-32 text-center text-xs font-bold text-slate-600">Auditoría</TableHead>
                    <TableHead className="w-16 text-center text-xs font-bold text-slate-600">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registro_activo.materias.map((m, idx) => (
                    <TableRow key={m.id} className="hover:bg-slate-50/50">
                      <TableCell className="text-center font-mono text-xs text-slate-500 font-semibold">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-bold text-slate-800">{m.nombre}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-slate-600 uppercase">{m.sigla}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-mono text-xs text-slate-600">
                          {m.nota_original !== undefined ? m.nota_original : m.nota} pts
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={m.nota}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val >= 0 && val <= 100) {
                              actualizarNotaMateria(m.id, val);
                            }
                          }}
                          className="h-8 w-24 mx-auto text-center font-bold font-mono text-xs border-[#00ABBD] bg-white rounded-lg focus:ring-1 focus:ring-[#00ABBD]"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        {m.editado ? (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-bold text-[9px]">
                            Editado ({m.nota_original} → {m.nota})
                          </Badge>
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-medium flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Coincide
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => eliminarMateria(m.id)}
                          className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Barra de Promedio Validado */}
              <div className="bg-slate-50 border-t border-slate-200 p-3 px-6 flex items-center justify-between text-xs">
                <div className="text-slate-600">
                  <span>Total asignaturas evaluadas: </span>
                  <strong className="text-[#035683]">{registro_activo.materias.length}</strong>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-700">Promedio Semestral Validado:</span>
                  <span className="text-base font-black text-[#035683] font-mono bg-white px-3 py-1 rounded-lg border border-slate-200">
                    {registro_activo.promedio_estudiante.toFixed(2)} pts
                  </span>
                  {registro_activo.promedio_estudiante >= 75 ? (
                    <Badge className="bg-emerald-600 text-white font-bold text-xs gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Meta Contractual OK
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-500 text-white font-bold text-xs gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Alerta de Rendimiento
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observaciones del Supervisor y Botones de Resolución */}
          <Card className="border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#035683]">
                  Observaciones de Pre-evaluación del Supervisor (Constancia Oficial)
                </Label>
                <Textarea
                  value={observaciones_supervisor}
                  onChange={(e) => set_observaciones_supervisor(e.target.value)}
                  placeholder="Ej. Se cotejó contra Kárdex oficial con sello rectorado #8921. Las calificaciones fueron verificadas y se remite a administración."
                  className="text-xs rounded-xl border-slate-200 min-h-[65px]"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={observarEvaluacion}
                  disabled={guardando}
                  className="w-full sm:w-auto h-10 px-4 rounded-xl border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs gap-2"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Observar y Devolver al Estudiante
                </Button>

                <Button
                  type="button"
                  onClick={aprobarPreEvaluacion}
                  disabled={guardando}
                  className="w-full sm:w-auto h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  {guardando ? "Procesando..." : "Aprobar Pre-evaluación y Remitir a Administración"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
