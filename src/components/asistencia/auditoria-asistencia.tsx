"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Search,
  Filter,
  ShieldCheck,
  Eye,
  Check,
  Building,
  User,
  Calendar,
  Sparkles,
  Wifi,
  WifiOff,
  Navigation,
  RefreshCw,
  X,
  ExternalLink,
  Coins,
  Map,
  ListChecks,
  Plus,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TarjetaSpotlight,
  ContadorRodilloAnimado,
  BotonJuicy,
  InsigniaPulsoVivo,
} from "@/components/animaciones";
import { clienteApi } from "@/lib/cliente-api";
import { useConsulta } from "@/hooks/useConsulta";
import { useTiempoReal } from "@/hooks/useTiempoReal";
import { useConfirmacionDialogo } from "@/hooks/useConfirmacionDialogo";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import { toast } from "sonner";

export interface RegistroAuditoriaAsistencia {
  id: number;
  becario_id: number;
  becario_nombre: string;
  carrera: string;
  sede_nombre: string;
  fecha: string;
  hora_ingreso: string;
  hora_salida: string | null;
  horas_trabajadas: number | null;
  distancia_ingreso_m: number;
  dentro_de_radio: boolean;
  dentro_de_horario: boolean;
  estado: "conforme" | "tardanza" | "fuera_geocerca" | "en_curso" | "convalidado";
  convalidado_por?: string | null;
  motivo_convalidacion?: string | null;
  lat_ingreso?: number;
  lng_ingreso?: number;
  es_viernes?: boolean;
  minutos_retraso?: number;
  monto_multa_bs?: number;
  confirmacion_presencial?: boolean;
  tipo_actividad?: "practicas" | "escuela_lideres" | "acciones_servicio";
  motivo_contingencia?: string;
  es_registro_manual?: boolean;
}

export interface BecarioOficial {
  id: number;
  nombre: string;
  ci: string;
  carrera: string;
  unidad: string;
  iglesia: string;
}

export const LISTA_23_BECARIOS_OFICIALES: BecarioOficial[] = [
  { id: 1, nombre: "Adai Belen Huayta Cardozo", ci: "13696496", carrera: "Estadística", unidad: "Productos y Canales", iglesia: "Sinai Los Andes" },
  { id: 2, nombre: "Daniel Davalos Quiñonez", ci: "9107373", carrera: "Informática", unidad: "Seguridad Física", iglesia: "IGLESIA METODISTA MONTE DE HOREB" },
  { id: 3, nombre: "Edgar Elías Alarcon Huanca", ci: "9160054", carrera: "Medicina", unidad: "Consultorio Médico", iglesia: "Eli - Ezer" },
  { id: 4, nombre: "Nilda Amalia Churata Paye", ci: "10028341", carrera: "Educación Parvularia", unidad: "Seguridad Física", iglesia: "Iglesia Evangélica Amigos Central de Bolivia" },
  { id: 5, nombre: "Alejandro Roberth Paredes Tarquino", ci: "10064956", carrera: "Comunicación Social", unidad: "Marketing y Comunicación", iglesia: "Centró Evangelistico Caluyo" },
  { id: 6, nombre: "Aydee Ruth Ali Condori", ci: "9952878", carrera: "Contaduría Pública", unidad: "Finanzas y Tesorería", iglesia: "Iglesia del Nazareno El Progreso" },
  { id: 7, nombre: "Carlos Oscar Luna Lizarraga", ci: "9943280", carrera: "Economía", unidad: "Auditoría Interna", iglesia: "Nazareno 6 de junio" },
  { id: 8, nombre: "Isaías Daniel Herrera Mamani", ci: "10920862", carrera: "Arquitectura", unidad: "Subgerencia Nacional de Administración", iglesia: "Bautista para la familia" },
  { id: 9, nombre: "José Marcos Suñagua Quispe", ci: "14378720", carrera: "Informática", unidad: "Riesgos", iglesia: "6 de Junio" },
  { id: 10, nombre: "Mariela Dayana Jimenez Chambi", ci: "12959656", carrera: "Contaduría Pública", unidad: "Seguros", iglesia: "Ministerio misión Boliviana" },
  { id: 11, nombre: "Mayherli Alejandra Loza Villalobos", ci: "9925727", carrera: "Contaduría Pública", unidad: "Finanzas y Tesorería", iglesia: "CANAAN" },
  { id: 12, nombre: "Noemi Callisaya Alvarez", ci: "7093658", carrera: "Psicomotricidad y Deportes", unidad: "Consultorio Médico", iglesia: "\"El Progreso\"" },
  { id: 13, nombre: "Ronald Mauricio Quiquijana Mayta", ci: "6172054", carrera: "Ingeniería en Telecomunicaciones", unidad: "Seguridad de la Información", iglesia: "Centro Evangelistico Caluyo" },
  { id: 14, nombre: "Ruddy Flores Tapia", ci: "9974211", carrera: "Informática", unidad: "Planificación, Control y Presupuesto", iglesia: "Iglesia del Nazareno Río Seco" },
  { id: 15, nombre: "Gonzalo Valencia Laura", ci: "8416501", carrera: "Contaduría Pública", unidad: "Contabilidad e Impuestos", iglesia: "Iglesia Central El Alto" },
  { id: 16, nombre: "Gustavo Ariel Condori Montaño", ci: "13088041", carrera: "Contaduría Pública", unidad: "Captaciones y Canales", iglesia: "Iglesia Central El Alto" },
  { id: 17, nombre: "Lisbeth Pacasi Machaca", ci: "13603536", carrera: "Bioquímica y Farmacia", unidad: "Consultorio Médico", iglesia: "Iglesia Central El Alto" },
  { id: 18, nombre: "Selena Fernanda Pillco Mamani", ci: "13693151", carrera: "Economía", unidad: "Captaciones y Canales", iglesia: "Iglesia Central El Alto" },
  { id: 19, nombre: "Milenka Quispe Coarite", ci: "14155448", carrera: "Administración de Empresas", unidad: "Procesos y Normas", iglesia: "Iglesia Central El Alto" },
  { id: 20, nombre: "Joselin Wara Huanca Paucara", ci: "12604724", carrera: "Contaduría Pública", unidad: "Cumplimiento", iglesia: "Iglesia Central El Alto" },
  { id: 21, nombre: "Johan Ludving Misme Flores", ci: "9208456", carrera: "Informática", unidad: "Seguridad de la Información", iglesia: "Iglesia Central El Alto" },
  { id: 22, nombre: "Matias Jose Uri Flores", ci: "13627440", carrera: "Lingüística e Idiomas", unidad: "Sostenibilidad y Responsabilidad Diaconal", iglesia: "Iglesia Central El Alto" },
  { id: 23, nombre: "Mateo Miguel Cussi Flores", ci: "8411610", carrera: "Informática", unidad: "Seguros", iglesia: "Iglesia Central El Alto" },
];

export const SEDES_POR_ACTIVIDAD = {
  practicas: [
    "Oficina Central Bloque A",
    "Oficina Central Bloque B",
    "Agencia Villa Dolores",
    "Sucursal Juan Pablo II",
    "Sucursal Villa Adela",
    "Centro Infantil Sagrada Familia",
    "Consultorio Médico San Lucas",
    "Hogar de Niños Amor y Esperanza",
  ],
  escuela_lideres: [
    "Sede Central (Auditorio Central Diaconía)",
    "Escuela de Líderes - Módulo A (Salón Principal)",
    "Escuela de Líderes - Salón Metodista",
    "Auditorio Centro Bíblico de Formación",
  ],
  acciones_servicio: [
    "Iglesia Central El Alto (Acción Solidaria)",
    "Sinai Los Andes (Comedor y Apoyo Comunitario)",
    "Iglesia Metodista Monte de Horeb (Taller Educativo)",
    "Centró Evangelistico Caluyo (Campaña Médica Diaconal)",
    "Iglesia del Nazareno El Progreso (Apoyo Escolar)",
    "Campaña Diaconal Comunitaria (Feria Solidaria)",
    "Comedor Solidario Infantil San Lucas",
  ],
};

export const MOTIVOS_CONTINGENCIA = [
  "Sin megas / sin conexión a internet en el celular",
  "Olvido involuntario de marcación en app",
  "Batería agotada / falla del dispositivo",
  "Problemas de cobertura satelital GPS en sede",
];

export function calcularHorasTranscurridas(ingreso: string, salida: string): number {
  if (!ingreso || !salida) return 0;
  const [h_ing, m_ing] = ingreso.split(":").map(Number);
  const [h_sal, m_sal] = salida.split(":").map(Number);
  if (isNaN(h_ing) || isNaN(m_ing) || isNaN(h_sal) || isNaN(m_sal)) return 0;
  const minutos = (h_sal * 60 + m_sal) - (h_ing * 60 + m_ing);
  if (minutos <= 0) return 0;
  return Math.round((minutos / 60) * 100) / 100;
}

const REGISTROS_AUDITORIA_INICIALES: RegistroAuditoriaAsistencia[] = [
  {
    id: 1,
    becario_id: 101,
    becario_nombre: "Nilda Amalia Churata Paye",
    carrera: "Educación Parvularia",
    sede_nombre: "Centro Infantil Sagrada Familia",
    fecha: "2026-10-09",
    hora_ingreso: "08:12",
    hora_salida: null,
    horas_trabajadas: 4.2,
    distancia_ingreso_m: 35,
    dentro_de_radio: true,
    dentro_de_horario: true,
    estado: "en_curso",
    lat_ingreso: -16.5023,
    lng_ingreso: -68.1511,
    es_viernes: true,
    minutos_retraso: 0,
    monto_multa_bs: 0,
    confirmacion_presencial: true,
  },
  {
    id: 2,
    becario_id: 102,
    becario_nombre: "Edgar Elias Alarcon Huanca",
    carrera: "Ingeniería de Sistemas",
    sede_nombre: "Oficina Central Bloque A",
    fecha: "2026-10-09",
    hora_ingreso: "08:45",
    hora_salida: null,
    horas_trabajadas: 3.5,
    distancia_ingreso_m: 48,
    dentro_de_radio: true,
    dentro_de_horario: false,
    estado: "tardanza",
    lat_ingreso: -16.4998,
    lng_ingreso: -68.1502,
    es_viernes: true,
    minutos_retraso: 45,
    monto_multa_bs: 0,
    confirmacion_presencial: true,
  },
  {
    id: 3,
    becario_id: 103,
    becario_nombre: "Adai Belen Huayta Cardozo",
    carrera: "Contaduría Pública",
    sede_nombre: "Agencia Villa Dolores",
    fecha: "2026-10-09",
    hora_ingreso: "07:58",
    hora_salida: "16:30",
    horas_trabajadas: 8.53,
    distancia_ingreso_m: 185,
    dentro_de_radio: false,
    dentro_de_horario: true,
    estado: "fuera_geocerca",
    lat_ingreso: -16.518,
    lng_ingreso: -68.163,
    es_viernes: true,
    minutos_retraso: 0,
    monto_multa_bs: 0,
    confirmacion_presencial: false,
  },
  {
    id: 4,
    becario_id: 104,
    becario_nombre: "Ronald Franz Mamani Quispe",
    carrera: "Bioquímica y Farmacia",
    sede_nombre: "Consultorio Médico San Lucas",
    fecha: "2026-10-09",
    hora_ingreso: "08:00",
    hora_salida: "17:00",
    horas_trabajadas: 9.0,
    distancia_ingreso_m: 22,
    dentro_de_radio: true,
    dentro_de_horario: true,
    estado: "conforme",
    lat_ingreso: -16.505,
    lng_ingreso: -68.148,
    es_viernes: true,
    minutos_retraso: 0,
    monto_multa_bs: 0,
    confirmacion_presencial: true,
  },
  {
    id: 5,
    becario_id: 105,
    becario_nombre: "Abigail Ruth Condori Flores",
    carrera: "Trabajo Social",
    sede_nombre: "Hogar de Niños Amor y Esperanza",
    fecha: "2026-10-09",
    hora_ingreso: "08:35",
    hora_salida: "17:10",
    horas_trabajadas: 8.58,
    distancia_ingreso_m: 140,
    dentro_de_radio: false,
    dentro_de_horario: false,
    estado: "convalidado",
    convalidado_por: "Lic. Marcos Quispe",
    motivo_convalidacion: "Corte de vías por desfile cívico zonal verificado.",
    lat_ingreso: -16.521,
    lng_ingreso: -68.169,
    es_viernes: true,
    minutos_retraso: 35,
    monto_multa_bs: 0,
    confirmacion_presencial: true,
  },
  {
    id: 6,
    becario_id: 106,
    becario_nombre: "Jhoselin Pamela Mamani Choque",
    carrera: "Medicina",
    sede_nombre: "Escuela de Líderes (Auditorio Central)",
    fecha: "2026-10-09",
    hora_ingreso: "14:50",
    hora_salida: "17:30",
    horas_trabajadas: 2.67,
    distancia_ingreso_m: 18,
    dentro_de_radio: true,
    dentro_de_horario: false,
    estado: "tardanza",
    lat_ingreso: -16.5020,
    lng_ingreso: -68.1510,
    es_viernes: true,
    minutos_retraso: 20,
    monto_multa_bs: 20, // Escala oficial BUMAND: 11-30 min = 20 Bs
    confirmacion_presencial: true,
  },
];

export function calcularMultaEscuelaLideres(minutos: number): number {
  if (minutos <= 0) return 0;
  if (minutos <= 10) return 10;
  if (minutos <= 30) return 20;
  if (minutos <= 60) return 30;
  return 50;
}

export interface HorasMensualesBecario {
  id: number;
  becario_id: number;
  nombre: string;
  ci: string;
  carrera: string;
  sede: string;
  mes: string;
  horas_realizadas: number;
  meta_horas: number;
  dias_asistidos: number;
  tardanzas_viernes: number;
  multas_acumuladas_bs: number;
  estado_meta: "cumplido" | "en_progreso" | "en_riesgo";
}

export const REGISTROS_HORAS_MENSUALES_INICIALES: HorasMensualesBecario[] = [
  { id: 1, becario_id: 1, nombre: "Adai Belen Huayta Cardozo", ci: "13696496", carrera: "Estadística", sede: "Oficina Central Bloque B", mes: "2026-10", horas_realizadas: 39.5, meta_horas: 40.0, dias_asistidos: 10, tardanzas_viernes: 0, multas_acumuladas_bs: 0, estado_meta: "cumplido" },
  { id: 2, becario_id: 2, nombre: "Daniel Davalos Quiñonez", ci: "9107373", carrera: "Informática", sede: "Oficina Central Bloque A", mes: "2026-10", horas_realizadas: 40.0, meta_horas: 40.0, dias_asistidos: 11, tardanzas_viernes: 0, multas_acumuladas_bs: 0, estado_meta: "cumplido" },
  { id: 3, becario_id: 3, nombre: "Edgar Elías Alarcon Huanca", ci: "9160054", carrera: "Medicina", sede: "Consultorio Médico San Lucas", mes: "2026-10", horas_realizadas: 38.0, meta_horas: 40.0, dias_asistidos: 9, tardanzas_viernes: 1, multas_acumuladas_bs: 20, estado_meta: "en_progreso" },
  { id: 4, becario_id: 4, nombre: "Nilda Amalia Churata Paye", ci: "10028341", carrera: "Educación Parvularia", sede: "Centro Infantil Sagrada Familia", mes: "2026-10", horas_realizadas: 42.0, meta_horas: 40.0, dias_asistidos: 11, tardanzas_viernes: 0, multas_acumuladas_bs: 0, estado_meta: "cumplido" },
  { id: 5, becario_id: 5, nombre: "Alejandro Roberth Paredes Tarquino", ci: "10064956", carrera: "Comunicación Social", sede: "Sucursal Juan Pablo II", mes: "2026-10", horas_realizadas: 37.5, meta_horas: 40.0, dias_asistidos: 10, tardanzas_viernes: 0, multas_acumuladas_bs: 0, estado_meta: "en_progreso" },
  { id: 6, becario_id: 6, nombre: "Aydee Ruth Ali Condori", ci: "9952878", carrera: "Contaduría Pública", sede: "Agencia Villa Dolores", mes: "2026-10", horas_realizadas: 41.0, meta_horas: 40.0, dias_asistidos: 11, tardanzas_viernes: 0, multas_acumuladas_bs: 0, estado_meta: "cumplido" },
  { id: 7, becario_id: 7, nombre: "Carlos Oscar Luna Lizarraga", ci: "9943280", carrera: "Economía", sede: "Oficina Central Bloque A", mes: "2026-10", horas_realizadas: 34.0, meta_horas: 40.0, dias_asistidos: 8, tardanzas_viernes: 1, multas_acumuladas_bs: 20, estado_meta: "en_riesgo" },
  { id: 8, becario_id: 8, nombre: "Isaías Daniel Herrera Mamani", ci: "10920862", carrera: "Arquitectura", sede: "Oficina Central Bloque B", mes: "2026-10", horas_realizadas: 38.5, meta_horas: 40.0, dias_asistidos: 10, tardanzas_viernes: 0, multas_acumuladas_bs: 0, estado_meta: "en_progreso" },
  { id: 9, becario_id: 9, nombre: "José Marcos Suñagua Quispe", ci: "14378720", carrera: "Informática", sede: "Oficina Central Bloque A", mes: "2026-10", horas_realizadas: 40.5, meta_horas: 40.0, dias_asistidos: 11, tardanzas_viernes: 0, multas_acumuladas_bs: 0, estado_meta: "cumplido" },
  { id: 10, becario_id: 10, nombre: "Mariela Dayana Jimenez Chambi", ci: "12959656", carrera: "Contaduría Pública", sede: "Agencia Villa Dolores", mes: "2026-10", horas_realizadas: 36.0, meta_horas: 40.0, dias_asistidos: 9, tardanzas_viernes: 1, multas_acumuladas_bs: 10, estado_meta: "en_progreso" },
  { id: 11, becario_id: 11, nombre: "Mayherli Alejandra Loza Villalobos", ci: "9925727", carrera: "Contaduría Pública", sede: "Sucursal Villa Adela", mes: "2026-10", horas_realizadas: 39.0, meta_horas: 40.0, dias_asistidos: 10, tardanzas_viernes: 0, multas_acumuladas_bs: 0, estado_meta: "cumplido" },
  { id: 12, becario_id: 12, nombre: "Noemi Callisaya Alvarez", ci: "7093658", carrera: "Psicomotricidad y Deportes", sede: "Centro Infantil Sagrada Familia", mes: "2026-10", horas_realizadas: 40.0, meta_horas: 40.0, dias_asistidos: 10, tardanzas_viernes: 0, multas_acumuladas_bs: 0, estado_meta: "cumplido" },
  { id: 13, becario_id: 13, nombre: "Ronald Mauricio Quiquijana Mayta", ci: "6172054", carrera: "Ingeniería en Telecomunicaciones", sede: "Oficina Central Bloque A", mes: "2026-10", horas_realizadas: 42.5, meta_horas: 40.0, dias_asistidos: 11, tardanzas_viernes: 0, multas_acumuladas_bs: 0, estado_meta: "cumplido" },
  { id: 14, becario_id: 14, nombre: "Ruddy Flores Tapia", ci: "9974211", carrera: "Informática", sede: "Oficina Central Bloque A", mes: "2026-10", horas_realizadas: 38.0, meta_horas: 40.0, dias_asistidos: 9, tardanzas_viernes: 0, multas_acumuladas_bs: 0, estado_meta: "en_progreso" },
  { id: 15, becario_id: 15, nombre: "Gonzalo Valencia Laura", ci: "8416501", carrera: "Contaduría Pública", sede: "Agencia Villa Dolores", mes: "2026-10", horas_realizadas: 35.0, meta_horas: 40.0, dias_asistidos: 9, tardanzas_viernes: 1, multas_acumuladas_bs: 30, estado_meta: "en_riesgo" },
  { id: 16, becario_id: 16, nombre: "Gustavo Ariel Condori Montaño", ci: "13088041", carrera: "Contaduría Pública", sede: "Oficina Central Bloque B", mes: "2026-10", horas_realizadas: 39.0, meta_horas: 40.0, dias_asistidos: 10, tardanzas_viernes: 0, multas_acumuladas_bs: 0, estado_meta: "cumplido" },
  { id: 17, becario_id: 17, nombre: "Lisbeth Pacasi Machaca", ci: "13603536", carrera: "Bioquímica y Farmacia", sede: "Consultorio Médico San Lucas", mes: "2026-10", horas_realizadas: 41.5, meta_horas: 40.0, dias_asistidos: 11, tardanzas_viernes: 0, multas_acumuladas_bs: 0, estado_meta: "cumplido" },
  { id: 18, becario_id: 18, nombre: "Selena Fernanda Pillco Mamani", ci: "13693151", carrera: "Economía", sede: "Oficina Central Bloque A", mes: "2026-10", horas_realizadas: 40.0, meta_horas: 40.0, dias_asistidos: 10, tardanzas_viernes: 0, multas_acumuladas_bs: 0, estado_meta: "cumplido" },
  { id: 19, becario_id: 19, nombre: "Milenka Quispe Coarite", ci: "14155448", carrera: "Administración de Empresas", sede: "Sucursal Juan Pablo II", mes: "2026-10", horas_realizadas: 37.0, meta_horas: 40.0, dias_asistidos: 9, tardanzas_viernes: 0, multas_acumuladas_bs: 0, estado_meta: "en_progreso" },
  { id: 20, becario_id: 20, nombre: "Joselin Wara Huanca Paucara", ci: "12604724", carrera: "Contaduría Pública", sede: "Agencia Villa Dolores", mes: "2026-10", horas_realizadas: 38.5, meta_horas: 40.0, dias_asistidos: 10, tardanzas_viernes: 0, multas_acumuladas_bs: 0, estado_meta: "en_progreso" },
  { id: 21, becario_id: 21, nombre: "Johan Ludving Misme Flores", ci: "9208456", carrera: "Informática", sede: "Oficina Central Bloque A", mes: "2026-10", horas_realizadas: 39.0, meta_horas: 40.0, dias_asistidos: 10, tardanzas_viernes: 0, multas_acumuladas_bs: 0, estado_meta: "cumplido" },
  { id: 22, becario_id: 22, nombre: "Matias Jose Uri Flores", ci: "13627440", carrera: "Lingüística e Idiomas", sede: "Oficina Central Bloque B", mes: "2026-10", horas_realizadas: 40.0, meta_horas: 40.0, dias_asistidos: 11, tardanzas_viernes: 0, multas_acumuladas_bs: 0, estado_meta: "cumplido" },
  { id: 23, becario_id: 23, nombre: "Mateo Miguel Cussi Flores", ci: "8411610", carrera: "Informática", sede: "Oficina Central Bloque A", mes: "2026-10", horas_realizadas: 38.5, meta_horas: 40.0, dias_asistidos: 10, tardanzas_viernes: 0, multas_acumuladas_bs: 0, estado_meta: "en_progreso" },
];

interface AuditoriaAsistenciaProps {
  rol?: string;
}

export function AuditoriaAsistencia({ rol }: AuditoriaAsistenciaProps) {
  const { usuario } = usarAutenticacion();
  const es_admin = rol === "administrador" || usuario?.rol === "administrador";
  const es_admin_o_supervisor =
    rol === "administrador" ||
    rol === "supervisor" ||
    usuario?.rol === "administrador" ||
    usuario?.rol === "supervisor" ||
    !usuario?.rol;

  // Estados para Registro Manual de Asistencia (Contingencia sin Megas / Olvido)
  const [modal_manual_abierto, set_modal_manual_abierto] = useState<boolean>(false);
  const [manual_becario_id, set_manual_becario_id] = useState<number>(1);
  const [manual_tipo_actividad, set_manual_tipo_actividad] = useState<
    "practicas" | "escuela_lideres" | "acciones_servicio"
  >("practicas");
  const [manual_fecha, set_manual_fecha] = useState<string>(() =>
    new Date().toISOString().split("T")[0]
  );
  const [manual_hora_ingreso, set_manual_hora_ingreso] = useState<string>("08:30");
  const [manual_hora_salida, set_manual_hora_salida] = useState<string>("12:30");
  const [manual_sede, set_manual_sede] = useState<string>(SEDES_POR_ACTIVIDAD.practicas[0]);
  const [manual_motivo, set_manual_motivo] = useState<string>(MOTIVOS_CONTINGENCIA[0]);
  const [manual_motivo_personalizado, set_manual_motivo_personalizado] = useState<string>("");
  const [manual_guardando, set_manual_guardando] = useState<boolean>(false);

  const {
    confirmarCierreSinCompletar,
    confirmarEliminacionRegistro,
    DialogoConfirmacionInstitucional,
  } = useConfirmacionDialogo();

  const tiene_cambios_manual =
    manual_becario_id !== 1 ||
    manual_tipo_actividad !== "practicas" ||
    manual_motivo !== MOTIVOS_CONTINGENCIA[0] ||
    manual_motivo_personalizado.trim() !== "" ||
    manual_hora_ingreso !== "08:30" ||
    manual_hora_salida !== "12:30";

  const intentarCerrarModalManual = () => {
    confirmarCierreSinCompletar(
      tiene_cambios_manual,
      () => {
        set_modal_manual_abierto(false);
      },
      "Asistencia Manual"
    );
  };

  const [registros_locales, set_registros_locales] = useState<RegistroAuditoriaAsistencia[]>(
    REGISTROS_AUDITORIA_INICIALES
  );
  const [termino_busqueda, set_termino_busqueda] = useState("");
  const [filtro_estado, set_filtro_estado] = useState("todos");
  const [filtro_sede, set_filtro_sede] = useState("todas");

  // Sub-vista de Control de Asistencia: En Vivo vs Consolidado Mensual
  const [vista_activa, set_vista_activa] = useState<"en_vivo" | "mensual">("en_vivo");
  const [mes_seleccionado, set_mes_seleccionado] = useState<string>("2026-10");
  const [filtro_estado_mensual, set_filtro_estado_mensual] = useState<string>("todos");
  const [becario_detalle_mensual, set_becario_detalle_mensual] =
    useState<HorasMensualesBecario | null>(null);

  const { datos: horas_mensuales_servidor } = useConsulta<HorasMensualesBecario[]>(
    `horas_mensuales_${mes_seleccionado}`,
    async () => {
      try {
        const respuesta = await clienteApi.get<any[]>(
          `/api/asistencia/horas-mensuales?mes=${mes_seleccionado}`
        );
        if (Array.isArray(respuesta) && respuesta.length > 0) {
          return respuesta.map((item, idx) => ({
            id: item.id || idx + 1,
            becario_id: item.becario_id || idx + 1,
            nombre: item.becario?.usuario?.nombre || item.nombre || `Becario ${idx + 1}`,
            ci: item.becario?.ci || item.ci || "—",
            carrera: item.becario?.carrera || item.carrera || "Carrera BUMAND",
            sede: item.becario?.lugar_practica?.nombre || item.sede || "Sede Diaconía",
            mes: mes_seleccionado,
            horas_realizadas: Number(item.horas_realizadas || item.total_horas || 0),
            meta_horas: Number(item.meta_horas || 40.0),
            dias_asistidos: Number(item.dias_asistidos || 10),
            tardanzas_viernes: Number(item.tardanzas_viernes || 0),
            multas_acumuladas_bs: Number(item.multas_acumuladas_bs || 0),
            estado_meta: (item.estado_meta ||
              (Number(item.horas_realizadas || 0) >= Number(item.meta_horas || 40)
                ? "cumplido"
                : "en_progreso")) as any,
          }));
        }
      } catch {
        // Fallback a los 23 registros iniciales
      }
      return REGISTROS_HORAS_MENSUALES_INICIALES.map((item) => ({
        ...item,
        mes: mes_seleccionado,
        horas_realizadas:
          mes_seleccionado === "2026-09"
            ? Math.round(item.horas_realizadas * 1.05 * 10) / 10
            : mes_seleccionado === "2026-08"
            ? Math.round(item.horas_realizadas * 0.95 * 10) / 10
            : item.horas_realizadas,
      }));
    },
    { datos_iniciales: REGISTROS_HORAS_MENSUALES_INICIALES }
  );

  const [horas_mensuales_locales, set_horas_mensuales_locales] = useState<HorasMensualesBecario[]>(
    REGISTROS_HORAS_MENSUALES_INICIALES
  );

  useEffect(() => {
    if (horas_mensuales_servidor && horas_mensuales_servidor.length > 0) {
      set_horas_mensuales_locales(horas_mensuales_servidor);
    }
  }, [horas_mensuales_servidor]);

  const lista_horas_mensuales = horas_mensuales_locales;

  const manejarGuardarAsistenciaManual = async () => {
    const becario_encontrado =
      LISTA_23_BECARIOS_OFICIALES.find((b) => b.id === Number(manual_becario_id)) ||
      LISTA_23_BECARIOS_OFICIALES[0];
    const motivo_final =
      manual_motivo === "otro"
        ? manual_motivo_personalizado.trim() || "Contingencia de marcación autorizada"
        : manual_motivo;
    const horas_efectivas = calcularHorasTranscurridas(manual_hora_ingreso, manual_hora_salida);

    if (horas_efectivas <= 0) {
      toast.error("Horas inválidas", {
        description: "La hora de salida debe ser posterior a la hora de ingreso.",
      });
      return;
    }

    set_manual_guardando(true);

    const payload = {
      becario_id: becario_encontrado.id,
      tipo: manual_tipo_actividad,
      fecha: manual_fecha,
      hora_ingreso: manual_hora_ingreso,
      hora_salida: manual_hora_salida,
      lugar_nombre: manual_sede,
      motivo_contingencia: motivo_final,
      horas_trabajadas: horas_efectivas,
      registrado_por: usuario?.nombre || "Administrador",
    };

    try {
      await clienteApi.post("/asistencia/manual", payload);
    } catch (err) {
      console.warn("Aviso de sincronización remota (modo local/offline habilitado):", err);
    }

    // 1. Añadir el registro a registros_locales
    const nuevo_registro: RegistroAuditoriaAsistencia = {
      id: Date.now(),
      becario_id: becario_encontrado.id,
      becario_nombre: becario_encontrado.nombre,
      carrera: becario_encontrado.carrera,
      sede_nombre: manual_sede,
      fecha: manual_fecha,
      hora_ingreso: manual_hora_ingreso,
      hora_salida: manual_hora_salida,
      horas_trabajadas: horas_efectivas,
      distancia_ingreso_m: 0,
      dentro_de_radio: true,
      dentro_de_horario: true,
      estado: "conforme",
      convalidado_por: usuario?.nombre || "Administrador",
      motivo_convalidacion: `Registro Manual (Contingencia: ${motivo_final})`,
      tipo_actividad: manual_tipo_actividad,
      motivo_contingencia: motivo_final,
      es_registro_manual: true,
    };

    set_registros_locales((prev) => [nuevo_registro, ...prev]);

    // 2. Actualizar las horas acumuladas mensuales del becario en el estado de la vista
    set_horas_mensuales_locales((prev) =>
      prev.map((item) =>
        item.becario_id === becario_encontrado.id
          ? {
              ...item,
              horas_realizadas: Math.round((item.horas_realizadas + horas_efectivas) * 10) / 10,
              dias_asistidos: item.dias_asistidos + 1,
              estado_meta:
                item.horas_realizadas + horas_efectivas >= item.meta_horas
                  ? "cumplido"
                  : "en_progreso",
            }
          : item
      )
    );

    set_manual_guardando(false);
    set_modal_manual_abierto(false);

    const etiqueta_actividad =
      manual_tipo_actividad === "practicas"
        ? "Prácticas Preprofesionales"
        : manual_tipo_actividad === "escuela_lideres"
        ? "Escuela de Líderes"
        : "Acciones de Servicio";

    toast.success("Asistencia manual registrada", {
      description: `${becario_encontrado.nombre}: ${horas_efectivas} hrs en ${etiqueta_actividad} (${manual_sede}). Motivo: ${motivo_final}.`,
    });
  };

  // Modales
  const [registro_convalidador, set_registro_convalidador] =
    useState<RegistroAuditoriaAsistencia | null>(null);
  const [motivo_convalidacion, set_motivo_convalidacion] = useState("");
  const [registro_detalle, set_registro_detalle] = useState<RegistroAuditoriaAsistencia | null>(
    null
  );

  // Estados para Llamada de Lista en Vivo (Viernes de Formación / Práctica)
  const [modal_lista_vivo_abierto, set_modal_lista_vivo_abierto] = useState<boolean>(false);
  const [lista_llamada_vivo, set_lista_llamada_vivo] = useState([
    {
      id: 101,
      nombre: "Nilda Amalia Churata Paye",
      carrera: "Educación Parvularia",
      sede: "Oficina Central Bloque A",
      marco_gps: true,
      hora_gps: "08:12",
      distancia_m: 35,
      confirmado: true,
    },
    {
      id: 102,
      nombre: "Edgar Elias Alarcon Huanca",
      carrera: "Ingeniería de Sistemas",
      sede: "Oficina Central Bloque A",
      marco_gps: true,
      hora_gps: "08:45",
      distancia_m: 48,
      confirmado: true,
    },
    {
      id: 103,
      nombre: "Adai Belen Huayta Cardozo",
      carrera: "Contaduría Pública",
      sede: "Oficina Central Bloque B",
      marco_gps: true,
      hora_gps: "07:58",
      distancia_m: 185,
      confirmado: false,
    },
    {
      id: 104,
      nombre: "Ronald Franz Mamani Quispe",
      carrera: "Bioquímica y Farmacia",
      sede: "Consultorio San Lucas",
      marco_gps: true,
      hora_gps: "08:00",
      distancia_m: 22,
      confirmado: true,
    },
    {
      id: 105,
      nombre: "Abigail Ruth Condori Flores",
      carrera: "Trabajo Social",
      sede: "Hogar Amor y Esperanza",
      marco_gps: false,
      hora_gps: "--:--",
      distancia_m: 0,
      confirmado: false,
    },
  ]);

  const alternarConfirmacionPresencial = (id: number) => {
    set_lista_llamada_vivo((prev) =>
      prev.map((item) => (item.id === id ? { ...item, confirmado: !item.confirmado } : item))
    );
  };

  const confirmarTodosPresencial = () => {
    set_lista_llamada_vivo((prev) => prev.map((item) => ({ ...item, confirmado: true })));
    toast.success("Todos los becarios han sido confirmados presencialmente.");
  };

  const guardarLlamadaListaVivo = () => {
    const presentes = lista_llamada_vivo.filter((i) => i.confirmado).length;
    toast.success(`Llamada de lista guardada: ${presentes}/${lista_llamada_vivo.length} becarios confirmados presencialmente.`);
    set_modal_lista_vivo_abierto(false);
  };

  const { datos: registros_servidor, invalidar } = useConsulta<RegistroAuditoriaAsistencia[]>(
    "asistencia_auditoria",
    async () => {
      const respuesta = await clienteApi.get<any[]>("/api/asistencia");
      if (Array.isArray(respuesta) && respuesta.length > 0) {
        return respuesta.map((item) => ({
          id: item.id,
          becario_id: item.becario_id,
          becario_nombre: item.becario?.usuario?.nombre || "Becario Institucional",
          carrera: item.becario?.carrera || "Carrera BUMAND",
          sede_nombre: item.becario?.lugar_practica?.nombre || "Sede Diaconía",
          fecha: item.fecha ? String(item.fecha).split("T")[0] : "2026-10-10",
          hora_ingreso: item.hora_ingreso || "08:00",
          hora_salida: item.hora_salida || null,
          horas_trabajadas: item.horas_trabajadas || null,
          distancia_ingreso_m: item.dentro_de_radio ? 35 : 175,
          dentro_de_radio: item.dentro_de_radio ?? true,
          dentro_de_horario: item.dentro_de_horario ?? true,
          estado: !item.hora_salida
            ? "en_curso"
            : !item.dentro_de_radio
            ? "fuera_geocerca"
            : !item.dentro_de_horario
            ? "tardanza"
            : "conforme",
          lat_ingreso: item.lat_ingreso,
          lng_ingreso: item.lng_ingreso,
        }));
      }
      return REGISTROS_AUDITORIA_INICIALES;
    },
    { datos_iniciales: REGISTROS_AUDITORIA_INICIALES }
  );

  const registros =
    registros_servidor && registros_servidor.length > 0 ? registros_servidor : registros_locales;

  const { conectado } = useTiempoReal({
    eventos: {
      asistencia_actualizada: () => invalidar(),
    },
  });

  // Métricas
  const total_registros = registros.length;
  const dentro_geocerca_total = registros.filter((r) => r.dentro_de_radio).length;
  const tasa_geocerca =
    total_registros > 0 ? Math.round((dentro_geocerca_total / total_registros) * 100) : 100;
  const alertas_geocerca = registros.filter(
    (r) => !r.dentro_de_radio && r.estado !== "convalidado"
  ).length;
  const jornadas_activas = registros.filter((r) => !r.hora_salida).length;

  // Filtrado
  const registros_filtrados = registros.filter((r) => {
    const coincide_estado =
      filtro_estado === "todos"
        ? true
        : filtro_estado === "alertas"
        ? !r.dentro_de_radio || r.estado === "tardanza"
        : r.estado === filtro_estado;

    const coincide_sede = filtro_sede === "todas" ? true : r.sede_nombre === filtro_sede;

    const texto = termino_busqueda.toLowerCase().trim();
    const coincide_busqueda =
      !texto ||
      (r.becario_nombre || "").toLowerCase().includes(texto) ||
      (r.carrera || "").toLowerCase().includes(texto) ||
      (r.sede_nombre || "").toLowerCase().includes(texto);

    return coincide_estado && coincide_sede && coincide_busqueda;
  });

  const manejarConvalidar = async () => {
    if (!registro_convalidador) return;
    if (!motivo_convalidacion.trim()) {
      toast.error("Motivo obligatorio", {
        description: "Debe ingresar una justificación institucional para convalidar la marcación.",
      });
      return;
    }

    const nombre_supervisor = usuario?.nombre || "Supervisor Diaconía";

    set_registros_locales((prev) =>
      prev.map((r) =>
        r.id === registro_convalidador.id
          ? {
              ...r,
              estado: "convalidado",
              convalidado_por: nombre_supervisor,
              motivo_convalidacion: motivo_convalidacion.trim(),
            }
          : r
      )
    );

    toast.success("Asistencia Convalidada", {
      description: `Se convalidó la jornada de ${registro_convalidador.becario_nombre} satisfactoriamente.`,
    });

    set_registro_convalidador(null);
    set_motivo_convalidacion("");
  };

  return (
    <div className="space-y-6">
      {/* Cabecera del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E3DCCB] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-[#063A6B]" />
            <h2 className="text-xl font-bold text-[#063A6B]">
              Control de Asistencia
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Monitoreo en tiempo real de ingresos y salidas con geocercas satelitales WGS84 y consolidado mensual de horas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {es_admin_o_supervisor && (
            <Button
              size="sm"
              onClick={() => set_modal_manual_abierto(true)}
              className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
              title="Registrar Asistencia Manual (Contingencia sin megas u olvido)"
            >
              <Plus className="w-4 h-4 text-[#F8C766]" />
              + Añadir Asistencia Manual
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => set_modal_lista_vivo_abierto(true)}
            className="h-9 px-3 bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
          >
            <ListChecks className="w-4 h-4 text-[#F8C766]" />
            Llamada de Lista en Vivo (Viernes)
          </Button>

          <Badge
            variant="outline"
            className="border-[#E3DCCB] bg-slate-50 text-[#063A6B] text-xs font-mono py-1 px-3"
          >
            {conectado ? (
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <Wifi className="w-3.5 h-3.5" /> Sincronización en Vivo
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-600 font-semibold">
                <WifiOff className="w-3.5 h-3.5" /> Modo Local
              </span>
            )}
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={() => invalidar()}
            className="rounded-xl border-[#E3DCCB] text-[#063A6B] h-9"
            title="Refrescar marcaciones"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Selector de Vista: Marcaciones Diarias vs Registro Mensual de Horas */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E3DCCB] shadow-2xs">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => set_vista_activa("en_vivo")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              vista_activa === "en_vivo"
                ? "bg-[#063A6B] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Marcaciones en Vivo (WGS84)
          </button>
          <button
            type="button"
            onClick={() => set_vista_activa("mensual")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              vista_activa === "mensual"
                ? "bg-[#063A6B] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-[#F8C766]" />
            Registro Mensual de Horas por Becario
          </button>
        </div>

        {vista_activa === "mensual" && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#063A6B]">Periodo Mensual:</span>
            <Select value={mes_seleccionado} onValueChange={(val) => val && set_mes_seleccionado(val)}>
              <SelectTrigger className="text-xs h-9 px-3 rounded-xl border-[#E3DCCB] bg-slate-50 font-bold min-w-[180px]">
                <SelectValue placeholder="Seleccionar mes" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#E3DCCB]">
                <SelectItem value="2026-10">Octubre 2026 (Actual)</SelectItem>
                <SelectItem value="2026-09">Septiembre 2026</SelectItem>
                <SelectItem value="2026-08">Agosto 2026</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {vista_activa === "en_vivo" ? (
        <>
          {/* Tarjetas KPI de Auditoría */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Marcaciones Registradas */}
            <TarjetaSpotlight
              color_luz="rgba(6, 58, 107, 0.12)"
              className="bg-white border border-[#E3DCCB] rounded-2xl p-5 shadow-xs space-y-2"
            >
              <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground block">
                Marcaciones Hoy
              </span>
              <div className="text-3xl font-bold font-display text-[#063A6B]">
                <ContadorRodilloAnimado valor={total_registros} sufijo=" registros" />
              </div>
              <p className="text-[11px] text-muted-foreground">Todas las sedes institucionales</p>
            </TarjetaSpotlight>

            {/* KPI 2: Cumplimiento de Geocerca */}
            <TarjetaSpotlight
              color_luz="rgba(16, 185, 129, 0.15)"
              className="bg-white border border-[#E3DCCB] rounded-2xl p-5 shadow-xs space-y-2"
            >
              <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground block">
                Cumplimiento Geocerca
              </span>
              <div className="text-3xl font-bold font-display text-emerald-600">
                <ContadorRodilloAnimado valor={tasa_geocerca} sufijo="%" />
              </div>
              <p className="text-[11px] text-emerald-700 font-medium">Dentro del radio de tolerancia</p>
            </TarjetaSpotlight>

            {/* KPI 3: Alertas / Fuera de Rango */}
            <TarjetaSpotlight
              color_luz="rgba(226, 105, 75, 0.15)"
              className="bg-white border border-[#E3DCCB] rounded-2xl p-5 shadow-xs space-y-2"
            >
              <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground block">
                Alertas Geodésicas
              </span>
              <div className="text-3xl font-bold font-display text-[#E2694B]">
                <ContadorRodilloAnimado valor={alertas_geocerca} />
              </div>
              <p className="text-[11px] text-[#E2694B] font-medium">Marcaciones fuera de tolerancia</p>
            </TarjetaSpotlight>

            {/* KPI 4: Jornadas Activas */}
            <TarjetaSpotlight
              color_luz="rgba(248, 199, 102, 0.2)"
              className="bg-white border border-[#E3DCCB] rounded-2xl p-5 shadow-xs space-y-2"
            >
              <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground block">
                Jornadas en Curso
              </span>
              <div className="text-3xl font-bold font-display text-[#063A6B]">
                <ContadorRodilloAnimado valor={jornadas_activas} sufijo=" activas" />
              </div>
              <p className="text-[11px] text-muted-foreground">Becarios presentes en sede</p>
            </TarjetaSpotlight>
          </div>

          {/* Barra de Filtros y Búsqueda */}
          <div className="p-4 bg-white rounded-2xl border border-[#E3DCCB] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por becario, carrera o sede..."
                value={termino_busqueda}
                onChange={(e) => set_termino_busqueda(e.target.value)}
                className="pl-9 text-xs rounded-xl border-[#E3DCCB] h-10 bg-slate-50/50"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              {/* Filtro Estado */}
              <Select value={filtro_estado} onValueChange={(val: any) => val && set_filtro_estado(val)}>
                <SelectTrigger className="text-xs h-10 px-3 rounded-xl border border-[#E3DCCB] bg-white text-[#063A6B] font-medium min-w-[160px]">
                  <SelectValue placeholder="Todos los Estados" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E3DCCB] z-[100]">
                  <SelectItem value="todos">Todos los Estados</SelectItem>
                  <SelectItem value="conforme">Conforme WGS84</SelectItem>
                  <SelectItem value="en_curso">En Jornada</SelectItem>
                  <SelectItem value="tardanza">Tardanzas</SelectItem>
                  <SelectItem value="fuera_geocerca">Fuera de Geocerca</SelectItem>
                  <SelectItem value="convalidado">Convalidados</SelectItem>
                  <SelectItem value="alertas">Solo Alertas y Observados</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtro Sede */}
              <Select value={filtro_sede} onValueChange={(val: any) => val && set_filtro_sede(val)}>
                <SelectTrigger className="text-xs h-10 px-3 rounded-xl border border-[#E3DCCB] bg-white text-[#063A6B] font-medium min-w-[180px]">
                  <SelectValue placeholder="Todas las Sedes" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E3DCCB] z-[100]">
                  <SelectItem value="todas">Todas las Sedes</SelectItem>
                  <SelectItem value="Oficina Central Bloque A">Oficina Central Bloque A</SelectItem>
                  <SelectItem value="Centro Infantil Sagrada Familia">Centro Infantil Sagrada Familia</SelectItem>
                  <SelectItem value="Agencia Villa Dolores">Agencia Villa Dolores</SelectItem>
                  <SelectItem value="Consultorio Médico San Lucas">Consultorio Médico San Lucas</SelectItem>
                  <SelectItem value="Hogar de Niños Amor y Esperanza">Hogar de Niños Amor y Esperanza</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Lista de Registros Auditables */}
          <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/60 p-5 border-b border-[#E3DCCB]/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-[#063A6B]">
                  Registros de Asistencia Georreferenciados
                </CardTitle>
                <Badge variant="outline" className="border-[#E3DCCB] text-[#063A6B] font-mono text-xs">
                  {registros_filtrados.length} Resultados
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {registros_filtrados.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-xs">
                  No se encontraron marcaciones que coincidan con los filtros seleccionados.
                </div>
              ) : (
                <div className="divide-y divide-[#E3DCCB]/50">
                  {registros_filtrados.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Datos del Becario y Sede */}
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#063A6B]/10 text-[#063A6B] flex items-center justify-center font-bold text-sm shrink-0">
                          {item.becario_nombre.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#063A6B]">
                              {item.becario_nombre}
                            </span>
                            <Badge
                              variant="outline"
                              className="border-[#E3DCCB] text-[10px] font-mono text-muted-foreground"
                            >
                              {item.carrera}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1 font-medium text-[#1E293B]">
                              <Building className="w-3.5 h-3.5 text-[#063A6B]" />
                              {item.sede_nombre}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1 font-mono text-[11px]">
                              <Calendar className="w-3 h-3" /> {item.fecha}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Estado Geodésico y Horario */}
                      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-100">
                        <div className="text-left sm:text-right space-y-0.5">
                          <div className="font-mono text-xs font-bold text-[#063A6B]">
                            {item.hora_ingreso} &rarr; {item.hora_salida || "En Jornada"}
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {item.horas_trabajadas
                              ? `${item.horas_trabajadas.toFixed(2)} hrs computadas`
                              : "Jornada no cerrada"}
                          </div>
                          <div className="text-[10px] font-mono flex items-center sm:justify-end gap-1">
                            <Navigation className="w-3 h-3 text-[#17B4C4]" />
                            <span>Distancia: </span>
                            <strong
                              className={
                                item.dentro_de_radio ? "text-emerald-700" : "text-[#E2694B]"
                              }
                            >
                              {item.distancia_ingreso_m}m
                            </strong>
                          </div>
                        </div>

                        {/* Insignia de Estado y Multas Transparentes */}
                        <div className="min-w-[150px] text-right space-y-1">
                          <div>
                            {item.estado === "conforme" && (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-bold text-xs gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Conforme WGS84
                              </Badge>
                            )}
                            {item.estado === "en_curso" && (
                              <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-bold text-xs gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                En Curso
                              </Badge>
                            )}
                            {item.estado === "tardanza" && (
                              <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-bold text-xs gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Tardanza
                              </Badge>
                            )}
                            {item.estado === "fuera_geocerca" && (
                              <Badge className="bg-rose-100 text-rose-800 border-rose-200 font-bold text-xs gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Fuera de Geocerca
                              </Badge>
                            )}
                            {item.estado === "convalidado" && (
                              <Badge className="bg-sky-100 text-sky-800 border-sky-200 font-bold text-xs gap-1">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Convalidado
                              </Badge>
                            )}
                          </div>

                          {item.es_registro_manual && (
                            <div className="flex items-center justify-end">
                              <Badge variant="outline" className="bg-emerald-50 border-emerald-300 text-emerald-800 text-[10px] font-mono font-bold">
                                Manual · Contingencia
                              </Badge>
                            </div>
                          )}

                          {item.tipo_actividad && (
                            <div className="flex items-center justify-end">
                              <Badge variant="outline" className="border-slate-200 text-slate-700 text-[10px] font-mono">
                                {item.tipo_actividad === "practicas"
                                  ? "Prácticas"
                                  : item.tipo_actividad === "escuela_lideres"
                                  ? "Escuela Líderes"
                                  : "Acciones de Servicio"}
                              </Badge>
                            </div>
                          )}

                          {/* Visualización Transparente de Multas de Escuela de Líderes */}
                          {item.monto_multa_bs && item.monto_multa_bs > 0 ? (
                            <div className="flex items-center justify-end">
                              <Badge variant="outline" className="bg-rose-50 border-rose-300 text-rose-700 text-[10px] font-mono font-bold gap-1">
                                <Coins className="w-3 h-3 text-rose-600" />
                                Multa Escuela de Líderes: Bs {item.monto_multa_bs.toFixed(2)} ({item.minutos_retraso}m)
                              </Badge>
                            </div>
                          ) : null}

                          {item.confirmacion_presencial ? (
                            <p className="text-[10px] text-emerald-700 font-medium">✓ Verificado presencial</p>
                          ) : (
                            <p className="text-[10px] text-muted-foreground">Sin confirmación en vivo</p>
                          )}
                        </div>

                        {/* Acciones de Auditoría */}
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => set_registro_detalle(item)}
                            className="h-8 px-2 text-[#063A6B] hover:bg-slate-100 rounded-lg text-xs"
                            title="Ver detalle satelital"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>

                          {/* Botón de Convalidación para anomalías */}
                          {(item.estado === "fuera_geocerca" || item.estado === "tardanza") && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                set_registro_convalidador(item);
                                set_motivo_convalidacion("");
                              }}
                              className="h-8 px-2.5 text-xs font-bold border-[#063A6B] text-[#063A6B] hover:bg-[#063A6B]/5 rounded-lg"
                            >
                              Convalidar
                            </Button>
                          )}

                          {/* Botón para eliminar/anular registro de asistencia manual */}
                          {item.es_registro_manual && es_admin_o_supervisor && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                confirmarEliminacionRegistro({
                                  titulo: "¿Anular y eliminar asistencia manual?",
                                  descripcion: `¿Está seguro de anular el registro de contingencia para ${item.becario_nombre} (${item.fecha})? Esta acción revertirá las horas acumuladas asociadas.`,
                                  nombre_item: `${item.becario_nombre} - ${item.fecha}`,
                                  onConfirmar: () => {
                                    set_registros_locales((prev) =>
                                      prev.filter((r) => r.id !== item.id)
                                    );
                                    if (item.horas_trabajadas) {
                                      set_horas_mensuales_locales((prev) =>
                                        prev.map((h) =>
                                          h.becario_id === item.becario_id
                                            ? {
                                                ...h,
                                                horas_realizadas: Math.max(
                                                  0,
                                                  Math.round(
                                                    (h.horas_realizadas - item.horas_trabajadas!) * 10
                                                  ) / 10
                                                ),
                                                dias_asistidos: Math.max(0, h.dias_asistidos - 1),
                                              }
                                            : h
                                        )
                                      );
                                    }
                                  },
                                  mensaje_exito:
                                    "Registro de asistencia manual anulado correctamente",
                                });
                              }}
                              className="h-8 px-2 text-[#E2694B] hover:text-[#c9573b] hover:bg-rose-50 rounded-lg text-xs"
                              title="Anular / Eliminar registro manual"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        /* VISTA MENSUAL: REGISTRO CONSOLIDADO DE HORAS POR BECARIO */
        <div className="space-y-6">
          {/* Banner Informativo Escala de Multas de los Viernes de Escuela de Líderes */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <Coins className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#063A6B]">
                  Reglamento Oficial de Multas — Viernes de Escuela de Líderes
                </p>
                <p className="text-amber-800 text-[11px] mt-0.5">
                  Escala por tramos de retraso:{" "}
                  <strong>1-10 min = 10 Bs</strong> · <strong>11-30 min = 20 Bs</strong> ·{" "}
                  <strong>31-60 min = 30 Bs</strong> · <strong>&gt;60 min = 50 Bs</strong>.
                  (Las multas se retienen o liquidan en la acreditación mensual).
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-white border-amber-300 text-amber-800 font-mono text-[11px] self-start md:self-center shrink-0">
              Escala Oficial BUMAND
            </Badge>
          </div>

          {/* Tarjetas KPI del Mes Seleccionado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <TarjetaSpotlight
              color_luz="rgba(6, 58, 107, 0.12)"
              className="bg-white border border-[#E3DCCB] rounded-2xl p-5 shadow-xs space-y-2"
            >
              <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground block">
                Nómina Oficial
              </span>
              <div className="text-3xl font-bold font-display text-[#063A6B]">
                <ContadorRodilloAnimado valor={lista_horas_mensuales.length} sufijo=" becarios" />
              </div>
              <p className="text-[11px] text-muted-foreground">Estudiantes activos registrados</p>
            </TarjetaSpotlight>

            <TarjetaSpotlight
              color_luz="rgba(16, 185, 129, 0.15)"
              className="bg-white border border-[#E3DCCB] rounded-2xl p-5 shadow-xs space-y-2"
            >
              <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground block">
                Promedio Horas / Becario
              </span>
              <div className="text-3xl font-bold font-display text-emerald-600">
                <ContadorRodilloAnimado
                  valor={
                    lista_horas_mensuales.length > 0
                      ? Math.round(
                          (lista_horas_mensuales.reduce((acc, b) => acc + b.horas_realizadas, 0) /
                            lista_horas_mensuales.length) *
                            10
                        ) / 10
                      : 0
                  }
                  sufijo=" hrs"
                  decimales={1}
                />
              </div>
              <p className="text-[11px] text-emerald-700 font-medium">Meta estándar: 40.0 hrs/mes</p>
            </TarjetaSpotlight>

            <TarjetaSpotlight
              color_luz="rgba(23, 180, 196, 0.15)"
              className="bg-white border border-[#E3DCCB] rounded-2xl p-5 shadow-xs space-y-2"
            >
              <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground block">
                Cumplimiento de Meta
              </span>
              <div className="text-3xl font-bold font-display text-[#063A6B]">
                <ContadorRodilloAnimado
                  valor={
                    lista_horas_mensuales.length > 0
                      ? Math.round(
                          (lista_horas_mensuales.filter((b) => b.horas_realizadas >= b.meta_horas).length /
                            lista_horas_mensuales.length) *
                            100
                        )
                      : 0
                  }
                  sufijo="%"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">Becarios con meta alcanzada</p>
            </TarjetaSpotlight>

            <TarjetaSpotlight
              color_luz="rgba(226, 105, 75, 0.15)"
              className="bg-white border border-[#E3DCCB] rounded-2xl p-5 shadow-xs space-y-2"
            >
              <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground block">
                Multas Viernes (Total)
              </span>
              <div className="text-3xl font-bold font-display text-[#E2694B]">
                <ContadorRodilloAnimado
                  valor={lista_horas_mensuales.reduce((acc, b) => acc + b.multas_acumuladas_bs, 0)}
                  prefijo="Bs "
                  decimales={2}
                />
              </div>
              <p className="text-[11px] text-[#E2694B] font-medium">Retenciones acumuladas del mes</p>
            </TarjetaSpotlight>
          </div>

          {/* Barra de Filtros y Búsqueda Mensual */}
          <div className="p-4 bg-white rounded-2xl border border-[#E3DCCB] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por becario, CI, carrera o sede..."
                value={termino_busqueda}
                onChange={(e) => set_termino_busqueda(e.target.value)}
                className="pl-9 text-xs rounded-xl border-[#E3DCCB] h-10 bg-slate-50/50"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Select
                value={filtro_estado_mensual}
                onValueChange={(val) => val && set_filtro_estado_mensual(val)}
              >
                <SelectTrigger className="text-xs h-10 px-3 rounded-xl border border-[#E3DCCB] bg-white text-[#063A6B] font-medium min-w-[200px]">
                  <SelectValue placeholder="Estado de Meta Mensual" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E3DCCB] z-[100]">
                  <SelectItem value="todos">Todos los Estados</SelectItem>
                  <SelectItem value="cumplido">Meta Cumplida (≥40 hrs)</SelectItem>
                  <SelectItem value="en_progreso">En Progreso (80% a 99%)</SelectItem>
                  <SelectItem value="en_riesgo">En Riesgo (&lt;80%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabla Consolidada de Horas Mensuales por Becario */}
          <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/60 p-5 border-b border-[#E3DCCB]/60">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-[#063A6B]">
                    Registro Mensual de Horas por Becario — {mes_seleccionado}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Cómputo acumulado de horas efectivas frente a la meta mensual y seguimiento de puntualidad.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="border-[#E3DCCB] text-[#063A6B] font-mono text-xs">
                  {lista_horas_mensuales.filter((b) => {
                    const texto = termino_busqueda.toLowerCase().trim();
                    const coincide = !texto || (b.nombre || "").toLowerCase().includes(texto) || (b.carrera || "").toLowerCase().includes(texto) || String(b.ci || "").includes(texto);
                    const estado = filtro_estado_mensual === "todos" ? true : b.estado_meta === filtro_estado_mensual;
                    return coincide && estado;
                  }).length} Becarios
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-[#E3DCCB] text-[#063A6B] font-mono text-[11px] uppercase">
                      <th className="py-3 px-4 font-bold">Becario</th>
                      <th className="py-3 px-3 font-bold">C.I.</th>
                      <th className="py-3 px-4 font-bold">Carrera / Sede</th>
                      <th className="py-3 px-4 font-bold min-w-[180px]">Horas Realizadas vs Meta</th>
                      <th className="py-3 px-3 font-bold text-center">Días</th>
                      <th className="py-3 px-4 font-bold">Multas Viernes</th>
                      <th className="py-3 px-3 font-bold text-center">Estado</th>
                      <th className="py-3 px-4 text-right font-bold">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3DCCB]/50">
                    {lista_horas_mensuales
                      .filter((b) => {
                        const texto = termino_busqueda.toLowerCase().trim();
                        const coincide =
                          !texto ||
                          (b.nombre || "").toLowerCase().includes(texto) ||
                          (b.carrera || "").toLowerCase().includes(texto) ||
                          String(b.ci || "").includes(texto);
                        const estado =
                          filtro_estado_mensual === "todos" ? true : b.estado_meta === filtro_estado_mensual;
                        return coincide && estado;
                      })
                      .map((item) => {
                        const porcentaje = Math.min(
                          100,
                          Math.round((item.horas_realizadas / item.meta_horas) * 100)
                        );
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#063A6B]/10 text-[#063A6B] font-bold text-xs flex items-center justify-center shrink-0">
                                  {item.nombre.charAt(0)}
                                </div>
                                <span className="font-bold text-[#063A6B] leading-tight">
                                  {item.nombre}
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 px-3 font-mono text-muted-foreground font-semibold">
                              {item.ci}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="space-y-0.5">
                                <p className="font-medium text-[#1E293B]">{item.carrera}</p>
                                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                  <Building className="w-3 h-3 text-[#17B4C4]" />
                                  {item.sede}
                                </p>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[11px] font-mono">
                                  <span className="font-bold text-[#063A6B]">
                                    {item.horas_realizadas.toFixed(1)} hrs
                                  </span>
                                  <span className="text-muted-foreground">
                                    / {item.meta_horas.toFixed(1)} hrs ({porcentaje}%)
                                  </span>
                                </div>
                                <Progress value={porcentaje} className="h-2 bg-slate-100" />
                              </div>
                            </td>
                            <td className="py-3.5 px-3 font-mono font-bold text-center text-[#063A6B]">
                              {item.dias_asistidos}
                            </td>
                            <td className="py-3.5 px-4">
                              {item.multas_acumuladas_bs > 0 ? (
                                <Badge
                                  variant="outline"
                                  className="bg-rose-50 border-rose-300 text-rose-700 text-[10px] font-mono font-bold gap-1"
                                >
                                  <Coins className="w-3 h-3 text-rose-600" />
                                  Bs {item.multas_acumuladas_bs.toFixed(2)} ({item.tardanzas_viernes} tardanza)
                                </Badge>
                              ) : (
                                <span className="text-[11px] text-emerald-700 font-semibold font-mono">
                                  ✓ Sin sanciones
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              {item.estado_meta === "cumplido" ? (
                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-[10px]">
                                  CUMPLIDO
                                </Badge>
                              ) : item.estado_meta === "en_progreso" ? (
                                <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-bold text-[10px]">
                                  EN PROGRESO
                                </Badge>
                              ) : (
                                <Badge className="bg-rose-100 text-rose-800 border-rose-300 font-bold text-[10px]">
                                  EN RIESGO
                                </Badge>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => set_becario_detalle_mensual(item)}
                                className="h-8 px-2.5 text-xs font-bold border-[#063A6B] text-[#063A6B] hover:bg-[#063A6B]/5 rounded-lg flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Ver Jornadas</span>
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Canónico de Detalle Mensual de Horas por Becario */}
      <Dialog
        open={Boolean(becario_detalle_mensual)}
        onOpenChange={(abierto) => !abierto && set_becario_detalle_mensual(null)}
      >
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white rounded-2xl border-[#E3DCCB] shadow-2xl"
        >
          <DialogHeader className="p-6 pb-4 border-b border-[#E3DCCB] shrink-0 bg-[#F8F9FA]">
            <DialogTitle className="text-base font-bold text-[#063A6B] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#17B4C4]" />
              Detalle Mensual de Horas · {becario_detalle_mensual?.nombre}
            </DialogTitle>
          </DialogHeader>

          <DialogBody className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
            {becario_detalle_mensual && (
              <>
                <div className="p-3.5 bg-slate-50 border border-[#E3DCCB] rounded-xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#063A6B] text-sm">
                        {becario_detalle_mensual.nombre}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        C.I. {becario_detalle_mensual.ci} · {becario_detalle_mensual.carrera}
                      </p>
                    </div>
                    <Badge variant="outline" className="border-[#063A6B] text-[#063A6B] font-mono text-xs">
                      {becario_detalle_mensual.sede}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-dashed border-[#E3DCCB] text-[11px] font-mono">
                    <div>
                      <span className="text-muted-foreground block">Horas Realizadas:</span>
                      <strong className="text-[#063A6B] text-sm">
                        {becario_detalle_mensual.horas_realizadas.toFixed(1)} hrs
                      </strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Meta Mensual:</span>
                      <strong className="text-slate-700 text-sm">
                        {becario_detalle_mensual.meta_horas.toFixed(1)} hrs
                      </strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Multas Viernes:</span>
                      <strong className={becario_detalle_mensual.multas_acumuladas_bs > 0 ? "text-rose-600 text-sm" : "text-emerald-700 text-sm"}>
                        Bs {becario_detalle_mensual.multas_acumuladas_bs.toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-[#063A6B]">
                    Jornadas Acreditadas en {becario_detalle_mensual.mes}:
                  </Label>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {[
                      { dia: "Viernes 09/10", horas: "4.0 hrs", tipo: "Escuela de Líderes", estado: "Acreditado" },
                      { dia: "Miércoles 07/10", horas: "4.5 hrs", tipo: "Prácticas Sede", estado: "Acreditado" },
                      { dia: "Lunes 05/10", horas: "4.0 hrs", tipo: "Prácticas Sede", estado: "Acreditado" },
                      { dia: "Viernes 02/10", horas: "3.5 hrs", tipo: "Escuela de Líderes", estado: "Acreditado" },
                      { dia: "Miércoles 30/09", horas: "4.0 hrs", tipo: "Prácticas Sede", estado: "Acreditado" },
                      { dia: "Lunes 28/09", horas: "4.5 hrs", tipo: "Prácticas Sede", estado: "Acreditado" },
                    ].map((j, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg border border-[#E3DCCB] bg-white flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-[#17B4C4]" />
                          <span className="font-semibold text-slate-800">{j.dia}</span>
                          <span className="text-muted-foreground font-mono text-[11px]">
                            ({j.tipo})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 font-mono font-bold">
                          <span className="text-[#063A6B]">{j.horas}</span>
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px]">
                            {j.estado}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </DialogBody>

          <DialogFooter className="p-4 px-6 border-t border-[#E3DCCB] bg-[#F8F9FA]/90 shrink-0 mt-auto flex sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => set_becario_detalle_mensual(null)}
              className="h-9 px-4 border-[#E3DCCB] rounded-xl text-xs font-bold text-[#063A6B] hover:bg-slate-100"
            >
              Cerrar Expediente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Convalidación de Asistencia */}
      <Dialog
        open={Boolean(registro_convalidador)}
        onOpenChange={(abierto) => !abierto && set_registro_convalidador(null)}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-md rounded-2xl flex flex-col p-0 overflow-hidden bg-white border border-[#E3DCCB]"
        >
          <DialogHeader className="p-5 pb-3 border-b border-[#E3DCCB] shrink-0 bg-[#F8F9FA]">
            <DialogTitle className="flex items-center gap-2 text-[#063A6B] text-base">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Convalidación Institucional de Asistencia
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-3 p-5 text-xs overflow-y-auto flex-1 min-h-0">
            <p className="text-muted-foreground">
              Estás por convalidar formalmente la marcación de{" "}
              <strong className="text-[#063A6B]">{registro_convalidador?.becario_nombre}</strong>{" "}
              correspondiente al día <strong>{registro_convalidador?.fecha}</strong>.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-[#E3DCCB] space-y-1 font-mono text-[11px]">
              <div>
                Hora Registrada: <strong>{registro_convalidador?.hora_ingreso}</strong>
              </div>
              <div>
                Distancia Geodésica:{" "}
                <strong className="text-[#E2694B]">
                  {registro_convalidador?.distancia_ingreso_m} metros
                </strong>{" "}
                (Radio permitido: 120m)
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#1E293B]">
                Dictamen o Motivo de Convalidación:
              </Label>
              <Textarea
                placeholder="Ej. Incidencia de transporte acreditada / Comisión externa autorizada..."
                value={motivo_convalidacion}
                onChange={(e) => set_motivo_convalidacion(e.target.value)}
                rows={3}
                className="text-xs rounded-xl"
              />
            </div>
          </DialogBody>
          <DialogFooter className="p-4 border-t border-[#E3DCCB] bg-[#F8F9FA] shrink-0 mt-auto flex sm:justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => set_registro_convalidador(null)}
              className="rounded-xl text-xs font-bold"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={manejarConvalidar}
              className="bg-[#063A6B] hover:bg-[#063A6B]/90 text-white rounded-xl font-bold text-xs shadow-sm"
            >
              Firmar Convalidación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalle GPS Satelital con Google Maps Interactivo */}
      <Dialog
        open={Boolean(registro_detalle)}
        onOpenChange={(abierto) => !abierto && set_registro_detalle(null)}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-xl rounded-2xl p-0 overflow-hidden bg-white border border-[#E3DCCB]"
        >
          <DialogHeader className="p-5 pb-3 border-b border-[#E3DCCB] bg-[#F8F9FA]">
            <DialogTitle className="flex items-center gap-2 text-[#063A6B] text-base">
              <MapPin className="w-5 h-5 text-[#17B4C4]" />
              Auditoría Georreferenciada con Google Maps (WGS84)
            </DialogTitle>
          </DialogHeader>

          {registro_detalle && (
            <div className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-[#E3DCCB] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#063A6B] text-sm">
                      {registro_detalle.becario_nombre}
                    </div>
                    <div className="text-muted-foreground">{registro_detalle.carrera}</div>
                  </div>
                  {registro_detalle.monto_multa_bs && registro_detalle.monto_multa_bs > 0 ? (
                    <Badge variant="outline" className="bg-rose-50 border-rose-300 text-rose-700 font-bold text-xs gap-1">
                      <Coins className="w-3.5 h-3.5 text-rose-600" />
                      Multa Escuela de Líderes: Bs {registro_detalle.monto_multa_bs.toFixed(2)}
                    </Badge>
                  ) : null}
                </div>

                <div className="pt-2 border-t border-dashed border-gray-200 grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div>
                    <span className="text-muted-foreground block">Sede / Bloque:</span>
                    <span className="font-semibold">{registro_detalle.sede_nombre}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Fecha:</span>
                    <span className="font-semibold">{registro_detalle.fecha}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Ingreso / Salida:</span>
                    <span className="font-semibold">
                      {registro_detalle.hora_ingreso} - {registro_detalle.hora_salida || "En curso"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Horas Efectivas:</span>
                    <span className="font-semibold">
                      {registro_detalle.horas_trabajadas
                        ? `${registro_detalle.horas_trabajadas.toFixed(2)} hrs`
                        : "Pendiente"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Visor con Google Maps Embebido */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#063A6B] flex items-center gap-1.5">
                    <Map className="w-4 h-4 text-[#17B4C4]" />
                    Punto de Marcación y Perímetro Geodésico
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const lat = registro_detalle.lat_ingreso || -16.500053;
                      const lng = registro_detalle.lng_ingreso || -68.173455;
                      window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
                    }}
                    className="h-7 px-2.5 text-[11px] border-[#17B4C4] text-[#063A6B] rounded-lg flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3 text-[#17B4C4]" />
                    Abrir en Google Maps
                  </Button>
                </div>

                <div className="relative w-full h-48 bg-slate-100 rounded-xl overflow-hidden border border-[#E3DCCB]">
                  <iframe
                    title="Vista Satelital Google Maps"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://maps.google.com/maps?q=${registro_detalle.lat_ingreso || -16.500053},${registro_detalle.lng_ingreso || -68.173455}&z=16&output=embed`}
                  />
                </div>
              </div>

              {/* Desglose de Cálculo Haversine y Multa */}
              <div className="p-3 bg-[#E3F9FA] rounded-xl border border-[#17B4C4]/30 space-y-1.5 text-xs text-[#063A6B]">
                <div className="font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-[#17B4C4]" />
                    Validación Haversine & Multa
                  </span>
                  <span className="font-mono text-[11px]">
                    Lat: {registro_detalle.lat_ingreso || "-16.5000"} | Lng: {registro_detalle.lng_ingreso || "-68.1500"}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Distancia registrada: <strong>{registro_detalle.distancia_ingreso_m} metros</strong>.
                  Tolerancia máxima permitida: 120 metros.
                </p>
                {registro_detalle.monto_multa_bs && registro_detalle.monto_multa_bs > 0 ? (
                  <p className="text-[11px] text-rose-700 font-medium pt-1 border-t border-[#17B4C4]/20">
                    ⚠ Retraso detectado en Escuela de Líderes: {registro_detalle.minutos_retraso} minutos. Multa reglamentaria BUMAND aplicada: <strong>Bs {registro_detalle.monto_multa_bs?.toFixed(2)}</strong>.
                  </p>
                ) : registro_detalle.minutos_retraso && registro_detalle.minutos_retraso > 0 ? (
                  <p className="text-[11px] text-amber-700 font-medium pt-1 border-t border-[#17B4C4]/20">
                    ℹ Retraso registrado: {registro_detalle.minutos_retraso} minutos. Las prácticas formativas no contemplan sanciones económicas.
                  </p>
                ) : null}
              </div>

              {registro_detalle.convalidado_por && (
                <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-xs text-sky-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-sky-700" />
                    Convalidado por {registro_detalle.convalidado_por}
                  </div>
                  <p className="text-[11px] italic">"{registro_detalle.motivo_convalidacion}"</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="p-4 border-t border-[#E3DCCB] bg-[#F8F9FA]">
            <Button
              size="sm"
              variant="outline"
              onClick={() => set_registro_detalle(null)}
              className="rounded-xl w-full text-xs font-bold"
            >
              Cerrar Detalle de Auditoría
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Interactivo de Llamada de Lista en Vivo (Supervisor / Organizador) */}
      <Dialog open={modal_lista_vivo_abierto} onOpenChange={set_modal_lista_vivo_abierto}>
        <DialogContent
          showCloseButton={false}
          className="max-w-2xl rounded-2xl p-0 overflow-hidden bg-white border border-[#E3DCCB] shadow-2xl"
        >
          <DialogHeader className="p-5 pb-3 border-b border-[#E3DCCB] bg-[#F8F9FA]">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2 text-[#063A6B] text-base">
                  <ListChecks className="w-5 h-5 text-[#17B4C4]" />
                  Llamada de Lista en Vivo (Viernes de Formación / Práctica)
                </DialogTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Confirmación presencial ágil para supervisores de becarios que ya marcaron por geocerca.
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={confirmarTodosPresencial}
                className="h-8 px-2.5 text-xs border-[#17B4C4] text-[#063A6B] rounded-lg font-bold"
              >
                Confirmar Todos
              </Button>
            </div>
          </DialogHeader>

          <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
            {lista_llamada_vivo.map((becario) => (
              <div
                key={becario.id}
                className="p-3.5 rounded-xl border border-[#E3DCCB] bg-slate-50/60 flex items-center justify-between gap-4 hover:bg-slate-100/70 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#063A6B]">{becario.nombre}</span>
                    <Badge variant="outline" className="text-[10px] font-mono border-[#E3DCCB]">
                      {becario.carrera}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                    <span>{becario.sede}</span>
                    <span>·</span>
                    {becario.marco_gps ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        GPS: {becario.hora_gps} ({becario.distancia_m}m)
                      </span>
                    ) : (
                      <span className="text-amber-700 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Sin marcación GPS
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Label
                    htmlFor={`switch-lista-${becario.id}`}
                    className={`text-xs font-bold cursor-pointer ${
                      becario.confirmado ? "text-emerald-700" : "text-muted-foreground"
                    }`}
                  >
                    {becario.confirmado ? "Presente" : "Pendiente"}
                  </Label>
                  <Switch
                    id={`switch-lista-${becario.id}`}
                    checked={becario.confirmado}
                    onCheckedChange={() => alternarConfirmacionPresencial(becario.id)}
                  />
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="p-4 border-t border-[#E3DCCB] bg-[#F8F9FA] flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => set_modal_lista_vivo_abierto(false)}
              className="rounded-xl text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={guardarLlamadaListaVivo}
              className="bg-[#063A6B] hover:bg-[#063A6B]/90 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Guardar Llamada de Lista
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Institucional: Registro Manual de Asistencia (Contingencia sin Megas / Olvido) */}
      <Dialog
        open={modal_manual_abierto}
        onOpenChange={(abierto) => {
          if (!abierto) intentarCerrarModalManual();
          else set_modal_manual_abierto(true);
        }}
      >
        <DialogContent
          showCloseButton={true}
          className="max-w-xl rounded-2xl p-0 overflow-hidden bg-white border border-[#E3DCCB] shadow-2xl"
        >
          <DialogHeader className="p-5 pb-3 border-b border-[#E3DCCB] bg-[#F8F9FA]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Plus className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-[#063A6B]">
                  Registrar Asistencia Manual — Contingencia sin Megas / Olvido
                </DialogTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Habilitado exclusivamente en plataforma web para Administradores y Supervisores.
                </CardDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-5 space-y-4 max-h-[72vh] overflow-y-auto text-xs">
            {/* Aviso institucional */}
            <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-[11px] block">Cómputo Oficial de Contingencia</span>
                <span className="text-[11px] text-amber-800/90 leading-relaxed block">
                  Utilice este formulario si el becario no contaba con megas/saldo, olvidó marcar en la app móvil o tuvo fallas de batería. El registro se validará institucionalmente y sumará de inmediato a sus horas acumuladas del mes.
                </span>
              </div>
            </div>

            {/* 1. Selector de Becario (23 oficiales) */}
            <div className="space-y-1.5">
              <Label htmlFor="manual-becario" className="font-bold text-[#063A6B] text-xs flex items-center justify-between">
                <span>Becario Asignado (23 Oficiales BUMAND)</span>
                <span className="text-[10px] font-mono font-normal text-muted-foreground">
                  C.I. y Unidad institucional
                </span>
              </Label>
              <Select
                value={String(manual_becario_id)}
                onValueChange={(val) => set_manual_becario_id(Number(val))}
              >
                <SelectTrigger id="manual-becario" className="h-10 text-xs rounded-xl border-[#E3DCCB] bg-white">
                  <SelectValue placeholder="Seleccione un becario" />
                </SelectTrigger>
                <SelectContent className="max-h-60 bg-white border-[#E3DCCB]">
                  {LISTA_23_BECARIOS_OFICIALES.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)} className="text-xs py-2">
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-slate-800">{b.nombre}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          CI: {b.ci} · {b.unidad} ({b.iglesia})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 2. Tipo de Actividad (3 Obligatorias) */}
            <div className="space-y-1.5">
              <Label className="font-bold text-[#063A6B] text-xs">
                Tipo de Actividad Obligatoria
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    set_manual_tipo_actividad("practicas");
                    set_manual_sede(SEDES_POR_ACTIVIDAD.practicas[0]);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                    manual_tipo_actividad === "practicas"
                      ? "bg-[#063A6B] text-white border-[#063A6B] shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span className="block font-bold">Prácticas</span>
                  <span className="text-[10px] opacity-80 block">Preprofesionales</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    set_manual_tipo_actividad("escuela_lideres");
                    set_manual_sede(SEDES_POR_ACTIVIDAD.escuela_lideres[0]);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                    manual_tipo_actividad === "escuela_lideres"
                      ? "bg-[#D97706] text-white border-[#D97706] shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span className="block font-bold">Escuela de</span>
                  <span className="text-[10px] opacity-80 block">Líderes</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    set_manual_tipo_actividad("acciones_servicio");
                    set_manual_sede(SEDES_POR_ACTIVIDAD.acciones_servicio[0]);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                    manual_tipo_actividad === "acciones_servicio"
                      ? "bg-emerald-700 text-white border-emerald-700 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span className="block font-bold">Acciones de</span>
                  <span className="text-[10px] opacity-80 block">Servicio</span>
                </button>
              </div>
            </div>

            {/* 3. Sede / Lugar / Evento / Iglesia (Contextual) */}
            <div className="space-y-1.5">
              <Label htmlFor="manual-sede" className="font-bold text-[#063A6B] text-xs">
                {manual_tipo_actividad === "practicas"
                  ? "Agencia Diaconía para Prácticas"
                  : manual_tipo_actividad === "escuela_lideres"
                  ? "Sede Central de Escuela de Líderes"
                  : "Evento / Iglesia para Acciones de Servicio"}
              </Label>
              <Select
                value={manual_sede}
                onValueChange={(val: string | null) => {
                  if (val) set_manual_sede(val);
                }}
              >
                <SelectTrigger id="manual-sede" className="h-10 text-xs rounded-xl border-[#E3DCCB] bg-white">
                  <SelectValue placeholder="Seleccione lugar / sede" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E3DCCB]">
                  {SEDES_POR_ACTIVIDAD[manual_tipo_actividad].map((sede) => (
                    <SelectItem key={sede} value={sede} className="text-xs">
                      {sede}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 4. Fecha y Horarios (Ingreso / Salida) con cálculo en vivo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="manual-fecha" className="font-bold text-[#063A6B] text-xs">
                  Fecha
                </Label>
                <Input
                  id="manual-fecha"
                  type="date"
                  value={manual_fecha}
                  onChange={(e) => set_manual_fecha(e.target.value)}
                  className="h-10 text-xs rounded-xl border-[#E3DCCB]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="manual-ingreso" className="font-bold text-[#063A6B] text-xs">
                  Hora Ingreso
                </Label>
                <Input
                  id="manual-ingreso"
                  type="time"
                  value={manual_hora_ingreso}
                  onChange={(e) => set_manual_hora_ingreso(e.target.value)}
                  className="h-10 text-xs rounded-xl border-[#E3DCCB] font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="manual-salida" className="font-bold text-[#063A6B] text-xs">
                  Hora Salida
                </Label>
                <Input
                  id="manual-salida"
                  type="time"
                  value={manual_hora_salida}
                  onChange={(e) => set_manual_hora_salida(e.target.value)}
                  className="h-10 text-xs rounded-xl border-[#E3DCCB] font-mono"
                />
              </div>
            </div>

            {/* Cómputo de horas en vivo */}
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#063A6B]" />
                Tiempo computado en vivo:
              </span>
              <span className="font-mono font-bold text-sm text-[#063A6B]">
                {calcularHorasTranscurridas(manual_hora_ingreso, manual_hora_salida).toFixed(2)} horas
              </span>
            </div>

            {/* 5. Motivo de Contingencia */}
            <div className="space-y-1.5">
              <Label htmlFor="manual-motivo" className="font-bold text-[#063A6B] text-xs">
                Motivo de Contingencia
              </Label>
              <Select
                value={manual_motivo}
                onValueChange={(val: string | null) => {
                  if (val) set_manual_motivo(val);
                }}
              >
                <SelectTrigger id="manual-motivo" className="h-10 text-xs rounded-xl border-[#E3DCCB] bg-white">
                  <SelectValue placeholder="Seleccione motivo de contingencia" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E3DCCB]">
                  {MOTIVOS_CONTINGENCIA.map((motivo) => (
                    <SelectItem key={motivo} value={motivo} className="text-xs">
                      {motivo}
                    </SelectItem>
                  ))}
                  <SelectItem value="otro" className="text-xs">
                    Otro motivo específico...
                  </SelectItem>
                </SelectContent>
              </Select>

              {manual_motivo === "otro" && (
                <Input
                  placeholder="Especifique la causa justificada de contingencia..."
                  value={manual_motivo_personalizado}
                  onChange={(e) => set_manual_motivo_personalizado(e.target.value)}
                  className="h-9 text-xs rounded-xl border-[#E3DCCB] mt-2"
                />
              )}
            </div>
          </div>

          <DialogFooter className="p-4 border-t border-[#E3DCCB] bg-[#F8F9FA] flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={manual_guardando}
              onClick={intentarCerrarModalManual}
              className="rounded-xl text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={manual_guardando}
              onClick={manejarGuardarAsistenciaManual}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {manual_guardando ? "Registrando..." : "Guardar Asistencia Manual"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmación Institucional Unificado */}
      {DialogoConfirmacionInstitucional}
    </div>
  );
}
