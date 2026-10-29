"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Upload,
  Eye,
  Send,
  AlertTriangle,
  Award,
  Sparkles,
  Search,
  Filter,
  Check,
  ChevronRight,
  GraduationCap,
  MessageSquare,
  HelpCircle,
  FolderOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { clienteApi } from "@/lib/cliente-api";
import { BECARIOS_SEMESTRE_II } from "./evaluaciones-datos-semestre";

export interface TareaCetiCanonica {
  id: number;
  numero: number;
  titulo: string;
  modulo_tematico: string;
  descripcion: string;
  fecha_limite: string;
  ponderacion: number; // 8.33%
  estado: "pendiente" | "entregado" | "revisado" | "observado";
  archivo_nombre?: string;
  archivo_url?: string;
  archivo_tamano?: string;
  fecha_entrega?: string;
  comentario_estudiante?: string;
  calificacion_100?: number;
  retroalimentacion_docente?: string;
  docente_revisor?: string;
  fecha_revision?: string;
}

const TAREAS_CETI_INICIALES: TareaCetiCanonica[] = [
  {
    id: 1,
    numero: 1,
    titulo: "Liderazgo Servidor y Mayordomía Cristiana",
    modulo_tematico: "Módulo I: Fundamentos del Carácter Diaconal",
    descripcion:
      "Ensayo analítico sobre los principios bíblicos del liderazgo de servicio según el modelo de Jesús en los Evangelios y su contraste con los esquemas seculares de poder.",
    fecha_limite: "2026-08-15",
    ponderacion: 8.33,
    estado: "revisado",
    archivo_nombre: "Tarea_01_Liderazgo_Servidor_Flores.pdf",
    archivo_url: "data:application/pdf;base64,JVBERi0xLjQKJ...",
    archivo_tamano: "1.2 MB",
    fecha_entrega: "2026-08-14",
    comentario_estudiante: "Presento el ensayo integrando las lecturas del manual CETI y vivencia personal.",
    calificacion_100: 95,
    retroalimentacion_docente: "Excelente profundidad teológica y reflexión personal muy contextualizada.",
    docente_revisor: "Pr. Samuel Quispe (CETI)",
    fecha_revision: "2026-08-17",
  },
  {
    id: 2,
    numero: 2,
    titulo: "Misión Integral y Vocación Diaconal",
    modulo_tematico: "Módulo I: Fundamentos del Carácter Diaconal",
    descripcion:
      "Investigación sobre las 5 dimensiones de la misión integral de la iglesia y el papel de las microfinanzas y el desarrollo humano en comunidades vulnerables.",
    fecha_limite: "2026-08-29",
    ponderacion: 8.33,
    estado: "revisado",
    archivo_nombre: "Tarea_02_Mision_Integral_Flores.pdf",
    archivo_url: "data:application/pdf;base64,JVBERi0xLjQKJ...",
    archivo_tamano: "1.5 MB",
    fecha_entrega: "2026-08-28",
    comentario_estudiante: "Se incluye estudio de caso de una familia en El Alto.",
    calificacion_100: 90,
    retroalimentacion_docente: "Muy buen análisis de la acción social de Diaconía.",
    docente_revisor: "Pr. Samuel Quispe (CETI)",
    fecha_revision: "2026-08-31",
  },
  {
    id: 3,
    numero: 3,
    titulo: "Ética Profesional en el Ámbito Financiero y Social",
    modulo_tematico: "Módulo II: Conducta y Mayordomía",
    descripcion:
      "Resolución de dilemas éticos reales en administración, contabilidad, leyes y salud, con sustento moral bíblico y normativa institucional.",
    fecha_limite: "2026-09-12",
    ponderacion: 8.33,
    estado: "revisado",
    archivo_nombre: "Tarea_03_Etica_Profesional.pdf",
    archivo_url: "data:application/pdf;base64,JVBERi0xLjQKJ...",
    archivo_tamano: "980 KB",
    fecha_entrega: "2026-09-11",
    comentario_estudiante: "Desarrollo de los 3 casos prácticos propuestos en clase.",
    calificacion_100: 92,
    retroalimentacion_docente: "Casuística bien argumentada conforme al Código de Ética de Diaconía.",
    docente_revisor: "Pr. Samuel Quispe (CETI)",
    fecha_revision: "2026-09-14",
  },
  {
    id: 4,
    numero: 4,
    titulo: "Acompañamiento a Grupos Vulnerables",
    modulo_tematico: "Módulo II: Conducta y Mayordomía",
    descripcion:
      "Plan de visitación y apoyo pastoral-diaconal a personas en situación de vulnerabilidad, niñez o adultos mayores de la comunidad circundante.",
    fecha_limite: "2026-09-26",
    ponderacion: 8.33,
    estado: "revisado",
    archivo_nombre: "Tarea_04_Acompanamiento_Vulnerable.pdf",
    archivo_url: "data:application/pdf;base64,JVBERi0xLjQKJ...",
    archivo_tamano: "1.4 MB",
    fecha_entrega: "2026-09-25",
    comentario_estudiante: "Informe con bitácora fotográfica de la actividad comunitaria.",
    calificacion_100: 88,
    retroalimentacion_docente: "Muy sensible al contexto y con gran calidez pastoral.",
    docente_revisor: "Pr. Samuel Quispe (CETI)",
    fecha_revision: "2026-09-28",
  },
  {
    id: 5,
    numero: 5,
    titulo: "Resolución Bíblica de Conflictos en la Comunidad",
    modulo_tematico: "Módulo III: Gestión de Relaciones Humanas",
    descripcion:
      "Taller práctico de mediación según Mateo 18 y Gálatas 6, identificando etapas de conflicto y herramientas de reconciliación interpersonal.",
    fecha_limite: "2026-10-10",
    ponderacion: 8.33,
    estado: "revisado",
    archivo_nombre: "Tarea_05_Resolucion_Conflictos.pdf",
    archivo_url: "data:application/pdf;base64,JVBERi0xLjQKJ...",
    archivo_tamano: "1.1 MB",
    fecha_entrega: "2026-10-09",
    comentario_estudiante: "Matriz comparativa de estilos de mediación.",
    calificacion_100: 90,
    retroalimentacion_docente: "Aporte metódico y muy aplicable al ambiente laboral diaconal.",
    docente_revisor: "Pr. Samuel Quispe (CETI)",
    fecha_revision: "2026-10-12",
  },
  {
    id: 6,
    numero: 6,
    titulo: "Diseño y Planificación de Proyectos de Servicio",
    modulo_tematico: "Módulo III: Gestión de Relaciones Humanas",
    descripcion:
      "Perfil de proyecto social comunitario (árbol de problemas, árbol de objetivos y marco lógico preliminar) en favor de un barrio periurbano.",
    fecha_limite: "2026-10-24",
    ponderacion: 8.33,
    estado: "revisado",
    archivo_nombre: "Tarea_06_Proyecto_Servicio.pdf",
    archivo_url: "data:application/pdf;base64,JVBERi0xLjQKJ...",
    archivo_tamano: "2.1 MB",
    fecha_entrega: "2026-10-23",
    comentario_estudiante: "Proyecto de reforzamiento escolar en Achachicala.",
    calificacion_100: 94,
    retroalimentacion_docente: "Marco lógico impecable. Proyecto con alto potencial de réplica.",
    docente_revisor: "Pr. Samuel Quispe (CETI)",
    fecha_revision: "2026-10-25",
  },
  {
    id: 7,
    numero: 7,
    titulo: "Oración, Intercesión y Vida Devocional Comunitaria",
    modulo_tematico: "Módulo IV: Espiritualidad Integral",
    descripcion:
      "Registro de bitácora devocional de 21 días, lecturas bíblicas comentadas y motivos de intercesión por la juventud y la patria.",
    fecha_limite: "2026-11-07",
    ponderacion: 8.33,
    estado: "entregado",
    archivo_nombre: "Tarea_07_Bitacora_Devocional_Flores.pdf",
    archivo_url: "data:application/pdf;base64,JVBERi0xLjQKJ...",
    archivo_tamano: "1.3 MB",
    fecha_entrega: "2026-10-27",
    comentario_estudiante: "Entrego con anticipación mi bitácora devocional con reflexiones semanales.",
    calificacion_100: undefined,
  },
  {
    id: 8,
    numero: 8,
    titulo: "Teología del Trabajo y Excelencia Laboral",
    modulo_tematico: "Módulo IV: Espiritualidad Integral",
    descripcion:
      "Ensayo crítico sobre el trabajo como culto a Dios (Colosenses 3:23) y la responsabilidad del profesional cristiano en el progreso social.",
    fecha_limite: "2026-11-14",
    ponderacion: 8.33,
    estado: "pendiente",
  },
  {
    id: 9,
    numero: 9,
    titulo: "Mayordomía del Tiempo y Gestión Personal",
    modulo_tematico: "Módulo V: Habilidades de Liderazgo",
    descripcion:
      "Plan de organización personal, equilibrio académico-laboral-espiritual y matriz de prioridades de Eisenhower aplicada al estudiante diaconal.",
    fecha_limite: "2026-11-21",
    ponderacion: 8.33,
    estado: "pendiente",
  },
  {
    id: 10,
    numero: 10,
    titulo: "Liderazgo Pastoral y Cuidado de la Juventud",
    modulo_tematico: "Módulo V: Habilidades de Liderazgo",
    descripcion:
      "Guía práctica de mentoría para discipular y acompañar a adolescentes y jóvenes en la iglesia local frente a las crisis de la posmodernidad.",
    fecha_limite: "2026-11-28",
    ponderacion: 8.33,
    estado: "pendiente",
  },
  {
    id: 11,
    numero: 11,
    titulo: "Evangelismo Contextualizado y Discipulado Bíblico",
    modulo_tematico: "Módulo VI: Proyección Eclesial",
    descripcion:
      "Estrategia de comunicación del Evangelio adaptada a la era digital, redes sociales y dinámicas universitarias contemporáneas.",
    fecha_limite: "2026-12-05",
    ponderacion: 8.33,
    estado: "pendiente",
  },
  {
    id: 12,
    numero: 12,
    titulo: "Proyecto Final de Aplicación Comunitaria Diaconal",
    modulo_tematico: "Módulo VI: Proyección Eclesial",
    descripcion:
      "Monografía final integradora de los 12 módulos CETI con informe de implementación real en la iglesia o comunidad beneficiaria.",
    fecha_limite: "2026-12-15",
    ponderacion: 8.33,
    estado: "pendiente",
  },
];

export interface EscuelaLideresClassroomProps {
  becario_id_actual?: number;
  nombre_becario_actual?: string;
  es_supervisor_o_admin?: boolean;
  alActualizarNotaModulo4?: (nota_20: number) => void;
}

export function EscuelaLideresClassroom({
  becario_id_actual = 1,
  nombre_becario_actual = "Ruddy Flores Tapia",
  es_supervisor_o_admin = true,
  alActualizarNotaModulo4,
}: EscuelaLideresClassroomProps) {
  // Selector de becario (para supervisores y administradores)
  const [becario_seleccionado_id, set_becario_seleccionado_id] = useState<number>(becario_id_actual);
  const [nombre_becario_activo, set_nombre_becario_activo] = useState<string>(nombre_becario_actual);

  // Lista canónica de tareas
  const [tareas, set_tareas] = useState<TareaCetiCanonica[]>(TAREAS_CETI_INICIALES);
  const [filtro_estado, set_filtro_estado] = useState<"todas" | "pendientes" | "entregadas" | "revisadas">("todas");
  const [busqueda, set_busqueda] = useState<string>("");

  // Estado del modal de tarea activa
  const [tarea_activa, set_tarea_activa] = useState<TareaCetiCanonica | null>(null);
  const [modal_abierto, set_modal_abierto] = useState<boolean>(false);

  // Campos para la entrega del estudiante
  const [archivo_entrega_nombre, set_archivo_entrega_nombre] = useState<string>("");
  const [archivo_entrega_url, set_archivo_entrega_url] = useState<string>("");
  const [archivo_entrega_tamano, set_archivo_entrega_tamano] = useState<string>("");
  const [comentario_entrega, set_comentario_entrega] = useState<string>("");
  const [guardando_entrega, set_guardando_entrega] = useState<boolean>(false);

  // Campos para la revisión del supervisor / administrador
  const [nota_calificacion_input, set_nota_calificacion_input] = useState<string>("90");
  const [retroalimentacion_input, set_retroalimentacion_input] = useState<string>("");
  const [guardando_revision, set_guardando_revision] = useState<boolean>(false);

  // Carga inicial desde el backend si está disponible
  useEffect(() => {
    async function cargarTareas() {
      try {
        const respuesta = await clienteApi.get<TareaCetiCanonica[]>(
          `/api/evaluaciones/escuela-lideres/tareas?becario_id=${becario_seleccionado_id}`
        );
        if (respuesta && Array.isArray(respuesta) && respuesta.length > 0) {
          set_tareas(respuesta);
        }
      } catch (_e) {
        // Fallback en tareas iniciales con estado reactivo local
      }
    }
    cargarTareas();
  }, [becario_seleccionado_id]);

  // Cálculos estadísticos y de notas canónicas
  const tareas_entregadas = tareas.filter((t) => t.estado === "entregado" || t.estado === "revisado");
  const tareas_revisadas = tareas.filter((t) => t.estado === "revisado" && t.calificacion_100 !== undefined);

  // Promedio sobre 100 de las tareas revisadas
  const promedio_100 =
    tareas_revisadas.length > 0
      ? Number(
          (
            tareas_revisadas.reduce((acc, t) => acc + (t.calificacion_100 || 0), 0) /
            tareas_revisadas.length
          ).toFixed(1)
        )
      : 0;

  // Nota canónica de Módulo 4 (/20 Puntos oficiales)
  // Regla institucional: el 100% de cumplimiento equivale a 20 puntos
  const nota_modulo_4_sobre_20 = Number(((promedio_100 / 100) * 20).toFixed(1));

  const abrirModalTarea = (tarea: TareaCetiCanonica) => {
    set_tarea_activa(tarea);
    set_archivo_entrega_nombre(tarea.archivo_nombre || "");
    set_archivo_entrega_url(tarea.archivo_url || "");
    set_archivo_entrega_tamano(tarea.archivo_tamano || "");
    set_comentario_entrega(tarea.comentario_estudiante || "");
    set_nota_calificacion_input(
      tarea.calificacion_100 !== undefined ? String(tarea.calificacion_100) : "90"
    );
    set_retroalimentacion_input(
      tarea.retroalimentacion_docente ||
        "Buen trabajo reflexivo. Continúa profundizando en la vocación diaconal."
    );
    set_modal_abierto(true);
  };

  const manejarSubidaArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      toast.error("El archivo no debe exceder 25 MB.");
      return;
    }

    const tamano_str =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    const lector = new FileReader();
    lector.onload = () => {
      set_archivo_entrega_nombre(file.name);
      set_archivo_entrega_url(lector.result as string);
      set_archivo_entrega_tamano(tamano_str);
      toast.success("Documento adjuntado correctamente.");
    };
    lector.readAsDataURL(file);
  };

  const entregarTareaEstudiante = async () => {
    if (!tarea_activa) return;

    if (!archivo_entrega_nombre) {
      toast.error("Debe adjuntar el archivo o evidencia de la tarea.");
      return;
    }

    set_guardando_entrega(true);
    try {
      const payload = {
        tarea_id: tarea_activa.id,
        becario_id: becario_seleccionado_id,
        archivo_nombre: archivo_entrega_nombre,
        archivo_url: archivo_entrega_url,
        archivo_tamano: archivo_entrega_tamano,
        comentario_estudiante: comentario_entrega,
        fecha_entrega: new Date().toISOString().substring(0, 10),
      };

      try {
        await clienteApi.post("/api/evaluaciones/escuela-lideres/tareas/entregar", payload);
      } catch (_e) {
        // Fallback reactivo
      }

      set_tareas((prev) =>
        prev.map((t) =>
          t.id === tarea_activa.id
            ? {
                ...t,
                estado: "entregado",
                archivo_nombre: archivo_entrega_nombre,
                archivo_url: archivo_entrega_url,
                archivo_tamano: archivo_entrega_tamano,
                comentario_estudiante: comentario_entrega,
                fecha_entrega: new Date().toISOString().substring(0, 10),
              }
            : t
        )
      );

      toast.success("¡Tarea entregada exitosamente en Escuela de Líderes!", {
        description: `Tarea #${tarea_activa.numero}: ${tarea_activa.titulo} registrada para revisión docente.`,
      });

      set_modal_abierto(false);
    } finally {
      set_guardando_entrega(false);
    }
  };

  const calificarYRevisarSupervisor = async () => {
    if (!tarea_activa) return;

    const nota_num = parseFloat(nota_calificacion_input);
    if (isNaN(nota_num) || nota_num < 0 || nota_num > 100) {
      toast.error("Ingrese una calificación válida entre 0 y 100 puntos.");
      return;
    }

    set_guardando_revision(true);
    try {
      const payload = {
        entrega_id: tarea_activa.id,
        becario_id: becario_seleccionado_id,
        calificacion_100: nota_num,
        retroalimentacion_docente: retroalimentacion_input,
        docente_revisor: "Supervisor / Docente CETI",
        fecha_revision: new Date().toISOString().substring(0, 10),
      };

      try {
        await clienteApi.patch(
          `/api/evaluaciones/escuela-lideres/entregas/${tarea_activa.id}/revisar`,
          payload
        );
      } catch (_e) {
        // Fallback reactivo
      }

      const nuevas_tareas = tareas.map((t) =>
        t.id === tarea_activa.id
          ? {
              ...t,
              estado: "revisado" as const,
              calificacion_100: nota_num,
              retroalimentacion_docente: retroalimentacion_input,
              docente_revisor: "Supervisor Diaconía",
              fecha_revision: new Date().toISOString().substring(0, 10),
            }
          : t
      );
      set_tareas(nuevas_tareas);

      // Recalcular nueva nota consolidada del Módulo 4
      const revisadas_actualizadas = nuevas_tareas.filter(
        (t) => t.estado === "revisado" && t.calificacion_100 !== undefined
      );
      const nuevo_promedio =
        revisadas_actualizadas.length > 0
          ? Number(
              (
                revisadas_actualizadas.reduce((acc, t) => acc + (t.calificacion_100 || 0), 0) /
                revisadas_actualizadas.length
              ).toFixed(1)
            )
          : 0;
      const nueva_nota_20 = Number(((nuevo_promedio / 100) * 20).toFixed(1));

      toast.success("¡Tarea revisada y calificada exitosamente!", {
        description: `Nota asignada: ${nota_num} / 100 pts. Nuevo puntaje Módulo 4: ${nueva_nota_20} / 20 pts.`,
      });

      if (alActualizarNotaModulo4) {
        alActualizarNotaModulo4(nueva_nota_20);
      }

      set_modal_abierto(false);
    } finally {
      set_guardando_revision(false);
    }
  };

  const tareas_filtradas = tareas.filter((t) => {
    if (filtro_estado === "pendientes" && t.estado !== "pendiente") return false;
    if (filtro_estado === "entregadas" && t.estado !== "entregado") return false;
    if (filtro_estado === "revisadas" && t.estado !== "revisado") return false;
    if (busqueda.trim() === "") return true;

    const q = busqueda.toLowerCase();
    return (
      t.titulo.toLowerCase().includes(q) ||
      t.modulo_tematico.toLowerCase().includes(q) ||
      t.descripcion.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* BANNER ESTILO GOOGLE CLASSROOM CON COLORES INSTITUCIONALES BUMAND */}
      {/* ============================================================== */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#035683] via-[#00808E] to-[#00ABBD] text-white p-6 shadow-md border border-[#035683]">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 flex items-center justify-center pointer-events-none">
          <BookOpen className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-[#FFB600] text-[#035683] font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5">
                Classroom Oficial CETI · Módulo 4
              </Badge>
              <span className="text-xs text-white/80 font-medium">Programa BUMAND · Semestre II · 2026</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Users className="w-7 h-7 text-[#FFB600]" />
              Escuela de Líderes: 12 Tareas de Formación Teológica
            </h2>
            <p className="text-xs text-white/90 leading-relaxed">
              Plataforma pedagógica canónica para la entrega, cotejo de evidencias y retroalimentación formativa de las 12 asignaciones semestrales diaconales.
            </p>
          </div>

          {/* Tarjeta KPI Consolidada de la Escuela de Líderes */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/20 self-stretch md:self-auto justify-between md:justify-start">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-white/75 block">
                Nota Módulo 4
              </span>
              <span className="font-mono text-3xl font-black text-white">
                {nota_modulo_4_sobre_20}
                <span className="text-xs font-normal text-white/80 ml-1">/ 20 Pts</span>
              </span>
            </div>
            <div className="pl-4 border-l border-white/20 text-left space-y-0.5">
              <div className="text-[11px] font-bold text-[#FFB600]">
                {tareas_revisadas.length} de 12 Revisadas
              </div>
              <div className="text-[10px] text-white/80 font-mono">
                Promedio: {promedio_100} / 100 pts
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* BARRA DE HERRAMIENTAS: SELECTOR DE BECARIO Y FILTROS RÁPIDOS   */}
      {/* ============================================================== */}
      <Card className="border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <CardContent className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Selector de Becario (Vista Supervisor / Admin) */}
            {es_supervisor_o_admin && (
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <GraduationCap className="w-4 h-4 text-[#00ABBD]" />
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground">
                    Becario Seleccionado:
                  </span>
                  <Select
                    value={String(becario_seleccionado_id)}
                    onValueChange={(val: string | null) => {
                      if (!val) return;
                      const id = Number(val);
                      set_becario_seleccionado_id(id);
                      const bec = BECARIOS_SEMESTRE_II.find((b) => b.id === id);
                      if (bec) {
                        set_nombre_becario_activo(bec.nombre_completo);
                        toast.info(`Becario cambiado: ${bec.nombre_completo}`);
                      }
                    }}
                  >
                    <SelectTrigger className="h-7 border-none shadow-none text-xs font-bold text-[#035683] p-0 focus:ring-0">
                      <SelectValue placeholder="Seleccione un becario" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-[#E5E7EB]">
                      {BECARIOS_SEMESTRE_II.map((b) => (
                        <SelectItem key={b.id} value={String(b.id)} className="text-xs font-medium">
                          {b.nombre_completo} ({b.carrera})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Pestañas de Filtro Rápido */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => set_filtro_estado("todas")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filtro_estado === "todas"
                    ? "bg-[#035683] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Todas (12)
              </button>
              <button
                type="button"
                onClick={() => set_filtro_estado("pendientes")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filtro_estado === "pendientes"
                    ? "bg-[#035683] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pendientes ({tareas.filter((t) => t.estado === "pendiente").length})
              </button>
              <button
                type="button"
                onClick={() => set_filtro_estado("entregadas")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filtro_estado === "entregadas"
                    ? "bg-[#035683] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Por Revisar ({tareas.filter((t) => t.estado === "entregado").length})
              </button>
              <button
                type="button"
                onClick={() => set_filtro_estado("revisadas")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filtro_estado === "revisadas"
                    ? "bg-[#035683] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Revisadas ({tareas.filter((t) => t.estado === "revisado").length})
              </button>
            </div>
          </div>

          {/* Buscador de Tareas */}
          <div className="relative w-full md:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <Input
              type="text"
              value={busqueda}
              onChange={(e) => set_busqueda(e.target.value)}
              placeholder="Buscar tarea o tema..."
              className="h-9 pl-8 text-xs rounded-xl border-slate-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* ============================================================== */}
      {/* TABLERO DE LAS 12 TAREAS CETI EN ESTILO GOOGLE CLASSROOM       */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tareas_filtradas.map((tarea) => {
          const es_revisada = tarea.estado === "revisado";
          const es_entregada = tarea.estado === "entregado";
          const es_pendiente = tarea.estado === "pendiente";

          return (
            <Card
              key={tarea.id}
              className={`rounded-2xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between overflow-hidden cursor-pointer ${
                es_revisada
                  ? "border-emerald-200 bg-white"
                  : es_entregada
                  ? "border-sky-300 bg-sky-50/20"
                  : "border-slate-200 bg-white"
              }`}
              onClick={() => abrirModalTarea(tarea)}
            >
              <div>
                {/* Cabecera de la Tarjeta */}
                <div className="p-4 pb-2 border-b border-slate-100 flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-bold text-[#00ABBD] uppercase">
                      Tarea #{tarea.numero} · {tarea.ponderacion}%
                    </span>
                    <h3 className="text-sm font-bold text-[#035683] line-clamp-1 leading-snug">
                      {tarea.titulo}
                    </h3>
                  </div>

                  {es_revisada ? (
                    <Badge className="bg-emerald-600 text-white font-bold text-[10px] gap-1 shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                      {tarea.calificacion_100}/100
                    </Badge>
                  ) : es_entregada ? (
                    <Badge className="bg-[#00ABBD] text-[#035683] font-bold text-[10px] gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      Entregada
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-400 bg-amber-50 text-amber-800 text-[10px] shrink-0">
                      Pendiente
                    </Badge>
                  )}
                </div>

                {/* Contenido / Consigna */}
                <div className="p-4 space-y-2 text-xs">
                  <span className="text-[11px] font-semibold text-slate-500 block">
                    {tarea.modulo_tematico}
                  </span>
                  <p className="text-slate-700 text-xs line-clamp-3 leading-relaxed">
                    {tarea.descripcion}
                  </p>
                </div>
              </div>

              {/* Pie de la Tarjeta */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Límite: {tarea.fecha_limite}
                </span>

                <span className="font-bold text-[#035683] flex items-center gap-0.5 group hover:text-[#00ABBD]">
                  {es_supervisor_o_admin ? (es_revisada ? "Ver Calificación" : "Calificar Entrega") : (es_entregada ? "Ver Mi Entrega" : "Subir Tarea")}
                  <ChevronRight className="w-3.5 h-3.5 text-[#00ABBD]" />
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* DIÁLOGO MODAL: ENTREGA (BECARIO) Y REVISIÓN (SUPERVISOR / CETI) */}
      {/* ============================================================== */}
      {tarea_activa && (
        <Dialog open={modal_abierto} onOpenChange={set_modal_abierto}>
          <DialogContent
            showCloseButton={false}
            className="sm:max-w-3xl max-h-[92vh] flex flex-col p-0 overflow-hidden rounded-2xl bg-white border border-[#E5E7EB] shadow-2xl"
          >
            {/* Cabecera del Modal */}
            <DialogHeader className="p-5 pb-3 border-b border-[#E5E7EB] bg-[#F8F9FA] shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#035683] text-white font-mono text-[10px]">
                      Tarea #{tarea_activa.numero} de 12
                    </Badge>
                    <span className="text-xs text-muted-foreground">{tarea_activa.modulo_tematico}</span>
                  </div>
                  <DialogTitle className="font-display text-lg font-bold text-[#035683]">
                    {tarea_activa.titulo}
                  </DialogTitle>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-[#00ABBD] text-[#035683] font-bold text-xs">
                    Ponderación: {tarea_activa.ponderacion}%
                  </Badge>
                </div>
              </div>
            </DialogHeader>

            {/* Cuerpo del Modal */}
            <DialogBody className="p-6 space-y-5 flex-1 overflow-y-auto">
              {/* Consigna Oficial */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-xs font-bold text-[#035683] uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#00ABBD]" />
                  Instrucciones y Consigna Teológica
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {tarea_activa.descripcion}
                </p>
                <div className="pt-2 text-[11px] font-mono text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Fecha límite de recepción canónica: <strong>{tarea_activa.fecha_limite}</strong>
                </div>
              </div>

              {/* Sección de Evidencia / Archivo Entregado */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#035683] uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#00ABBD]" />
                  Evidencia o Archivo de la Asignación
                </h4>

                {archivo_entrega_nombre ? (
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3 truncate">
                      <FileText className="w-6 h-6 text-rose-600 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-800 truncate">{archivo_entrega_nombre}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {archivo_entrega_tamano || "1.2 MB"} · Entregado por {nombre_becario_activo}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={archivo_entrega_url || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center h-8 px-3 text-xs font-bold text-[#035683] hover:bg-[#035683]/10 rounded-lg border border-[#035683]/30 gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ver Evidencia
                      </a>

                      {!es_supervisor_o_admin && (
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            onChange={manejarSubidaArchivo}
                            className="hidden"
                          />
                          <span className="inline-flex items-center justify-center h-8 px-3 text-xs text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 font-medium">
                            Cambiar
                          </span>
                        </label>
                      )}
                    </div>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-[#00ABBD]/40 hover:border-[#00ABBD] rounded-xl p-6 flex flex-col items-center justify-center gap-2 bg-white cursor-pointer transition-colors shadow-2xs">
                    <Upload className="w-6 h-6 text-[#00ABBD]" />
                    <span className="text-xs font-bold text-[#035683]">
                      Subir archivo de la tarea (PDF o Imagen)
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Documento formal con carátula y bibliografía según formato CETI
                    </span>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={manejarSubidaArchivo}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Comentario del Estudiante */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#00ABBD]" />
                  Comentario y Reflexión Personal del Becario
                </Label>
                <Textarea
                  value={comentario_entrega}
                  onChange={(e) => set_comentario_entrega(e.target.value)}
                  disabled={es_supervisor_o_admin && tarea_activa.estado === "revisado"}
                  placeholder="Escriba aquí los aspectos más destacados aprendidos en esta tarea..."
                  className="text-xs rounded-xl border-slate-200 min-h-[70px] bg-white"
                />
              </div>

              {/* SECCIÓN EXCLUSIVA DE SUPERVISOR / DOCENTE CETI: CALIFICACIÓN Y RETROALIMENTACIÓN */}
              {es_supervisor_o_admin && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50/70 via-sky-50/50 to-white border border-emerald-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#035683] uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-600" />
                      Evaluación Docente y Calificación Oficial (CETI / Supervisor)
                    </h4>
                    {tarea_activa.calificacion_100 !== undefined && (
                      <Badge className="bg-emerald-600 text-white font-mono text-xs font-bold px-2.5 py-0.5">
                        Nota Oficial: {tarea_activa.calificacion_100} / 100 Pts
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                    <div className="sm:col-span-1 space-y-1">
                      <Label className="text-[11px] font-bold text-slate-700">Calificación (0-100):</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={nota_calificacion_input}
                        onChange={(e) => set_nota_calificacion_input(e.target.value)}
                        className="h-9 text-sm font-mono font-bold text-center bg-white border-slate-300 rounded-xl"
                      />
                    </div>
                    <div className="sm:col-span-3 space-y-1">
                      <Label className="text-[11px] font-bold text-slate-700">Retroalimentación Formativa:</Label>
                      <Input
                        type="text"
                        value={retroalimentacion_input}
                        onChange={(e) => set_retroalimentacion_input(e.target.value)}
                        placeholder="Observaciones de fondo, felicitación o sugerencias teológicas..."
                        className="h-9 text-xs bg-white border-slate-300 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Si ya fue calificada y es becario, visualización de la retroalimentación */}
              {!es_supervisor_o_admin && tarea_activa.calificacion_100 !== undefined && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900">Devolución del Docente CETI:</span>
                    <Badge className="bg-emerald-600 text-white font-bold font-mono">
                      {tarea_activa.calificacion_100} / 100 Pts
                    </Badge>
                  </div>
                  <p className="text-emerald-800 italic mt-1">
                    &quot;{tarea_activa.retroalimentacion_docente}&quot;
                  </p>
                  <p className="text-[10px] text-emerald-700 pt-1">
                    Revisado por {tarea_activa.docente_revisor} el {tarea_activa.fecha_revision}
                  </p>
                </div>
              )}
            </DialogBody>

            {/* Pie del Modal */}
            <DialogFooter className="p-4 border-t border-[#E5E7EB] bg-[#F8F9FA] flex justify-between sm:justify-end gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => set_modal_abierto(false)}
                className="text-xs border-[#E5E7EB] rounded-xl"
              >
                Cerrar
              </Button>

              {es_supervisor_o_admin ? (
                <Button
                  type="button"
                  onClick={calificarYRevisarSupervisor}
                  disabled={guardando_revision}
                  className="h-9 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  {guardando_revision ? "Guardando Nota..." : "Marcar como Revisado y Calificar"}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={entregarTareaEstudiante}
                  disabled={guardando_entrega || !archivo_entrega_nombre}
                  className="h-9 px-5 bg-[#035683] hover:bg-[#024063] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5 text-[#FFB600]" />
                  {guardando_entrega ? "Enviando Tarea..." : "Entregar Tarea a Escuela de Líderes"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
