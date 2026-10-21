"use client";

import React, { useState, useEffect } from "react";
import {
  Award,
  CheckCircle,
  FileText,
  Upload,
  Printer,
  ShieldCheck,
  AlertCircle,
  UserCheck,
  Calendar,
  Sparkles,
  CheckCircle2,
  BookOpen,
  HeartHandshake,
  CalendarPlus,
  QrCode,
  GraduationCap,
  Users,
  Settings,
  AlertTriangle,
  PenTool,
  RotateCcw,
  Check,
  Table2,
  Building2,
  Eye,
  SlidersHorizontal,
  Layers,
  Scale,
  FileSpreadsheet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import { toast } from "sonner";
import { CriteriosEvaluacionTabla } from "./criterios-evaluacion-tabla";
import { SabanaConsolidadoSemestral } from "./sabana-consolidado-semestral";
import { FormularioF03 } from "./formulario-f03";
import { FirmaDigital } from "./firma-digital";
import { EvaluacionSocioeconomicaVista } from "./evaluacion-socioeconomica-vista";
import {
  BECARIOS_SEMESTRE_II,
  CATALOGO_IGLESIAS_INSTITUCIONALES,
  PREGUNTAS_MENTOR_ESCALA,
  PREGUNTAS_ABIERTAS_MENTOR,
  PREGUNTAS_BIENESTAR_INICIALES,
  RANGOS_APROBACION_OFICIALES,
  CRITERIOS_EVALUACION_OFICIALES,
  BecarioEvaluacionSemestral,
} from "./evaluaciones-datos-semestre";

export interface PeriodoSemestral {
  id: "s2" | "s1";
  titulo: string;
  subtitulo: string;
  rango: string;
  habilitado: boolean;
}

export interface ModuloPonderado {
  id: number;
  clave: "liderazgo" | "academica" | "mentor" | "practicas" | "socioeconomica";
  nombre: string;
  evaluador_rol: string;
  ponderacion_porcentaje: number;
  descripcion: string;
}

const MODULOS_OFICIALES: ModuloPonderado[] = [
  {
    id: 1,
    clave: "liderazgo",
    nombre: "1. Iglesia (Formulario Pastoral F-03)",
    evaluador_rol: "Pastor de la Congregación Local",
    ponderacion_porcentaje: 20,
    descripcion: "Evaluación ministerial de comunión, liderazgo, discipulado y testimonio.",
  },
  {
    id: 2,
    clave: "academica",
    nombre: "2. Académica (Récord & Historial, Meta ≥ 75 Pts)",
    evaluador_rol: "Kárdex Universitario y Tutor",
    ponderacion_porcentaje: 20,
    descripcion: "Certificado oficial de calificaciones. Cumplimiento contractual institucional.",
  },
  {
    id: 3,
    clave: "mentor",
    nombre: "3. Mentor / Supervisor vía QR (21 Preguntas)",
    evaluador_rol: "Supervisor Diaconía y Mentor en Terreno",
    ponderacion_porcentaje: 20,
    descripcion: "18 reactivos en escala 1-10 más 3 preguntas abiertas de desempeño laboral.",
  },
  {
    id: 4,
    clave: "practicas",
    nombre: "4. Escuela de Líderes (Viernes y 12 Tareas CETI)",
    evaluador_rol: "Coordinación CETI / Asistencia",
    ponderacion_porcentaje: 20,
    descripcion: "12 tareas teológicas y registro de asistencia presencial a los encuentros.",
  },
  {
    id: 5,
    clave: "socioeconomica",
    nombre: "5. Socioeconómica (Bienestar Universitario 26P)",
    evaluador_rol: "Trabajo Social",
    ponderacion_porcentaje: 20,
    descripcion: "Diagnóstico socioeconómico de 26 preguntas y Semáforo de Vulnerabilidad.",
  },
];

const TAREAS_CETI_CATALOGO = [
  { numero: 1, tema: "Liderazgo Servidor y Mayordomía Cristiana", ponderacion: "8.33%" },
  { numero: 2, tema: "Misión Integral y Vocación Diaconal", ponderacion: "8.33%" },
  { numero: 3, tema: "Ética Profesional en el Ámbito Financiero y Social", ponderacion: "8.33%" },
  { numero: 4, tema: "Acompañamiento a Grupos Vulnerables", ponderacion: "8.33%" },
  { numero: 5, tema: "Resolución de Conflictos en la Comunidad Eclesial", ponderacion: "8.33%" },
  { numero: 6, tema: "Diseño y Planificación de Proyectos de Servicio", ponderacion: "8.33%" },
  { numero: 7, tema: "Oración, Intercesión y Vida Devocional Comunitaria", ponderacion: "8.33%" },
  { numero: 8, tema: "Comunicación Asertiva y Testimonio Universitario", ponderacion: "8.33%" },
  { numero: 9, tema: "Finanzas Personales Bíblicas y Responsabilidad", ponderacion: "8.33%" },
  { numero: 10, tema: "Salud Mental y Manejo del Estrés en Época Académica", ponderacion: "8.33%" },
  { numero: 11, tema: "Discipulado Generacional y Mentoría a Nuevos Becarios", ponderacion: "8.33%" },
  { numero: 12, tema: "Evaluación Integral de Impacto Comunitario", ponderacion: "8.33%" },
];

interface EvaluacionesVistaProps {
  pestaña_inicial?: string;
}

export function EvaluacionesVista({ pestaña_inicial = "consolidado" }: EvaluacionesVistaProps) {
  const { usuario } = usarAutenticacion();
  const es_admin = usuario?.rol === "administrador";
  const es_supervisor = usuario?.rol === "supervisor";

  const [pestaña_activa, set_pestaña_activa] = useState<string>(pestaña_inicial);

  useEffect(() => {
    if (pestaña_inicial) {
      set_pestaña_activa(pestaña_inicial);
    }
  }, [pestaña_inicial]);

  // Periodos Semestrales
  const [periodos, set_periodos] = useState<PeriodoSemestral[]>([
    {
      id: "s2",
      titulo: "Semestre II · 2026",
      subtitulo: "Periodo actual — julio a diciembre",
      rango: "Julio – Diciembre 2026",
      habilitado: true,
    },
    {
      id: "s1",
      titulo: "Semestre I · 2026",
      subtitulo: "Cerrado — enero a junio",
      rango: "Enero – Junio 2026",
      habilitado: false,
    },
  ]);
  const [periodo_activo, set_periodo_activo] = useState<"s2" | "s1">("s2");

  // Ponderaciones oficiales (Base 20% adaptable)
  const [modulos, set_modulos] = useState<ModuloPonderado[]>(MODULOS_OFICIALES);
  const [panel_ponderacion_abierto, set_panel_ponderacion_abierto] = useState<boolean>(false);
  const [ponderacion_temporal, set_ponderacion_temporal] = useState<Record<string, number>>({
    liderazgo: 20,
    academica: 20,
    mentor: 20,
    practicas: 20,
    socioeconomica: 20,
  });

  // Firma Digital Institucional Canvas
  const [firma_supervisor, set_firma_supervisor] = useState<string | null>(null);
  const [dialogo_firma_abierto, set_dialogo_firma_abierto] = useState<boolean>(false);

  // Estados para Diálogos Modales de Vista Previa (Preview)
  const [modal_preview_f03_abierto, set_modal_preview_f03_abierto] = useState<boolean>(false);
  const [modal_preview_academica_abierto, set_modal_preview_academica_abierto] = useState<boolean>(false);
  const [modal_preview_mentor_abierto, set_modal_preview_mentor_abierto] = useState<boolean>(false);
  const [modal_preview_lideres_abierto, set_modal_preview_lideres_abierto] = useState<boolean>(false);
  const [modal_preview_socioeconomica_abierto, set_modal_preview_socioeconomica_abierto] = useState<boolean>(false);
  const [modal_qr_mentor_abierto, set_modal_qr_mentor_abierto] = useState<boolean>(false);

  // Modal para inspeccionar expediente de un becario de la sábana
  const [becario_inspeccionado, set_becario_inspeccionado] = useState<BecarioEvaluacionSemestral | null>(null);

  // Modal apertura de nuevo semestre
  const [modal_nuevo_semestre_abierto, set_modal_nuevo_semestre_abierto] = useState(false);
  const [nuevo_titulo, set_nuevo_titulo] = useState("Semestre I · 2027");
  const [nuevo_subtitulo, set_nuevo_subtitulo] = useState("Apertura institucional 2027");
  const [nuevo_rango, set_nuevo_rango] = useState("Enero – Junio 2027");

  // Configuración de campos F-03: Conexión a Catálogo
  const [campo_iglesia_conectado, set_campo_iglesia_conectado] = useState<boolean>(true);
  const [campo_pastor_conectado, set_campo_pastor_conectado] = useState<boolean>(true);

  // Métricas Administrativas Oficiales del Semestre II (21 Becarios)
  const total_becarios = BECARIOS_SEMESTRE_II.length;
  const becarios_optimos = BECARIOS_SEMESTRE_II.filter((b) => b.total >= 70).length;
  const becarios_condicionados = BECARIOS_SEMESTRE_II.filter((b) => b.total >= 51 && b.total < 70).length;
  const becarios_reprobados = BECARIOS_SEMESTRE_II.filter((b) => b.total < 51).length;

  const suma_ponderaciones = Object.values(ponderacion_temporal).reduce((a, b) => a + b, 0);
  const ponderaciones_validas = suma_ponderaciones === 100;
  const periodo_actual_info = periodos.find((p) => p.id === periodo_activo) || periodos[0];

  const alternarEstadoPeriodo = (id_periodo: "s2" | "s1", e: React.MouseEvent) => {
    e.stopPropagation();
    set_periodos((prev) =>
      prev.map((p) => {
        if (p.id === id_periodo) {
          const nuevo_estado = !p.habilitado;
          toast.success(
            nuevo_estado ? `Período ${p.titulo} habilitado` : `Período ${p.titulo} cerrado`,
            { description: nuevo_estado ? "Recepción de expedientes activada." : "El ciclo pasa a modo histórico de solo lectura." }
          );
          return { ...p, habilitado: nuevo_estado };
        }
        return p;
      })
    );
  };

  const manejarCrearNuevoSemestre = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevo_titulo.trim()) return;
    toast.success(`Nuevo período "${nuevo_titulo}" habilitado exitosamente`, {
      description: `Rango: ${nuevo_rango} con ponderación base oficial al 20%.`,
    });
    set_modal_nuevo_semestre_abierto(false);
  };

  const manejarGuardarPonderaciones = () => {
    if (!ponderaciones_validas) {
      toast.error(`La suma debe ser exactamente 100%. Actual: ${suma_ponderaciones}%.`);
      return;
    }
    set_modulos((prev) =>
      prev.map((m) => ({
        ...m,
        ponderacion_porcentaje: ponderacion_temporal[m.clave] ?? m.ponderacion_porcentaje,
      }))
    );
    toast.success("Ponderaciones oficiales actualizadas exitosamente (Suma exacta del 100%).");
    set_panel_ponderacion_abierto(false);
  };

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* BARRA DE PESTAÑAS (TABS) SUPERIOR LIMPIA (SIN REDUNDANCIA)    */}
      {/* ============================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => set_pestaña_activa("consolidado")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              pestaña_activa === "consolidado"
                ? "bg-[#063A6B] text-white shadow-xs"
                : "text-slate-700 hover:text-[#063A6B] hover:bg-white/80"
            }`}
          >
            <Table2 className="w-3.5 h-3.5 text-[#F8C766]" />
            <span>Sábana Consolidada</span>
            <span className={`text-[10px] font-mono px-1.5 py-0 rounded-full font-bold ${
              pestaña_activa === "consolidado" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
            }`}>
              {total_becarios}
            </span>
          </button>

          <button
            type="button"
            onClick={() => set_pestaña_activa("iglesia_f03")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              pestaña_activa === "iglesia_f03"
                ? "bg-[#063A6B] text-white shadow-xs"
                : "text-slate-700 hover:text-[#063A6B] hover:bg-white/80"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#17B4C4]" />
            <span>1. Iglesia (F-03)</span>
          </button>

          <button
            type="button"
            onClick={() => set_pestaña_activa("academica")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              pestaña_activa === "academica"
                ? "bg-[#063A6B] text-white shadow-xs"
                : "text-slate-700 hover:text-[#063A6B] hover:bg-white/80"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-[#17B4C4]" />
            <span>2. Académica (≥75)</span>
          </button>

          <button
            type="button"
            onClick={() => set_pestaña_activa("mentor")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              pestaña_activa === "mentor"
                ? "bg-[#063A6B] text-white shadow-xs"
                : "text-slate-700 hover:text-[#063A6B] hover:bg-white/80"
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-[#17B4C4]" />
            <span>3. Mentor (QR)</span>
          </button>

          <button
            type="button"
            onClick={() => set_pestaña_activa("lideres")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              pestaña_activa === "lideres"
                ? "bg-[#063A6B] text-white shadow-xs"
                : "text-slate-700 hover:text-[#063A6B] hover:bg-white/80"
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#17B4C4]" />
            <span>4. Escuela de Líderes</span>
          </button>

          <button
            type="button"
            onClick={() => set_pestaña_activa("socioeconomica")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              pestaña_activa === "socioeconomica"
                ? "bg-[#063A6B] text-white shadow-xs"
                : "text-slate-700 hover:text-[#063A6B] hover:bg-white/80"
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5 text-[#17B4C4]" />
            <span>5. Socioeconómica (26P)</span>
          </button>

          <button
            type="button"
            onClick={() => set_pestaña_activa("periodos")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              pestaña_activa === "periodos"
                ? "bg-[#063A6B] text-white shadow-xs"
                : "text-slate-700 hover:text-[#063A6B] hover:bg-white/80"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-[#17B4C4]" />
            <span>Ponderaciones y Criterios</span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-2 shrink-0">
          <Badge variant="outline" className="font-mono text-xs border-slate-300 text-[#063A6B] bg-white px-2.5 py-1 font-bold">
            {periodo_actual_info.titulo}
          </Badge>
          {es_admin && (
            <Button
              size="sm"
              onClick={() => set_modal_nuevo_semestre_abierto(true)}
              className="h-8 px-3 bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold rounded-xl text-xs gap-1.5 shadow-xs"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-[#F8C766]" />
              Nuevo Semestre
            </Button>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: SÁBANA CONSOLIDADA OFICIAL (METRICAS REALES)           */}
      {/* ============================================================== */}
      {pestaña_activa === "consolidado" && (
        <div className="space-y-6">
          {/* Métricas Administrativas Oficiales del Semestre II */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Total Becarios Titulares */}
            <Card className="border-[#E3DCCB] bg-gradient-to-br from-[#063A6B] to-[#04284d] text-white rounded-2xl shadow-xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[11px] font-mono text-[#7FE0E6] uppercase font-bold tracking-wider">
                    Becarios en Programa
                  </p>
                  <h3 className="text-3xl font-display font-bold text-[#F8C766]">
                    {total_becarios} <span className="text-sm font-normal text-white/70">titulares</span>
                  </h3>
                  <p className="text-xs text-white/90 font-medium pt-0.5">
                    100% Expedientes Semestre II
                  </p>
                </div>
                <div className="p-3 bg-white/10 rounded-2xl">
                  <Users className="w-8 h-8 text-[#F8C766]" />
                </div>
              </CardContent>
            </Card>

            {/* KPI 2: Aprobación Óptima */}
            <Card className="border-[#E3DCCB] bg-white rounded-2xl shadow-xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[11px] font-mono text-muted-foreground uppercase font-bold tracking-wider">
                    Aprobación Óptima (≥ 70 Pts)
                  </p>
                  <h3 className="text-3xl font-display font-bold text-emerald-700">
                    {becarios_optimos} <span className="text-sm font-normal text-muted-foreground">estudiantes</span>
                  </h3>
                  <div>
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-[11px]">
                      <CheckCircle className="w-3 h-3 mr-1" /> {((becarios_optimos / total_becarios) * 100).toFixed(1)}% Renovación
                    </Badge>
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-2xl">
                  <ShieldCheck className="w-8 h-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>

            {/* KPI 3: Acompañamiento / Condicionados */}
            <Card className="border-[#E3DCCB] bg-white rounded-2xl shadow-xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[11px] font-mono text-muted-foreground uppercase font-bold tracking-wider">
                    En Acompañamiento (51 - 69 Pts)
                  </p>
                  <h3 className="text-3xl font-display font-bold text-amber-600">
                    {becarios_condicionados} <span className="text-sm font-normal text-muted-foreground">becarios</span>
                  </h3>
                  <div>
                    <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 font-bold text-[11px]">
                      <AlertCircle className="w-3 h-3 mr-1" /> {becarios_reprobados} en reprobación
                    </Badge>
                  </div>
                </div>
                <div className="p-3 bg-amber-50 rounded-2xl">
                  <AlertTriangle className="w-8 h-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>

            {/* KPI 4: Convalidación y Gobernanza */}
            <Card className="border-[#E3DCCB] bg-white rounded-2xl shadow-xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[11px] font-mono text-muted-foreground uppercase font-bold tracking-wider">
                    Gobernanza Institucional
                  </p>
                  <h3 className="text-3xl font-display font-bold text-[#063A6B]">
                    5 / 5 <span className="text-sm font-normal text-muted-foreground">módulos</span>
                  </h3>
                  <div className="pt-0.5">
                    {firma_supervisor ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-xs py-0.5">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Convalidado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 font-bold text-[10px]">
                        Firma Digital Pendiente
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-[#17B4C4]/10 rounded-2xl">
                  <Scale className="w-8 h-8 text-[#17B4C4]" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sábana Maestra de Calificaciones Semestrales Oficiales */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold font-display text-[#063A6B] flex items-center gap-2">
                  <Table2 className="w-4 h-4 text-[#17B4C4]" />
                  Sábana Maestra de Calificaciones Semestrales Oficiales (14 Columnas)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Registros asentados por supervisores y pastores evaluadores · 21 Becarios titulares del Semestre II.
                </p>
              </div>

              {(es_admin || es_supervisor) && (
                <Button
                  onClick={() => set_dialogo_firma_abierto(true)}
                  className="h-9 bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold rounded-xl text-xs gap-2 shadow-xs shrink-0"
                >
                  <ShieldCheck className="w-4 h-4 text-[#F8C766]" />
                  Convalidar Acta con Firma Digital
                </Button>
              )}
            </div>

            <SabanaConsolidadoSemestral />
          </div>

          {/* Modal de Firma Digital Canvas */}
          <Dialog open={dialogo_firma_abierto} onOpenChange={set_dialogo_firma_abierto}>
            <DialogContent className="sm:max-w-[450px] p-0 border-none bg-transparent shadow-none">
              <FirmaDigital
                alFirmar={(_b64) => {
                  set_firma_supervisor(_b64);
                  set_dialogo_firma_abierto(false);
                  toast.success("Firma institucional convalidada correctamente", {
                    description: "El acta semestral consolidada ha sido sellada formalmente.",
                  });
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ESTRUCTURA FORMULARIO F-03 (MINISTERIAL / IGLESIA)      */}
      {/* ============================================================== */}
      {pestaña_activa === "iglesia_f03" && (
        <div className="space-y-6">
          <Card className="border-[#E3DCCB] bg-white rounded-2xl shadow-xs">
            <CardHeader className="border-b border-[#E3DCCB]/60 bg-slate-50/50 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-[#17B4C4] text-[#063A6B] font-bold text-[10px]">
                      Módulo 01 · 20% Oficial
                    </Badge>
                    <span className="text-xs text-muted-foreground">Evaluador: Pastor de la Iglesia Local</span>
                  </div>
                  <CardTitle className="text-lg font-bold text-[#063A6B] flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#17B4C4]" />
                    Gobernanza del Instrumento F-03 · Evaluación Ministerial del Becario
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Configure la estructura del formulario que el pastor responde semestralmente, la conexión con el catálogo de iglesias y sus 13 preguntas.
                  </CardDescription>
                </div>

                <Button
                  onClick={() => set_modal_preview_f03_abierto(true)}
                  className="h-10 px-4 bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold rounded-xl text-xs gap-2 shadow-xs shrink-0"
                >
                  <Eye className="w-4 h-4 text-[#F8C766]" />
                  Vista Previa del Formulario F-03
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Configuración de Conexión a Catálogo de Iglesias */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase text-[#063A6B] flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#17B4C4]" />
                  Conexión de Campos a Catálogos Institucionales
                </h4>
                <p className="text-xs text-muted-foreground">
                  Determine si los datos de la congregación y pastor se seleccionan desde el directorio auditado de Diaconía (Combobox) o permiten texto libre.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Nombre de la Iglesia Local</p>
                      <p className="text-[11px] text-muted-foreground">
                        {campo_iglesia_conectado ? "Conectado a Catálogo (Combobox de 6 congregaciones)" : "Entrada libre de texto abierto"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={campo_iglesia_conectado ? "default" : "outline"}
                      onClick={() => set_campo_iglesia_conectado(!campo_iglesia_conectado)}
                      className={`h-7 text-xs font-bold rounded-lg ${campo_iglesia_conectado ? "bg-[#063A6B]" : ""}`}
                    >
                      {campo_iglesia_conectado ? "Conectado" : "Texto Libre"}
                    </Button>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Pastor y Celular de Contacto</p>
                      <p className="text-[11px] text-muted-foreground">
                        {campo_pastor_conectado ? "Autocompletado desde directorio pastoral" : "Entrada manual de contacto"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={campo_pastor_conectado ? "default" : "outline"}
                      onClick={() => set_campo_pastor_conectado(!campo_pastor_conectado)}
                      className={`h-7 text-xs font-bold rounded-lg ${campo_pastor_conectado ? "bg-[#063A6B]" : ""}`}
                    >
                      {campo_pastor_conectado ? "Conectado" : "Texto Libre"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Muestra de Catálogo Actual de Iglesias */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-[#063A6B]">Directorio Institucional de Congregaciones Registradas (6)</Label>
                  <span className="text-[11px] text-muted-foreground">Base oficial Diaconía FRIF-IFD</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {CATALOGO_IGLESIAS_INSTITUCIONALES.map((ig) => (
                    <div key={ig.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                      <p className="font-bold text-slate-800 truncate">{ig.nombre}</p>
                      <p className="text-[11px] text-muted-foreground">{ig.pastor_nombre} · {ig.ciudad}</p>
                      <Badge variant="outline" className="text-[10px] border-slate-300 font-mono">
                        {ig.denominacion}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estructura de las 13 Preguntas Ministeriales */}
              <div className="space-y-3 pt-2">
                <Label className="text-xs font-mono uppercase font-bold text-slate-600">
                  Estructura Canónica de Evaluación Ministerial (13 Preguntas)
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <p className="font-bold text-[#063A6B]">Preguntas 1 a 4: Compromiso y Cargos</p>
                    <p className="text-[11px] text-muted-foreground">Frecuencia de asistencia (cultos y escuela dominical), compromiso en reuniones, cargos que ocupa en la iglesia y calidad de cumplimiento.</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <p className="font-bold text-[#063A6B]">Preguntas 5 a 8: Testimonio y Capacitación</p>
                    <p className="text-[11px] text-muted-foreground">Convicción de llamado, áreas en las que es ejemplo, asistencia a capacitaciones y testimonio dentro y fuera de la iglesia.</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <p className="font-bold text-[#063A6B]">Preguntas 9 a 10: Relaciones y Discipulado</p>
                    <p className="text-[11px] text-muted-foreground">Relaciones interpersonales con líderes y miembros, y desarrollo de nuevos líderes bajo su tutela.</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <p className="font-bold text-[#063A6B]">Preguntas 11 a 13: Fortalezas, Debilidades y Aporte</p>
                    <p className="text-[11px] text-muted-foreground">Diagnóstico de fortalezas, debilidades y apreciación pastoral sobre el impacto del programa BUMAND.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Diálogo Modal de Vista Previa del F-03 */}
          <Dialog open={modal_preview_f03_abierto} onOpenChange={set_modal_preview_f03_abierto}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-4 bg-white rounded-2xl">
              <DialogHeader className="pb-2 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-base font-bold text-[#063A6B] flex items-center gap-2">
                      <Eye className="w-4 h-4 text-[#17B4C4]" />
                      Vista Previa Interactiva: Formulario F-03 Ministerial
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Esta es la interfaz y flujo exacto que el pastor o supervisor utiliza para responder y emitir la acreditación firmada.
                    </DialogDescription>
                  </div>
                  <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                    Modo Previsualización
                  </Badge>
                </div>
              </DialogHeader>
              <div className="pt-2">
                <FormularioF03 />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: ESTRUCTURA ACADÉMICA (KÁRDEX Y UMBRAL CONTRACTUAL)      */}
      {/* ============================================================== */}
      {pestaña_activa === "academica" && (
        <div className="space-y-6">
          <Card className="border-[#E3DCCB] bg-white rounded-2xl shadow-xs">
            <CardHeader className="border-b border-[#E3DCCB]/60 bg-slate-50/50 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-[#17B4C4] text-[#063A6B] font-bold text-[10px]">
                      Módulo 02 · 20% Oficial
                    </Badge>
                    <span className="text-xs text-muted-foreground">Evaluador: Acreditación de Kárdex Universitario</span>
                  </div>
                  <CardTitle className="text-lg font-bold text-[#063A6B] flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-[#17B4C4]" />
                    Gobernanza del Récord Académico y Normativa Contractual
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Definición de umbrales de promedio universitario, penalizaciones por materias reprobadas y requisitos de respaldo.
                  </CardDescription>
                </div>

                <Button
                  onClick={() => set_modal_preview_academica_abierto(true)}
                  className="h-10 px-4 bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold rounded-xl text-xs gap-2 shadow-xs shrink-0"
                >
                  <Eye className="w-4 h-4 text-[#F8C766]" />
                  Vista Previa de Carga de Kárdex
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Reglas Normativas Oficiales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#063A6B]">Umbral Contractual</span>
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold">
                      Obligatorio
                    </Badge>
                  </div>
                  <h4 className="text-2xl font-bold font-display text-[#063A6B]">≥ 75 Pts</h4>
                  <p className="text-xs text-muted-foreground">
                    Promedio mínimo exigido por contrato institucional de beca. Si es inferior a 75 pts, el expediente entra en estado de observación tutorial.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#063A6B]">Materias Aprobadas</span>
                    <Badge variant="outline" className="border-slate-300 text-slate-700 text-[10px] font-bold">
                      Baremo Oficial
                    </Badge>
                  </div>
                  <h4 className="text-2xl font-bold font-display text-emerald-700">20 / 20 Pts</h4>
                  <p className="text-xs text-muted-foreground">
                    Todas las materias aprobadas con promedio mayor o igual a 70 pts otorgan la nota máxima del módulo (20 puntos).
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#063A6B]">Penalización Reprobación</span>
                    <Badge className="bg-rose-100 text-rose-800 border-rose-300 text-[10px] font-bold">
                      Crítico
                    </Badge>
                  </div>
                  <h4 className="text-2xl font-bold font-display text-rose-700">0 Pts</h4>
                  <p className="text-xs text-muted-foreground">
                    1 materia reprobada con promedio mayor a 51 pts equivale a 10 pts. Más de una materia reprobada equivale a 0 pts en el módulo.
                  </p>
                </div>
              </div>

              {/* Documentos Requeridos */}
              <div className="p-4 bg-[#063A6B]/5 rounded-xl border border-[#17B4C4]/30 space-y-2">
                <h4 className="text-xs font-bold text-[#063A6B] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#17B4C4]" />
                  Documentos Oficiales Acreditables para el Semestre
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-5">
                  <li><strong>Historial Académico Oficial / Kárdex:</strong> Expedido por el sistema universitario oficial (UMSA, UPEA, Católica, etc.).</li>
                  <li><strong>Boleta de Notas Legalizada:</strong> Sellada por dirección de carrera o secretaría académica de la facultad.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Diálogo Modal de Vista Previa Académica */}
          <Dialog open={modal_preview_academica_abierto} onOpenChange={set_modal_preview_academica_abierto}>
            <DialogContent className="sm:max-w-2xl p-6 bg-white rounded-2xl">
              <DialogHeader className="pb-2 border-b border-slate-200">
                <DialogTitle className="text-base font-bold text-[#063A6B] flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#17B4C4]" />
                  Vista Previa: Interfaz de Recepción y Carga de Kárdex
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Pantalla donde el becario adjunta sus certificados PDF y el supervisor valida el cumplimiento contractual.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-emerald-900">Validación de Meta Contractual</p>
                      <p className="text-[11px] text-emerald-700">El becario debe registrar notas iguales o superiores a 75 pts.</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-600 text-white font-bold text-xs">≥ 75 Pts</Badge>
                </div>

                <div className="border-2 border-dashed border-[#E3DCCB] rounded-2xl p-6 text-center bg-slate-50/50">
                  <Upload className="w-8 h-8 text-[#17B4C4] mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800">Zona de Carga de Documentos Académicos</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Formatos admitidos: PDF, JPG, PNG (Hasta 10 MB)</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: ESTRUCTURA MENTOR / SUPERVISOR VÍA QR (21 REACTIVOS)   */}
      {/* ============================================================== */}
      {pestaña_activa === "mentor" && (
        <div className="space-y-6">
          <Card className="border-[#E3DCCB] bg-white rounded-2xl shadow-xs">
            <CardHeader className="border-b border-[#E3DCCB]/60 bg-slate-50/50 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-[#17B4C4] text-[#063A6B] font-bold text-[10px]">
                      Módulo 03 · 20% Oficial
                    </Badge>
                    <span className="text-xs text-muted-foreground">Evaluador: Mentor / Supervisor Diaconía en Terreno</span>
                  </div>
                  <CardTitle className="text-lg font-bold text-[#063A6B] flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-[#17B4C4]" />
                    Gobernanza del Instrumento de Mentoría / Práctica Preprofesional (PP²)
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Banco oficial de 21 reactivos (18 escala 1 a 10 + 3 preguntas abiertas valoradas sobre 10 pts) y código QR institucional.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    onClick={() => set_modal_qr_mentor_abierto(true)}
                    variant="outline"
                    className="h-10 px-3 border-[#063A6B] text-[#063A6B] font-bold rounded-xl text-xs gap-1.5 hover:bg-[#063A6B]/5"
                  >
                    <QrCode className="w-4 h-4 text-[#17B4C4]" />
                    Ver Código QR
                  </Button>

                  <Button
                    onClick={() => set_modal_preview_mentor_abierto(true)}
                    className="h-10 px-4 bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold rounded-xl text-xs gap-2 shadow-xs"
                  >
                    <Eye className="w-4 h-4 text-[#F8C766]" />
                    Vista Previa Rúbrica
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Parámetros de Ponderación de Mentoría */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#063A6B]">Sección I: 18 Reactivos de Desempeño</span>
                    <Badge variant="outline" className="border-slate-300 font-mono text-[10px]">Escala 1 a 10</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Evalúa cumplimiento, calidad, iniciativa, trabajo en equipo, respeto y valores de Diaconía IFD. Promedio directo escalado a <strong>10 Puntos</strong>.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#063A6B]">Sección II: 3 Preguntas Abiertas (19, 20, 21)</span>
                    <Badge variant="outline" className="border-slate-300 font-mono text-[10px]">Rúbrica Cualitativa</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Aporte del becario (3.33 pts), fortalezas (3.33 pts) y áreas de mejora (3.34 pts), sumando <strong>10 Puntos</strong>. Total del módulo: <strong>20 Puntos</strong>.
                  </p>
                </div>
              </div>

              {/* Lista de los 18 Reactivos Oficiales */}
              <div className="space-y-3">
                <Label className="text-xs font-mono uppercase font-bold text-slate-600">
                  Banco de Reactivos del Mentor (18 Escala 1 a 10)
                </Label>
                <div className="space-y-2">
                  {PREGUNTAS_MENTOR_ESCALA.map((p) => (
                    <div key={p.numero} className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#063A6B]/10 text-[#063A6B] font-mono font-bold flex items-center justify-center text-[10px]">
                          {p.numero}
                        </span>
                        <span className="text-slate-800 font-medium">{p.enunciado}</span>
                      </div>
                      <Badge variant="outline" className="border-slate-300 font-mono text-[10px] shrink-0">
                        Escala 1 a 10
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Diálogo Modal de Código QR */}
          <Dialog open={modal_qr_mentor_abierto} onOpenChange={set_modal_qr_mentor_abierto}>
            <DialogContent className="sm:max-w-sm p-6 bg-white rounded-2xl text-center space-y-4">
              <DialogHeader>
                <DialogTitle className="text-[#063A6B] font-bold text-base flex items-center justify-center gap-2">
                  <QrCode className="w-5 h-5 text-[#17B4C4]" />
                  Código QR de Acceso Institucional
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Escanee este código con la cámara de su móvil para acceder al formulario web de evaluación de mentoría.
                </DialogDescription>
              </DialogHeader>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 inline-block mx-auto">
                <div className="w-48 h-48 bg-white border-2 border-[#063A6B] rounded-xl flex items-center justify-center shadow-inner">
                  <QrCode className="w-36 h-36 text-[#063A6B]" />
                </div>
                <p className="text-[11px] font-mono text-slate-500 mt-3 font-semibold">
                  bumand.diaconia.bo/evaluacion/mentor
                </p>
              </div>
            </DialogContent>
          </Dialog>

          {/* Diálogo Modal de Vista Previa de Rúbrica */}
          <Dialog open={modal_preview_mentor_abierto} onOpenChange={set_modal_preview_mentor_abierto}>
            <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto p-6 bg-white rounded-2xl">
              <DialogHeader className="pb-2 border-b border-slate-200">
                <DialogTitle className="text-base font-bold text-[#063A6B] flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#17B4C4]" />
                  Vista Previa: Instrumento de Mentoría en Terreno
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Simulación de la rúbrica móvil de 18 notas escalares y 3 campos abiertos que responde el tutor.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-3">
                <div className="p-4 bg-[#063A6B]/5 border border-[#17B4C4]/30 rounded-xl text-xs space-y-1">
                  <p className="font-bold text-[#063A6B]">Instrucciones para el Mentor:</p>
                  <p className="text-muted-foreground">Califique de 1 (deficiente) a 10 (excelente) cada reactivo de desempeño profesional y complete las preguntas cualitativas.</p>
                </div>
                <div className="space-y-2">
                  {PREGUNTAS_MENTOR_ESCALA.slice(0, 5).map((p) => (
                    <div key={p.numero} className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                      <span className="font-medium text-slate-800">{p.numero}. {p.enunciado}</span>
                      <span className="font-mono font-bold text-[#063A6B] bg-slate-100 px-2 py-1 rounded-lg">10 / 10</span>
                    </div>
                  ))}
                  <p className="text-[11px] text-center text-muted-foreground italic">+ 13 preguntas adicionales en la versión completa</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: ESTRUCTURA ESCUELA DE LÍDERES / CETI (12 TAREAS)        */}
      {/* ============================================================== */}
      {pestaña_activa === "lideres" && (
        <div className="space-y-6">
          <Card className="border-[#E3DCCB] bg-white rounded-2xl shadow-xs">
            <CardHeader className="border-b border-[#E3DCCB]/60 bg-slate-50/50 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-[#17B4C4] text-[#063A6B] font-bold text-[10px]">
                      Módulo 04 · 20% Oficial
                    </Badge>
                    <span className="text-xs text-muted-foreground">Evaluador: Coordinación CETI y Asistencia</span>
                  </div>
                  <CardTitle className="text-lg font-bold text-[#063A6B] flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#17B4C4]" />
                    Gobernanza de Escuela de Líderes y Formación Teológica CETI
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Catálogo de las 12 tareas teológicas, ponderación individual y baremo de asistencia de los viernes.
                  </CardDescription>
                </div>

                <Button
                  onClick={() => set_modal_preview_lideres_abierto(true)}
                  className="h-10 px-4 bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold rounded-xl text-xs gap-2 shadow-xs shrink-0"
                >
                  <Eye className="w-4 h-4 text-[#F8C766]" />
                  Vista Previa Registro CETI
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Reglas de Asistencia de Viernes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-[#063A6B]">Asistencia Presencial a Reuniones de Viernes</h4>
                  <p className="text-xs text-muted-foreground">
                    Reuniones formativas obligatorias. Tolerancia máxima de 1 inasistencia justificada por semestre. Más de 1 falta sin justificación anula la nota del módulo.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-[#063A6B]">Ponderación de las 12 Tareas CETI</h4>
                  <p className="text-xs text-muted-foreground">
                    Cada tarea representa un 8.33% de la nota teológica. El promedio general escalado al 20% aporta la nota semestral oficial.
                  </p>
                </div>
              </div>

              {/* Catálogo de las 12 Tareas Teológicas */}
              <div className="space-y-3">
                <Label className="text-xs font-mono uppercase font-bold text-slate-600">
                  Catálogo Canónico de Tareas Semestrales (12 Módulos)
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {TAREAS_CETI_CATALOGO.map((t) => (
                    <div key={t.numero} className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#063A6B]/10 text-[#063A6B] font-mono font-bold flex items-center justify-center text-[10px]">
                          {t.numero}
                        </span>
                        <span className="text-slate-800 font-medium">{t.tema}</span>
                      </div>
                      <Badge variant="outline" className="border-slate-300 font-mono text-[10px] shrink-0">
                        {t.ponderacion}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Diálogo Modal de Vista Previa CETI */}
          <Dialog open={modal_preview_lideres_abierto} onOpenChange={set_modal_preview_lideres_abierto}>
            <DialogContent className="sm:max-w-2xl p-6 bg-white rounded-2xl">
              <DialogHeader className="pb-2 border-b border-slate-200">
                <DialogTitle className="text-base font-bold text-[#063A6B] flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#17B4C4]" />
                  Vista Previa: Registro de Tareas y Asistencias CETI
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Pantalla donde el coordinador asienta las calificaciones individuales de cada entrega teológica.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-[#063A6B]">Total Tareas Registradas: 12 / 12</span>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold">100 Pts Promedio</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Permite marcar entregas, cargar observaciones y calcular multas por inasistencias no justificadas.</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: ESTRUCTURA SOCIOECONÓMICA (BIENESTAR 26P)               */}
      {/* ============================================================== */}
      {pestaña_activa === "socioeconomica" && (
        <div className="space-y-6">
          <Card className="border-[#E3DCCB] bg-white rounded-2xl shadow-xs">
            <CardHeader className="border-b border-[#E3DCCB]/60 bg-slate-50/50 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-[#17B4C4] text-[#063A6B] font-bold text-[10px]">
                      Módulo 05 · 20% Oficial
                    </Badge>
                    <span className="text-xs text-muted-foreground">Evaluador: Área de Trabajo Social</span>
                  </div>
                  <CardTitle className="text-lg font-bold text-[#063A6B] flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5 text-[#17B4C4]" />
                    Gobernanza del Cuestionario de Bienestar Universitario (26 Preguntas)
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Catálogo oficial de reactivos socioeconómicos y determinación automática del Semáforo Institucional de Vulnerabilidad.
                  </CardDescription>
                </div>

                <Button
                  onClick={() => set_modal_preview_socioeconomica_abierto(true)}
                  className="h-10 px-4 bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold rounded-xl text-xs gap-2 shadow-xs shrink-0"
                >
                  <Eye className="w-4 h-4 text-[#F8C766]" />
                  Vista Previa Cuestionario 26P
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Diagnóstico Semáforo Institucional */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-emerald-900">Semáforo Verde</span>
                  </div>
                  <p className="text-xs text-emerald-800">Condición estable, sin riesgo crítico en hogar, salud ni finanzas.</p>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-xs font-bold text-amber-900">Semáforo Amarillo</span>
                  </div>
                  <p className="text-xs text-amber-800">Alerta preventiva, requiere seguimiento tutorial de Trabajo Social.</p>
                </div>

                <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="text-xs font-bold text-rose-900">Semáforo Rojo</span>
                  </div>
                  <p className="text-xs text-rose-800">Vulnerabilidad alta, intervención prioritaria y plan de apoyo institucional.</p>
                </div>
              </div>

              {/* Muestra de las 26 Preguntas */}
              <div className="space-y-3">
                <Label className="text-xs font-mono uppercase font-bold text-slate-600">
                  Banco de Preguntas Canónicas de Bienestar Personal, Social y Universitario (26 Reactivos)
                </Label>
                <div className="space-y-2">
                  {PREGUNTAS_BIENESTAR_INICIALES.slice(0, 6).map((p) => (
                    <div key={p.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#063A6B]/10 text-[#063A6B] font-mono font-bold flex items-center justify-center text-[10px]">
                          {p.numero}
                        </span>
                        <div>
                          <p className="font-bold text-slate-800">{p.titulo}</p>
                          <p className="text-[11px] text-muted-foreground">{p.enunciado}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-slate-300 font-mono text-[10px] shrink-0">
                        {p.opciones.length} Opciones
                      </Badge>
                    </div>
                  ))}
                  <p className="text-[11px] text-center text-muted-foreground italic">+ 20 preguntas estructuradas en el instrumento oficial</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Diálogo Modal de Vista Previa Socioeconómica */}
          <Dialog open={modal_preview_socioeconomica_abierto} onOpenChange={set_modal_preview_socioeconomica_abierto}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-4 bg-white rounded-2xl">
              <DialogHeader className="pb-2 border-b border-slate-200">
                <DialogTitle className="text-base font-bold text-[#063A6B] flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#17B4C4]" />
                  Vista Previa Interactiva: Cuestionario de Bienestar (26 Preguntas)
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Instrumento completo que el estudiante responde semestralmente con evaluación de Trabajo Social.
                </DialogDescription>
              </DialogHeader>
              <div className="pt-2">
                <EvaluacionSocioeconomicaVista />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 7: PONDERACIONES, RANGOS Y PERIODOS SEMESTRALES            */}
      {/* ============================================================== */}
      {pestaña_activa === "periodos" && (
        <div className="space-y-6">
          {/* Calibración de Ponderaciones Oficiales */}
          <Card className="border-[#17B4C4] bg-white rounded-2xl shadow-xs overflow-hidden">
            <CardHeader className="bg-[#17B4C4]/10 pb-3 border-b border-[#17B4C4]/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-bold text-[#063A6B] flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-[#17B4C4]" />
                    Ponderación Oficial de los 5 Módulos Canónicos (Suma = 100%)
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Ajuste la distribución porcentual de cada eje evaluativo. Por defecto: 20% equitativo.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                    ponderaciones_validas ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-rose-50 text-rose-800 border-rose-300"
                  }`}>
                    Total: {suma_ponderaciones}% {ponderaciones_validas ? "✓" : "≠ 100%"}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      set_ponderacion_temporal({
                        liderazgo: 20,
                        academica: 20,
                        mentor: 20,
                        practicas: 20,
                        socioeconomica: 20,
                      });
                      toast.info("Valores restablecidos a base 20% equitativa.");
                    }}
                    className="h-8 px-3 text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 font-bold rounded-lg text-xs"
                  >
                    Restablecer 20%
                  </Button>
                  <Button
                    size="sm"
                    onClick={manejarGuardarPonderaciones}
                    disabled={!ponderaciones_validas}
                    className="h-8 px-4 bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold rounded-lg text-xs shadow-xs"
                  >
                    Guardar
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {modulos.map((m) => (
                  <div key={m.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-slate-800 truncate" title={m.nombre}>
                        {m.nombre.split(" ")[1] || m.nombre}
                      </Label>
                      <span className="font-mono font-bold text-xs text-[#063A6B]">
                        {ponderacion_temporal[m.clave]}%
                      </span>
                    </div>
                    <Slider
                      min={0}
                      max={50}
                      step={5}
                      value={[ponderacion_temporal[m.clave] ?? 20]}
                      onValueChange={(val) => {
                        const v = Array.isArray(val) ? val[0] : (val as unknown as number);
                        set_ponderacion_temporal((prev) => ({ ...prev, [m.clave]: v }));
                      }}
                      className="cursor-pointer"
                    />
                    <p className="text-[10px] text-muted-foreground truncate">{m.evaluador_rol}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rangos Oficiales de Aprobación */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold font-display text-[#063A6B] flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#17B4C4]" />
              Escala y Rangos de Aprobación Oficial Institucional (Diaconía FRIF-IFD)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {RANGOS_APROBACION_OFICIALES.map((r, i) => (
                <div key={i} className="p-4 bg-white rounded-xl border border-[#E3DCCB] space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#063A6B]">{r.calificacion}</span>
                    <Badge variant="outline" className="font-mono font-bold text-xs border-slate-300">
                      {r.rango} pts
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{r.descripcion}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Criterios de Evaluación Oficiales */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold font-display text-[#063A6B] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#17B4C4]" />
              Matriz Normativa de Criterios Canónicos Semestrales
            </h3>
            <CriteriosEvaluacionTabla />
          </div>

          {/* Gestión de Periodos Semestrales */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold font-display text-[#063A6B] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#17B4C4]" />
              Ciclos Semestrales Activos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {periodos.map((p) => {
                const es_activo = p.id === periodo_activo;
                return (
                  <div
                    key={p.id}
                    onClick={() => set_periodo_activo(p.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      es_activo
                        ? "bg-[#063A6B]/5 border-[#17B4C4] shadow-xs"
                        : "bg-white border-[#E3DCCB] hover:border-slate-300"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#063A6B]">{p.titulo}</span>
                        {p.habilitado ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold">
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-500 border-slate-300 text-[10px]">
                            Cerrado
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">{p.subtitulo}</p>
                      <p className="text-[10px] font-mono text-slate-500">{p.rango}</p>
                    </div>

                    {es_admin && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => alternarEstadoPeriodo(p.id, e)}
                        className="text-xs h-7 border-slate-300 shrink-0"
                      >
                        {p.habilitado ? "Cerrar Ciclo" : "Reabrir Ciclo"}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal para Crear Nuevo Semestre */}
      <Dialog open={modal_nuevo_semestre_abierto} onOpenChange={set_modal_nuevo_semestre_abierto}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl border-[#E3DCCB]">
          <DialogHeader>
            <DialogTitle className="text-[#063A6B] font-bold text-base flex items-center gap-2">
              <CalendarPlus className="w-5 h-5 text-[#17B4C4]" />
              Apertura de Nuevo Semestre Institucional
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Habilita un nuevo periodo evaluativo con base estándar del 20% y registro de expedientes.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={manejarCrearNuevoSemestre} className="space-y-3 pt-2">
            <div>
              <Label className="text-xs">Título del Semestre</Label>
              <Input
                value={nuevo_titulo}
                onChange={(e) => set_nuevo_titulo(e.target.value)}
                placeholder="Ej. Semestre I · 2027"
                className="h-8 text-xs mt-1"
                required
              />
            </div>
            <div>
              <Label className="text-xs">Descripción / Subtítulo</Label>
              <Input
                value={nuevo_subtitulo}
                onChange={(e) => set_nuevo_subtitulo(e.target.value)}
                placeholder="Ej. Ciclo lectivo regular"
                className="h-8 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Rango de Meses</Label>
              <Input
                value={nuevo_rango}
                onChange={(e) => set_nuevo_rango(e.target.value)}
                placeholder="Ej. Enero – Junio 2027"
                className="h-8 text-xs mt-1"
                required
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => set_modal_nuevo_semestre_abierto(false)}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" className="bg-[#063A6B] hover:bg-[#063A6B]/90 font-bold">
                Habilitar Semestre
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
