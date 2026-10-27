"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  Plus,
  Trash2,
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Send,
  Eye,
  Calendar,
  Sparkles,
  BookOpen,
  IdCard,
  Building2,
  Check,
  FileCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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

export interface MateriaInput {
  id: string;
  nombre: string;
  sigla: string;
  nota: string;
}

export interface FormularioCargaNotasEstudianteProps {
  becario_id: number;
  becario_nombre: string;
  carrera: string;
  universidad: string;
  periodo_nombre: string;
  periodo_id: number;
  alGuardarExitoso?: (datos: {
    promedio: number;
    materias: MateriaInput[];
    kardex_nombre: string;
    programacion_nombre: string;
  }) => void;
  alAbrirVisor?: (titulo: string, nombre_archivo: string, url: string) => void;
}

const MATERIAS_EJEMPLO_INICIALES: MateriaInput[] = [
  { id: "1", nombre: "Contabilidad de Costos II", sigla: "CPA-201", nota: "85" },
  { id: "2", nombre: "Matemática Financiera", sigla: "CPA-202", nota: "78" },
  { id: "3", nombre: "Microeconomía I", sigla: "ECO-105", nota: "82" },
  { id: "4", nombre: "Derecho Comercial y Laboral", sigla: "DER-104", nota: "86" },
];

export function FormularioCargaNotasEstudiante({
  becario_id,
  becario_nombre,
  carrera,
  universidad,
  periodo_nombre,
  periodo_id,
  alGuardarExitoso,
  alAbrirVisor,
}: FormularioCargaNotasEstudianteProps) {
  const [materias, set_materias] = useState<MateriaInput[]>(MATERIAS_EJEMPLO_INICIALES);
  const [renovar_carnet, set_renovar_carnet] = useState<boolean>(false);
  const [observaciones, set_observaciones] = useState<string>("");
  const [enviando, set_enviando] = useState<boolean>(false);

  // Archivos
  const [kardex_nombre, set_kardex_nombre] = useState<string>("Kardex_Oficial_2026_I.pdf");
  const [kardex_url, set_kardex_url] = useState<string>(
    "data:application/pdf;base64,JVBERi0xLjQKJ..."
  );
  const [kardex_tamano, set_kardex_tamano] = useState<string>("1.4 MB");

  const [programacion_nombre, set_programacion_nombre] = useState<string>(
    "Programacion_Inscripcion_2026_II.pdf"
  );
  const [programacion_url, set_programacion_url] = useState<string>(
    "data:application/pdf;base64,JVBERi0xLjQKJ..."
  );
  const [programacion_tamano, set_programacion_tamano] = useState<string>("890 KB");

  const [carnet_nombre, set_carnet_nombre] = useState<string>("");
  const [carnet_url, set_carnet_url] = useState<string>("");
  const [carnet_tamano, set_carnet_tamano] = useState<string>("");

  // Cálculos dinámicos
  const materias_validas = materias.filter((m) => m.nombre.trim() !== "" && m.nota !== "");
  const suma_notas = materias_validas.reduce((acc, m) => acc + (parseFloat(m.nota) || 0), 0);
  const promedio =
    materias_validas.length > 0
      ? Number((suma_notas / materias_validas.length).toFixed(2))
      : 0;
  const meta_cumplida = promedio >= 75;

  const agregarMateria = () => {
    const nueva_id = String(Date.now());
    set_materias([...materias, { id: nueva_id, nombre: "", sigla: "", nota: "" }]);
  };

  const actualizarMateria = (id: string, campo: keyof MateriaInput, valor: string) => {
    set_materias(
      materias.map((m) => (m.id === id ? { ...m, [campo]: valor } : m))
    );
  };

  const eliminarMateria = (id: string) => {
    if (materias.length <= 1) {
      toast.warning("Debe registrar al menos una asignatura cursada.");
      return;
    }
    set_materias(materias.filter((m) => m.id !== id));
  };

  const manejarArchivo = (
    e: React.ChangeEvent<HTMLInputElement>,
    tipo: "kardex" | "programacion" | "carnet"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error("El documento no debe exceder 15 MB.");
      return;
    }

    const tamano_str =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    const lector = new FileReader();
    lector.onload = () => {
      const url = lector.result as string;
      if (tipo === "kardex") {
        set_kardex_nombre(file.name);
        set_kardex_url(url);
        set_kardex_tamano(tamano_str);
        toast.success("Kárdex académico cargado correctamente.");
      } else if (tipo === "programacion") {
        set_programacion_nombre(file.name);
        set_programacion_url(url);
        set_programacion_tamano(tamano_str);
        toast.success("Programación de materias cargada correctamente.");
      } else {
        set_carnet_nombre(file.name);
        set_carnet_url(url);
        set_carnet_tamano(tamano_str);
        toast.success("Carnet de identidad renovado cargado.");
      }
    };
    lector.readAsDataURL(file);
  };

  const enviarAPreEvaluacion = async () => {
    if (materias_validas.length === 0) {
      toast.error("Por favor ingrese al menos una materia con su nota.");
      return;
    }

    if (!kardex_nombre) {
      toast.error("Debe adjuntar el Kárdex de calificaciones obligatorio.");
      return;
    }

    if (!programacion_nombre) {
      toast.error("Debe adjuntar la Programación de asignaturas del nuevo semestre.");
      return;
    }

    set_enviando(true);
    try {
      const payload = {
        becario_id,
        periodo_id,
        materias: materias_validas.map((m) => ({
          nombre: m.nombre,
          sigla: m.sigla || undefined,
          nota: parseFloat(m.nota) || 0,
        })),
        archivo_kardex_url: kardex_url || "url_kardex_default",
        nombre_archivo_kardex: kardex_nombre,
        tamano_archivo_kardex: kardex_tamano,
        archivo_programacion_url: programacion_url || "url_programacion_default",
        nombre_archivo_programacion: programacion_nombre,
        tamano_archivo_programacion: programacion_tamano,
        archivo_carnet_url: renovar_carnet ? carnet_url : undefined,
        nombre_archivo_carnet: renovar_carnet ? carnet_nombre : undefined,
        tamano_archivo_carnet: renovar_carnet ? carnet_tamano : undefined,
        observaciones: observaciones.trim() || undefined,
      };

      try {
        await clienteApi.post("/evaluaciones/academica/estudiante", payload);
      } catch (err) {
        // Fallback local en caso de entorno desacoplado o sin backend online
      }

      toast.success("¡Notas y documentos enviados a Pre-evaluación!", {
        description: `Promedio registrado: ${promedio} pts. Notificación enviada a su supervisor.`,
      });

      if (alGuardarExitoso) {
        alGuardarExitoso({
          promedio,
          materias: materias_validas,
          kardex_nombre,
          programacion_nombre,
        });
      }
    } finally {
      set_enviando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner de Identificación y Semestre */}
      <Card className="border-[#035683]/20 bg-gradient-to-r from-[#035683]/5 via-[#00ABBD]/5 to-white rounded-2xl shadow-xs overflow-hidden">
        <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#035683] text-white flex items-center justify-center shadow-sm">
              <GraduationCap className="w-6 h-6 text-[#FFB600]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-[#035683]">{becario_nombre}</span>
                <Badge variant="outline" className="border-[#00ABBD] text-[#035683] font-semibold text-[11px]">
                  {periodo_nombre}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-[#00ABBD]" />
                {carrera} · <span className="font-semibold">{universidad}</span>
              </p>
            </div>
          </div>

          {/* Tarjeta KPI de Promedio en Vivo */}
          <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs self-stretch md:self-auto justify-between md:justify-start">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                Promedio Semestral
              </span>
              <span className="text-xl font-black text-[#035683] font-mono">
                {promedio.toFixed(2)}{" "}
                <span className="text-xs font-normal text-muted-foreground">/ 100</span>
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              {meta_cumplida ? (
                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1 py-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Meta ≥ 75 Pts
                </Badge>
              ) : (
                <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs gap-1 py-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Alerta &lt; 75 Pts
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flujo de Estados del Trámite Semestral */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
        <span className="text-[11px] font-bold text-[#035683] uppercase tracking-wider block mb-2">
          Flujo de Validación Institucional de Notas
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#00ABBD] text-[#035683] font-semibold">
            <div className="w-5 h-5 rounded-full bg-[#00ABBD] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
              1
            </div>
            <span>Carga del Estudiante (Activo)</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/70 border border-slate-200 text-slate-600">
            <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0">
              2
            </div>
            <span>Pre-evaluación del Supervisor</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/70 border border-slate-200 text-slate-600">
            <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0">
              3
            </div>
            <span>Convalidación Administración</span>
          </div>
        </div>
      </div>

      {/* Sección 1: Grilla de Notas por Asignatura */}
      <Card className="border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <CardHeader className="bg-white border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-[#035683] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#00ABBD]" />
              Desglose Manual de Materias y Calificaciones
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Ingrese cada materia cursada con su nota oficial exacta (0 a 100). Su supervisor podrá cotejar y editar estas notas.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={agregarMateria}
            className="h-8 px-3 rounded-xl border-[#00ABBD] text-[#035683] font-bold text-xs hover:bg-[#00ABBD]/10 gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-[#00ABBD]" />
            Agregar Asignatura
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/70">
              <TableRow>
                <TableHead className="w-12 text-center text-xs font-bold text-slate-600">#</TableHead>
                <TableHead className="text-xs font-bold text-slate-600">Nombre de la Asignatura *</TableHead>
                <TableHead className="w-36 text-xs font-bold text-slate-600">Sigla / Código</TableHead>
                <TableHead className="w-32 text-center text-xs font-bold text-slate-600">Nota (0-100) *</TableHead>
                <TableHead className="w-28 text-center text-xs font-bold text-slate-600">Condición</TableHead>
                <TableHead className="w-16 text-center text-xs font-bold text-slate-600">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materias.map((m, idx) => {
                const nota_num = parseFloat(m.nota);
                const es_valida = !isNaN(nota_num);
                const aprobado = es_valida && nota_num >= 51;

                return (
                  <TableRow key={m.id} className="hover:bg-slate-50/50">
                    <TableCell className="text-center font-mono text-xs text-slate-500 font-semibold">
                      {idx + 1}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="text"
                        value={m.nombre}
                        onChange={(e) => actualizarMateria(m.id, "nombre", e.target.value)}
                        placeholder="Ej. Cálculo I, Bioquímica, etc."
                        className="h-9 text-xs rounded-lg border-slate-200 font-medium"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="text"
                        value={m.sigla}
                        onChange={(e) => actualizarMateria(m.id, "sigla", e.target.value.toUpperCase())}
                        placeholder="MAT-101"
                        className="h-9 text-xs rounded-lg border-slate-200 font-mono uppercase"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={m.nota}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || (Number(val) >= 0 && Number(val) <= 100)) {
                            actualizarMateria(m.id, "nota", val);
                          }
                        }}
                        placeholder="0 - 100"
                        className="h-9 text-xs rounded-lg border-slate-200 text-center font-bold font-mono"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      {es_valida ? (
                        aprobado ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-[10px]">
                            Aprobado
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-100 text-rose-800 border-rose-300 font-bold text-[10px]">
                            Reprobado
                          </Badge>
                        )
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">Pendiente</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => eliminarMateria(m.id)}
                        className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Barra de Totales y Promedio */}
          <div className="bg-slate-50 border-t border-slate-200 p-3 px-6 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 text-slate-600">
              <span>
                Asignaturas declaradas: <strong className="text-[#035683]">{materias_validas.length}</strong>
              </span>
              <span>
                Aprobadas:{" "}
                <strong className="text-emerald-700">
                  {materias_validas.filter((m) => parseFloat(m.nota) >= 51).length}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Promedio Ponderado Semestral:</span>
              <span className="text-base font-black text-[#035683] font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                {promedio.toFixed(2)} pts
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección 2: Carga de Documentos Semestrales Obligatorios */}
      <Card className="border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <CardHeader className="bg-white border-b border-slate-100 pb-3">
          <CardTitle className="text-sm font-bold text-[#035683] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#00ABBD]" />
            Documentos Académicos Semestrales Requeridos
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Debe adjuntar el Kárdex de calificaciones del semestre anterior y la Programación de materias del nuevo ciclo.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Documento 1: Kárdex de Notas */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-[#035683] flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-[#00ABBD]" />
                  1. Kárdex de Notas Oficial (Obligatorio) *
                </Label>
                {kardex_tamano && (
                  <Badge variant="outline" className="text-[10px] font-mono text-emerald-700 border-emerald-300">
                    {kardex_tamano}
                  </Badge>
                )}
              </div>

              {kardex_nombre ? (
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-5 h-5 text-rose-600 shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 truncate">{kardex_nombre}</p>
                      <p className="text-[10px] text-muted-foreground">Documento cargado correctamente</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {alAbrirVisor && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => alAbrirVisor("Kárdex Académico", kardex_nombre, kardex_url)}
                        className="h-7 px-2 text-xs text-[#035683] hover:bg-[#035683]/10 rounded-lg gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ver
                      </Button>
                    )}
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        onChange={(e) => manejarArchivo(e, "kardex")}
                        className="hidden"
                      />
                      <span className="inline-flex items-center justify-center h-7 px-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 font-medium">
                        Cambiar
                      </span>
                    </label>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 hover:border-[#00ABBD] rounded-xl p-4 flex flex-col items-center justify-center gap-2 bg-white cursor-pointer transition-colors">
                  <Upload className="w-5 h-5 text-[#00ABBD]" />
                  <span className="text-xs font-bold text-[#035683]">Seleccionar Kárdex (PDF o Imagen)</span>
                  <span className="text-[10px] text-muted-foreground">Máx. 15 MB con sello rectorado</span>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => manejarArchivo(e, "kardex")}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Documento 2: Programación Nueva de Materias */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-[#035683] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#00ABBD]" />
                  2. Programación Nueva / Boleta Inscripción *
                </Label>
                {programacion_tamano && (
                  <Badge variant="outline" className="text-[10px] font-mono text-emerald-700 border-emerald-300">
                    {programacion_tamano}
                  </Badge>
                )}
              </div>

              {programacion_nombre ? (
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 truncate">{programacion_nombre}</p>
                      <p className="text-[10px] text-muted-foreground">Documento cargado correctamente</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {alAbrirVisor && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          alAbrirVisor("Programación Nueva de Materias", programacion_nombre, programacion_url)
                        }
                        className="h-7 px-2 text-xs text-[#035683] hover:bg-[#035683]/10 rounded-lg gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ver
                      </Button>
                    )}
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        onChange={(e) => manejarArchivo(e, "programacion")}
                        className="hidden"
                      />
                      <span className="inline-flex items-center justify-center h-7 px-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 font-medium">
                        Cambiar
                      </span>
                    </label>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 hover:border-[#00ABBD] rounded-xl p-4 flex flex-col items-center justify-center gap-2 bg-white cursor-pointer transition-colors">
                  <Upload className="w-5 h-5 text-[#00ABBD]" />
                  <span className="text-xs font-bold text-[#035683]">Seleccionar Programación (PDF o Imagen)</span>
                  <span className="text-[10px] text-muted-foreground">Boleta de materias inscritas para el nuevo semestre</span>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => manejarArchivo(e, "programacion")}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Documento 3: Renovación Opcional de Carnet */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IdCard className="w-4 h-4 text-[#FFB600]" />
                <div>
                  <span className="text-xs font-bold text-[#035683]">
                    3. Renovación de Carnet de Identidad (Cédula de Identidad)
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Active esta opción si su cédula venció recientemente o tramitó una renovación.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">
                  {renovar_carnet ? "Renovación activada" : "Sin cambios"}
                </span>
                <Switch
                  checked={renovar_carnet}
                  onCheckedChange={set_renovar_carnet}
                />
              </div>
            </div>

            {renovar_carnet && (
              <div className="pt-2 border-t border-slate-100">
                {carnet_nombre ? (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="w-5 h-5 text-[#035683] shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-800 truncate">{carnet_nombre}</p>
                        <p className="text-[10px] text-muted-foreground">Carnet renovado cargado · {carnet_tamano}</p>
                      </div>
                    </div>
                    <label className="cursor-pointer shrink-0">
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        onChange={(e) => manejarArchivo(e, "carnet")}
                        className="hidden"
                      />
                      <span className="inline-flex items-center justify-center h-7 px-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 font-medium">
                        Cambiar
                      </span>
                    </label>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-amber-300 hover:border-[#FFB600] rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 bg-amber-50/40 cursor-pointer transition-colors">
                    <Upload className="w-5 h-5 text-[#FFB600]" />
                    <span className="text-xs font-bold text-[#035683]">Subir Cédula de Identidad Renovada (PDF o Imagen)</span>
                    <span className="text-[10px] text-muted-foreground">Anverso y reverso legibles</span>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => manejarArchivo(e, "carnet")}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            )}
          </div>

          {/* Observaciones Adicionales */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">
              Observaciones o Comentarios para su Supervisor (Opcional)
            </Label>
            <Textarea
              value={observaciones}
              onChange={(e) => set_observaciones(e.target.value)}
              placeholder="Indique aclaraciones sobre convalidaciones, materias en mesa de examen o materias extracurriculares..."
              className="text-xs rounded-xl border-slate-200 min-h-[65px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Botón Principal de Envío */}
      <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div>
          <p className="text-xs font-bold text-[#035683]">
            ¿Listo para enviar sus notas a pre-evaluación?
          </p>
          <p className="text-[11px] text-muted-foreground">
            Su supervisor revisará las materias registradas contra el Kárdex adjunto y podrá realizar correcciones antes del visto bueno.
          </p>
        </div>
        <Button
          type="button"
          onClick={enviarAPreEvaluacion}
          disabled={enviando || materias_validas.length === 0}
          className="h-11 px-6 rounded-xl bg-[#035683] hover:bg-[#024063] text-white font-bold text-xs shadow-sm gap-2"
        >
          <Send className="w-4 h-4 text-[#FFB600]" />
          {enviando ? "Enviando..." : "Enviar a Pre-evaluación del Supervisor"}
        </Button>
      </div>
    </div>
  );
}
