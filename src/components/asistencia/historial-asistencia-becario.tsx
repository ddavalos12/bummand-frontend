"use client";

import React, { useState } from "react";
import {
  Clock,
  CheckCircle2,
  Calendar,
  MapPin,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  FileCheck,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TarjetaSpotlight,
  ContadorRodilloAnimado,
  BotonJuicy,
  InsigniaPulsoVivo,
} from "@/components/animaciones";
import { DialogoMarcacionAsistencia } from "./dialogo-marcacion-asistencia";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";

interface RegistroJornadaBecario {
  id: number;
  fecha: string;
  dia_semana: string;
  tipo: "practicas" | "escuela_lideres" | "evento";
  hora_ingreso: string;
  hora_salida: string | null;
  horas_computadas: number;
  sede: string;
  distancia_m: number;
  estado: "acreditado" | "en_curso" | "convalidado" | "observado";
}

const JORNADAS_INICIALES: RegistroJornadaBecario[] = [
  {
    id: 1,
    fecha: "2026-10-10",
    dia_semana: "Sábado",
    tipo: "practicas",
    hora_ingreso: "08:15",
    hora_salida: null,
    horas_computadas: 4.25,
    sede: "Oficina Central - Bloque A",
    distancia_m: 35,
    estado: "en_curso",
  },
  {
    id: 2,
    fecha: "2026-10-09",
    dia_semana: "Viernes",
    tipo: "escuela_lideres",
    hora_ingreso: "14:28",
    hora_salida: "16:45",
    horas_computadas: 2.28,
    sede: "Auditorio Central Diaconía",
    distancia_m: 22,
    estado: "acreditado",
  },
  {
    id: 3,
    fecha: "2026-10-08",
    dia_semana: "Jueves",
    tipo: "practicas",
    hora_ingreso: "08:00",
    hora_salida: "17:05",
    horas_computadas: 8.5,
    sede: "Oficina Central - Bloque A",
    distancia_m: 48,
    estado: "acreditado",
  },
  {
    id: 4,
    fecha: "2026-10-07",
    dia_semana: "Miércoles",
    tipo: "practicas",
    hora_ingreso: "08:05",
    hora_salida: "17:00",
    horas_computadas: 8.42,
    sede: "Oficina Central - Bloque A",
    distancia_m: 40,
    estado: "acreditado",
  },
  {
    id: 5,
    fecha: "2026-10-06",
    dia_semana: "Martes",
    tipo: "practicas",
    hora_ingreso: "08:30",
    hora_salida: "17:00",
    horas_computadas: 8.0,
    sede: "Oficina Central - Bloque A",
    distancia_m: 135,
    estado: "convalidado",
  },
  {
    id: 6,
    fecha: "2026-10-05",
    dia_semana: "Lunes",
    tipo: "practicas",
    hora_ingreso: "08:00",
    hora_salida: "17:15",
    horas_computadas: 8.75,
    sede: "Oficina Central - Bloque A",
    distancia_m: 30,
    estado: "acreditado",
  },
];

interface HistorialAsistenciaBecarioProps {
  alAbrirMarcacion?: () => void;
}

export function HistorialAsistenciaBecario({ alAbrirMarcacion }: HistorialAsistenciaBecarioProps) {
  const { usuario } = usarAutenticacion();
  const [dialogo_marcacion_abierto, set_dialogo_marcacion_abierto] = useState(false);
  const [jornadas] = useState<RegistroJornadaBecario[]>(JORNADAS_INICIALES);

  const horas_acumuladas = 64.5;
  const horas_meta = 80.0;
  const porcentaje_meta = Math.min(100, Math.round((horas_acumuladas / horas_meta) * 100));

  const abrirDialogo = () => {
    if (alAbrirMarcacion) {
      alAbrirMarcacion();
    } else {
      set_dialogo_marcacion_abierto(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera Principal con Botón de Marcación Destacado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E3DCCB] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-[#063A6B]" />
            <h2 className="text-xl font-bold text-[#063A6B]">Mis Horas de Práctica y Asistencia</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Control de jornada diaria con geocercas satelitales WGS84 y acreditación diaconal.
          </p>
        </div>

        <BotonJuicy
          onClick={abrirDialogo}
          variante="primario"
          className="h-10 text-xs font-bold px-4 gap-2 shadow-sm rounded-xl shrink-0"
        >
          <Clock className="w-4 h-4" />
          <span>Marcar Entrada / Salida GPS</span>
        </BotonJuicy>
      </div>

      {/* Tarjetas KPI de Progreso */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Horas Acumuladas */}
        <TarjetaSpotlight
          color_luz="rgba(6, 58, 107, 0.15)"
          className="bg-white border border-[#E3DCCB] rounded-2xl p-5 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground">
              Horas Acumuladas
            </span>
            <Badge className="bg-[#063A6B]/10 text-[#063A6B] border-[#063A6B]/20 text-[10px] font-bold">
              {porcentaje_meta}%
            </Badge>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold font-display text-[#063A6B]">
              <ContadorRodilloAnimado valor={horas_acumuladas} sufijo=" hrs" decimales={1} />
            </span>
            <span className="text-xs text-muted-foreground font-mono">/ {horas_meta} hrs</span>
          </div>
          <Progress value={porcentaje_meta} className="h-2 bg-slate-100" />
        </TarjetaSpotlight>

        {/* KPI 2: Jornadas Registradas */}
        <TarjetaSpotlight
          color_luz="rgba(23, 180, 196, 0.15)"
          className="bg-white border border-[#E3DCCB] rounded-2xl p-5 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground">
              Jornadas Acreditadas
            </span>
            <Calendar className="w-4 h-4 text-[#17B4C4]" />
          </div>
          <div className="text-3xl font-bold font-display text-[#063A6B]">
            <ContadorRodilloAnimado valor={16} sufijo=" días" />
          </div>
          <p className="text-[11px] text-muted-foreground">Mes de Octubre 2026</p>
        </TarjetaSpotlight>

        {/* KPI 3: Tasa de Puntualidad */}
        <TarjetaSpotlight
          color_luz="rgba(16, 185, 129, 0.15)"
          className="bg-white border border-[#E3DCCB] rounded-2xl p-5 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground">
              Puntualidad
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold font-display text-emerald-600">
            <ContadorRodilloAnimado valor={96} sufijo="%" />
          </div>
          <p className="text-[11px] text-emerald-700 font-medium">Cumplimiento excelente</p>
        </TarjetaSpotlight>

        {/* KPI 4: Sede Asignada */}
        <TarjetaSpotlight
          color_luz="rgba(248, 199, 102, 0.2)"
          className="bg-white border border-[#E3DCCB] rounded-2xl p-5 shadow-xs space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground">
              Mi Sede Asignada
            </span>
            <MapPin className="w-4 h-4 text-[#E2694B]" />
          </div>
          <div className="text-sm font-bold text-[#063A6B] leading-tight">
            Oficina Central - Bloque A
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#17B4C4] font-semibold pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#17B4C4] animate-pulse" />
            <span>Radio Geodésico: 120m</span>
          </div>
        </TarjetaSpotlight>
      </div>

      {/* Listado de Jornadas Registradas */}
      <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/60 p-5 border-b border-[#E3DCCB]/60">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-[#063A6B]">
                Historial de Marcaciones
              </CardTitle>
              <CardDescription className="text-xs">
                Registros de ingreso y salida con coordenadas auditadas
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-[#E3DCCB] text-[#063A6B] font-mono text-xs">
              {jornadas.length} Registros recientes
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-[#E3DCCB]/50">
            {jornadas.map((j) => (
              <div
                key={j.id}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      j.estado === "en_curso"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-[#063A6B]/10 text-[#063A6B]"
                    }`}
                  >
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#063A6B]">{j.fecha}</span>
                      <span className="text-xs text-muted-foreground">({j.dia_semana})</span>
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase font-mono px-1.5 py-0 border-[#E3DCCB]"
                      >
                        {j.tipo === "escuela_lideres" ? "Escuela Líderes" : "Prácticas"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>{j.sede}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-700">
                        <MapPin className="w-3 h-3" /> {j.distancia_m}m de la sede
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                  {/* Horario */}
                  <div className="text-left md:text-right">
                    <div className="text-xs font-mono font-bold text-[#063A6B]">
                      {j.hora_ingreso} &rarr; {j.hora_salida || "En curso..."}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      {j.horas_computadas.toFixed(2)} horas computadas
                    </div>
                  </div>

                  {/* Estado */}
                  <div>
                    {j.estado === "acreditado" && (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-bold text-xs gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Acreditado
                      </Badge>
                    )}
                    {j.estado === "en_curso" && (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-bold text-xs gap-1 animate-pulse">
                        <Clock className="w-3.5 h-3.5" />
                        Jornada Activa
                      </Badge>
                    )}
                    {j.estado === "convalidado" && (
                      <Badge className="bg-sky-100 text-sky-800 border-sky-200 font-bold text-xs gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Convalidado
                      </Badge>
                    )}
                    {j.estado === "observado" && (
                      <Badge className="bg-rose-100 text-rose-800 border-rose-200 font-bold text-xs gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Observado
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de Marcación en caso de apertura autónoma */}
      <DialogoMarcacionAsistencia
        abierto={dialogo_marcacion_abierto}
        alCambiarAbierto={set_dialogo_marcacion_abierto}
      />
    </div>
  );
}
