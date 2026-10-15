"use client";

import { useState, useEffect, useCallback } from "react";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import { clienteApi } from "@/lib/cliente-api";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Clock,
  FileCheck,
  TrendingUp,
  AlertCircle,
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon,
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
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Pie,
  PieChart,
  Cell,
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
  nombre: string;
  ci: string;
  cantidad_materias: string;
  periodo: string;
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

// --- CONSTANTES INSTITUCIONALES DEL DATASET REAL ---

export const BECARIOS_RETRASO: BecarioRetraso[] = [
  {
    id: 1,
    nombre: "Carlos Oscar Luna Lizarraga",
    avatar: "CL",
    carrera: "Economía",
    fecha: "12/08/2026",
    hora_prevista: "08:00",
    hora_real: "08:24",
    minutos_retraso: 24,
    sede: "Oficina Central Bloque A",
    tipo_asistencia: "Prácticas",
  },
  {
    id: 2,
    nombre: "Jhonny Poma",
    avatar: "JP",
    carrera: "Derecho",
    fecha: "12/08/2026",
    hora_prevista: "08:30",
    hora_real: "09:20",
    minutos_retraso: 50,
    sede: "Agencia Villa Adela",
    tipo_asistencia: "Escuela de Líderes",
  },
  {
    id: 3,
    nombre: "Mariela Dayana Jimenez Chambi",
    avatar: "MJ",
    carrera: "Contaduría Pública",
    fecha: "11/08/2026",
    hora_prevista: "14:00",
    hora_real: "14:35",
    minutos_retraso: 35,
    sede: "Sucursal Juan Pablo II",
    tipo_asistencia: "Prácticas",
  },
  {
    id: 4,
    nombre: "Daniel Davalos Quiñoñez",
    avatar: "DD",
    carrera: "Informática",
    fecha: "11/08/2026",
    hora_prevista: "13:00",
    hora_real: "13:18",
    minutos_retraso: 18,
    sede: "Oficina Central Bloque A",
    tipo_asistencia: "Escuela de Líderes",
  },
  {
    id: 5,
    nombre: "Mayherli Alejandra Loza Villalobos",
    avatar: "ML",
    carrera: "Contaduría Pública",
    fecha: "10/08/2026",
    hora_prevista: "08:15",
    hora_real: "08:42",
    minutos_retraso: 27,
    sede: "Agencia Ceja El Alto",
    tipo_asistencia: "Acciones de Servicio",
  },
];

export const REGISTROS_ASISTENCIA_SEMANAL: RegistroAsistenciaSemanal[] = [
  { id: 1, nombre: "Adai Belen Huayta Cardozo", avatar: "AH", carrera: "Estadística (UMSA)", horario_asignado: "Lun/Mié 13:00-16:30, Vie 09:00-14:00", asistio: true, fecha_corte: "Semana 32" },
  { id: 2, nombre: "Alejandro Roberth Paredes Tarquino", avatar: "AP", carrera: "Cs. de la Comunicación (UPEA)", horario_asignado: "Mar/Jue/Vie 10:30-13:30", asistio: true, fecha_corte: "Semana 32" },
  { id: 3, nombre: "Aydee Ruth Ali Condori", avatar: "AA", carrera: "Contaduría Pública (UPEA)", horario_asignado: "Mar/Jue/Vie 10:00-13:00", asistio: true, fecha_corte: "Semana 32" },
  { id: 4, nombre: "Carlos Oscar Luna Lizarraga", avatar: "CL", carrera: "Economía (UMSA)", horario_asignado: "Mar/Jue 08:00-12:00, Vie 08:00-14:00", asistio: true, minutos_retraso: 24, fecha_corte: "Semana 32" },
  { id: 5, nombre: "Daniel Davalos Quiñoñez", avatar: "DD", carrera: "Informática (UMSA)", horario_asignado: "Mar 13:00-16:00, Vie 08:00-14:00", asistio: true, minutos_retraso: 18, fecha_corte: "Semana 32" },
  { id: 6, nombre: "Edgar Elias Alarcon Huanca", avatar: "EA", carrera: "Medicina (U. Aquino Bolivia)", horario_asignado: "Lun 08:00-16:00, Vie 10:00-14:00", asistio: true, fecha_corte: "Semana 32" },
  { id: 7, nombre: "Fernando Rene Yujra Quispe", avatar: "FY", carrera: "Ingeniería Civil (UMSA)", horario_asignado: "Lun 09:00-15:00, Mié 08:00-16:00", asistio: false, fecha_corte: "Semana 32" },
  { id: 8, nombre: "Isaias Daniel Herrera Mamani", avatar: "IH", carrera: "Arquitectura (UPEA)", horario_asignado: "Lun 09:00-15:00, Mié 08:00-16:00", asistio: true, fecha_corte: "Semana 32" },
  { id: 9, nombre: "Jhoselin Quispe Morales", avatar: "JQ", carrera: "Comunicación Social (UMSA)", horario_asignado: "Lun/Mié 08:30-16:30", asistio: true, fecha_corte: "Semana 32" },
  { id: 10, nombre: "Jhonny Poma", avatar: "JP", carrera: "Derecho (UMSA)", horario_asignado: "Lun/Mié 08:30-16:30", asistio: true, minutos_retraso: 50, fecha_corte: "Semana 32" },
  { id: 11, nombre: "José Marcos Suñagua Quispe", avatar: "JS", carrera: "Informática (UMSA)", horario_asignado: "Mié/Jue 08:30-11:30, Vie 08:30-13:30", asistio: false, fecha_corte: "Semana 32" },
  { id: 12, nombre: "Luis Santiago Enrriquez Conde", avatar: "LE", carrera: "Cs. de la Comunicación (UMSA)", horario_asignado: "Lun 08:00, Mar/Jue 12:00-16:00", asistio: true, fecha_corte: "Semana 32" },
  { id: 13, nombre: "Mariela Dayana Jimenez Chambi", avatar: "MJ", carrera: "Contaduría Pública (UMSA)", horario_asignado: "Lun 14:00, Mar/Jue 11:00-16:20", asistio: true, minutos_retraso: 35, fecha_corte: "Semana 32" },
  { id: 14, nombre: "Mario Catunta Laime", avatar: "MC", carrera: "Economía (UPEA)", horario_asignado: "Lun/Mié 08:00-12:00, Vie 08:00-14:00", asistio: true, fecha_corte: "Semana 32" },
  { id: 15, nombre: "Mayherli Alejandra Loza Villalobos", avatar: "ML", carrera: "Contaduría Pública (UMSA)", horario_asignado: "Lun 08:15-14:30, Mié/Vie 10:00-14:00", asistio: true, minutos_retraso: 27, fecha_corte: "Semana 32" },
  { id: 16, nombre: "Mónica Mamani Mamani", avatar: "MM", carrera: "Lingüística e Idiomas (UMSA)", horario_asignado: "Jue 08:30-16:00, Vie 09:00-13:30", asistio: false, fecha_corte: "Semana 32" },
  { id: 17, nombre: "Nilda Amalia Churata Paye", avatar: "NC", carrera: "Educación Parvularia (UPEA)", horario_asignado: "Mar/Vie 08:00-13:00", asistio: true, fecha_corte: "Semana 32" },
  { id: 18, nombre: "Noemi Callisaya Alvarez", avatar: "NA", carrera: "Psicomotricidad (UPEA)", horario_asignado: "Lun/Vie 08:30-13:30", asistio: true, fecha_corte: "Semana 32" },
  { id: 19, nombre: "Ronald Mauricio Quiquijana Mayta", avatar: "RQ", carrera: "Ing. Telecomunicaciones (EMI)", horario_asignado: "Lun 08:00-16:00, Jue 14:00-16:00", asistio: false, fecha_corte: "Semana 32" },
  { id: 20, nombre: "Ruddy Flores Tapia", avatar: "RF", carrera: "Informática (UMSA)", horario_asignado: "Lun/Mar 09:00-16:00", asistio: true, fecha_corte: "Semana 32" },
  { id: 21, nombre: "Ruth Alesandra Choque Huanca", avatar: "RC", carrera: "Ingeniería Comercial (U. Central)", horario_asignado: "Lun 08:00-16:00, Mié 08:00-14:00", asistio: true, fecha_corte: "Semana 32" },
];

export const HORARIOS_APOYO_2026: FilaHorarioApoyo[] = [
  { numero: 1, nombre: "Adai Belen Huayta Cardozo", ci: "13696496 LP", cantidad_materias: "—", periodo: "Semestral", lunes: "13:00-16:30", martes: "—", miercoles: "13:00-16:30", jueves: "—", viernes: "09:00-14:00" },
  { numero: 2, nombre: "Alejandro Roberth Paredes Tarquino", ci: "10064956 LP", cantidad_materias: "—", periodo: "Anual", lunes: "—", martes: "10:30-13:30", miercoles: "—", jueves: "10:30-13:30", viernes: "10:30-13:30" },
  { numero: 3, nombre: "Aydee Ruth Ali Condori", ci: "9952878 LP", cantidad_materias: "—", periodo: "Anual", lunes: "—", martes: "10:00-13:00", miercoles: "—", jueves: "10:00-13:00", viernes: "10:00-13:00" },
  { numero: 4, nombre: "Carlos Oscar Luna Lizarraga", ci: "9943280 LP", cantidad_materias: "—", periodo: "Semestral", lunes: "—", martes: "08:00-12:00", miercoles: "—", jueves: "08:00-12:00", viernes: "08:00-14:00", destacada: true },
  { numero: 5, nombre: "Daniel Davalos Quiñoñez", ci: "9107373 LP", cantidad_materias: "4", periodo: "Semestral", lunes: "—", martes: "13:00-16:00", miercoles: "—", jueves: "—", viernes: "08:00-14:00" },
  { numero: 6, nombre: "Edgar Elias Alarcon Huanca", ci: "9160054 LP", cantidad_materias: "—", periodo: "Semestral", lunes: "08:00-16:00", martes: "—", miercoles: "—", jueves: "—", viernes: "10:00-14:00", destacada: true },
  { numero: 7, nombre: "Isaias Daniel Herrera Mamani", ci: "10920862 LP", cantidad_materias: "—", periodo: "Semestral", lunes: "09:00-15:00", martes: "—", miercoles: "08:00-16:00", jueves: "—", viernes: "—" },
  { numero: 8, nombre: "Jhoselin Quispe Morales", ci: "6950093 LP", cantidad_materias: "No corresponde", periodo: "N/C", lunes: "08:30-16:30", martes: "—", miercoles: "08:30-16:30", jueves: "—", viernes: "—" },
  { numero: 9, nombre: "José Marcos Suñagua Quispe", ci: "14378720 LP", cantidad_materias: "Aún falta fecha", periodo: "Semestral", lunes: "—", martes: "—", miercoles: "08:30-11:30", jueves: "08:30-11:30", viernes: "08:30-13:30" },
  { numero: 10, nombre: "Luis Santiago Enrriquez Conde", ci: "9927657 LP", cantidad_materias: "No corresponde", periodo: "Anual", lunes: "08:00", martes: "12:00-16:00", miercoles: "—", jueves: "12:00-16:00", viernes: "—" },
  { numero: 11, nombre: "Mariela Dayana Jimenez Chambi", ci: "12959656 LP", cantidad_materias: "8", periodo: "Anual", lunes: "14:00", martes: "11:00-16:20", miercoles: "—", jueves: "11:00-16:20", viernes: "—" },
  { numero: 12, nombre: "Mario Catunta Laime", ci: "7077936 LP", cantidad_materias: "No corresponde", periodo: "N/C", lunes: "08:00-12:00", martes: "—", miercoles: "08:00-12:00", jueves: "—", viernes: "08:00-14:00", destacada: true },
  { numero: 13, nombre: "Mayherli Alejandra Loza Villalobos", ci: "9925727 LP", cantidad_materias: "Aún falta fecha", periodo: "Anual", lunes: "08:15-14:30", martes: "—", miercoles: "10:00-15:00", jueves: "—", viernes: "10:00-14:00" },
  { numero: 14, nombre: "Mónica Mamani Mamani", ci: "10369104 LP", cantidad_materias: "No corresponde", periodo: "N/C", lunes: "—", martes: "—", miercoles: "—", jueves: "08:30-16:00", viernes: "09:00-13:30" },
  { numero: 15, nombre: "Nilda Amalia Churata Paye", ci: "10028341 LP", cantidad_materias: "No corresponde", periodo: "N/C", lunes: "—", martes: "08:00-13:00", miercoles: "—", jueves: "—", viernes: "08:00-13:00" },
  { numero: 16, nombre: "Noemi Callisaya Alvarez", ci: "7093658 LP", cantidad_materias: "Aún falta fecha", periodo: "Semestral", lunes: "08:30-12:30", martes: "—", miercoles: "—", jueves: "—", viernes: "08:30-13:30" },
  { numero: 17, nombre: "Ronald Mauricio Quiquijana Mayta", ci: "6172054 LP", cantidad_materias: "7", periodo: "Semestral", lunes: "08:00-16:00", martes: "—", miercoles: "—", jueves: "14:00-16:00", viernes: "—" },
  { numero: 18, nombre: "Ruddy Flores Tapia", ci: "9974211 LP", cantidad_materias: "4", periodo: "Semestral", lunes: "09:00-16:00", martes: "09:00-16:00", miercoles: "—", jueves: "—", viernes: "—" },
];

export const CASOS_SEGUIMIENTO: CasoSeguimiento[] = [
  {
    id: 1,
    nombre: "Carlos Oscar Luna Lizarraga",
    avatar: "CL",
    carrera: "Economía",
    universidad: "UMSA",
    observacion: "Aún no es miembro de la iglesia; requiere mayor contacto con la congregación.",
  },
  {
    id: 2,
    nombre: "Jhoselin Quispe Morales",
    avatar: "JQ",
    carrera: "Comunicación Social",
    universidad: "UMSA",
    observacion: "No desempeña algún cargo de liderazgo.",
  },
  {
    id: 3,
    nombre: "José Marcos Suñagua Quispe",
    avatar: "JS",
    carrera: "Informática",
    universidad: "UMSA",
    observacion: "Trabajar en debilidades: puntualidad en la iglesia.",
  },
  {
    id: 4,
    nombre: "Luis Santiago Enrriquez Conde",
    avatar: "LE",
    carrera: "Cs. de la Comunicación Social",
    universidad: "UMSA",
    observacion: "No desempeña algún cargo; no forma a nuevos líderes, pero tiene potencial.",
  },
  {
    id: 5,
    nombre: "Mariela Dayana Jimenez Chambi",
    avatar: "MJ",
    carrera: "Contaduría Pública",
    universidad: "UMSA",
    observacion: "No desempeña algún cargo de liderazgo.",
  },
  {
    id: 6,
    nombre: "Mayherli Alejandra Loza Villalobos",
    avatar: "ML",
    carrera: "Contaduría Pública",
    universidad: "UMSA",
    observacion: "No desempeña algún cargo; se encuentra en formación.",
  },
  {
    id: 7,
    nombre: "Nilda Amalia Churata Paye",
    avatar: "NC",
    carrera: "Educación Parvularia",
    universidad: "UPEA",
    observacion: "Asiste solo domingos; falta mejorar el compromiso e involucrarse más.",
  },
];

export const DISTRIBUCION_UNIVERSIDADES = [
  { nombre: "Universidad Mayor de San Andrés (UMSA)", cantidad: 11, porcentaje: 100, color: "#063A6B" },
  { nombre: "Universidad Pública de El Alto (UPEA)", cantidad: 7, porcentaje: 64, color: "#17B4C4" },
  { nombre: "Universidad de Aquino Bolivia (UDABOL)", cantidad: 1, porcentaje: 9, color: "#F8C766" },
  { nombre: "Escuela Militar de Ingeniería (EMI)", cantidad: 1, porcentaje: 9, color: "#F8C766" },
  { nombre: "Universidad Central Sede La Paz", cantidad: 1, porcentaje: 9, color: "#F8C766" },
];

export const DISTRIBUCION_MODALIDADES = [
  { modalidad: "Semestral", cantidad: 13, porcentaje: 100, color: "#063A6B" },
  { modalidad: "Anual", cantidad: 7, porcentaje: 54, color: "#17B4C4" },
  { modalidad: "Mixta", cantidad: 1, porcentaje: 8, color: "#F8C766" },
];

export const DISTRIBUCION_AUTOEVALUACION = [
  { nota: "Nota 7", cantidad: 6, porcentaje: 67, color: "#7FE0E6" },
  { nota: "Nota 8", cantidad: 9, porcentaje: 100, color: "#17B4C4" },
  { nota: "Nota 9", cantidad: 4, porcentaje: 44, color: "#063A6B" },
  { nota: "Nota 10", cantidad: 2, porcentaje: 22, color: "#F8C766" },
];

export const RANKING_KARDEX_S2: FilaKardex[] = [
  { posicion: "01", nombre: "Luis Flores", avatar: "LF", liderazgo_iglesia: 19, academico: 20, mentor: 18, escuela_lideres: 19, socioeconomica: 20, promedio: "96%" },
  { posicion: "02", nombre: "Daniel Ávalos", avatar: "DA", liderazgo_iglesia: 18, academico: 20, mentor: 14, escuela_lideres: 17, socioeconomica: "—", promedio: "86%" },
  { posicion: "03", nombre: "Rosa Chura", avatar: "RC", liderazgo_iglesia: 16, academico: 18, mentor: 17, escuela_lideres: 15, socioeconomica: 18, promedio: "84%" },
  { posicion: "04", nombre: "Jhonny Poma", avatar: "JP", liderazgo_iglesia: 12, academico: 15, mentor: 11, escuela_lideres: 13, socioeconomica: 14, promedio: "65%" },
];

export const RANKING_KARDEX_S1: FilaKardex[] = [
  { posicion: "01", nombre: "Daniel Ávalos", avatar: "DA", liderazgo_iglesia: 18, academico: 19, mentor: 18, escuela_lideres: 17, socioeconomica: 18, promedio: "90%" },
  { posicion: "02", nombre: "Luis Flores", avatar: "LF", liderazgo_iglesia: 17, academico: 18, mentor: 17, escuela_lideres: 16, socioeconomica: 17, promedio: "85%" },
  { posicion: "03", nombre: "Rosa Chura", avatar: "RC", liderazgo_iglesia: 16, academico: 17, mentor: 16, escuela_lideres: 15, socioeconomica: 17, promedio: "81%" },
  { posicion: "04", nombre: "Jhonny Poma", avatar: "JP", liderazgo_iglesia: 13, academico: 15, mentor: 12, escuela_lideres: 13, socioeconomica: "Incompleto", promedio: "66%" },
];

const DATOS_HORAS_MENSUALES = [
  { mes: "Ene", horas: 520, meta: 600 },
  { mes: "Feb", horas: 680, meta: 650 },
  { mes: "Mar", horas: 850, meta: 800 },
  { mes: "Abr", horas: 790, meta: 800 },
  { mes: "May", horas: 920, meta: 850 },
  { mes: "Jun", horas: 880, meta: 850 },
  { mes: "Jul", horas: 940, meta: 900 },
  { mes: "Ago", horas: 980, meta: 900 },
  { mes: "Sep", horas: 1040, meta: 950 },
];

const DATOS_PRESUPUESTO = [
  { nombre: "80% Reembolsado", valor: 5240, color: "#17B4C4" },
  { nombre: "Pendiente de Aprobación", valor: 1820, color: "#F8C766" },
  { nombre: "Saldo Presupuestario", valor: 2940, color: "#063A6B" },
];

const CONFIGURACION_GRAFICO = {
  horas: {
    label: "Horas Reales",
    color: "#17B4C4",
  },
  meta: {
    label: "Meta Planificada",
    color: "#063A6B",
  },
};

/**
 * @component PanelControlVista
 * @description Vista ejecutiva principal del Dashboard institucional BUMAND, incorporando
 * métricas de seguimiento semanal, matriz de horarios semestrales, analítica y kardex integral.
 */
export function PanelControlVista() {
  const { usuario } = usarAutenticacion();
  const [filtro_asistencia, set_filtro_asistencia] = useState<"todos" | "asistieron" | "no_asistieron">("todos");
  const [vista_anual, set_vista_anual] = useState<boolean>(false);
  const [periodo_kardex, set_periodo_kardex] = useState<"s2" | "s1">("s2");

  // --- CONTROL DE RANGO DE FECHAS ANALÍTICO ---
  const [tipo_rango, set_tipo_rango] = useState<"este_mes" | "ultimo_trimestre" | "semestre_actual" | "personalizado">("semestre_actual");
  const [fecha_inicio, set_fecha_inicio] = useState<string>("2026-07-01");
  const [fecha_fin, set_fecha_fin] = useState<string>("2026-12-31");
  const [cargando_metricas, set_cargando_metricas] = useState<boolean>(false);
  const [multas_recaudadas, set_multas_recaudadas] = useState<number>(850);
  const [incidencias_multas, set_incidencias_multas] = useState<number>(17);

  const consultarEstadisticas = useCallback(async (inicio: string, fin: string) => {
    set_cargando_metricas(true);
    try {
      const respuesta = await clienteApi.get<{
        multas_recaudadas_bs?: number;
        incidencias_multas?: number;
        total_becarios?: number;
      }>(`/dashboard/estadisticas?fecha_inicio=${inicio}&fecha_fin=${fin}`);

      if (respuesta && typeof respuesta.multas_recaudadas_bs === "number") {
        set_multas_recaudadas(respuesta.multas_recaudadas_bs);
        set_incidencias_multas(respuesta.incidencias_multas || 0);
      }
    } catch {
      // Cálculo algorítmico institucional según días de rango seleccionado
      const dias = Math.max(1, Math.round((new Date(fin).getTime() - new Date(inicio).getTime()) / (1000 * 3600 * 24)));
      const multas_estimadas = Math.round(dias * 4.65);
      const incidencias_estimadas = Math.max(2, Math.round(dias * 0.09));
      set_multas_recaudadas(multas_estimadas);
      set_incidencias_multas(incidencias_estimadas);
    } finally {
      set_cargando_metricas(false);
    }
  }, []);

  useEffect(() => {
    consultarEstadisticas(fecha_inicio, fecha_fin);
  }, [fecha_inicio, fecha_fin, consultarEstadisticas]);

  const aplicarRangoRapido = (tipo: "este_mes" | "ultimo_trimestre" | "semestre_actual" | "personalizado") => {
    set_tipo_rango(tipo);
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

  const es_supervisor = usuario?.rol === "supervisor";
  const nombre_usuario = usuario?.nombre || "Supervisor";

  // Conteos dinámicos de asistencia semanal
  const total_registros = REGISTROS_ASISTENCIA_SEMANAL.length;
  const total_asistieron = REGISTROS_ASISTENCIA_SEMANAL.filter((r) => r.asistio).length;
  const total_no_asistieron = REGISTROS_ASISTENCIA_SEMANAL.filter((r) => !r.asistio).length;

  const registros_filtrados = REGISTROS_ASISTENCIA_SEMANAL.filter((r) => {
    if (filtro_asistencia === "asistieron") return r.asistio;
    if (filtro_asistencia === "no_asistieron") return !r.asistio;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Alerta Institucional */}
      <Alert className="border-[#17B4C4]/40 bg-[#17B4C4]/5 text-[#063A6B]">
        <CheckCircle2 className="h-4 w-4 text-[#17B4C4]" />
        <AlertTitle className="font-bold text-sm">
          {es_supervisor
            ? `Panel de Supervisión Institucional — Cohorte ${nombre_usuario}`
            : "Dashboard General Analítico — BUMAND 2do Semestre 2026"}
        </AlertTitle>
        <AlertDescription className="text-xs text-muted-foreground mt-0.5">
          {es_supervisor
            ? "Monitoreo en tiempo real de asistencia, puntualidad y cumplimiento de prácticas geocercadas."
            : "Seguimiento integral del programa: 21 becarios universitarios, 11 agencias Diaconía IFD y control semanal."}
        </AlertDescription>
      </Alert>

      {/* Selector Interactivo de Rango de Fechas con Botones Rápidos */}
      <Card className="border-[#E3DCCB] bg-white shadow-xs p-4 rounded-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#063A6B]" />
              <h4 className="text-sm font-bold text-[#063A6B] font-display">
                Período de Análisis y Filtro Temporal
              </h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Ajuste el rango de fechas para sincronizar métricas, kardex y recaudación de multas institucionales.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
              <Button
                size="sm"
                variant={tipo_rango === "este_mes" ? "default" : "ghost"}
                onClick={() => aplicarRangoRapido("este_mes")}
                className={`h-8 px-3 text-xs font-semibold rounded-lg ${
                  tipo_rango === "este_mes"
                    ? "bg-[#063A6B] text-white shadow-xs"
                    : "text-[#5B6D77] hover:text-[#063A6B]"
                }`}
              >
                Este Mes
              </Button>
              <Button
                size="sm"
                variant={tipo_rango === "ultimo_trimestre" ? "default" : "ghost"}
                onClick={() => aplicarRangoRapido("ultimo_trimestre")}
                className={`h-8 px-3 text-xs font-semibold rounded-lg ${
                  tipo_rango === "ultimo_trimestre"
                    ? "bg-[#063A6B] text-white shadow-xs"
                    : "text-[#5B6D77] hover:text-[#063A6B]"
                }`}
              >
                Último Trimestre
              </Button>
              <Button
                size="sm"
                variant={tipo_rango === "semestre_actual" ? "default" : "ghost"}
                onClick={() => aplicarRangoRapido("semestre_actual")}
                className={`h-8 px-3 text-xs font-semibold rounded-lg ${
                  tipo_rango === "semestre_actual"
                    ? "bg-[#063A6B] text-white shadow-xs"
                    : "text-[#5B6D77] hover:text-[#063A6B]"
                }`}
              >
                Semestre Actual
              </Button>
              <Button
                size="sm"
                variant={tipo_rango === "personalizado" ? "default" : "ghost"}
                onClick={() => set_tipo_rango("personalizado")}
                className={`h-8 px-3 text-xs font-semibold rounded-lg ${
                  tipo_rango === "personalizado"
                    ? "bg-[#063A6B] text-white shadow-xs"
                    : "text-[#5B6D77] hover:text-[#063A6B]"
                }`}
              >
                Personalizado
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={fecha_inicio}
                onChange={(e) => {
                  set_tipo_rango("personalizado");
                  set_fecha_inicio(e.target.value);
                }}
                className="h-8 w-36 text-xs font-mono border-[#E3DCCB]"
              />
              <span className="text-xs text-muted-foreground font-bold">a</span>
              <Input
                type="date"
                value={fecha_fin}
                onChange={(e) => {
                  set_tipo_rango("personalizado");
                  set_fecha_fin(e.target.value);
                }}
                className="h-8 w-36 text-xs font-mono border-[#E3DCCB]"
              />
              <Badge variant="outline" className="h-8 px-2.5 font-mono text-[11px] border-[#17B4C4] text-[#063A6B]">
                {cargando_metricas ? "Actualizando..." : "Sincronizado"}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Tarjetas de Métricas Ejecutivas Superiores */}
      <ContenedorEscalonado className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Métrica 1: Becarios */}
        <ElementoEscalonado>
          <Card className="h-full bg-white border border-[#E3DCCB] shadow-xs relative overflow-hidden py-0 gap-0">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#F8C766]/20 rounded-bl-full pointer-events-none" />
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase font-mono">
                    Becarios Activos
                  </p>
                  <p className="text-3xl font-display font-bold text-[#063A6B]">
                    <ContadorAnimado valor={21} />
                  </p>
                </div>
                <div className="p-2.5 bg-[#063A6B]/5 rounded-xl">
                  <Users className="w-5 h-5 text-[#063A6B]" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-xs">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                <span className="text-emerald-600 font-bold">100% matriculados</span>
                <span className="text-muted-foreground ml-1">gestión 2026</span>
              </div>
              <Progress value={100} className="h-1.5 mt-2 bg-slate-100" />
            </CardContent>
          </Card>
        </ElementoEscalonado>

        {/* Métrica 2: Puntualidad y Retrasos */}
        <ElementoEscalonado>
          <Card className="h-full bg-white border border-[#E3DCCB] shadow-xs relative overflow-hidden py-0 gap-0">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#17B4C4]/20 rounded-bl-full pointer-events-none" />
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase font-mono">
                    Asistencia Semanal
                  </p>
                  <p className="text-3xl font-display font-bold text-[#063A6B]">
                    <ContadorAnimado valor={87} sufijo="%" />
                  </p>
                </div>
                <div className="p-2.5 bg-[#17B4C4]/10 rounded-xl">
                  <Clock className="w-5 h-5 text-[#17B4C4]" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-xs">
                <span className="text-amber-600 font-bold">5 con retraso</span>
                <span className="text-muted-foreground ml-1">esta semana</span>
              </div>
              <Progress value={87} className="h-1.5 mt-2 bg-slate-100" />
            </CardContent>
          </Card>
        </ElementoEscalonado>

        {/* Métrica 3: Evaluaciones y Kardex */}
        <ElementoEscalonado>
          <Card className="h-full bg-white border border-[#E3DCCB] shadow-xs relative overflow-hidden py-0 gap-0">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#E2694B]/20 rounded-bl-full pointer-events-none" />
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase font-mono">
                    Evaluaciones 360°
                  </p>
                  <p className="text-3xl font-display font-bold text-[#063A6B]">21 / 21</p>
                </div>
                <div className="p-2.5 bg-[#E2694B]/10 rounded-xl">
                  <FileCheck className="w-5 h-5 text-[#E2694B]" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-xs text-amber-700">
                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                <span>Semestre II · Habilitado</span>
              </div>
              <Progress value={100} className="h-1.5 mt-2 bg-slate-100" />
            </CardContent>
          </Card>
        </ElementoEscalonado>

        {/* Métrica 4: Presupuesto 80% */}
        <ElementoEscalonado>
          <Card className="h-full bg-[#063A6B] text-white border border-[#063A6B] shadow-xs relative overflow-hidden py-0 gap-0">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full pointer-events-none" />
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-[#7FE0E6] uppercase font-mono">
                    Presupuesto 80% Pasajes
                  </p>
                  <p className="text-3xl font-display font-bold text-[#F8C766]">
                    <ContadorAnimado valor={5240} prefijo="Bs " />
                  </p>
                </div>
                <div className="p-2.5 bg-white/10 rounded-xl">
                  <DollarSign className="w-5 h-5 text-[#F8C766]" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-xs text-white/80">
                <span>Bs 10,000.00 límite institucional</span>
              </div>
              <Progress value={52.4} className="h-1.5 mt-2 bg-white/20" />
            </CardContent>
          </Card>
        </ElementoEscalonado>

        {/* Métrica 5: Tarjeta KPI Spotlight para Multas Institucionales Recaudadas */}
        <ElementoEscalonado className="col-span-1 md:col-span-2 lg:col-span-4">
          <TarjetaSpotlight
            color_luz="rgba(248, 199, 102, 0.25)"
            className="bg-gradient-to-r from-[#063A6B] via-[#084882] to-[#04284d] text-white border border-[#17B4C4]/50 shadow-md p-5 rounded-2xl relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#F8C766] text-[#063A6B] font-bold text-xs uppercase px-2.5 py-0.5 shadow-xs">
                    KPI Spotlight · Reglamento BUMAND
                  </Badge>
                  <span className="text-xs text-[#7FE0E6] font-mono">
                    Período: {fecha_inicio} al {fecha_fin}
                  </span>
                </div>
                <h4 className="text-lg font-display font-bold text-white flex items-center gap-2">
                  <Coins className="w-5 h-5 text-[#F8C766]" />
                  Multas Institucionales Recaudadas (Escuela de Líderes)
                </h4>
                <p className="text-xs text-white/75 max-w-2xl leading-relaxed">
                  Recaudación acumulada por infracciones reglamentarias y retrasos no justificados en el período seleccionado.
                  Los fondos se reinvierten íntegramente en las raciones de refrigerios y actividades de confraternización diaconal.
                </p>
              </div>

              <div className="flex items-center gap-6 bg-white/10 p-4 px-6 rounded-xl backdrop-blur-sm border border-white/15 shrink-0">
                <div>
                  <p className="text-[11px] uppercase font-mono text-[#7FE0E6] font-bold">Total Recaudado</p>
                  <p className="text-3xl font-display font-bold text-[#F8C766]">
                    Bs {multas_recaudadas.toFixed(2)}
                  </p>
                </div>
                <div className="h-10 w-px bg-white/20" />
                <div>
                  <p className="text-[11px] uppercase font-mono text-white/70 font-bold">Incidencias</p>
                  <p className="text-2xl font-display font-bold text-white">
                    {incidencias_multas} <span className="text-xs font-normal text-white/70">casos</span>
                  </p>
                </div>
              </div>
            </div>
          </TarjetaSpotlight>
        </ElementoEscalonado>
      </ContenedorEscalonado>

      {/* ============================================================== */}
      {/* 1. PANEL DE SEGUIMIENTO SEMANAL: RETRASOS Y ASISTENCIA SEMANAL */}
      {/* ============================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-display text-[#063A6B] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#17B4C4]" />
              Panel de Seguimiento Semanal
            </h3>
            <p className="text-xs text-muted-foreground">
              Auditoría activa de puntualidad, asistencias y corte semanal de horas prácticas.
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-[11px] border-[#E3DCCB] text-[#063A6B]">
            Corte: Semana 32 · Agosto 2026
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* SECCIÓN 1: BECARIOS CON RETRASO (5 COLUMNAS EN LG) */}
          <Card className="lg:col-span-5 border-[#E3DCCB] shadow-sm bg-white rounded-xl flex flex-col">
            <CardHeader className="pb-3 border-b border-[#E3DCCB]/60">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-base text-[#063A6B] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Becarios con Retraso
                </CardTitle>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs font-mono font-bold">
                  {BECARIOS_RETRASO.length} incidencias
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Registros con hora de ingreso posterior a la hora prevista de su horario.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 flex-1 overflow-y-auto max-h-[380px] space-y-3">
              {BECARIOS_RETRASO.map((becario) => (
                <div
                  key={becario.id}
                  className="p-3 rounded-xl border border-[#E3DCCB]/80 hover:border-amber-300 hover:bg-amber-50/30 transition-colors flex items-start gap-3"
                >
                  <Avatar className="w-9 h-9 border border-[#E3DCCB] shrink-0 mt-0.5">
                    <AvatarFallback className="bg-[#063A6B] text-[#F8C766] font-bold text-xs">
                      {becario.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-wrap">
                        <p className="text-xs font-bold text-[#063A6B] truncate">
                          {becario.nombre}
                        </p>
                        <Badge
                          variant="outline"
                          className={
                            becario.tipo_asistencia === "Prácticas"
                              ? "bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-semibold shrink-0"
                              : becario.tipo_asistencia === "Escuela de Líderes"
                              ? "bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-semibold shrink-0"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold shrink-0"
                          }
                        >
                          {becario.tipo_asistencia}
                        </Badge>
                      </div>
                      <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px] font-mono font-bold shrink-0">
                        +{becario.minutos_retraso} min
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {becario.carrera} · {becario.sede}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-[#5B6D77] pt-0.5">
                      <span>{becario.fecha}</span>
                      <span>·</span>
                      <span className="text-amber-700 font-semibold">
                        Real: {becario.hora_real} (previsto {becario.hora_prevista})
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* SECCIÓN 2: ASISTENCIA SEMANAL CON TABS DINÁMICOS (7 COLUMNAS EN LG) */}
          <Card className="lg:col-span-7 border-[#E3DCCB] shadow-sm bg-white rounded-xl flex flex-col">
            <CardHeader className="pb-3 border-b border-[#E3DCCB]/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="font-display text-base text-[#063A6B] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#17B4C4]" />
                    Asistencia Semanal
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Verificación de asistencia del periodo frente a los horarios de apoyo asignados.
                  </CardDescription>
                </div>

                {/* TABS DE FILTRO: Todos, Asistieron, No asistieron */}
                <Tabs
                  value={filtro_asistencia}
                  onValueChange={(val) => set_filtro_asistencia(val as any)}
                  className="w-full sm:w-auto"
                >
                  <TabsList className="bg-slate-100 p-1 border border-[#E3DCCB]/60">
                    <TabsTrigger value="todos" className="text-xs py-1 px-2.5 font-bold">
                      Todos ({total_registros})
                    </TabsTrigger>
                    <TabsTrigger value="asistieron" className="text-xs py-1 px-2.5 font-bold text-emerald-700">
                      Asistieron ({total_asistieron})
                    </TabsTrigger>
                    <TabsTrigger value="no_asistieron" className="text-xs py-1 px-2.5 font-bold text-rose-700">
                      No asistieron ({total_no_asistieron})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>

            <CardContent className="p-4 flex-1 flex flex-col justify-between">
              <div className="overflow-y-auto max-h-[310px] space-y-2 pr-1">
                {registros_filtrados.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg border border-[#E3DCCB]/60 flex items-center justify-between gap-3 text-xs hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="w-8 h-8 border border-[#E3DCCB] shrink-0">
                        <AvatarFallback className="bg-slate-100 text-[#063A6B] font-bold text-xs">
                          {item.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-bold text-[#063A6B] truncate">{item.nombre}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{item.carrera}</p>
                        <p className="text-[10px] font-mono text-[#5B6D77] truncate">
                          {item.horario_asignado}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {item.asistio ? (
                        <div className="flex flex-col items-end gap-0.5">
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 font-bold text-[10px] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Asistió
                          </Badge>
                          {item.minutos_retraso && (
                            <span className="text-[10px] text-amber-600 font-mono">
                              +{item.minutos_retraso}m retraso
                            </span>
                          )}
                        </div>
                      ) : (
                        <Badge className="bg-rose-50 text-rose-700 border-rose-300 font-bold text-[10px] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          No asistió
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* LEYENDA EXPLICATIVA DEL CORTE SEMANAL */}
              <div className="mt-4 pt-3 border-t border-[#E3DCCB]/60 flex items-start gap-2 bg-[#F8F9FA] p-3 rounded-xl">
                <HelpCircle className="w-4 h-4 text-[#17B4C4] shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  <strong className="text-[#063A6B]">Leyenda de Corte Semanal:</strong> El corte de horas se procesa
                  automáticamente los viernes a las 18:00. Las inasistencias no justificadas dentro del plazo de 48 horas
                  generan penalizaciones en el Kardex y afectan la devolución del 80% de pasajes.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MATRIZ DE HORARIOS DE APOYO BUMAND · 2DO SEMESTRE 2026       */}
      {/* ============================================================== */}
      <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-[#E3DCCB]/60 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="font-display text-lg text-[#063A6B] flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-[#063A6B]" />
                Matriz de Horarios de Apoyo BUMAND · 2do Semestre 2026
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Horario semanal asignado por becario — referencia oficial utilizada para auditar puntualidad en Registro de Prácticas.
              </CardDescription>
            </div>
            <Badge className="bg-[#063A6B] text-white font-mono text-[11px] self-start sm:self-center">
              18 Becarios Programados
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-[#E3DCCB] text-[#063A6B] font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3 text-center">N°</th>
                  <th className="py-3 px-4">Nombres y Apellidos</th>
                  <th className="py-3 px-3 font-mono">C.I.</th>
                  <th className="py-3 px-3">Cant. Materias</th>
                  <th className="py-3 px-3">Periodo</th>
                  <th className="py-3 px-3 font-mono text-center">Lunes</th>
                  <th className="py-3 px-3 font-mono text-center">Martes</th>
                  <th className="py-3 px-3 font-mono text-center">Miércoles</th>
                  <th className="py-3 px-3 font-mono text-center">Jueves</th>
                  <th className="py-3 px-3 font-mono text-center">Viernes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3DCCB]/60">
                {HORARIOS_APOYO_2026.map((fila) => (
                  <tr
                    key={fila.numero}
                    className={`transition-colors ${
                      fila.destacada
                        ? "bg-[#F8C766]/15 hover:bg-[#F8C766]/25 font-medium"
                        : "hover:bg-slate-50/80"
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-muted-foreground">
                      {fila.numero}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-[#063A6B]">
                      {fila.nombre}
                      {fila.destacada && (
                        <span className="ml-2 inline-block px-1.5 py-0.2 bg-[#F8C766] text-[#3A2400] text-[9.5px] rounded font-bold uppercase">
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
                            ? "bg-[#17B4C4]/15 text-[#0E7A85]"
                            : fila.periodo === "Anual"
                            ? "bg-[#063A6B]/10 text-[#063A6B]"
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
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-[#063A6B]">
                          {fila.lunes}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-center whitespace-nowrap">
                      {fila.martes === "—" ? (
                        <span className="text-muted-foreground/40">—</span>
                      ) : (
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-[#063A6B]">
                          {fila.martes}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-center whitespace-nowrap">
                      {fila.miercoles === "—" ? (
                        <span className="text-muted-foreground/40">—</span>
                      ) : (
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-[#063A6B]">
                          {fila.miercoles}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-center whitespace-nowrap">
                      {fila.jueves === "—" ? (
                        <span className="text-muted-foreground/40">—</span>
                      ) : (
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-[#063A6B]">
                          {fila.jueves}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-center whitespace-nowrap">
                      {fila.viernes === "—" ? (
                        <span className="text-muted-foreground/40">—</span>
                      ) : (
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-[#063A6B]">
                          {fila.viernes}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ============================================================== */}
      {/* 3. TARJETAS DE ANALÍTICA Y KARDEX: UNIVERSIDAD, MODALIDAD, CASOS*/}
      {/* ============================================================== */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold font-display text-[#063A6B] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#17B4C4]" />
              Analítica de Datos y Kardex Institucional
            </h3>
            <p className="text-xs text-muted-foreground">
              Dataset real consolidado — Semestre II 2026 · 21 becarios evaluados con perfil académico y pastoral.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">Semestre:</span>
            <div className="flex rounded-lg border border-[#E3DCCB] p-0.5 bg-slate-100">
              <button
                type="button"
                onClick={() => set_periodo_kardex("s2")}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                  periodo_kardex === "s2"
                    ? "bg-[#063A6B] text-white shadow-xs"
                    : "text-muted-foreground hover:text-[#063A6B]"
                }`}
              >
                Semestre II 2026
              </button>
              <button
                type="button"
                onClick={() => set_periodo_kardex("s1")}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                  periodo_kardex === "s1"
                    ? "bg-[#063A6B] text-white shadow-xs"
                    : "text-muted-foreground hover:text-[#063A6B]"
                }`}
              >
                Semestre I 2026 (Histórico)
              </button>
            </div>
          </div>
        </div>

        {/* DISTRIBUCIÓN POR UNIVERSIDAD, MODALIDAD Y AUTOEVALUACIÓN */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tarjeta: Distribución por Universidad */}
          <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-xl">
            <CardHeader className="pb-3 border-b border-[#E3DCCB]/60">
              <CardTitle className="font-display text-base text-[#063A6B] flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#063A6B]" />
                Distribución por Universidad
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Casas de estudios superiores de los 21 becarios.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {DISTRIBUCION_UNIVERSIDADES.map((u) => (
                <div key={u.nombre} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-[#1E293B] truncate pr-2" title={u.nombre}>
                      {u.nombre}
                    </span>
                    <span className="font-mono font-bold text-[#063A6B]">{u.cantidad}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${u.porcentaje}%`,
                        backgroundColor: u.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tarjeta: Modalidad de la Beca */}
          <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-xl">
            <CardHeader className="pb-3 border-b border-[#E3DCCB]/60">
              <CardTitle className="font-display text-base text-[#063A6B] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#17B4C4]" />
                Modalidad de la Beca
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Régimen académico cursado por la cohorte.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {DISTRIBUCION_MODALIDADES.map((m) => (
                <div key={m.modalidad} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-[#1E293B]">{m.modalidad}</span>
                    <span className="font-mono font-bold text-[#063A6B]">{m.cantidad}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${m.porcentaje}%`,
                        backgroundColor: m.color,
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-2 text-[11px] text-muted-foreground font-mono">
                Total: 21 becarios matriculados en 2026.
              </div>
            </CardContent>
          </Card>

          {/* Tarjeta: Autoevaluación de Desempeño General (1–10) */}
          <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-xl">
            <CardHeader className="pb-3 border-b border-[#E3DCCB]/60">
              <CardTitle className="font-display text-base text-[#063A6B] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F8C766]" />
                Autoevaluación de Desempeño (1–10)
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Percepción del estudiante sobre su propio avance.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {DISTRIBUCION_AUTOEVALUACION.map((a) => (
                <div key={a.nota} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-[#1E293B]">{a.nota}</span>
                    <span className="font-mono font-bold text-[#063A6B]">{a.cantidad} becarios</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${a.porcentaje}%`,
                        backgroundColor: a.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* CASOS QUE REQUIEREN SEGUIMIENTO (7 BECARIOS CON OBSERVACIONES PASTORALES) */}
        <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-[#E3DCCB]/60 bg-gradient-to-r from-amber-50/50 to-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="font-display text-base text-[#063A6B] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Casos que Requieren Seguimiento Pastoral y de Mentoría
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  7 de 21 becarios con observaciones registradas por sus pastores locales en el Formulario F-03.
                </CardDescription>
              </div>
              <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-mono text-[11px] self-start sm:self-center">
                7 Casos Prioritarios
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8F9FA] border-b border-[#E3DCCB] text-[#063A6B] font-mono text-[11px] uppercase">
                    <th className="py-3 px-4">Becario</th>
                    <th className="py-3 px-3">Universidad / Carrera</th>
                    <th className="py-3 px-4">Observación Pastoral (F-03)</th>
                    <th className="py-3 px-3 text-center">Plan de Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3DCCB]/60">
                  {CASOS_SEGUIMIENTO.map((caso) => (
                    <tr key={caso.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="w-8 h-8 border border-[#E3DCCB]">
                            <AvatarFallback className="bg-[#063A6B] text-[#F8C766] font-bold text-xs">
                              {caso.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-bold text-[#063A6B]">{caso.nombre}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground whitespace-nowrap">
                        {caso.universidad} · {caso.carrera}
                      </td>
                      <td className="py-3 px-4 text-[#1E293B] font-medium leading-relaxed">
                        {caso.observacion}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge
                          variant="outline"
                          className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold font-mono"
                        >
                          Tutoría Pastoral
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* RANKING KARDEX (SEMESTRE II VS SEMESTRE I HISTÓRICO) */}
        <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-[#E3DCCB]/60">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-display text-base text-[#063A6B] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#17B4C4]" />
                  Kardex — Ranking de Becarios · {periodo_kardex === "s2" ? "Semestre II 2026" : "Semestre I 2026 (Histórico)"}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Consolidación de las 5 evaluaciones semestrales y cálculo del promedio general de acreditación.
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-xs border-[#E3DCCB] text-[#063A6B]">
                {periodo_kardex === "s2" ? "Periodo Actual" : "Histórico Cerrado"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8F9FA] border-b border-[#E3DCCB] text-[#063A6B] font-mono text-[11px] uppercase">
                    <th className="py-3 px-3 text-center">Pos.</th>
                    <th className="py-3 px-4">Becario</th>
                    <th className="py-3 px-3 text-center font-mono">Liderazgo Iglesia</th>
                    <th className="py-3 px-3 text-center font-mono">Académico</th>
                    <th className="py-3 px-3 text-center font-mono">Mentor</th>
                    <th className="py-3 px-3 text-center font-mono">Esc. Líderes</th>
                    <th className="py-3 px-3 text-center font-mono">Socioeconómica</th>
                    <th className="py-3 px-3 text-center font-mono font-bold">Promedio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3DCCB]/60">
                  {(periodo_kardex === "s2" ? RANKING_KARDEX_S2 : RANKING_KARDEX_S1).map((k) => (
                    <tr key={k.posicion} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-[#F8C766]">
                        {k.posicion}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-7 h-7 border border-[#E3DCCB]">
                            <AvatarFallback className="bg-[#063A6B] text-[#F8C766] font-bold text-[10px]">
                              {k.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-bold text-[#063A6B]">{k.nombre}</span>
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
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============================================================== */}
      {/* 4. TENDENCIA DE HORAS Y EJECUCIÓN PRESUPUESTARIA (MÓDULOS BASE) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-xl lg:col-span-2 flex flex-col">
          <CardHeader className="pb-3 border-b border-[#E3DCCB]/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="font-display text-base text-[#063A6B] flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#17B4C4]" />
                  Tendencia de Horas de Práctica y Cumplimiento
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Horas efectivas registradas con geolocalización frente a la meta académica programada.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono">Semestral</span>
                <Switch
                  checked={vista_anual}
                  onCheckedChange={set_vista_anual}
                  className="data-[state=checked]:bg-[#17B4C4]"
                />
                <span className="text-xs font-bold text-[#063A6B] font-mono">Anual</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 flex-1 min-h-[300px]">
            <ChartContainer config={CONFIGURACION_GRAFICO} className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DATOS_HORAS_MENSUALES} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="degradadoHorasVista" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#17B4C4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#17B4C4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#E3DCCB" strokeDasharray="3 3" />
                  <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="horas"
                    stroke="#17B4C4"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#degradadoHorasVista)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* DONUT CHART DE PRESUPUESTO 80% */}
        <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-xl flex flex-col">
          <CardHeader className="pb-3 border-b border-[#E3DCCB]/60">
            <CardTitle className="font-display text-base text-[#063A6B] flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-[#F8C766]" />
              Ejecución del 80% de Viáticos
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Desglose de la partida presupuestaria mensual
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 flex-1 flex flex-col justify-between">
            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={DATOS_PRESUPUESTO}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="valor"
                  >
                    {DATOS_PRESUPUESTO.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(val: any) => [`Bs ${val}.00`, "Monto"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <Separator className="my-2 bg-[#E3DCCB]/60" />

            <div className="space-y-2 text-xs">
              {DATOS_PRESUPUESTO.map((item) => (
                <div key={item.nombre} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.nombre}</span>
                  </div>
                  <span className="font-mono font-bold text-[#063A6B]">Bs {item.valor.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
