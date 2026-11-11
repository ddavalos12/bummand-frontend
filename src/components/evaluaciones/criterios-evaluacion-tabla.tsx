"use client";

import React, { useState, useEffect } from "react";
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
  Pencil,
  Save,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import { clienteApi } from "@/lib/cliente-api";
import {
  CRITERIOS_EVALUACION_OFICIALES,
  RANGOS_APROBACION_OFICIALES,
} from "./evaluaciones-datos-semestre";

export interface ReglaCriterioEditable {
  condicion: string;
  puntos: number;
}

export interface CriterioModuloEditable {
  modulo: string;
  puntaje_maximo: number;
  reglas: ReglaCriterioEditable[];
  nota: string;
}

export interface CriteriosEvaluacionTablaProps {
  es_admin?: boolean;
  periodo_id?: number;
  alActualizarEstructura?: (criterios: CriterioModuloEditable[]) => void;
}

function clonarCriteriosIniciales(): CriterioModuloEditable[] {
  return CRITERIOS_EVALUACION_OFICIALES.map((c) => ({
    modulo: c.modulo,
    puntaje_maximo: Number(c.puntaje_maximo),
    reglas: c.reglas.map((r) => ({ condicion: r.condicion, puntos: Number(r.puntos) })),
    nota: c.nota,
  }));
}

const OPCIONES_MATERIAS_REPROBADAS: OpcionCombobox[] = [
  { valor: "0", etiqueta: "0 (Todas Aprobadas)", colorPunto: "bg-emerald-500" },
  { valor: "1", etiqueta: "1 Reprobada", colorPunto: "bg-amber-500" },
  { valor: "2", etiqueta: "Más de 1 Reprobada", colorPunto: "bg-rose-500" },
];

export function CriteriosEvaluacionTabla({
  es_admin: es_admin_prop,
  periodo_id = 2,
  alActualizarEstructura,
}: CriteriosEvaluacionTablaProps = {}) {
  const { usuario } = usarAutenticacion();
  const puede_editar = es_admin_prop !== undefined ? es_admin_prop : usuario?.rol === "administrador" || usuario?.rol === "supervisor";

  const [panel_calculadora_abierto, set_panel_calculadora_abierto] = useState(false);

  // Estructura de 5 módulos y sus escalas de puntos editable por Administración
  const [criterios_modulos, set_criterios_modulos] = useState<CriterioModuloEditable[]>(() =>
    clonarCriteriosIniciales()
  );
  const [modo_edicion, set_modo_edicion] = useState<boolean>(false);
  const [guardando_estructura, set_guardando_estructura] = useState<boolean>(false);

  // Cargar estructura desde backend o localStorage al montar
  useEffect(() => {
    let montado = true;
    async function cargarEstructura() {
      try {
        const guardado_local =
          typeof window !== "undefined" ? localStorage.getItem("bumand_estructura_calificacion") : null;
        if (guardado_local) {
          const parsed = JSON.parse(guardado_local);
          if (Array.isArray(parsed) && parsed.length === 5 && montado) {
            set_criterios_modulos(parsed);
          }
        }
      } catch {}

      try {
        const res = await clienteApi.get<any>("/evaluaciones/estructura-calificacion");
        const lista = Array.isArray(res)
          ? res
          : res && Array.isArray(res.modulos)
          ? res.modulos
          : res && Array.isArray(res.criterios)
          ? res.criterios
          : null;
        if (lista && lista.length === 5 && montado) {
          const normalizada: CriterioModuloEditable[] = lista.map((item: any, idx: number) => ({
            modulo: item.modulo || CRITERIOS_EVALUACION_OFICIALES[idx].modulo,
            puntaje_maximo: Number(item.puntaje_maximo ?? 20),
            reglas: Array.isArray(item.reglas)
              ? item.reglas.map((r: any) => ({
                  condicion: String(r.condicion || ""),
                  puntos: Number(r.puntos ?? 0),
                }))
              : CRITERIOS_EVALUACION_OFICIALES[idx].reglas.map((r) => ({
                  condicion: r.condicion,
                  puntos: Number(r.puntos),
                })),
            nota: item.nota || CRITERIOS_EVALUACION_OFICIALES[idx].nota,
          }));
          set_criterios_modulos(normalizada);
          if (typeof window !== "undefined") {
            localStorage.setItem("bumand_estructura_calificacion", JSON.stringify(normalizada));
          }
        }
      } catch {
        // Fallback a configuración local o inicial
      }
    }
    cargarEstructura();
    return () => {
      montado = false;
    };
  }, []);

  const suma_puntajes_maximos = criterios_modulos.reduce(
    (acc, m) => acc + (Number(m.puntaje_maximo) || 0),
    0
  );
  const suma_valida_100 = Math.round(suma_puntajes_maximos) === 100;

  const actualizarPuntajeMaximoModulo = (idx_modulo: number, nuevo_maximo: number) => {
    const valor_limpio = Math.min(Math.max(Number(nuevo_maximo) || 0, 0), 100);
    set_criterios_modulos((prev) =>
      prev.map((m, i) => {
        if (i !== idx_modulo) return m;
        const reglas_ajustadas = m.reglas.map((r, r_idx) =>
          r_idx === 0 ? { ...r, puntos: valor_limpio } : r
        );
        return {
          ...m,
          puntaje_maximo: valor_limpio,
          reglas: reglas_ajustadas,
        };
      })
    );
  };

  const actualizarPuntosRegla = (idx_modulo: number, idx_regla: number, nuevos_puntos: number) => {
    set_criterios_modulos((prev) =>
      prev.map((m, i) => {
        if (i !== idx_modulo) return m;
        const valor_limpio = Math.min(Math.max(Number(nuevos_puntos) || 0, 0), 100);
        return {
          ...m,
          reglas: m.reglas.map((r, j) => (j === idx_regla ? { ...r, puntos: valor_limpio } : r)),
        };
      })
    );
  };

  const restablecerEstructura20Puntos = () => {
    const base = clonarCriteriosIniciales();
    set_criterios_modulos(base);
    toast.info("Estructura restablecida a 20 puntos equitativos por módulo (Total = 100 pts).");
  };

  const guardarEstructuraPuntos = async () => {
    if (!suma_valida_100) {
      toast.error("La suma de los 5 módulos debe ser exactamente 100 puntos.", {
        description: `Suma actual configurada: ${suma_puntajes_maximos} pts.`,
      });
      return;
    }

    set_guardando_estructura(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("bumand_estructura_calificacion", JSON.stringify(criterios_modulos));
      }

      const pesos_periodo = {
        peso_academica: criterios_modulos[0]?.puntaje_maximo ?? 20,
        peso_liderazgo: criterios_modulos[1]?.puntaje_maximo ?? 20,
        peso_practicas: criterios_modulos[2]?.puntaje_maximo ?? 20,
        peso_mentor: criterios_modulos[3]?.puntaje_maximo ?? 20,
        peso_socioeconomica: criterios_modulos[4]?.puntaje_maximo ?? 20,
      };

      await clienteApi
        .put("/evaluaciones/estructura-calificacion", {
          modulos: criterios_modulos,
          criterios: criterios_modulos,
          ...pesos_periodo,
        })
        .catch(() => {});

      await clienteApi.put(`/evaluaciones/periodos/${periodo_id}`, pesos_periodo).catch(() => {});

      if (alActualizarEstructura) {
        alActualizarEstructura(criterios_modulos);
      }

      set_modo_edicion(false);
      toast.success("Estructura de puntos y escalas guardada exitosamente", {
        description: "Los puntajes máximos de los 5 módulos y sus sub-escalas fueron actualizados (Suma = 100 pts).",
      });
    } finally {
      set_guardando_estructura(false);
    }
  };

  // Estados interactivos para probar el motor de criterios
  const [materias_reprobadas, set_materias_reprobadas] = useState<number>(0);
  const [promedio_academico, set_promedio_academico] = useState<number>(75);
  const [evaluacion_iglesia, set_evaluacion_iglesia] = useState<"buena" | "regular" | "no_cumple">("buena");
  const [porcentaje_mentor, set_porcentaje_mentor] = useState<number>(95);
  const [porcentaje_ceti, set_porcentaje_ceti] = useState<number>(90);
  const [faltas_injustificadas, set_faltas_injustificadas] = useState<number>(0);
  const [puntaje_socioeconomico, set_puntaje_socioeconomico] = useState<number>(18);

  const max_acad = criterios_modulos[0]?.puntaje_maximo ?? 20;
  const max_iglesia = criterios_modulos[1]?.puntaje_maximo ?? 20;
  const max_mentor = criterios_modulos[2]?.puntaje_maximo ?? 20;
  const max_lideres = criterios_modulos[3]?.puntaje_maximo ?? 20;
  const max_socio = criterios_modulos[4]?.puntaje_maximo ?? 20;

  const opciones_iglesia_dinamicas: OpcionCombobox[] = [
    {
      valor: "buena",
      etiqueta: `Buena (${criterios_modulos[1]?.reglas[0]?.puntos ?? 20} pts)`,
      colorPunto: "bg-emerald-500",
    },
    {
      valor: "regular",
      etiqueta: `Regular (${criterios_modulos[1]?.reglas[1]?.puntos ?? 15} pts)`,
      colorPunto: "bg-amber-500",
    },
    {
      valor: "no_cumple",
      etiqueta: `No cumple / No presenta (${criterios_modulos[1]?.reglas[2]?.puntos ?? 0} pts)`,
      colorPunto: "bg-rose-500",
    },
  ];

  // Cálculo dinámico según estructura configurada
  const calcularPuntajeAcademico = () => {
    const reglas_acad = criterios_modulos[0]?.reglas || [];
    if (materias_reprobadas > 1) return reglas_acad[3]?.puntos ?? 0;
    if (materias_reprobadas === 1) {
      return promedio_academico > 51 ? (reglas_acad[2]?.puntos ?? 10) : (reglas_acad[3]?.puntos ?? 0);
    }
    return promedio_academico >= 70 ? (reglas_acad[0]?.puntos ?? 20) : (reglas_acad[1]?.puntos ?? 15);
  };

  const calcularPuntajeIglesia = () => {
    const reglas_ig = criterios_modulos[1]?.reglas || [];
    if (evaluacion_iglesia === "buena") return reglas_ig[0]?.puntos ?? 20;
    if (evaluacion_iglesia === "regular") return reglas_ig[1]?.puntos ?? 15;
    return reglas_ig[2]?.puntos ?? 0;
  };

  const calcularPuntajeMentor = () => {
    return Math.min(Math.max((porcentaje_mentor * max_mentor) / 100, 0), max_mentor);
  };

  const calcularPuntajeLideres = () => {
    const reglas_lid = criterios_modulos[3]?.reglas || [];
    if (faltas_injustificadas > 1) return reglas_lid[2]?.puntos ?? 0;
    if (porcentaje_ceti >= 51) return reglas_lid[0]?.puntos ?? 20;
    return reglas_lid[1]?.puntos ?? 15;
  };

  const pts_academico = calcularPuntajeAcademico();
  const pts_iglesia = calcularPuntajeIglesia();
  const pts_mentor = calcularPuntajeMentor();
  const pts_lideres = calcularPuntajeLideres();
  const pts_socio = Math.min(Math.max(puntaje_socioeconomico, 0), max_socio);

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
    <Card className="border-[#E5E7EB] shadow-md bg-white rounded-2xl overflow-hidden">
      {/* Cabecera Institucional Oficial */}
      <CardHeader className="bg-gradient-to-r from-[#035683] via-[#084b8a] to-[#035683] text-white p-6 pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge className="bg-[#FFB600] text-[#035683] font-bold text-xs uppercase px-2.5 py-0.5">
                Instrumento Normativo Oficial
              </Badge>
              <Badge variant="outline" className="text-white border-white/30 text-xs font-mono">
                Criterios 23.jpeg · Suma Oficial {suma_puntajes_maximos} Pts
              </Badge>
            </div>
            <CardTitle className="text-xl md:text-2xl font-bold font-display text-white">
              Tabla Oficial de Criterios de Evaluación Semestral
            </CardTitle>
            <CardDescription className="text-xs md:text-sm text-white/80 max-w-3xl">
              &ldquo;El programa realiza dos evaluaciones semestrales, una al inicio de gestión que evalúa el segundo semestre de la gestión pasada y otro a media gestión.&rdquo;
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {puede_editar && (
              <Button
                size="sm"
                onClick={() => set_modo_edicion(!modo_edicion)}
                className="h-10 px-4 bg-[#FFB600] hover:bg-[#FFB600]/90 text-[#035683] font-bold rounded-xl text-xs flex items-center gap-2 shrink-0 shadow-sm cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
                {modo_edicion ? "Cancelar Edición" : "Editar Puntos y Escalas de Módulos"}
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => set_panel_calculadora_abierto(!panel_calculadora_abierto)}
              className="h-10 px-4 bg-[#00ABBD] hover:bg-[#00ABBD]/90 text-[#035683] font-bold rounded-xl text-xs flex items-center gap-2 shrink-0 shadow-sm cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              {panel_calculadora_abierto ? "Ocultar Simulador" : "Simulador de Criterios (23.jpeg)"}
              {panel_calculadora_abierto ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Simulador Interactivo de Criterios */}
        {panel_calculadora_abierto && (
          <div className="p-5 bg-slate-50 border-2 border-dashed border-[#00ABBD]/40 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E5E7EB] gap-2">
              <div>
                <h4 className="text-sm font-bold text-[#035683] flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-[#00ABBD]" />
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
              <div className="p-3 bg-white border border-[#E5E7EB] rounded-xl space-y-2">
                <span className="font-bold text-[#035683] block">1. Académico (/{max_acad} pts)</span>
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
                <div className="pt-1 text-right font-mono font-bold text-[#035683]">
                  Puntaje: {pts_academico} / {max_acad} pts
                </div>
              </div>

              {/* Liderazgo Iglesia */}
              <div className="p-3 bg-white border border-[#E5E7EB] rounded-xl space-y-2">
                <span className="font-bold text-[#035683] block">2. Iglesia (/{max_iglesia} pts)</span>
                <div>
                  <Label className="text-[11px] text-muted-foreground">Evaluación Pastoral:</Label>
                  <Combobox
                    valor={evaluacion_iglesia}
                    alCambiar={(val) => set_evaluacion_iglesia(val as "buena" | "regular" | "no_cumple")}
                    opciones={opciones_iglesia_dinamicas}
                    tamaño="sm"
                    className="w-full mt-1"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground pt-1">
                  Certificado pastoral con firma y sello.
                </p>
                <div className="pt-2 text-right font-mono font-bold text-[#035683]">
                  Puntaje: {pts_iglesia} / {max_iglesia} pts
                </div>
              </div>

              {/* PP2 Mentor */}
              <div className="p-3 bg-white border border-[#E5E7EB] rounded-xl space-y-2">
                <span className="font-bold text-[#035683] block">3. PP² Mentor (/{max_mentor} pts)</span>
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
                  Fórmula: {max_mentor} × (% / 100)
                </p>
                <div className="pt-1 text-right font-mono font-bold text-[#035683]">
                  Puntaje: {pts_mentor.toFixed(1)} / {max_mentor} pts
                </div>
              </div>

              {/* Escuela de Líderes */}
              <div className="p-3 bg-white border border-[#E5E7EB] rounded-xl space-y-2">
                <span className="font-bold text-[#035683] block">4. Esc. Líderes (/{max_lideres} pts)</span>
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
                <div className="pt-1 text-right font-mono font-bold text-[#035683]">
                  Puntaje: {pts_lideres} / {max_lideres} pts
                </div>
              </div>

              {/* Socioeconómico */}
              <div className="p-3 bg-white border border-[#E5E7EB] rounded-xl space-y-2">
                <span className="font-bold text-[#035683] block">5. Socioeconómico (/{max_socio})</span>
                <div>
                  <Label className="text-[11px] text-muted-foreground">Puntaje Bienestar / Familia:</Label>
                  <Input
                    type="number"
                    min={0}
                    max={max_socio}
                    value={puntaje_socioeconomico}
                    onChange={(e) => set_puntaje_socioeconomico(parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  26 Preguntas Bienestar Universitario.
                </p>
                <div className="pt-1 text-right font-mono font-bold text-[#035683]">
                  Puntaje: {pts_socio.toFixed(1)} / {max_socio} pts
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 1. TABLA OFICIAL DE LOS 5 MÓDULOS (SUMA = 100 PUNTOS) */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-base font-bold text-[#035683] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#00ABBD]" />
              Estructura Oficial de Calificación Semestral (5 Módulos = 100 Puntos)
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={`font-mono text-xs font-bold px-3 py-1 ${
                  suma_valida_100
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-rose-300 bg-rose-50 text-rose-800"
                }`}
              >
                Suma de Módulos: {suma_puntajes_maximos} / 100 pts {suma_valida_100 ? "✓" : "≠ 100"}
              </Badge>

              {puede_editar && !modo_edicion && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => set_modo_edicion(true)}
                  className="h-8 px-3 border-[#035683] text-[#035683] hover:bg-[#035683]/5 font-bold rounded-xl text-xs gap-1.5 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5 text-[#00ABBD]" />
                  Editar Puntos y Escalas de Módulos
                </Button>
              )}

              {modo_edicion && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={restablecerEstructura20Puntos}
                    className="h-8 px-3 border-slate-300 text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-xs gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Base 20 pts
                  </Button>
                  <Button
                    size="sm"
                    disabled={!suma_valida_100 || guardando_estructura}
                    onClick={guardarEstructuraPuntos}
                    className="h-8 px-4 bg-[#035683] hover:bg-[#035683]/90 text-white font-bold rounded-xl text-xs gap-1.5 shadow-xs cursor-pointer"
                  >
                    {guardando_estructura ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FFB600]" />
                    ) : (
                      <Save className="w-3.5 h-3.5 text-[#FFB600]" />
                    )}
                    Guardar Estructura de Puntos
                  </Button>
                </>
              )}
            </div>
          </div>

          {modo_edicion && (
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-300 text-xs text-amber-900 flex items-center justify-between gap-2">
              <span>
                <strong>Modo Edición de Puntos Activo:</strong> Puede ajustar el puntaje máximo de cada uno de los 5 módulos (deben sumar exactamente <strong>100 pts</strong>) y los puntos de cada criterio/sub-escala interna.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {criterios_modulos.map((c, idx) => (
              <div
                key={idx}
                className={`rounded-xl border p-4 flex flex-col justify-between space-y-3 shadow-xs transition-colors ${
                  modo_edicion
                    ? "border-[#00ABBD] bg-sky-50/30 ring-1 ring-[#00ABBD]/30"
                    : "border-[#E5E7EB] bg-slate-50/70 hover:border-[#00ABBD]"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB] gap-1.5">
                    <span className="font-bold text-sm text-[#035683] leading-tight">
                      {idx + 1}. {c.modulo}
                    </span>
                    {modo_edicion ? (
                      <div className="flex items-center gap-1 shrink-0">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={c.puntaje_maximo}
                          onChange={(e) =>
                            actualizarPuntajeMaximoModulo(idx, parseFloat(e.target.value) || 0)
                          }
                          className="w-16 h-7 text-xs font-mono font-bold text-center bg-white border-[#035683] rounded-lg px-1"
                        />
                        <span className="text-[10px] font-mono font-bold text-[#035683]">pts</span>
                      </div>
                    ) : (
                      <Badge className="bg-[#035683] text-white font-mono text-xs font-bold shrink-0">
                        {c.puntaje_maximo} pts
                      </Badge>
                    )}
                  </div>

                  <ul className="space-y-1.5 text-xs">
                    {c.reglas.map((r, r_idx) => (
                      <li
                        key={r_idx}
                        className="p-1.5 rounded-lg bg-white border border-[#E5E7EB]/60 flex items-center justify-between gap-1.5"
                      >
                        <span className="text-[11px] text-slate-700 leading-snug">{r.condicion}</span>
                        {modo_edicion ? (
                          <div className="flex items-center gap-1 shrink-0">
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={r.puntos}
                              onChange={(e) =>
                                actualizarPuntosRegla(idx, r_idx, parseFloat(e.target.value) || 0)
                              }
                              className="w-14 h-6 text-[11px] font-mono font-bold text-center bg-slate-50 border-[#00ABBD] rounded-md px-1"
                            />
                            <span className="text-[10px] font-mono text-[#035683] font-bold">pts</span>
                          </div>
                        ) : (
                          <strong className="font-mono text-xs text-[#035683] shrink-0">
                            {r.puntos} pts
                          </strong>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-[#E5E7EB]/60 text-[10px] text-muted-foreground flex items-start gap-1">
                  <Info className="w-3 h-3 text-[#00ABBD] shrink-0 mt-0.5" />
                  <span>{c.nota}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. TABLA OFICIAL DE RANGOS DE APROBACIÓN */}
        <div className="space-y-3 pt-2">
          <h3 className="text-base font-bold text-[#035683] flex items-center gap-2">
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
