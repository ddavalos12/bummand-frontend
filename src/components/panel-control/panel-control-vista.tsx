"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import {
  esMentorAutenticado,
  usarBecariosDesignadosMentor,
} from "@/lib/filtro-mentor";
import { InsigniaBecariosDesignados } from "@/components/ui/insignia-becarios-designados";
import { clienteApi } from "@/lib/cliente-api";
import { descargarPdfConResiliencia } from "@/lib/generador-pdf-cliente";
import {
  ContadorAnimado,
  ContenedorEscalonado,
  ElementoEscalonado,
  TarjetaSpotlight,
} from "@/components/animaciones";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SeleccionadorFecha } from "@/components/ui/seleccionador-fecha";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import {
  Users,
  Clock,
  FileCheck,
  TrendingUp,
  AlertCircle,
  DollarSign,
  BarChart3,
  CalendarDays,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  BookOpen,
  Calendar,
  Building2,
  HelpCircle,
  Filter,
  Coins,
  RotateCcw,
  Search,
  ChevronRight,
  ArrowRight,
  Edit3,
  Download,
  History,
  Check,
  X,
  FileSpreadsheet,
  ChevronLeft,
  Loader2,
  HeartHandshake,
} from "lucide-react";
import {
  DialogoGestionCasoPastoral,
  CasoPastoralCompleto,
} from "./dialogo-gestion-caso-pastoral";
export type { CasoPastoralCompleto };
import {
  DialogoJustificarRetraso,
  BecarioRetrasoItem,
} from "./dialogo-justificar-retraso";
import { DialogoNuevoCasoPastoral } from "./dialogo-nuevo-caso-pastoral";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

// --- TIPOS DE DATOS ---

export interface BecarioRetraso {
  id: number;
  nombre: string;
  avatar: string;
  carrera: string;
  fecha: string;
  hora_prevista: string;
  hora_real: string;
  minutos_retraso: number;
  sede: string;
  tipo_asistencia: "Prácticas" | "Escuela de Líderes" | "Acciones de Servicio";
}

export interface RegistroAsistenciaSemanal {
  id: number;
  nombre: string;
  avatar: string;
  carrera: string;
  horario_asignado: string;
  asistio: boolean;
  minutos_retraso?: number;
  fecha_corte: string;
}

export interface FilaHorarioApoyo {
  numero: number;
  becario_id: number;
  nombre: string;
  ci: string;
  cantidad_materias: string;
  periodo: string;
  lugar_practica_id?: number | null;
  sede_nombre?: string;
  lunes: string;
  martes: string;
  miercoles: string;
  jueves: string;
  viernes: string;
  destacada?: boolean;
}

export interface CasoSeguimiento {
  id: number;
  nombre: string;
  avatar: string;
  carrera: string;
  universidad: string;
  observacion: string;
}

export interface FilaKardex {
  posicion: string;
  nombre: string;
  avatar: string;
  liderazgo_iglesia: number;
  academico: number;
  mentor: number;
  escuela_lideres: number;
  socioeconomica: number | string;
  promedio: string;
}

export interface PeriodoAcademicoItem {
  id: string;
  etiqueta: string;
  gestion: number;
  semestre: string;
  estado: "vigente" | "cerrado" | "historico";
  estado_texto: string;
  total_becarios: number;
  promedio_general: string;
}

export interface MesHorasDetalle {
  mes_num: number;
  mes_corto: string;
  mes_nombre: string;
  semanas: string[];
}

export interface LugarPracticaItem {
  id: number;
  nombre: string;
  direccion?: string | null;
  activo?: boolean;
}

const MESES_ANIO_BASE: MesHorasDetalle[] = [
  { mes_num: 1, mes_corto: "Ene", mes_nombre: "Enero", semanas: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"] },
  { mes_num: 2, mes_corto: "Feb", mes_nombre: "Febrero", semanas: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"] },
  { mes_num: 3, mes_corto: "Mar", mes_nombre: "Marzo", semanas: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"] },
  { mes_num: 4, mes_corto: "Abr", mes_nombre: "Abril", semanas: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"] },
  { mes_num: 5, mes_corto: "May", mes_nombre: "Mayo", semanas: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"] },
  { mes_num: 6, mes_corto: "Jun", mes_nombre: "Junio", semanas: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"] },
  { mes_num: 7, mes_corto: "Jul", mes_nombre: "Julio", semanas: ["Sem 1 (01-07)", "Sem 2 (08-14)", "Sem 3 (15-21)", "Sem 4 (22-28)"] },
  { mes_num: 8, mes_corto: "Ago", mes_nombre: "Agosto", semanas: ["Sem 1 (01-07)", "Sem 2 (08-14)", "Sem 3 (15-21)", "Sem 4 (22-28)"] },
  { mes_num: 9, mes_corto: "Sep", mes_nombre: "Septiembre", semanas: ["Sem 1 (01-07)", "Sem 2 (08-14)", "Sem 3 (15-21)", "Sem 4 (22-28)"] },
  { mes_num: 10, mes_corto: "Oct", mes_nombre: "Octubre", semanas: ["Sem 1 (01-07)", "Sem 2 (08-14)", "Sem 3 (15-21)", "Sem 4 (22-28)"] },
  { mes_num: 11, mes_corto: "Nov", mes_nombre: "Noviembre", semanas: ["Sem 1 (01-07)", "Sem 2 (08-14)", "Sem 3 (15-21)", "Sem 4 (22-28)"] },
  { mes_num: 12, mes_corto: "Dic", mes_nombre: "Diciembre", semanas: ["Sem 1 (01-07)", "Sem 2 (08-14)", "Sem 3 (15-21)", "Sem 4 (22-28)"] },
];

const COLORES_DISTRIBUCION = ["#035683", "#00ABBD", "#FFB600", "#00808E", "#5B6D77", "#E2694B"];

function construirInicialesAvatar(nombre?: string | null): string {
  const limpio = String(nombre || "").trim();
  if (!limpio) return "BC";
  const partes = limpio.split(/\s+/).filter(Boolean);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

function normalizarRangoHorario(valor?: string | null): string {
  if (!valor) return "—";
  const limpio = String(valor).replace(/\s*-\s*/g, "-").trim();
  if (!limpio || limpio === "-" || limpio === "—") return "—";
  return limpio;
}

function construirFilaHorarioBecario(b: any, idx: number): FilaHorarioApoyo {
  const horarios_tabla: any[] = Array.isArray(b.horarios_apoyo) ? b.horarios_apoyo : [];
  const horario_json: Record<string, string> =
    b.horario_semanal && typeof b.horario_semanal === "object" ? b.horario_semanal : {};

  const obtenerDia = (dia_num: number, claves_json: string[]): string => {
    const reg = horarios_tabla.find((h) => Number(h.dia_semana) === dia_num && h.activo !== false);
    if (reg && reg.hora_inicio && reg.hora_fin) {
      return `${String(reg.hora_inicio).slice(0, 5)}-${String(reg.hora_fin).slice(0, 5)}`;
    }
    for (const c of claves_json) {
      const encontrado = Object.entries(horario_json).find(
        ([k]) => k.toLowerCase().trim() === c
      );
      if (encontrado && encontrado[1]) {
        return normalizarRangoHorario(encontrado[1]);
      }
    }
    return "—";
  };

  const ci_base = b.ci ? String(b.ci).trim() : "";
  const exp = b.lugar_expedicion ? ` ${String(b.lugar_expedicion).trim()}` : "";

  return {
    numero: idx + 1,
    becario_id: Number(b.id),
    nombre: b.nombre || b.usuario?.nombre || `Becario #${b.id}`,
    ci: ci_base ? `${ci_base}${exp}` : "—",
    cantidad_materias: b.ceti !== null && b.ceti !== undefined ? `CETI ${b.ceti}` : "—",
    periodo: b.modalidad_carrera || "—",
    lugar_practica_id: b.lugar_practica_id || b.lugar_practica?.id || null,
    sede_nombre: b.lugar_practica?.nombre || "",
    lunes: obtenerDia(1, ["lunes", "lun"]),
    martes: obtenerDia(2, ["martes", "mar"]),
    miercoles: obtenerDia(3, ["miercoles", "miércoles", "mie"]),
    jueves: obtenerDia(4, ["jueves", "jue"]),
    viernes: obtenerDia(5, ["viernes", "vie"]),
  };
}

function resumirHorarioBecario(fila?: FilaHorarioApoyo): string {
  if (!fila) return "Sin horario asignado";
  const dias: string[] = [];
  if (fila.lunes !== "—") dias.push(`Lun ${fila.lunes}`);
  if (fila.martes !== "—") dias.push(`Mar ${fila.martes}`);
  if (fila.miercoles !== "—") dias.push(`Mié ${fila.miercoles}`);
  if (fila.jueves !== "—") dias.push(`Jue ${fila.jueves}`);
  if (fila.viernes !== "—") dias.push(`Vie ${fila.viernes}`);
  return dias.length > 0 ? dias.join(", ") : "Sin horario asignado";
}

const CONFIGURACION_GRAFICO = {
  horas: {
    label: "Horas Reales",
    color: "#00ABBD",
  },
  meta: {
    label: "Meta Planificada",
    color: "#035683",
  },
};

/**
 * @component PanelControlVista
 * @description Vista ejecutiva principal del Dashboard institucional BUMAND, estructurada
 * mediante navegación por pestañas temáticas, selector de fechas accesible Popover + Calendar
 * y gobernanza institucional de asignación de horarios.
 */
export function PanelControlVista() {
  const { usuario } = usarAutenticacion();
  const { es_mentor, becarios_designados, filtrarPorMentor } =
    usarBecariosDesignadosMentor();
  const [pestaña_dashboard, set_pestaña_dashboard] = useState<"resumen" | "seguimiento" | "horarios" | "analitica">("resumen");
  const [subpestaña_seguimiento, set_subpestaña_seguimiento] = useState<"retrasos" | "asistencia">("retrasos");
  const [filtro_asistencia, set_filtro_asistencia] = useState<"todos" | "asistieron" | "no_asistieron">("todos");
  const [vista_anual, set_vista_anual] = useState<boolean>(false);
  const [periodo_academico, set_periodo_academico] = useState<string>("2026-s2");

  // --- CONTROL TEMPORAL Y FILTRADO POR ACTIVIDAD (IMAGEN 1) ---
  const [semana_offset, set_semana_offset] = useState<number>(0);
  const [filtro_tipo_actividad, set_filtro_tipo_actividad] = useState<
    "todas" | "practicas" | "escuela_lideres" | "acciones_servicio"
  >("todas");
  const [exportando_pdf_corte, set_exportando_pdf_corte] = useState<boolean>(false);

  // --- RECTIFICACIÓN Y JUSTIFICACIÓN DE RETRASOS ---
  const [lista_retrasos, set_lista_retrasos] = useState<BecarioRetrasoItem[]>([]);
  const [registros_asistencia_api, set_registros_asistencia_api] = useState<RegistroAsistenciaSemanal[]>([]);
  const [becario_a_justificar, set_becario_a_justificar] = useState<BecarioRetrasoItem | null>(null);
  const [dialogo_justificar_abierto, set_dialogo_justificar_abierto] = useState<boolean>(false);

  // --- CASOS PASTORALES Y DE MENTORÍA ---
  const [casos_pastorales, set_casos_pastorales] = useState<CasoPastoralCompleto[]>([]);
  const [filtro_estado_casos, set_filtro_estado_casos] = useState<"todos" | "PENDIENTE" | "EN_TUTORIA" | "RESUELTO">("todos");
  const [caso_a_gestionar, set_caso_a_gestionar] = useState<CasoPastoralCompleto | null>(null);
  const [dialogo_gestion_caso_abierto, set_dialogo_gestion_caso_abierto] = useState<boolean>(false);
  const [dialogo_nuevo_caso_abierto, set_dialogo_nuevo_caso_abierto] = useState<boolean>(false);

  // Datos reales desde Backend (Becarios, Sedes, Periodos y Matriz de Horarios)
  const [becarios_reales, set_becarios_reales] = useState<any[]>([]);
  const [lugares_practica_lista, set_lugares_practica_lista] = useState<LugarPracticaItem[]>([]);
  const [periodos_lista, set_periodos_lista] = useState<PeriodoAcademicoItem[]>([]);
  const [horarios_lista, set_horarios_lista] = useState<FilaHorarioApoyo[]>([]);
  const [becario_a_editar, set_becario_a_editar] = useState<FilaHorarioApoyo | null>(null);
  const [dialogo_edicion_abierto, set_dialogo_edicion_abierto] = useState<boolean>(false);
  const [sede_edit, set_sede_edit] = useState<string>("");
  const [materias_declaradas_edit, set_materias_declaradas_edit] = useState<string>("");
  const [dias_detallados_edit, set_dias_detallados_edit] = useState<{
    [key: string]: { activo: boolean; inicio: string; fin: string };
  }>({
    lunes: { activo: true, inicio: "08:00", fin: "12:00" },
    martes: { activo: false, inicio: "08:00", fin: "12:00" },
    miercoles: { activo: true, inicio: "08:00", fin: "12:00" },
    jueves: { activo: false, inicio: "08:00", fin: "12:00" },
    viernes: { activo: true, inicio: "08:00", fin: "12:00" },
  });

  // Filtros de la Matriz de Horarios
  const [busqueda_horario, set_busqueda_horario] = useState<string>("");
  const [filtro_dia_horario, set_filtro_dia_horario] = useState<"todos" | "lunes" | "martes" | "miercoles" | "jueves" | "viernes">("todos");

  // --- CÁLCULO DINÁMICO DE SEMANA PARA AUDITORÍA Y CORTE ---
  const info_semana = useMemo(() => {
    const ahora = new Date();
    const fecha_ref = new Date(ahora.getTime() + semana_offset * 7 * 24 * 3600 * 1000);
    const dia_sem = fecha_ref.getDay();
    const dif_lun = dia_sem === 0 ? -6 : 1 - dia_sem;
    const lunes = new Date(fecha_ref);
    lunes.setDate(fecha_ref.getDate() + dif_lun);
    const viernes = new Date(lunes);
    viernes.setDate(lunes.getDate() + 4);
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);

    const inicio_iso = lunes.toISOString().split("T")[0];
    const fin_iso = domingo.toISOString().split("T")[0];

    const inicio_anio = new Date(lunes.getFullYear(), 0, 1);
    const dias = Math.floor((lunes.getTime() - inicio_anio.getTime()) / (24 * 3600 * 1000));
    const num_semana = Math.ceil((dias + inicio_anio.getDay() + 1) / 7);

    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const etiqueta = `Semana ${num_semana} · ${lunes.getDate()} al ${viernes.getDate()} de ${meses[lunes.getMonth()]} ${lunes.getFullYear()}`;

    return {
      num_semana,
      inicio_iso,
      fin_iso,
      etiqueta,
      es_actual: semana_offset === 0,
    };
  }, [semana_offset]);

  // Descarga directa del PDF oficial de corte usando Puppeteer en el Backend
  const descargarCortePdf = async () => {
    try {
      set_exportando_pdf_corte(true);
      toast.loading("Generando informe oficial de corte en PDF...", {
        id: "corte-pdf-toast",
      });

      const params = new URLSearchParams();
      params.set("fecha_inicio", info_semana.inicio_iso);
      params.set("fecha_fin", info_semana.fin_iso);
      if (filtro_tipo_actividad !== "todas") {
        params.set("tipo", filtro_tipo_actividad);
      }

      const endpoint = `/pdf/corte-asistencia?${params.toString()}`;
      const nombre_archivo = `Corte_Asistencia_Semana_${info_semana.num_semana}_BUMAND.pdf`;

      await descargarPdfConResiliencia(
        endpoint,
        nombre_archivo,
        "corte_asistencia",
        {
          fecha_inicio: info_semana.inicio_iso,
          fecha_fin: info_semana.fin_iso,
          tipo: filtro_tipo_actividad,
        }
      );

      toast.success("Acta oficial de corte descargada en PDF exitosamente", {
        id: "corte-pdf-toast",
        description: `${info_semana.etiqueta} emitido exitosamente.`,
      });
    } catch (err) {
      toast.error("No se pudo generar el PDF de corte.", {
        id: "corte-pdf-toast",
      });
    } finally {
      set_exportando_pdf_corte(false);
    }
  };

  // Filtrado reactivo de incidencias de retraso por actividad, estado de justificación y mentor
  const lista_retrasos_para_rol = useMemo(
    () => filtrarPorMentor(lista_retrasos),
    [lista_retrasos, filtrarPorMentor]
  );

  const becarios_retraso_filtrados = useMemo(() => {
    return lista_retrasos_para_rol.filter((b) => {
      if (b.justificado) return false;
      if (filtro_tipo_actividad === "practicas") return b.tipo_asistencia === "Prácticas";
      if (filtro_tipo_actividad === "escuela_lideres") return b.tipo_asistencia === "Escuela de Líderes";
      if (filtro_tipo_actividad === "acciones_servicio") return b.tipo_asistencia === "Acciones de Servicio";
      return true;
    });
  }, [lista_retrasos_para_rol, filtro_tipo_actividad]);

  // Manejador de justificación y rectificación de retraso
  const manejarRetrasoJustificado = (
    becario_id: number,
    datos: {
      hora_ingreso_nueva?: string;
      motivo_justificacion: string;
      anular_multa: boolean;
    }
  ) => {
    set_lista_retrasos((prev) =>
      prev.map((b) =>
        b.id === becario_id
          ? {
              ...b,
              hora_real: datos.hora_ingreso_nueva || b.hora_real,
              minutos_retraso: datos.anular_multa ? 0 : b.minutos_retraso,
              justificado: true,
              motivo_justificacion: datos.motivo_justificacion,
            }
          : b
      )
    );
  };

  // Manejador de apertura/registro de caso pastoral
  const manejarCasoCreado = (nuevo_caso: CasoPastoralCompleto) => {
    set_casos_pastorales((prev) => [nuevo_caso, ...prev]);
  };

  // Cómputo en tiempo real de horas asignadas en modal de horario
  const horas_semanales_asignadas_calculadas = useMemo(() => {
    let total = 0;
    Object.values(dias_detallados_edit).forEach((d) => {
      if (d.activo) {
        const [h_ini, m_ini] = d.inicio.split(":").map(Number);
        const [h_fin, m_fin] = d.fin.split(":").map(Number);
        const diff_min = (h_fin * 60 + m_fin) - (h_ini * 60 + m_ini);
        if (diff_min > 0) total += diff_min / 60;
      }
    });
    return Math.round(total * 10) / 10;
  }, [dias_detallados_edit]);

  const hay_solapamiento_viernes = useMemo(() => {
    const vie = dias_detallados_edit.viernes;
    if (!vie || !vie.activo) return false;
    const [h_fin, m_fin] = vie.fin.split(":").map(Number);
    return (h_fin * 60 + m_fin) > 14 * 60;
  }, [dias_detallados_edit]);

  // Gestión de Casos Pastorales
  const abrirGestionCaso = (caso: CasoPastoralCompleto) => {
    set_caso_a_gestionar(caso);
    set_dialogo_gestion_caso_abierto(true);
  };

  const actualizarCasoPastoral = (caso_actualizado: CasoPastoralCompleto) => {
    set_casos_pastorales((prev) =>
      prev.map((c) => (c.id === caso_actualizado.id ? caso_actualizado : c))
    );
    // Sincronización en segundo plano con el Backend si aplica
    clienteApi.put(`/evaluaciones/casos-pastorales/${caso_actualizado.id}/gestionar`, {
      plan_accion: caso_actualizado.plan_accion,
      estado: caso_actualizado.estado,
      prioridad: caso_actualizado.prioridad,
      responsable_nombre: caso_actualizado.responsable_nombre,
    }).catch(() => {});
  };

  const casos_pastorales_para_rol = useMemo(
    () => filtrarPorMentor(casos_pastorales),
    [casos_pastorales, filtrarPorMentor]
  );

  const casos_pastorales_filtrados = useMemo(() => {
    return casos_pastorales_para_rol.filter((c) => {
      if (filtro_estado_casos === "todos") return true;
      return c.estado === filtro_estado_casos;
    });
  }, [casos_pastorales_para_rol, filtro_estado_casos]);

  // --- CONTROL DE RANGO DE FECHAS ANALÍTICO ---
  const [tipo_rango, set_tipo_rango] = useState<"este_mes" | "ultimo_trimestre" | "semestre_actual" | "personalizado">("semestre_actual");
  const [fecha_inicio, set_fecha_inicio] = useState<string>("2026-07-01");
  const [fecha_fin, set_fecha_fin] = useState<string>("2026-12-31");
  const [cargando_metricas, set_cargando_metricas] = useState<boolean>(false);
  const [multas_recaudadas, set_multas_recaudadas] = useState<number>(0);
  const [incidencias_multas, set_incidencias_multas] = useState<number>(0);
  const [total_becarios_api, set_total_becarios_api] = useState<number>(0);
  const [evaluaciones_completadas_api, set_evaluaciones_completadas_api] = useState<number>(0);
  const [presupuesto_80_reembolso, set_presupuesto_80_reembolso] = useState<number>(0);
  const [presupuesto_limite, set_presupuesto_limite] = useState<number>(10000);
  const [tendencia_horas_api, set_tendencia_horas_api] = useState<{ mes: string; horas: number }[] | null>(null);
  const [porcentaje_asistencia_api, set_porcentaje_asistencia_api] = useState<number | null>(null);
  const [dias_permiso_compensados, set_dias_permiso_compensados] = useState<number>(0);

  const parsearFechaCadena = (str: string): Date => {
    const partes = str.split("-").map(Number);
    if (partes.length === 3 && !isNaN(partes[0]) && !isNaN(partes[1]) && !isNaN(partes[2])) {
      return new Date(partes[0], partes[1] - 1, partes[2]);
    }
    return new Date();
  };

  const formatearFechaCadena = (d: Date): string => {
    const anio = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
  };

  const consultarEstadisticas = useCallback(async (inicio: string, fin: string) => {
    set_cargando_metricas(true);
    try {
      const respuesta = await clienteApi.get<{
        multas_recaudadas_bs?: number;
        total_multas_bs?: number;
        incidencias_multas?: number;
        total_becarios?: number;
        evaluaciones_completadas?: number;
        porcentaje_puntualidad?: number;
        dias_permiso_aprobado?: number;
        metricas_generales?: { total_becarios_activos?: number };
        presupuesto_80?: { total_reembolso_80?: number; limite_mensual_institucional?: number };
        tendencia_horas?: { mes: string; horas: number }[];
      }>(`/dashboard/estadisticas?fecha_inicio=${inicio}&fecha_fin=${fin}`);

      if (respuesta) {
        const multas_bs =
          typeof respuesta.multas_recaudadas_bs === "number"
            ? respuesta.multas_recaudadas_bs
            : typeof respuesta.total_multas_bs === "number"
              ? respuesta.total_multas_bs
              : 0;
        set_multas_recaudadas(multas_bs);
        set_incidencias_multas(respuesta.incidencias_multas || 0);
        if (typeof respuesta.porcentaje_puntualidad === "number") {
          set_porcentaje_asistencia_api(Math.round(respuesta.porcentaje_puntualidad));
        } else {
          set_porcentaje_asistencia_api(0);
        }
        if (typeof respuesta.dias_permiso_aprobado === "number") {
          set_dias_permiso_compensados(respuesta.dias_permiso_aprobado);
        }
        const total_bec =
          typeof respuesta.total_becarios === "number"
            ? respuesta.total_becarios
            : respuesta.metricas_generales?.total_becarios_activos;
        if (typeof total_bec === "number") {
          set_total_becarios_api(total_bec);
        }
        if (typeof respuesta.evaluaciones_completadas === "number") {
          set_evaluaciones_completadas_api(respuesta.evaluaciones_completadas);
        }
        if (respuesta.presupuesto_80) {
          set_presupuesto_80_reembolso(Number(respuesta.presupuesto_80.total_reembolso_80 || 0));
          if (respuesta.presupuesto_80.limite_mensual_institucional) {
            set_presupuesto_limite(Number(respuesta.presupuesto_80.limite_mensual_institucional));
          }
        }
        if (Array.isArray(respuesta.tendencia_horas)) {
          set_tendencia_horas_api(respuesta.tendencia_horas);
        }
      }
    } catch {
      set_multas_recaudadas(0);
      set_incidencias_multas(0);
      set_porcentaje_asistencia_api(0);
      set_presupuesto_80_reembolso(0);
    } finally {
      set_cargando_metricas(false);
    }
  }, []);

  useEffect(() => {
    consultarEstadisticas(fecha_inicio, fecha_fin);
  }, [fecha_inicio, fecha_fin, consultarEstadisticas]);

  useEffect(() => {
    clienteApi
      .get<CasoPastoralCompleto[]>("/evaluaciones/casos-pastorales")
      .then((res) => {
        if (Array.isArray(res)) {
          set_casos_pastorales(res);
        }
      })
      .catch(() => {});
  }, []);

  const cargarBecariosYSedes = useCallback(async () => {
    try {
      const [res_becarios, res_lugares, res_periodos] = await Promise.all([
        clienteApi.get<any[]>("/api/becarios").catch(() => []),
        clienteApi.get<any[]>("/api/lugares-practica").catch(() => []),
        clienteApi.get<any[]>("/api/evaluaciones/catalogos/periodos").catch(() => []),
      ]);

      if (Array.isArray(res_becarios)) {
        set_becarios_reales(res_becarios);
        set_horarios_lista(res_becarios.map((b, idx) => construirFilaHorarioBecario(b, idx)));
      }

      if (Array.isArray(res_lugares)) {
        set_lugares_practica_lista(
          res_lugares.map((l) => ({
            id: Number(l.id),
            nombre: l.nombre || `Sede #${l.id}`,
            direccion: l.direccion || null,
            activo: l.activo !== false,
          }))
        );
      }

      if (Array.isArray(res_periodos) && res_periodos.length > 0) {
        const mapeados: PeriodoAcademicoItem[] = res_periodos.map((p: any) => {
          const abierto = String(p.estado || "").toLowerCase() === "abierto";
          const fecha_ini = p.fecha_inicio ? new Date(p.fecha_inicio) : new Date();
          const anio = !isNaN(fecha_ini.getTime()) ? fecha_ini.getFullYear() : 2026;
          return {
            id: String(p.id),
            etiqueta: p.nombre || `Periodo #${p.id}`,
            gestion: anio,
            semestre: String(p.nombre || "").includes("II") ? "II" : "I",
            estado: abierto ? "vigente" : "cerrado",
            estado_texto: abierto ? "En Curso / Vigente" : "Cerrado / Auditado",
            total_becarios: Array.isArray(res_becarios) ? res_becarios.length : 0,
            promedio_general: "0.0%",
          };
        });
        set_periodos_lista(mapeados);
        const vigente = mapeados.find((p) => p.estado === "vigente") || mapeados[0];
        if (vigente) {
          set_periodo_academico(vigente.id);
        }
      }
    } catch {
      set_horarios_lista([]);
    }
  }, []);

  useEffect(() => {
    cargarBecariosYSedes();
  }, [cargarBecariosYSedes]);

  useEffect(() => {
    let cancelado = false;
    async function cargarSeguimientoSemanal() {
      try {
        const res = await clienteApi.get<{
          becarios_con_retraso?: Array<{
            becario: { id: number; nombre: string; carrera?: string; unidad?: string | null };
            hora_ingreso: string;
            hora_prevista: string;
            minutos_retraso: number;
            fecha: string;
          }>;
          asistencia_semanal?: {
            asistieron?: Array<{
              becario: { id: number; nombre: string; carrera?: string };
              total_asistencias: number;
            }>;
            no_asistieron?: Array<{
              becario: { id: number; nombre: string; carrera?: string };
              total_asistencias: number;
            }>;
          };
          conteo?: { dias_permiso_aprobado?: number };
        }>(`/dashboard/seguimiento-semanal?fecha=${info_semana.inicio_iso}`);

        if (cancelado || !res) return;

        const retrasos_api = Array.isArray(res.becarios_con_retraso) ? res.becarios_con_retraso : [];
        const retrasos_mapeados: BecarioRetrasoItem[] = retrasos_api.map((r, idx) => ({
          id: r.becario?.id || idx + 1,
          nombre: r.becario?.nombre || `Becario #${idx + 1}`,
          avatar: construirInicialesAvatar(r.becario?.nombre),
          carrera: r.becario?.carrera || "No registrada",
          fecha: r.fecha || info_semana.inicio_iso,
          hora_prevista: String(r.hora_prevista || "08:00").slice(0, 5),
          hora_real: String(r.hora_ingreso || "--:--").slice(0, 5),
          minutos_retraso: Number(r.minutos_retraso || 0),
          sede: r.becario?.unidad || "Oficina Central",
          tipo_asistencia: "Prácticas",
        }));
        set_lista_retrasos(retrasos_mapeados);

        const asistieron = Array.isArray(res.asistencia_semanal?.asistieron)
          ? res.asistencia_semanal!.asistieron
          : [];
        const no_asistieron = Array.isArray(res.asistencia_semanal?.no_asistieron)
          ? res.asistencia_semanal!.no_asistieron
          : [];
        const permisos_sem = Number(res.conteo?.dias_permiso_aprobado || 0);

        if (asistieron.length === 0 && retrasos_api.length === 0 && permisos_sem === 0) {
          set_registros_asistencia_api([]);
        } else {
          const mapa_retraso_min = new Map<number, number>();
          for (const r of retrasos_api) {
            if (r.becario?.id && r.minutos_retraso > 0) {
              mapa_retraso_min.set(r.becario.id, r.minutos_retraso);
            }
          }
          const filas_nomina: RegistroAsistenciaSemanal[] = [
            ...asistieron.map((item) => {
              const fila_h = horarios_lista.find((h) => h.becario_id === item.becario.id);
              return {
                id: item.becario.id,
                nombre: item.becario.nombre,
                avatar: construirInicialesAvatar(item.becario.nombre),
                carrera: item.becario.carrera || "No registrada",
                horario_asignado: resumirHorarioBecario(fila_h),
                asistio: true,
                minutos_retraso: mapa_retraso_min.get(item.becario.id),
                fecha_corte: info_semana.etiqueta,
              };
            }),
            ...no_asistieron.map((item) => {
              const fila_h = horarios_lista.find((h) => h.becario_id === item.becario.id);
              return {
                id: item.becario.id,
                nombre: item.becario.nombre,
                avatar: construirInicialesAvatar(item.becario.nombre),
                carrera: item.becario.carrera || "No registrada",
                horario_asignado: resumirHorarioBecario(fila_h),
                asistio: false,
                fecha_corte: info_semana.etiqueta,
              };
            }),
          ];
          set_registros_asistencia_api(filas_nomina);
        }
      } catch {
        if (!cancelado) {
          set_lista_retrasos([]);
          set_registros_asistencia_api([]);
        }
      }
    }
    cargarSeguimientoSemanal();
    return () => {
      cancelado = true;
    };
  }, [info_semana.inicio_iso, info_semana.etiqueta, horarios_lista]);

  const aplicarRangoRapido = (tipo: "este_mes" | "ultimo_trimestre" | "semestre_actual" | "personalizado") => {
    set_tipo_rango(tipo);
    set_vista_anual(false);
    if (tipo === "este_mes") {
      set_fecha_inicio("2026-10-01");
      set_fecha_fin("2026-10-31");
    } else if (tipo === "ultimo_trimestre") {
      set_fecha_inicio("2026-07-01");
      set_fecha_fin("2026-09-30");
    } else if (tipo === "semestre_actual") {
      set_fecha_inicio("2026-07-01");
      set_fecha_fin("2026-12-31");
    }
  };

  const es_supervisor = esMentorAutenticado(usuario);
  const nombre_usuario = usuario?.nombre || "Mentor";

  const cantidad_becarios_objetivo = es_mentor ? becarios_designados.length : total_becarios_api;
  const meta_mensual_dinamica = cantidad_becarios_objetivo * 36;

  // Cálculo Dinámico y Reactivo de Horas según Filtro de Fechas
  const datos_grafico_horas = useMemo(() => {
    const obtenerHorasMes = (mes_corto: string) => {
      const api_match = tendencia_horas_api?.find((t) =>
        t.mes?.toLowerCase().startsWith(mes_corto.toLowerCase())
      );
      return api_match ? Number(api_match.horas || 0) : 0;
    };

    if (vista_anual) {
      return MESES_ANIO_BASE.map((m) => ({
        mes: m.mes_corto,
        horas: obtenerHorasMes(m.mes_corto),
        meta: meta_mensual_dinamica,
        periodo_nombre: m.mes_nombre,
      }));
    }

    const d_inicio = parsearFechaCadena(fecha_inicio);
    const d_fin = parsearFechaCadena(fecha_fin);
    const diff_dias = Math.max(1, Math.round((d_fin.getTime() - d_inicio.getTime()) / (1000 * 3600 * 24)));

    if (tipo_rango === "este_mes" || diff_dias <= 35) {
      const mes_idx = d_inicio.getMonth();
      const mes_obj = MESES_ANIO_BASE[mes_idx] || MESES_ANIO_BASE[9];
      const horas_mes = obtenerHorasMes(mes_obj.mes_corto);
      const meta_sem = Math.round(meta_mensual_dinamica / 4);
      return mes_obj.semanas.map((etiqueta, idx) => ({
        mes: etiqueta,
        horas: idx === 0 ? horas_mes : 0,
        meta: meta_sem,
        periodo_nombre: `${mes_obj.mes_nombre} · ${etiqueta}`,
      }));
    }

    const anio_inicio = d_inicio.getFullYear();
    const anio_fin = d_fin.getFullYear();
    const mes_inicio = d_inicio.getMonth() + 1;
    const mes_fin = d_fin.getMonth() + 1;

    let meses_seleccionados: MesHorasDetalle[] = [];
    if (anio_inicio === anio_fin) {
      meses_seleccionados = MESES_ANIO_BASE.filter(
        (m) => m.mes_num >= mes_inicio && m.mes_num <= mes_fin
      );
    } else {
      meses_seleccionados = MESES_ANIO_BASE.filter((m) => m.mes_num >= mes_inicio);
    }

    if (meses_seleccionados.length === 0) {
      meses_seleccionados = MESES_ANIO_BASE.slice(6, 12);
    }

    return meses_seleccionados.map((m) => ({
      mes: m.mes_corto,
      horas: obtenerHorasMes(m.mes_corto),
      meta: meta_mensual_dinamica,
      periodo_nombre: m.mes_nombre,
    }));
  }, [fecha_inicio, fecha_fin, vista_anual, tipo_rango, tendencia_horas_api, meta_mensual_dinamica]);

  const total_horas_periodo = useMemo(
    () => datos_grafico_horas.reduce((acc, curr) => acc + curr.horas, 0),
    [datos_grafico_horas]
  );
  const total_meta_periodo = useMemo(
    () => datos_grafico_horas.reduce((acc, curr) => acc + curr.meta, 0),
    [datos_grafico_horas]
  );
  const pct_cumplimiento_periodo = useMemo(
    () => (total_meta_periodo > 0 && total_horas_periodo > 0 ? Math.round((total_horas_periodo / total_meta_periodo) * 100) : 0),
    [total_horas_periodo, total_meta_periodo]
  );

  const registros_asistencia_para_rol = useMemo(
    () => filtrarPorMentor(registros_asistencia_api),
    [registros_asistencia_api, filtrarPorMentor]
  );

  const horarios_para_rol = useMemo(
    () => filtrarPorMentor(horarios_lista),
    [horarios_lista, filtrarPorMentor]
  );

  // Conteos dinámicos de asistencia semanal con compensación al 100% por permisos aprobados
  const total_registros = registros_asistencia_para_rol.length;
  const total_asistieron = registros_asistencia_para_rol.filter((r) => r.asistio).length;
  const total_no_asistieron = registros_asistencia_para_rol.filter((r) => !r.asistio).length;
  const permisos_justificados_locales = lista_retrasos_para_rol.filter((r) => r.justificado).length;
  const total_permisos_compensados = Math.max(dias_permiso_compensados, permisos_justificados_locales);
  const porcentaje_asistencia_semanal =
    porcentaje_asistencia_api !== null
      ? Math.min(100, porcentaje_asistencia_api)
      : total_registros > 0
      ? Math.min(
          100,
          Math.round(((total_asistieron + total_permisos_compensados) / total_registros) * 100)
        )
      : 0;

  const registros_filtrados = registros_asistencia_para_rol.filter((r) => {
    if (filtro_asistencia === "asistieron") return r.asistio;
    if (filtro_asistencia === "no_asistieron") return !r.asistio;
    return true;
  });

  const horarios_filtrados = horarios_para_rol.filter((fila) => {
    const coincide_busqueda =
      busqueda_horario.trim() === "" ||
      fila.nombre.toLowerCase().includes(busqueda_horario.toLowerCase()) ||
      fila.ci.toLowerCase().includes(busqueda_horario.toLowerCase());
    if (!coincide_busqueda) return false;

    if (filtro_dia_horario === "lunes") return fila.lunes !== "—";
    if (filtro_dia_horario === "martes") return fila.martes !== "—";
    if (filtro_dia_horario === "miercoles") return fila.miercoles !== "—";
    if (filtro_dia_horario === "jueves") return fila.jueves !== "—";
    if (filtro_dia_horario === "viernes") return fila.viernes !== "—";
    return true;
  });

  const distribucion_universidades = useMemo(() => {
    const conteo = new Map<string, number>();
    for (const b of becarios_reales) {
      const uni = (b.universidad || "Sin especificar").trim();
      conteo.set(uni, (conteo.get(uni) || 0) + 1);
    }
    const entries = Array.from(conteo.entries()).sort((a, b) => b[1] - a[1]);
    const max_cant = entries[0]?.[1] || 1;
    return entries.map(([nombre, cantidad], idx) => ({
      nombre,
      cantidad,
      porcentaje: Math.round((cantidad / max_cant) * 100),
      color: COLORES_DISTRIBUCION[idx % COLORES_DISTRIBUCION.length],
    }));
  }, [becarios_reales]);

  const distribucion_modalidades = useMemo(() => {
    const conteo = new Map<string, number>();
    for (const b of becarios_reales) {
      const mod = (b.modalidad_carrera || "No especificada").trim();
      conteo.set(mod, (conteo.get(mod) || 0) + 1);
    }
    const entries = Array.from(conteo.entries()).sort((a, b) => b[1] - a[1]);
    const max_cant = entries[0]?.[1] || 1;
    return entries.map(([modalidad, cantidad], idx) => ({
      modalidad,
      cantidad,
      porcentaje: Math.round((cantidad / max_cant) * 100),
      color: COLORES_DISTRIBUCION[idx % COLORES_DISTRIBUCION.length],
    }));
  }, [becarios_reales]);

  const despliegue_agencias = useMemo(() => {
    if (lugares_practica_lista.length === 0) return [];
    return lugares_practica_lista.map((lugar) => {
      const asignados = becarios_reales.filter(
        (b) => Number(b.lugar_practica_id || b.lugar_practica?.id || 0) === lugar.id
      ).length;
      return {
        id: lugar.id,
        agencia: lugar.nombre,
        ciudad: lugar.direccion?.toLowerCase().includes("la paz") ? "La Paz" : "El Alto",
        becarios: asignados,
        horas_mes: total_horas_periodo,
        porcentaje_cumplimiento: pct_cumplimiento_periodo,
      };
    });
  }, [lugares_practica_lista, becarios_reales, total_horas_periodo, pct_cumplimiento_periodo]);

  const abrirEditorHorario = (becario: FilaHorarioApoyo) => {
    set_becario_a_editar(becario);

    const parsearRangoDia = (str?: string) => {
      if (!str || str === "—" || str === "-") {
        return { activo: false, inicio: "08:00", fin: "12:00" };
      }
      const partes = str.split("-");
      if (partes.length === 2 && partes[0].trim() && partes[1].trim()) {
        return { activo: true, inicio: partes[0].trim(), fin: partes[1].trim() };
      }
      return { activo: true, inicio: "08:00", fin: "12:00" };
    };

    set_dias_detallados_edit({
      lunes: parsearRangoDia(becario.lunes),
      martes: parsearRangoDia(becario.martes),
      miercoles: parsearRangoDia(becario.miercoles),
      jueves: parsearRangoDia(becario.jueves),
      viernes: parsearRangoDia(becario.viernes),
    });

    const sede_actual =
      becario.sede_nombre ||
      lugares_practica_lista.find((l) => l.id === becario.lugar_practica_id)?.nombre ||
      lugares_practica_lista[0]?.nombre ||
      "Oficina Central Diaconía IFD - El Alto";
    set_sede_edit(sede_actual);

    set_materias_declaradas_edit(
      becario.periodo && becario.periodo !== "—"
        ? `Régimen ${becario.periodo} · Horario institucional asignado`
        : "Horario institucional de prácticas preprofesionales"
    );

    set_dialogo_edicion_abierto(true);
  };

  const guardarEdicionHorario = async () => {
    if (!becario_a_editar) return;

    const formatearDia = (d: { activo: boolean; inicio: string; fin: string }) =>
      d.activo ? `${d.inicio}-${d.fin}` : "—";

    const dias_payload = [
      { dia_semana: 1, ...dias_detallados_edit.lunes },
      { dia_semana: 2, ...dias_detallados_edit.martes },
      { dia_semana: 3, ...dias_detallados_edit.miercoles },
      { dia_semana: 4, ...dias_detallados_edit.jueves },
      { dia_semana: 5, ...dias_detallados_edit.viernes },
    ]
      .filter((d) => d.activo)
      .map((d) => ({
        dia_semana: d.dia_semana,
        hora_inicio: d.inicio,
        hora_fin: d.fin,
        horas_diarias: 4.0,
      }));

    const lugar_seleccionado = lugares_practica_lista.find((l) => l.nombre === sede_edit);

    try {
      await clienteApi.put(`/becarios/${becario_a_editar.becario_id}/horarios`, {
        lugar_practica_id: lugar_seleccionado?.id,
        dias: dias_payload,
      });

      set_horarios_lista((prev) =>
        prev.map((item) =>
          item.becario_id === becario_a_editar.becario_id
            ? {
                ...item,
                lugar_practica_id: lugar_seleccionado?.id ?? item.lugar_practica_id,
                sede_nombre: sede_edit,
                lunes: formatearDia(dias_detallados_edit.lunes),
                martes: formatearDia(dias_detallados_edit.martes),
                miercoles: formatearDia(dias_detallados_edit.miercoles),
                jueves: formatearDia(dias_detallados_edit.jueves),
                viernes: formatearDia(dias_detallados_edit.viernes),
              }
            : item
        )
      );

      toast.success(`Horario de apoyo actualizado exitosamente para ${becario_a_editar.nombre}.`, {
        description: `${horas_semanales_asignadas_calculadas} hrs/semana programadas en ${sede_edit}.`,
      });
      set_dialogo_edicion_abierto(false);
    } catch {
      toast.error("No se pudo guardar el horario en la base de datos.");
    }
  };

  const obtenerDatosKardex = (): FilaKardex[] => {
    return [];
  };

  const periodo_seleccionado_obj: PeriodoAcademicoItem =
    periodos_lista.find((p) => p.id === periodo_academico) ||
    periodos_lista[0] || {
      id: "actual",
      etiqueta: "Periodo Vigente",
      gestion: 2026,
      semestre: "II",
      estado: "vigente",
      estado_texto: "En Curso / Vigente",
      total_becarios: cantidad_becarios_objetivo,
      promedio_general: "0.0%",
    };
  const es_periodo_historico = periodo_seleccionado_obj.estado !== "vigente";

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* NAVEGACIÓN SUPERIOR POR TABS TEMÁTICOS (ANCHO COMPLETO)       */}
      {/* ============================================================== */}
      <Tabs
        value={pestaña_dashboard}
        onValueChange={(val) => set_pestaña_dashboard(val as any)}
        className="w-full space-y-6"
      >
        {/* Barra de Tabs ocupando el 100% del ancho con Grid Responsivo */}
        <TabsList className="w-full grid grid-cols-2 lg:grid-cols-4 p-1.5 bg-slate-100/90 border border-[#E5E7EB] rounded-2xl shadow-xs gap-2 group-data-horizontal/tabs:h-auto h-auto">
          <TabsTrigger
            value="resumen"
            className="w-full h-11 py-2.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer text-[#035683] hover:text-[#035683] hover:bg-white/90 data-active:bg-[#007BBE] data-active:text-white data-active:hover:bg-[#007BBE] data-active:hover:text-white data-active:shadow-xs flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-4 h-4 text-[#00ABBD]" />
            <span>Resumen Ejecutivo</span>
          </TabsTrigger>
          <TabsTrigger
            value="seguimiento"
            className="w-full h-11 py-2.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer text-[#035683] hover:text-[#035683] hover:bg-white/90 data-active:bg-[#007BBE] data-active:text-white data-active:hover:bg-[#007BBE] data-active:hover:text-white data-active:shadow-xs flex items-center justify-center gap-2"
          >
            <Clock className="w-4 h-4 text-[#00ABBD]" />
            <span>Seguimiento Semanal</span>
            <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-md font-mono font-bold">
              {lista_retrasos_para_rol.filter((r) => !r.justificado).length} retrasos
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="horarios"
            className="w-full h-11 py-2.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer text-[#035683] hover:text-[#035683] hover:bg-white/90 data-active:bg-[#007BBE] data-active:text-white data-active:hover:bg-[#007BBE] data-active:hover:text-white data-active:shadow-xs flex items-center justify-center gap-2"
          >
            <CalendarDays className="w-4 h-4 text-[#00ABBD]" />
            <span>Matriz de Horarios</span>
            <span className="bg-slate-200 text-[#035683] text-[10px] px-2 py-0.5 rounded-md font-mono font-bold">
              {horarios_para_rol.length} becarios
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="analitica"
            className="w-full h-11 py-2.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer text-[#035683] hover:text-[#035683] hover:bg-white/90 data-active:bg-[#007BBE] data-active:text-white data-active:hover:bg-[#007BBE] data-active:hover:text-white data-active:shadow-xs flex items-center justify-center gap-2"
          >
            <GraduationCap className="w-4 h-4 text-[#00ABBD]" />
            <span>Kardex y Pastoral</span>
            <span className="bg-[#00ABBD]/15 text-[#00808E] text-[10px] px-2 py-0.5 rounded-md font-mono font-bold">
              {casos_pastorales_para_rol.length} casos
            </span>
          </TabsTrigger>
        </TabsList>

        {/* ============================================================== */}
        {/* TAB 1: RESUMEN EJECUTIVO (KPIS, SPOTLIGHT, GRÁFICOS Y ACCESOS) */}
        {/* ============================================================== */}
        <TabsContent value="resumen" className="space-y-6">
          {es_mentor && (
            <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-[#E5E7EB]">
              <span className="text-xs font-semibold text-[#035683]">
                Vista de Mentoría — Datos filtrados para {nombre_usuario}
              </span>
              <InsigniaBecariosDesignados cantidad={becarios_designados.length} />
            </div>
          )}
          {/* Tarjetas de Métricas Ejecutivas Superiores */}
          <ContenedorEscalonado className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Métrica 1: Becarios */}
            <ElementoEscalonado>
              <Card className="h-full bg-white border border-[#E5E7EB] shadow-xs relative overflow-hidden py-0 gap-0">
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#FFB600]/20 rounded-bl-full pointer-events-none" />
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase font-mono">
                        {es_mentor ? "Becarios Designados" : "Becarios Activos"}
                      </p>
                      <p className="text-3xl font-display font-bold text-[#035683]">
                        <ContadorAnimado valor={es_mentor ? becarios_designados.length : total_becarios_api} />
                      </p>
                    </div>
                    <div className="p-2.5 bg-[#035683]/5 rounded-xl">
                      <Users className="w-5 h-5 text-[#035683]" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center text-xs">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                    <span className="text-emerald-600 font-bold">
                      {cantidad_becarios_objetivo > 0 ? "100% matriculados" : "Sin registros"}
                    </span>
                    <span className="text-muted-foreground ml-1">gestión 2026</span>
                  </div>
                  <Progress value={cantidad_becarios_objetivo > 0 ? 100 : 0} className="h-1.5 mt-2 bg-slate-100" />
                </CardContent>
              </Card>
            </ElementoEscalonado>

            {/* Métrica 2: Puntualidad y Retrasos */}
            <ElementoEscalonado>
              <Card className="h-full bg-white border border-[#E5E7EB] shadow-xs relative overflow-hidden py-0 gap-0">
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#00ABBD]/20 rounded-bl-full pointer-events-none" />
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase font-mono">
                        Asistencia Semanal
                      </p>
                      <p className="text-3xl font-display font-bold text-[#035683]">
                        <ContadorAnimado valor={porcentaje_asistencia_semanal} sufijo="%" />
                      </p>
                    </div>
                    <div className="p-2.5 bg-[#00ABBD]/10 rounded-xl">
                      <Clock className="w-5 h-5 text-[#00ABBD]" />
                    </div>
                  </div>
                  <div className="mt-3 flex flex-col gap-0.5 text-xs">
                    <div className="flex items-center">
                      <span className="text-amber-600 font-bold">
                        {becarios_retraso_filtrados.length} con retraso
                      </span>
                      <span className="text-muted-foreground ml-1">esta semana</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold">
                      {total_permisos_compensados > 0
                        ? `${total_permisos_compensados} permiso(s) aprobados compensados`
                        : "Sin marcaciones ni retrasos registrados"}
                    </span>
                  </div>
                  <Progress value={porcentaje_asistencia_semanal} className="h-1.5 mt-2 bg-slate-100" />
                </CardContent>
              </Card>
            </ElementoEscalonado>

            {/* Métrica 3: Evaluaciones y Kardex */}
            <ElementoEscalonado>
              <Card className="h-full bg-white border border-[#E5E7EB] shadow-xs relative overflow-hidden py-0 gap-0">
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#E2694B]/20 rounded-bl-full pointer-events-none" />
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase font-mono">
                        Matriz de Evaluación
                      </p>
                      <p className="text-3xl font-display font-bold text-[#035683]">
                        {evaluaciones_completadas_api} / {es_mentor ? becarios_designados.length : total_becarios_api}
                      </p>
                    </div>
                    <div className="p-2.5 bg-[#E2694B]/10 rounded-xl">
                      <FileCheck className="w-5 h-5 text-[#E2694B]" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center text-xs text-amber-700">
                    <AlertCircle className="w-3.5 h-3.5 mr-1" />
                    <span>Semestre II · Habilitado</span>
                  </div>
                  <Progress
                    value={
                      total_becarios_api > 0
                        ? Math.min(100, Math.round((evaluaciones_completadas_api / total_becarios_api) * 100))
                        : 0
                    }
                    className="h-1.5 mt-2 bg-slate-100"
                  />
                </CardContent>
              </Card>
            </ElementoEscalonado>

            {/* Métrica 4: Presupuesto 80% */}
            <ElementoEscalonado>
              <Card className="h-full bg-[#035683] text-white border border-[#035683] rounded-2xl shadow-xs relative overflow-hidden py-0 gap-0">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full pointer-events-none" />
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-[#00ABBD] uppercase font-mono">
                        Presupuesto 80% Pasajes
                      </p>
                      <p className="text-3xl font-poppins font-bold text-[#FFB600]">
                        <ContadorAnimado valor={presupuesto_80_reembolso} prefijo="Bs " />
                      </p>
                    </div>
                    <div className="p-2.5 bg-white/10 rounded-xl">
                      <DollarSign className="w-5 h-5 text-[#FFB600]" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center text-xs text-white/80">
                    <span>
                      Bs {presupuesto_limite.toLocaleString("es-BO", { minimumFractionDigits: 2 })} límite institucional
                    </span>
                  </div>
                  <Progress
                    value={
                      presupuesto_limite > 0
                        ? Math.min(100, (presupuesto_80_reembolso / presupuesto_limite) * 100)
                        : 0
                    }
                    className="h-1.5 mt-2 bg-white/20 [&>div]:bg-[#00ABBD]"
                  />
                </CardContent>
              </Card>
            </ElementoEscalonado>

            {/* Métrica 5: Tarjeta KPI Spotlight para Multas Institucionales Recaudadas */}
            <ElementoEscalonado className="col-span-1 md:col-span-2 lg:col-span-4">
              <TarjetaSpotlight
                color_luz="rgba(255, 182, 0, 0.25)"
                className="bg-gradient-to-r from-[#007BBE] via-[#02699e] to-[#035683] text-white border border-[#00ABBD]/30 shadow-md p-5 rounded-2xl relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#FFB600] text-[#035683] font-bold text-xs uppercase px-2.5 py-0.5 shadow-xs rounded-full">
                        KPI Spotlight · Reglamento BUMAND
                      </Badge>
                      <span className="text-xs text-[#00ABBD] font-mono">
                        Período: {fecha_inicio} al {fecha_fin}
                      </span>
                    </div>
                    <h4 className="text-lg font-display font-bold text-white flex items-center gap-2">
                      <Coins className="w-5 h-5 text-[#FFB600]" />
                      Multas Institucionales Recaudadas (Escuela de Líderes)
                    </h4>
                    <p className="text-xs text-white/80 max-w-2xl leading-relaxed">
                      Recaudación acumulada por infracciones reglamentarias y retrasos no justificados en el período seleccionado.
                      Los fondos se reinvierten íntegramente en las raciones de refrigerios y actividades de confraternización diaconal.
                    </p>
                  </div>

                  <div className="flex items-center gap-6 bg-white/10 p-4 px-6 rounded-2xl backdrop-blur-sm border border-white/15 shrink-0">
                    <div>
                      <p className="text-[11px] uppercase font-mono text-[#00ABBD] font-bold">Total Recaudado</p>
                      <p className="text-3xl font-poppins font-bold text-[#FFB600]">
                        Bs {multas_recaudadas.toFixed(2)}
                      </p>
                    </div>
                    <div className="h-10 w-px bg-white/20" />
                    <div>
                      <p className="text-[11px] uppercase font-mono text-white/80 font-bold">Incidencias</p>
                      <p className="text-2xl font-poppins font-bold text-white">
                        {incidencias_multas} <span className="text-xs font-normal text-white/80">casos</span>
                      </p>
                    </div>
                  </div>
                </div>
              </TarjetaSpotlight>
            </ElementoEscalonado>
          </ContenedorEscalonado>

          {/* Tendencia de Horas y Ejecución Presupuestaria Integradas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-[#E5E7EB] shadow-sm bg-white rounded-xl lg:col-span-2 flex flex-col">
              <CardHeader className="pb-3 border-b border-[#E5E7EB]/60">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="font-display text-base text-[#035683] flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-[#00ABBD]" />
                      Tendencia de Horas de Práctica y Cumplimiento
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                      <span>Horas efectivas registradas con geolocalización frente a la meta académica programada.</span>
                      <span className="font-mono font-bold text-[#035683] bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                        Total: {total_horas_periodo.toLocaleString()} hrs ({pct_cumplimiento_periodo}% cumplimiento)
                      </span>
                    </CardDescription>
                  </div>

                  {/* Filtro de Fechas y Rango Temporal integrado en el Gráfico */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-[#E5E7EB]/60">
                      <button
                        type="button"
                        onClick={() => aplicarRangoRapido("este_mes")}
                        className={`px-2 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                          tipo_rango === "este_mes"
                            ? "bg-[#035683] text-white shadow-xs"
                            : "text-[#5B6D77] hover:text-[#035683]"
                        }`}
                      >
                        Mes
                      </button>
                      <button
                        type="button"
                        onClick={() => aplicarRangoRapido("ultimo_trimestre")}
                        className={`px-2 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                          tipo_rango === "ultimo_trimestre"
                            ? "bg-[#035683] text-white shadow-xs"
                            : "text-[#5B6D77] hover:text-[#035683]"
                        }`}
                      >
                        Trimestre
                      </button>
                      <button
                        type="button"
                        onClick={() => aplicarRangoRapido("semestre_actual")}
                        className={`px-2 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                          tipo_rango === "semestre_actual"
                            ? "bg-[#035683] text-white shadow-xs"
                            : "text-[#5B6D77] hover:text-[#035683]"
                        }`}
                      >
                        Semestre
                      </button>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-50 p-0.5 rounded-lg border border-[#E5E7EB]">
                      <SeleccionadorFecha
                        fecha={parsearFechaCadena(fecha_inicio)}
                        alCambiar={(d) => {
                          if (d) {
                            set_vista_anual(false);
                            set_tipo_rango("personalizado");
                            set_fecha_inicio(formatearFechaCadena(d));
                          }
                        }}
                        formato="dd/MM/yyyy"
                        etiqueta_boton="Desde"
                        className="h-7 w-28 text-[11px] font-mono border-0 bg-transparent shadow-none"
                      />
                      <span className="text-[10px] text-muted-foreground font-bold">a</span>
                      <SeleccionadorFecha
                        fecha={parsearFechaCadena(fecha_fin)}
                        alCambiar={(d) => {
                          if (d) {
                            set_vista_anual(false);
                            set_tipo_rango("personalizado");
                            set_fecha_fin(formatearFechaCadena(d));
                          }
                        }}
                        formato="dd/MM/yyyy"
                        etiqueta_boton="Hasta"
                        className="h-7 w-28 text-[11px] font-mono border-0 bg-transparent shadow-none"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 pl-1.5 border-l border-[#E5E7EB] text-[11px]">
                      <span className={`font-mono text-[11px] ${!vista_anual ? "font-bold text-[#035683]" : "text-muted-foreground"}`}>
                        Semestral
                      </span>
                      <Switch
                        checked={vista_anual}
                        onCheckedChange={(checked) => {
                          set_vista_anual(checked);
                          if (checked) {
                            set_tipo_rango("personalizado");
                            set_fecha_inicio("2026-01-01");
                            set_fecha_fin("2026-12-31");
                          } else {
                            aplicarRangoRapido("semestre_actual");
                          }
                        }}
                        className="data-[state=checked]:bg-[#00ABBD] scale-75 cursor-pointer"
                      />
                      <span className={`font-mono text-[11px] ${vista_anual ? "font-bold text-[#035683]" : "text-muted-foreground"}`}>
                        Anual
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 flex-1 min-h-[300px]">
                <ChartContainer config={CONFIGURACION_GRAFICO} className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={datos_grafico_horas} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="degradadoHorasVista" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00ABBD" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#00ABBD" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
                      <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="horas"
                        name="Horas Reales"
                        stroke="#00ABBD"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#degradadoHorasVista)"
                      />
                      <Area
                        type="monotone"
                        dataKey="meta"
                        name="Meta Planificada"
                        stroke="#035683"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        fillOpacity={0}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* DISTRIBUCIÓN OPERATIVA EN SEDES DE DIACONÍA IFD */}
            <Card className="border-[#E5E7EB] shadow-sm bg-white rounded-xl flex flex-col overflow-hidden">
              <CardHeader className="py-3 px-4 border-b border-[#E5E7EB]/60 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <CardTitle className="font-display text-sm text-[#035683] flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#00ABBD]" />
                      Despliegue Operativo en Agencias
                    </CardTitle>
                    <CardDescription className="text-[11px] text-muted-foreground">
                      {despliegue_agencias.length > 0
                        ? "Sedes activas registradas en base de datos"
                        : "Sin sedes registradas en sistema"}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px] bg-[#00ABBD]/10 text-[#035683] border-[#00ABBD]/40 shrink-0">
                    {despliegue_agencias.length} {despliegue_agencias.length === 1 ? "Sede Activa" : "Sedes Activas"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                {/* Métricas consolidadas de la red */}
                <div className="grid grid-cols-3 gap-2 p-2 bg-slate-50 rounded-lg border border-[#E5E7EB]/70 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-muted-foreground block">Becarios</span>
                    <span className="font-bold text-sm text-[#035683] font-mono">{cantidad_becarios_objetivo}</span>
                  </div>
                  <div className="border-x border-[#E5E7EB]/70">
                    <span className="text-[10px] uppercase font-mono text-muted-foreground block">Horas / Mes</span>
                    <span className="font-bold text-sm text-[#00ABBD] font-mono">{total_horas_periodo}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-muted-foreground block">Cumplimiento</span>
                    <span className="font-bold text-sm text-emerald-700 font-mono">{pct_cumplimiento_periodo}%</span>
                  </div>
                </div>

                {/* Desglose por Agencia con barras de progreso */}
                <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
                  {despliegue_agencias.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Sin sedes activas cargadas desde la base de datos.
                    </p>
                  ) : (
                    despliegue_agencias.map((item) => (
                      <div key={item.id} className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 truncate pr-2">
                            <span className="font-medium text-[#1E293B] truncate">{item.agencia}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-xs bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                              {item.ciudad}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                            <span className="text-muted-foreground">{item.becarios} bec.</span>
                            <span className="font-bold text-[#035683]">{item.horas_mes}h</span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500 bg-[#00ABBD]"
                            style={{ width: `${item.porcentaje_cumplimiento}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Resumen Regional Inferior */}
                <div className="pt-2 border-t border-[#E5E7EB]/60 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                  <span>
                    {despliegue_agencias.length > 0
                      ? `Cobertura: ${despliegue_agencias[0].agencia}`
                      : "Sin cobertura registrada"}
                  </span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {pct_cumplimiento_periodo}% Cumplimiento
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ============================================================== */}
        {/* TAB 2: SEGUIMIENTO SEMANAL CON DOS TABS INTERNOS DE AUDITORÍA */}
        {/* ============================================================== */}
        <TabsContent value="seguimiento" className="space-y-4">
          <Card className="border-[#E5E7EB] shadow-sm bg-white rounded-2xl overflow-hidden">
            {/* Cabecera unificada con dos tabs internos para filtrar correctamente */}
            <CardHeader className="pb-3 border-b border-[#E5E7EB]/60 bg-gradient-to-r from-slate-50 via-white to-slate-50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Selector de los dos tabs internos */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-[#E5E7EB]/70">
                  <button
                    type="button"
                    onClick={() => set_subpestaña_seguimiento("retrasos")}
                    className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      subpestaña_seguimiento === "retrasos"
                        ? "bg-[#035683] text-white shadow-xs"
                        : "text-[#5B6D77] hover:text-[#035683] hover:bg-white/60"
                    }`}
                  >
                    <AlertTriangle className={`w-3.5 h-3.5 ${subpestaña_seguimiento === "retrasos" ? "text-amber-300" : "text-amber-500"}`} />
                    <span>Auditoría de Retrasos</span>
                    <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-md font-mono font-bold">
                      {lista_retrasos_para_rol.filter((r) => !r.justificado).length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => set_subpestaña_seguimiento("asistencia")}
                    className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      subpestaña_seguimiento === "asistencia"
                        ? "bg-[#035683] text-white shadow-xs"
                        : "text-[#5B6D77] hover:text-[#035683] hover:bg-white/60"
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${subpestaña_seguimiento === "asistencia" ? "text-[#00ABBD]" : "text-emerald-600"}`} />
                    <span>Nómina General de Asistencia</span>
                    <span className="bg-slate-200 text-[#035683] text-[10px] px-1.5 py-0.2 rounded-md font-mono font-bold">
                      {total_registros}
                    </span>
                  </button>
                </div>

                {/* Navegación temporal de corte y acción oficial de exportación PDF Puppeteer */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-[#E5E7EB]/60">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => set_semana_offset((prev) => prev - 1)}
                      className="h-7 w-7 p-0 text-[#035683] hover:bg-white"
                      title="Semana anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Badge variant="outline" className="border-[#00ABBD]/50 bg-white text-[#035683] font-mono text-[11px] px-2.5 py-1 font-bold">
                      {info_semana.etiqueta}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => set_semana_offset((prev) => prev + 1)}
                      className="h-7 w-7 p-0 text-[#035683] hover:bg-white"
                      title="Semana posterior"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  {!info_semana.es_actual && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => set_semana_offset(0)}
                      className="h-8 px-2 text-[10px] text-[#00808E] hover:bg-slate-50 font-bold"
                    >
                      Semana Actual
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={descargarCortePdf}
                    disabled={exportando_pdf_corte}
                    className="h-8 text-xs border-[#035683] bg-white text-[#035683] hover:bg-[#035683] hover:text-white gap-2 font-bold cursor-pointer shadow-2xs transition-all"
                  >
                    {exportando_pdf_corte ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00ABBD]" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-[#00ABBD]" />
                    )}
                    <span>{exportando_pdf_corte ? "Generando PDF..." : "Exportar Corte"}</span>
                  </Button>
                </div>
              </div>

              {/* Barra de Filtros Canónicos por Tipo de Actividad Institucional */}
              <div className="pt-2 flex flex-wrap items-center gap-1.5 border-t border-[#E5E7EB]/50">
                <span className="text-[11px] font-bold text-[#5B6D77] font-mono mr-1">Actividad:</span>
                {[
                  { key: "todas", etiqueta: "Todas las Actividades", icono: "🌐" },
                  { key: "practicas", etiqueta: "Prácticas Institucionales", icono: "🏢" },
                  { key: "escuela_lideres", etiqueta: "Escuela de Líderes (Viernes)", icono: "📖" },
                  { key: "acciones_servicio", etiqueta: "Acciones de Servicio", icono: "🤝" },
                ].map((act) => (
                  <button
                    key={act.key}
                    type="button"
                    onClick={() => set_filtro_tipo_actividad(act.key as any)}
                    className={`text-xs py-1 px-3 rounded-lg border font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      filtro_tipo_actividad === act.key
                        ? "bg-[#035683] text-white border-[#035683] font-bold shadow-xs"
                        : "bg-white text-slate-600 border-[#E5E7EB] hover:bg-slate-50"
                    }`}
                  >
                    <span>{act.icono}</span>
                    <span>{act.etiqueta}</span>
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {subpestaña_seguimiento === "retrasos" ? (
                /* VISTA INTERNA 1: AUDITORÍA DE RETRASOS E INCIDENCIAS */
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-2">
                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-mono font-bold uppercase text-amber-800">Incidencias de Retraso</p>
                        <p className="text-xl font-display font-bold text-[#035683]">{becarios_retraso_filtrados.length} becarios</p>
                      </div>
                      <AlertTriangle className="w-6 h-6 text-amber-500 opacity-80" />
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-[#E5E7EB] flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-mono font-bold uppercase text-[#5B6D77]">Promedio de Demora</p>
                        <p className="text-xl font-display font-bold text-[#035683]">
                          {becarios_retraso_filtrados.length > 0
                            ? (becarios_retraso_filtrados.reduce((acc, b) => acc + b.minutos_retraso, 0) / becarios_retraso_filtrados.length).toFixed(0)
                            : 0} min
                        </p>
                      </div>
                      <Clock className="w-6 h-6 text-[#00ABBD] opacity-80" />
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-mono font-bold uppercase text-emerald-800">Puntuales ({info_semana.etiqueta.split("·")[0].trim()})</p>
                        <p className="text-xl font-display font-bold text-emerald-800">
                          {Math.max(0, total_asistieron - becarios_retraso_filtrados.length)} becarios (
                          {total_asistieron > 0
                            ? (((total_asistieron - becarios_retraso_filtrados.length) / total_asistieron) * 100).toFixed(1)
                            : "0.0"}%)
                        </p>
                      </div>
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 opacity-80" />
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB] text-[#035683] font-mono text-[11px] uppercase tracking-wider">
                          <th className="py-2.5 px-3">Becario</th>
                          <th className="py-2.5 px-3">Carrera y Sede</th>
                          <th className="py-2.5 px-3">Actividad</th>
                          <th className="py-2.5 px-3 text-center">Fecha</th>
                          <th className="py-2.5 px-3 text-center font-mono">Previsto vs Real</th>
                          <th className="py-2.5 px-3 text-center">Retraso</th>
                          <th className="py-2.5 px-3 text-center">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E7EB]/60">
                        {becarios_retraso_filtrados.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-muted-foreground">
                              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1 opacity-70" />
                              <p className="font-semibold text-xs text-[#035683]">Sin incidencias de retraso</p>
                              <p className="text-[11px]">Todos los becarios registrados cumplieron puntualidad en {filtro_tipo_actividad === 'todas' ? 'todas las actividades' : filtro_tipo_actividad}.</p>
                            </td>
                          </tr>
                        ) : (
                          becarios_retraso_filtrados.map((b) => (
                          <tr key={b.id} className="hover:bg-amber-50/30 transition-colors">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2.5">
                                <Avatar className="w-8 h-8 border border-[#E5E7EB]">
                                  <AvatarFallback className="bg-[#035683] text-[#FFB600] font-bold text-xs">
                                    {b.avatar}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-bold text-[#035683]">{b.nombre}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-muted-foreground">
                              {b.carrera} · <strong className="text-[#035683]">{b.sede}</strong>
                            </td>
                            <td className="py-3 px-3">
                              <Badge
                                variant="outline"
                                className={
                                  b.tipo_asistencia === "Prácticas"
                                    ? "bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-semibold"
                                    : "bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-semibold"
                                }
                              >
                                {b.tipo_asistencia}
                              </Badge>
                            </td>
                            <td className="py-3 px-3 text-center font-mono text-muted-foreground">{b.fecha}</td>
                            <td className="py-3 px-3 text-center font-mono">
                              <span className="text-muted-foreground">{b.hora_prevista}</span>
                              <span className="mx-1.5 text-muted-foreground/60">→</span>
                              <span className="font-bold text-amber-700">{b.hora_real}</span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-mono font-bold text-[10px]">
                                +{b.minutos_retraso} min
                              </Badge>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  set_becario_a_justificar(b);
                                  set_dialogo_justificar_abierto(true);
                                }}
                                className="h-7 px-2 text-[11px] text-[#035683] hover:bg-[#00ABBD]/15 hover:text-[#035683] font-bold cursor-pointer"
                              >
                                Justificar
                              </Button>
                            </td>
                          </tr>
                        )))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* VISTA INTERNA 2: NÓMINA GENERAL DE ASISTENCIA SEMANAL */
                <div className="space-y-3">
                  {/* Filtros rápidos: Todos, Asistieron, No asistieron */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                    <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-[#E5E7EB]/60">
                      <button
                        type="button"
                        onClick={() => set_filtro_asistencia("todos")}
                        className={`text-xs py-1 px-3 font-bold rounded-md transition-colors cursor-pointer ${
                          filtro_asistencia === "todos" ? "bg-white text-[#035683] shadow-2xs" : "text-[#5B6D77] hover:text-[#035683]"
                        }`}
                      >
                        Todos ({total_registros})
                      </button>
                      <button
                        type="button"
                        onClick={() => set_filtro_asistencia("asistieron")}
                        className={`text-xs py-1 px-3 font-bold rounded-md transition-colors cursor-pointer ${
                          filtro_asistencia === "asistieron" ? "bg-white text-emerald-800 shadow-2xs" : "text-emerald-700 hover:text-emerald-800"
                        }`}
                      >
                        Asistieron ({total_asistieron})
                      </button>
                      <button
                        type="button"
                        onClick={() => set_filtro_asistencia("no_asistieron")}
                        className={`text-xs py-1 px-3 font-bold rounded-md transition-colors cursor-pointer ${
                          filtro_asistencia === "no_asistieron" ? "bg-white text-rose-800 shadow-2xs" : "text-rose-700 hover:text-rose-800"
                        }`}
                      >
                        No asistieron ({total_no_asistieron})
                      </button>
                    </div>

                    <span className="text-xs font-mono text-muted-foreground">
                      Mostrando {registros_filtrados.length} de {total_registros} registros registrados
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB] text-[#035683] font-mono text-[11px] uppercase tracking-wider">
                          <th className="py-2.5 px-3">Becario</th>
                          <th className="py-2.5 px-3">Carrera Universitaria</th>
                          <th className="py-2.5 px-3">Horario de Apoyo Asignado</th>
                          <th className="py-2.5 px-3 text-center">Estado de Asistencia</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E7EB]/60">
                        {registros_filtrados.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-muted-foreground">
                              <CheckCircle2 className="w-6 h-6 text-[#00ABBD] mx-auto mb-1 opacity-70" />
                              <p className="font-semibold text-xs text-[#035683]">Sin registros de asistencia en esta semana</p>
                              <p className="text-[11px]">No existen marcaciones ni novedades registradas en la base de datos para este periodo.</p>
                            </td>
                          </tr>
                        ) : (
                          registros_filtrados.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2.5">
                                <Avatar className="w-7 h-7 border border-[#E5E7EB]">
                                  <AvatarFallback className="bg-slate-100 text-[#035683] font-bold text-[10px]">
                                    {item.avatar}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-bold text-[#035683]">{item.nombre}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-muted-foreground">{item.carrera}</td>
                            <td className="py-2.5 px-3 font-mono text-xs text-[#5B6D77]">{item.horario_asignado}</td>
                            <td className="py-2.5 px-3 text-center">
                              {item.asistio ? (
                                <div className="inline-flex items-center gap-1.5">
                                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 font-bold text-[10px] flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Asistió
                                  </Badge>
                                  {item.minutos_retraso && (
                                    <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px] font-mono font-bold">
                                      +{item.minutos_retraso}m
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <Badge className="bg-rose-50 text-rose-700 border-rose-300 font-bold text-[10px] flex items-center gap-1 mx-auto w-fit">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                  No asistió
                                </Badge>
                              )}
                            </td>
                          </tr>
                        )))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Leyenda de corte semanal compacta */}
              <div className="pt-2 flex items-center gap-2 text-[11px] text-muted-foreground border-t border-[#E5E7EB]/60">
                <HelpCircle className="w-3.5 h-3.5 text-[#00ABBD] shrink-0" />
                <span>
                  <strong>Corte Semanal Automático:</strong> Se procesa los viernes a las 18:00. Las inasistencias no justificadas dentro de las 48h hábiles computan en el cálculo de devolución del 80% de pasajes.
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================== */}
        {/* TAB 3: MÓDULO INTERACTIVO DE GESTIÓN Y MATRIZ DE HORARIOS     */}
        {/* ============================================================== */}
        <TabsContent value="horarios" className="space-y-4">
          {/* Barra de Búsqueda, Filtros y Acciones Operativas de Horario */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#E5E7EB] shadow-2xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Buscar becario por nombre o carnet..."
                value={busqueda_horario}
                onChange={(e) => set_busqueda_horario(e.target.value)}
                className="pl-9 h-9 text-xs border-[#E5E7EB] rounded-xl bg-slate-50/50"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 overflow-x-auto">
                <span className="text-xs font-mono text-muted-foreground mr-1 shrink-0">Día:</span>
                {(["todos", "lunes", "martes", "miercoles", "jueves", "viernes"] as const).map((dia) => (
                  <button
                    key={dia}
                    type="button"
                    onClick={() => set_filtro_dia_horario(dia)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                      filtro_dia_horario === dia
                        ? "bg-[#035683] text-white shadow-xs"
                        : "bg-slate-100 text-[#5B6D77] hover:bg-slate-200"
                    }`}
                  >
                    {dia === "miercoles" ? "Mié" : dia.slice(0, 3)}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 pl-2 border-l border-[#E5E7EB]">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    toast.info("Generando Matriz de Horarios Semanal en PDF...");
                    await descargarPdfConResiliencia(
                      "/pdf/corte-asistencia?tipo=todas",
                      "Matriz_Horarios_Semanal_BUMAND.pdf",
                      "corte_asistencia"
                    );
                    toast.success("Matriz de Horarios descargada en PDF exitosamente");
                  }}
                  className="h-8 text-xs border-[#E5E7EB] text-[#035683] hover:bg-slate-50 gap-1 font-bold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#00ABBD]" />
                  Exportar PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Tabla Interactiva de Matriz de Horarios */}
          <Card className="border-[#E5E7EB] shadow-sm bg-white rounded-xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-[#E5E7EB]/60 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="font-display text-base text-[#035683] flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-[#035683]" />
                    Matriz Semanal de Asignación por Becario
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Grilla horaria de apoyo por día — editable por supervisión y referencia oficial para geocercas.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <Badge variant="outline" className="border-[#00ABBD] text-[#035683] font-mono text-xs px-2.5 py-0.5 bg-white">
                    {horarios_filtrados.length} de {horarios_para_rol.length} Becarios
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB] text-[#035683] font-mono text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-3 text-center">N°</th>
                      <th className="py-3 px-4">Nombres y Apellidos</th>
                      <th className="py-3 px-3 font-mono">C.I.</th>
                      <th className="py-3 px-3">Materias</th>
                      <th className="py-3 px-3">Régimen</th>
                      <th className="py-3 px-3 font-mono text-center">Lunes</th>
                      <th className="py-3 px-3 font-mono text-center">Martes</th>
                      <th className="py-3 px-3 font-mono text-center">Miércoles</th>
                      <th className="py-3 px-3 font-mono text-center">Jueves</th>
                      <th className="py-3 px-3 font-mono text-center">Viernes</th>
                      <th className="py-3 px-3 text-center">Gestión</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]/60">
                    {horarios_filtrados.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="py-8 text-center text-muted-foreground text-xs">
                          No se encontraron becarios programados con los criterios de búsqueda aplicados.
                        </td>
                      </tr>
                    ) : (
                      horarios_filtrados.map((fila) => (
                        <tr
                          key={fila.numero}
                          className={`transition-colors ${
                            fila.destacada
                              ? "bg-[#FFB600]/15 hover:bg-[#FFB600]/25 font-medium"
                              : "hover:bg-slate-50/80"
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-muted-foreground">
                            {fila.numero}
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-[#035683]">
                            {fila.nombre}
                            {fila.destacada && (
                              <span className="ml-2 inline-block px-1.5 py-0.2 bg-[#FFB600] text-[#3A2400] text-[9.5px] rounded font-bold uppercase">
                                Referente
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[#5B6D77] whitespace-nowrap">
                            {fila.ci}
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground">
                            {fila.cantidad_materias}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                fila.periodo === "Semestral"
                                  ? "bg-[#00ABBD]/15 text-[#00808E]"
                                  : fila.periodo === "Anual"
                                  ? "bg-[#035683]/10 text-[#035683]"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {fila.periodo}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-center whitespace-nowrap">
                            {fila.lunes === "—" ? (
                              <span className="text-muted-foreground/40">—</span>
                            ) : (
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-[#035683]">
                                {fila.lunes}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-center whitespace-nowrap">
                            {fila.martes === "—" ? (
                              <span className="text-muted-foreground/40">—</span>
                            ) : (
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-[#035683]">
                                {fila.martes}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-center whitespace-nowrap">
                            {fila.miercoles === "—" ? (
                              <span className="text-muted-foreground/40">—</span>
                            ) : (
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-[#035683]">
                                {fila.miercoles}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-center whitespace-nowrap">
                            {fila.jueves === "—" ? (
                              <span className="text-muted-foreground/40">—</span>
                            ) : (
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-[#035683]">
                                {fila.jueves}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-center whitespace-nowrap">
                            {fila.viernes === "—" ? (
                              <span className="text-muted-foreground/40">—</span>
                            ) : (
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-[#035683]">
                                {fila.viernes}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => abrirEditorHorario(fila)}
                              className="h-7 px-2.5 text-[11px] border-[#00ABBD]/50 text-[#035683] hover:bg-[#00ABBD]/15 hover:border-[#00ABBD] font-bold gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3 text-[#00ABBD]" />
                              Editar
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================== */}
        {/* TAB 4: ANALÍTICA DE DATOS Y KARDEX (CON PASTORAL)              */}
        {/* ============================================================== */}
        <TabsContent value="analitica" className="space-y-5">
          {/* Header de Kardex con Selector Dinámico de Periodos Históricos y Acta Oficial */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl border border-[#E5E7EB] bg-gradient-to-r from-slate-50 via-white to-slate-50 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <BarChart3 className="w-5 h-5 text-[#00ABBD]" />
                <h3 className="text-base font-bold font-display text-[#035683]">
                  Kardex Integral y Analítica Institucional
                </h3>
                <Badge
                  variant="outline"
                  className={`text-[11px] font-mono font-semibold ${
                    es_periodo_historico
                      ? "bg-amber-50 text-amber-800 border-amber-300"
                      : "bg-emerald-50 text-emerald-800 border-emerald-300"
                  }`}
                >
                  {periodo_seleccionado_obj.estado_texto}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Consolidación de {periodo_seleccionado_obj.total_becarios} becarios · Promedio cohorte:{" "}
                <strong className="text-[#035683]">{periodo_seleccionado_obj.promedio_general}</strong> ·
                Evaluación integral (Liderazgo, Académico, Tutoría, Escuela de Líderes y Socioeconómica).
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] shadow-xs">
                <History className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-[#035683]">Periodo:</span>
                <select
                  value={periodo_academico}
                  onChange={(e) => set_periodo_academico(e.target.value)}
                  className="text-xs font-semibold bg-transparent text-[#035683] border-none focus:outline-hidden cursor-pointer pr-1"
                >
                  {(periodos_lista.length > 0 ? periodos_lista : [periodo_seleccionado_obj]).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.etiqueta} ({p.estado === "vigente" ? "Vigente" : "Auditado"})
                    </option>
                  ))}
                </select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  toast.info(
                    `Generando acta oficial consolidada en PDF para ${periodo_seleccionado_obj.etiqueta}...`
                  );
                  await descargarPdfConResiliencia(
                    "/pdf/consolidado-auditoria",
                    `Acta_Oficial_Consolidada_${periodo_academico}.pdf`,
                    "consolidado_auditoria"
                  );
                  toast.success("Acta oficial descargada en PDF exitosamente");
                }}
                className="h-8 text-xs font-bold border-[#035683]/30 text-[#035683] hover:bg-[#035683]/10 gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-[#00ABBD]" />
                Acta PDF
              </Button>
            </div>
          </div>

          {/* Aviso de Auditoría y Modo Sólo Lectura para Semestres Históricos */}
          {es_periodo_historico && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border border-amber-300/80 bg-amber-50/70 text-xs text-amber-900 shadow-xs">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Archivo Académico Auditado ({periodo_seleccionado_obj.etiqueta}):</strong> Las notas y ponderaciones de este periodo están formalmente cerradas y respaldadas en acta por la Junta de Diaconía IFD. Este módulo se encuentra en modo <em>sólo lectura</em>.
                </span>
              </div>
              <Badge variant="outline" className="font-mono text-[10px] bg-white border-amber-300 text-amber-800 shrink-0 self-start sm:self-center">
                Acta Nº {periodo_seleccionado_obj.gestion}-S{periodo_seleccionado_obj.semestre}
              </Badge>
            </div>
          )}

          {/* DISTRIBUCIÓN POR UNIVERSIDAD, MODALIDAD Y AUTOEVALUACIÓN (COMPACTADA) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Tarjeta: Distribución por Universidad */}
            <Card className="border-[#E5E7EB] shadow-sm bg-white rounded-xl">
              <CardHeader className="p-3.5 pb-2.5 border-b border-[#E5E7EB]/60">
                <CardTitle className="font-display text-sm text-[#035683] flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#035683]" />
                  Distribución por Universidad
                </CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground">
                  Casas de estudios superiores de los becarios.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3.5 space-y-2.5">
                {distribucion_universidades.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Sin datos universitarios registrados.</p>
                ) : (
                  distribucion_universidades.map((u) => (
                    <div key={u.nombre} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-[#1E293B] truncate pr-2" title={u.nombre}>
                          {u.nombre}
                        </span>
                        <span className="font-mono font-bold text-[#035683]">{u.cantidad}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${u.porcentaje}%`,
                            backgroundColor: u.color,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Tarjeta: Modalidad de la Beca */}
            <Card className="border-[#E5E7EB] shadow-sm bg-white rounded-xl">
              <CardHeader className="p-3.5 pb-2.5 border-b border-[#E5E7EB]/60">
                <CardTitle className="font-display text-sm text-[#035683] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#00ABBD]" />
                  Modalidad de la Beca
                </CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground">
                  Régimen académico cursado por la cohorte.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3.5 space-y-3">
                {distribucion_modalidades.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Sin modalidades registradas.</p>
                ) : (
                  distribucion_modalidades.map((m) => (
                    <div key={m.modalidad} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-[#1E293B]">{m.modalidad}</span>
                        <span className="font-mono font-bold text-[#035683]">{m.cantidad}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${m.porcentaje}%`,
                            backgroundColor: m.color,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
                <div className="pt-1.5 text-[11px] text-muted-foreground font-mono">
                  Total: {periodo_seleccionado_obj.total_becarios} becarios matriculados en {periodo_seleccionado_obj.gestion}.
                </div>
              </CardContent>
            </Card>

            {/* Tarjeta: Autoevaluación de Desempeño General (1–10) */}
            <Card className="border-[#E5E7EB] shadow-sm bg-white rounded-xl">
              <CardHeader className="p-3.5 pb-2.5 border-b border-[#E5E7EB]/60">
                <CardTitle className="font-display text-sm text-[#035683] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FFB600]" />
                  Autoevaluación de Desempeño (1–10)
                </CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground">
                  Percepción del estudiante sobre su propio avance.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3.5 space-y-2.5">
                {["Nota 7", "Nota 8", "Nota 9", "Nota 10"].map((nota) => (
                  <div key={nota} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-[#1E293B]">{nota}</span>
                      <span className="font-mono font-bold text-[#035683]">0 becarios</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-[#00ABBD]"
                        style={{ width: "0%" }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* CASOS QUE REQUIEREN SEGUIMIENTO PASTORAL Y DE MENTORÍA */}
          <Card className="border-[#E5E7EB] shadow-sm bg-white rounded-xl overflow-hidden">
            <CardHeader className="py-3 px-4 border-b border-[#E5E7EB]/60 bg-gradient-to-r from-amber-50/50 to-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="font-display text-sm text-[#035683] flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-amber-600" />
                    Casos que Requieren Seguimiento Pastoral y de Mentoría
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Expedientes derivados de observaciones del Pastor en Formulario F-03 y tutorías activas.
                  </CardDescription>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {(usuario?.rol === "administrador" || usuario?.rol === "supervisor" || !usuario) && (
                    <Button
                      size="sm"
                      onClick={() => set_dialogo_nuevo_caso_abierto(true)}
                      className="h-8 px-3 bg-[#035683] hover:bg-[#035683]/90 text-white font-bold text-[11px] flex items-center gap-1.5 cursor-pointer rounded-lg shadow-2xs"
                    >
                      <HeartHandshake className="w-3.5 h-3.5 text-[#FFB600]" />
                      <span>Derivar Caso Pastoral</span>
                    </Button>
                  )}

                  {/* Filtro por estado de caso */}
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-[#E5E7EB]/70">
                    {[
                      { key: "todos", etiqueta: "Todos", count: casos_pastorales_para_rol.length },
                      { key: "PENDIENTE", etiqueta: "Pendientes", count: casos_pastorales_para_rol.filter((c) => c.estado === "PENDIENTE").length },
                      { key: "EN_TUTORIA", etiqueta: "En Tutoría", count: casos_pastorales_para_rol.filter((c) => c.estado === "EN_TUTORIA").length },
                      { key: "RESUELTO", etiqueta: "Superados", count: casos_pastorales_para_rol.filter((c) => c.estado === "RESUELTO").length },
                    ].map((f) => (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => set_filtro_estado_casos(f.key as any)}
                        className={`text-[11px] py-1 px-2.5 font-bold rounded-md transition-all cursor-pointer ${
                          filtro_estado_casos === f.key
                            ? "bg-[#035683] text-white shadow-2xs"
                            : "text-[#5B6D77] hover:text-[#035683]"
                        }`}
                      >
                        {f.etiqueta} ({f.count})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB] text-[#035683] font-mono text-[11px] uppercase">
                      <th className="py-2.5 px-4">Becario</th>
                      <th className="py-2.5 px-3">Universidad / Carrera</th>
                      <th className="py-2.5 px-4">Observaciones Pastorales (F-03)</th>
                      <th className="py-2.5 px-3 text-center">Prioridad</th>
                      <th className="py-2.5 px-3 text-center">Tutor Responsable</th>
                      <th className="py-2.5 px-3 text-center">Estado</th>
                      <th className="py-2.5 px-3 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]/60">
                    {casos_pastorales_filtrados.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-muted-foreground">
                          <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1 opacity-70" />
                          <p className="font-semibold text-xs text-[#035683]">Sin casos registrados en esta vista</p>
                          <p className="text-[11px]">No se encontraron expedientes pastorales con el estado seleccionado.</p>
                        </td>
                      </tr>
                    ) : (
                      casos_pastorales_filtrados.map((caso) => (
                        <tr key={caso.id} className="hover:bg-amber-50/20 transition-colors">
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <Avatar className="w-7 h-7 border border-[#E5E7EB]">
                                <AvatarFallback className="bg-[#035683] text-[#FFB600] font-bold text-xs">
                                  {caso.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-bold text-[#035683] block">{caso.nombre}</span>
                                <span className="text-[10px] text-muted-foreground font-mono">{caso.origen || "F-03"}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                            {caso.universidad} · {caso.carrera}
                          </td>
                          <td className="py-2.5 px-4 text-[#1E293B] font-medium leading-relaxed max-w-md">
                            {caso.observacion}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <Badge
                              className={`text-[10px] font-mono font-bold ${
                                caso.prioridad === "ALTA"
                                  ? "bg-rose-100 text-rose-800 border-rose-300"
                                  : caso.prioridad === "MEDIA"
                                  ? "bg-amber-100 text-amber-800 border-amber-300"
                                  : "bg-slate-100 text-slate-700 border-slate-300"
                              }`}
                            >
                              {caso.prioridad}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3 text-center text-[11px] text-muted-foreground">
                            {caso.responsable_nombre || "Pr. Juan Ramos (Tutor Pastoral)"}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-bold font-mono ${
                                caso.estado === "RESUELTO"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                  : caso.estado === "EN_TUTORIA"
                                  ? "bg-cyan-50 text-[#00808E] border-[#00ABBD]/40"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {caso.estado === "RESUELTO" ? "Superado" : caso.estado === "EN_TUTORIA" ? "En Tutoría" : "Pendiente"}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => abrirGestionCaso(caso)}
                              className="h-7 px-2.5 text-[11px] border-[#035683] text-[#035683] hover:bg-[#035683] hover:text-white font-bold gap-1 cursor-pointer transition-all"
                            >
                              <HeartHandshake className="w-3.5 h-3.5 text-[#00ABBD]" />
                              Gestionar Caso
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* RANKING KARDEX CONSOLIDADOR DINÁMICO POR PERIODO */}
          <Card className="border-[#E5E7EB] shadow-sm bg-white rounded-xl overflow-hidden">
            <CardHeader className="py-3 px-4 border-b border-[#E5E7EB]/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="font-display text-sm text-[#035683] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#00ABBD]" />
                    Kardex — Ranking de Becarios · {periodo_seleccionado_obj.etiqueta}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Consolidación de las 5 evaluaciones del periodo y cálculo del promedio general de acreditación.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="font-mono text-xs border-[#E5E7EB] text-[#035683] self-start sm:self-center">
                  {periodo_seleccionado_obj.estado_texto}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB] text-[#035683] font-mono text-[11px] uppercase">
                      <th className="py-2.5 px-3 text-center">Pos.</th>
                      <th className="py-2.5 px-4">Becario</th>
                      <th className="py-2.5 px-3 text-center font-mono">Liderazgo Iglesia</th>
                      <th className="py-2.5 px-3 text-center font-mono">Académico</th>
                      <th className="py-2.5 px-3 text-center font-mono">Mentor</th>
                      <th className="py-2.5 px-3 text-center font-mono">Esc. Líderes</th>
                      <th className="py-2.5 px-3 text-center font-mono">Socioeconómica</th>
                      <th className="py-2.5 px-3 text-center font-mono font-bold">Promedio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]/60">
                    {obtenerDatosKardex().length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-muted-foreground">
                          <ShieldCheck className="w-6 h-6 text-[#00ABBD] mx-auto mb-1 opacity-70" />
                          <p className="font-semibold text-xs text-[#035683]">Sin evaluaciones consolidadas en este periodo</p>
                          <p className="text-[11px]">El ranking Kardex se completará automáticamente a medida que se registren las evaluaciones en base de datos.</p>
                        </td>
                      </tr>
                    ) : (
                      obtenerDatosKardex().map((k) => (
                      <tr key={k.posicion} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-[#FFB600]">
                          {k.posicion}
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-7 h-7 border border-[#E5E7EB]">
                              <AvatarFallback className="bg-[#035683] text-[#FFB600] font-bold text-[10px]">
                                {k.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-bold text-[#035683]">{k.nombre}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">{k.liderazgo_iglesia}</td>
                        <td className="py-2.5 px-3 text-center font-mono">{k.academico}</td>
                        <td className="py-2.5 px-3 text-center font-mono">{k.mentor}</td>
                        <td className="py-2.5 px-3 text-center font-mono">{k.escuela_lideres}</td>
                        <td className="py-2.5 px-3 text-center font-mono">
                          {k.socioeconomica === "—" || k.socioeconomica === "Incompleto" ? (
                            <span className="text-amber-600 font-semibold">{k.socioeconomica}</span>
                          ) : (
                            k.socioeconomica
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">
                          {k.promedio}
                        </td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ============================================================== */}
      {/* DIÁLOGO MODAL: GESTIÓN Y ASIGNACIÓN DE HORARIO DE PRÁCTICA      */}
      {/* ============================================================== */}
      <Dialog open={dialogo_edicion_abierto} onOpenChange={set_dialogo_edicion_abierto}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-[#E5E7EB] bg-white rounded-2xl shadow-xl">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-[#035683]/10 rounded-xl text-[#035683]">
                <Clock className="w-5 h-5 text-[#00ABBD]" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-[#035683] font-display">
                  Asignación y Gobernanza de Horario de Práctica
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Coordinación Diaconía FRIF-IFD · Asignación oficial de turnos institucionales.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {becario_a_editar && (
            <DialogBody className="space-y-5 text-xs">
              {/* PASO 1: DIAGNÓSTICO ACADÉMICO Y DISPONIBILIDAD DECLARADA */}
              <div className="p-3.5 bg-slate-50 border border-[#E5E7EB] rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#035683]">{becario_a_editar.nombre}</span>
                    <Badge variant="outline" className="font-mono text-[10px] border-[#035683]/30 text-[#035683] bg-white">
                      CI: {becario_a_editar.ci}
                    </Badge>
                  </div>
                  <Badge className="bg-[#00ABBD]/15 text-[#00808E] border-[#00ABBD]/30 font-mono text-[10px]">
                    Régimen: {becario_a_editar.periodo}
                  </Badge>
                </div>

                <div className="p-2.5 bg-white border border-[#E5E7EB]/80 rounded-lg space-y-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#035683] block">
                    Carga Académica y Disponibilidad Declarada:
                  </span>
                  <p className="text-xs text-slate-700 font-medium">
                    {materias_declaradas_edit}
                  </p>
                  <p className="text-[11px] text-slate-500 pt-0.5 leading-snug">
                    <strong className="text-[#035683]">Regla de Gobernanza:</strong> La coordinación asigna un bloque de 4 horas diarias respetando las materias declaradas por el estudiante para evitar solapamientos con cátedras universitarias.
                  </p>
                </div>
              </div>

              {/* PASO 2: ASIGNACIÓN INSTITUCIONAL DE SEDE DIACONÍA IFD */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#035683] flex items-center justify-between">
                  <span>Sede / Agencia de Práctica Institucional</span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {lugares_practica_lista.length} {lugares_practica_lista.length === 1 ? "sede habilitada" : "sedes habilitadas"} con geocerca WGS84
                  </span>
                </Label>
                <select
                  value={sede_edit}
                  onChange={(e) => set_sede_edit(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-[#E5E7EB] bg-white text-xs font-medium text-[#1E293B] focus:border-[#00ABBD] focus:outline-hidden"
                >
                  {(lugares_practica_lista.length > 0
                    ? lugares_practica_lista.map((l) => l.nombre)
                    : ["Oficina Central Diaconía IFD - El Alto"]
                  ).map((agencia) => (
                    <option key={agencia} value={agencia}>
                      {agencia}
                    </option>
                  ))}
                </select>
              </div>

              {/* PASO 3: GRILLA SEMANAL FLEXIBLE DÍA POR DÍA */}
              <div className="space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div>
                    <Label className="text-xs font-semibold text-[#035683]">Grilla Semanal Flexible (Lun a Vie)</Label>
                    <p className="text-[11px] text-muted-foreground">Configura los días activos y ajusta el horario de entrada y salida independiente por día.</p>
                  </div>
                  {/* Presets Rápidos */}
                  <div className="flex items-center gap-1 self-start sm:self-auto">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        set_dias_detallados_edit((prev) => {
                          const copia = { ...prev };
                          Object.keys(copia).forEach((k) => {
                            if (copia[k].activo) {
                              copia[k] = { ...copia[k], inicio: "08:00", fin: "12:00" };
                            }
                          });
                          return copia;
                        });
                        toast.info("Horario 08:00–12:00 aplicado a los días activos.");
                      }}
                      className="h-7 px-2 text-[10px] border-[#E5E7EB] text-[#035683] hover:bg-slate-50"
                    >
                      Mañana (08:00–12:00)
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        set_dias_detallados_edit((prev) => {
                          const copia = { ...prev };
                          Object.keys(copia).forEach((k) => {
                            if (copia[k].activo) {
                              copia[k] = { ...copia[k], inicio: "13:00", fin: "17:00" };
                            }
                          });
                          return copia;
                        });
                        toast.info("Horario 13:00–17:00 aplicado a los días activos.");
                      }}
                      className="h-7 px-2 text-[10px] border-[#E5E7EB] text-[#035683] hover:bg-slate-50"
                    >
                      Tarde (13:00–17:00)
                    </Button>
                  </div>
                </div>

                {/* Listado de 5 días con horario diferenciado */}
                <div className="space-y-2 border border-[#E5E7EB] rounded-xl p-3 bg-slate-50/50">
                  {[
                    { key: "lunes", etiqueta: "Lunes" },
                    { key: "martes", etiqueta: "Martes" },
                    { key: "miercoles", etiqueta: "Miércoles" },
                    { key: "jueves", etiqueta: "Jueves" },
                    { key: "viernes", etiqueta: "Viernes" },
                  ].map((dia) => {
                    const info_dia = dias_detallados_edit[dia.key] || { activo: false, inicio: "08:00", fin: "12:00" };
                    return (
                      <div
                        key={dia.key}
                        className={`p-2.5 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                          info_dia.activo
                            ? "bg-white border-[#00ABBD]/50 shadow-2xs"
                            : "bg-slate-100/70 border-slate-200 opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-3 w-32">
                          <button
                            type="button"
                            onClick={() =>
                              set_dias_detallados_edit((prev) => ({
                                ...prev,
                                [dia.key]: {
                                  ...prev[dia.key],
                                  activo: !prev[dia.key]?.activo,
                                },
                              }))
                            }
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors cursor-pointer ${
                              info_dia.activo
                                ? "bg-[#035683] border-[#035683] text-white"
                                : "bg-white border-[#E5E7EB] text-transparent"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <div>
                            <span className="font-bold text-xs text-[#035683] block">{dia.etiqueta}</span>
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {info_dia.activo ? "Asignado" : "Libre"}
                            </span>
                          </div>
                        </div>

                        {info_dia.activo ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-muted-foreground font-mono">Entrada:</span>
                              <Input
                                type="time"
                                value={info_dia.inicio}
                                onChange={(e) =>
                                  set_dias_detallados_edit((prev) => ({
                                    ...prev,
                                    [dia.key]: { ...prev[dia.key], inicio: e.target.value },
                                  }))
                                }
                                className="h-7 text-xs bg-white w-24 font-mono"
                              />
                            </div>
                            <span className="text-slate-400 font-mono">→</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-muted-foreground font-mono">Salida:</span>
                              <Input
                                type="time"
                                value={info_dia.fin}
                                onChange={(e) =>
                                  set_dias_detallados_edit((prev) => ({
                                    ...prev,
                                    [dia.key]: { ...prev[dia.key], fin: e.target.value },
                                  }))
                                }
                                className="h-7 text-xs bg-white w-24 font-mono"
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">
                            Día libre sin asignación institucional
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Resumen en tiempo real de carga horaria */}
                <div className="flex items-center justify-between p-3 bg-white border border-[#E5E7EB] rounded-xl">
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground block">
                      Total Carga Asignada:
                    </span>
                    <span className="font-display font-bold text-base text-[#035683]">
                      {horas_semanales_asignadas_calculadas} hrs / semana
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      horas_semanales_asignadas_calculadas >= 9
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                        : "bg-amber-50 text-amber-800 border-amber-300 font-bold"
                    }
                  >
                    {horas_semanales_asignadas_calculadas > 9
                      ? `Meta Superada (≥9h/sem · Meta: 36 hrs/mes)`
                      : horas_semanales_asignadas_calculadas === 9
                      ? "Meta Cumplida (9h/sem · 36 hrs/mes)"
                      : "Carga Parcial (<9h/sem · Meta: 36 hrs/mes)"}
                  </Badge>
                </div>

                {/* Alerta Preventiva de Escuela de Líderes los Viernes */}
                {hay_solapamiento_viernes && (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-xs text-amber-900">Alerta de Solapamiento con Escuela de Líderes</p>
                      <p className="text-[11px] text-amber-800 leading-snug">
                        Has configurado el viernes con salida después de las 14:00. Recuerda que todos los viernes a las 14:30 se lleva a cabo la Escuela de Líderes obligatoria. Se recomienda finalizar el turno antes de las 14:00.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </DialogBody>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => set_dialogo_edicion_abierto(false)}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={guardarEdicionHorario}
              className="bg-[#035683] hover:bg-[#035683]/90 text-white font-bold text-xs gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-[#FFB600]" />
              Guardar Horario Asignado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* DIÁLOGO MODAL: GESTIÓN DE EXPEDIENTE PASTORAL Y DE MENTORÍA    */}
      {/* ============================================================== */}
      <DialogoGestionCasoPastoral
        caso={caso_a_gestionar}
        abierto={dialogo_gestion_caso_abierto}
        alCerrar={() => {
          set_dialogo_gestion_caso_abierto(false);
          set_caso_a_gestionar(null);
        }}
        alActualizar={actualizarCasoPastoral}
      />

      {/* ============================================================== */}
      {/* DIÁLOGO MODAL: AUDITORÍA Y JUSTIFICACIÓN DE RETRASO (RECTIF.)  */}
      {/* ============================================================== */}
      <DialogoJustificarRetraso
        abierto={dialogo_justificar_abierto}
        enCerrar={() => {
          set_dialogo_justificar_abierto(false);
          set_becario_a_justificar(null);
        }}
        becario={becario_a_justificar}
        rolUsuario={usuario?.rol || "administrador"}
        enRetrasoJustificado={manejarRetrasoJustificado}
      />

      {/* ============================================================== */}
      {/* DIÁLOGO MODAL: DERIVACIÓN MANUAL DE CASO PASTORAL              */}
      {/* ============================================================== */}
      <DialogoNuevoCasoPastoral
        abierto={dialogo_nuevo_caso_abierto}
        enCerrar={() => set_dialogo_nuevo_caso_abierto(false)}
        becariosDisponibles={becarios_reales.map((b) => ({
          id: Number(b.id),
          nombre: b.nombre || b.usuario?.nombre || `Becario #${b.id}`,
          carrera: b.carrera || "No registrada",
          universidad: b.universidad || "No registrada",
          avatar: construirInicialesAvatar(b.nombre || b.usuario?.nombre),
        }))}
        enCasoCreado={manejarCasoCreado}
      />
    </div>
  );
}
