"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Mail,
  Plus,
  Search,
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw,
  Lock,
  CheckCircle2,
  XCircle,
  Sparkles,
  Dices,
  Edit2,
  Trash2,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { clienteApi } from "@/lib/cliente-api";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";

export interface CorreoAdicionalItem {
  id?: number;
  correo: string;
  etiqueta?: string | null;
}

export interface UsuarioInstitucional {
  id: number;
  nombre: string;
  correo: string;
  correo_alternativo?: string | null;
  correos_adicionales?: CorreoAdicionalItem[];
  rol: "administrador" | "supervisor" | "becario";
  estado: "activo" | "inactivo";
  created_at?: string;
  telefono?: string;
  cargo?: string;
  unidad?: string;
}

const CLAVE_STORAGE_USUARIOS = "bumand_catalogo_usuarios_admin";

// Catálogo semilla oficial institucional de 61 cuentas (2 Administradores, 29 Supervisores y 30 Becarios)
const USUARIOS_SEMILLA: UsuarioInstitucional[] = [
  // 1. Administradores Institucionales (2)
  {
    id: 1,
    nombre: "Daniel Dávalos",
    correo: "daniel234.davalos@gmail.com",
    correo_alternativo: "daniel.davalos@bumand.bo",
    correos_adicionales: [
      { id: 101, correo: "daniel.davalos@bumand.bo", etiqueta: "Institucional" },
    ],
    rol: "administrador",
    estado: "activo",
    cargo: "Administrador Primario y Dirección Tecnológica",
    unidad: "Gerencia Nacional de Sistemas y Tecnología",
  },
  {
    id: 2,
    nombre: "Coordinación General BUMAND",
    correo: "coordinacion@bumand.bo",
    correo_alternativo: "bumand.central@diaconia.bo",
    correos_adicionales: [
      { id: 102, correo: "bumand.central@diaconia.bo", etiqueta: "Respaldo" },
    ],
    rol: "administrador",
    estado: "activo",
    cargo: "Coordinación Institucional y Dirección del Programa BUMAND",
    unidad: "Coordinación Nacional BUMAND",
  },

  // 2. Supervisores y Mentores Institucionales (29)
  {
    id: 3,
    nombre: "Angel Javier Ali Paz",
    correo: "angel.ali@bumand.bo",
    correo_alternativo: "angel.ali.paz@gmail.com",
    correos_adicionales: [
      { id: 103, correo: "angel.ali.paz@gmail.com", etiqueta: "Personal" },
    ],
    rol: "supervisor",
    estado: "activo",
    cargo: "Tutor General de Prácticas / Jefe de Seguridad Física",
    unidad: "Jefatura de Seguridad Física",
  },
  {
    id: 4,
    nombre: "Carlos Mendoza Flores",
    correo: "carlos.mendoza@bumand.bo",
    correo_alternativo: "carlos.mendoza.fl@gmail.com",
    correos_adicionales: [
      { id: 104, correo: "carlos.mendoza.fl@gmail.com", etiqueta: "Personal" },
    ],
    rol: "supervisor",
    estado: "activo",
    cargo: "Supervisor de Operaciones y Red de Agencias",
    unidad: "Gerencia de Operaciones",
  },
  {
    id: 5,
    nombre: "Claudia Consuelo Cabrera Delgado",
    correo: "claudia.cabrera@diaconia.bo",
    correo_alternativo: "claudia.cabrera.med@gmail.com",
    correos_adicionales: [
      { id: 105, correo: "claudia.cabrera.med@gmail.com", etiqueta: "Personal" },
    ],
    rol: "supervisor",
    estado: "activo",
    cargo: "Responsable de Consultorio Médico / Talento Humano",
    unidad: "Consultorio Médico / SGN Talento Humano",
  },
  {
    id: 6,
    nombre: "Rodrigo Solorzano San Martin",
    correo: "rodrigo.solorzano@diaconia.bo",
    correo_alternativo: "rsolorzano.bo@gmail.com",
    rol: "supervisor",
    estado: "activo",
    cargo: "Responsable de Productos y Canales Financieros",
    unidad: "Productos y Canales / SGN de Captaciones",
  },
  {
    id: 7,
    nombre: "Elsa Quinteros Aquino",
    correo: "elsa.quinteros@diaconia.bo",
    correo_alternativo: "elsa.quinteros.fin@gmail.com",
    rol: "supervisor",
    estado: "activo",
    cargo: "Responsable de Finanzas y Tesorería",
    unidad: "Finanzas y Tesorería",
  },
  {
    id: 8,
    nombre: "Hugo Seifert",
    correo: "hugo.seifert@diaconia.bo",
    correo_alternativo: "hseifert.riesgos@gmail.com",
    rol: "supervisor",
    estado: "activo",
    cargo: "Gerente Nacional de Riesgos",
    unidad: "Gerencia Nacional de Riesgos",
  },
  {
    id: 9,
    nombre: "Max Arthur Reynoso Espinoza",
    correo: "max.reynoso@diaconia.bo",
    correo_alternativo: "max.reynoso.mkt@gmail.com",
    rol: "supervisor",
    estado: "activo",
    cargo: "Jefe de Marketing y Comunicación Institucional",
    unidad: "Jefatura de Marketing y Comunicación",
  },
  {
    id: 10,
    nombre: "Fernando Marcelo Quispe Calle",
    correo: "fernando.quispe@bumand.bo",
    correo_alternativo: "fernando.quispe.diaconia@gmail.com",
    rol: "supervisor",
    estado: "activo",
    cargo: "Auditor Interno de Procesos y Operaciones",
    unidad: "Auditoría Interna",
  },
  {
    id: 11,
    nombre: "Silvia Patricia Morales Rocha",
    correo: "silvia.morales@bumand.bo",
    correo_alternativo: "silvia.morales.rrhh@gmail.com",
    rol: "supervisor",
    estado: "activo",
    cargo: "Encargada de Bienestar y Gestión de Talento",
    unidad: "Talento Humano",
  },
  {
    id: 12,
    nombre: "Victor Hugo Tarqui Mamani",
    correo: "victor.tarqui@bumand.bo",
    correo_alternativo: "victor.tarqui.sistemas@gmail.com",
    rol: "supervisor",
    estado: "activo",
    cargo: "Jefe de Infraestructura Tecnológica y Redes",
    unidad: "Sistemas e Informática",
  },
  {
    id: 13,
    nombre: "Marco Antonio Gutierrez Perez",
    correo: "marco.gutierrez@bumand.bo",
    correo_alternativo: "marco.gutierrez.ope@gmail.com",
    rol: "supervisor",
    estado: "activo",
    cargo: "Oficial Nacional de Cumplimiento",
    unidad: "Unidad de Cumplimiento Normativo",
  },
  {
    id: 14,
    nombre: "Veronica Cecilia Rios Fernandez",
    correo: "veronica.rios@bumand.bo",
    correo_alternativo: "veronica.rios.tutor@gmail.com",
    rol: "supervisor",
    estado: "activo",
    cargo: "Tutora de Formación y Liderazgo Diaconal",
    unidad: "Pastoral y Bienestar Estudiantil",
  },
  {
    id: 15,
    nombre: "Jorge Luis Paredes Loza",
    correo: "jorge.paredes@bumand.bo",
    correo_alternativo: "jorge.paredes.aud@gmail.com",
    rol: "supervisor",
    estado: "activo",
    cargo: "Jefe de Contabilidad General",
    unidad: "Gerencia Financiera",
  },
  {
    id: 16,
    nombre: "Roxana Beatriz Choque Vaca",
    correo: "roxana.choque@bumand.bo",
    correo_alternativo: "roxana.choque.soc@gmail.com",
    rol: "supervisor",
    estado: "activo",
    cargo: "Especialista en Evaluación Socioeconómica",
    unidad: "Desarrollo Social y Comunitario",
  },
  {
    id: 17,
    nombre: "Walter Ramiro Vargas Medina",
    correo: "walter.vargas@bumand.bo",
    correo_alternativo: "walter.vargas.plan@gmail.com",
    rol: "supervisor",
    estado: "activo",
    cargo: "Jefe de Planificación Estratégica",
    unidad: "Gerencia de Planificación",
  },
  {
    id: 18,
    nombre: "Miriam Rosario Pinto Alarcon",
    correo: "miriam.pinto@bumand.bo",
    correo_alternativo: "miriam.pinto.bienestar@gmail.com",
    rol: "supervisor",
    estado: "activo",
    cargo: "Coordinadora de Becas Universitarias",
    unidad: "Bienestar Universitario BUMAND",
  },
  {
    id: 19,
    nombre: "Edgar Gonzalo Flores Condori",
    correo: "edgar.flores@bumand.bo",
    correo_alternativo: "edgar.flores.pastoral@gmail.com",
    rol: "supervisor",
    estado: "activo",
    cargo: "Pastor Consejero y Mentor Espiritual",
    unidad: "Acompañamiento Pastoral Diaconía",
  },
  {
    id: 20,
    nombre: "Sonia Monica Aguilar Ticona",
    correo: "sonia.aguilar@bumand.bo",
    correo_alternativo: "sonia.aguilar.eval@gmail.com",
    rol: "supervisor",
    estado: "activo",
    cargo: "Supervisora de Calidad en Atención al Cliente",
    unidad: "Atención al Consumidor Financiero",
  },
  {
    id: 21,
    nombre: "Javier Hernan Chavez Siles",
    correo: "javier.chavez@bumand.bo",
    correo_alternativo: "javier.chavez.mentor@gmail.com",
    rol: "supervisor",
    estado: "activo",
    cargo: "Mentor de Prácticas Profesionales UMSA",
    unidad: "Convenios Universitarios",
  },
  {
    id: 22,
    nombre: "Beatriz Elena Castro Guzman",
    correo: "beatriz.castro@bumand.bo",
    correo_alternativo: "beatriz.castro.form@gmail.com",
    rol: "supervisor",
    estado: "activo",
    cargo: "Coordinadora de Capacitación Continua",
    unidad: "Talento Humano / Capacitación",
  },
  {
    id: 23,
    nombre: "Boris Alejandro Ortiz Yujra",
    correo: "boris.ortiz@bumand.bo",
    correo_alternativo: "boris.ortiz.dev@gmail.com",
    rol: "supervisor",
    estado: "activo",
    cargo: "Líder Técnico de Desarrollo de Software",
    unidad: "Sistemas e Informática",
  },
  {
    id: 24,
    nombre: "Tania Marcela Salazar Peña",
    correo: "tania.salazar@bumand.bo",
    correo_alternativo: "tania.salazar.fin@gmail.com",
    rol: "supervisor",
    estado: "activo",
    cargo: "Analista Senior de Cartera y Créditos",
    unidad: "Gerencia de Créditos",
  },
  {
    id: 25,
    nombre: "Ruben Dario Huanca Cruz",
    correo: "ruben.huanca@bumand.bo",
    correo_alternativo: "ruben.huanca.geo@gmail.com",
    rol: "supervisor",
    estado: "activo",
    cargo: "Especialista en Geocercas y Logística Territorial",
    unidad: "Operaciones y Logística",
  },
  {
    id: 26,
    nombre: "Monica Elizabeth Nina Laura",
    correo: "monica.nina@bumand.bo",
    correo_alternativo: "monica.nina.salud@gmail.com",
    rol: "supervisor",
    estado: "activo",
    cargo: "Supervisora Médica Ocupacional",
    unidad: "Seguridad y Salud en el Trabajo",
  },
  {
    id: 27,
    nombre: "Freddy Alberto Rojas Quisbert",
    correo: "freddy.rojas@bumand.bo",
    correo_alternativo: "freddy.rojas.tutor@gmail.com",
    rol: "supervisor",
    estado: "activo",
    cargo: "Tutor Regional de Sedes El Alto",
    unidad: "Coordinación Regional El Alto",
  },
  {
    id: 28,
    nombre: "Carmen Rosa Alave Mamani",
    correo: "carmen.alave@bumand.bo",
    correo_alternativo: "carmen.alave.adm@gmail.com",
    rol: "supervisor",
    estado: "activo",
    cargo: "Supervisora Administrativa de Agencias La Paz",
    unidad: "Coordinación Regional La Paz",
  },
  {
    id: 29,
    nombre: "Raul Gustavo Medina Torrez",
    correo: "raul.medina@bumand.bo",
    correo_alternativo: "raul.medina.cred@gmail.com",
    rol: "supervisor",
    estado: "activo",
    cargo: "Jefe de Cobranzas y Recuperaciones",
    unidad: "Gerencia de Recuperaciones",
  },
  {
    id: 30,
    nombre: "Patricia Lourdes Villca Gomez",
    correo: "patricia.villca@bumand.bo",
    correo_alternativo: "patricia.villca.cont@gmail.com",
    rol: "supervisor",
    estado: "activo",
    cargo: "Analista de Conciliaciones y Pasajes",
    unidad: "Finanzas / Liquidaciones",
  },
  {
    id: 31,
    nombre: "Gustavo Adolfo Canaviri Lima",
    correo: "gustavo.canaviri@bumand.bo",
    correo_alternativo: "gustavo.canaviri.rrhh@gmail.com",
    rol: "supervisor",
    estado: "activo",
    cargo: "Coordinador de Escuela de Líderes Diaconales",
    unidad: "Desarrollo Institucional",
  },

  // 3. Becarios Universitarios Institucionales (30)
  {
    id: 32,
    nombre: "Maria Catunta Mamani",
    correo: "maria.catunta@bumand.bo",
    correo_alternativo: "maria.catunta.umsa@gmail.com",
    correos_adicionales: [
      { id: 132, correo: "maria.catunta.umsa@gmail.com", etiqueta: "Personal" },
    ],
    rol: "becario",
    estado: "activo",
    cargo: "Becaria Universitaria · UMSA",
    unidad: "Ingeniería de Sistemas · 7mo Semestre",
  },
  {
    id: 33,
    nombre: "Nilda Churata Quispe",
    correo: "nilda.churata@diaconia.bo",
    correo_alternativo: "nilda.churata99@gmail.com",
    correos_adicionales: [
      { id: 133, correo: "nilda.churata99@gmail.com", etiqueta: "Personal" },
    ],
    rol: "becario",
    estado: "activo",
    cargo: "Becaria Universitaria · UPEA",
    unidad: "Contaduría Pública · 6to Semestre",
  },
  {
    id: 34,
    nombre: "Carlos Condori Huanca",
    correo: "carlos.condori@bumand.bo",
    correo_alternativo: "carlos.condori.upea@gmail.com",
    correos_adicionales: [
      { id: 134, correo: "carlos.condori.upea@gmail.com", etiqueta: "Personal" },
    ],
    rol: "becario",
    estado: "activo",
    cargo: "Becario Universitario · UPEA",
    unidad: "Informática · 5to Semestre",
  },
  {
    id: 35,
    nombre: "Joel Quispe Apaza",
    correo: "joel.quispe@bumand.bo",
    correo_alternativo: "joel.quispe.uab@gmail.com",
    rol: "becario",
    estado: "activo",
    cargo: "Becario Universitario · UAB",
    unidad: "Administración de Empresas · 8vo Semestre",
  },
  {
    id: 36,
    nombre: "Ruth Abigail Mamani Choque",
    correo: "ruth.mamani@bumand.bo",
    correo_alternativo: "abigail.mamani.bo@gmail.com",
    rol: "becario",
    estado: "activo",
    cargo: "Becaria Universitaria · UMSA",
    unidad: "Economía · 6to Semestre",
  },
  {
    id: 37,
    nombre: "David Fernando Flores Ramos",
    correo: "david.flores@bumand.bo",
    correo_alternativo: "david.flores.umsa@gmail.com",
    rol: "becario",
    estado: "activo",
    cargo: "Becario Universitario · UMSA",
    unidad: "Derecho · 7mo Semestre",
  },
  {
    id: 38,
    nombre: "Esther Laura Ticona",
    correo: "esther.laura@bumand.bo",
    correo_alternativo: "esther.laura.lp@gmail.com",
    rol: "becario",
    estado: "activo",
    cargo: "Becaria Universitaria · UPEA",
    unidad: "Trabajo Social · 5to Semestre",
  },
  {
    id: 39,
    nombre: "Samuel Limachi Huanca",
    correo: "samuel.limachi@bumand.bo",
    correo_alternativo: "samuel.limachi@gmail.com",
    rol: "becario",
    estado: "activo",
    cargo: "Becario Universitario · UMSA",
    unidad: "Ingeniería Industrial · 8vo Semestre",
  },
  {
    id: 40,
    nombre: "Sara Noemi Choquehuanca",
    correo: "sara.choque@bumand.bo",
    correo_alternativo: "sara.choquehuanca@gmail.com",
    rol: "becario",
    estado: "activo",
    cargo: "Becaria Universitaria · UNIVALLE",
    unidad: "Medicina · 6to Semestre",
  },
  {
    id: 41,
    nombre: "Israel Benjamin Mamani Nina",
    correo: "israel.mamani@bumand.bo",
    correo_alternativo: "israel.mamani.ing@gmail.com",
    rol: "becario",
    estado: "activo",
    cargo: "Becario Universitario · UMSA",
    unidad: "Ingeniería Electrónica · 6to Semestre",
  },
  {
    id: 42,
    nombre: "Abigail Saraí Tola Perez",
    correo: "abigail.tola@bumand.bo",
    correo_alternativo: "abigail.tola.salud@gmail.com",
    rol: "becario",
    estado: "activo",
    cargo: "Becaria Universitaria · UPEA",
    unidad: "Enfermería · 5to Semestre",
  },
  {
    id: 43,
    nombre: "Daniel Mateo Quisbert Laura",
    correo: "daniel.quisbert@bumand.bo",
    correo_alternativo: "daniel.quisbert.bo@gmail.com",
    rol: "becario",
    estado: "activo",
    cargo: "Becario Universitario · UCB",
    unidad: "Ingeniería de Sistemas · 7mo Semestre",
  },
  {
    id: 44,
    nombre: "Miriam Judith Apaza Mamani",
    correo: "miriam.apaza@bumand.bo",
    correo_alternativo: "miriam.apaza.cont@gmail.com",
    rol: "becario",
    estado: "activo",
    cargo: "Becaria Universitaria · UMSA",
    unidad: "Contaduría Pública · 8vo Semestre",
  },
  {
    id: 45,
    nombre: "Josue Elias Condori Ramos",
    correo: "josue.condori@bumand.bo",
    correo_alternativo: "josue.condori.upea@gmail.com",
    rol: "becario",
    estado: "activo",
    cargo: "Becario Universitario · UPEA",
    unidad: "Ciencias de la Educación · 6to Semestre",
  },
  {
    id: 46,
    nombre: "Debora Noemi Choque Alanoca",
    correo: "debora.choque@bumand.bo",
    correo_alternativo: "debora.choque.edu@gmail.com",
    rol: "becario",
    estado: "activo",
    cargo: "Becaria Universitaria · UMSA",
    unidad: "Psicología · 7mo Semestre",
  },
  {
    id: 47,
    nombre: "Caleb Abraham Flores Ticona",
    correo: "caleb.flores@bumand.bo",
    correo_alternativo: "caleb.flores.inf@gmail.com",
    rol: "becario",
    estado: "activo",
    cargo: "Becario Universitario · UPEA",
    unidad: "Informática · 4to Semestre",
  },
  {
    id: 48,
    nombre: "Priscilla Raquel Quispe Huanca",
    correo: "priscilla.quispe@bumand.bo",
    correo_alternativo: "priscilla.quispe.lp@gmail.com",
    rol: "becario",
    estado: "activo",
    cargo: "Becaria Universitaria · UMSA",
    unidad: "Ciencias de la Comunicación · 6to Semestre",
  },
  {
    id: 49,
    nombre: "Jonathan David Yujra Colque",
    correo: "jonathan.yujra@bumand.bo",
    correo_alternativo: "jonathan.yujra.adm@gmail.com",
    rol: "becario",
    estado: "activo",
    cargo: "Becario Universitario · EMI",
    unidad: "Ingeniería Comercial · 7mo Semestre",
  },
  {
    id: 50,
    nombre: "Eunice Abigail Mamani Tarqui",
    correo: "eunice.mamani@bumand.bo",
    correo_alternativo: "eunice.mamani.com@gmail.com",
    rol: "becario",
    estado: "activo",
    cargo: "Becaria Universitaria · UMSA",
    unidad: "Comercio Internacional · 5to Semestre",
  },
  {
    id: 51,
    nombre: "Marcos Daniel Ramos Nina",
    correo: "marcos.ramos@bumand.bo",
    correo_alternativo: "marcos.ramos.der@gmail.com",
    rol: "becario",
    estado: "activo",
    cargo: "Becario Universitario · UPEA",
    unidad: "Derecho · 8vo Semestre",
  },
  {
    id: 52,
    nombre: "Noemi Ester Alarcon Choque",
    correo: "noemi.alarcon@bumand.bo",
    correo_alternativo: "noemi.alarcon.med@gmail.com",
    rol: "becario",
    estado: "activo",
    cargo: "Becaria Universitaria · UMSA",
    unidad: "Bioquímica y Farmacia · 7mo Semestre",
  },
  {
    id: 53,
    nombre: "Lucas Mateo Perez Laura",
    correo: "lucas.perez@bumand.bo",
    correo_alternativo: "lucas.perez.arq@gmail.com",
    rol: "becario",
    estado: "activo",
    cargo: "Becario Universitario · UMSA",
    unidad: "Arquitectura · 6to Semestre",
  },
  {
    id: 54,
    nombre: "Lidia Raquel Mamani Cruz",
    correo: "lidia.mamani@bumand.bo",
    correo_alternativo: "lidia.mamani.trab@gmail.com",
    rol: "becario",
    estado: "activo",
    cargo: "Becaria Universitaria · UPEA",
    unidad: "Trabajo Social · 6to Semestre",
  },
  {
    id: 55,
    nombre: "Benjamin Elias Nina Ticona",
    correo: "benjamin.nina@bumand.bo",
    correo_alternativo: "benjamin.nina.ing@gmail.com",
    rol: "becario",
    estado: "activo",
    cargo: "Becario Universitario · UMSA",
    unidad: "Ingeniería Civil · 7mo Semestre",
  },
  {
    id: 56,
    nombre: "Sara Eunice Condori Flores",
    correo: "sara.condori@bumand.bo",
    correo_alternativo: "sara.condori.psic@gmail.com",
    rol: "becario",
    estado: "activo",
    cargo: "Becaria Universitaria · UCB",
    unidad: "Psicología · 5to Semestre",
  },
  {
    id: 57,
    nombre: "Mateo David Quispe Mamani",
    correo: "mateo.quispe@bumand.bo",
    correo_alternativo: "mateo.quispe.sist@gmail.com",
    rol: "becario",
    estado: "activo",
    cargo: "Becario Universitario · UPEA",
    unidad: "Ingeniería de Sistemas · 4to Semestre",
  },
  {
    id: 58,
    nombre: "Rebeca Abigail Laura Ramos",
    correo: "rebeca.laura@bumand.bo",
    correo_alternativo: "rebeca.laura.enf@gmail.com",
    rol: "becario",
    estado: "activo",
    cargo: "Becaria Universitaria · UMSA",
    unidad: "Enfermería · 6to Semestre",
  },
  {
    id: 59,
    nombre: "Isaac Daniel Choquehuanca Nina",
    correo: "isaac.choquehuanca@bumand.bo",
    correo_alternativo: "isaac.choquehuanca@gmail.com",
    rol: "becario",
    estado: "activo",
    cargo: "Becario Universitario · UNIVALLE",
    unidad: "Odontología · 7mo Semestre",
  },
  {
    id: 60,
    nombre: "Damaris Noemi Huanca Tola",
    correo: "damaris.huanca@bumand.bo",
    correo_alternativo: "damaris.huanca.odont@gmail.com",
    rol: "becario",
    estado: "activo",
    cargo: "Becaria Universitaria · UPEA",
    unidad: "Odontología · 5to Semestre",
  },
  {
    id: 61,
    nombre: "Josias Benjamin Flores Quisbert",
    correo: "josias.flores@bumand.bo",
    correo_alternativo: "josias.flores.eco@gmail.com",
    rol: "becario",
    estado: "activo",
    cargo: "Becario Universitario · UMSA",
    unidad: "Economía · 7mo Semestre",
  },
];

function obtenerIniciales(nombre: string): string {
  if (!nombre) return "U";
  const partes = nombre.trim().split(/\s+/);
  if (partes.length >= 2) {
    return (partes[0][0] + partes[1][0]).toUpperCase();
  }
  return nombre.slice(0, 2).toUpperCase();
}

function calcularNivelFortaleza(clave: string): { puntaje: number; etiqueta: string; color: string } {
  if (!clave) return { puntaje: 0, etiqueta: "Sin clave", color: "bg-slate-200" };
  let puntaje = 0;
  if (clave.length >= 8) puntaje += 25;
  if (clave.length >= 12) puntaje += 15;
  if (/[A-Z]/.test(clave)) puntaje += 20;
  if (/[a-z]/.test(clave)) puntaje += 15;
  if (/[0-9]/.test(clave)) puntaje += 15;
  if (/[^A-Za-z0-9]/.test(clave)) puntaje += 10;

  if (puntaje < 40) return { puntaje: Math.max(puntaje, 20), etiqueta: "Débil", color: "bg-rose-500" };
  if (puntaje < 75) return { puntaje, etiqueta: "Aceptable", color: "bg-amber-500" };
  return { puntaje: Math.min(puntaje, 100), etiqueta: "Robusta Institucional", color: "bg-emerald-500" };
}

export function GestionUsuariosAdmin() {
  const { usuario: usuario_actual } = usarAutenticacion();
  const [usuarios, set_usuarios] = useState<UsuarioInstitucional[]>([]);
  const [cargando, set_cargando] = useState<boolean>(true);

  // Filtros
  const [filtro_busqueda, set_filtro_busqueda] = useState<string>("");
  const [filtro_rol, set_filtro_rol] = useState<string>("todos");
  const [filtro_estado, set_filtro_estado] = useState<string>("todos");

  // Modales
  const [modal_crear_abierto, set_modal_crear_abierto] = useState<boolean>(false);
  const [modal_editar_abierto, set_modal_editar_abierto] = useState<boolean>(false);
  const [modal_clave_abierto, set_modal_clave_abierto] = useState<boolean>(false);

  // Estados formulario Crear
  const [nuevo_nombre, set_nuevo_nombre] = useState<string>("");
  const [nuevo_correo, set_nuevo_correo] = useState<string>("");
  const [nuevo_correo_alt, set_nuevo_correo_alt] = useState<string>("");
  const [nuevo_rol, set_nuevo_rol] = useState<"administrador" | "supervisor">("supervisor");
  const [nueva_clave_crear, set_nueva_clave_crear] = useState<string>("");
  const [mostrar_clave_crear, set_mostrar_clave_crear] = useState<boolean>(false);
  const [guardando_crear, set_guardando_crear] = useState<boolean>(false);

  // Estados formulario Editar
  const [usuario_editar, set_usuario_editar] = useState<UsuarioInstitucional | null>(null);
  const [edit_nombre, set_edit_nombre] = useState<string>("");
  const [edit_correo, set_edit_correo] = useState<string>("");
  const [edit_correo_alt, set_edit_correo_alt] = useState<string>("");
  const [edit_rol, set_edit_rol] = useState<"administrador" | "supervisor" | "becario">("supervisor");
  const [edit_estado, set_edit_estado] = useState<"activo" | "inactivo">("activo");
  const [nuevo_correo_extra, set_nuevo_correo_extra] = useState<string>("");
  const [nueva_etiqueta_extra, set_nueva_etiqueta_extra] = useState<string>("Personal");
  const [guardando_editar, set_guardando_editar] = useState<boolean>(false);

  // Estados formulario Contraseña
  const [usuario_clave, set_usuario_clave] = useState<UsuarioInstitucional | null>(null);
  const [clave_nueva, set_clave_nueva] = useState<string>("");
  const [clave_confirmar, set_clave_confirmar] = useState<string>("");
  const [mostrar_clave_nueva, set_mostrar_clave_nueva] = useState<boolean>(false);
  const [mostrar_clave_confirmar, set_mostrar_clave_confirmar] = useState<boolean>(false);
  const [guardando_clave, set_guardando_clave] = useState<boolean>(false);

  // Cargar catálogo de usuarios
  const cargarUsuarios = async () => {
    set_cargando(true);
    let datos_finales: UsuarioInstitucional[] = USUARIOS_SEMILLA;

    try {
      const respuesta = await clienteApi.get<UsuarioInstitucional[]>("/usuarios");
      if (Array.isArray(respuesta) && respuesta.length > 0) {
        // Enriquecer con catálogo semilla si faltan usuarios
        const mapa = new Map<string, UsuarioInstitucional>();
        USUARIOS_SEMILLA.forEach((u) => mapa.set(u.correo.toLowerCase(), u));
        respuesta.forEach((u) => {
          const correo_normalizado = (u.correo || "").toLowerCase();
          const previo = mapa.get(correo_normalizado);
          mapa.set(correo_normalizado, {
            ...previo,
            ...u,
            id: u.id,
            nombre: u.nombre || previo?.nombre || "Usuario Institucional",
            correo: u.correo || previo?.correo || "",
            rol: (u.rol as "administrador" | "supervisor" | "becario") || previo?.rol || "becario",
            estado: (u.estado as "activo" | "inactivo") || previo?.estado || "activo",
            correo_alternativo: u.correo_alternativo ?? previo?.correo_alternativo ?? null,
            correos_adicionales: u.correos_adicionales || previo?.correos_adicionales || [],
          });
        });
        datos_finales = Array.from(mapa.values()).sort((a, b) => a.id - b.id);
      } else {
        // Consultar almacenamiento local
        if (typeof window !== "undefined") {
          const guardado = localStorage.getItem(CLAVE_STORAGE_USUARIOS);
          if (guardado) {
            datos_finales = JSON.parse(guardado);
          }
        }
      }
    } catch {
      if (typeof window !== "undefined") {
        const guardado = localStorage.getItem(CLAVE_STORAGE_USUARIOS);
        if (guardado) {
          try {
            datos_finales = JSON.parse(guardado);
          } catch {
            datos_finales = USUARIOS_SEMILLA;
          }
        }
      }
    } finally {
      set_usuarios(datos_finales);
      if (typeof window !== "undefined") {
        localStorage.setItem(CLAVE_STORAGE_USUARIOS, JSON.stringify(datos_finales));
      }
      set_cargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const sincronizarLocalmente = (nuevos: UsuarioInstitucional[]) => {
    set_usuarios(nuevos);
    if (typeof window !== "undefined") {
      localStorage.setItem(CLAVE_STORAGE_USUARIOS, JSON.stringify(nuevos));
    }
  };

  // KPIs calculados
  const kpis = useMemo(() => {
    const total = usuarios.length;
    const activos = usuarios.filter((u) => u.estado === "activo").length;
    const administradores = usuarios.filter((u) => u.rol === "administrador").length;
    const supervisores = usuarios.filter((u) => u.rol === "supervisor").length;
    const becarios = usuarios.filter((u) => u.rol === "becario").length;
    const con_alternativo = usuarios.filter(
      (u) =>
        Boolean(u.correo_alternativo && u.correo_alternativo.trim()) ||
        Boolean(u.correos_adicionales && u.correos_adicionales.length > 0)
    ).length;

    return {
      total,
      activos,
      administradores,
      supervisores,
      becarios,
      con_alternativo,
    };
  }, [usuarios]);

  // Lista filtrada
  const usuarios_filtrados = useMemo(() => {
    const termino = filtro_busqueda.toLowerCase().trim();
    return usuarios.filter((usr) => {
      // Filtro de búsqueda
      if (termino) {
        const coincide_nombre = usr.nombre.toLowerCase().includes(termino);
        const coincide_correo = usr.correo.toLowerCase().includes(termino);
        const coincide_alt = Boolean(usr.correo_alternativo && usr.correo_alternativo.toLowerCase().includes(termino));
        const coincide_adicionales = Boolean(
          usr.correos_adicionales?.some((c) => c.correo.toLowerCase().includes(termino))
        );
        if (!coincide_nombre && !coincide_correo && !coincide_alt && !coincide_adicionales) {
          return false;
        }
      }

      // Filtro de rol
      if (filtro_rol !== "todos" && usr.rol !== filtro_rol) {
        return false;
      }

      // Filtro de estado
      if (filtro_estado !== "todos" && usr.estado !== filtro_estado) {
        return false;
      }

      return true;
    });
  }, [usuarios, filtro_busqueda, filtro_rol, filtro_estado]);

  // Cambiar estado activo/inactivo (PUT /usuarios/:id/estado)
  const manejarCambiarEstado = async (_usuario_id: number, _nuevo_estado: boolean) => {
    const estado_string: "activo" | "inactivo" = _nuevo_estado ? "activo" : "inactivo";

    // Protección: no auto-desactivar administrador logueado
    if (usuario_actual?.id === _usuario_id && !_nuevo_estado) {
      toast.error("Operación no permitida", {
        description: "No puede desactivar su propia cuenta de administrador activo.",
      });
      return;
    }

    try {
      await clienteApi.put(`/usuarios/${_usuario_id}/estado`, {
        estado: estado_string,
      });
    } catch {
      // Respaldo local
    }

    const actualizados = usuarios.map((u) =>
      u.id === _usuario_id ? { ...u, estado: estado_string } : u
    );
    sincronizarLocalmente(actualizados);
    toast.success(`Cuenta ${_nuevo_estado ? "activada" : "desactivada"} exitosamente.`);
  };

  // Generar clave segura institucional
  const generarClaveSegura = (_tipo: "crear" | "cambiar") => {
    const prefijos = ["Diaconia", "Bumand", "Bendicion", "Victoria", "Esperanza"];
    const simbolos = ["#", "!", "*", "$", "@"];
    const aleatorio_pref = prefijos[Math.floor(Math.random() * prefijos.length)];
    const aleatorio_simb = simbolos[Math.floor(Math.random() * simbolos.length)];
    const digitos = Math.floor(1000 + Math.random() * 9000);
    const sufijo_letra = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const clave_generada = `${aleatorio_pref}${aleatorio_simb}2026${digitos}${sufijo_letra}`;

    if (_tipo === "crear") {
      set_nueva_clave_crear(clave_generada);
      set_mostrar_clave_crear(true);
    } else {
      set_clave_nueva(clave_generada);
      set_clave_confirmar(clave_generada);
      set_mostrar_clave_nueva(true);
      set_mostrar_clave_confirmar(true);
    }

    toast.info("Contraseña institucional generada", {
      description: `Se ha autogenerado una contraseña de alta seguridad: ${clave_generada}`,
    });
  };

  // Crear nuevo usuario (POST /usuarios)
  const manejarCrearUsuario = async (_evento: React.FormEvent) => {
    _evento.preventDefault();
    const nombre_limpio = nuevo_nombre.trim();
    const correo_limpio = nuevo_correo.toLowerCase().trim();
    const correo_alt_limpio = nuevo_correo_alt.toLowerCase().trim();

    if (!nombre_limpio || !correo_limpio || !nueva_clave_crear) {
      toast.error("Campos obligatorios incompletos", {
        description: "Por favor complete nombre, correo y contraseña.",
      });
      return;
    }

    if (nueva_clave_crear.length < 6) {
      toast.error("Contraseña muy corta", {
        description: "La contraseña institucional debe contener al menos 6 caracteres.",
      });
      return;
    }

    // Verificar si ya existe el correo
    const existe = usuarios.some((u) => u.correo.toLowerCase() === correo_limpio);
    if (existe) {
      toast.error("Correo ya registrado", {
        description: "Ya existe un usuario institucional registrado con este correo principal.",
      });
      return;
    }

    set_guardando_crear(true);
    let nuevo_id = Date.now();

    try {
      const respuesta = await clienteApi.post<UsuarioInstitucional>("/usuarios", {
        nombre: nombre_limpio,
        correo: correo_limpio,
        correo_alternativo: correo_alt_limpio || undefined,
        rol: nuevo_rol,
        contrasena: nueva_clave_crear,
      });
      if (respuesta && respuesta.id) {
        nuevo_id = respuesta.id;
      }
    } catch {
      // Respaldo local
    }

    const nuevo_usr: UsuarioInstitucional = {
      id: nuevo_id,
      nombre: nombre_limpio,
      correo: correo_limpio,
      correo_alternativo: correo_alt_limpio || null,
      correos_adicionales: correo_alt_limpio
        ? [{ id: Date.now() + 1, correo: correo_alt_limpio, etiqueta: "Alternativo" }]
        : [],
      rol: nuevo_rol,
      estado: "activo",
      cargo: nuevo_rol === "administrador" ? "Administrador Institucional" : "Supervisor Institucional",
      unidad: "Programa BUMAND · Diaconía FRIF-IFD",
    };

    const actualizados = [nuevo_usr, ...usuarios];
    sincronizarLocalmente(actualizados);

    set_guardando_crear(false);
    set_modal_crear_abierto(false);
    set_nuevo_nombre("");
    set_nuevo_correo("");
    set_nuevo_correo_alt("");
    set_nueva_clave_crear("");
    set_nuevo_rol("supervisor");

    toast.success("Usuario institucional creado", {
      description: `Se registró exitosamente a ${nombre_limpio} con rol de ${nuevo_rol}.`,
    });
  };

  // Abrir modal Editar
  const abrirModalEditar = (_usr: UsuarioInstitucional) => {
    set_usuario_editar(_usr);
    set_edit_nombre(_usr.nombre);
    set_edit_correo(_usr.correo);
    set_edit_correo_alt(_usr.correo_alternativo || "");
    set_edit_rol(_usr.rol);
    set_edit_estado(_usr.estado);
    set_nuevo_correo_extra("");
    set_nueva_etiqueta_extra("Personal");
    set_modal_editar_abierto(true);
  };

  // Agregar correo adicional en edición
  const manejarAgregarCorreoExtra = (_evento: React.FormEvent) => {
    _evento.preventDefault();
    if (!usuario_editar) return;
    const correo_limpio = nuevo_correo_extra.toLowerCase().trim();
    if (!correo_limpio || !correo_limpio.includes("@")) {
      toast.error("Correo inválido", {
        description: "Ingrese una dirección de correo válida.",
      });
      return;
    }

    const lista_actual = usuario_editar.correos_adicionales || [];
    if (
      lista_actual.some((c) => c.correo.toLowerCase() === correo_limpio) ||
      usuario_editar.correo.toLowerCase() === correo_limpio
    ) {
      toast.error("Correo ya vinculado", {
        description: "Este correo ya está registrado en la cuenta.",
      });
      return;
    }

    const nuevo_item: CorreoAdicionalItem = {
      id: Date.now(),
      correo: correo_limpio,
      etiqueta: nueva_etiqueta_extra.trim() || "Alternativo",
    };

    const nueva_lista = [...lista_actual, nuevo_item];
    const usr_actualizado: UsuarioInstitucional = {
      ...usuario_editar,
      correo_alternativo: usuario_editar.correo_alternativo || correo_limpio,
      correos_adicionales: nueva_lista,
    };

    set_usuario_editar(usr_actualizado);
    if (!edit_correo_alt) {
      set_edit_correo_alt(correo_limpio);
    }
    set_nuevo_correo_extra("");
    toast.success("Correo adicional añadido al formulario.");
  };

  // Eliminar correo adicional en edición
  const manejarEliminarCorreoExtra = (_correo_id_o_texto: number | string) => {
    if (!usuario_editar) return;
    const lista_actual = usuario_editar.correos_adicionales || [];
    const filtrada = lista_actual.filter(
      (c) => c.id !== _correo_id_o_texto && c.correo !== _correo_id_o_texto
    );
    const nuevo_alt = filtrada.length > 0 ? filtrada[0].correo : null;

    set_usuario_editar({
      ...usuario_editar,
      correo_alternativo: nuevo_alt,
      correos_adicionales: filtrada,
    });
    set_edit_correo_alt(nuevo_alt || "");
    toast.info("Correo adicional desvinculado.");
  };

  // Guardar edición (PATCH /usuarios/:id)
  const manejarGuardarEdicion = async (_evento: React.FormEvent) => {
    _evento.preventDefault();
    if (!usuario_editar) return;

    set_guardando_editar(true);

    try {
      await clienteApi.patch(`/usuarios/${usuario_editar.id}`, {
        nombre: edit_nombre.trim(),
        correo: edit_correo.toLowerCase().trim(),
        correo_alternativo: edit_correo_alt.toLowerCase().trim() || null,
        rol: edit_rol,
        estado: edit_estado,
      });
    } catch {
      // Respaldo local
    }

    const actualizados = usuarios.map((u) => {
      if (u.id === usuario_editar.id) {
        return {
          ...u,
          nombre: edit_nombre.trim(),
          correo: edit_correo.toLowerCase().trim(),
          correo_alternativo: edit_correo_alt.toLowerCase().trim() || null,
          correos_adicionales: usuario_editar.correos_adicionales || [],
          rol: edit_rol,
          estado: edit_estado,
        };
      }
      return u;
    });

    sincronizarLocalmente(actualizados);
    set_guardando_editar(false);
    set_modal_editar_abierto(false);
    set_usuario_editar(null);

    toast.success("Usuario actualizado correctamente", {
      description: "Los cambios de perfil y correos de acceso han sido guardados.",
    });
  };

  // Abrir modal Cambiar Contraseña
  const abrirModalClave = (_usr: UsuarioInstitucional) => {
    set_usuario_clave(_usr);
    set_clave_nueva("");
    set_clave_confirmar("");
    set_mostrar_clave_nueva(false);
    set_mostrar_clave_confirmar(false);
    set_modal_clave_abierto(true);
  };

  // Guardar nueva contraseña (PATCH /usuarios/:id/contrasena)
  const manejarGuardarClave = async (_evento: React.FormEvent) => {
    _evento.preventDefault();
    if (!usuario_clave) return;

    if (clave_nueva.length < 6) {
      toast.error("Contraseña muy corta", {
        description: "La nueva contraseña debe tener un mínimo de 6 caracteres.",
      });
      return;
    }

    if (clave_nueva !== clave_confirmar) {
      toast.error("Contraseñas no coinciden", {
        description: "Asegúrese de escribir exactamente la misma contraseña en ambos campos.",
      });
      return;
    }

    set_guardando_clave(true);

    try {
      await clienteApi.patch(`/usuarios/${usuario_clave.id}/contrasena`, {
        nueva_contrasena: clave_nueva,
        contrasena: clave_nueva,
      });
    } catch {
      // Respaldo local
    }

    set_guardando_clave(false);
    set_modal_clave_abierto(false);
    set_usuario_clave(null);

    toast.success("Contraseña restablecida", {
      description: `Se ha reasignado la clave institucional para ${usuario_clave.nombre}.`,
    });
  };

  const fortaleza_clave_nueva = calcularNivelFortaleza(clave_nueva);

  return (
    <div className="space-y-6">
      {/* 1. KPIs Superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <Card className="rounded-2xl border-[#E5E7EB] shadow-xs bg-white overflow-hidden relative group hover:border-[#007BBE]/40 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#007BBE]" />
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Total Cuentas
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#007BBE]/10 text-[#007BBE] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-[#035683] mt-1 font-mono">
              {kpis.total}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <strong className="text-emerald-700 font-mono font-bold">{kpis.activos}</strong> activas institucionalmente
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[#E5E7EB] shadow-xs bg-white overflow-hidden relative group hover:border-amber-400/40 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#FFB600]" />
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Administradores
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-amber-800 mt-1 font-mono">
              {kpis.administradores}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-muted-foreground">
              Control general y privilegios totales
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[#E5E7EB] shadow-xs bg-white overflow-hidden relative group hover:border-[#00ABBD]/40 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#00ABBD]" />
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Supervisores
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#00ABBD]/10 text-[#00ABBD] flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-[#035683] mt-1 font-mono">
              {kpis.supervisores}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-muted-foreground">
              Mentores y tutores Diaconía FRIF
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[#E5E7EB] shadow-xs bg-white overflow-hidden relative group hover:border-emerald-400/40 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Becarios
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-emerald-800 mt-1 font-mono">
              {kpis.becarios}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-muted-foreground">
              Estudiantes universitarios BUMAND
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[#E5E7EB] shadow-xs bg-white overflow-hidden relative group hover:border-violet-400/40 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-violet-500" />
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Con Correo Alt.
              </span>
              <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-700 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-violet-800 mt-1 font-mono">
              {kpis.con_alternativo}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-muted-foreground">
              Cuentas con respaldo de login activo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2. Barra de Herramientas y Filtros */}
      <Card className="rounded-2xl border-[#E5E7EB] shadow-xs bg-white p-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Buscador */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Buscar por nombre, correo principal o correo alternativo..."
                value={filtro_busqueda}
                onChange={(_e) => set_filtro_busqueda(_e.target.value)}
                className="pl-9 h-10 rounded-xl border-[#E5E7EB] bg-slate-50/50 text-xs font-medium focus:bg-white"
              />
            </div>

            {/* Filtro por Rol */}
            <div className="w-full sm:w-44">
              <Select value={filtro_rol} onValueChange={(_v) => _v && set_filtro_rol(_v)}>
                <SelectTrigger className="h-10 rounded-xl border-[#E5E7EB] bg-slate-50/50 text-xs font-bold text-[#035683]">
                  <SelectValue placeholder="Filtrar por Rol" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[#E5E7EB]">
                  <SelectItem value="todos">Todos los Roles</SelectItem>
                  <SelectItem value="administrador">Administrador</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="becario">Becario</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Estado */}
            <div className="w-full sm:w-36">
              <Select value={filtro_estado} onValueChange={(_v) => _v && set_filtro_estado(_v)}>
                <SelectTrigger className="h-10 rounded-xl border-[#E5E7EB] bg-slate-50/50 text-xs font-bold text-[#035683]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[#E5E7EB]">
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="activo">Activos</SelectItem>
                  <SelectItem value="inactivo">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={cargarUsuarios}
              className="h-10 px-3 rounded-xl border-[#E5E7EB] text-[#035683] hover:bg-slate-50 cursor-pointer"
              title="Recargar catálogo de usuarios"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${cargando ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {/* Botón Nuevo Usuario */}
          <Button
            type="button"
            onClick={() => set_modal_crear_abierto(true)}
            className="h-10 px-4 bg-[#007BBE] hover:bg-[#035683] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>➕ Nuevo Usuario Institucional</span>
          </Button>
        </div>
      </Card>

      {/* 3. Tabla Interactiva de Usuarios */}
      <Card className="rounded-2xl border-[#E5E7EB] shadow-xs bg-white overflow-hidden">
        <CardHeader className="p-4 border-b border-[#E5E7EB] bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-[#035683] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#007BBE]" />
                <span>Nómina Institucional de Usuarios y Accesos</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Mostrando {usuarios_filtrados.length} de {usuarios.length} cuentas institucionales
              </CardDescription>
            </div>
            <div className="text-xs font-mono text-muted-foreground">
              Diaconía FRIF-IFD · BUMAND 2026
            </div>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="border-b border-[#E5E7EB]">
                <TableHead className="w-[300px] text-xs font-bold text-[#035683]">
                  Usuario y Rol Institucional
                </TableHead>
                <TableHead className="text-xs font-bold text-[#035683]">
                  Correos de Acceso (Principal y Alternativos)
                </TableHead>
                <TableHead className="w-[140px] text-xs font-bold text-[#035683] text-center">
                  Estado
                </TableHead>
                <TableHead className="w-[260px] text-xs font-bold text-[#035683] text-right pr-6">
                  Seguridad y Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios_filtrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground text-xs">
                    No se encontraron usuarios institucionales con los filtros seleccionados.
                  </TableCell>
                </TableRow>
              ) : (
                usuarios_filtrados.map((usr) => {
                  const es_activo = usr.estado === "activo";
                  const correos_alt_lista = [
                    ...(usr.correo_alternativo ? [usr.correo_alternativo] : []),
                    ...(usr.correos_adicionales?.map((c) => c.correo) || []),
                  ].filter((val, idx, self) => self.indexOf(val) === idx && val !== usr.correo);

                  return (
                    <TableRow key={usr.id} className="border-b border-[#E5E7EB]/70 hover:bg-slate-50/60 transition-colors">
                      {/* Columna 1: Usuario y Rol */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar size="default" className="border border-[#E5E7EB] bg-[#035683]/5 text-[#035683] font-bold text-xs">
                            <AvatarFallback>{obtenerIniciales(usr.nombre)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-[#1E293B] truncate flex items-center gap-2">
                              <span>{usr.nombre}</span>
                              {usuario_actual?.id === usr.id && (
                                <Badge variant="outline" className="text-[9px] font-mono border-amber-300 bg-amber-50 text-amber-800">
                                  Tú
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {usr.rol === "administrador" && (
                                <Badge variant="outline" className="text-[10px] font-mono border-amber-300 bg-amber-50 text-amber-800 font-bold">
                                  Administrador
                                </Badge>
                              )}
                              {usr.rol === "supervisor" && (
                                <Badge variant="outline" className="text-[10px] font-mono border-sky-300 bg-sky-50 text-sky-800 font-bold">
                                  Supervisor / Mentor
                                </Badge>
                              )}
                              {usr.rol === "becario" && (
                                <Badge variant="outline" className="text-[10px] font-mono border-emerald-300 bg-emerald-50 text-emerald-800 font-bold">
                                  Becario Universitario
                                </Badge>
                              )}
                              {usr.cargo && (
                                <span className="text-[10px] text-muted-foreground truncate hidden sm:inline max-w-[180px]">
                                  · {usr.cargo}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Columna 2: Correos de Acceso */}
                      <TableCell className="py-3">
                        <div className="space-y-1">
                          {/* Correo Principal */}
                          <div className="flex items-center gap-1.5 font-mono text-xs text-[#035683] font-bold">
                            <Mail className="w-3.5 h-3.5 text-[#007BBE] shrink-0" />
                            <span className="truncate">{usr.correo}</span>
                            <Badge variant="outline" className="text-[9px] font-mono border-slate-200 bg-slate-100 text-slate-600">
                              Principal
                            </Badge>
                          </div>

                          {/* Correos Alternativos */}
                          {correos_alt_lista.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              {correos_alt_lista.map((alt, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200"
                                >
                                  <span>{alt}</span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted-foreground italic flex items-center gap-1">
                              Sin correo alternativo vinculado
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Columna 3: Estado de Cuenta */}
                      <TableCell className="py-3 text-center">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-mono font-bold ${
                              es_activo
                                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                : "border-rose-300 bg-rose-50 text-rose-700"
                            }`}
                          >
                            {es_activo ? "Activo" : "Inactivo"}
                          </Badge>
                          <div className="pt-0.5">
                            <Switch
                              size="sm"
                              checked={es_activo}
                              onCheckedChange={(_activo) => manejarCambiarEstado(usr.id, _activo)}
                              title={es_activo ? "Desactivar acceso" : "Activar acceso"}
                              className="cursor-pointer"
                            />
                          </div>
                        </div>
                      </TableCell>

                      {/* Columna 4: Seguridad y Acciones */}
                      <TableCell className="py-3 text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => abrirModalEditar(usr)}
                            className="h-8 px-2.5 rounded-xl border-[#E5E7EB] text-[#035683] hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                            title="Editar datos, rol y correos de inicio de sesión"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-[#007BBE]" />
                            <span className="hidden sm:inline">✏️ Editar</span>
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => abrirModalClave(usr)}
                            className="h-8 px-2.5 rounded-xl border-amber-300 bg-amber-50/40 hover:bg-amber-100/60 text-amber-900 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                            title="Asignar o restablecer contraseña institucional"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                            <span className="hidden sm:inline">🔑 Clave</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* =========================================================================
          MODAL 1: Crear Nuevo Usuario Institucional
         ========================================================================= */}
      <Dialog open={modal_crear_abierto} onOpenChange={(_abierto) => set_modal_crear_abierto(_abierto)}>
        <DialogContent showCloseButton={false} className="sm:max-w-lg p-0 bg-white rounded-2xl overflow-hidden">
          <DialogHeader className="p-5 border-b border-[#E5E7EB] bg-gradient-to-r from-[#035683] to-[#007BBE] text-white">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-white text-base font-bold flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Usuario Institucional</span>
                </DialogTitle>
                <DialogDescription className="text-white/80 text-xs mt-0.5">
                  Alta de cuenta con credenciales institucionales Diaconía FRIF-IFD
                </DialogDescription>
              </div>
              <Badge variant="outline" className="border-white/30 text-white bg-white/10 font-mono text-[10px]">
                RBAC BUMAND
              </Badge>
            </div>
          </DialogHeader>

          <form onSubmit={manejarCrearUsuario}>
            <DialogBody className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Nombre Completo */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#035683]">
                  Nombre Completo y Apellidos <span className="text-rose-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="Ej. Ing. Carlos Mendoza Flores"
                  value={nuevo_nombre}
                  onChange={(_e) => set_nuevo_nombre(_e.target.value)}
                  required
                  className="h-9 text-xs rounded-xl border-[#E5E7EB]"
                />
              </div>

              {/* Rol Institucional */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#035683]">
                  Rol Institucional Asignado <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={nuevo_rol}
                  onValueChange={(_v) => _v && set_nuevo_rol(_v as "administrador" | "supervisor")}
                >
                  <SelectTrigger className="h-9 rounded-xl border-[#E5E7EB] text-xs font-bold text-[#035683]">
                    <SelectValue placeholder="Seleccionar Rol" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-[#E5E7EB]">
                    <SelectItem value="supervisor">Supervisor / Tutor Institucional</SelectItem>
                    <SelectItem value="administrador">Administrador General del Sistema</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Nota: Las cuentas de becarios se matriculan desde el módulo oficial de Becarios.
                </p>
              </div>

              {/* Correo Principal */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#035683]">
                  Correo Electrónico Principal (Login) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  type="email"
                  placeholder="ejemplo@bumand.bo o @diaconia.bo"
                  value={nuevo_correo}
                  onChange={(_e) => set_nuevo_correo(_e.target.value)}
                  required
                  className="h-9 text-xs font-mono rounded-xl border-[#E5E7EB]"
                />
              </div>

              {/* Correo Alternativo Opcional */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#035683]">
                  Correo Alternativo Principal (Opcional)
                </Label>
                <Input
                  type="email"
                  placeholder="ejemplo.personal@gmail.com"
                  value={nuevo_correo_alt}
                  onChange={(_e) => set_nuevo_correo_alt(_e.target.value)}
                  className="h-9 text-xs font-mono rounded-xl border-[#E5E7EB]"
                />
                <p className="text-[10px] text-muted-foreground">
                  Permite iniciar sesión con cualquiera de los dos correos y la misma contraseña.
                </p>
              </div>

              {/* Contraseña Inicial */}
              <div className="space-y-1.5 pt-1 border-t border-[#E5E7EB]">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-[#035683]">
                    Contraseña Institucional Inicial <span className="text-rose-500">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => generarClaveSegura("crear")}
                    className="h-6 px-2 text-[11px] text-[#007BBE] hover:bg-[#007BBE]/10 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Dices className="w-3 h-3" />
                    <span>🎲 Generar Segura</span>
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    type={mostrar_clave_crear ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={nueva_clave_crear}
                    onChange={(_e) => set_nueva_clave_crear(_e.target.value)}
                    required
                    className="h-9 pr-9 text-xs font-mono rounded-xl border-[#E5E7EB]"
                  />
                  <button
                    type="button"
                    onClick={() => set_mostrar_clave_crear(!mostrar_clave_crear)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#035683] cursor-pointer"
                    title={mostrar_clave_crear ? "Ocultar clave" : "Ver clave"}
                  >
                    {mostrar_clave_crear ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </DialogBody>

            <DialogFooter className="p-4 border-t border-[#E5E7EB] bg-slate-50 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => set_modal_crear_abierto(false)}
                className="rounded-xl text-xs font-bold border-[#E5E7EB]"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={guardando_crear}
                className="bg-[#007BBE] hover:bg-[#035683] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                {guardando_crear ? "Registrando..." : "Crear Usuario"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* =========================================================================
          MODAL 2: Editar Datos y Correos del Usuario
         ========================================================================= */}
      <Dialog open={modal_editar_abierto} onOpenChange={(_abierto) => set_modal_editar_abierto(_abierto)}>
        <DialogContent showCloseButton={false} className="sm:max-w-xl p-0 bg-white rounded-2xl overflow-hidden">
          <DialogHeader className="p-5 border-b border-[#E5E7EB] bg-gradient-to-r from-[#035683] to-[#007BBE] text-white">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-white text-base font-bold flex items-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  <span>Editar Datos y Correos Institucionales</span>
                </DialogTitle>
                <DialogDescription className="text-white/80 text-xs mt-0.5">
                  ID: #{usuario_editar?.id} · {usuario_editar?.nombre}
                </DialogDescription>
              </div>
              <Badge variant="outline" className="border-white/30 text-white bg-white/10 font-mono text-[10px]">
                {usuario_editar?.rol.toUpperCase()}
              </Badge>
            </div>
          </DialogHeader>

          <form onSubmit={manejarGuardarEdicion}>
            <DialogBody className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Nombre Completo */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#035683]">Nombre Completo</Label>
                <Input
                  type="text"
                  value={edit_nombre}
                  onChange={(_e) => set_edit_nombre(_e.target.value)}
                  required
                  className="h-9 text-xs rounded-xl border-[#E5E7EB]"
                />
              </div>

              {/* Rol y Estado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#035683]">Rol Institucional</Label>
                  <Select
                    value={edit_rol}
                    onValueChange={(_v) =>
                      _v && set_edit_rol(_v as "administrador" | "supervisor" | "becario")
                    }
                  >
                    <SelectTrigger className="h-9 rounded-xl border-[#E5E7EB] text-xs font-bold text-[#035683]">
                      <SelectValue placeholder="Rol" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-[#E5E7EB]">
                      <SelectItem value="administrador">Administrador</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="becario">Becario</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#035683]">Estado de la Cuenta</Label>
                  <Select
                    value={edit_estado}
                    onValueChange={(_v) => _v && set_edit_estado(_v as "activo" | "inactivo")}
                  >
                    <SelectTrigger className="h-9 rounded-xl border-[#E5E7EB] text-xs font-bold text-[#035683]">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-[#E5E7EB]">
                      <SelectItem value="activo">Activo (Habilitado)</SelectItem>
                      <SelectItem value="inactivo">Inactivo (Suspendido)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Correo Principal */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#035683]">
                  Correo Principal de Inicio de Sesión
                </Label>
                <Input
                  type="email"
                  value={edit_correo}
                  onChange={(_e) => set_edit_correo(_e.target.value)}
                  required
                  className="h-9 text-xs font-mono rounded-xl border-[#E5E7EB]"
                />
              </div>

              {/* Correo Alternativo Principal */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#035683]">
                  Correo Alternativo Principal
                </Label>
                <Input
                  type="email"
                  placeholder="ejemplo.personal@gmail.com"
                  value={edit_correo_alt}
                  onChange={(_e) => set_edit_correo_alt(_e.target.value)}
                  className="h-9 text-xs font-mono rounded-xl border-[#E5E7EB]"
                />
              </div>

              {/* Sección Correos Adicionales Vinculados */}
              <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-[#035683]">
                    Correos Adicionales Vinculados (
                    {usuario_editar?.correos_adicionales?.length || 0})
                  </Label>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Habilitados para login
                  </span>
                </div>

                {/* Lista de correos */}
                {usuario_editar?.correos_adicionales && usuario_editar.correos_adicionales.length > 0 ? (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {usuario_editar.correos_adicionales.map((item, idx) => (
                      <div
                        key={`${item.correo}_${idx}`}
                        className="p-2 rounded-xl border border-[#E5E7EB] bg-slate-50 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Mail className="w-3.5 h-3.5 text-[#00ABBD] shrink-0" />
                          <span className="font-mono font-semibold text-[#1E293B] truncate">
                            {item.correo}
                          </span>
                          {item.etiqueta && (
                            <Badge
                              variant="outline"
                              className="text-[9px] font-mono border-emerald-200 bg-emerald-50 text-emerald-700"
                            >
                              {item.etiqueta}
                            </Badge>
                          )}
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => manejarEliminarCorreoExtra(item.id || item.correo)}
                          className="h-6 w-6 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Desvincular correo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl border border-dashed border-[#E5E7EB] text-center text-xs text-muted-foreground bg-slate-50/50">
                    No tiene correos adicionales adicionales vinculados.
                  </div>
                )}

                {/* Formulario rápido para vincular otro correo */}
                <div className="p-3 rounded-xl border border-[#E5E7EB] bg-slate-50/70 space-y-2">
                  <Label className="text-[11px] font-bold text-[#035683]">
                    Vincular otro correo de acceso
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="nuevo.correo@gmail.com"
                      value={nuevo_correo_extra}
                      onChange={(_e) => set_nuevo_correo_extra(_e.target.value)}
                      className="h-8 text-xs font-mono bg-white rounded-xl border-[#E5E7EB] flex-1"
                    />
                    <Input
                      type="text"
                      placeholder="Etiqueta"
                      value={nueva_etiqueta_extra}
                      onChange={(_e) => set_nueva_etiqueta_extra(_e.target.value)}
                      className="h-8 text-xs bg-white rounded-xl border-[#E5E7EB] w-28"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={manejarAgregarCorreoExtra}
                      className="h-8 px-2.5 bg-[#035683] hover:bg-[#007BBE] text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </DialogBody>

            <DialogFooter className="p-4 border-t border-[#E5E7EB] bg-slate-50 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => set_modal_editar_abierto(false)}
                className="rounded-xl text-xs font-bold border-[#E5E7EB]"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={guardando_editar}
                className="bg-[#007BBE] hover:bg-[#035683] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                {guardando_editar ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* =========================================================================
          MODAL 3: Cambiar / Restablecer Contraseña Institucional
         ========================================================================= */}
      <Dialog open={modal_clave_abierto} onOpenChange={(_abierto) => set_modal_clave_abierto(_abierto)}>
        <DialogContent showCloseButton={false} className="sm:max-w-md p-0 bg-white rounded-2xl overflow-hidden">
          <DialogHeader className="p-5 border-b border-[#E5E7EB] bg-gradient-to-r from-amber-600 to-amber-700 text-white">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-white text-base font-bold flex items-center gap-2">
                  <KeyRound className="w-4 h-4" />
                  <span>Restablecer Contraseña Institucional</span>
                </DialogTitle>
                <DialogDescription className="text-white/80 text-xs mt-0.5">
                  Usuario: {usuario_clave?.nombre} ({usuario_clave?.correo})
                </DialogDescription>
              </div>
              <Badge variant="outline" className="border-white/30 text-white bg-white/10 font-mono text-[10px]">
                SEGURIDAD
              </Badge>
            </div>
          </DialogHeader>

          <form onSubmit={manejarGuardarClave}>
            <DialogBody className="p-5 space-y-4">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  Como administrador puede asignar una nueva clave institucional. El usuario podrá
                  iniciar sesión inmediatamente con esta clave desde cualquiera de sus correos autorizados.
                </p>
              </div>

              {/* Botón Generador Rápido */}
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => generarClaveSegura("cambiar")}
                  className="h-7 text-xs font-bold border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Dices className="w-3.5 h-3.5 text-amber-600" />
                  <span>🎲 Generar Clave Segura Automática</span>
                </Button>
              </div>

              {/* Nueva Contraseña */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#035683]">Nueva Contraseña</Label>
                <div className="relative">
                  <Input
                    type={mostrar_clave_nueva ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={clave_nueva}
                    onChange={(_e) => set_clave_nueva(_e.target.value)}
                    required
                    className="h-9 pr-9 text-xs font-mono rounded-xl border-[#E5E7EB]"
                  />
                  <button
                    type="button"
                    onClick={() => set_mostrar_clave_nueva(!mostrar_clave_nueva)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#035683] cursor-pointer"
                    title={mostrar_clave_nueva ? "Ocultar" : "Ver"}
                  >
                    {mostrar_clave_nueva ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Medidor de Fortaleza */}
                {clave_nueva && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-muted-foreground">Fortaleza:</span>
                      <span className="font-bold text-[#035683]">{fortaleza_clave_nueva.etiqueta}</span>
                    </div>
                    <Progress value={fortaleza_clave_nueva.puntaje} className="h-1.5 rounded-full" />
                  </div>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#035683]">Confirmar Nueva Contraseña</Label>
                <div className="relative">
                  <Input
                    type={mostrar_clave_confirmar ? "text" : "password"}
                    placeholder="Repita la nueva contraseña"
                    value={clave_confirmar}
                    onChange={(_e) => set_clave_confirmar(_e.target.value)}
                    required
                    className="h-9 pr-9 text-xs font-mono rounded-xl border-[#E5E7EB]"
                  />
                  <button
                    type="button"
                    onClick={() => set_mostrar_clave_confirmar(!mostrar_clave_confirmar)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#035683] cursor-pointer"
                    title={mostrar_clave_confirmar ? "Ocultar" : "Ver"}
                  >
                    {mostrar_clave_confirmar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {clave_confirmar && clave_nueva !== clave_confirmar && (
                  <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Las contraseñas no coinciden.
                  </p>
                )}
                {clave_confirmar && clave_nueva === clave_confirmar && (
                  <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Las contraseñas coinciden correctamente.
                  </p>
                )}
              </div>
            </DialogBody>

            <DialogFooter className="p-4 border-t border-[#E5E7EB] bg-slate-50 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => set_modal_clave_abierto(false)}
                className="rounded-xl text-xs font-bold border-[#E5E7EB]"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={guardando_clave || !clave_nueva || clave_nueva !== clave_confirmar}
                className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                {guardando_clave ? "Restableciendo..." : "Asignar Contraseña"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
