"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SeleccionadorFecha } from "@/components/ui/seleccionador-fecha";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import {
  generarOpcionesCarreras,
  generarOpcionesIglesias,
} from "./constantes-academicas-eclesiales";
import { ModalVisorDocumentoBecario } from "./modal-visor-documento-becario";
import { Switch } from "@/components/ui/switch";
import {
  Search,
  Plus,
  UserCheck,
  Building2,
  GraduationCap,
  Mail,
  ShieldAlert,
  UserCog,
  CheckCircle2,
  Clock,
  Send,
  Lock,
  Edit2,
  Church,
  Phone,
  MapPin,
  Eye,
  Calendar,
  Sparkles,
  Award,
  Trash2,
  FileCheck,
  Users,
  UserPlus,
  Printer,
  Download,
  Loader2,
  Smartphone,
  Bus,
  Upload,
  FileText,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { clienteApi } from "@/lib/cliente-api";
import { useConsulta } from "@/hooks/useConsulta";
import { useConfirmacionDialogo } from "@/hooks/useConfirmacionDialogo";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import { toast } from "sonner";

export interface HorasMesHistorico {
  mes: string;
  horas_realizadas: number;
  meta_horas: number;
  porcentaje: number;
  estado: "cumplido" | "en_progreso" | "en_riesgo";
}

export interface BecarioVista {
  id: number;
  nombre: string;
  ci: string;
  expedicion: string;
  complemento?: string;
  estado_civil: string;
  sexo: "M" | "F";
  carrera: string;
  universidad: string;
  ceti: number;
  celular: string;
  correo: string;
  fecha_nacimiento: string;
  edad: number;
  direccion: string;
  ciudad: string;
  iglesia: string;
  lugar_practica: string;
  supervisor_id?: number | null;
  tutor_nombre: string;
  tutor_correo: string;
  estado: "activo" | "pendiente_validacion";
  horas_mes_actual: number;
  horas_meta_mes: number;
  historial_horas_mes: HorasMesHistorico[];
  tiene_usuario?: boolean;
  usuario_id?: number | null;
  url_carnet?: string;
  nombre_archivo_carnet?: string;
  url_kardex?: string;
  nombre_archivo_kardex?: string;
  fecha_subida_documentos?: string;
}

// Terminaciones y extensiones departamentales oficiales de Cédula de Identidad en Bolivia (SEGIP)
export const TERMINACIONES_CI_BOLIVIA = [
  { codigo: "LP", departamento: "La Paz" },
  { codigo: "SC", departamento: "Santa Cruz" },
  { codigo: "CB", departamento: "Cochabamba" },
  { codigo: "OR", departamento: "Oruro" },
  { codigo: "PT", departamento: "Potosí" },
  { codigo: "TJ", departamento: "Tarija" },
  { codigo: "CH", departamento: "Chuquisaca" },
  { codigo: "BN", departamento: "Beni" },
  { codigo: "PA", departamento: "Pando" },
  { codigo: "QR", departamento: "Extranjero / Naturalizado" },
] as const;

const SUPERVISORES_INSTITUCIONALES = [
  { nombre: "Angel Javier Ali Paz", correo: "angel.ali@diaconia.bo" },
  { nombre: "Claudia Cabrera", correo: "claudia.cabrera@diaconia.bo" },
  { nombre: "Rodrigo Solorzano", correo: "rodrigo.solorzano@diaconia.bo" },
  { nombre: "Lic. Mónica Valenzuela", correo: "monica.valenzuela@diaconia.bo" },
];

/**
 * Función de determinación de pertenencia de becario a un supervisor institucional.
 * Comprueba id numérico de supervisor, coincidencia de correo principal o correos alternativos/adicionales, o nombre de tutor.
 */
export function esBecarioDeSupervisor(becario: BecarioVista, usuarioActual: any): boolean {
  if (!usuarioActual) return false;
  if (becario.supervisor_id && Number(becario.supervisor_id) === Number(usuarioActual.id)) {
    return true;
  }
  if (becario.tutor_correo) {
    const c_tut = String(becario.tutor_correo).toLowerCase().trim();
    const p_tut = c_tut.split("@")[0];
    const correos_supervisor: string[] = [
      usuarioActual.correo,
      usuarioActual.correo_alternativo,
      ...(Array.isArray(usuarioActual.correos_adicionales)
        ? usuarioActual.correos_adicionales.map((item: any) =>
            typeof item === "string" ? item : item?.correo
          )
        : []),
    ]
      .filter(Boolean)
      .map((c) => String(c).toLowerCase().trim());

    for (const c_usr of correos_supervisor) {
      if (c_usr === c_tut) return true;
      const p_usr = c_usr.split("@")[0];
      if (p_usr && p_tut && p_usr === p_tut) return true;
    }
  }
  if (usuarioActual.nombre && becario.tutor_nombre) {
    const n_usr = String(usuarioActual.nombre).toLowerCase().trim();
    const n_tut = String(becario.tutor_nombre).toLowerCase().trim();
    if (n_usr === n_tut || n_tut.includes(n_usr) || n_usr.includes(n_tut)) {
      return true;
    }
  }
  return false;
}

const BECARIOS_INICIALES: BecarioVista[] = [
  {
    id: 1,
    nombre: "Adai Belen Huayta Cardozo",
    ci: "13696496",
    expedicion: "LP",
    estado_civil: "Soltera",
    sexo: "F",
    ceti: 3,
    celular: "79541458",
    correo: "adaibelen017@gmail.com",
    fecha_nacimiento: "01/07/1999",
    edad: 27,
    direccion: "Pasaje 21 de noviembre",
    ciudad: "El Alto",
    universidad: "Universidad Mayor de San Andrés",
    carrera: "Estadística",
    iglesia: "Misión Alianza Central",
    lugar_practica: "Oficina Central Bloque B",
    tutor_nombre: "Rodrigo Solorzano",
    tutor_correo: "rodrigo.solorzano@diaconia.bo",
    estado: "activo",
    horas_mes_actual: 39.5,
    horas_meta_mes: 36.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 39.5, meta_horas: 36.0, porcentaje: 110, estado: "cumplido" },
      { mes: "Septiembre 2026", horas_realizadas: 42.0, meta_horas: 36.0, porcentaje: 117, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 40.0, meta_horas: 36.0, porcentaje: 111, estado: "cumplido" },
    ],
  },
  {
    id: 2,
    nombre: "Daniel Davalos Quiñonez",
    ci: "9107373",
    expedicion: "LP",
    estado_civil: "Soltero",
    sexo: "M",
    ceti: 2,
    celular: "78804045",
    correo: "daniel234.davalos@gmail.com",
    fecha_nacimiento: "11/12/1995",
    edad: 31,
    direccion: "Calle Luis tapia #27 Z.",
    ciudad: "La Paz",
    universidad: "Universidad Mayor de San Andrés",
    carrera: "Informática",
    iglesia: "Iglesia Bautista Central",
    lugar_practica: "Oficina Central Bloque A",
    tutor_nombre: "Angel Javier Ali Paz",
    tutor_correo: "angel.ali@diaconia.bo",
    estado: "activo",
    horas_mes_actual: 40.0,
    horas_meta_mes: 36.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 40.0, meta_horas: 36.0, porcentaje: 111, estado: "cumplido" },
      { mes: "Septiembre 2026", horas_realizadas: 41.5, meta_horas: 36.0, porcentaje: 115, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 40.0, meta_horas: 36.0, porcentaje: 111, estado: "cumplido" },
    ],
  },
  {
    id: 3,
    nombre: "Edgar Elías Alarcon Huanca",
    ci: "9160054",
    expedicion: "LP",
    estado_civil: "Soltero",
    sexo: "M",
    ceti: 2,
    celular: "60662872",
    correo: "edgaralarcon112@gmail.com",
    fecha_nacimiento: "09/07/2000",
    edad: 26,
    direccion: "Zona las delicias, calle",
    ciudad: "La Paz",
    universidad: "Universidad de Aquino Bolivia",
    carrera: "Medicina",
    iglesia: "Comunidad Cristiana Vida Nueva",
    lugar_practica: "Consultorio Médico San Lucas",
    tutor_nombre: "Claudia Cabrera",
    tutor_correo: "claudia.cabrera@diaconia.bo",
    estado: "activo",
    horas_mes_actual: 38.0,
    horas_meta_mes: 36.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 38.0, meta_horas: 36.0, porcentaje: 106, estado: "cumplido" },
      { mes: "Septiembre 2026", horas_realizadas: 40.0, meta_horas: 36.0, porcentaje: 111, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 39.0, meta_horas: 36.0, porcentaje: 108, estado: "cumplido" },
    ],
  },
  {
    id: 4,
    nombre: "Nilda Amalia Churata Paye",
    ci: "10028341",
    expedicion: "LP",
    estado_civil: "Soltera",
    sexo: "F",
    ceti: 2,
    celular: "63140016",
    correo: "nildachurata99@gmail.com",
    fecha_nacimiento: "16/04/2002",
    edad: 24,
    direccion: "Zona Puerto Camacho",
    ciudad: "El Alto",
    universidad: "Universidad Pública de El Alto",
    carrera: "Educación Parvularia",
    iglesia: "Iglesia Central El Alto",
    lugar_practica: "Centro Infantil Sagrada Familia",
    tutor_nombre: "Angel Javier Ali Paz",
    tutor_correo: "angel.ali@diaconia.bo",
    estado: "activo",
    horas_mes_actual: 42.0,
    horas_meta_mes: 36.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 42.0, meta_horas: 36.0, porcentaje: 117, estado: "cumplido" },
      { mes: "Septiembre 2026", horas_realizadas: 43.0, meta_horas: 36.0, porcentaje: 119, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 41.0, meta_horas: 36.0, porcentaje: 114, estado: "cumplido" },
    ],
  },
  {
    id: 5,
    nombre: "Alejandro Roberth Paredes Tarquino",
    ci: "10064956",
    expedicion: "LP",
    estado_civil: "Soltero",
    sexo: "M",
    ceti: 1,
    celular: "78816188",
    correo: "roberthp092@gmail.com",
    fecha_nacimiento: "24/10/2004",
    edad: 22,
    direccion: "Zona Mcal. Santa Cruz",
    ciudad: "Viacha",
    universidad: "Universidad Pública de El Alto",
    carrera: "Comunicación Social",
    iglesia: "Iglesia Metodista Viacha",
    lugar_practica: "Sucursal Juan Pablo II",
    tutor_nombre: "Lic. Mónica Valenzuela",
    tutor_correo: "monica.valenzuela@diaconia.bo",
    estado: "activo",
    horas_mes_actual: 37.5,
    horas_meta_mes: 36.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 37.5, meta_horas: 36.0, porcentaje: 104, estado: "cumplido" },
      { mes: "Septiembre 2026", horas_realizadas: 39.0, meta_horas: 36.0, porcentaje: 108, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 38.0, meta_horas: 36.0, porcentaje: 106, estado: "cumplido" },
    ],
  },
  {
    id: 6,
    nombre: "Aydee Ruth Ali Condori",
    ci: "9952878",
    expedicion: "LP",
    estado_civil: "Soltera",
    sexo: "F",
    ceti: 1,
    celular: "63101324",
    correo: "alicondoriaydeeruth@gmail.com",
    fecha_nacimiento: "03/08/2004",
    edad: 22,
    direccion: "Zona Mcal. Sucre Sec",
    ciudad: "El Alto",
    universidad: "Universidad Pública de El Alto",
    carrera: "Contaduría Pública",
    iglesia: "Asambleas de Dios El Alto",
    lugar_practica: "Agencia Villa Dolores",
    tutor_nombre: "Claudia Cabrera",
    tutor_correo: "claudia.cabrera@diaconia.bo",
    estado: "activo",
    horas_mes_actual: 41.0,
    horas_meta_mes: 36.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 41.0, meta_horas: 36.0, porcentaje: 114, estado: "cumplido" },
      { mes: "Septiembre 2026", horas_realizadas: 40.5, meta_horas: 36.0, porcentaje: 113, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 40.0, meta_horas: 36.0, porcentaje: 111, estado: "cumplido" },
    ],
  },
  {
    id: 7,
    nombre: "Carlos Oscar Luna Lizarraga",
    ci: "9943280",
    expedicion: "LP",
    estado_civil: "Soltero",
    sexo: "M",
    ceti: 1,
    celular: "69902655",
    correo: "shionaries477@gmail.com",
    fecha_nacimiento: "04/04/2002",
    edad: 24,
    direccion: "Zona El Kenko, Av. Ka",
    ciudad: "El Alto",
    universidad: "Universidad Mayor de San Andrés",
    carrera: "Economía",
    iglesia: "Iglesia Cuadrangular El Alto",
    lugar_practica: "Oficina Central Bloque A",
    tutor_nombre: "Angel Javier Ali Paz",
    tutor_correo: "angel.ali@diaconia.bo",
    estado: "activo",
    horas_mes_actual: 34.0,
    horas_meta_mes: 36.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 34.0, meta_horas: 36.0, porcentaje: 94, estado: "en_progreso" },
      { mes: "Septiembre 2026", horas_realizadas: 38.0, meta_horas: 36.0, porcentaje: 106, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 39.0, meta_horas: 36.0, porcentaje: 108, estado: "cumplido" },
    ],
  },
  {
    id: 8,
    nombre: "Isaías Daniel Herrera Mamani",
    ci: "10920862",
    expedicion: "LP",
    estado_civil: "Soltero",
    sexo: "M",
    ceti: 1,
    celular: "62484594",
    correo: "herreraisaias667@gmail.com",
    fecha_nacimiento: "31/05/2004",
    edad: 22,
    direccion: "Zona Senkata Av. Ojo",
    ciudad: "El Alto",
    universidad: "Universidad Pública de El Alto",
    carrera: "Arquitectura",
    iglesia: "Iglesia Ebenezer Senkata",
    lugar_practica: "Oficina Central Bloque B",
    tutor_nombre: "Rodrigo Solorzano",
    tutor_correo: "rodrigo.solorzano@diaconia.bo",
    estado: "activo",
    horas_mes_actual: 38.5,
    horas_meta_mes: 36.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 38.5, meta_horas: 36.0, porcentaje: 107, estado: "cumplido" },
      { mes: "Septiembre 2026", horas_realizadas: 40.0, meta_horas: 36.0, porcentaje: 111, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 40.5, meta_horas: 36.0, porcentaje: 113, estado: "cumplido" },
    ],
  },
  {
    id: 9,
    nombre: "José Marcos Suñagua Quispe",
    ci: "14378720",
    expedicion: "LP",
    estado_civil: "Soltero",
    sexo: "M",
    ceti: 1,
    celular: "62270620",
    correo: "marcossunagua0@gmail.com",
    fecha_nacimiento: "07/02/2003",
    edad: 23,
    direccion: "Zona Tilata - Viacha C",
    ciudad: "Viacha",
    universidad: "Universidad Mayor de San Andrés",
    carrera: "Informática",
    iglesia: "Iglesia Cristiana Tilata",
    lugar_practica: "Oficina Central Bloque A",
    tutor_nombre: "Angel Javier Ali Paz",
    tutor_correo: "angel.ali@diaconia.bo",
    estado: "activo",
    horas_mes_actual: 40.5,
    horas_meta_mes: 36.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 40.5, meta_horas: 36.0, porcentaje: 113, estado: "cumplido" },
      { mes: "Septiembre 2026", horas_realizadas: 41.0, meta_horas: 36.0, porcentaje: 114, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 40.0, meta_horas: 36.0, porcentaje: 111, estado: "cumplido" },
    ],
  },
  {
    id: 10,
    nombre: "Mariela Dayana Jimenez Chambi",
    ci: "12959656",
    expedicion: "LP",
    estado_civil: "Soltera",
    sexo: "F",
    ceti: 1,
    celular: "70590493",
    correo: "jimenezcmarielaa@gmail.com",
    fecha_nacimiento: "19/07/2001",
    edad: 25,
    direccion: "Zona Obrajes Bella Vi",
    ciudad: "La Paz",
    universidad: "Universidad Mayor de San Andrés",
    carrera: "Contaduría Pública",
    iglesia: "Iglesia Alianza La Paz",
    lugar_practica: "Agencia Villa Dolores",
    tutor_nombre: "Claudia Cabrera",
    tutor_correo: "claudia.cabrera@diaconia.bo",
    estado: "activo",
    horas_mes_actual: 36.0,
    horas_meta_mes: 36.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 36.0, meta_horas: 36.0, porcentaje: 100, estado: "cumplido" },
      { mes: "Septiembre 2026", horas_realizadas: 39.5, meta_horas: 36.0, porcentaje: 110, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 40.0, meta_horas: 36.0, porcentaje: 111, estado: "cumplido" },
    ],
  },
  {
    id: 11,
    nombre: "Mayherli Alejandra Loza Villalobos",
    ci: "9925727",
    expedicion: "LP",
    estado_civil: "Soltera",
    sexo: "F",
    ceti: 1,
    celular: "60107414",
    correo: "villalobosbetty96@gmail.com",
    fecha_nacimiento: "07/06/2003",
    edad: 23,
    direccion: "Zona Villa Adela Plan",
    ciudad: "El Alto",
    universidad: "Universidad Mayor de San Andrés",
    carrera: "Contaduría Pública",
    iglesia: "Iglesia Bethesda Villa Adela",
    lugar_practica: "Sucursal Villa Adela",
    tutor_nombre: "Lic. Mónica Valenzuela",
    tutor_correo: "monica.valenzuela@diaconia.bo",
    estado: "activo",
    horas_mes_actual: 39.0,
    horas_meta_mes: 36.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 39.0, meta_horas: 36.0, porcentaje: 108, estado: "cumplido" },
      { mes: "Septiembre 2026", horas_realizadas: 40.0, meta_horas: 36.0, porcentaje: 111, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 40.0, meta_horas: 36.0, porcentaje: 111, estado: "cumplido" },
    ],
  },
  {
    id: 12,
    nombre: "Noemi Callisaya Alvarez",
    ci: "7093658",
    expedicion: "LP",
    estado_civil: "Soltera",
    sexo: "F",
    ceti: 1,
    celular: "60140086",
    correo: "k6924383@gmail.com",
    fecha_nacimiento: "24/04/1999",
    edad: 27,
    direccion: "Zona 31 de Enero Av.",
    ciudad: "El Alto",
    universidad: "Universidad Pública de El Alto",
    carrera: "Psicomotricidad y Deportes",
    iglesia: "Iglesia Santidad Pentecostal",
    lugar_practica: "Centro Infantil Sagrada Familia",
    tutor_nombre: "Angel Javier Ali Paz",
    tutor_correo: "angel.ali@diaconia.bo",
    estado: "activo",
    horas_mes_actual: 40.0,
    horas_meta_mes: 36.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 40.0, meta_horas: 36.0, porcentaje: 111, estado: "cumplido" },
      { mes: "Septiembre 2026", horas_realizadas: 41.0, meta_horas: 36.0, porcentaje: 114, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 39.5, meta_horas: 36.0, porcentaje: 110, estado: "cumplido" },
    ],
  },
  {
    id: 13,
    nombre: "Ronald Mauricio Quiquijana Mayta",
    ci: "6172054",
    expedicion: "LP",
    estado_civil: "Soltero",
    sexo: "M",
    ceti: 1,
    celular: "65604882",
    correo: "quiquijana333@gmail.com",
    fecha_nacimiento: "30/06/2001",
    edad: 25,
    direccion: "Zona Villa Dolores \"F\"",
    ciudad: "El Alto",
    universidad: "Escuela Militar de Ingeniería",
    carrera: "Ingeniería en Telecomunicaciones",
    iglesia: "Iglesia Bautista del Calvario",
    lugar_practica: "Oficina Central Bloque A",
    tutor_nombre: "Angel Javier Ali Paz",
    tutor_correo: "angel.ali@diaconia.bo",
    estado: "activo",
    horas_mes_actual: 42.5,
    horas_meta_mes: 36.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 42.5, meta_horas: 36.0, porcentaje: 118, estado: "cumplido" },
      { mes: "Septiembre 2026", horas_realizadas: 43.0, meta_horas: 36.0, porcentaje: 119, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 42.0, meta_horas: 36.0, porcentaje: 117, estado: "cumplido" },
    ],
  },
  {
    id: 14,
    nombre: "Ruddy Flores Tapia",
    ci: "9974211",
    expedicion: "LP",
    estado_civil: "Soltero",
    sexo: "M",
    ceti: 1,
    celular: "78777631",
    correo: "ruddyalan123@gmail.com",
    fecha_nacimiento: "03/01/1997",
    edad: 29,
    direccion: "Zona 16 de Febrero C",
    ciudad: "El Alto",
    universidad: "Universidad Mayor de San Andrés",
    carrera: "Informática",
    iglesia: "Iglesia Adventista del Séptimo Día",
    lugar_practica: "Oficina Central Bloque A",
    tutor_nombre: "Angel Javier Ali Paz",
    tutor_correo: "angel.ali@diaconia.bo",
    estado: "activo",
    horas_mes_actual: 38.0,
    horas_meta_mes: 36.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 38.0, meta_horas: 36.0, porcentaje: 106, estado: "cumplido" },
      { mes: "Septiembre 2026", horas_realizadas: 40.0, meta_horas: 36.0, porcentaje: 111, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 39.0, meta_horas: 36.0, porcentaje: 108, estado: "cumplido" },
    ],
  },
  {
    id: 15,
    nombre: "Gonzalo Valencia Laura",
    ci: "8416501",
    expedicion: "LP",
    estado_civil: "Soltero",
    sexo: "M",
    ceti: 0,
    celular: "75161427",
    correo: "gonzalovalencialau@gmail.com",
    fecha_nacimiento: "22/04/2002",
    edad: 24,
    direccion: "-16.470978,-68.5061",
    ciudad: "Provincial",
    universidad: "Universidad Pública de El Alto",
    carrera: "Contaduría Pública",
    iglesia: "Iglesia Evangélica Los Andes",
    lugar_practica: "Agencia Villa Dolores",
    tutor_nombre: "Claudia Cabrera",
    tutor_correo: "claudia.cabrera@diaconia.bo",
    estado: "pendiente_validacion",
    horas_mes_actual: 35.0,
    horas_meta_mes: 36.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 35.0, meta_horas: 36.0, porcentaje: 97, estado: "en_progreso" },
      { mes: "Septiembre 2026", horas_realizadas: 37.0, meta_horas: 36.0, porcentaje: 103, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 38.0, meta_horas: 36.0, porcentaje: 106, estado: "cumplido" },
    ],
  },
  {
    id: 16,
    nombre: "Gustavo Ariel Condori Montaño",
    ci: "13088041",
    expedicion: "LP",
    estado_civil: "Soltero",
    sexo: "M",
    ceti: 0,
    celular: "67339896",
    correo: "tavitolpb@gmail.com",
    fecha_nacimiento: "29/07/2003",
    edad: 23,
    direccion: "Al inicio de la Av. Mar",
    ciudad: "La Paz",
    universidad: "Universidad Salesiana de Bolivia",
    carrera: "Contaduría Pública",
    iglesia: "Iglesia Pentecostal de Bolivia",
    lugar_practica: "Oficina Central Bloque B",
    tutor_nombre: "Rodrigo Solorzano",
    tutor_correo: "rodrigo.solorzano@diaconia.bo",
    estado: "activo",
    horas_mes_actual: 39.0,
    horas_meta_mes: 36.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 39.0, meta_horas: 36.0, porcentaje: 108, estado: "cumplido" },
      { mes: "Septiembre 2026", horas_realizadas: 40.0, meta_horas: 36.0, porcentaje: 111, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 39.0, meta_horas: 36.0, porcentaje: 108, estado: "cumplido" },
    ],
  },
  {
    id: 17,
    nombre: "Lisbeth Pacasi Machaca",
    ci: "13603536",
    expedicion: "LP",
    estado_civil: "Soltera",
    sexo: "F",
    ceti: 0,
    celular: "78022401",
    correo: "lizbethpacasiesperanza@gmail.com",
    fecha_nacimiento: "27/07/2006",
    edad: 20,
    direccion: "Jupapina, calle 11, N",
    ciudad: "La Paz",
    universidad: "Universidad de Aquino Bolivia",
    carrera: "Bioquímica y Farmacia",
    iglesia: "Comunidad Cristiana Vida Nueva",
    lugar_practica: "Consultorio Médico San Lucas",
    tutor_nombre: "Claudia Cabrera",
    tutor_correo: "claudia.cabrera@diaconia.bo",
    estado: "activo",
    horas_mes_actual: 41.5,
    horas_meta_mes: 36.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 41.5, meta_horas: 36.0, porcentaje: 115, estado: "cumplido" },
      { mes: "Septiembre 2026", horas_realizadas: 42.0, meta_horas: 36.0, porcentaje: 117, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 40.0, meta_horas: 36.0, porcentaje: 111, estado: "cumplido" },
    ],
  },
  {
    id: 18,
    nombre: "Selena Fernanda Pillco Mamani",
    ci: "13693151",
    expedicion: "LP",
    estado_civil: "Soltera",
    sexo: "F",
    ceti: 0,
    celular: "71957515",
    correo: "selenafernandapillcomamani@gmail.com",
    fecha_nacimiento: "25/06/2007",
    edad: 19,
    direccion: "EA Junthuma Fabril C",
    ciudad: "El Alto",
    universidad: "Universidad Mayor de San Andrés",
    carrera: "Economía",
    iglesia: "Iglesia Metodista El Alto",
    lugar_practica: "Oficina Central Bloque A",
    tutor_nombre: "Angel Javier Ali Paz",
    tutor_correo: "angel.ali@diaconia.bo",
    estado: "activo",
    horas_mes_actual: 40.0,
    horas_meta_mes: 36.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 40.0, meta_horas: 36.0, porcentaje: 111, estado: "cumplido" },
      { mes: "Septiembre 2026", horas_realizadas: 40.5, meta_horas: 36.0, porcentaje: 113, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 39.5, meta_horas: 36.0, porcentaje: 110, estado: "cumplido" },
    ],
  },
  {
    id: 19,
    nombre: "Milenka Quispe Coarite",
    ci: "14155448",
    expedicion: "LP",
    estado_civil: "Soltera",
    sexo: "F",
    ceti: 0,
    celular: "63155199",
    correo: "milenkaquispecoarite@gmail.com",
    fecha_nacimiento: "21/06/2006",
    edad: 20,
    direccion: "z/ Ballivian c/Jose Ch",
    ciudad: "El Alto",
    universidad: "Universidad Tecnológica Boliviana",
    carrera: "Administración de Empresas",
    iglesia: "Iglesia Asamblea de Dios",
    lugar_practica: "Sucursal Juan Pablo II",
    tutor_nombre: "Lic. Mónica Valenzuela",
    tutor_correo: "monica.valenzuela@diaconia.bo",
    estado: "activo",
    horas_mes_actual: 37.0,
    horas_meta_mes: 36.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 37.0, meta_horas: 36.0, porcentaje: 103, estado: "cumplido" },
      { mes: "Septiembre 2026", horas_realizadas: 39.0, meta_horas: 36.0, porcentaje: 108, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 38.0, meta_horas: 36.0, porcentaje: 106, estado: "cumplido" },
    ],
  },
  {
    id: 20,
    nombre: "Joselin Wara Huanca Paucara",
    ci: "12604724",
    expedicion: "LP",
    estado_civil: "Soltera",
    sexo: "F",
    ceti: 0,
    celular: "75263547",
    correo: "joselinhuancapaucara@gmail.com",
    fecha_nacimiento: "02/03/2000",
    edad: 26,
    direccion: "Zona Alto Villa Victori",
    ciudad: "El Alto",
    universidad: "Universidad Pública de El Alto",
    carrera: "Contaduría Pública",
    iglesia: "Iglesia Cristiana Vida Eterna",
    lugar_practica: "Agencia Villa Dolores",
    tutor_nombre: "Claudia Cabrera",
    tutor_correo: "claudia.cabrera@diaconia.bo",
    estado: "activo",
    horas_mes_actual: 38.5,
    horas_meta_mes: 36.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 38.5, meta_horas: 36.0, porcentaje: 107, estado: "cumplido" },
      { mes: "Septiembre 2026", horas_realizadas: 40.0, meta_horas: 36.0, porcentaje: 111, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 39.0, meta_horas: 36.0, porcentaje: 108, estado: "cumplido" },
    ],
  },
  {
    id: 21,
    nombre: "Johan Ludving Misme Flores",
    ci: "9208456",
    expedicion: "LP",
    estado_civil: "Soltero",
    sexo: "M",
    ceti: 0,
    celular: "69865195",
    correo: "johan69865195@gmail.com",
    fecha_nacimiento: "27/04/2004",
    edad: 22,
    direccion: "Z.EL MIRADOR, AV.",
    ciudad: "El Alto",
    universidad: "Universidad Mayor de San Andrés",
    carrera: "Informática",
    iglesia: "Iglesia Menonita El Alto",
    lugar_practica: "Oficina Central Bloque A",
    tutor_nombre: "Angel Javier Ali Paz",
    tutor_correo: "angel.ali@diaconia.bo",
    estado: "activo",
    horas_mes_actual: 39.0,
    horas_meta_mes: 36.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 39.0, meta_horas: 36.0, porcentaje: 108, estado: "cumplido" },
      { mes: "Septiembre 2026", horas_realizadas: 40.5, meta_horas: 36.0, porcentaje: 113, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 40.0, meta_horas: 36.0, porcentaje: 111, estado: "cumplido" },
    ],
  },
  {
    id: 22,
    nombre: "Matias Jose Uri Flores",
    ci: "13627440",
    expedicion: "LP",
    estado_civil: "Soltero",
    sexo: "M",
    ceti: 0,
    celular: "72018255",
    correo: "matiasjoseuriflores@gmail.com",
    fecha_nacimiento: "24/04/2006",
    edad: 20,
    direccion: "Zona 23 de Marzo Ca",
    ciudad: "El Alto",
    universidad: "Universidad Mayor de San Andrés",
    carrera: "Lingüística e Idiomas",
    iglesia: "Iglesia Bautista La Paz",
    lugar_practica: "Oficina Central Bloque B",
    tutor_nombre: "Rodrigo Solorzano",
    tutor_correo: "rodrigo.solorzano@diaconia.bo",
    estado: "activo",
    horas_mes_actual: 40.0,
    horas_meta_mes: 36.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 40.0, meta_horas: 36.0, porcentaje: 111, estado: "cumplido" },
      { mes: "Septiembre 2026", horas_realizadas: 41.0, meta_horas: 36.0, porcentaje: 114, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 40.0, meta_horas: 36.0, porcentaje: 111, estado: "cumplido" },
    ],
  },
  {
    id: 23,
    nombre: "Mateo Miguel Cussi Flores",
    ci: "8411610",
    expedicion: "LP",
    estado_civil: "Soltero",
    sexo: "M",
    ceti: 0,
    celular: "65120464",
    correo: "mateocussi11@gmail.com",
    fecha_nacimiento: "11/06/2002",
    edad: 24,
    direccion: "Z/ BARRIO MUNICIP",
    ciudad: "La Paz",
    universidad: "Universidad Mayor de San Andrés",
    carrera: "Informática",
    iglesia: "Iglesia Alianza Cristiana",
    lugar_practica: "Oficina Central Bloque A",
    tutor_nombre: "Angel Javier Ali Paz",
    tutor_correo: "angel.ali@diaconia.bo",
    estado: "activo",
    horas_mes_actual: 38.5,
    horas_meta_mes: 36.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 38.5, meta_horas: 36.0, porcentaje: 107, estado: "cumplido" },
      { mes: "Septiembre 2026", horas_realizadas: 39.5, meta_horas: 36.0, porcentaje: 110, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 40.0, meta_horas: 36.0, porcentaje: 111, estado: "cumplido" },
    ],
  },
];

function normalizarBecario(remoto: any): BecarioVista {
  if (!remoto || typeof remoto !== "object") {
    return BECARIOS_INICIALES[0];
  }

  const ci_str = remoto.ci ? String(remoto.ci).trim() : "";
  const match_inicial = BECARIOS_INICIALES.find(
    (b) =>
      (ci_str && b.ci === ci_str) ||
      (remoto.usuario?.nombre && (b.nombre || "").toLowerCase() === String(remoto.usuario.nombre).toLowerCase()) ||
      (remoto.nombre && (b.nombre || "").toLowerCase() === String(remoto.nombre).toLowerCase())
  );

  const nombre =
    (typeof remoto.nombre === "string" && remoto.nombre.trim() !== "" ? remoto.nombre : null) ||
    (remoto.usuario && typeof remoto.usuario.nombre === "string" ? remoto.usuario.nombre : null) ||
    match_inicial?.nombre ||
    "Becario Institucional";

  const correo =
    (typeof remoto.correo === "string" && remoto.correo.trim() !== "" ? remoto.correo : null) ||
    (remoto.usuario && typeof remoto.usuario.correo === "string" ? remoto.usuario.correo : null) ||
    match_inicial?.correo ||
    `${(nombre || "becario").toLowerCase().replace(/\s+/g, "")}@diaconia.bo`;

  const iglesia =
    typeof remoto.iglesia === "string"
      ? remoto.iglesia
      : remoto.iglesia?.nombre || match_inicial?.iglesia || "Iglesia Institucional";

  const lugar_practica =
    typeof remoto.lugar_practica === "string"
      ? remoto.lugar_practica
      : remoto.lugar_practica?.nombre || match_inicial?.lugar_practica || "Oficina Central Bloque A";

  const tutor_nombre =
    remoto.tutor_nombre ||
    remoto.supervisor?.nombre ||
    match_inicial?.tutor_nombre ||
    SUPERVISORES_INSTITUCIONALES[0].nombre;

  const tutor_correo =
    remoto.tutor_correo ||
    remoto.supervisor?.correo ||
    match_inicial?.tutor_correo ||
    SUPERVISORES_INSTITUCIONALES[0].correo;

  const supervisor_id =
    remoto.supervisor_id ??
    (remoto.supervisor ? remoto.supervisor.id : match_inicial?.supervisor_id ?? null);

  const horas_mes_actual =
    typeof remoto.horas_mes_actual === "number"
      ? remoto.horas_mes_actual
      : match_inicial?.horas_mes_actual ?? 36.0;

  const horas_meta_mes =
    typeof remoto.horas_meta_mes === "number"
      ? remoto.horas_meta_mes
      : match_inicial?.horas_meta_mes ?? 36.0;

  const historial_horas_mes: HorasMesHistorico[] =
    Array.isArray(remoto.historial_horas_mes) && remoto.historial_horas_mes.length > 0
      ? remoto.historial_horas_mes
      : match_inicial?.historial_horas_mes || [
          {
            mes: "Octubre 2026",
            horas_realizadas: horas_mes_actual,
            meta_horas: horas_meta_mes,
            porcentaje: Math.round((horas_mes_actual / (horas_meta_mes || 36)) * 100),
            estado:
              horas_mes_actual >= horas_meta_mes
                ? "cumplido"
                : horas_mes_actual >= 27
                ? "en_progreso"
                : "en_riesgo",
          },
          { mes: "Septiembre 2026", horas_realizadas: 36.0, meta_horas: 36.0, porcentaje: 100, estado: "cumplido" },
          { mes: "Agosto 2026", horas_realizadas: 36.0, meta_horas: 36.0, porcentaje: 100, estado: "cumplido" },
        ];

  const estado: "activo" | "pendiente_validacion" =
    remoto.estado === "activo" || remoto.estado === "pendiente_validacion"
      ? remoto.estado
      : remoto.datos_validados === false || remoto.confirmacion_datos_pendiente
      ? "pendiente_validacion"
      : match_inicial?.estado || "activo";

  return {
    id: remoto.id || match_inicial?.id || 1,
    nombre,
    ci: ci_str || match_inicial?.ci || "0000000",
    expedicion: TERMINACIONES_CI_BOLIVIA.some(
      (t) => t.codigo === (remoto.expedicion || remoto.lugar_expedicion || match_inicial?.expedicion || "LP").trim().toUpperCase()
    )
      ? (remoto.expedicion || remoto.lugar_expedicion || match_inicial?.expedicion || "LP").trim().toUpperCase()
      : "LP",
    complemento: remoto.complemento || (ci_str.includes("-") ? ci_str.split("-")[1]?.trim().toUpperCase() : undefined),
    estado_civil: remoto.estado_civil || match_inicial?.estado_civil || "Soltero(a)",
    sexo: remoto.sexo === "M" || remoto.sexo === "F" ? remoto.sexo : match_inicial?.sexo || "M",
    carrera: remoto.carrera || match_inicial?.carrera || "Carrera Universitaria",
    universidad: remoto.universidad || match_inicial?.universidad || "Universidad Mayor de San Andrés",
    ceti: typeof remoto.ceti === "number" ? remoto.ceti : match_inicial?.ceti || 1,
    celular: remoto.celular || match_inicial?.celular || "70000000",
    correo,
    fecha_nacimiento: remoto.fecha_nacimiento || match_inicial?.fecha_nacimiento || "01/01/2000",
    edad: typeof remoto.edad === "number" ? remoto.edad : match_inicial?.edad || 22,
    direccion: remoto.direccion || match_inicial?.direccion || "Zona Central",
    ciudad: remoto.ciudad || match_inicial?.ciudad || "La Paz",
    iglesia,
    lugar_practica,
    supervisor_id,
    tutor_nombre,
    tutor_correo,
    estado,
    horas_mes_actual,
    horas_meta_mes,
    historial_horas_mes,
    tiene_usuario: remoto.usuario !== undefined || remoto.usuario_id !== undefined
      ? Boolean(remoto.usuario || remoto.usuario_id)
      : true,
    usuario_id: remoto.usuario_id ?? (remoto.usuario ? remoto.usuario.id : null),
    url_carnet: remoto.url_carnet || match_inicial?.url_carnet,
    nombre_archivo_carnet: remoto.nombre_archivo_carnet || match_inicial?.nombre_archivo_carnet || `CI_${ci_str || "doc"}.pdf`,
    url_kardex: remoto.url_kardex || match_inicial?.url_kardex,
    nombre_archivo_kardex: remoto.nombre_archivo_kardex || match_inicial?.nombre_archivo_kardex || `Kardex_2026_${remoto.universidad || match_inicial?.universidad || "UMSA"}.pdf`,
    fecha_subida_documentos: remoto.fecha_subida_documentos || match_inicial?.fecha_subida_documentos || "2026-02-15",
  };
}

export function GestionBecarios() {
  const { usuario } = usarAutenticacion();
  const [descargando_pdf_estudiante, set_descargando_pdf_estudiante] = useState<string | null>(null);

  const descargarExpedienteRecorridosEstudiante = async (becario_id: number, nombre: string) => {
    try {
      set_descargando_pdf_estudiante('recorridos_' + becario_id);
      toast.info('Generando expediente mensual de recorridos con Puppeteer...', {
        description: 'Estudiante: ' + nombre,
      });
      const blob = await clienteApi.descargarBlob('/pdf/recorridos-estudiante/' + becario_id + '?mes=2026-10');
      const url = window.URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = 'Expediente_Recorridos_' + nombre.replace(/\s+/g, '_') + '_2026_10.pdf';
      document.body.appendChild(enlace);
      enlace.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(enlace);
      toast.success('Expediente de recorridos descargado exitosamente');
    } catch (_e) {
      toast.error('Error al exportar el expediente de recorridos en PDF');
    } finally {
      set_descargando_pdf_estudiante(null);
    }
  };

  const descargarAsistenciaMensualEstudiante = async (becario_id: number, nombre: string) => {
    try {
      set_descargando_pdf_estudiante('asistencia_' + becario_id);
      toast.info('Generando kárdex de asistencia mensual con Puppeteer...', {
        description: 'Estudiante: ' + nombre,
      });
      const blob = await clienteApi.descargarBlob('/pdf/asistencia-estudiante/' + becario_id + '?mes=2026-10');
      const url = window.URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = 'Asistencia_Mensual_' + nombre.replace(/\s+/g, '_') + '_2026_10.pdf';
      document.body.appendChild(enlace);
      enlace.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(enlace);
      toast.success('Kárdex de asistencia mensual descargado exitosamente');
    } catch (_e) {
      toast.error('Error al exportar la asistencia mensual en PDF');
    } finally {
      set_descargando_pdf_estudiante(null);
    }
  };
  const es_admin = usuario?.rol === "administrador";
  const es_supervisor = usuario?.rol === "supervisor";

  const [lista_becarios, set_lista_becarios] = useState<BecarioVista[]>(() => {
    if (usuario?.rol === "supervisor") {
      return BECARIOS_INICIALES.filter((b) => esBecarioDeSupervisor(b, usuario));
    }
    return BECARIOS_INICIALES;
  });
  const [busqueda, set_busqueda] = useState("");
  const [modal_abierto, set_modal_abierto] = useState(false);

  // Estados para modales de Horas y Ficha Completa
  const [becario_horas_modal, set_becario_horas_modal] = useState<BecarioVista | null>(null);
  const [becario_ficha_modal, set_becario_ficha_modal] = useState<BecarioVista | null>(null);

  // Consulta API con datos precargados y normalización defensiva
  const { datos: becarios_remotos } = useConsulta<BecarioVista[]>(
    `lista_becarios_${usuario?.id || "global"}`,
    async () => {
      try {
        const respuesta = await clienteApi.get<any[]>("/api/becarios");
        if (Array.isArray(respuesta) && respuesta.length > 0) {
          const normalizados = respuesta.map(normalizarBecario);
          if (usuario?.rol === "supervisor") {
            return normalizados.filter((b) => esBecarioDeSupervisor(b, usuario));
          }
          return normalizados;
        }
        if (usuario?.rol === "supervisor") {
          return BECARIOS_INICIALES.filter((b) => esBecarioDeSupervisor(b, usuario));
        }
        return BECARIOS_INICIALES;
      } catch {
        if (usuario?.rol === "supervisor") {
          return BECARIOS_INICIALES.filter((b) => esBecarioDeSupervisor(b, usuario));
        }
        return BECARIOS_INICIALES;
      }
    },
    {
      datos_iniciales:
        usuario?.rol === "supervisor"
          ? BECARIOS_INICIALES.filter((b) => esBecarioDeSupervisor(b, usuario))
          : BECARIOS_INICIALES,
    }
  );

  useEffect(() => {
    if (becarios_remotos && Array.isArray(becarios_remotos)) {
      set_lista_becarios(becarios_remotos);
    }
  }, [becarios_remotos]);

  // Lista adaptada al rol: el supervisor SÓLO ve a los becarios que supervisa
  const lista_para_rol = useMemo(() => {
    if (es_supervisor) {
      return lista_becarios.filter((b) => esBecarioDeSupervisor(b, usuario));
    }
    return lista_becarios;
  }, [lista_becarios, es_supervisor, usuario]);

  // Estados del formulario nuevo becario (Estandarizado Bolivia SEGIP)
  const [nuevo_nombre, set_nuevo_nombre] = useState("");
  const [nuevo_ci, set_nuevo_ci] = useState("");
  const [nuevo_expedicion, set_nuevo_expedicion] = useState("LP");
  const [nuevo_complemento, set_nuevo_complemento] = useState("");
  const [nueva_carrera, set_nueva_carrera] = useState("");
  const [nueva_universidad, set_nueva_universidad] = useState("UMSA");
  const [nueva_iglesia, set_nueva_iglesia] = useState("");
  const [nuevo_lugar, set_nuevo_lugar] = useState("Oficina Central Bloque A");
  const [nuevo_estado, set_nuevo_estado] = useState<"pendiente_validacion" | "activo">("pendiente_validacion");
  const [nuevo_documento_nombre, set_nuevo_documento_nombre] = useState("");
  const [nuevo_documento_url, set_nuevo_documento_url] = useState("");
  const [nuevo_documento_tamano, set_nuevo_documento_tamano] = useState("");

  // Documentos específicos de identidad y académicos
  const [nuevo_carnet_nombre, set_nuevo_carnet_nombre] = useState("");
  const [nuevo_carnet_url, set_nuevo_carnet_url] = useState("");
  const [nuevo_carnet_tamano, set_nuevo_carnet_tamano] = useState("");

  const [nuevo_kardex_nombre, set_nuevo_kardex_nombre] = useState("");
  const [nuevo_kardex_url, set_nuevo_kardex_url] = useState("");
  const [nuevo_kardex_tamano, set_nuevo_kardex_tamano] = useState("");

  const [guardando_becario, set_guardando_becario] = useState(false);

  // Estados para Modal de Edición de Becario (Exclusivo Administrador)
  const [modal_editar_abierto, set_modal_editar_abierto] = useState(false);
  const [becario_a_editar, set_becario_a_editar] = useState<BecarioVista | null>(null);
  const [edit_nombre, set_edit_nombre] = useState("");
  const [edit_ci, set_edit_ci] = useState("");
  const [edit_expedicion, set_edit_expedicion] = useState("LP");
  const [edit_complemento, set_edit_complemento] = useState("");
  const [edit_carrera, set_edit_carrera] = useState("");
  const [edit_universidad, set_edit_universidad] = useState("UMSA");
  const [edit_correo, set_edit_correo] = useState("");
  const [edit_celular, set_edit_celular] = useState("");
  const [edit_sexo, set_edit_sexo] = useState<"M" | "F">("F");
  const [edit_estado_civil, set_edit_estado_civil] = useState("Soltero(a)");
  const [edit_fecha_nacimiento, set_edit_fecha_nacimiento] = useState("2003-01-01");
  const [edit_direccion, set_edit_direccion] = useState("");
  const [edit_ciudad, set_edit_ciudad] = useState("La Paz");
  const [edit_iglesia, set_edit_iglesia] = useState("");
  const [edit_sede, set_edit_sede] = useState("Oficina Central Bloque A");
  const [edit_supervisor, set_edit_supervisor] = useState(SUPERVISORES_INSTITUCIONALES[0].nombre);
  const [edit_estado, set_edit_estado] = useState<"activo" | "pendiente_validacion">("activo");
  const [edit_ceti, set_edit_ceti] = useState(1);
  const [edit_horas_meta_mes, set_edit_horas_meta_mes] = useState(36);
  const [edit_carnet_nombre, set_edit_carnet_nombre] = useState("");
  const [edit_carnet_url, set_edit_carnet_url] = useState("");
  const [edit_kardex_nombre, set_edit_kardex_nombre] = useState("");
  const [edit_kardex_url, set_edit_kardex_url] = useState("");
  const [guardando_edicion, set_guardando_edicion] = useState(false);

  // Estados para Modal de Configuración de Pasajes (Solo Ida / Ida y Vuelta - TAREA-14)
  const [modal_pasajes_abierto, set_modal_pasajes_abierto] = useState(false);
  const [becario_pasajes, set_becario_pasajes] = useState<BecarioVista | null>(null);
  const [modalidad_pasajes_gral, set_modalidad_pasajes_gral] = useState<"ida_y_vuelta" | "solo_ida">("ida_y_vuelta");
  const [pasajes_practicas, set_pasajes_practicas] = useState<"ida_y_vuelta" | "solo_ida">("ida_y_vuelta");
  const [pasajes_escuela, set_pasajes_escuela] = useState<"ida_y_vuelta" | "solo_ida">("ida_y_vuelta");
  const [pasajes_servicio, set_pasajes_servicio] = useState<"ida_y_vuelta" | "solo_ida">("ida_y_vuelta");
  const [guardando_config_pasajes, set_guardando_config_pasajes] = useState(false);

  // Estado del Visor de Documentos Oficiales
  const [documento_visor_seleccionado, set_documento_visor_seleccionado] = useState<{
    tipo: "carnet" | "kardex";
    becario: BecarioVista;
  } | null>(null);

  // Catálogos dinámicos para Combobox (Carreras por Universidad e Iglesias Diaconía/BUMAND)
  const opciones_carreras_nuevo = useMemo(
    () => generarOpcionesCarreras(nueva_universidad),
    [nueva_universidad]
  );
  const opciones_carreras_edicion = useMemo(
    () => generarOpcionesCarreras(edit_universidad),
    [edit_universidad]
  );
  const opciones_iglesias = useMemo(
    () => generarOpcionesIglesias(),
    []
  );

  const manejarSubirCarnetNuevo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Archivo demasiado grande", { description: "El carnet debe ser menor a 15 MB." });
      return;
    }
    const tamano = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`;
    set_nuevo_carnet_nombre(file.name);
    set_nuevo_carnet_tamano(tamano);
    const lector = new FileReader();
    lector.onload = () => set_nuevo_carnet_url(lector.result as string);
    lector.readAsDataURL(file);
    toast.success("Cédula de Identidad adjuntada", { description: file.name });
  };

  const manejarSubirKardexNuevo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Archivo demasiado grande", { description: "El kárdex debe ser menor a 15 MB." });
      return;
    }
    const tamano = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`;
    set_nuevo_kardex_nombre(file.name);
    set_nuevo_kardex_tamano(tamano);
    const lector = new FileReader();
    lector.onload = () => set_nuevo_kardex_url(lector.result as string);
    lector.readAsDataURL(file);
    toast.success("Kárdex académico adjuntado", { description: file.name });
  };

  const manejarSubirDocumentoNuevoBecario = (e: React.ChangeEvent<HTMLInputElement>) => {
    manejarSubirCarnetNuevo(e);
  };

  const manejarSubirCarnetEdicion = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    set_edit_carnet_nombre(file.name);
    const lector = new FileReader();
    lector.onload = () => set_edit_carnet_url(lector.result as string);
    lector.readAsDataURL(file);
    toast.success("Carnet actualizado en formulario", { description: file.name });
  };

  const manejarSubirKardexEdicion = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    set_edit_kardex_nombre(file.name);
    const lector = new FileReader();
    lector.onload = () => set_edit_kardex_url(lector.result as string);
    lector.readAsDataURL(file);
    toast.success("Kárdex actualizado en formulario", { description: file.name });
  };

  // Estado para Asignar Supervisor (Modal)
  const [modal_supervisor_abierto, set_modal_supervisor_abierto] = useState(false);
  const [becario_seleccionado, set_becario_seleccionado] = useState<BecarioVista | null>(null);
  const [supervisor_seleccionado, set_supervisor_seleccionado] = useState(
    SUPERVISORES_INSTITUCIONALES[0].nombre
  );

  // Estado para Verificación Mensual y Pestañas Temáticas
  const [verificacion_mensual_activa, set_verificacion_mensual_activa] = useState(false);
  const [pestaña_activa, set_pestaña_activa] = useState<"directorio" | "horas" | "sedes" | "validaciones">("directorio");

  const {
    confirmarCierreSinCompletar,
    confirmarEliminacionRegistro,
    confirmarAccionInstitucional,
    DialogoConfirmacionInstitucional,
  } = useConfirmacionDialogo();

  const becarios_en_riesgo = useMemo(() => {
    return lista_para_rol.filter((b) => (b.horas_mes_actual ?? 0) < 27);
  }, [lista_para_rol]);

  const becarios_pendientes = useMemo(() => {
    return lista_para_rol.filter((b) => b.estado === "pendiente_validacion");
  }, [lista_para_rol]);

  const sedes_unicas = useMemo(() => {
    const conjunto = new Set<string>();
    lista_para_rol.forEach((b) => {
      const nombre_sede = typeof b.lugar_practica === "string" ? b.lugar_practica : (b.lugar_practica as any)?.nombre;
      if (nombre_sede) conjunto.add(nombre_sede);
    });
    return Array.from(conjunto);
  }, [lista_para_rol]);

  const tiene_cambios_nuevo_becario =
    nuevo_nombre.trim() !== "" ||
    nuevo_ci.trim() !== "" ||
    nueva_carrera.trim() !== "" ||
    nueva_iglesia.trim() !== "";

  const intentarCerrarModalBecario = () => {
    confirmarCierreSinCompletar(
      tiene_cambios_nuevo_becario,
      () => {
        set_modal_abierto(false);
        set_nuevo_nombre("");
        set_nuevo_ci("");
        set_nuevo_complemento("");
        set_nueva_carrera("");
        set_nueva_iglesia("");
        set_nuevo_documento_nombre("");
        set_nuevo_documento_url("");
        set_nuevo_documento_tamano("");
        set_nuevo_carnet_nombre("");
        set_nuevo_carnet_url("");
        set_nuevo_carnet_tamano("");
        set_nuevo_kardex_nombre("");
        set_nuevo_kardex_url("");
        set_nuevo_kardex_tamano("");
        set_nuevo_estado("pendiente_validacion");
      },
      "Registro de Nuevo Becario"
    );
  };

  // Filtrado reactivo defensivo contra propiedades nulas o indefinidas
  const busqueda_limpia = (busqueda || "").toLowerCase().trim();
  const becarios_filtrados = lista_para_rol.filter((b) => {
    if (!b) return false;
    const nombre = (b.nombre || "").toLowerCase();
    const ci = String(b.ci || "");
    const carrera = (b.carrera || "").toLowerCase();
    const universidad = (b.universidad || "").toLowerCase();
    return (
      nombre.includes(busqueda_limpia) ||
      ci.includes(busqueda_limpia) ||
      carrera.includes(busqueda_limpia) ||
      universidad.includes(busqueda_limpia)
    );
  });

  const manejarGuardarBecario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!es_admin) {
      toast.error("Acción restringida: Solo el Administrador puede registrar nuevos becarios.");
      return;
    }
    if (!nuevo_nombre.trim() || !nuevo_ci.trim()) {
      toast.error("El nombre completo y el C.I. son obligatorios");
      return;
    }

    try {
      set_guardando_becario(true);

      const ci_limpio = nuevo_complemento.trim()
        ? `${nuevo_ci.trim()}-${nuevo_complemento.trim().toUpperCase()}`
        : nuevo_ci.trim();

      const payload = {
        ci: ci_limpio,
        lugar_expedicion: nuevo_expedicion,
        nombre: nuevo_nombre.trim(),
        carrera: nueva_carrera.trim() || "Ingeniería de Sistemas",
        universidad: nueva_universidad,
        fecha_ingreso: new Date().toISOString().split("T")[0],
        url_carnet: nuevo_carnet_url || undefined,
        url_kardex: nuevo_kardex_url || undefined,
      };

      let creado_remoto: any = null;
      try {
        creado_remoto = await clienteApi.post<any>("/api/becarios", payload);
      } catch (error_api: any) {
        console.warn("Fallo al persistir en backend, usando modo de respaldo local:", error_api);
      }

      const nuevo: BecarioVista = normalizarBecario(creado_remoto || {
        ...payload,
        id: lista_becarios.length + 1,
        expedicion: nuevo_expedicion,
        complemento: nuevo_complemento.trim() || undefined,
        estado_civil: "Soltero(a)",
        sexo: "M",
        ceti: 1,
        celular: "70000000",
        correo: `${nuevo_nombre.toLowerCase().replace(/\s+/g, "")}@gmail.com`,
        fecha_nacimiento: "01/01/2000",
        edad: 24,
        direccion: "Zona Central",
        ciudad: "La Paz",
        iglesia: nueva_iglesia,
        lugar_practica: nuevo_lugar,
        tutor_nombre: SUPERVISORES_INSTITUCIONALES[0].nombre,
        tutor_correo: SUPERVISORES_INSTITUCIONALES[0].correo,
        estado: nuevo_estado,
        horas_mes_actual: 0,
        horas_meta_mes: 36.0,
        url_carnet: nuevo_carnet_url || undefined,
        nombre_archivo_carnet: nuevo_carnet_nombre || undefined,
        url_kardex: nuevo_kardex_url || undefined,
        nombre_archivo_kardex: nuevo_kardex_nombre || undefined,
        fecha_subida_documentos: new Date().toISOString().split("T")[0],
        historial_horas_mes: [
          { mes: "Octubre 2026", horas_realizadas: 0, meta_horas: 36.0, porcentaje: 0, estado: "en_riesgo" },
          { mes: "Septiembre 2026", horas_realizadas: 0, meta_horas: 36.0, porcentaje: 0, estado: "en_riesgo" },
          { mes: "Agosto 2026", horas_realizadas: 0, meta_horas: 36.0, porcentaje: 0, estado: "en_riesgo" },
        ],
        tiene_usuario: false,
        usuario_id: null,
      });

      set_lista_becarios([nuevo, ...lista_becarios]);
      set_nuevo_nombre("");
      set_nuevo_ci("");
      set_nuevo_complemento("");
      set_nuevo_expedicion("LP");
      set_nueva_carrera("");
      set_nueva_iglesia("");
      set_nuevo_carnet_nombre("");
      set_nuevo_carnet_url("");
      set_nuevo_carnet_tamano("");
      set_nuevo_kardex_nombre("");
      set_nuevo_kardex_url("");
      set_nuevo_kardex_tamano("");
      set_modal_abierto(false);

      toast.success(`Becario ${nuevo.nombre} pre-registrado exitosamente en nómina.`, {
        description: `El C.I. ${nuevo.ci} ${nuevo.expedicion} ha sido habilitado para el becario.`,
      });
    } catch (err: any) {
      toast.error(`Error al registrar becario: ${err?.message || "Ocurrió un error inesperado"}`);
    } finally {
      set_guardando_becario(false);
    }
  };

  const abrirModalEditarBecario = (becario: BecarioVista) => {
    if (!es_admin) {
      toast.error("Acción restringida: Solo el Administrador puede editar datos de becarios.");
      return;
    }
    set_becario_a_editar(becario);
    set_edit_nombre(becario.nombre || "");

    const partes_ci = (becario.ci || "").split("-");
    set_edit_ci(partes_ci[0] || "");
    set_edit_complemento(partes_ci[1] || becario.complemento || "");

    const exp_normalizada = (becario.expedicion || "LP").trim().toUpperCase();
    const existe_exp = TERMINACIONES_CI_BOLIVIA.some((t) => t.codigo === exp_normalizada);
    set_edit_expedicion(existe_exp ? exp_normalizada : "LP");

    set_edit_carrera(becario.carrera || "");
    set_edit_universidad(becario.universidad || "UMSA");
    set_edit_correo(becario.correo || "");
    set_edit_celular(becario.celular || "");
    set_edit_sexo((becario.sexo as "M" | "F") || "F");
    set_edit_estado_civil(becario.estado_civil || "Soltero(a)");
    set_edit_fecha_nacimiento(becario.fecha_nacimiento || "2003-01-01");
    set_edit_direccion(becario.direccion || "");
    set_edit_ciudad(becario.ciudad || "La Paz");
    set_edit_iglesia(typeof becario.iglesia === "string" ? becario.iglesia : (becario.iglesia as any)?.nombre || "");
    set_edit_sede(typeof becario.lugar_practica === "string" ? becario.lugar_practica : (becario.lugar_practica as any)?.nombre || "Oficina Central Bloque A");
    set_edit_supervisor(becario.tutor_nombre || SUPERVISORES_INSTITUCIONALES[0].nombre);
    set_edit_estado(becario.estado === "activo" ? "activo" : "pendiente_validacion");
    set_edit_ceti(becario.ceti ?? 1);
    set_edit_horas_meta_mes(becario.horas_meta_mes ?? 36);
    set_edit_carnet_nombre(becario.nombre_archivo_carnet || "");
    set_edit_carnet_url(becario.url_carnet || "");
    set_edit_kardex_nombre(becario.nombre_archivo_kardex || "");
    set_edit_kardex_url(becario.url_kardex || "");
    set_modal_editar_abierto(true);
  };

  const guardarEdicionBecario = async () => {
    if (!becario_a_editar) return;
    if (!es_admin) {
      toast.error("Acción restringida: Solo el Administrador puede editar datos.");
      return;
    }
    if (!edit_nombre.trim()) {
      toast.error("El nombre completo es obligatorio.");
      return;
    }
    if (!edit_ci.trim()) {
      toast.error("El número de carnet de identidad (C.I.) es obligatorio.");
      return;
    }

    set_guardando_edicion(true);
    try {
      const ci_formateado = edit_complemento.trim()
        ? `${edit_ci.trim()}-${edit_complemento.trim().toUpperCase()}`
        : edit_ci.trim();

      const supervisor_encontrado = SUPERVISORES_INSTITUCIONALES.find(
        (s) => s.nombre === edit_supervisor
      ) || SUPERVISORES_INSTITUCIONALES[0];

      // Intentar actualizar vía API remota
      try {
        await clienteApi.put(`/api/becarios/${becario_a_editar.id}`, {
          nombre: edit_nombre.trim(),
          ci: ci_formateado,
          lugar_expedicion: edit_expedicion,
          carrera: edit_carrera.trim(),
          universidad: edit_universidad,
          institucion: "Fundación Diaconía FRIF-IFD",
          celular: edit_celular.trim(),
          estado_civil: edit_estado_civil,
          sexo: edit_sexo,
          fecha_nacimiento: edit_fecha_nacimiento,
          direccion: edit_direccion.trim(),
          ciudad: edit_ciudad.trim(),
          ceti: edit_ceti,
          url_carnet: edit_carnet_url || becario_a_editar.url_carnet || undefined,
          url_kardex: edit_kardex_url || becario_a_editar.url_kardex || undefined,
        });
      } catch (err_api) {
        console.warn("Actualización remota en backend falló o sin conexión, aplicando optimista local:", err_api);
      }

      // Actualizar registro en lista local
      const becario_actualizado: BecarioVista = {
        ...becario_a_editar,
        nombre: edit_nombre.trim(),
        ci: ci_formateado,
        expedicion: edit_expedicion,
        complemento: edit_complemento.trim() || undefined,
        carrera: edit_carrera.trim(),
        universidad: edit_universidad,
        correo: edit_correo.trim() || becario_a_editar.correo,
        celular: edit_celular.trim(),
        sexo: edit_sexo,
        estado_civil: edit_estado_civil,
        fecha_nacimiento: edit_fecha_nacimiento,
        direccion: edit_direccion.trim(),
        ciudad: edit_ciudad.trim(),
        iglesia: edit_iglesia.trim() || becario_a_editar.iglesia,
        lugar_practica: edit_sede,
        tutor_nombre: supervisor_encontrado.nombre,
        tutor_correo: supervisor_encontrado.correo,
        estado: edit_estado,
        ceti: edit_ceti,
        horas_meta_mes: edit_horas_meta_mes,
        url_carnet: edit_carnet_url || becario_a_editar.url_carnet,
        nombre_archivo_carnet: edit_carnet_nombre || becario_a_editar.nombre_archivo_carnet,
        url_kardex: edit_kardex_url || becario_a_editar.url_kardex,
        nombre_archivo_kardex: edit_kardex_nombre || becario_a_editar.nombre_archivo_kardex,
      };

      set_lista_becarios((prev) =>
        prev.map((b) => (b.id === becario_a_editar.id ? becario_actualizado : b))
      );

      if (becario_ficha_modal && becario_ficha_modal.id === becario_a_editar.id) {
        set_becario_ficha_modal(becario_actualizado);
      }

      toast.success("Expediente actualizado exitosamente", {
        description: `Los datos de ${edit_nombre.trim()} han sido actualizados y estandarizados.`,
      });
      set_modal_editar_abierto(false);
      set_becario_a_editar(null);
    } catch {
      toast.error("Error al actualizar becario", {
        description: "No se pudieron guardar los cambios en el expediente.",
      });
    } finally {
      set_guardando_edicion(false);
    }
  };

  const abrirModalAsignarSupervisor = (becario: BecarioVista) => {
    if (!es_admin) {
      toast.error("Acción restringida: Solo el Administrador puede asignar supervisores.");
      return;
    }
    set_becario_seleccionado(becario);
    set_supervisor_seleccionado(becario.tutor_nombre);
    set_modal_supervisor_abierto(true);
  };

  const manejarGuardarSupervisor = () => {
    if (!becario_seleccionado) return;

    const supervisor_encontrado = SUPERVISORES_INSTITUCIONALES.find(
      (s) => s.nombre === supervisor_seleccionado
    ) || SUPERVISORES_INSTITUCIONALES[0];

    set_lista_becarios((prev) =>
      prev.map((b) =>
        b.id === becario_seleccionado.id
          ? {
              ...b,
              tutor_nombre: supervisor_encontrado.nombre,
              tutor_correo: supervisor_encontrado.correo,
            }
          : b
      )
    );

    toast.success(
      `Supervisor ${supervisor_encontrado.nombre} asignado a ${becario_seleccionado.nombre}`
    );
    set_modal_supervisor_abierto(false);
    set_becario_seleccionado(null);
  };

  const abrirModalConfigurarPasajes = (becario: BecarioVista) => {
    if (!es_admin) {
      toast.error("Acción restringida: Solo el Administrador puede configurar modalidades de pasaje.");
      return;
    }
    set_becario_pasajes(becario);
    const mod = (becario as any).modalidad_pasajes || "ida_y_vuelta";
    const cfg = (becario as any).configuracion_pasajes_actividades || {};
    set_modalidad_pasajes_gral(mod);
    set_pasajes_practicas(cfg.practicas || mod);
    set_pasajes_escuela(cfg.escuela_lideres || mod);
    set_pasajes_servicio(cfg.acciones_servicio || mod);
    set_modal_pasajes_abierto(true);
  };

  const guardarConfiguracionPasajes = async () => {
    if (!becario_pasajes) return;
    set_guardando_config_pasajes(true);
    try {
      await clienteApi.patch(`/becarios/${becario_pasajes.id}/configuracion-pasajes`, {
        modalidad_pasajes: modalidad_pasajes_gral,
        configuracion_pasajes_actividades: {
          practicas: pasajes_practicas,
          escuela_lideres: pasajes_escuela,
          acciones_servicio: pasajes_servicio,
        },
      });

      set_lista_becarios((prev) =>
        prev.map((b) =>
          b.id === becario_pasajes.id
            ? ({
                ...b,
                modalidad_pasajes: modalidad_pasajes_gral,
                configuracion_pasajes_actividades: {
                  practicas: pasajes_practicas,
                  escuela_lideres: pasajes_escuela,
                  acciones_servicio: pasajes_servicio,
                },
              } as any)
            : b
        )
      );

      toast.success(`Modalidad de pasajes actualizada para ${becario_pasajes.nombre}`, {
        description: `Configuración: ${modalidad_pasajes_gral === "solo_ida" ? "Solo Ida" : "Ida y Vuelta"} guardada.`,
      });
      set_modal_pasajes_abierto(false);
      set_becario_pasajes(null);
    } catch {
      toast.error("Error al actualizar configuración de pasajes");
    } finally {
      set_guardando_config_pasajes(false);
    }
  };

  const manejarValidarBecario = (id: number) => {
    if (!es_admin) {
      toast.error("Solo el Administrador puede validar el estado del becario.");
      return;
    }
    set_lista_becarios((prev) =>
      prev.map((b) => (b.id === id ? { ...b, estado: "activo" } : b))
    );
    toast.success("Expediente del becario validado y marcado como Activo.");
  };

  return (
    <Card className="border-[#E5E7EB] shadow-sm bg-white rounded-xl">
      <Tabs
        value={pestaña_activa}
        onValueChange={(val) => set_pestaña_activa(val as any)}
        className="w-full"
      >
        <CardHeader className="pb-4 border-b border-[#E5E7EB]/60 space-y-4">
          {/* Fila 1: Título y descripción limpia + Badges institucionales */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl font-bold font-display text-[#035683]">
                {es_supervisor
                  ? "Becarios Asignados a mi Supervisión"
                  : "Gestión de Becarios y Gobernanza de Expedientes"}
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs sm:text-sm">
                {es_supervisor
                  ? `Listado exclusivo de los becarios asignados bajo la tutoría y acompañamiento de ${usuario?.nombre || "su usuario"}.`
                  : "Directorio oficial de estudiantes beneficiarios del programa BUMAND - Diaconía FRIF-IFD."}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-center">
              <Badge variant="outline" className="h-7 px-2.5 border-[#E5E7EB] text-[#035683] font-mono text-xs font-bold">
                Total: {lista_para_rol.length} {es_supervisor ? "asignados" : "becarios"}
              </Badge>
              {verificacion_mensual_activa && (
                <Badge className="h-7 px-2.5 bg-amber-500 text-white font-mono text-[11px] font-bold flex items-center gap-1 animate-pulse">
                  <Clock className="w-3 h-3" /> Verificación en Curso
                </Badge>
              )}
            </div>
          </div>

          {/* Fila 2: TABS SUPERIORES (ARRIBA DE LA BÚSQUEDA - Ahorra espacio vertical) */}
          <TabsList className="w-full grid grid-cols-2 lg:grid-cols-4 p-1.5 bg-slate-100/90 border border-[#E5E7EB] rounded-2xl shadow-xs gap-2 group-data-horizontal/tabs:h-auto h-auto">
            <TabsTrigger
              value="directorio"
              className="w-full h-10 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer text-[#035683] hover:text-[#035683] hover:bg-white/90 data-active:bg-[#035683] data-active:text-white data-active:hover:bg-[#035683] data-active:hover:text-white data-active:shadow-xs flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4 text-[#00ABBD]" />
              <span>{es_supervisor ? "Mis Becarios" : "Directorio General"}</span>
              <span className="bg-slate-200 text-[#035683] text-[10px] px-2 py-0.5 rounded-md font-mono font-bold">
                {lista_para_rol.length}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="horas"
              className="w-full h-10 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer text-[#035683] hover:text-[#035683] hover:bg-white/90 data-active:bg-[#035683] data-active:text-white data-active:hover:bg-[#035683] data-active:hover:text-white data-active:shadow-xs flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4 text-[#00ABBD]" />
              <span>Control de Horas</span>
              {becarios_en_riesgo.length > 0 ? (
                <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-md font-mono font-bold">
                  {becarios_en_riesgo.length} en riesgo
                </span>
              ) : (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-md font-mono font-bold">
                  Al día
                </span>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="sedes"
              className="w-full h-10 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer text-[#035683] hover:text-[#035683] hover:bg-white/90 data-active:bg-[#035683] data-active:text-white data-active:hover:bg-[#035683] data-active:hover:text-white data-active:shadow-xs flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4 text-[#00ABBD]" />
              <span>Asignación & Sedes</span>
              <span className="bg-[#00ABBD]/15 text-[#00808E] text-[10px] px-2 py-0.5 rounded-md font-mono font-bold">
                {sedes_unicas.length} sedes
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="validaciones"
              className="w-full h-10 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer text-[#035683] hover:text-[#035683] hover:bg-white/90 data-active:bg-[#035683] data-active:text-white data-active:hover:bg-[#035683] data-active:hover:text-white data-active:shadow-xs flex items-center justify-center gap-2"
            >
              <FileCheck className="w-4 h-4 text-[#00ABBD]" />
              <span>Validaciones</span>
              {becarios_pendientes.length > 0 ? (
                <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-md font-mono font-bold animate-pulse">
                  {becarios_pendientes.length} pendientes
                </span>
              ) : (
                <span className="bg-slate-200 text-[#035683] text-[10px] px-2 py-0.5 rounded-md font-mono font-bold">
                  0
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Fila 3: TOOLBAR UNIFICADO - BÚSQUEDA + BOTONES CONTEXTUALES DE CADA PESTAÑA */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            {/* Buscador reactivo a la izquierda */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder={
                  pestaña_activa === "horas"
                    ? "Filtrar por becario o carrera para revisar horas..."
                    : pestaña_activa === "sedes"
                    ? "Filtrar por sede, becario o tutor asignado..."
                    : pestaña_activa === "validaciones"
                    ? "Buscar expedientes pendientes de ratificación..."
                    : es_supervisor
                    ? "Buscar entre mis becarios por nombre, CI o carrera..."
                    : "Buscar por nombre, CI, universidad o carrera..."
                }
                value={busqueda}
                onChange={(e) => set_busqueda(e.target.value)}
                className="h-10 pl-9 border-[#E5E7EB] focus-visible:ring-[#00ABBD]"
              />
            </div>

            {/* Acciones contextuales a la derecha según la pestaña activa */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {pestaña_activa === "directorio" && es_admin && (
                <Button
                  onClick={() => {
                    set_nuevo_estado("activo");
                    set_modal_abierto(true);
                  }}
                  className="h-10 px-4 bg-[#00ABBD] hover:bg-[#00ABBD]/90 text-[#035683] font-bold rounded-xl flex items-center gap-2 shadow-sm text-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Becario</span>
                </Button>
              )}

              {pestaña_activa === "horas" && (
                <Badge variant="outline" className="h-10 px-3 bg-slate-50 border-[#E5E7EB] text-[#035683] text-xs font-semibold flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#00ABBD]" />
                  <span>Meta Reglamentaria: 36.0 hrs / mes (9.0 hrs / sem flexibles)</span>
                </Badge>
              )}

              {pestaña_activa === "sedes" && (
                <Badge variant="outline" className="h-10 px-3 bg-slate-50 border-[#E5E7EB] text-[#035683] text-xs font-semibold flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#00ABBD]" />
                  <span>{sedes_unicas.length} Sedes Operativas</span>
                </Badge>
              )}

              {pestaña_activa === "validaciones" && (
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="h-10 px-3.5 bg-emerald-50 border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 rounded-xl shadow-2xs"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                    <span>Ciclo Mensual Automático Activo</span>
                  </Badge>
                  {es_admin && (
                    <Button
                      onClick={() => {
                        set_nuevo_estado("pendiente_validacion");
                        set_modal_abierto(true);
                      }}
                      className="h-10 px-3.5 bg-[#FFB600] hover:bg-[#FFB600]/90 text-[#035683] font-bold rounded-xl flex items-center gap-1.5 text-xs shadow-sm cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Registrar Pendiente</span>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-5">
          {/* TAB 1: DIRECTORIO GENERAL (COMPACTA, CERO SCROLL HORIZONTAL) */}
          <TabsContent value="directorio" className="space-y-4">
            <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden bg-white shadow-2xs">
              <Table>
                <TableHeader className="bg-slate-50/80 border-b border-[#E5E7EB]">
                  <TableRow>
                    <TableHead className="w-[280px] font-bold text-[#035683]">Becario & Documento</TableHead>
                    <TableHead className="font-bold text-[#035683]">Carrera / Universidad</TableHead>
                    <TableHead className="font-bold text-[#035683]">Sede Asignada</TableHead>
                    <TableHead className="w-[130px] font-bold text-[#035683] text-center">Estado</TableHead>
                    <TableHead className="w-[190px] font-bold text-[#035683] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {becarios_filtrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground text-xs">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Users className="w-8 h-8 text-slate-300" />
                          <p className="font-semibold text-slate-600">
                            {es_supervisor
                              ? "No tiene becarios asignados o ninguno coincide con la búsqueda."
                              : "No se encontraron becarios que coincidan con la búsqueda."}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {es_supervisor
                              ? "La administración central asigna los estudiantes a su supervisión institucional."
                              : "Verifique los términos de búsqueda o registre un nuevo becario."}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    becarios_filtrados.map((b) => (
                      <TableRow key={b.id} className="border-b border-[#E5E7EB]/40 hover:bg-[#00ABBD]/5 transition-colors">
                        <TableCell className="font-medium text-[#1E293B]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#035683]/10 text-[#035683] flex items-center justify-center font-bold text-xs shrink-0">
                              {(b.nombre || "B").charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-xs text-[#1E293B] truncate max-w-[200px]" title={b.nombre}>
                                {b.nombre || "Becario"}
                              </p>
                              <span className="font-mono text-[11px] font-semibold text-muted-foreground block">
                                CI: {b.ci || "-"} {b.expedicion || ""}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <p className="font-semibold text-[#1E293B] truncate max-w-[210px]" title={b.carrera}>
                              {b.carrera || "-"}
                            </p>
                            <p className="text-muted-foreground text-[11px] truncate max-w-[210px]" title={b.universidad}>
                              {b.universidad || "-"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-[#035683] font-semibold">
                            <Building2 className="w-3.5 h-3.5 text-[#00ABBD] shrink-0" />
                            <span className="truncate max-w-[190px]">
                              {typeof b.lugar_practica === "string" ? b.lugar_practica : (b.lugar_practica as any)?.nombre || "Oficina Central"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {b.tiene_usuario === false ? (
                            <Badge
                              variant="outline"
                              className="bg-sky-50 text-sky-700 border-sky-300 text-[10px] font-bold"
                              title="Pre-registrado en nómina. Pendiente de auto-registro en App Móvil con su C.I."
                            >
                              <Smartphone className="w-3 h-3 mr-1 text-sky-600" />
                              PENDIENTE APP
                            </Badge>
                          ) : b.estado === "activo" ? (
                            <Badge
                              variant="outline"
                              className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px] font-bold"
                            >
                              <UserCheck className="w-3 h-3 mr-1" />
                              ACTIVO
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-amber-50 text-amber-700 border-amber-300 text-[10px] font-bold"
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              PENDIENTE
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => set_becario_ficha_modal(b)}
                              className="h-8 px-2.5 text-xs font-bold border-[#035683]/30 text-[#035683] hover:bg-[#035683]/10 rounded-lg flex items-center gap-1 cursor-pointer"
                              title="Visualizar Datos Completos del Expediente"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#035683]" />
                              <span>Ficha</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => set_becario_horas_modal(b)}
                              className="h-8 px-2 text-xs font-bold border-[#00ABBD]/50 text-[#035683] hover:bg-[#00ABBD]/10 rounded-lg flex items-center gap-1 cursor-pointer"
                              title="Ver Historial de Horas por Mes"
                            >
                              <Clock className="w-3.5 h-3.5 text-[#00ABBD]" />
                            </Button>
                            {es_admin && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => abrirModalEditarBecario(b)}
                                className="h-8 w-8 p-0 text-[#035683] hover:text-[#00ABBD] hover:bg-slate-100 rounded-lg cursor-pointer"
                                title="Editar datos del becario"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            {es_admin && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => abrirModalAsignarSupervisor(b)}
                                className="h-8 w-8 p-0 text-[#035683] hover:bg-slate-100 rounded-lg cursor-pointer"
                                title="Asignar Supervisor Institucional"
                              >
                                <UserCog className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            {es_admin && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => abrirModalConfigurarPasajes(b)}
                                className="h-8 w-8 p-0 text-[#007BBE] hover:text-[#035683] hover:bg-sky-50 rounded-lg cursor-pointer"
                                title="Configurar modalidad de pasajes (Solo Ida / Ida y Vuelta)"
                              >
                                <Bus className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            {es_admin && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  confirmarEliminacionRegistro({
                                    titulo: "¿Eliminar registro de becario?",
                                    descripcion: `¿Está seguro de eliminar el registro institucional de ${b.nombre} (CI: ${b.ci})? Esta acción revocará todos sus accesos al programa.`,
                                    nombre_item: b.nombre,
                                    onConfirmar: () => {
                                      set_lista_becarios((prev) =>
                                        prev.filter((item) => item.id !== b.id)
                                      );
                                    },
                                    mensaje_exito: `Expediente de ${b.nombre} eliminado exitosamente`,
                                  });
                                }}
                                className="h-8 w-8 p-0 text-[#E2694B] hover:text-[#c9573b] hover:bg-rose-50 rounded-lg cursor-pointer"
                                title="Eliminar registro"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* TAB 2: CONTROL DE HORAS & METAS */}
          <TabsContent value="horas" className="space-y-4">
            <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden bg-white shadow-2xs">
              <Table>
                <TableHeader className="bg-slate-50/80 border-b border-[#E5E7EB]">
                  <TableRow>
                    <TableHead className="w-[280px] font-bold text-[#035683]">Becario & Documento</TableHead>
                    <TableHead className="font-bold text-[#035683]">Sede Asignada</TableHead>
                    <TableHead className="w-[240px] font-bold text-[#035683]">Horas del Mes & Cumplimiento</TableHead>
                    <TableHead className="font-bold text-[#035683]">Supervisor Asignado</TableHead>
                    <TableHead className="w-[180px] font-bold text-[#035683] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {becarios_filtrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground text-xs">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Clock className="w-8 h-8 text-slate-300" />
                          <p className="font-semibold text-slate-600">
                            {es_supervisor
                              ? "No se encontraron horas de becarios asignados a su supervisión."
                              : "No se encontraron registros de horas para becarios."}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    becarios_filtrados.map((b) => (
                      <TableRow key={b.id} className="border-b border-[#E5E7EB]/40 hover:bg-[#00ABBD]/5 transition-colors">
                        <TableCell className="font-medium text-[#1E293B]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#035683]/10 text-[#035683] flex items-center justify-center font-bold text-xs shrink-0">
                              {(b.nombre || "B").charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-xs text-[#1E293B] truncate max-w-[200px]" title={b.nombre}>
                                {b.nombre || "Becario"}
                              </p>
                              <span className="font-mono text-[11px] font-semibold text-muted-foreground block">
                                CI: {b.ci || "-"}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-[#035683] font-semibold">
                            <Building2 className="w-3.5 h-3.5 text-[#00ABBD] shrink-0" />
                            <span className="truncate max-w-[190px]">
                              {typeof b.lugar_practica === "string" ? b.lugar_practica : (b.lugar_practica as any)?.nombre || "Oficina Central"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1.5 min-w-[160px]">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-[#035683]">
                                {(b.horas_mes_actual ?? 0).toFixed(1)} / {(b.horas_meta_mes ?? 36).toFixed(1)} hrs
                              </span>
                              <span className="text-[11px] font-semibold text-muted-foreground">
                                {(b.horas_meta_mes ?? 0) > 0 ? Math.round(((b.horas_mes_actual ?? 0) / (b.horas_meta_mes || 36)) * 100) : 0}%
                              </span>
                            </div>
                            <Progress
                              value={Math.min(100, (b.horas_meta_mes ?? 0) > 0 ? Math.round(((b.horas_mes_actual ?? 0) / (b.horas_meta_mes || 36)) * 100) : 0)}
                              className="h-1.5 bg-slate-100"
                            />
                            <div>
                              {(b.horas_mes_actual ?? 0) > (b.horas_meta_mes ?? 36) ? (
                                <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  Meta Superada (+{((b.horas_mes_actual ?? 0) - (b.horas_meta_mes ?? 36)).toFixed(1)} hrs)
                                </span>
                              ) : (b.horas_mes_actual ?? 0) === (b.horas_meta_mes ?? 36) ? (
                                <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  Meta Cumplida
                                </span>
                              ) : (b.horas_mes_actual ?? 0) >= 27 ? (
                                <span className="inline-flex items-center text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                  En Progreso
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                  En Riesgo (&lt;27 hrs)
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <p className="font-semibold text-[#1E293B]">{b.tutor_nombre || "Sin Asignar"}</p>
                            <p className="text-muted-foreground text-[11px] font-mono flex items-center gap-1">
                              <Mail className="w-3 h-3 text-[#00ABBD]" />
                              {b.tutor_correo || ""}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => set_becario_horas_modal(b)}
                              className="h-8 px-2.5 text-xs font-bold border-[#00ABBD]/50 text-[#035683] hover:bg-[#00ABBD]/10 rounded-lg flex items-center gap-1 cursor-pointer"
                              title="Ver Historial Completo de Horas"
                            >
                              <Clock className="w-3.5 h-3.5 text-[#00ABBD]" />
                              <span>Horas</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => set_becario_ficha_modal(b)}
                              className="h-8 w-8 p-0 text-[#035683] hover:bg-slate-100 rounded-lg cursor-pointer"
                              title="Ver Ficha"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* TAB 3: ASIGNACIÓN INSTITUCIONAL & SEDES */}
          <TabsContent value="sedes" className="space-y-4">
            <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden bg-white shadow-2xs">
              <Table>
                <TableHeader className="bg-slate-50/80 border-b border-[#E5E7EB]">
                  <TableRow>
                    <TableHead className="w-[280px] font-bold text-[#035683]">Becario & Documento</TableHead>
                    <TableHead className="font-bold text-[#035683]">Sede de Prácticas</TableHead>
                    <TableHead className="font-bold text-[#035683]">Supervisor Institucional</TableHead>
                    <TableHead className="font-bold text-[#035683]">Iglesia de Procedencia</TableHead>
                    <TableHead className="w-[180px] font-bold text-[#035683] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {becarios_filtrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground text-xs">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Building2 className="w-8 h-8 text-slate-300" />
                          <p className="font-semibold text-slate-600">
                            {es_supervisor
                              ? "No se encontraron sedes vinculadas a sus becarios supervisados."
                              : "No se encontraron asignaciones de sedes."}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    becarios_filtrados.map((b) => (
                      <TableRow key={b.id} className="border-b border-[#E5E7EB]/40 hover:bg-[#00ABBD]/5 transition-colors">
                        <TableCell className="font-medium text-[#1E293B]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#035683]/10 text-[#035683] flex items-center justify-center font-bold text-xs shrink-0">
                              {(b.nombre || "B").charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-xs text-[#1E293B] truncate max-w-[200px]" title={b.nombre}>
                                {b.nombre || "Becario"}
                              </p>
                              <span className="font-mono text-[11px] font-semibold text-muted-foreground block">
                                CI: {b.ci || "-"}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-[#035683] font-semibold">
                            <Building2 className="w-3.5 h-3.5 text-[#00ABBD] shrink-0" />
                            <span className="truncate max-w-[210px]">
                              {typeof b.lugar_practica === "string" ? b.lugar_practica : (b.lugar_practica as any)?.nombre || "Oficina Central Bloque A"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <p className="font-semibold text-[#1E293B]">{b.tutor_nombre || "Sin Asignar"}</p>
                            <p className="text-muted-foreground text-[11px] font-mono flex items-center gap-1">
                              <Mail className="w-3 h-3 text-[#00ABBD]" />
                              {b.tutor_correo || "Sin correo registrado"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Church className="w-3.5 h-3.5 text-[#035683] shrink-0" />
                            <span className="truncate max-w-[200px]">
                              {typeof b.iglesia === "string" ? b.iglesia : (b.iglesia as any)?.nombre || "Iglesia Institucional"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {es_admin && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => abrirModalEditarBecario(b)}
                                className="h-8 px-2.5 text-xs font-bold border-[#00ABBD]/40 text-[#035683] hover:bg-[#00ABBD]/10 rounded-lg flex items-center gap-1 cursor-pointer"
                                title="Editar expediente de práctica"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-[#00ABBD]" />
                                <span className="hidden sm:inline">Editar</span>
                              </Button>
                            )}
                            {es_admin && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => abrirModalAsignarSupervisor(b)}
                                className="h-8 px-2.5 text-xs font-bold border-[#035683]/30 text-[#035683] hover:bg-[#035683]/10 rounded-lg flex items-center gap-1 cursor-pointer"
                                title="Reasignar o Cambiar Tutor"
                              >
                                <UserCog className="w-3.5 h-3.5" />
                                <span>Supervisor</span>
                              </Button>
                            )}
                            {es_admin && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => abrirModalConfigurarPasajes(b)}
                                className="h-8 px-2.5 text-xs font-bold border-[#007BBE]/40 text-[#007BBE] hover:bg-sky-50 rounded-lg flex items-center gap-1 cursor-pointer"
                                title="Configurar modalidad de pasajes (Solo Ida / Ida y Vuelta)"
                              >
                                <Bus className="w-3.5 h-3.5" />
                                <span>Pasajes</span>
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => set_becario_ficha_modal(b)}
                              className="h-8 w-8 p-0 text-[#035683] hover:bg-slate-100 rounded-lg cursor-pointer"
                              title="Ver Ficha"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* TAB 4: GOBERNANZA & BANDEJA DE VALIDACIONES */}
          <TabsContent value="validaciones" className="space-y-4">
            <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden bg-white shadow-2xs">
              <Table>
                <TableHeader className="bg-slate-50/80 border-b border-[#E5E7EB]">
                  <TableRow>
                    <TableHead className="w-[280px] font-bold text-[#035683]">Becario & Documento</TableHead>
                    <TableHead className="font-bold text-[#035683]">Carrera / Universidad</TableHead>
                    <TableHead className="w-[160px] font-bold text-[#035683] text-center">Estado Documental</TableHead>
                    <TableHead className="w-[220px] font-bold text-[#035683] text-right">Acciones Prioritarias</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {becarios_filtrados.filter((b) => b.estado === "pendiente_validacion").length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-muted-foreground text-xs">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                          <p className="font-semibold text-emerald-900">
                            No existen expedientes con validación pendiente.
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {es_supervisor
                              ? "Todos sus becarios supervisados cuentan con sus documentos y confirmaciones ratificadas."
                              : "Todos los becarios activos cuentan con sus documentos y confirmaciones ratificadas."}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    becarios_filtrados
                      .filter((b) => b.estado === "pendiente_validacion")
                      .map((b) => (
                        <TableRow key={b.id} className="border-b border-[#E5E7EB]/40 hover:bg-[#00ABBD]/5 transition-colors">
                          <TableCell className="font-medium text-[#1E293B]">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                                {(b.nombre || "B").charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-xs text-[#1E293B] truncate max-w-[200px]" title={b.nombre}>
                                  {b.nombre || "Becario"}
                                </p>
                                <span className="font-mono text-[11px] font-semibold text-muted-foreground block">
                                  CI: {b.ci || "-"}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs">
                              <p className="font-semibold text-[#1E293B] truncate max-w-[220px]" title={b.carrera}>
                                {b.carrera || "-"}
                              </p>
                              <p className="text-muted-foreground text-[11px] truncate max-w-[220px]" title={b.universidad}>
                                {b.universidad || "-"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className="bg-amber-50 text-amber-700 border-amber-300 text-[10px] font-bold animate-pulse"
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              PENDIENTE VALIDACIÓN
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {es_admin && (
                                <Button
                                  size="sm"
                                  onClick={() => manejarValidarBecario(b.id)}
                                  className="h-8 px-3 text-xs font-bold bg-[#007BBE] hover:bg-[#035683] text-white rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer"
                                  title="Validar expediente y marcar como Activo"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Validar</span>
                                </Button>
                              )}
                              {es_admin && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => abrirModalEditarBecario(b)}
                                  className="h-8 px-2.5 text-xs font-bold border-[#00ABBD]/40 text-[#035683] hover:bg-[#00ABBD]/10 rounded-lg flex items-center gap-1 cursor-pointer"
                                  title="Editar y corregir datos"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-[#00ABBD]" />
                                  <span>Editar</span>
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => set_becario_ficha_modal(b)}
                                className="h-8 px-2.5 text-xs font-bold border-[#035683]/30 text-[#035683] hover:bg-[#035683]/10 rounded-lg flex items-center gap-1 cursor-pointer"
                                title="Ver Ficha Completa"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#035683]" />
                                <span>Ficha</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>

      {/* Modal Registrar Nuevo Becario BUMAND (Exclusivo Administrador) */}
      {es_admin && (
        <Dialog
          open={modal_abierto}
          onOpenChange={(ab) => {
            if (!ab) intentarCerrarModalBecario();
            else set_modal_abierto(true);
          }}
        >
          <DialogContent
            showCloseButton={false}
            className="sm:max-w-[680px] max-h-[92vh] flex flex-col p-0 overflow-hidden bg-white rounded-2xl border-[#E5E7EB] shadow-2xl"
          >
            <DialogHeader className="p-6 pb-4 border-b border-[#E5E7EB] shrink-0 bg-white">
              <DialogTitle className="text-lg font-bold text-[#035683]">
                Registrar Nuevo Becario BUMAND
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-1">
                El C.I. registrado en esta nómina servirá como clave de validación para que el estudiante cree su usuario de sistema con rol de becario (cruce de listas).
              </p>
            </DialogHeader>

            <form onSubmit={manejarGuardarBecario} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <DialogBody className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
                <div className="space-y-1">
                  <Label htmlFor="nombre_completo" className="text-xs font-semibold text-[#122029]">
                    Nombre Completo
                  </Label>
                  <Input
                    id="nombre_completo"
                    placeholder="Ej. Juan Pérez Mamani"
                    value={nuevo_nombre}
                    onChange={(e) => set_nuevo_nombre(e.target.value)}
                    required
                    className="h-10 border-[#E5E7EB] focus-visible:ring-[#00ABBD]"
                  />
                </div>

                {/* Identificación Estandarizada Bolivia SEGIP */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="ci_num" className="text-xs font-semibold text-[#122029]">
                      Cédula de Identidad (C.I.) *
                    </Label>
                    <div className="flex items-center gap-1.5">
                      <Input
                        id="ci_num"
                        placeholder="Ej. 8473921"
                        value={nuevo_ci}
                        onChange={(e) => set_nuevo_ci(e.target.value)}
                        required
                        className="h-10 flex-1 border-[#E5E7EB] font-mono text-sm focus-visible:ring-[#00ABBD]"
                      />
                      <div className="w-[110px] shrink-0">
                        <Select
                          value={nuevo_expedicion}
                          onValueChange={(v) => v && set_nuevo_expedicion(v)}
                        >
                          <SelectTrigger className="h-10 border-[#E5E7EB] bg-white font-mono font-bold text-[#035683] px-2 text-xs">
                            <SelectValue placeholder="Exp." />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-[#E5E7EB] max-h-56">
                            {TERMINACIONES_CI_BOLIVIA.map((t) => (
                              <SelectItem
                                key={t.codigo}
                                value={t.codigo}
                                etiqueta={`${t.codigo} (${t.departamento})`}
                              >
                                <span className="font-mono font-bold text-[#035683] w-6 inline-block">{t.codigo}</span>
                                <span className="text-slate-600 text-xs">{t.departamento}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="ci_comp" className="text-xs font-semibold text-[#122029]">
                      Complemento
                    </Label>
                    <Input
                      id="ci_comp"
                      placeholder="Ej. 1A"
                      maxLength={5}
                      value={nuevo_complemento}
                      onChange={(e) => set_nuevo_complemento(e.target.value.toUpperCase())}
                      className="h-10 border-[#E5E7EB] font-mono text-xs uppercase"
                      title="Código alfanumérico SEGIP solo en caso de homonimia"
                    />
                  </div>
                </div>

                {/* Universidad (Fila individual completa) */}
                <div className="space-y-1">
                  <Label htmlFor="univ_sel" className="text-xs font-semibold text-[#122029]">
                    Universidad
                  </Label>
                  <Select
                    value={nueva_universidad}
                    onValueChange={(v) => v && set_nueva_universidad(v)}
                  >
                    <SelectTrigger id="univ_sel" className="h-10 border-[#E5E7EB] w-full">
                      <SelectValue placeholder="Universidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UMSA">UMSA (Universidad Mayor de San Andrés)</SelectItem>
                      <SelectItem value="UPEA">UPEA (Universidad Pública de El Alto)</SelectItem>
                      <SelectItem value="UCB">UCB (Universidad Católica Boliviana)</SelectItem>
                      <SelectItem value="UNIVALLE">UNIVALLE (Universidad del Valle)</SelectItem>
                      <SelectItem value="UNIFRANZ">UNIFRANZ (Universidad Franz Tamayo)</SelectItem>
                      <SelectItem value="EMI">EMI (Escuela Militar de Ingeniería)</SelectItem>
                      <SelectItem value="UTB">UTB (Universidad Tecnológica Boliviana)</SelectItem>
                      <SelectItem value="OTRA">Otra Universidad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Carrera Universitaria (Fila individual completa) */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-[#122029]">
                    Carrera Universitaria *
                  </Label>
                  <Combobox
                    valor={nueva_carrera}
                    alCambiar={set_nueva_carrera}
                    opciones={opciones_carreras_nuevo}
                    buscable
                    permitirPersonalizado
                    placeholder="Seleccionar o escribir carrera..."
                    placeholderBusqueda="Buscar carrera en Bolivia..."
                    textoVacio="No encontrada en el catálogo. Presiona Enter o clic abajo para usar este nombre."
                    iconoPrincipal={GraduationCap}
                    className="w-full"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-[#122029]">
                    Iglesia Congregacional (Diaconía / BUMAND)
                  </Label>
                  <Combobox
                    valor={nueva_iglesia}
                    alCambiar={set_nueva_iglesia}
                    opciones={opciones_iglesias}
                    buscable
                    permitirPersonalizado
                    placeholder="Seleccionar o escribir congregación..."
                    placeholderBusqueda="Buscar congregación Diaconía..."
                    textoVacio="No encontrada en el catálogo. Presiona Enter o clic abajo para usar este nombre."
                    iconoPrincipal={Church}
                    className="w-full"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="lugar_sel" className="text-xs font-semibold text-[#122029]">
                    Sede / Lugar de Práctica Asignado
                  </Label>
                  <Select
                    value={nuevo_lugar}
                    onValueChange={(v) => v && set_nuevo_lugar(v)}
                  >
                    <SelectTrigger className="h-10 border-[#E5E7EB]">
                      <SelectValue placeholder="Seleccionar sede" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Oficina Central Bloque A">Oficina Central Bloque A</SelectItem>
                      <SelectItem value="Oficina Central Bloque B">Oficina Central Bloque B</SelectItem>
                      <SelectItem value="Sucursal Juan Pablo II">Sucursal Juan Pablo II</SelectItem>
                      <SelectItem value="Sucursal Villa Adela">Sucursal Villa Adela</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="estado_inicial_sel" className="text-xs font-semibold text-[#122029]">
                    Estado Inicial del Expediente
                  </Label>
                  <Select
                    value={nuevo_estado}
                    onValueChange={(v) => v && set_nuevo_estado(v as any)}
                  >
                    <SelectTrigger id="estado_inicial_sel" className="h-10 border-[#E5E7EB]">
                      <SelectValue placeholder="Estado inicial" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="pendiente_validacion"
                        etiqueta="Pendiente de Validación"
                      >
                        <div className="flex flex-col py-0.5 text-left">
                          <span className="font-medium text-slate-800">Pendiente de Validación</span>
                          <span className="text-[11px] text-slate-500">Cruce de listas y documentación</span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="activo"
                        etiqueta="Activo"
                      >
                        <div className="flex flex-col py-0.5 text-left">
                          <span className="font-medium text-slate-800">Activo</span>
                          <span className="text-[11px] text-slate-500">Expediente aprobado e incorporado de inmediato</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {nuevo_estado === "pendiente_validacion"
                      ? "El becario se registrará con alerta en la pestaña 'Validaciones' hasta ratificar sus documentos."
                      : "El becario se incorporará directamente como activo en el Directorio General."}
                  </p>
                </div>

                {/* Carga de Documentación Oficial (Carnet y Kárdex) */}
                <div className="space-y-3 pt-2 border-t border-[#E5E7EB]">
                  <Label className="text-xs font-bold text-[#035683] uppercase tracking-wider block">
                    Documentación Oficial de Respaldo (Carnet y Kárdex)
                  </Label>

                  {/* 1. Carnet de Identidad */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-[#122029]">
                        1. Cédula de Identidad (Carnet - Anverso / Reverso)
                      </Label>
                      {nuevo_carnet_tamano && (
                        <Badge variant="outline" className="text-[10px] font-mono border-emerald-300 text-emerald-700 bg-emerald-50">
                          {nuevo_carnet_tamano}
                        </Badge>
                      )}
                    </div>
                    <div className="relative border-2 border-dashed border-[#E5E7EB] hover:border-[#00ABBD] rounded-xl p-2.5 bg-slate-50 text-center transition-colors">
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        onChange={manejarSubirCarnetNuevo}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      />
                      {nuevo_carnet_nombre ? (
                        <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                          <div className="flex items-center gap-1.5 truncate max-w-[360px]">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="truncate">{nuevo_carnet_nombre}</span>
                          </div>
                          <Badge variant="outline" className="text-[10px] border-emerald-300">C.I. Adjunto</Badge>
                        </div>
                      ) : (
                        <div className="py-0.5 text-muted-foreground text-xs flex items-center justify-center gap-2">
                          <Upload className="w-3.5 h-3.5 text-[#00ABBD]" />
                          <span>Adjuntar fotocopia o escaneo de C.I. (PDF / Imagen)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. Kárdex Académico / Matrícula */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-[#122029]">
                        2. Kárdex Académico / Matrícula Universitaria
                      </Label>
                      {nuevo_kardex_tamano && (
                        <Badge variant="outline" className="text-[10px] font-mono border-emerald-300 text-emerald-700 bg-emerald-50">
                          {nuevo_kardex_tamano}
                        </Badge>
                      )}
                    </div>
                    <div className="relative border-2 border-dashed border-[#E5E7EB] hover:border-[#00ABBD] rounded-xl p-2.5 bg-slate-50 text-center transition-colors">
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        onChange={manejarSubirKardexNuevo}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      />
                      {nuevo_kardex_nombre ? (
                        <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                          <div className="flex items-center gap-1.5 truncate max-w-[360px]">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="truncate">{nuevo_kardex_nombre}</span>
                          </div>
                          <Badge variant="outline" className="text-[10px] border-emerald-300">Kárdex Adjunto</Badge>
                        </div>
                      ) : (
                        <div className="py-0.5 text-muted-foreground text-xs flex items-center justify-center gap-2">
                          <Upload className="w-3.5 h-3.5 text-[#00ABBD]" />
                          <span>Adjuntar kárdex de notas o matrícula universitaria (PDF / Imagen)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </DialogBody>

              <DialogFooter className="p-4 px-6 border-t border-[#E5E7EB] bg-[#F8F9FA]/90 shrink-0 mt-auto flex sm:justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={intentarCerrarModalBecario}
                  disabled={guardando_becario}
                  className="h-10 border-[#E5E7EB] rounded-xl hover:bg-slate-100"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={guardando_becario}
                  className="h-10 bg-[#035683] hover:bg-[#035683]/90 text-white font-bold rounded-xl shadow-sm flex items-center gap-2"
                >
                  {guardando_becario ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando en Nómina...</span>
                    </>
                  ) : (
                    <span>Guardar Becario</span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal Historial de Horas Realizadas por Mes */}
      <Dialog open={!!becario_horas_modal} onOpenChange={(open) => !open && set_becario_horas_modal(null)}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-[620px] max-h-[85vh] flex flex-col p-0 overflow-hidden bg-white rounded-2xl border-[#E5E7EB] shadow-2xl"
        >
          <DialogHeader className="p-6 pb-4 border-b border-[#E5E7EB] bg-[#F8F9FA] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#035683]/10 text-[#035683] flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#00ABBD]" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-[#035683]">
                  Historial de Horas Realizadas por Mes
                </DialogTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  {becario_horas_modal?.nombre || "Becario"} · CI: {becario_horas_modal?.ci || "-"} {becario_horas_modal?.expedicion || ""} · {becario_horas_modal?.carrera || "-"}
                </CardDescription>
              </div>
            </div>
          </DialogHeader>

          <DialogBody className="p-6 space-y-5 overflow-y-auto flex-1 min-h-0">
            {becario_horas_modal && (
              <>
                <div className="p-4 rounded-xl bg-[#035683]/5 border border-[#035683]/15 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground">Mes Actual (Octubre 2026)</span>
                    <p className="text-2xl font-bold font-mono text-[#035683]">
                      {(becario_horas_modal.horas_mes_actual ?? 0).toFixed(1)}{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        / {(becario_horas_modal.horas_meta_mes ?? 36).toFixed(1)} hrs
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">Avance Global</span>
                    <p className="text-2xl font-bold font-mono text-[#00ABBD]">
                      {(becario_horas_modal.horas_meta_mes ?? 0) > 0
                        ? Math.round(((becario_horas_modal.horas_mes_actual ?? 0) / (becario_horas_modal.horas_meta_mes || 36)) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#035683]">
                    Desglose Mensual Acumulado
                  </h4>
                  <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow className="border-b border-[#E5E7EB]">
                          <TableHead className="text-xs font-bold text-[#035683]">Mes</TableHead>
                          <TableHead className="text-xs font-bold text-[#035683]">Horas</TableHead>
                          <TableHead className="text-xs font-bold text-[#035683]">Meta</TableHead>
                          <TableHead className="text-xs font-bold text-[#035683]">Progreso</TableHead>
                          <TableHead className="text-xs font-bold text-[#035683] text-right">Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {becario_horas_modal.historial_horas_mes?.map((h, i) => (
                          <TableRow key={i} className="border-b border-[#E5E7EB]/40">
                            <TableCell className="text-xs font-bold text-[#1E293B]">
                              {h.mes}
                            </TableCell>
                            <TableCell className="font-mono text-xs font-bold text-[#035683]">
                              {(h.horas_realizadas ?? 0).toFixed(1)} hrs
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {(h.meta_horas ?? 36).toFixed(1)} hrs
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={Math.min(100, h.porcentaje)} className="h-1.5 w-16" />
                                <span className="text-[11px] font-mono font-semibold text-muted-foreground">
                                  {h.porcentaje}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {(h.horas_realizadas ?? 0) > (h.meta_horas ?? 36) ? (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px] font-bold">
                                  Meta Superada (+{((h.horas_realizadas ?? 0) - (h.meta_horas ?? 36)).toFixed(1)} hrs)
                                </Badge>
                              ) : h.estado === "cumplido" ? (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px] font-bold">
                                  Meta Cumplida
                                </Badge>
                              ) : h.estado === "en_progreso" ? (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 text-[10px] font-bold">
                                  En Progreso
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-[10px] font-bold">
                                  En Riesgo
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-[#E5E7EB] rounded-xl text-xs text-muted-foreground flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#00ABBD] shrink-0" />
                  <span>
                    El cumplimiento mínimo reglamentario es de <strong>36.0 horas mensuales (9.0 horas semanales con horario flexible)</strong> de práctica y servicio institucional en BUMAND.
                  </span>
                </div>
              </>
            )}
          </DialogBody>

          <DialogFooter className="p-4 px-6 border-t border-[#E5E7EB] bg-[#F8F9FA] shrink-0 flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => set_becario_horas_modal(null)}
              className="h-9 border-[#E5E7EB] rounded-xl text-xs font-semibold"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Ficha Completa del Becario (23 Estudiantes Oficiales) */}
      <Dialog open={!!becario_ficha_modal} onOpenChange={(open) => !open && set_becario_ficha_modal(null)}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-[760px] max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white rounded-2xl border-[#E5E7EB] shadow-2xl"
        >
          <DialogHeader className="p-6 pb-4 border-b border-[#E5E7EB] bg-[#F8F9FA] shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#035683] text-[#00ABBD] flex items-center justify-center font-bold text-lg shadow-sm">
                  {(becario_ficha_modal?.nombre || "B").charAt(0).toUpperCase()}
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-[#035683]">
                    {becario_ficha_modal?.nombre || "Becario Institucional"}
                  </DialogTitle>
                  <CardDescription className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>C.I.: {becario_ficha_modal?.ci || "-"} {becario_ficha_modal?.expedicion || ""}</span>
                    <span>•</span>
                    <span>{becario_ficha_modal?.carrera || "-"} ({becario_ficha_modal?.universidad || "-"})</span>
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {es_admin && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (!becario_ficha_modal) return;
                      const actual = becario_ficha_modal;
                      set_becario_ficha_modal(null);
                      abrirModalEditarBecario(actual);
                    }}
                    className="h-8 px-2.5 text-xs font-bold border-[#00ABBD]/50 text-[#035683] hover:bg-[#00ABBD]/10 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Editar expediente institucional"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#00ABBD]" />
                    <span>Editar</span>
                  </Button>
                )}
                <Badge
                  variant="outline"
                  className={
                    becario_ficha_modal?.estado === "activo"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300 text-xs font-bold"
                      : "bg-amber-50 text-amber-700 border-amber-300 text-xs font-bold"
                  }
                >
                  {becario_ficha_modal?.estado === "activo" ? "ACTIVO" : "PENDIENTE VALIDACIÓN"}
                </Badge>
              </div>
            </div>
          </DialogHeader>

          <DialogBody className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0">
            {becario_ficha_modal && (
              <>
                {/* Bloque 1: Datos Personales */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#035683] flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#00ABBD]" />
                    Datos Personales y de Identificación
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 border border-[#E5E7EB] rounded-xl text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Cédula de Identidad</span>
                      <p className="font-bold text-[#1E293B] font-mono">
                        {becario_ficha_modal.ci || "-"} {becario_ficha_modal.expedicion || ""}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Sexo</span>
                      <p className="font-semibold text-[#1E293B]">
                        {becario_ficha_modal.sexo === "M" ? "Masculino" : "Femenino"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Estado Civil</span>
                      <p className="font-semibold text-[#1E293B]">{becario_ficha_modal.estado_civil || "Soltero(a)"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Fecha de Nacimiento</span>
                      <p className="font-semibold text-[#1E293B] flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#00ABBD]" />
                        {becario_ficha_modal.fecha_nacimiento || "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Edad Registrada</span>
                      <p className="font-semibold text-[#1E293B]">{becario_ficha_modal.edad ?? 22} años</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Teléfono Celular</span>
                      <p className="font-bold text-[#035683] font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#00ABBD]" />
                        {becario_ficha_modal.celular || "-"}
                      </p>
                    </div>
                    <div className="sm:col-span-3">
                      <span className="text-muted-foreground block text-[11px]">Correo Institucional / Personal</span>
                      <p className="font-bold text-[#035683] font-mono flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#00ABBD]" />
                        {becario_ficha_modal.correo || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bloque 2: Domicilio */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#035683] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#00ABBD]" />
                    Residencia y Domicilio
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 border border-[#E5E7EB] rounded-xl text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Dirección Registrada</span>
                      <p className="font-semibold text-[#1E293B]">{becario_ficha_modal.direccion || "-"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Ciudad / Municipio</span>
                      <p className="font-semibold text-[#1E293B]">{becario_ficha_modal.ciudad || "-"}</p>
                    </div>
                  </div>
                </div>

                {/* Bloque 3: Formación y Pastoral */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#035683] flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#00ABBD]" />
                    Formación Universitaria y Comunidad Eclesiástica
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 border border-[#E5E7EB] rounded-xl text-xs">
                    <div className="sm:col-span-2">
                      <span className="text-muted-foreground block text-[11px]">Universidad</span>
                      <p className="font-semibold text-[#1E293B]">{becario_ficha_modal.universidad || "-"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Nivel CETI</span>
                      <Badge variant="outline" className="mt-0.5 border-[#035683] text-[#035683] font-bold">
                        CETI {becario_ficha_modal.ceti ?? 1}
                      </Badge>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-muted-foreground block text-[11px]">Carrera</span>
                      <p className="font-semibold text-[#1E293B]">{becario_ficha_modal.carrera || "-"}</p>
                    </div>
                    <div className="sm:col-span-3">
                      <span className="text-muted-foreground block text-[11px]">Iglesia de Membresía</span>
                      <p className="font-semibold text-[#1E293B] flex items-center gap-1.5">
                        <Church className="w-3.5 h-3.5 text-[#035683]" />
                        {typeof becario_ficha_modal.iglesia === "string" ? becario_ficha_modal.iglesia : (becario_ficha_modal.iglesia as any)?.nombre || "Iglesia Institucional"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bloque 4: Asignación BUMAND */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#035683] flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#00ABBD]" />
                    Asignación Institucional en BUMAND
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 border border-[#E5E7EB] rounded-xl text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Sede de Prácticas</span>
                      <p className="font-bold text-[#035683]">{typeof becario_ficha_modal.lugar_practica === "string" ? becario_ficha_modal.lugar_practica : (becario_ficha_modal.lugar_practica as any)?.nombre || "Oficina Central Bloque A"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Supervisor Tutor Asignado</span>
                      <p className="font-bold text-[#1E293B]">{becario_ficha_modal.tutor_nombre || "Sin Asignar"}</p>
                      <p className="text-[11px] font-mono text-muted-foreground">{becario_ficha_modal.tutor_correo || ""}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Horas Acumuladas Mes Actual</span>
                      <p className="font-mono font-bold text-[#035683]">
                        {(becario_ficha_modal.horas_mes_actual ?? 0).toFixed(1)} / {(becario_ficha_modal.horas_meta_mes ?? 36).toFixed(1)} hrs
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Porcentaje de Cumplimiento</span>
                      <p className="font-mono font-bold text-emerald-600">
                        {(becario_ficha_modal.horas_meta_mes ?? 0) > 0
                          ? Math.round(((becario_ficha_modal.horas_mes_actual ?? 0) / (becario_ficha_modal.horas_meta_mes || 36)) * 100)
                          : 0}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bloque 5: Expediente Documental y Acreditaciones */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#035683] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#00ABBD]" />
                    Expediente Documental y Acreditaciones (PDF / Imágenes)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 border border-[#E5E7EB] rounded-xl text-xs">
                    {/* Tarjeta Carnet de Identidad */}
                    <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col justify-between shadow-2xs gap-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                            <FileText className="w-4 h-4 text-rose-600" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-xs">Cédula de Identidad</p>
                            <p className="text-[10px] text-muted-foreground font-mono">
                              {becario_ficha_modal.nombre_archivo_carnet || `CI_${becario_ficha_modal.ci}_${becario_ficha_modal.expedicion}.pdf`}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-700 bg-emerald-50 font-bold">
                          Acreditado SEGIP
                        </Badge>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-100">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            set_documento_visor_seleccionado({
                              tipo: "carnet",
                              becario: becario_ficha_modal,
                            });
                          }}
                          className="h-7 px-2.5 text-xs text-[#035683] hover:bg-slate-100 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#00ABBD]" />
                          <span>Ver Carnet</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            toast.success(`Descargando CI_${becario_ficha_modal.ci}_${becario_ficha_modal.expedicion}.pdf`);
                          }}
                          className="h-7 px-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                          title="Descargar copia oficial"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Tarjeta Matrícula / Kárdex */}
                    <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col justify-between shadow-2xs gap-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#00ABBD]/10 text-[#035683] flex items-center justify-center font-bold">
                            <GraduationCap className="w-4 h-4 text-[#00ABBD]" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-xs">Matrícula / Kárdex</p>
                            <p className="text-[10px] text-muted-foreground font-mono">
                              {becario_ficha_modal.nombre_archivo_kardex || `Matricula_2026_${becario_ficha_modal.universidad || "UMSA"}.pdf`}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-700 bg-emerald-50 font-bold">
                          Matrícula Vigente
                        </Badge>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-100">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            set_documento_visor_seleccionado({
                              tipo: "kardex",
                              becario: becario_ficha_modal,
                            });
                          }}
                          className="h-7 px-2.5 text-xs text-[#035683] hover:bg-slate-100 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#00ABBD]" />
                          <span>Ver Kárdex</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            toast.success(`Descargando Matricula_2026_${becario_ficha_modal.universidad || "UMSA"}.pdf`);
                          }}
                          className="h-7 px-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                          title="Descargar copia oficial"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogBody>

          <DialogFooter className="p-4 px-6 border-t border-[#E5E7EB] bg-[#F8F9FA] shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={descargando_pdf_estudiante !== null}
                onClick={() =>
                  becario_ficha_modal &&
                  descargarExpedienteRecorridosEstudiante(becario_ficha_modal.id, becario_ficha_modal.nombre)
                }
                className="h-9 border-[#035683] text-[#035683] hover:bg-[#035683]/10 rounded-xl text-xs font-bold gap-1.5 shadow-2xs"
                title="Exportar expediente mensual de recorridos en PDF con Puppeteer"
              >
                {descargando_pdf_estudiante === 'recorridos_' + (becario_ficha_modal?.id ?? 0) ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00ABBD]" />
                ) : (
                  <Bus className="w-3.5 h-3.5 text-[#00ABBD]" />
                )}
                <span>Expediente Recorridos (PDF)</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={descargando_pdf_estudiante !== null}
                onClick={() =>
                  becario_ficha_modal &&
                  descargarAsistenciaMensualEstudiante(becario_ficha_modal.id, becario_ficha_modal.nombre)
                }
                className="h-9 border-[#035683] text-[#035683] hover:bg-[#035683]/10 rounded-xl text-xs font-bold gap-1.5 shadow-2xs"
                title="Exportar kárdex de asistencia mensual en PDF con Puppeteer"
              >
                {descargando_pdf_estudiante === 'asistencia_' + (becario_ficha_modal?.id ?? 0) ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00ABBD]" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-[#00ABBD]" />
                )}
                <span>Asistencia Mensual (PDF)</span>
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {es_admin && (
                <Button
                  type="button"
                  variant="default"
                  onClick={() => {
                    if (!becario_ficha_modal) return;
                    const actual = becario_ficha_modal;
                    set_becario_ficha_modal(null);
                    abrirModalEditarBecario(actual);
                  }}
                  className="h-9 bg-[#035683] hover:bg-[#024366] text-white rounded-xl text-xs font-bold gap-1.5 shadow-sm cursor-pointer"
                  title="Editar expediente completo del becario"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#00ABBD]" />
                  <span>Editar Expediente</span>
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => set_becario_ficha_modal(null)}
                className="h-9 border-[#E5E7EB] rounded-xl text-xs font-semibold"
              >
                Cerrar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Exclusivo de Administrador: Asignar Supervisor */}
      <Dialog open={modal_supervisor_abierto} onOpenChange={set_modal_supervisor_abierto}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-[440px] p-0 overflow-hidden bg-white rounded-2xl border-[#E5E7EB] shadow-2xl"
        >
          <DialogHeader className="p-6 pb-4 border-b border-[#E5E7EB] bg-[#F8F9FA]">
            <DialogTitle className="text-base font-bold text-[#035683] flex items-center gap-2">
              <UserCog className="w-5 h-5 text-[#00ABBD]" />
              Asignar Supervisor Institucional
            </DialogTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Vincular tutor responsable para seguimiento de prácticas y rúbrica semestral.
            </CardDescription>
          </DialogHeader>

          <DialogBody className="p-6 space-y-4">
            {becario_seleccionado && (
              <div className="p-3 bg-slate-50 border border-[#E5E7EB] rounded-xl text-xs space-y-1">
                <p className="font-bold text-[#035683]">{becario_seleccionado.nombre || "Becario"}</p>
                <p className="text-muted-foreground">
                  CI: {becario_seleccionado.ci || "-"} · {becario_seleccionado.carrera || "-"} ({becario_seleccionado.universidad || "-"})
                </p>
                <p className="text-muted-foreground font-mono text-[11px]">
                  Sede: {typeof becario_seleccionado.lugar_practica === "string" ? becario_seleccionado.lugar_practica : (becario_seleccionado.lugar_practica as any)?.nombre || "Oficina Central Bloque A"}
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="sel-supervisor" className="text-xs font-semibold text-[#122029]">
                Supervisor Responsable
              </Label>
              <Select
                value={supervisor_seleccionado}
                onValueChange={(val) => val && set_supervisor_seleccionado(val)}
              >
                <SelectTrigger id="sel-supervisor" className="h-10 border-[#E5E7EB]">
                  <SelectValue placeholder="Seleccionar supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {SUPERVISORES_INSTITUCIONALES.map((sup) => (
                    <SelectItem
                      key={sup.correo}
                      value={sup.nombre}
                      etiqueta={sup.nombre}
                    >
                      <div className="flex flex-col py-0.5 text-left">
                        <span className="font-medium text-slate-800">{sup.nombre}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{sup.correo}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </DialogBody>

          <DialogFooter className="p-4 px-6 border-t border-[#E5E7EB] bg-[#F8F9FA] flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => set_modal_supervisor_abierto(false)}
              className="h-9 border-[#E5E7EB] rounded-xl text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={manejarGuardarSupervisor}
              className="h-9 bg-[#035683] hover:bg-[#035683]/90 text-white font-bold rounded-xl text-xs shadow-sm"
            >
              Confirmar Asignación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Becario BUMAND (Exclusivo Administrador) */}
      {es_admin && (
        <Dialog
          open={modal_editar_abierto}
          onOpenChange={(ab) => {
            if (!ab) {
              set_modal_editar_abierto(false);
              set_becario_a_editar(null);
            }
          }}
        >
          <DialogContent
            showCloseButton={false}
            className="sm:max-w-[760px] max-h-[92vh] flex flex-col p-0 overflow-hidden bg-white rounded-2xl border-[#E5E7EB] shadow-2xl"
          >
            <DialogHeader className="p-6 pb-4 border-b border-[#E5E7EB] bg-[#F8F9FA] shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#035683] text-[#00ABBD] flex items-center justify-center font-bold text-base shadow-sm">
                    <Edit2 className="w-5 h-5 text-[#00ABBD]" />
                  </div>
                  <div>
                    <DialogTitle className="text-base font-bold text-[#035683]">
                      Editar Expediente de Becario
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Modificación autorizada de datos institucionales, académicos y de identidad (SEGIP)
                    </DialogDescription>
                  </div>
                </div>
                <Badge variant="outline" className="bg-[#035683]/10 text-[#035683] border-[#035683]/30 text-xs font-bold font-mono">
                  ID: #{becario_a_editar?.id}
                </Badge>
              </div>
            </DialogHeader>

            <DialogBody className="p-6 space-y-5 overflow-y-auto flex-1 min-h-0">
              {/* Sección 1: Identificación Oficial (SEGIP Bolivia) */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#035683] flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#00ABBD]" />
                  Identificación Oficial (SEGIP Bolivia)
                </h4>

                <div className="space-y-1">
                  <Label htmlFor="edit_nombre" className="text-xs font-semibold text-[#122029]">
                    Nombre Completo *
                  </Label>
                  <Input
                    id="edit_nombre"
                    value={edit_nombre}
                    onChange={(e) => set_edit_nombre(e.target.value)}
                    required
                    className="h-10 border-[#E5E7EB] focus-visible:ring-[#00ABBD]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="edit_ci" className="text-xs font-semibold text-[#122029]">
                      Cédula de Identidad (C.I.) *
                    </Label>
                    <div className="flex items-center gap-1.5">
                      <Input
                        id="edit_ci"
                        placeholder="Ej. 8473921"
                        value={edit_ci}
                        onChange={(e) => set_edit_ci(e.target.value)}
                        required
                        className="h-10 flex-1 border-[#E5E7EB] font-mono text-sm focus-visible:ring-[#00ABBD]"
                      />
                      <div className="w-[125px] shrink-0">
                        <Select
                          value={edit_expedicion}
                          onValueChange={(v) => v && set_edit_expedicion(v)}
                        >
                          <SelectTrigger className="h-10 border-[#E5E7EB] bg-white font-mono font-bold text-[#035683] px-2 text-xs">
                            <SelectValue placeholder="Exp." />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-[#E5E7EB] max-h-56">
                            {TERMINACIONES_CI_BOLIVIA.map((t) => (
                              <SelectItem
                                key={t.codigo}
                                value={t.codigo}
                                etiqueta={`${t.codigo} (${t.departamento})`}
                              >
                                <span className="font-mono font-bold text-[#035683] w-6 inline-block">{t.codigo}</span>
                                <span className="text-slate-600 text-xs">{t.departamento}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="edit_complemento" className="text-xs font-semibold text-[#122029]">
                      Complemento (SEGIP)
                    </Label>
                    <Input
                      id="edit_complemento"
                      placeholder="Ej. 1A"
                      maxLength={5}
                      value={edit_complemento}
                      onChange={(e) => set_edit_complemento(e.target.value.toUpperCase())}
                      className="h-10 border-[#E5E7EB] font-mono text-xs uppercase"
                      title="Código alfanumérico SEGIP solo en caso de homonimia"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[#122029]">Sexo</Label>
                    <Select
                      value={edit_sexo}
                      onValueChange={(v) => v && set_edit_sexo(v as "M" | "F")}
                    >
                      <SelectTrigger className="h-10 border-[#E5E7EB] bg-white text-xs">
                        <SelectValue placeholder="Sexo" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#E5E7EB]">
                        <SelectItem value="M" etiqueta="Masculino">Masculino</SelectItem>
                        <SelectItem value="F" etiqueta="Femenino">Femenino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[#122029]">Estado Civil</Label>
                    <Select
                      value={edit_estado_civil}
                      onValueChange={(v) => v && set_edit_estado_civil(v)}
                    >
                      <SelectTrigger className="h-10 border-[#E5E7EB] bg-white text-xs">
                        <SelectValue placeholder="Estado Civil" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#E5E7EB]">
                        <SelectItem value="Soltero(a)">Soltero(a)</SelectItem>
                        <SelectItem value="Casado(a)">Casado(a)</SelectItem>
                        <SelectItem value="Divorciado(a)">Divorciado(a)</SelectItem>
                        <SelectItem value="Viudo(a)">Viudo(a)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <Label htmlFor="edit_nac" className="text-xs font-semibold text-[#122029]">
                      Fecha Nacimiento
                    </Label>
                    <SeleccionadorFecha
                      id="edit_nac"
                      valorString={edit_fecha_nacimiento}
                      alCambiarString={(val) => set_edit_fecha_nacimiento(val)}
                      className="h-10 border-[#E5E7EB] text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 2: Contacto y Residencia */}
              <div className="space-y-3 pt-2 border-t border-[#E5E7EB]/60">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#035683] flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#00ABBD]" />
                  Contacto y Residencia
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="edit_celular" className="text-xs font-semibold text-[#122029]">
                      Teléfono Celular
                    </Label>
                    <Input
                      id="edit_celular"
                      placeholder="Ej. 71234567"
                      value={edit_celular}
                      onChange={(e) => set_edit_celular(e.target.value)}
                      className="h-10 border-[#E5E7EB] font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="edit_correo" className="text-xs font-semibold text-[#122029]">
                      Correo Electrónico
                    </Label>
                    <Input
                      id="edit_correo"
                      type="email"
                      placeholder="becario@diaconia.bo"
                      value={edit_correo}
                      onChange={(e) => set_edit_correo(e.target.value)}
                      className="h-10 border-[#E5E7EB] text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="edit_ciudad" className="text-xs font-semibold text-[#122029]">
                      Ciudad / Municipio
                    </Label>
                    <Input
                      id="edit_ciudad"
                      placeholder="Ej. La Paz, El Alto"
                      value={edit_ciudad}
                      onChange={(e) => set_edit_ciudad(e.target.value)}
                      className="h-10 border-[#E5E7EB] text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="edit_direccion" className="text-xs font-semibold text-[#122029]">
                      Dirección / Domicilio
                    </Label>
                    <Input
                      id="edit_direccion"
                      placeholder="Zona, Calle, Número"
                      value={edit_direccion}
                      onChange={(e) => set_edit_direccion(e.target.value)}
                      className="h-10 border-[#E5E7EB] text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 3: Formación Universitaria y Pastoral */}
              <div className="space-y-3 pt-2 border-t border-[#E5E7EB]/60">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#035683] flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#00ABBD]" />
                  Formación Universitaria y Pastoral
                </h4>

                <div className="space-y-3">
                  {/* Universidad (Fila individual completa) */}
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[#122029]">Universidad</Label>
                    <Select
                      value={edit_universidad}
                      onValueChange={(v) => v && set_edit_universidad(v)}
                    >
                      <SelectTrigger className="h-10 border-[#E5E7EB] bg-white text-xs w-full">
                        <SelectValue placeholder="Universidad" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#E5E7EB]">
                        <SelectItem value="UMSA">UMSA (Universidad Mayor de San Andrés)</SelectItem>
                        <SelectItem value="UPEA">UPEA (Universidad Pública de El Alto)</SelectItem>
                        <SelectItem value="UCB">UCB (Universidad Católica Boliviana)</SelectItem>
                        <SelectItem value="UNIVALLE">UNIVALLE (Universidad del Valle)</SelectItem>
                        <SelectItem value="UNIFRANZ">UNIFRANZ (Universidad Franz Tamayo)</SelectItem>
                        <SelectItem value="EMI">EMI (Escuela Militar de Ingeniería)</SelectItem>
                        <SelectItem value="UTB">UTB (Universidad Tecnológica Boliviana)</SelectItem>
                        <SelectItem value="OTRA">Otra Universidad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Carrera Universitaria (Fila individual completa) */}
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[#122029]">
                      Carrera Universitaria *
                    </Label>
                    <Combobox
                      valor={edit_carrera}
                      alCambiar={set_edit_carrera}
                      opciones={opciones_carreras_edicion}
                      buscable
                      permitirPersonalizado
                      placeholder="Seleccionar o escribir carrera..."
                      placeholderBusqueda="Buscar carrera en Bolivia..."
                      textoVacio="No encontrada en el catálogo. Presiona Enter o clic abajo para usar este nombre."
                      iconoPrincipal={GraduationCap}
                      className="w-full"
                    />
                  </div>

                  {/* Iglesia Congregacional (Fila individual completa) */}
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[#122029]">
                      Iglesia Congregacional (Diaconía / BUMAND)
                    </Label>
                    <Combobox
                      valor={edit_iglesia}
                      alCambiar={set_edit_iglesia}
                      opciones={opciones_iglesias}
                      buscable
                      permitirPersonalizado
                      placeholder="Seleccionar o escribir congregación..."
                      placeholderBusqueda="Buscar congregación Diaconía..."
                      textoVacio="No encontrada en el catálogo. Presiona Enter o clic abajo para usar este nombre."
                      iconoPrincipal={Church}
                      className="w-full"
                    />
                  </div>

                  {/* Nivel CETI (Fila individual) */}
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[#122029]">Nivel CETI</Label>
                    <Select
                      value={String(edit_ceti)}
                      onValueChange={(v) => v && set_edit_ceti(Number(v))}
                    >
                      <SelectTrigger className="h-10 border-[#E5E7EB] bg-white text-xs w-full">
                        <SelectValue placeholder="CETI" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#E5E7EB]">
                        <SelectItem value="1">Nivel CETI 1</SelectItem>
                        <SelectItem value="2">Nivel CETI 2</SelectItem>
                        <SelectItem value="3">Nivel CETI 3</SelectItem>
                        <SelectItem value="4">Nivel CETI 4</SelectItem>
                        <SelectItem value="5">Nivel CETI 5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Sección 4: Asignación Institucional en BUMAND */}
              <div className="space-y-3 pt-2 border-t border-[#E5E7EB]/60">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#035683] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#00ABBD]" />
                  Asignación y Estado Institucional
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[#122029]">Sede de Prácticas</Label>
                    <Select
                      value={edit_sede}
                      onValueChange={(v) => v && set_edit_sede(v)}
                    >
                      <SelectTrigger className="h-10 border-[#E5E7EB] bg-white text-xs">
                        <SelectValue placeholder="Sede asignada" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#E5E7EB]">
                        <SelectItem value="Oficina Central Bloque A">Oficina Central Bloque A</SelectItem>
                        <SelectItem value="Centro Infantil Sagrada Familia">Centro Infantil Sagrada Familia</SelectItem>
                        <SelectItem value="Agencia Villa Dolores">Agencia Villa Dolores</SelectItem>
                        <SelectItem value="Consultorio Médico San Lucas">Consultorio Médico San Lucas</SelectItem>
                        <SelectItem value="Hogar de Niños Amor y Esperanza">Hogar de Niños Amor y Esperanza</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[#122029]">Supervisor Tutor Asignado</Label>
                    <Select
                      value={edit_supervisor}
                      onValueChange={(v) => v && set_edit_supervisor(v)}
                    >
                      <SelectTrigger className="h-10 border-[#E5E7EB] bg-white text-xs">
                        <SelectValue placeholder="Supervisor" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#E5E7EB]">
                        {SUPERVISORES_INSTITUCIONALES.map((sup) => (
                          <SelectItem
                            key={sup.correo}
                            value={sup.nombre}
                            etiqueta={sup.nombre}
                          >
                            <div className="flex flex-col py-0.5 text-left">
                              <span className="font-medium text-slate-800">{sup.nombre}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{sup.correo}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[#122029]">Estado del Expediente</Label>
                    <Select
                      value={edit_estado}
                      onValueChange={(v) => v && set_edit_estado(v as any)}
                    >
                      <SelectTrigger className="h-10 border-[#E5E7EB] bg-white text-xs">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#E5E7EB]">
                        <SelectItem value="activo" etiqueta="Activo">
                          <span className="font-semibold text-emerald-700">Activo (Expediente Aprobado)</span>
                        </SelectItem>
                        <SelectItem value="pendiente_validacion" etiqueta="Pendiente de Validación">
                          <span className="font-semibold text-amber-700">Pendiente de Validación (Cruce Documental)</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="edit_meta" className="text-xs font-semibold text-[#122029]">
                      Meta Horaria Mensual
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="edit_meta"
                        type="number"
                        min="10"
                        max="80"
                        step="1"
                        value={edit_horas_meta_mes}
                        onChange={(e) => set_edit_horas_meta_mes(Number(e.target.value) || 36)}
                        className="h-10 border-[#E5E7EB] font-mono text-xs"
                      />
                      <span className="text-xs font-bold text-muted-foreground">hrs / mes</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección 5: Expediente Documental Oficial (Carnet y Kárdex) */}
              <div className="space-y-3 pt-2 border-t border-[#E5E7EB]/60">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#035683] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#00ABBD]" />
                  Expediente Documental (Carnet y Kárdex)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Carnet de Identidad */}
                  <div className="p-3 border border-[#E5E7EB] rounded-xl bg-slate-50 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">Cédula de Identidad (SEGIP)</span>
                      <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-300">
                        {edit_carnet_nombre || becario_a_editar?.nombre_archivo_carnet ? "Cargado" : "Pendiente"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={manejarSubirCarnetEdicion}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                        />
                        <Button type="button" variant="outline" size="sm" className="h-8 text-xs font-bold text-[#035683] border-[#00ABBD] cursor-pointer">
                          <Upload className="w-3.5 h-3.5 text-[#00ABBD] mr-1" />
                          Actualizar Carnet
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (becario_a_editar) {
                            set_documento_visor_seleccionado({
                              tipo: "carnet",
                              becario: {
                                ...becario_a_editar,
                                url_carnet: edit_carnet_url || becario_a_editar.url_carnet,
                              },
                            });
                          }
                        }}
                        className="h-8 text-xs font-semibold text-[#035683] cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#00ABBD] mr-1" />
                        Ver
                      </Button>
                    </div>
                    <p className="text-[10px] font-mono text-muted-foreground truncate">
                      {edit_carnet_nombre || becario_a_editar?.nombre_archivo_carnet || `CI_${edit_ci || "doc"}_${edit_expedicion}.pdf`}
                    </p>
                  </div>

                  {/* Kárdex Académico */}
                  <div className="p-3 border border-[#E5E7EB] rounded-xl bg-slate-50 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">Kárdex / Matrícula</span>
                      <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-300">
                        {edit_kardex_nombre || becario_a_editar?.nombre_archivo_kardex ? "Cargado" : "Pendiente"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={manejarSubirKardexEdicion}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                        />
                        <Button type="button" variant="outline" size="sm" className="h-8 text-xs font-bold text-[#035683] border-[#00ABBD] cursor-pointer">
                          <Upload className="w-3.5 h-3.5 text-[#00ABBD] mr-1" />
                          Actualizar Kárdex
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (becario_a_editar) {
                            set_documento_visor_seleccionado({
                              tipo: "kardex",
                              becario: {
                                ...becario_a_editar,
                                url_kardex: edit_kardex_url || becario_a_editar.url_kardex,
                              },
                            });
                          }
                        }}
                        className="h-8 text-xs font-semibold text-[#035683] cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#00ABBD] mr-1" />
                        Ver
                      </Button>
                    </div>
                    <p className="text-[10px] font-mono text-muted-foreground truncate">
                      {edit_kardex_nombre || becario_a_editar?.nombre_archivo_kardex || `Kardex_2026_${edit_universidad}.pdf`}
                    </p>
                  </div>
                </div>
              </div>
            </DialogBody>

            <DialogFooter className="p-4 px-6 border-t border-[#E5E7EB] bg-[#F8F9FA] shrink-0 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  set_modal_editar_abierto(false);
                  set_becario_a_editar(null);
                }}
                className="h-9 border-[#E5E7EB] rounded-xl text-xs font-semibold"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={guardarEdicionBecario}
                disabled={guardando_edicion}
                className="h-9 bg-[#035683] hover:bg-[#024366] text-white rounded-xl text-xs font-bold gap-1.5 shadow-sm cursor-pointer"
              >
                {guardando_edicion ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>Guardar Cambios</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Visor de Documentos Oficiales (Carnet y Kárdex) */}
      {documento_visor_seleccionado && (
        <ModalVisorDocumentoBecario
          abierto={Boolean(documento_visor_seleccionado)}
          alCerrar={() => set_documento_visor_seleccionado(null)}
          tipo={documento_visor_seleccionado.tipo}
          becario={documento_visor_seleccionado.becario}
        />
      )}

      {/* Modal de Configuración de Pasajes (TAREA-14) */}
      {modal_pasajes_abierto && becario_pasajes && (
        <Dialog
          open={modal_pasajes_abierto}
          onOpenChange={(ab) => {
            if (!ab) {
              set_modal_pasajes_abierto(false);
              set_becario_pasajes(null);
            }
          }}
        >
          <DialogContent
            showCloseButton={false}
            className="sm:max-w-[560px] max-h-[92vh] flex flex-col p-0 overflow-hidden bg-white rounded-2xl border-[#E5E7EB] shadow-2xl"
          >
            <DialogHeader className="p-6 pb-4 border-b border-[#E5E7EB] bg-[#F8F9FA] shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#007BBE]/10 border border-[#007BBE]/20 flex items-center justify-center">
                    <Bus className="w-5 h-5 text-[#007BBE]" />
                  </div>
                  <div>
                    <DialogTitle className="text-base font-bold text-[#035683]">
                      Configuración de Modalidad de Pasajes
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Define si {becario_pasajes.nombre} puede registrar &ldquo;Solo Ida&rdquo; o &ldquo;Ida y Vuelta&rdquo;
                    </DialogDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-mono bg-white border-[#E5E7EB] text-[#035683]">
                  ID: #{becario_pasajes.id}
                </Badge>
              </div>
            </DialogHeader>

            <DialogBody className="p-6 space-y-5 overflow-y-auto">
              <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-950">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  Regla Administrativa de Viáticos
                </p>
                <p>
                  Si se restringe a <strong>&ldquo;Solo Ida&rdquo;</strong>, el becario no podrá registrar el tramo de retorno ni en la web ni en la aplicación móvil para las actividades configuradas.
                </p>
              </div>

              {/* Modalidad General */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-[#035683]">
                  Modalidad General de Pasajes
                </Label>
                <Select
                  value={modalidad_pasajes_gral}
                  onValueChange={(val) => {
                    if (val) {
                      const v = val as "ida_y_vuelta" | "solo_ida";
                      set_modalidad_pasajes_gral(v);
                      set_pasajes_practicas(v);
                      set_pasajes_escuela(v);
                      set_pasajes_servicio(v);
                    }
                  }}
                >
                  <SelectTrigger className="h-10 rounded-xl border-[#E5E7EB] text-xs font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="ida_y_vuelta">
                      Ida y Vuelta (Permite registrar ambos tramos)
                    </SelectItem>
                    <SelectItem value="solo_ida">
                      Solo Ida (Restringe registro únicamente a la ida)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Desglose por Actividad */}
              <div className="pt-2 border-t border-[#E5E7EB] space-y-3">
                <h4 className="text-xs font-bold text-[#035683] uppercase tracking-wider">
                  Configuración Específica por Actividad
                </h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-[#E5E7EB]">
                    <div>
                      <p className="text-xs font-bold text-[#035683]">Prácticas Profesionales</p>
                      <p className="text-[11px] text-muted-foreground">Lunes a viernes en sede o institución asignada</p>
                    </div>
                    <Select
                      value={pasajes_practicas}
                      onValueChange={(v) => {
                        if (v) set_pasajes_practicas(v as "ida_y_vuelta" | "solo_ida");
                      }}
                    >
                      <SelectTrigger className="w-36 h-8 text-xs font-semibold rounded-lg bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="ida_y_vuelta">Ida y Vuelta</SelectItem>
                        <SelectItem value="solo_ida">Solo Ida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-[#E5E7EB]">
                    <div>
                      <p className="text-xs font-bold text-[#035683]">Escuela de Líderes (Viernes)</p>
                      <p className="text-[11px] text-muted-foreground">Talleres de formación presencial los viernes</p>
                    </div>
                    <Select
                      value={pasajes_escuela}
                      onValueChange={(v) => {
                        if (v) set_pasajes_escuela(v as "ida_y_vuelta" | "solo_ida");
                      }}
                    >
                      <SelectTrigger className="w-36 h-8 text-xs font-semibold rounded-lg bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="ida_y_vuelta">Ida y Vuelta</SelectItem>
                        <SelectItem value="solo_ida">Solo Ida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-[#E5E7EB]">
                    <div>
                      <p className="text-xs font-bold text-[#035683]">Acciones de Servicio (Viernes)</p>
                      <p className="text-[11px] text-muted-foreground">Servicio diaconal y comunitario programado</p>
                    </div>
                    <Select
                      value={pasajes_servicio}
                      onValueChange={(v) => {
                        if (v) set_pasajes_servicio(v as "ida_y_vuelta" | "solo_ida");
                      }}
                    >
                      <SelectTrigger className="w-36 h-8 text-xs font-semibold rounded-lg bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="ida_y_vuelta">Ida y Vuelta</SelectItem>
                        <SelectItem value="solo_ida">Solo Ida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </DialogBody>

            <DialogFooter className="p-4 px-6 border-t border-[#E5E7EB] bg-[#F8F9FA] shrink-0 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  set_modal_pasajes_abierto(false);
                  set_becario_pasajes(null);
                }}
                className="h-9 border-[#E5E7EB] rounded-xl text-xs font-semibold"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={guardarConfiguracionPasajes}
                disabled={guardando_config_pasajes}
                className="h-9 bg-[#035683] hover:bg-[#024366] text-white rounded-xl text-xs font-bold gap-1.5 shadow-sm cursor-pointer"
              >
                {guardando_config_pasajes ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>Guardar Modalidad</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Diálogo de Confirmación Institucional */}
      {DialogoConfirmacionInstitucional}
    </Card>
  );
}
