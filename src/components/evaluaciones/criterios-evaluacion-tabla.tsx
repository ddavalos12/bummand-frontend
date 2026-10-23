"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox, OpcionCombobox } from "@/components/ui/combobox";
import {
  BookOpen,
  Award,
  CheckCircle,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Calculator,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import {
  CRITERIOS_EVALUACION_OFICIALES,
  RANGOS_APROBACION_OFICIALES,
} from "./evaluaciones-datos-semestre";

const OPCIONES_MATERIAS_REPROBADAS: OpcionCombobox[] = [
  { valor: "0", etiqueta: "0 (Todas Aprobadas)", colorPunto: "bg-emerald-500" },
  { valor: "1", etiqueta: "1 Reprobada", colorPunto: "bg-amber-500" },
  { valor: "2", etiqueta: "Más de 1 Reprobada", colorPunto: "bg-rose-500" },
];

const OPCIONES_EVALUACION_IGLESIA: OpcionCombobox[] = [
  { valor: "buena", etiqueta: "Buena (20 pts)", colorPunto: "bg-emerald-500" },
  { valor: "regular", etiqueta: "Regular (15 pts)", colorPunto: "bg-amber-500" },
  { valor: "no_cumple", etiqueta: "No cumple / No presenta (0 pts)", colorPunto: "bg-rose-500" },
];

export function CriteriosEvaluacionTabla() {
  const [panel_calculadora_abierto, set_panel_calculadora_abierto] = useState(false);

  // Estados interactivos para probar el motor de criterios
  const [materias_reprobadas, set_materias_reprobadas] = useState<number>(0);
  const [promedio_academico, set_promedio_academico] = useState<number>(75);
  const [evaluacion_iglesia, set_evaluacion_iglesia] = useState<"buena" | "regular" | "no_cumple">("buena");
  const [porcentaje_mentor, set_porcentaje_mentor] = useState<number>(95);
  const [porcentaje_ceti, set_porcentaje_ceti] = useState<number>(90);
  const [faltas_injustificadas, set_faltas_injustificadas] = useState<number>(0);
  const [puntaje_socioeconomico, set_puntaje_socioeconomico] = useState<number>(18);

  // Cálculo según 23.jpeg
  const calcularPuntajeAcademico = () => {
    if (materias_reprobadas > 1) return 0;
    if (materias_reprobadas === 1) {
      return promedio_academico > 51 ? 10 : 0;
    }
    return promedio_academico >= 70 ? 20 : 15;
  };

  const calcularPuntajeIglesia = () => {
    if (evaluacion_iglesia === "buena") return 20;
    if (evaluacion_iglesia === "regular") return 15;
    return 0;
  };

  const calcularPuntajeMentor = () => {
    return Math.min(Math.max((porcentaje_mentor * 20) / 100, 0), 20);
  };

  const calcularPuntajeLideres = () => {
    if (faltas_injustificadas > 1) return 0;
    if (porcentaje_ceti >= 51) return 20;
    return 15;
  };

  const pts_academico = calcularPuntajeAcademico();
  const pts_iglesia = calcularPuntajeIglesia();
  const pts_mentor = calcularPuntajeMentor();
  const pts_lideres = calcularPuntajeLideres();
  const pts_socio = Math.min(Math.max(puntaje_socioeconomico, 0), 20);

  const total_calculado = pts_academico + pts_iglesia + pts_mentor + pts_lideres + pts_socio;

  const obtenerDictamen = (total: number) => {
    if (total >= 70) {
      return {
        etiqueta: "Aprobación óptima",
        color: "bg-emerald-600 text-white",
        descripcion: "Renovación automática de beca BUMAND.",
      };
    }
    if (total >= 51) {
      return {
        etiqueta: "Aprobación Condicionada",
        color: "bg-amber-500 text-white",
        descripcion: "Sujeto a plan de mejora y tutoría obligatoria.",
      };
    }
    return {
      etiqueta: "Reprobó y debe abandonar el programa",
      color: "bg-rose-600 text-white",
      descripcion: "Pérdida de beca según reglamento institucional.",
    };
  };

  const dictamen = obtenerDictamen(total_calculado);

  return (
    <Card className="border-[#E3DCCB] shadow-md bg-white rounded-2xl overflow-hidden">
      {/* Cabecera Institucional Oficial */}
      <CardHeader className="bg-gradient-to-r from-[#063A6B] via-[#084b8a] to-[#063A6B] text-white p-6 pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge className="bg-[#F8C766] text-[#063A6B] font-bold text-xs uppercase px-2.5 py-0.5">
                Instrumento Normativo Oficial
              </Badge>
              <Badge variant="outline" className="text-white border-white/30 text-xs font-mono">
                Criterios 23.jpeg · Ponderación 20 Pts Cada Módulo
              </Badge>
            </div>
            <CardTitle className="text-xl md:text-2xl font-bold font-display text-white">
              Tabla Oficial de Criterios de Evaluación Semestral
            </CardTitle>
            <CardDescription className="text-xs md:text-sm text-white/80 max-w-3xl">
              &ldquo;El programa realiza dos evaluaciones semestrales, una al inicio de gestión que evalúa el segundo semestre de la gestión pasada y otro a media gestión.&rdquo;
            </CardDescription>
          </div>

          <Button
            size="sm"
            onClick={() => set_panel_calculadora_abierto(!panel_calculadora_abierto)}
            className="h-10 px-4 bg-[#17B4C4] hover:bg-[#17B4C4]/90 text-[#063A6B] font-bold rounded-xl text-xs flex items-center gap-2 shrink-0 shadow-sm"
          >
            <Calculator className="w-4 h-4" />
            {panel_calculadora_abierto ? "Ocultar Simulador" : "Simulador de Criterios (23.jpeg)"}
            {panel_calculadora_abierto ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Simulador Interactivo de Criterios */}
        {panel_calculadora_abierto && (
          <div className="p-5 bg-slate-50 border-2 border-dashed border-[#17B4C4]/40 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E3DCCB] gap-2">
              <div>
                <h4 className="text-sm font-bold text-[#063A6B] flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-[#17B4C4]" />
                  Simulador en Vivo de Calificación (Reglas 23.jpeg)
                </h4>
                <p className="text-xs text-muted-foreground">
                  Modifica los valores para verificar la calificación automática sobre 100 puntos y su dictamen oficial.
                </p>
              </div>
              <Badge className={`font-mono text-sm px-3 py-1 font-bold ${dictamen.color}`}>
                Total: {total_calculado.toFixed(1)} / 100 pts · {dictamen.etiqueta}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
              {/* Académico */}
              <div className="p-3 bg-white border border-[#E3DCCB] rounded-xl space-y-2">
                <span className="font-bold text-[#063A6B] block">1. Académico (/20 pts)</span>
                <div>
                  <Label className="text-[11px] text-muted-foreground">Promedio General:</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={promedio_academico}
                    onChange={(e) => set_promedio_academico(parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground">Materias Reprobadas:</Label>
                  <Combobox
                    valor={materias_reprobadas.toString()}
                    alCambiar={(val) => set_materias_reprobadas(parseInt(val, 10))}
                    opciones={OPCIONES_MATERIAS_REPROBADAS}
                    tamaño="sm"
                    className="w-full mt-1"
                  />
                </div>
                <div className="pt-1 text-right font-mono font-bold text-[#063A6B]">
                  Puntaje: {pts_academico} / 20 pts
                </div>
              </div>

              {/* Liderazgo Iglesia */}
              <div className="p-3 bg-white border border-[#E3DCCB] rounded-xl space-y-2">
                <span className="font-bold text-[#063A6B] block">2. Iglesia (/20 pts)</span>
                <div>
                  <Label className="text-[11px] text-muted-foreground">Evaluación Pastoral:</Label>
                  <Combobox
                    valor={evaluacion_iglesia}
                    alCambiar={(val) => set_evaluacion_iglesia(val as "buena" | "regular" | "no_cumple")}
                    opciones={OPCIONES_EVALUACION_IGLESIA}
                    tamaño="sm"
                    className="w-full mt-1"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground pt-1">
                  Certificado pastoral con firma y sello.
                </p>
                <div className="pt-2 text-right font-mono font-bold text-[#063A6B]">
                  Puntaje: {pts_iglesia} / 20 pts
                </div>
              </div>

              {/* PP2 Mentor */}
              <div className="p-3 bg-white border border-[#E3DCCB] rounded-xl space-y-2">
                <span className="font-bold text-[#063A6B] block">3. PP² Mentor (/20 pts)</span>
                <div>
                  <Label className="text-[11px] text-muted-foreground">% Evaluación Tutor:</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={porcentaje_mentor}
                    onChange={(e) => set_porcentaje_mentor(parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Fórmula: 20 × (% / 100)
                </p>
                <div className="pt-1 text-right font-mono font-bold text-[#063A6B]">
                  Puntaje: {pts_mentor.toFixed(1)} / 20 pts
                </div>
              </div>

              {/* Escuela de Líderes */}
              <div className="p-3 bg-white border border-[#E3DCCB] rounded-xl space-y-2">
                <span className="font-bold text-[#063A6B] block">4. Esc. Líderes (/20 pts)</span>
                <div>
                  <Label className="text-[11px] text-muted-foreground">% Evaluación / CETI:</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={porcentaje_ceti}
                    onChange={(e) => set_porcentaje_ceti(parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground">Faltas Injustificadas:</Label>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    value={faltas_injustificadas}
                    onChange={(e) => set_faltas_injustificadas(parseInt(e.target.value, 10) || 0)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div className="pt-1 text-right font-mono font-bold text-[#063A6B]">
                  Puntaje: {pts_lideres} / 20 pts
                </div>
              </div>

              {/* Socioeconómico */}
              <div className="p-3 bg-white border border-[#E3DCCB] rounded-xl space-y-2">
                <span className="font-bold text-[#063A6B] block">5. Socioeconómico (/20)</span>
                <div>
                  <Label className="text-[11px] text-muted-foreground">Puntaje Bienestar / Familia:</Label>
                  <Input
                    type="number"
                    min={0}
                    max={20}
                    value={puntaje_socioeconomico}
                    onChange={(e) => set_puntaje_socioeconomico(parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  26 Preguntas Bienestar Universitario.
                </p>
                <div className="pt-1 text-right font-mono font-bold text-[#063A6B]">
                  Puntaje: {pts_socio.toFixed(1)} / 20 pts
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 1. TABLA OFICIAL DE LOS 5 MÓDULOS DE 20 PUNTOS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#063A6B] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#17B4C4]" />
              Estructura Oficial de Calificación Semestral (5 Módulos de 20 Puntos = 100 Puntos)
            </h3>
            <Badge variant="outline" className="border-[#063A6B] text-[#063A6B] font-mono text-xs font-bold">
              Base: 20% Cada Eje
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {CRITERIOS_EVALUACION_OFICIALES.map((c, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-[#E3DCCB] bg-slate-50/70 p-4 flex flex-col justify-between space-y-3 shadow-xs hover:border-[#17B4C4] transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E3DCCB]">
                    <span className="font-bold text-sm text-[#063A6B]">
                      {idx + 1}. {c.modulo}
                    </span>
                    <Badge className="bg-[#063A6B] text-white font-mono text-xs font-bold">
                      {c.puntaje_maximo} pts
                    </Badge>
                  </div>

                  <ul className="space-y-1.5 text-xs">
                    {c.reglas.map((r, r_idx) => (
                      <li
                        key={r_idx}
                        className="p-1.5 rounded-lg bg-white border border-[#E3DCCB]/60 flex items-center justify-between gap-1"
                      >
                        <span className="text-[11px] text-slate-700 leading-snug">{r.condicion}</span>
                        <strong className="font-mono text-xs text-[#063A6B] shrink-0">
                          {r.puntos} pts
                        </strong>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-[#E3DCCB]/60 text-[10px] text-muted-foreground flex items-start gap-1">
                  <Info className="w-3 h-3 text-[#17B4C4] shrink-0 mt-0.5" />
                  <span>{c.nota}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. TABLA OFICIAL DE RANGOS DE APROBACIÓN */}
        <div className="space-y-3 pt-2">
          <h3 className="text-base font-bold text-[#063A6B] flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            Rangos Oficiales de Calificación y Aprobación
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {RANGOS_APROBACION_OFICIALES.map((rango, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-2 ${
                  rango.color === "emerald"
                    ? "bg-emerald-50/60 border-emerald-300"
                    : rango.color === "amber"
                    ? "bg-amber-50/60 border-amber-300"
                    : "bg-rose-50/60 border-rose-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {rango.color === "emerald" ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : rango.color === "amber" ? (
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600" />
                    )}
                    <span
                      className={`font-bold text-sm ${
                        rango.color === "emerald"
                          ? "text-emerald-900"
                          : rango.color === "amber"
                          ? "text-amber-900"
                          : "text-rose-900"
                      }`}
                    >
                      {rango.calificacion}
                    </span>
                  </div>
                  <Badge
                    className={`font-mono text-xs font-bold px-2.5 py-0.5 ${
                      rango.color === "emerald"
                        ? "bg-emerald-600 text-white"
                        : rango.color === "amber"
                        ? "bg-amber-500 text-white"
                        : "bg-rose-600 text-white"
                    }`}
                  >
                    {rango.rango} pts
                  </Badge>
                </div>
                <p
                  className={`text-xs leading-relaxed ${
                    rango.color === "emerald"
                      ? "text-emerald-800"
                      : rango.color === "amber"
                      ? "text-amber-800"
                      : "text-rose-800"
                  }`}
                >
                  {rango.descripcion}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
