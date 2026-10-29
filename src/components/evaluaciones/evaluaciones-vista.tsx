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
  Download,
  Trash2,
  ExternalLink,
  FileUp,
  FileCheck,
  Info,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogTrigger,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import { clienteApi } from "@/lib/cliente-api";
import { toast } from "sonner";
import { CriteriosEvaluacionTabla } from "./criterios-evaluacion-tabla";
import { SabanaConsolidadoSemestral } from "./sabana-consolidado-semestral";
import { FormularioF03 } from "./formulario-f03";
import { EvaluacionSocioeconomicaVista } from "./evaluacion-socioeconomica-vista";
import { FormularioCargaNotasEstudiante } from "./formulario-carga-notas-estudiante";
import { BandejaPreEvaluacionSupervisor } from "./bandeja-pre-evaluacion-supervisor";
import { BandejaConvalidacionAdministracion } from "./bandeja-convalidacion-administracion";
import { FormularioMentorModal, EvaluacionInicialMentor } from "./formulario-mentor-modal";
import { EscuelaLideresClassroom } from "./escuela-lideres-classroom";
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
    descripcion: "Diagnóstico socioeconómico y de bienestar estudiantil de 26 preguntas.",
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

const MUESTRA_KARDEX_PDF_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420" fill="none"><rect width="600" height="420" rx="16" fill="%23FFFFFF" stroke="%23CBD5E1" stroke-width="2"/><rect x="24" y="24" width="552" height="64" rx="8" fill="%23EFF6FF" stroke="%2393C5FD"/><text x="44" y="52" fill="%231E3A8A" font-family="sans-serif" font-size="15" font-weight="bold">UNIVERSIDAD MAYOR DE SAN ANDRÉS · RECTORADO</text><text x="44" y="72" fill="%232563EB" font-family="sans-serif" font-size="12">HISTORIAL ACADÉMICO Y RÉCORD DE CALIFICACIONES SEMESTRALES</text><line x1="24" y1="104" x2="576" y2="104" stroke="%23E2E8F0" stroke-width="1.5"/><text x="44" y="132" fill="%23475569" font-family="sans-serif" font-size="12" font-weight="bold">FACULTAD:</text><text x="125" y="132" fill="%230F172A" font-family="sans-serif" font-size="12">Ciencias Económicas y Financieras</text><text x="360" y="132" fill="%23475569" font-family="sans-serif" font-size="12" font-weight="bold">PROMEDIO:</text><text x="440" y="132" fill="%23059669" font-family="sans-serif" font-size="13" font-weight="bold">82.50 pts (APROBADO)</text><rect x="44" y="150" width="512" height="150" rx="8" fill="%23F8FAFC" stroke="%23E2E8F0"/><text x="60" y="175" fill="%23334155" font-family="sans-serif" font-size="11" font-weight="bold">MATERIA</text><text x="380" y="175" fill="%23334155" font-family="sans-serif" font-size="11" font-weight="bold">NOTA</text><text x="460" y="175" fill="%23334155" font-family="sans-serif" font-size="11" font-weight="bold">ESTADO</text><line x1="44" y1="185" x2="556" y2="185" stroke="%23E2E8F0"/><text x="60" y="205" fill="%231E293B" font-family="sans-serif" font-size="11">Contabilidad de Costos II (CPA-201)</text><text x="380" y="205" fill="%23059669" font-family="sans-serif" font-size="11" font-weight="bold">85</text><text x="460" y="205" fill="%23059669" font-family="sans-serif" font-size="11">Aprobado</text><text x="60" y="230" fill="%231E293B" font-family="sans-serif" font-size="11">Matemática Financiera (CPA-202)</text><text x="380" y="230" fill="%23059669" font-family="sans-serif" font-size="11" font-weight="bold">78</text><text x="460" y="230" fill="%23059669" font-family="sans-serif" font-size="11">Aprobado</text><text x="60" y="255" fill="%231E293B" font-family="sans-serif" font-size="11">Microeconomía I (ECO-105)</text><text x="380" y="255" fill="%23059669" font-family="sans-serif" font-size="11" font-weight="bold">81</text><text x="460" y="255" fill="%23059669" font-family="sans-serif" font-size="11">Aprobado</text><text x="60" y="280" fill="%231E293B" font-family="sans-serif" font-size="11">Derecho Comercial y Laboral (DER-104)</text><text x="380" y="280" fill="%23059669" font-family="sans-serif" font-size="11" font-weight="bold">86</text><text x="460" y="280" fill="%23059669" font-family="sans-serif" font-size="11">Aprobado</text><rect x="44" y="315" width="512" height="70" rx="8" fill="%23FFFFFF" stroke="%23E2E8F0"/><text x="60" y="342" fill="%23475569" font-family="sans-serif" font-size="11">Sello Digital Rectorado:</text><text x="60" y="362" fill="%23035683" font-family="sans-serif" font-size="12" font-weight="bold">División de Títulos y Archivo Universitario UMSA · Ref. #8921-2026</text><circle cx="500" cy="350" r="22" fill="%23059669" fill-opacity="0.1" stroke="%23059669" stroke-dasharray="3 3"/><text x="477" y="354" fill="%23059669" font-family="sans-serif" font-size="10" font-weight="bold">CONVALIDADO</text></svg>`;

export interface DocumentoAcademicoSemestral {
  id: number;
  becario_id: number;
  becario_nombre: string;
  carrera: string;
  universidad: string;
  periodo: string;
  promedio_semestral: number;
  record_archivo_nombre: string;
  record_archivo_url?: string;
  record_archivo_tamano?: string;
  historial_archivo_nombre: string;
  historial_archivo_url?: string;
  historial_archivo_tamano?: string;
  estado: "convalidado" | "en_revision" | "observado";
  fecha_recepcion: string;
}

const DOCUMENTOS_ACADEMICOS_INICIALES: DocumentoAcademicoSemestral[] = [
  {
    id: 1,
    becario_id: 1,
    becario_nombre: "Nilda Amalia Churata Paye",
    carrera: "Educación Parvularia",
    universidad: "UMSA",
    periodo: "Semestre II - 2026",
    promedio_semestral: 88.5,
    record_archivo_nombre: "Record_Academico_Churata_2026_II.pdf",
    record_archivo_tamano: "1.2 MB",
    historial_archivo_nombre: "Kardex_Historico_UMSA_Churata.pdf",
    historial_archivo_tamano: "2.4 MB",
    estado: "convalidado",
    fecha_recepcion: "2026-10-15",
  },
  {
    id: 2,
    becario_id: 2,
    becario_nombre: "Edgar Elias Alarcon Huanca",
    carrera: "Ingeniería de Sistemas",
    universidad: "UPEA",
    periodo: "Semestre II - 2026",
    promedio_semestral: 84.0,
    record_archivo_nombre: "Record_Notas_Alarcon_UPEA.pdf",
    record_archivo_tamano: "890 KB",
    historial_archivo_nombre: "Historial_Legalizado_Alarcon.pdf",
    historial_archivo_tamano: "1.8 MB",
    estado: "convalidado",
    fecha_recepcion: "2026-10-18",
  },
  {
    id: 3,
    becario_id: 3,
    becario_nombre: "Adai Belen Huayta Cardozo",
    carrera: "Contaduría Pública",
    universidad: "UMSA",
    periodo: "Semestre II - 2026",
    promedio_semestral: 79.0,
    record_archivo_nombre: "Boleta_Calificaciones_Huayta_2026.png",
    record_archivo_tamano: "1.5 MB",
    historial_archivo_nombre: "Certificado_Academico_UMSA.pdf",
    historial_archivo_tamano: "2.1 MB",
    estado: "convalidado",
    fecha_recepcion: "2026-10-20",
  },
  {
    id: 4,
    becario_id: 4,
    becario_nombre: "Alejandro Roberth Paredes Tarquino",
    carrera: "Comunicación Social",
    universidad: "UMSA",
    periodo: "Semestre II - 2026",
    promedio_semestral: 76.5,
    record_archivo_nombre: "Record_Academico_Paredes_II_2026.pdf",
    record_archivo_tamano: "1.1 MB",
    historial_archivo_nombre: "Historial_Academico_Paredes.pdf",
    historial_archivo_tamano: "1.9 MB",
    estado: "convalidado",
    fecha_recepcion: "2026-10-21",
  },
  {
    id: 5,
    becario_id: 5,
    becario_nombre: "Aydee Ruth Ali Condori",
    carrera: "Contaduría Pública",
    universidad: "UPEA",
    periodo: "Semestre II - 2026",
    promedio_semestral: 81.0,
    record_archivo_nombre: "Record_Academico_Ali_2026.pdf",
    record_archivo_tamano: "950 KB",
    historial_archivo_nombre: "Certificado_Notas_Ali.pdf",
    historial_archivo_tamano: "1.7 MB",
    estado: "convalidado",
    fecha_recepcion: "2026-10-22",
  },
];

export interface BecarioAsignadoMentor {
  id: number;
  nombre: string;
  carrera: string;
  universidad: string;
  unidad_agencia: string;
  estado: "pendiente" | "evaluado";
  nota_final_20?: number;
  fecha_evaluacion?: string;
  evaluacion_datos?: EvaluacionInicialMentor;
}

const BECARIOS_ASIGNADOS_MENTOR_INICIALES: BecarioAsignadoMentor[] = [
  {
    id: 1,
    nombre: "Ruddy Flores Tapia",
    carrera: "Contaduría Pública",
    universidad: "UMSA",
    unidad_agencia: "Jefatura de Planificación, Control y Presupuesto",
    estado: "evaluado",
    nota_final_20: 19.8,
    fecha_evaluacion: "2026-10-26",
    evaluacion_datos: {
      mentor_nombre: "Mildrette Rojas Soliz",
      unidad_agencia: "Jefatura de Planificación, Control y Presupuesto",
      semestre_gestion: "Semestre II · 2026",
      fecha: "2026-10-26",
      calificaciones_1_18: {
        1: 10, 2: 10, 3: 10, 4: 10, 5: 10, 6: 10, 7: 10, 8: 9, 9: 10,
        10: 10, 11: 10, 12: 10, 13: 10, 14: 9, 15: 9, 16: 9, 17: 10, 18: 10
      },
      respuestas_abiertas: {
        19: "Excelente apoyo muy agradecida, alta disposición de servicio.",
        20: "En todas las tareas de digitalización y análisis cumplió con lo encomendado.",
        21: "Que exista la opción de apoyo en periodos de vacaciones universitarias."
      },
      puntajes_abiertos: { 19: 3.33, 20: 3.33, 21: 3.34 },
      nota_final_20: 19.8,
      codigo_verificacion: "748920",
      identidad_verificada: true
    }
  },
  {
    id: 2,
    nombre: "Joel David Alarcón Ticona",
    carrera: "Ingeniería de Sistemas",
    universidad: "UPEA",
    unidad_agencia: "Gerencia Nacional de Tecnologías y Sistemas",
    estado: "evaluado",
    nota_final_20: 18.5,
    fecha_evaluacion: "2026-10-25",
    evaluacion_datos: {
      mentor_nombre: "Ing. Carlos Mendoza",
      unidad_agencia: "Gerencia Nacional de Tecnologías y Sistemas",
      semestre_gestion: "Semestre II · 2026",
      fecha: "2026-10-25",
      nota_final_20: 18.5,
      codigo_verificacion: "839102",
      identidad_verificada: true
    }
  },
  {
    id: 3,
    nombre: "Mariana Huayta Quispe",
    carrera: "Bioquímica y Farmacia",
    universidad: "UMSA",
    unidad_agencia: "Agencia Villa Fátima (Operaciones)",
    estado: "pendiente",
    nota_final_20: undefined,
    fecha_evaluacion: undefined,
  },
  {
    id: 4,
    nombre: "Brayan Christian Paredes Choque",
    carrera: "Contaduría Pública",
    universidad: "UMSA",
    unidad_agencia: "Agencia El Alto Central",
    estado: "pendiente",
    nota_final_20: undefined,
    fecha_evaluacion: undefined,
  },
  {
    id: 5,
    nombre: "Noemí Rocío Condori Mamani",
    carrera: "Enfermería",
    universidad: "UPEA",
    unidad_agencia: "Subgerencia de Bienestar Social",
    estado: "evaluado",
    nota_final_20: 19.0,
    fecha_evaluacion: "2026-10-24",
    evaluacion_datos: {
      mentor_nombre: "Lic. Miriam Colque",
      unidad_agencia: "Subgerencia de Bienestar Social",
      semestre_gestion: "Semestre II · 2026",
      fecha: "2026-10-24",
      nota_final_20: 19.0,
      codigo_verificacion: "192847",
      identidad_verificada: true
    }
  }
];

interface EvaluacionesVistaProps {
  pestaña_inicial?: string;
}

export function EvaluacionesVista({ pestaña_inicial = "consolidado" }: EvaluacionesVistaProps) {
  const { usuario } = usarAutenticacion();
  const es_admin = usuario?.rol === "administrador";
  const es_supervisor = usuario?.rol === "supervisor" || (!es_admin && usuario?.rol !== "becario");

  const [pestaña_activa, set_pestaña_activa] = useState<string>(() => {
    if (es_supervisor && !es_admin && (!pestaña_inicial || pestaña_inicial === "consolidado")) {
      return "mentor";
    }
    return pestaña_inicial || "consolidado";
  });
  const [sub_pestana_academica, set_sub_pestana_academica] = useState<
    "estudiante" | "supervisor" | "administracion"
  >(es_admin ? "administracion" : "estudiante");

  useEffect(() => {
    if (pestaña_inicial && pestaña_inicial !== "consolidado") {
      set_pestaña_activa(pestaña_inicial);
    } else if (es_supervisor && !es_admin) {
      set_pestaña_activa("mentor");
    }
  }, [pestaña_inicial, es_supervisor, es_admin]);

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

  // Convalidación de Acta en Sistema
  const [acta_convalidada, set_acta_convalidada] = useState<boolean>(false);

  // Estados para Diálogos Modales de Vista Previa (Preview)
  const [modal_preview_f03_abierto, set_modal_preview_f03_abierto] = useState<boolean>(false);
  const [modal_preview_academica_abierto, set_modal_preview_academica_abierto] = useState<boolean>(false);
  const [modal_preview_mentor_abierto, set_modal_preview_mentor_abierto] = useState<boolean>(false);
  const [modal_preview_lideres_abierto, set_modal_preview_lideres_abierto] = useState<boolean>(false);
  const [modal_preview_socioeconomica_abierto, set_modal_preview_socioeconomica_abierto] = useState<boolean>(false);
  const [modal_qr_mentor_abierto, set_modal_qr_mentor_abierto] = useState<boolean>(false);

  // TAREA-02: Estados para Evaluación de Supervisor (Módulo 3) desde su propio perfil web
  const [becarios_asignados_modulo3, set_becarios_asignados_modulo3] = useState<BecarioAsignadoMentor[]>(
    BECARIOS_ASIGNADOS_MENTOR_INICIALES
  );
  const [modal_formulario_mentor_abierto, set_modal_formulario_mentor_abierto] = useState<boolean>(false);
  const [becario_mentor_seleccionado, set_becario_mentor_seleccionado] = useState<BecarioAsignadoMentor | null>(null);

  useEffect(() => {
    async function cargarBecariosAsignadosModulo3() {
      try {
        const respuesta = await clienteApi.get<BecarioAsignadoMentor[]>(
          "/api/evaluaciones/modulo-3/becarios-asignados"
        );
        if (respuesta && Array.isArray(respuesta) && respuesta.length > 0) {
          set_becarios_asignados_modulo3(respuesta);
        }
      } catch (_e) {
        // Fallback en lista inicial
      }
    }
    cargarBecariosAsignadosModulo3();
  }, []);

  // Estados de Carga y Recepción Activa de Documentos Académicos
  const [documentos_academicos, set_documentos_academicos] = useState<DocumentoAcademicoSemestral[]>(DOCUMENTOS_ACADEMICOS_INICIALES);
  const [modal_carga_academica_abierto, set_modal_carga_academica_abierto] = useState<boolean>(false);
  const [becario_carga_id, set_becario_carga_id] = useState<number>(BECARIOS_SEMESTRE_II[0].id);
  const [promedio_carga, set_promedio_carga] = useState<string>("82.5");
  const [archivo_record_nombre, set_archivo_record_nombre] = useState<string>("");
  const [archivo_record_url, set_archivo_record_url] = useState<string>("");
  const [archivo_record_tamano, set_archivo_record_tamano] = useState<string>("");
  const [archivo_historial_nombre, set_archivo_historial_nombre] = useState<string>("");
  const [archivo_historial_url, set_archivo_historial_url] = useState<string>("");
  const [archivo_historial_tamano, set_archivo_historial_tamano] = useState<string>("");
  const [subiendo_documentos, set_subiendo_documentos] = useState<boolean>(false);

  // Modal Visor de Documento PDF / Imagen
  const [visor_documento, set_visor_documento] = useState<{
    abierto: boolean;
    titulo: string;
    nombre_archivo: string;
    url?: string;
    es_pdf?: boolean;
  } | null>(null);

  const manejarSubirRecord = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Archivo demasiado pesado", { description: "El documento no debe exceder 15 MB." });
      return;
    }
    const tamano = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${(file.size / 1024).toFixed(0)} KB`;
    set_archivo_record_nombre(file.name);
    set_archivo_record_tamano(tamano);

    const reader = new FileReader();
    reader.onload = () => {
      set_archivo_record_url(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const manejarSubirHistorial = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Archivo demasiado pesado", { description: "El documento no debe exceder 15 MB." });
      return;
    }
    const tamano = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${(file.size / 1024).toFixed(0)} KB`;
    set_archivo_historial_nombre(file.name);
    set_archivo_historial_tamano(tamano);

    const reader = new FileReader();
    reader.onload = () => {
      set_archivo_historial_url(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const manejarEnviarConvalidacionAcademica = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!archivo_record_nombre && !archivo_record_url) {
      toast.error("Récord Académico obligatorio", {
        description: "Debe adjuntar el Récord Académico del semestre en PDF o imagen.",
      });
      return;
    }

    if (!archivo_historial_nombre && !archivo_historial_url) {
      toast.error("Historial Académico obligatorio", {
        description: "Debe adjuntar el Historial Académico / Kárdex legalizado en PDF o imagen.",
      });
      return;
    }

    const promedio_num = parseFloat(promedio_carga);
    if (isNaN(promedio_num) || promedio_num < 0 || promedio_num > 100) {
      toast.error("Promedio inválido", { description: "Ingrese un promedio numérico válido entre 0 y 100 pts." });
      return;
    }

    set_subiendo_documentos(true);

    const becario_sel = BECARIOS_SEMESTRE_II.find((b) => b.id === becario_carga_id) || BECARIOS_SEMESTRE_II[0];

    try {
      await clienteApi.post("/api/evaluaciones/receptor/academica", {
        becario_id: becario_sel.id,
        periodo_id: 2,
        promedio_academico: promedio_num,
        archivo_record_academico: archivo_record_nombre,
        archivo_historial_academico: archivo_historial_nombre,
      });
    } catch {
      // Fallback local continuo si backend no responde
    }

    const nuevo_doc: DocumentoAcademicoSemestral = {
      id: Date.now(),
      becario_id: becario_sel.id,
      becario_nombre: becario_sel.nombre_completo,
      carrera: becario_sel.carrera,
      universidad: becario_sel.universidad,
      periodo: "Semestre II - 2026",
      promedio_semestral: promedio_num,
      record_archivo_nombre: archivo_record_nombre,
      record_archivo_url: archivo_record_url || MUESTRA_KARDEX_PDF_SVG,
      record_archivo_tamano: archivo_record_tamano || "1.2 MB",
      historial_archivo_nombre: archivo_historial_nombre,
      historial_archivo_url: archivo_historial_url || MUESTRA_KARDEX_PDF_SVG,
      historial_archivo_tamano: archivo_historial_tamano || "2.1 MB",
      estado: promedio_num >= 75 ? "convalidado" : "observado",
      fecha_recepcion: new Date().toISOString().split("T")[0],
    };

    set_documentos_academicos((prev) => [nuevo_doc, ...prev.filter((d) => d.becario_id !== becario_sel.id)]);
    set_subiendo_documentos(false);
    set_modal_carga_academica_abierto(false);

    // Resetear formulario
    set_archivo_record_nombre("");
    set_archivo_record_url("");
    set_archivo_record_tamano("");
    set_archivo_historial_nombre("");
    set_archivo_historial_url("");
    set_archivo_historial_tamano("");

    toast.success("Documentación académica recibida exitosamente", {
      description: `Récord e Historial de ${becario_sel.nombre_completo} vinculados con promedio de ${promedio_num} pts.`,
    });
  };

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
                ? "bg-[#035683] text-white shadow-xs"
                : "text-slate-700 hover:text-[#035683] hover:bg-white/80"
            }`}
          >
            <Table2 className="w-3.5 h-3.5 text-[#FFB600]" />
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
                ? "bg-[#035683] text-white shadow-xs"
                : "text-slate-700 hover:text-[#035683] hover:bg-white/80"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#00ABBD]" />
            <span>1. Iglesia (F-03)</span>
          </button>

          <button
            type="button"
            onClick={() => set_pestaña_activa("academica")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              pestaña_activa === "academica"
                ? "bg-[#035683] text-white shadow-xs"
                : "text-slate-700 hover:text-[#035683] hover:bg-white/80"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-[#00ABBD]" />
            <span>2. Académica (≥75)</span>
          </button>

          <button
            type="button"
            onClick={() => set_pestaña_activa("mentor")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              pestaña_activa === "mentor"
                ? "bg-[#035683] text-white shadow-xs"
                : "text-slate-700 hover:text-[#035683] hover:bg-white/80"
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-[#00ABBD]" />
            <span>3. Mentor (QR)</span>
            {es_supervisor && !es_admin && (
              <Badge className="bg-[#FFB600] text-[#035683] text-[9px] font-bold px-1.5 py-0 shadow-none border-none">
                Asignado
              </Badge>
            )}
          </button>

          <button
            type="button"
            onClick={() => set_pestaña_activa("lideres")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              pestaña_activa === "lideres"
                ? "bg-[#035683] text-white shadow-xs"
                : "text-slate-700 hover:text-[#035683] hover:bg-white/80"
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#00ABBD]" />
            <span>4. Escuela de Líderes</span>
          </button>

          <button
            type="button"
            onClick={() => set_pestaña_activa("socioeconomica")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              pestaña_activa === "socioeconomica"
                ? "bg-[#035683] text-white shadow-xs"
                : "text-slate-700 hover:text-[#035683] hover:bg-white/80"
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5 text-[#00ABBD]" />
            <span>5. Socioeconómica (26P)</span>
          </button>

          <button
            type="button"
            onClick={() => set_pestaña_activa("periodos")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              pestaña_activa === "periodos"
                ? "bg-[#035683] text-white shadow-xs"
                : "text-slate-700 hover:text-[#035683] hover:bg-white/80"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-[#00ABBD]" />
            <span>Ponderaciones y Criterios</span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-2 shrink-0">
          <Badge variant="outline" className="font-mono text-xs border-slate-300 text-[#035683] bg-white px-2.5 py-1 font-bold">
            {periodo_actual_info.titulo}
          </Badge>
          {es_admin && (
            <Button
              size="sm"
              onClick={() => set_modal_nuevo_semestre_abierto(true)}
              className="h-8 px-3 bg-[#035683] hover:bg-[#035683]/90 text-white font-bold rounded-xl text-xs gap-1.5 shadow-xs"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-[#FFB600]" />
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
            <Card className="border-[#E5E7EB] bg-gradient-to-br from-[#035683] to-[#035683] text-white rounded-2xl shadow-xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[11px] font-mono text-[#00ABBD] uppercase font-bold tracking-wider">
                    Becarios en Programa
                  </p>
                  <h3 className="text-3xl font-display font-bold text-[#FFB600]">
                    {total_becarios} <span className="text-sm font-normal text-white/70">titulares</span>
                  </h3>
                  <p className="text-xs text-white/90 font-medium pt-0.5">
                    100% Expedientes Semestre II
                  </p>
                </div>
                <div className="p-3 bg-white/10 rounded-2xl">
                  <Users className="w-8 h-8 text-[#FFB600]" />
                </div>
              </CardContent>
            </Card>

            {/* KPI 2: Aprobación Óptima */}
            <Card className="border-[#E5E7EB] bg-white rounded-2xl shadow-xs">
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
            <Card className="border-[#E5E7EB] bg-white rounded-2xl shadow-xs">
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
            <Card className="border-[#E5E7EB] bg-white rounded-2xl shadow-xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[11px] font-mono text-muted-foreground uppercase font-bold tracking-wider">
                    Gobernanza Institucional
                  </p>
                  <h3 className="text-3xl font-display font-bold text-[#035683]">
                    5 / 5 <span className="text-sm font-normal text-muted-foreground">módulos</span>
                  </h3>
                  <div className="pt-0.5">
                    {acta_convalidada ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-xs py-0.5">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Convalidado en Sistema
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 font-bold text-[10px]">
                        Pendiente de Convalidación
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-[#00ABBD]/10 rounded-2xl">
                  <Scale className="w-8 h-8 text-[#00ABBD]" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sábana Maestra de Calificaciones Semestrales Oficiales */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold font-display text-[#035683] flex items-center gap-2">
                  <Table2 className="w-4 h-4 text-[#00ABBD]" />
                  Sábana Maestra de Calificaciones Semestrales Oficiales (14 Columnas)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Registros asentados por supervisores y pastores evaluadores · 21 Becarios titulares del Semestre II.
                </p>
              </div>

              {(es_admin || es_supervisor) && (
                <Button
                  onClick={() => {
                    set_acta_convalidada(true);
                    toast.success("Acta semestral convalidada en sistema", {
                      description: "El consolidado semestral ha sido acreditado formalmente con trazabilidad de sistema.",
                    });
                  }}
                  className="h-9 bg-[#035683] hover:bg-[#035683]/90 text-white font-bold rounded-xl text-xs gap-2 shadow-xs shrink-0"
                >
                  <ShieldCheck className="w-4 h-4 text-[#FFB600]" />
                  {acta_convalidada ? "Acta Convalidada en Sistema" : "Convalidar Acta en Sistema"}
                </Button>
              )}
            </div>

            <SabanaConsolidadoSemestral />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ESTRUCTURA FORMULARIO F-03 (MINISTERIAL / IGLESIA)      */}
      {/* ============================================================== */}
      {pestaña_activa === "iglesia_f03" && (
        <div className="space-y-6">
          <Card className="border-[#E5E7EB] bg-white rounded-2xl shadow-xs">
            <CardHeader className="border-b border-[#E5E7EB]/60 bg-slate-50/50 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-[#00ABBD] text-[#035683] font-bold text-[10px]">
                      Módulo 01 · 20% Oficial
                    </Badge>
                    <span className="text-xs text-muted-foreground">Evaluador: Pastor de la Iglesia Local</span>
                  </div>
                  <CardTitle className="text-lg font-bold text-[#035683] flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#00ABBD]" />
                    Gobernanza del Instrumento F-03 · Evaluación Ministerial del Becario
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Configure la estructura del formulario que el pastor responde semestralmente, la conexión con el catálogo de iglesias y sus 13 preguntas.
                  </CardDescription>
                </div>

                <Button
                  onClick={() => set_modal_preview_f03_abierto(true)}
                  className="h-10 px-4 bg-[#035683] hover:bg-[#035683]/90 text-white font-bold rounded-xl text-xs gap-2 shadow-xs shrink-0"
                >
                  <Eye className="w-4 h-4 text-[#FFB600]" />
                  Vista Previa del Formulario F-03
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Configuración de Conexión a Catálogo de Iglesias */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase text-[#035683] flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#00ABBD]" />
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
                      className={`h-7 text-xs font-bold rounded-lg ${campo_iglesia_conectado ? "bg-[#035683]" : ""}`}
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
                      className={`h-7 text-xs font-bold rounded-lg ${campo_pastor_conectado ? "bg-[#035683]" : ""}`}
                    >
                      {campo_pastor_conectado ? "Conectado" : "Texto Libre"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Muestra de Catálogo Actual de Iglesias */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-[#035683]">Directorio Institucional de Congregaciones Registradas (6)</Label>
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
                    <p className="font-bold text-[#035683]">Preguntas 1 a 4: Compromiso y Cargos</p>
                    <p className="text-[11px] text-muted-foreground">Frecuencia de asistencia (cultos y escuela dominical), compromiso en reuniones, cargos que ocupa en la iglesia y calidad de cumplimiento.</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <p className="font-bold text-[#035683]">Preguntas 5 a 8: Testimonio y Capacitación</p>
                    <p className="text-[11px] text-muted-foreground">Convicción de llamado, áreas en las que es ejemplo, asistencia a capacitaciones y testimonio dentro y fuera de la iglesia.</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <p className="font-bold text-[#035683]">Preguntas 9 a 10: Relaciones y Discipulado</p>
                    <p className="text-[11px] text-muted-foreground">Relaciones interpersonales con líderes y miembros, y desarrollo de nuevos líderes bajo su tutela.</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <p className="font-bold text-[#035683]">Preguntas 11 a 13: Fortalezas, Debilidades y Aporte</p>
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
                    <DialogTitle className="text-base font-bold text-[#035683] flex items-center gap-2">
                      <Eye className="w-4 h-4 text-[#00ABBD]" />
                      Vista Previa Interactiva: Formulario F-03 Ministerial
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Esta es la interfaz y flujo exacto que el pastor o supervisor utiliza para responder y emitir la acreditación institucional.
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
          <Card className="border-[#E5E7EB] bg-white rounded-2xl shadow-xs">
            <CardHeader className="border-b border-[#E5E7EB]/60 bg-slate-50/50 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-[#00ABBD] text-[#035683] font-bold text-[10px]">
                      Módulo 02 · 20% Oficial
                    </Badge>
                    <span className="text-xs text-muted-foreground">Evaluador: Acreditación de Kárdex Universitario</span>
                  </div>
                  <CardTitle className="text-lg font-bold text-[#035683] flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-[#00ABBD]" />
                    Gobernanza del Récord Académico y Normativa Contractual
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Definición de umbrales de promedio universitario, recepción de Kárdex oficial en PDF o imagen y registro contractual.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    onClick={() => set_sub_pestana_academica("estudiante")}
                    className="h-10 px-4 bg-[#035683] hover:bg-[#035683]/90 text-white font-bold rounded-xl text-xs gap-2 shadow-xs"
                  >
                    <Upload className="w-4 h-4 text-[#FFB600]" />
                    Ir a Carga de Notas y Kárdex
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Reglas Normativas Oficiales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#035683]">Umbral Contractual</span>
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold">
                      Obligatorio
                    </Badge>
                  </div>
                  <h4 className="text-2xl font-bold font-display text-[#035683]">≥ 75 Pts</h4>
                  <p className="text-xs text-muted-foreground">
                    Promedio mínimo exigido por contrato institucional de beca. Si es inferior a 75 pts, el expediente entra en estado de observación tutorial.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#035683]">Documentos Recibidos</span>
                    <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50 text-[10px] font-bold">
                      Semestre II - 2026
                    </Badge>
                  </div>
                  <h4 className="text-2xl font-bold font-display text-emerald-700">
                    {documentos_academicos.length} / {total_becarios}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Expedientes con Récord e Historial Académico convalidado en la plataforma oficial.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#035683]">Penalización Reprobación</span>
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
            </CardContent>
          </Card>

          {/* Sub-Navegación de Fases del Flujo de Evaluación Académica */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200">
            <Button
              type="button"
              variant={sub_pestana_academica === "estudiante" ? "default" : "ghost"}
              size="sm"
              onClick={() => set_sub_pestana_academica("estudiante")}
              className={`h-9 px-4 rounded-xl font-bold text-xs gap-2 ${
                sub_pestana_academica === "estudiante"
                  ? "bg-[#035683] text-white shadow-xs"
                  : "text-slate-600 hover:text-[#035683] hover:bg-white"
              }`}
            >
              <GraduationCap className="w-4 h-4 text-[#FFB600]" />
              1. Carga de Notas y Kárdex (Estudiante)
            </Button>

            <Button
              type="button"
              variant={sub_pestana_academica === "supervisor" ? "default" : "ghost"}
              size="sm"
              onClick={() => set_sub_pestana_academica("supervisor")}
              className={`h-9 px-4 rounded-xl font-bold text-xs gap-2 ${
                sub_pestana_academica === "supervisor"
                  ? "bg-[#035683] text-white shadow-xs"
                  : "text-slate-600 hover:text-[#035683] hover:bg-white"
              }`}
            >
              <UserCheck className="w-4 h-4 text-[#00ABBD]" />
              2. Revisión / Edición Tutorial (Opcional)
            </Button>

            <Button
              type="button"
              variant={sub_pestana_academica === "administracion" ? "default" : "ghost"}
              size="sm"
              onClick={() => set_sub_pestana_academica("administracion")}
              className={`h-9 px-4 rounded-xl font-bold text-xs gap-2 ${
                sub_pestana_academica === "administracion"
                  ? "bg-[#035683] text-white shadow-xs"
                  : "text-slate-600 hover:text-[#035683] hover:bg-white"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              3. Convalidación Central Directa (Administración)
            </Button>
          </div>

          {/* Banner Informativo de Deslinde de Responsabilidad para el Supervisor */}
          {es_supervisor && !es_admin && (
            <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl flex items-start gap-3">
              <Info className="w-5 h-5 text-[#007BBE] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#035683]">
                  Aviso Operativo para Supervisores — Convalidación Académica Centralizada
                </p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Los expedientes académicos y Kárdex radicados por los becarios son convalidados directamente por Administración central. La revisión tutorial (Pestaña 2) es de carácter complementario si el becario requiere apoyo. Su responsabilidad primordial asignada como evaluador está concentrada en el <strong>Módulo 3: Mentoría en Terreno (Rúbrica QR)</strong>.
                </p>
              </div>
            </div>
          )}

          {/* FASE 1: Formulario Estudiante */}
          {sub_pestana_academica === "estudiante" && (
            <div className="space-y-4">
              {(es_admin || es_supervisor) && (
                <Card className="border-slate-200 rounded-2xl bg-white p-4 shadow-2xs">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <Label className="text-xs font-bold text-[#035683]">Simular / Cargar como Becario:</Label>
                      <p className="text-[11px] text-muted-foreground">
                        Como supervisor o administrador, puede seleccionar a un becario específico para radicar o revisar sus notas y documentos.
                      </p>
                    </div>
                    <Select
                      value={String(becario_carga_id)}
                      onValueChange={(v) => v && set_becario_carga_id(Number(v))}
                    >
                      <SelectTrigger className="w-72 h-9 text-xs border-slate-200 rounded-xl bg-white font-medium">
                        <SelectValue placeholder="Seleccione un becario" />
                      </SelectTrigger>
                      <SelectContent className="max-h-56 bg-white border-slate-200 z-[100]">
                        {BECARIOS_SEMESTRE_II.map((b) => (
                          <SelectItem key={b.id} value={String(b.id)} etiqueta={`${b.nombre_completo} (${b.carrera})`}>
                            {b.nombre_completo} — {b.carrera} ({b.universidad})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </Card>
              )}

              <FormularioCargaNotasEstudiante
                becario_id={becario_carga_id}
                becario_nombre={
                  BECARIOS_SEMESTRE_II.find((b) => b.id === becario_carga_id)?.nombre_completo ||
                  "Estudiante Becario"
                }
                carrera={
                  BECARIOS_SEMESTRE_II.find((b) => b.id === becario_carga_id)?.carrera ||
                  "Carrera Universitaria"
                }
                universidad={
                  BECARIOS_SEMESTRE_II.find((b) => b.id === becario_carga_id)?.universidad ||
                  "Universidad"
                }
                periodo_id={periodo_activo === "s2" ? 2 : 1}
                periodo_nombre={periodo_activo === "s2" ? "Semestre II - 2026" : "Semestre I - 2026"}
                alAbrirVisor={(titulo, nombre_archivo, url) => {
                  set_visor_documento({
                    abierto: true,
                    titulo,
                    nombre_archivo,
                    url: url || MUESTRA_KARDEX_PDF_SVG,
                    es_pdf: nombre_archivo.toLowerCase().endsWith(".pdf"),
                  });
                }}
                alGuardarExitoso={(datos) => {
                  toast.success("Récord y documentos registrados satisfactoriamente.");
                }}
              />
            </div>
          )}

          {/* FASE 2: Pre-Evaluación y Edición por el Supervisor */}
          {sub_pestana_academica === "supervisor" && (
            <BandejaPreEvaluacionSupervisor
              alAbrirVisor={(titulo, nombre_archivo, url) => {
                set_visor_documento({
                  abierto: true,
                  titulo,
                  nombre_archivo,
                  url: url || MUESTRA_KARDEX_PDF_SVG,
                  es_pdf: nombre_archivo.toLowerCase().endsWith(".pdf"),
                });
              }}
              alAprobarPreEvaluacion={(datos) => {
                toast.success("Pre-evaluación enviada a la bandeja de Administración.");
              }}
            />
          )}

          {/* FASE 3: Convalidación Central por Administración */}
          {sub_pestana_academica === "administracion" && (
            <BandejaConvalidacionAdministracion
              alAbrirVisor={(titulo, nombre_archivo, url) => {
                set_visor_documento({
                  abierto: true,
                  titulo,
                  nombre_archivo,
                  url: url || MUESTRA_KARDEX_PDF_SVG,
                  es_pdf: nombre_archivo.toLowerCase().endsWith(".pdf"),
                });
              }}
              alConvalidarOficial={(evaluacion_id) => {
                toast.success("Calificaciones asentadas en Matriz 360 y Sábana Semestral.");
              }}
            />
          )}
          {/* Diálogo Modal de Carga Rápida de Kárdex */}
          <Dialog open={modal_carga_academica_abierto} onOpenChange={set_modal_carga_academica_abierto}>
            <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-white rounded-2xl shadow-2xl">
              <DialogHeader className="p-6 pb-4 border-b border-[#E5E7EB] bg-white">
                <DialogTitle className="text-base font-bold text-[#035683] flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[#00ABBD]" />
                  Subir Documentos Académicos de Becario
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Radique el Récord Académico e Historial oficial en PDF o imagen para convalidación contractual.
                </DialogDescription>
              </DialogHeader>

              <DialogBody className="space-y-4">
                <div>
                  <Label className="text-xs font-bold text-[#035683] block mb-1">Becario Solicitante</Label>
                  <Select
                    value={String(becario_carga_id)}
                    onValueChange={(v) => v && set_becario_carga_id(Number(v))}
                  >
                    <SelectTrigger className="h-10 text-xs border-[#E5E7EB] rounded-xl font-medium">
                      <SelectValue placeholder="Seleccione el becario" />
                    </SelectTrigger>
                    <SelectContent className="max-h-56 bg-white border-[#E5E7EB] z-[100]">
                      {BECARIOS_SEMESTRE_II.map((b) => (
                        <SelectItem key={b.id} value={String(b.id)} etiqueta={`${b.nombre_completo} (${b.carrera})`}>
                          {b.nombre_completo} ({b.carrera})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-bold text-[#035683] block mb-1">Promedio General Semestral</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={promedio_carga}
                    onChange={(e) => set_promedio_carga(e.target.value)}
                    placeholder="Ej. 82.5"
                    className="h-10 text-xs border-[#E5E7EB] rounded-xl font-bold"
                  />
                </div>

                {/* Subir Récord */}
                <div>
                  <Label className="text-xs font-bold text-[#035683] block mb-1">
                    1. Récord Académico Semestral (PDF / Imagen) *
                  </Label>
                  <div className="relative border-2 border-dashed border-[#E5E7EB] hover:border-[#00ABBD] rounded-xl p-3 bg-slate-50 text-center">
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={manejarSubirRecord}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />
                    {archivo_record_nombre ? (
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                        <span className="truncate max-w-[280px]">{archivo_record_nombre}</span>
                        <Badge variant="outline" className="text-[10px] border-emerald-300">Listo</Badge>
                      </div>
                    ) : (
                      <div className="py-2 text-muted-foreground text-xs">
                        <Upload className="w-5 h-5 text-[#00ABBD] mx-auto mb-1" />
                        <span>Clic para adjuntar Récord Académico</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subir Historial */}
                <div>
                  <Label className="text-xs font-bold text-[#035683] block mb-1">
                    2. Historial Académico / Kárdex (PDF / Imagen) *
                  </Label>
                  <div className="relative border-2 border-dashed border-[#E5E7EB] hover:border-[#00ABBD] rounded-xl p-3 bg-slate-50 text-center">
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={manejarSubirHistorial}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />
                    {archivo_historial_nombre ? (
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                        <span className="truncate max-w-[280px]">{archivo_historial_nombre}</span>
                        <Badge variant="outline" className="text-[10px] border-emerald-300">Listo</Badge>
                      </div>
                    ) : (
                      <div className="py-2 text-muted-foreground text-xs">
                        <Upload className="w-5 h-5 text-[#00ABBD] mx-auto mb-1" />
                        <span>Clic para adjuntar Historial Académico</span>
                      </div>
                    )}
                  </div>
                </div>
              </DialogBody>

              <DialogFooter className="p-4 px-6 border-t border-[#E5E7EB] bg-slate-50 flex sm:justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => set_modal_carga_academica_abierto(false)}
                  className="h-9 rounded-xl border-[#E5E7EB] text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={() => manejarEnviarConvalidacionAcademica()}
                  disabled={subiendo_documentos}
                  className="h-9 px-4 bg-[#035683] hover:bg-[#035683]/90 text-white font-bold rounded-xl text-xs"
                >
                  {subiendo_documentos ? "Subiendo..." : "Subir y Convalidar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal Visor de Documento PDF / Imagen */}
          {visor_documento && (
            <Dialog
              open={visor_documento.abierto}
              onOpenChange={(abierto) => !abierto && set_visor_documento(null)}
            >
              <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-white rounded-2xl shadow-2xl">
                <DialogHeader className="p-4 px-6 border-b border-[#E5E7EB] bg-slate-50 flex flex-row items-center justify-between">
                  <div>
                    <DialogTitle className="text-base font-bold text-[#035683] flex items-center gap-2">
                      <FileText className="w-4 h-4 text-rose-600" />
                      {visor_documento.titulo}
                    </DialogTitle>
                    <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                      {visor_documento.nombre_archivo}
                    </p>
                  </div>
                  <Badge variant="outline" className="border-emerald-300 text-emerald-800 bg-emerald-50 text-[10px] font-bold">
                    Acreditación Validada
                  </Badge>
                </DialogHeader>

                <div className="p-4 bg-slate-100 flex items-center justify-center min-h-[300px] max-h-[60vh] overflow-auto">
                  {visor_documento.url ? (
                    <img
                      src={visor_documento.url}
                      alt={visor_documento.nombre_archivo}
                      className="max-h-[50vh] max-w-full rounded-xl shadow-md border border-slate-300 object-contain bg-white"
                    />
                  ) : (
                    <div className="text-center p-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                      <p className="text-xs font-semibold">Documento digitalizado almacenado en el repositorio institucional.</p>
                    </div>
                  )}
                </div>

                <DialogFooter className="p-4 px-6 border-t border-[#E5E7EB] bg-white flex sm:justify-between items-center">
                  <span className="text-[11px] text-muted-foreground">
                    Verificación y trazabilidad institucional BUMAND
                  </span>
                  <div className="flex items-center gap-2">
                    {visor_documento.url && (
                      <a
                        href={visor_documento.url}
                        download={visor_documento.nombre_archivo}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#035683] text-[#035683] text-xs font-bold hover:bg-[#035683]/5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar</span>
                      </a>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => set_visor_documento(null)}
                      className="h-8 rounded-lg border-[#E5E7EB] text-xs"
                    >
                      Cerrar
                    </Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: ESTRUCTURA MENTOR / SUPERVISOR VÍA QR (21 REACTIVOS)   */}
      {/* ============================================================== */}
      {pestaña_activa === "mentor" && (
        <div className="space-y-6">
          {/* TAREA-02: TABLA "MIS BECARIOS ASIGNADOS — EVALUACIÓN DE SUPERVISOR (MÓDULO 3)" */}
          <Card className="border-[#00ABBD]/40 bg-white rounded-2xl shadow-xs overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#035683]/5 via-[#00ABBD]/5 to-white border-b border-slate-100 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#035683] text-white font-bold text-[10px]">
                    Perfil Web del Supervisor
                  </Badge>
                  <span className="text-xs text-muted-foreground">Módulo 03 · 20% Oficial BUMAND</span>
                </div>
                <CardTitle className="text-base font-bold text-[#035683] flex items-center gap-2 mt-1">
                  <UserCheck className="w-5 h-5 text-[#00ABBD]" />
                  Mis Becarios Asignados — Evaluación de Supervisor (Módulo 3)
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Llene o edite las calificaciones de desempeño diaconal de sus becarios asignados con validación obligatoria de identidad vía código OTP.
                </CardDescription>
              </div>

              <Badge variant="outline" className="border-[#035683] text-[#035683] font-mono text-xs font-bold px-3 py-1">
                {becarios_asignados_modulo3.filter((b) => b.estado === "evaluado").length} / {becarios_asignados_modulo3.length} Evaluados
              </Badge>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/70">
                  <TableRow>
                    <TableHead className="w-12 text-center text-xs font-bold text-slate-600">#</TableHead>
                    <TableHead className="text-xs font-bold text-slate-600">Becario y Universidad</TableHead>
                    <TableHead className="text-xs font-bold text-slate-600">Unidad o Agencia Asignada</TableHead>
                    <TableHead className="text-center text-xs font-bold text-slate-600">Estado Módulo 3</TableHead>
                    <TableHead className="text-center text-xs font-bold text-slate-600">Nota (/20 Pts)</TableHead>
                    <TableHead className="text-right text-xs font-bold text-slate-600 pr-5">Acción Directa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {becarios_asignados_modulo3.map((bec, idx) => {
                    const esta_evaluado = bec.estado === "evaluado";

                    return (
                      <TableRow key={bec.id} className="hover:bg-slate-50/60">
                        <TableCell className="text-center font-mono text-xs text-slate-500 font-semibold">
                          {idx + 1}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-xs font-bold text-[#035683]">{bec.nombre}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {bec.carrera} · <span className="font-semibold">{bec.universidad}</span>
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-[#00ABBD]" />
                            {bec.unidad_agencia}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {esta_evaluado ? (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-[10px] gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Evaluado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-amber-400 bg-amber-50 text-amber-800 font-bold text-[10px] gap-1">
                              <Clock className="w-3 h-3 text-amber-600" /> Pendiente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {esta_evaluado && bec.nota_final_20 !== undefined ? (
                            <span className="text-xs font-mono font-black text-[#035683] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                              {bec.nota_final_20.toFixed(1)} / 20 pts
                            </span>
                          ) : (
                            <span className="text-[11px] font-mono text-slate-400 italic">-- / 20</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right pr-5">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => {
                              set_becario_mentor_seleccionado(bec);
                              set_modal_formulario_mentor_abierto(true);
                            }}
                            className={`h-8 px-3 rounded-xl font-bold text-xs gap-1.5 shadow-2xs ${
                              esta_evaluado
                                ? "bg-white hover:bg-slate-50 text-[#035683] border border-[#035683]/40"
                                : "bg-[#035683] hover:bg-[#024063] text-white"
                            }`}
                          >
                            <UserCheck className="w-3.5 h-3.5 text-[#FFB600]" />
                            {esta_evaluado
                              ? "Editar Evaluación (Módulo 3)"
                              : "Llenar Evaluación (Módulo 3)"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Modal Oficial de Evaluación del Supervisor / Mentor */}
          {becario_mentor_seleccionado && (
            <FormularioMentorModal
              abierto={modal_formulario_mentor_abierto}
              alCambiarAbierto={set_modal_formulario_mentor_abierto}
              becario_id={becario_mentor_seleccionado.id}
              nombre_becario={becario_mentor_seleccionado.nombre}
              unidad_agencia_inicial={becario_mentor_seleccionado.unidad_agencia}
              evaluacion_inicial={becario_mentor_seleccionado.evaluacion_datos}
              modalidad_llenado="perfil_supervisor"
              alGuardarExito={(nota) => {
                set_becarios_asignados_modulo3((prev) =>
                  prev.map((b) =>
                    b.id === becario_mentor_seleccionado.id
                      ? {
                          ...b,
                          estado: "evaluado",
                          nota_final_20: nota,
                          fecha_evaluacion: new Date().toISOString().substring(0, 10),
                          evaluacion_datos: {
                            ...b.evaluacion_datos,
                            nota_final_20: nota,
                            fecha: new Date().toISOString().substring(0, 10),
                            identidad_verificada: true,
                          },
                        }
                      : b
                  )
                );
              }}
            />
          )}

          <Card className="border-[#E5E7EB] bg-white rounded-2xl shadow-xs">
            <CardHeader className="border-b border-[#E5E7EB]/60 bg-slate-50/50 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-[#00ABBD] text-[#035683] font-bold text-[10px]">
                      Módulo 03 · 20% Oficial
                    </Badge>
                    <span className="text-xs text-muted-foreground">Evaluador: Mentor / Supervisor Diaconía en Terreno</span>
                  </div>
                  <CardTitle className="text-lg font-bold text-[#035683] flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-[#00ABBD]" />
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
                    className="h-10 px-3 border-[#035683] text-[#035683] font-bold rounded-xl text-xs gap-1.5 hover:bg-[#035683]/5"
                  >
                    <QrCode className="w-4 h-4 text-[#00ABBD]" />
                    Ver Código QR
                  </Button>

                  <Button
                    onClick={() => set_modal_preview_mentor_abierto(true)}
                    className="h-10 px-4 bg-[#035683] hover:bg-[#035683]/90 text-white font-bold rounded-xl text-xs gap-2 shadow-xs"
                  >
                    <Eye className="w-4 h-4 text-[#FFB600]" />
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
                    <span className="text-xs font-bold text-[#035683]">Sección I: 18 Reactivos de Desempeño</span>
                    <Badge variant="outline" className="border-slate-300 font-mono text-[10px]">Escala 1 a 10</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Evalúa cumplimiento, calidad, iniciativa, trabajo en equipo, respeto y valores de Diaconía IFD. Promedio directo escalado a <strong>10 Puntos</strong>.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#035683]">Sección II: 3 Preguntas Abiertas (19, 20, 21)</span>
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
                        <span className="w-5 h-5 rounded-full bg-[#035683]/10 text-[#035683] font-mono font-bold flex items-center justify-center text-[10px]">
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
                <DialogTitle className="text-[#035683] font-bold text-base flex items-center justify-center gap-2">
                  <QrCode className="w-5 h-5 text-[#00ABBD]" />
                  Código QR de Acceso Institucional
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Escanee este código con la cámara de su móvil para acceder al formulario web de evaluación de mentoría.
                </DialogDescription>
              </DialogHeader>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 inline-block mx-auto">
                <div className="w-48 h-48 bg-white border-2 border-[#035683] rounded-xl flex items-center justify-center shadow-inner">
                  <QrCode className="w-36 h-36 text-[#035683]" />
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
                <DialogTitle className="text-base font-bold text-[#035683] flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#00ABBD]" />
                  Vista Previa: Instrumento de Mentoría en Terreno
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Simulación de la rúbrica móvil de 18 notas escalares y 3 campos abiertos que responde el tutor.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-3">
                <div className="p-4 bg-[#035683]/5 border border-[#00ABBD]/30 rounded-xl text-xs space-y-1">
                  <p className="font-bold text-[#035683]">Instrucciones para el Mentor:</p>
                  <p className="text-muted-foreground">Califique de 1 (deficiente) a 10 (excelente) cada reactivo de desempeño profesional y complete las preguntas cualitativas.</p>
                </div>
                <div className="space-y-2">
                  {PREGUNTAS_MENTOR_ESCALA.slice(0, 5).map((p) => (
                    <div key={p.numero} className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                      <span className="font-medium text-slate-800">{p.numero}. {p.enunciado}</span>
                      <span className="font-mono font-bold text-[#035683] bg-slate-100 px-2 py-1 rounded-lg">10 / 10</span>
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
        <EscuelaLideresClassroom es_supervisor_o_admin={es_supervisor || es_admin} />
      )}

      {/* ============================================================== */}
      {/* TAB 6: ESTRUCTURA SOCIOECONÓMICA (BIENESTAR 26P)               */}
      {/* ============================================================== */}
      {pestaña_activa === "socioeconomica" && (
        <div className="space-y-6">
          <Card className="border-[#E5E7EB] bg-white rounded-2xl shadow-xs">
            <CardHeader className="border-b border-[#E5E7EB]/60 bg-slate-50/50 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-[#00ABBD] text-[#035683] font-bold text-[10px]">
                      Módulo 05 · 20% Oficial
                    </Badge>
                    <span className="text-xs text-muted-foreground">Evaluador: Área de Trabajo Social</span>
                  </div>
                  <CardTitle className="text-lg font-bold text-[#035683] flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5 text-[#00ABBD]" />
                    Gobernanza del Cuestionario de Bienestar Universitario (26 Preguntas)
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Catálogo oficial de reactivos del diagnóstico socioeconómico y bienestar estudiantil.
                  </CardDescription>
                </div>

                <Button
                  onClick={() => set_modal_preview_socioeconomica_abierto(true)}
                  className="h-10 px-4 bg-[#035683] hover:bg-[#035683]/90 text-white font-bold rounded-xl text-xs gap-2 shadow-xs shrink-0"
                >
                  <Eye className="w-4 h-4 text-[#FFB600]" />
                  Vista Previa Cuestionario 26P
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              

              {/* Muestra de las 26 Preguntas */}
              <div className="space-y-3">
                <Label className="text-xs font-mono uppercase font-bold text-slate-600">
                  Banco de Preguntas Canónicas de Bienestar Personal, Social y Universitario (26 Reactivos)
                </Label>
                <div className="space-y-2">
                  {PREGUNTAS_BIENESTAR_INICIALES.slice(0, 6).map((p) => (
                    <div key={p.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#035683]/10 text-[#035683] font-mono font-bold flex items-center justify-center text-[10px]">
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
                <DialogTitle className="text-base font-bold text-[#035683] flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#00ABBD]" />
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
          <Card className="border-[#00ABBD] bg-white rounded-2xl shadow-xs overflow-hidden">
            <CardHeader className="bg-[#00ABBD]/10 pb-3 border-b border-[#00ABBD]/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-bold text-[#035683] flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-[#00ABBD]" />
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
                    className="h-8 px-4 bg-[#035683] hover:bg-[#035683]/90 text-white font-bold rounded-lg text-xs shadow-xs"
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
                      <span className="font-mono font-bold text-xs text-[#035683]">
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
            <h3 className="text-sm font-bold font-display text-[#035683] flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#00ABBD]" />
              Escala y Rangos de Aprobación Oficial Institucional (Diaconía FRIF-IFD)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {RANGOS_APROBACION_OFICIALES.map((r, i) => (
                <div key={i} className="p-4 bg-white rounded-xl border border-[#E5E7EB] space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#035683]">{r.calificacion}</span>
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
            <h3 className="text-sm font-bold font-display text-[#035683] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#00ABBD]" />
              Matriz Normativa de Criterios Canónicos Semestrales
            </h3>
            <CriteriosEvaluacionTabla />
          </div>

          {/* Gestión de Periodos Semestrales */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold font-display text-[#035683] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#00ABBD]" />
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
                        ? "bg-[#035683]/5 border-[#00ABBD] shadow-xs"
                        : "bg-white border-[#E5E7EB] hover:border-slate-300"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#035683]">{p.titulo}</span>
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
      {/* Modal para Crear Nuevo Semestre */}
      <Dialog open={modal_nuevo_semestre_abierto} onOpenChange={set_modal_nuevo_semestre_abierto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#035683] font-bold text-base flex items-center gap-2">
              <CalendarPlus className="w-5 h-5 text-[#00ABBD]" />
              Apertura de Nuevo Semestre Institucional
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Habilita un nuevo periodo evaluativo con base estándar del 20% y registro de expedientes.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={manejarCrearNuevoSemestre} className="flex flex-col flex-1 min-h-0">
            <DialogBody className="space-y-3">
              <div>
                <Label className="text-xs">Título del Semestre</Label>
                <Input
                  value={nuevo_titulo}
                  onChange={(e) => set_nuevo_titulo(e.target.value)}
                  placeholder="Ej. Semestre I – 2027"
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
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => set_modal_nuevo_semestre_abierto(false)}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" className="bg-[#035683] hover:bg-[#035683]/90 font-bold">
                Habilitar Semestre
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
