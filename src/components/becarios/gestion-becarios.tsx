"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BotonSolicitudVerificacion } from "./boton-solicitud-verificacion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  tutor_nombre: string;
  tutor_correo: string;
  estado: "activo" | "pendiente_validacion";
  horas_mes_actual: number;
  horas_meta_mes: number;
  historial_horas_mes: HorasMesHistorico[];
}

const SUPERVISORES_INSTITUCIONALES = [
  { nombre: "Angel Javier Ali Paz", correo: "angel.ali@diaconia.bo" },
  { nombre: "Claudia Cabrera", correo: "claudia.cabrera@diaconia.bo" },
  { nombre: "Rodrigo Solorzano", correo: "rodrigo.solorzano@diaconia.bo" },
  { nombre: "Lic. Mónica Valenzuela", correo: "monica.valenzuela@diaconia.bo" },
];

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
    horas_meta_mes: 40.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 39.5, meta_horas: 40.0, porcentaje: 99, estado: "cumplido" },
      { mes: "Septiembre 2026", horas_realizadas: 42.0, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 40.0, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
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
    horas_meta_mes: 40.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 40.0, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
      { mes: "Septiembre 2026", horas_realizadas: 41.5, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 40.0, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
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
    horas_meta_mes: 40.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 38.0, meta_horas: 40.0, porcentaje: 95, estado: "en_progreso" },
      { mes: "Septiembre 2026", horas_realizadas: 40.0, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 39.0, meta_horas: 40.0, porcentaje: 98, estado: "cumplido" },
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
    horas_meta_mes: 40.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 42.0, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
      { mes: "Septiembre 2026", horas_realizadas: 43.0, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 41.0, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
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
    horas_meta_mes: 40.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 37.5, meta_horas: 40.0, porcentaje: 94, estado: "en_progreso" },
      { mes: "Septiembre 2026", horas_realizadas: 39.0, meta_horas: 40.0, porcentaje: 98, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 38.0, meta_horas: 40.0, porcentaje: 95, estado: "cumplido" },
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
    horas_meta_mes: 40.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 41.0, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
      { mes: "Septiembre 2026", horas_realizadas: 40.5, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 40.0, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
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
    horas_meta_mes: 40.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 34.0, meta_horas: 40.0, porcentaje: 85, estado: "en_riesgo" },
      { mes: "Septiembre 2026", horas_realizadas: 38.0, meta_horas: 40.0, porcentaje: 95, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 39.0, meta_horas: 40.0, porcentaje: 98, estado: "cumplido" },
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
    horas_meta_mes: 40.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 38.5, meta_horas: 40.0, porcentaje: 96, estado: "en_progreso" },
      { mes: "Septiembre 2026", horas_realizadas: 40.0, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 40.5, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
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
    horas_meta_mes: 40.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 40.5, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
      { mes: "Septiembre 2026", horas_realizadas: 41.0, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 40.0, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
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
    horas_meta_mes: 40.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 36.0, meta_horas: 40.0, porcentaje: 90, estado: "en_progreso" },
      { mes: "Septiembre 2026", horas_realizadas: 39.5, meta_horas: 40.0, porcentaje: 99, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 40.0, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
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
    horas_meta_mes: 40.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 39.0, meta_horas: 40.0, porcentaje: 98, estado: "cumplido" },
      { mes: "Septiembre 2026", horas_realizadas: 40.0, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 40.0, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
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
    horas_meta_mes: 40.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 40.0, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
      { mes: "Septiembre 2026", horas_realizadas: 41.0, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 39.5, meta_horas: 40.0, porcentaje: 99, estado: "cumplido" },
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
    horas_meta_mes: 40.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 42.5, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
      { mes: "Septiembre 2026", horas_realizadas: 43.0, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 42.0, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
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
    horas_meta_mes: 40.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 38.0, meta_horas: 40.0, porcentaje: 95, estado: "en_progreso" },
      { mes: "Septiembre 2026", horas_realizadas: 40.0, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 39.0, meta_horas: 40.0, porcentaje: 98, estado: "cumplido" },
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
    horas_meta_mes: 40.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 35.0, meta_horas: 40.0, porcentaje: 88, estado: "en_riesgo" },
      { mes: "Septiembre 2026", horas_realizadas: 37.0, meta_horas: 40.0, porcentaje: 93, estado: "en_progreso" },
      { mes: "Agosto 2026", horas_realizadas: 38.0, meta_horas: 40.0, porcentaje: 95, estado: "cumplido" },
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
    horas_meta_mes: 40.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 39.0, meta_horas: 40.0, porcentaje: 98, estado: "cumplido" },
      { mes: "Septiembre 2026", horas_realizadas: 40.0, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 39.0, meta_horas: 40.0, porcentaje: 98, estado: "cumplido" },
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
    horas_meta_mes: 40.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 41.5, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
      { mes: "Septiembre 2026", horas_realizadas: 42.0, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 40.0, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
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
    horas_meta_mes: 40.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 40.0, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
      { mes: "Septiembre 2026", horas_realizadas: 40.5, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 39.5, meta_horas: 40.0, porcentaje: 99, estado: "cumplido" },
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
    horas_meta_mes: 40.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 37.0, meta_horas: 40.0, porcentaje: 93, estado: "en_progreso" },
      { mes: "Septiembre 2026", horas_realizadas: 39.0, meta_horas: 40.0, porcentaje: 98, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 38.0, meta_horas: 40.0, porcentaje: 95, estado: "cumplido" },
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
    horas_meta_mes: 40.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 38.5, meta_horas: 40.0, porcentaje: 96, estado: "en_progreso" },
      { mes: "Septiembre 2026", horas_realizadas: 40.0, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 39.0, meta_horas: 40.0, porcentaje: 98, estado: "cumplido" },
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
    horas_meta_mes: 40.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 39.0, meta_horas: 40.0, porcentaje: 98, estado: "cumplido" },
      { mes: "Septiembre 2026", horas_realizadas: 40.5, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 40.0, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
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
    horas_meta_mes: 40.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 40.0, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
      { mes: "Septiembre 2026", horas_realizadas: 41.0, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 40.0, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
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
    horas_meta_mes: 40.0,
    historial_horas_mes: [
      { mes: "Octubre 2026", horas_realizadas: 38.5, meta_horas: 40.0, porcentaje: 96, estado: "en_progreso" },
      { mes: "Septiembre 2026", horas_realizadas: 39.5, meta_horas: 40.0, porcentaje: 99, estado: "cumplido" },
      { mes: "Agosto 2026", horas_realizadas: 40.0, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
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

  const horas_mes_actual =
    typeof remoto.horas_mes_actual === "number"
      ? remoto.horas_mes_actual
      : match_inicial?.horas_mes_actual ?? 40.0;

  const horas_meta_mes =
    typeof remoto.horas_meta_mes === "number"
      ? remoto.horas_meta_mes
      : match_inicial?.horas_meta_mes ?? 40.0;

  const historial_horas_mes: HorasMesHistorico[] =
    Array.isArray(remoto.historial_horas_mes) && remoto.historial_horas_mes.length > 0
      ? remoto.historial_horas_mes
      : match_inicial?.historial_horas_mes || [
          {
            mes: "Octubre 2026",
            horas_realizadas: horas_mes_actual,
            meta_horas: horas_meta_mes,
            porcentaje: Math.min(100, Math.round((horas_mes_actual / (horas_meta_mes || 40)) * 100)),
            estado: horas_mes_actual >= horas_meta_mes ? "cumplido" : "en_progreso",
          },
          { mes: "Septiembre 2026", horas_realizadas: 40.0, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
          { mes: "Agosto 2026", horas_realizadas: 40.0, meta_horas: 40.0, porcentaje: 100, estado: "cumplido" },
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
    expedicion: remoto.expedicion || remoto.lugar_expedicion || match_inicial?.expedicion || "LP",
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
    tutor_nombre,
    tutor_correo,
    estado,
    horas_mes_actual,
    horas_meta_mes,
    historial_horas_mes,
  };
}

export function GestionBecarios() {
  const { usuario } = usarAutenticacion();
  const es_admin = usuario?.rol === "administrador";

  const [lista_becarios, set_lista_becarios] = useState<BecarioVista[]>(BECARIOS_INICIALES);
  const [busqueda, set_busqueda] = useState("");
  const [modal_abierto, set_modal_abierto] = useState(false);

  // Estados para modales de Horas y Ficha Completa
  const [becario_horas_modal, set_becario_horas_modal] = useState<BecarioVista | null>(null);
  const [becario_ficha_modal, set_becario_ficha_modal] = useState<BecarioVista | null>(null);

  // Consulta API con datos precargados y normalización defensiva
  const { datos: becarios_remotos } = useConsulta<BecarioVista[]>(
    "lista_becarios",
    async () => {
      try {
        const respuesta = await clienteApi.get<any[]>("/api/becarios");
        if (Array.isArray(respuesta) && respuesta.length > 0) {
          return respuesta.map(normalizarBecario);
        }
        return BECARIOS_INICIALES;
      } catch {
        return BECARIOS_INICIALES;
      }
    },
    { datos_iniciales: BECARIOS_INICIALES }
  );

  useEffect(() => {
    if (becarios_remotos && Array.isArray(becarios_remotos) && becarios_remotos.length > 0) {
      set_lista_becarios(becarios_remotos.map(normalizarBecario));
    }
  }, [becarios_remotos]);

  // Estados del formulario nuevo becario
  const [nuevo_nombre, set_nuevo_nombre] = useState("");
  const [nuevo_ci, set_nuevo_ci] = useState("");
  const [nueva_carrera, set_nueva_carrera] = useState("");
  const [nueva_universidad, set_nueva_universidad] = useState("UMSA");
  const [nueva_iglesia, set_nueva_iglesia] = useState("Iglesia Alianza La Paz");
  const [nuevo_lugar, set_nuevo_lugar] = useState("Oficina Central Bloque A");
  const [nuevo_estado, set_nuevo_estado] = useState<"pendiente_validacion" | "activo">("pendiente_validacion");

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
    return lista_becarios.filter((b) => (b.horas_mes_actual ?? 0) < 35);
  }, [lista_becarios]);

  const becarios_pendientes = useMemo(() => {
    return lista_becarios.filter((b) => b.estado === "pendiente_validacion");
  }, [lista_becarios]);

  const sedes_unicas = useMemo(() => {
    const conjunto = new Set<string>();
    lista_becarios.forEach((b) => {
      const nombre_sede = typeof b.lugar_practica === "string" ? b.lugar_practica : (b.lugar_practica as any)?.nombre;
      if (nombre_sede) conjunto.add(nombre_sede);
    });
    return Array.from(conjunto);
  }, [lista_becarios]);

  const tiene_cambios_nuevo_becario =
    nuevo_nombre.trim() !== "" ||
    nuevo_ci.trim() !== "" ||
    nueva_carrera.trim() !== "";

  const intentarCerrarModalBecario = () => {
    confirmarCierreSinCompletar(
      tiene_cambios_nuevo_becario,
      () => {
        set_modal_abierto(false);
        set_nuevo_nombre("");
        set_nuevo_ci("");
        set_nueva_carrera("");
        set_nuevo_estado("pendiente_validacion");
      },
      "Registro de Nuevo Becario"
    );
  };

  // Filtrado reactivo defensivo contra propiedades nulas o indefinidas
  const busqueda_limpia = (busqueda || "").toLowerCase().trim();
  const becarios_filtrados = lista_becarios.filter((b) => {
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

  const manejarGuardarBecario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevo_nombre.trim() || !nuevo_ci.trim()) return;

    const nuevo: BecarioVista = {
      id: lista_becarios.length + 1,
      nombre: nuevo_nombre,
      ci: nuevo_ci,
      expedicion: "LP",
      estado_civil: "Soltero(a)",
      sexo: "M",
      ceti: 1,
      celular: "70000000",
      correo: `${nuevo_nombre.toLowerCase().replace(/\s+/g, "")}@gmail.com`,
      fecha_nacimiento: "01/01/2000",
      edad: 24,
      direccion: "Zona Central",
      ciudad: "La Paz",
      carrera: es_admin ? nueva_carrera || "Ingeniería de Sistemas" : "Carrera Pendiente Asignación",
      universidad: es_admin ? nueva_universidad : "UMSA",
      iglesia: es_admin ? nueva_iglesia : "Iglesia Central",
      lugar_practica: es_admin ? nuevo_lugar : "Oficina Central Bloque A",
      tutor_nombre: SUPERVISORES_INSTITUCIONALES[0].nombre,
      tutor_correo: SUPERVISORES_INSTITUCIONALES[0].correo,
      estado: nuevo_estado,
      horas_mes_actual: 0,
      horas_meta_mes: 40.0,
      historial_horas_mes: [
        { mes: "Octubre 2026", horas_realizadas: 0, meta_horas: 40.0, porcentaje: 0, estado: "en_riesgo" },
        { mes: "Septiembre 2026", horas_realizadas: 0, meta_horas: 40.0, porcentaje: 0, estado: "en_riesgo" },
        { mes: "Agosto 2026", horas_realizadas: 0, meta_horas: 40.0, porcentaje: 0, estado: "en_riesgo" },
      ],
    };

    set_lista_becarios([nuevo, ...lista_becarios]);
    set_nuevo_nombre("");
    set_nuevo_ci("");
    set_nueva_carrera("");
    set_modal_abierto(false);
    if (nuevo_estado === "pendiente_validacion") {
      toast.success(`Becario ${nuevo.nombre} registrado como "Pendiente de Validación".`, {
        description: "El expediente aparece ahora en la pestaña 'Validaciones'.",
      });
    } else {
      toast.success(`Becario ${nuevo.nombre} registrado exitosamente como "Activo".`);
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

  const manejarAlternarVerificacionMensual = (activar: boolean) => {
    if (!es_admin) {
      toast.error("Solo el Administrador puede emitir órdenes de verificación mensual.");
      return;
    }

    set_verificacion_mensual_activa(activar);

    if (activar) {
      set_lista_becarios((prev) =>
        prev.map((b) => ({ ...b, estado: "pendiente_validacion" }))
      );
      toast.success(
        "Orden institucional emitida: Se solicitó verificación mensual a todos los becarios.",
        {
          description:
            "El estado de los becarios ha cambiado a 'Pendiente Validación' hasta confirmación de documentos.",
        }
      );
    } else {
      toast.info("Verificación mensual cerrada o finalizada.");
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
    <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-xl">
      <Tabs
        value={pestaña_activa}
        onValueChange={(val) => set_pestaña_activa(val as any)}
        className="w-full"
      >
        <CardHeader className="pb-4 border-b border-[#E3DCCB]/60 space-y-4">
          {/* Fila 1: Título y descripción limpia + Badges institucionales */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl font-bold font-display text-[#063A6B]">
                Gestión de Becarios y Gobernanza de Expedientes
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs sm:text-sm">
                Directorio oficial de estudiantes beneficiarios del programa BUMAND - Diaconía FRIF-IFD.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-center">
              <Badge variant="outline" className="h-7 px-2.5 border-[#E3DCCB] text-[#063A6B] font-mono text-xs font-bold">
                Total: {lista_becarios.length} becarios
              </Badge>
              {verificacion_mensual_activa && (
                <Badge className="h-7 px-2.5 bg-amber-500 text-white font-mono text-[11px] font-bold flex items-center gap-1 animate-pulse">
                  <Clock className="w-3 h-3" /> Verificación en Curso
                </Badge>
              )}
            </div>
          </div>

          {/* Fila 2: TABS SUPERIORES (ARRIBA DE LA BÚSQUEDA - Ahorra espacio vertical) */}
          <TabsList className="w-full grid grid-cols-2 lg:grid-cols-4 p-1.5 bg-slate-100/90 border border-[#E3DCCB] rounded-2xl shadow-xs gap-2 group-data-horizontal/tabs:h-auto h-auto">
            <TabsTrigger
              value="directorio"
              className="w-full h-10 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer text-[#063A6B] hover:text-[#063A6B] hover:bg-white/90 data-active:bg-[#063A6B] data-active:text-white data-active:hover:bg-[#063A6B] data-active:hover:text-white data-active:shadow-xs flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4 text-[#17B4C4]" />
              <span>Directorio General</span>
              <span className="bg-slate-200 text-[#063A6B] text-[10px] px-2 py-0.5 rounded-md font-mono font-bold">
                {lista_becarios.length}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="horas"
              className="w-full h-10 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer text-[#063A6B] hover:text-[#063A6B] hover:bg-white/90 data-active:bg-[#063A6B] data-active:text-white data-active:hover:bg-[#063A6B] data-active:hover:text-white data-active:shadow-xs flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4 text-[#17B4C4]" />
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
              className="w-full h-10 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer text-[#063A6B] hover:text-[#063A6B] hover:bg-white/90 data-active:bg-[#063A6B] data-active:text-white data-active:hover:bg-[#063A6B] data-active:hover:text-white data-active:shadow-xs flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4 text-[#17B4C4]" />
              <span>Asignación & Sedes</span>
              <span className="bg-[#17B4C4]/15 text-[#0E7A85] text-[10px] px-2 py-0.5 rounded-md font-mono font-bold">
                {sedes_unicas.length} sedes
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="validaciones"
              className="w-full h-10 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer text-[#063A6B] hover:text-[#063A6B] hover:bg-white/90 data-active:bg-[#063A6B] data-active:text-white data-active:hover:bg-[#063A6B] data-active:hover:text-white data-active:shadow-xs flex items-center justify-center gap-2"
            >
              <FileCheck className="w-4 h-4 text-[#17B4C4]" />
              <span>Validaciones</span>
              {becarios_pendientes.length > 0 ? (
                <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-md font-mono font-bold animate-pulse">
                  {becarios_pendientes.length} pendientes
                </span>
              ) : (
                <span className="bg-slate-200 text-[#063A6B] text-[10px] px-2 py-0.5 rounded-md font-mono font-bold">
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
                    : "Buscar por nombre, CI, universidad o carrera..."
                }
                value={busqueda}
                onChange={(e) => set_busqueda(e.target.value)}
                className="h-10 pl-9 border-[#E3DCCB] focus-visible:ring-[#17B4C4]"
              />
            </div>

            {/* Acciones contextuales a la derecha según la pestaña activa */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {pestaña_activa === "directorio" && (
                <Button
                  onClick={() => {
                    set_nuevo_estado("activo");
                    set_modal_abierto(true);
                  }}
                  className="h-10 px-4 bg-[#17B4C4] hover:bg-[#17B4C4]/90 text-[#063A6B] font-bold rounded-xl flex items-center gap-2 shadow-sm text-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Becario</span>
                </Button>
              )}

              {pestaña_activa === "horas" && (
                <Badge variant="outline" className="h-10 px-3 bg-slate-50 border-[#E3DCCB] text-[#063A6B] text-xs font-semibold flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#17B4C4]" />
                  <span>Meta Reglamentaria: 40.0 hrs / mes</span>
                </Badge>
              )}

              {pestaña_activa === "sedes" && (
                <Badge variant="outline" className="h-10 px-3 bg-slate-50 border-[#E3DCCB] text-[#063A6B] text-xs font-semibold flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#17B4C4]" />
                  <span>{sedes_unicas.length} Sedes Operativas</span>
                </Badge>
              )}

              {pestaña_activa === "validaciones" && (
                <div className="flex items-center gap-2">
                  {es_admin && (
                    <BotonSolicitudVerificacion
                      total_becarios={lista_becarios.length}
                      confirmarAccionInstitucional={confirmarAccionInstitucional}
                      alEmitirOrden={() => {
                        set_verificacion_mensual_activa(true);
                        set_lista_becarios((prev) =>
                          prev.map((b) => ({ ...b, estado: "pendiente_validacion" }))
                        );
                      }}
                    />
                  )}
                  <Button
                    onClick={() => {
                      set_nuevo_estado("pendiente_validacion");
                      set_modal_abierto(true);
                    }}
                    className="h-10 px-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl flex items-center gap-1.5 text-xs shadow-sm cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Registrar Pendiente</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-5">
          {/* TAB 1: DIRECTORIO GENERAL (COMPACTA, CERO SCROLL HORIZONTAL) */}
          <TabsContent value="directorio" className="space-y-4">
            <div className="border border-[#E3DCCB] rounded-2xl overflow-hidden bg-white shadow-2xs">
              <Table>
                <TableHeader className="bg-slate-50/80 border-b border-[#E3DCCB]">
                  <TableRow>
                    <TableHead className="w-[280px] font-bold text-[#063A6B]">Becario & Documento</TableHead>
                    <TableHead className="font-bold text-[#063A6B]">Carrera / Universidad</TableHead>
                    <TableHead className="font-bold text-[#063A6B]">Sede Asignada</TableHead>
                    <TableHead className="w-[130px] font-bold text-[#063A6B] text-center">Estado</TableHead>
                    <TableHead className="w-[190px] font-bold text-[#063A6B] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {becarios_filtrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-xs">
                        No se encontraron becarios que coincidan con la búsqueda.
                      </TableCell>
                    </TableRow>
                  ) : (
                    becarios_filtrados.map((b) => (
                      <TableRow key={b.id} className="border-b border-[#E3DCCB]/40 hover:bg-[#17B4C4]/5 transition-colors">
                        <TableCell className="font-medium text-[#1E293B]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#063A6B]/10 text-[#063A6B] flex items-center justify-center font-bold text-xs shrink-0">
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
                          <div className="flex items-center gap-1.5 text-xs text-[#063A6B] font-semibold">
                            <Building2 className="w-3.5 h-3.5 text-[#17B4C4] shrink-0" />
                            <span className="truncate max-w-[190px]">
                              {typeof b.lugar_practica === "string" ? b.lugar_practica : (b.lugar_practica as any)?.nombre || "Oficina Central"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {b.estado === "activo" ? (
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
                              className="h-8 px-2.5 text-xs font-bold border-[#063A6B]/30 text-[#063A6B] hover:bg-[#063A6B]/10 rounded-lg flex items-center gap-1 cursor-pointer"
                              title="Visualizar Datos Completos del Expediente"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#063A6B]" />
                              <span>Ficha</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => set_becario_horas_modal(b)}
                              className="h-8 px-2 text-xs font-bold border-[#17B4C4]/50 text-[#063A6B] hover:bg-[#17B4C4]/10 rounded-lg flex items-center gap-1 cursor-pointer"
                              title="Ver Historial de Horas por Mes"
                            >
                              <Clock className="w-3.5 h-3.5 text-[#17B4C4]" />
                            </Button>
                            {es_admin && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => abrirModalAsignarSupervisor(b)}
                                className="h-8 w-8 p-0 text-[#063A6B] hover:bg-slate-100 rounded-lg cursor-pointer"
                                title="Asignar Supervisor Institucional"
                              >
                                <UserCog className="w-3.5 h-3.5" />
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
            <div className="border border-[#E3DCCB] rounded-2xl overflow-hidden bg-white shadow-2xs">
              <Table>
                <TableHeader className="bg-slate-50/80 border-b border-[#E3DCCB]">
                  <TableRow>
                    <TableHead className="w-[280px] font-bold text-[#063A6B]">Becario & Documento</TableHead>
                    <TableHead className="font-bold text-[#063A6B]">Sede Asignada</TableHead>
                    <TableHead className="w-[240px] font-bold text-[#063A6B]">Horas del Mes & Cumplimiento</TableHead>
                    <TableHead className="font-bold text-[#063A6B]">Supervisor Asignado</TableHead>
                    <TableHead className="w-[180px] font-bold text-[#063A6B] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {becarios_filtrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-xs">
                        No se encontraron registros de horas para becarios.
                      </TableCell>
                    </TableRow>
                  ) : (
                    becarios_filtrados.map((b) => (
                      <TableRow key={b.id} className="border-b border-[#E3DCCB]/40 hover:bg-[#17B4C4]/5 transition-colors">
                        <TableCell className="font-medium text-[#1E293B]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#063A6B]/10 text-[#063A6B] flex items-center justify-center font-bold text-xs shrink-0">
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
                          <div className="flex items-center gap-1.5 text-xs text-[#063A6B] font-semibold">
                            <Building2 className="w-3.5 h-3.5 text-[#17B4C4] shrink-0" />
                            <span className="truncate max-w-[190px]">
                              {typeof b.lugar_practica === "string" ? b.lugar_practica : (b.lugar_practica as any)?.nombre || "Oficina Central"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1.5 min-w-[160px]">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-[#063A6B]">
                                {(b.horas_mes_actual ?? 0).toFixed(1)} / {(b.horas_meta_mes ?? 40).toFixed(1)} hrs
                              </span>
                              <span className="text-[11px] font-semibold text-muted-foreground">
                                {(b.horas_meta_mes ?? 0) > 0 ? Math.round(((b.horas_mes_actual ?? 0) / (b.horas_meta_mes || 40)) * 100) : 0}%
                              </span>
                            </div>
                            <Progress
                              value={Math.min(100, (b.horas_meta_mes ?? 0) > 0 ? Math.round(((b.horas_mes_actual ?? 0) / (b.horas_meta_mes || 40)) * 100) : 0)}
                              className="h-1.5 bg-slate-100"
                            />
                            <div>
                              {(b.horas_mes_actual ?? 0) >= (b.horas_meta_mes ?? 40) ? (
                                <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  Meta Cumplida
                                </span>
                              ) : (b.horas_mes_actual ?? 0) >= 35 ? (
                                <span className="inline-flex items-center text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                  En Progreso
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                  En Riesgo
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <p className="font-semibold text-[#1E293B]">{b.tutor_nombre || "Sin Asignar"}</p>
                            <p className="text-muted-foreground text-[11px] font-mono flex items-center gap-1">
                              <Mail className="w-3 h-3 text-[#17B4C4]" />
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
                              className="h-8 px-2.5 text-xs font-bold border-[#17B4C4]/50 text-[#063A6B] hover:bg-[#17B4C4]/10 rounded-lg flex items-center gap-1 cursor-pointer"
                              title="Ver Historial Completo de Horas"
                            >
                              <Clock className="w-3.5 h-3.5 text-[#17B4C4]" />
                              <span>Horas</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => set_becario_ficha_modal(b)}
                              className="h-8 w-8 p-0 text-[#063A6B] hover:bg-slate-100 rounded-lg cursor-pointer"
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
            <div className="border border-[#E3DCCB] rounded-2xl overflow-hidden bg-white shadow-2xs">
              <Table>
                <TableHeader className="bg-slate-50/80 border-b border-[#E3DCCB]">
                  <TableRow>
                    <TableHead className="w-[280px] font-bold text-[#063A6B]">Becario & Documento</TableHead>
                    <TableHead className="font-bold text-[#063A6B]">Sede de Prácticas</TableHead>
                    <TableHead className="font-bold text-[#063A6B]">Supervisor Institucional</TableHead>
                    <TableHead className="font-bold text-[#063A6B]">Iglesia de Procedencia</TableHead>
                    <TableHead className="w-[180px] font-bold text-[#063A6B] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {becarios_filtrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-xs">
                        No se encontraron asignaciones de sedes.
                      </TableCell>
                    </TableRow>
                  ) : (
                    becarios_filtrados.map((b) => (
                      <TableRow key={b.id} className="border-b border-[#E3DCCB]/40 hover:bg-[#17B4C4]/5 transition-colors">
                        <TableCell className="font-medium text-[#1E293B]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#063A6B]/10 text-[#063A6B] flex items-center justify-center font-bold text-xs shrink-0">
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
                          <div className="flex items-center gap-1.5 text-xs text-[#063A6B] font-semibold">
                            <Building2 className="w-3.5 h-3.5 text-[#17B4C4] shrink-0" />
                            <span className="truncate max-w-[210px]">
                              {typeof b.lugar_practica === "string" ? b.lugar_practica : (b.lugar_practica as any)?.nombre || "Oficina Central Bloque A"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <p className="font-semibold text-[#1E293B]">{b.tutor_nombre || "Sin Asignar"}</p>
                            <p className="text-muted-foreground text-[11px] font-mono flex items-center gap-1">
                              <Mail className="w-3 h-3 text-[#17B4C4]" />
                              {b.tutor_correo || "Sin correo registrado"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Church className="w-3.5 h-3.5 text-[#063A6B] shrink-0" />
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
                                onClick={() => abrirModalAsignarSupervisor(b)}
                                className="h-8 px-2.5 text-xs font-bold border-[#063A6B]/30 text-[#063A6B] hover:bg-[#063A6B]/10 rounded-lg flex items-center gap-1 cursor-pointer"
                                title="Reasignar o Cambiar Tutor"
                              >
                                <UserCog className="w-3.5 h-3.5" />
                                <span>Supervisor</span>
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => set_becario_ficha_modal(b)}
                              className="h-8 w-8 p-0 text-[#063A6B] hover:bg-slate-100 rounded-lg cursor-pointer"
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
            <div className="border border-[#E3DCCB] rounded-2xl overflow-hidden bg-white shadow-2xs">
              <Table>
                <TableHeader className="bg-slate-50/80 border-b border-[#E3DCCB]">
                  <TableRow>
                    <TableHead className="w-[280px] font-bold text-[#063A6B]">Becario & Documento</TableHead>
                    <TableHead className="font-bold text-[#063A6B]">Carrera / Universidad</TableHead>
                    <TableHead className="w-[160px] font-bold text-[#063A6B] text-center">Estado Documental</TableHead>
                    <TableHead className="w-[220px] font-bold text-[#063A6B] text-right">Acciones Prioritarias</TableHead>
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
                            Todos los becarios activos cuentan con sus documentos y confirmaciones ratificadas.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    becarios_filtrados
                      .filter((b) => b.estado === "pendiente_validacion")
                      .map((b) => (
                        <TableRow key={b.id} className="border-b border-[#E3DCCB]/40 hover:bg-[#17B4C4]/5 transition-colors">
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
                                  className="h-8 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer"
                                  title="Validar expediente y marcar como Activo"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Validar</span>
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => set_becario_ficha_modal(b)}
                                className="h-8 px-2.5 text-xs font-bold border-[#063A6B]/30 text-[#063A6B] hover:bg-[#063A6B]/10 rounded-lg flex items-center gap-1 cursor-pointer"
                                title="Ver Ficha Completa"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#063A6B]" />
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

      {/* Modal Registrar Nuevo Becario BUMAND */}
      <Dialog
        open={modal_abierto}
        onOpenChange={(ab) => {
          if (!ab) intentarCerrarModalBecario();
          else set_modal_abierto(true);
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-[520px] max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white rounded-2xl border-[#E3DCCB] shadow-2xl"
        >
          <DialogHeader className="p-6 pb-4 border-b border-[#E3DCCB] shrink-0 bg-white">
            <DialogTitle className="text-lg font-bold text-[#063A6B]">
              Registrar Nuevo Becario BUMAND
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">
              El C.I. registrado en esta nómina servirá como clave de validación para que el estudiante cree su usuario de sistema con rol de becario (cruce de listas).
            </p>
          </DialogHeader>

          <form onSubmit={manejarGuardarBecario} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <DialogBody className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
              {!es_admin && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Gobernanza activa: Los campos <strong>Universidad</strong>, <strong>Carrera</strong>, <strong>Iglesia</strong> y <strong>Sede</strong> están bloqueados para roles no administradores.
                  </span>
                </div>
              )}

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
                  className="h-10 border-[#E3DCCB] focus-visible:ring-[#17B4C4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="ci_num" className="text-xs font-semibold text-[#122029]">
                    Cédula de Identidad (C.I.)
                  </Label>
                  <Input
                    id="ci_num"
                    placeholder="12345678"
                    value={nuevo_ci}
                    onChange={(e) => set_nuevo_ci(e.target.value)}
                    required
                    className="h-10 border-[#E3DCCB] focus-visible:ring-[#17B4C4]"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="univ" className="text-xs font-semibold text-[#122029]">
                      Universidad
                    </Label>
                    {!es_admin && (
                      <Badge variant="outline" className="text-[10px] text-amber-700 border-amber-300">
                        Solo Admin
                      </Badge>
                    )}
                  </div>
                  <Select
                    value={nueva_universidad}
                    onValueChange={(v) => v && set_nueva_universidad(v)}
                    disabled={!es_admin}
                  >
                    <SelectTrigger className="h-10 border-[#E3DCCB] disabled:opacity-60 disabled:bg-slate-100">
                      <SelectValue placeholder="Universidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UMSA">UMSA</SelectItem>
                      <SelectItem value="UPEA">UPEA</SelectItem>
                      <SelectItem value="UCB">UCB</SelectItem>
                      <SelectItem value="UNIVALLE">UNIVALLE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="carrera_txt" className="text-xs font-semibold text-[#122029]">
                    Carrera
                  </Label>
                  {!es_admin && (
                    <Badge variant="outline" className="text-[10px] text-amber-700 border-amber-300">
                      Solo Admin
                    </Badge>
                  )}
                </div>
                <Input
                  id="carrera_txt"
                  placeholder="Ej. Ingeniería de Sistemas"
                  value={nueva_carrera}
                  onChange={(e) => set_nueva_carrera(e.target.value)}
                  disabled={!es_admin}
                  required={es_admin}
                  className="h-10 border-[#E3DCCB] focus-visible:ring-[#17B4C4] disabled:opacity-60 disabled:bg-slate-100"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="iglesia_txt" className="text-xs font-semibold text-[#122029]">
                    Iglesia Congregacional
                  </Label>
                  {!es_admin && (
                    <Badge variant="outline" className="text-[10px] text-amber-700 border-amber-300">
                      Solo Admin
                    </Badge>
                  )}
                </div>
                <Input
                  id="iglesia_txt"
                  placeholder="Ej. Iglesia Bautista Central El Alto"
                  value={nueva_iglesia}
                  onChange={(e) => set_nueva_iglesia(e.target.value)}
                  disabled={!es_admin}
                  required={es_admin}
                  className="h-10 border-[#E3DCCB] focus-visible:ring-[#17B4C4] disabled:opacity-60 disabled:bg-slate-100"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="lugar_sel" className="text-xs font-semibold text-[#122029]">
                    Sede / Lugar de Práctica Asignado
                  </Label>
                  {!es_admin && (
                    <Badge variant="outline" className="text-[10px] text-amber-700 border-amber-300">
                      Solo Admin
                    </Badge>
                  )}
                </div>
                <Select
                  value={nuevo_lugar}
                  onValueChange={(v) => v && set_nuevo_lugar(v)}
                  disabled={!es_admin}
                >
                  <SelectTrigger className="h-10 border-[#E3DCCB] disabled:opacity-60 disabled:bg-slate-100">
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
                  <SelectTrigger id="estado_inicial_sel" className="h-10 border-[#E3DCCB]">
                    <SelectValue placeholder="Estado inicial" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente_validacion">
                      Pendiente de Validación (Cruce de listas y documentación)
                    </SelectItem>
                    <SelectItem value="activo">
                      Activo (Expediente aprobado e incorporado de inmediato)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {nuevo_estado === "pendiente_validacion"
                    ? "El becario se registrará con alerta en la pestaña 'Validaciones' hasta ratificar sus documentos."
                    : "El becario se incorporará directamente como activo en el Directorio General."}
                </p>
              </div>
            </DialogBody>

            <DialogFooter className="p-4 px-6 border-t border-[#E3DCCB] bg-[#F8F9FA]/90 shrink-0 mt-auto flex sm:justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={intentarCerrarModalBecario}
                className="h-10 border-[#E3DCCB] rounded-xl hover:bg-slate-100"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="h-10 bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold rounded-xl shadow-sm"
              >
                Guardar Becario
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Historial de Horas Realizadas por Mes */}
      <Dialog open={!!becario_horas_modal} onOpenChange={(open) => !open && set_becario_horas_modal(null)}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-[620px] max-h-[85vh] flex flex-col p-0 overflow-hidden bg-white rounded-2xl border-[#E3DCCB] shadow-2xl"
        >
          <DialogHeader className="p-6 pb-4 border-b border-[#E3DCCB] bg-[#F8F9FA] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#063A6B]/10 text-[#063A6B] flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#17B4C4]" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-[#063A6B]">
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
                <div className="p-4 rounded-xl bg-[#063A6B]/5 border border-[#063A6B]/15 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground">Mes Actual (Octubre 2026)</span>
                    <p className="text-2xl font-bold font-mono text-[#063A6B]">
                      {(becario_horas_modal.horas_mes_actual ?? 0).toFixed(1)}{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        / {(becario_horas_modal.horas_meta_mes ?? 40).toFixed(1)} hrs
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">Avance Global</span>
                    <p className="text-2xl font-bold font-mono text-[#17B4C4]">
                      {(becario_horas_modal.horas_meta_mes ?? 0) > 0
                        ? Math.round(((becario_horas_modal.horas_mes_actual ?? 0) / (becario_horas_modal.horas_meta_mes || 40)) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#063A6B]">
                    Desglose Mensual Acumulado
                  </h4>
                  <div className="border border-[#E3DCCB] rounded-xl overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow className="border-b border-[#E3DCCB]">
                          <TableHead className="text-xs font-bold text-[#063A6B]">Mes</TableHead>
                          <TableHead className="text-xs font-bold text-[#063A6B]">Horas</TableHead>
                          <TableHead className="text-xs font-bold text-[#063A6B]">Meta</TableHead>
                          <TableHead className="text-xs font-bold text-[#063A6B]">Progreso</TableHead>
                          <TableHead className="text-xs font-bold text-[#063A6B] text-right">Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {becario_horas_modal.historial_horas_mes?.map((h, i) => (
                          <TableRow key={i} className="border-b border-[#E3DCCB]/40">
                            <TableCell className="text-xs font-bold text-[#1E293B]">
                              {h.mes}
                            </TableCell>
                            <TableCell className="font-mono text-xs font-bold text-[#063A6B]">
                              {(h.horas_realizadas ?? 0).toFixed(1)} hrs
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {(h.meta_horas ?? 40).toFixed(1)} hrs
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
                              {h.estado === "cumplido" ? (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px] font-bold">
                                  Cumplido
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

                <div className="p-3 bg-slate-50 border border-[#E3DCCB] rounded-xl text-xs text-muted-foreground flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#17B4C4] shrink-0" />
                  <span>
                    El cumplimiento mínimo reglamentario es de <strong>40.0 horas mensuales</strong> de práctica y servicio institucional en BUMAND.
                  </span>
                </div>
              </>
            )}
          </DialogBody>

          <DialogFooter className="p-4 px-6 border-t border-[#E3DCCB] bg-[#F8F9FA] shrink-0 flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => set_becario_horas_modal(null)}
              className="h-9 border-[#E3DCCB] rounded-xl text-xs font-semibold"
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
          className="sm:max-w-[760px] max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white rounded-2xl border-[#E3DCCB] shadow-2xl"
        >
          <DialogHeader className="p-6 pb-4 border-b border-[#E3DCCB] bg-[#F8F9FA] shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#063A6B] text-[#17B4C4] flex items-center justify-center font-bold text-lg shadow-sm">
                  {(becario_ficha_modal?.nombre || "B").charAt(0).toUpperCase()}
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-[#063A6B]">
                    {becario_ficha_modal?.nombre || "Becario Institucional"}
                  </DialogTitle>
                  <CardDescription className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>C.I.: {becario_ficha_modal?.ci || "-"} {becario_ficha_modal?.expedicion || ""}</span>
                    <span>•</span>
                    <span>{becario_ficha_modal?.carrera || "-"} ({becario_ficha_modal?.universidad || "-"})</span>
                  </CardDescription>
                </div>
              </div>
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
          </DialogHeader>

          <DialogBody className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0">
            {becario_ficha_modal && (
              <>
                {/* Bloque 1: Datos Personales */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#063A6B] flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#17B4C4]" />
                    Datos Personales y de Identificación
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 border border-[#E3DCCB] rounded-xl text-xs">
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
                        <Calendar className="w-3 h-3 text-[#17B4C4]" />
                        {becario_ficha_modal.fecha_nacimiento || "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Edad Registrada</span>
                      <p className="font-semibold text-[#1E293B]">{becario_ficha_modal.edad ?? 22} años</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Teléfono Celular</span>
                      <p className="font-bold text-[#063A6B] font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#17B4C4]" />
                        {becario_ficha_modal.celular || "-"}
                      </p>
                    </div>
                    <div className="sm:col-span-3">
                      <span className="text-muted-foreground block text-[11px]">Correo Institucional / Personal</span>
                      <p className="font-bold text-[#063A6B] font-mono flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#17B4C4]" />
                        {becario_ficha_modal.correo || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bloque 2: Domicilio */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#063A6B] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#17B4C4]" />
                    Residencia y Domicilio
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 border border-[#E3DCCB] rounded-xl text-xs">
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
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#063A6B] flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#17B4C4]" />
                    Formación Universitaria y Comunidad Eclesiástica
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 border border-[#E3DCCB] rounded-xl text-xs">
                    <div className="sm:col-span-2">
                      <span className="text-muted-foreground block text-[11px]">Universidad</span>
                      <p className="font-semibold text-[#1E293B]">{becario_ficha_modal.universidad || "-"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Nivel CETI</span>
                      <Badge variant="outline" className="mt-0.5 border-[#063A6B] text-[#063A6B] font-bold">
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
                        <Church className="w-3.5 h-3.5 text-[#063A6B]" />
                        {typeof becario_ficha_modal.iglesia === "string" ? becario_ficha_modal.iglesia : (becario_ficha_modal.iglesia as any)?.nombre || "Iglesia Institucional"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bloque 4: Asignación BUMAND */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#063A6B] flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#17B4C4]" />
                    Asignación Institucional en BUMAND
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 border border-[#E3DCCB] rounded-xl text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Sede de Prácticas</span>
                      <p className="font-bold text-[#063A6B]">{typeof becario_ficha_modal.lugar_practica === "string" ? becario_ficha_modal.lugar_practica : (becario_ficha_modal.lugar_practica as any)?.nombre || "Oficina Central Bloque A"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Supervisor Tutor Asignado</span>
                      <p className="font-bold text-[#1E293B]">{becario_ficha_modal.tutor_nombre || "Sin Asignar"}</p>
                      <p className="text-[11px] font-mono text-muted-foreground">{becario_ficha_modal.tutor_correo || ""}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Horas Acumuladas Mes Actual</span>
                      <p className="font-mono font-bold text-[#063A6B]">
                        {(becario_ficha_modal.horas_mes_actual ?? 0).toFixed(1)} / {(becario_ficha_modal.horas_meta_mes ?? 40).toFixed(1)} hrs
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Porcentaje de Cumplimiento</span>
                      <p className="font-mono font-bold text-emerald-600">
                        {(becario_ficha_modal.horas_meta_mes ?? 0) > 0
                          ? Math.round(((becario_ficha_modal.horas_mes_actual ?? 0) / (becario_ficha_modal.horas_meta_mes || 40)) * 100)
                          : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogBody>

          <DialogFooter className="p-4 px-6 border-t border-[#E3DCCB] bg-[#F8F9FA] shrink-0 flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => set_becario_ficha_modal(null)}
              className="h-9 border-[#E3DCCB] rounded-xl text-xs font-semibold"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Exclusivo de Administrador: Asignar Supervisor */}
      <Dialog open={modal_supervisor_abierto} onOpenChange={set_modal_supervisor_abierto}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-[440px] p-0 overflow-hidden bg-white rounded-2xl border-[#E3DCCB] shadow-2xl"
        >
          <DialogHeader className="p-6 pb-4 border-b border-[#E3DCCB] bg-[#F8F9FA]">
            <DialogTitle className="text-base font-bold text-[#063A6B] flex items-center gap-2">
              <UserCog className="w-5 h-5 text-[#17B4C4]" />
              Asignar Supervisor Institucional
            </DialogTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Vincular tutor responsable para seguimiento de prácticas y rúbrica semestral.
            </CardDescription>
          </DialogHeader>

          <DialogBody className="p-6 space-y-4">
            {becario_seleccionado && (
              <div className="p-3 bg-slate-50 border border-[#E3DCCB] rounded-xl text-xs space-y-1">
                <p className="font-bold text-[#063A6B]">{becario_seleccionado.nombre || "Becario"}</p>
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
                <SelectTrigger id="sel-supervisor" className="h-10 border-[#E3DCCB]">
                  <SelectValue placeholder="Seleccionar supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {SUPERVISORES_INSTITUCIONALES.map((sup) => (
                    <SelectItem key={sup.correo} value={sup.nombre}>
                      {sup.nombre} ({sup.correo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </DialogBody>

          <DialogFooter className="p-4 px-6 border-t border-[#E3DCCB] bg-[#F8F9FA] flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => set_modal_supervisor_abierto(false)}
              className="h-9 border-[#E3DCCB] rounded-xl text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={manejarGuardarSupervisor}
              className="h-9 bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold rounded-xl text-xs shadow-sm"
            >
              Confirmar Asignación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmación Institucional */}
      {DialogoConfirmacionInstitucional}
    </Card>
  );
}
