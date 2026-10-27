"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
import { FormularioF03 } from "./formulario-f03";
import { FirmaDigital } from "./firma-digital";
import { CriteriosEvaluacionTabla } from "./criterios-evaluacion-tabla";
import { CuestionarioBienestarModal } from "./cuestionario-bienestar-modal";
import { FormularioMentorModal } from "./formulario-mentor-modal";
import { SabanaConsolidadoSemestral } from "./sabana-consolidado-semestral";
import {
  Award,
  CheckCircle,
  FileText,
  PenTool,
  Sparkles,
  TrendingUp,
  Users,
  BookOpen,
  HeartHandshake,
  Settings,
  CalendarPlus,
  AlertTriangle,
  Check,
  ShieldCheck,
  GraduationCap,
  QrCode,
  CalendarCheck,
  Clock,
  Home,
  DollarSign,
  Activity,
  Download,
} from "lucide-react";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import { toast } from "sonner";

export interface ModuloPonderado {
  id: number;
  clave: "liderazgo" | "academica" | "mentor" | "practicas" | "socioeconomica";
  nombre: string;
  evaluador_rol: string;
  ponderacion_porcentaje: number;
  puntaje_obtenido: number; // 0 - 100
  estado: "completado" | "pendiente";
}

// 5 Áreas canónicas de evaluación 360° con base flexible inicial del 20% cada una
const MODULOS_INICIALES_BASE_20: ModuloPonderado[] = [
  {
    id: 1,
    clave: "liderazgo",
    nombre: "1. Iglesia (Formulario Pastoral F-03)",
    evaluador_rol: "Pastor de la Congregación",
    ponderacion_porcentaje: 20,
    puntaje_obtenido: 95,
    estado: "completado",
  },
  {
    id: 2,
    clave: "academica",
    nombre: "2. Académica (Récord + Historial, Meta contractual ≥ 75 Pts)",
    evaluador_rol: "Estudiante Becario / Kárdex",
    ponderacion_porcentaje: 20,
    puntaje_obtenido: 90,
    estado: "completado",
  },
  {
    id: 3,
    clave: "mentor",
    nombre: "3. Mentor / Supervisor vía QR",
    evaluador_rol: "Supervisor Diaconía",
    ponderacion_porcentaje: 20,
    puntaje_obtenido: 92,
    estado: "completado",
  },
  {
    id: 4,
    clave: "practicas",
    nombre: "4. Escuela de Líderes (Viernes y Control de Multas)",
    evaluador_rol: "Coordinación / Control de Asistencia",
    ponderacion_porcentaje: 20,
    puntaje_obtenido: 88,
    estado: "completado",
  },
  {
    id: 5,
    clave: "socioeconomica",
    nombre: "5. Socioeconómica (Cuestionario de Bienestar 26 Preguntas)",
    evaluador_rol: "Trabajo Social",
    ponderacion_porcentaje: 20,
    puntaje_obtenido: 85,
    estado: "completado",
  },
];

export function MatrizEvaluacion360() {
  const { usuario } = usarAutenticacion();
  const es_admin = usuario?.rol === "administrador";

  const [modulos, set_modulos] = useState<ModuloPonderado[]>(MODULOS_INICIALES_BASE_20);
  const [firma_supervisor, set_firma_supervisor] = useState<string | null>(null);

  // Estados de modales para inspeccionar las 5 áreas
  const [modal_f03_abierto, set_modal_f03_abierto] = useState<boolean>(false);
  const [modal_academica_abierto, set_modal_academica_abierto] = useState<boolean>(false);
  const [modal_qr_abierto, set_modal_qr_abierto] = useState<boolean>(false);
  const [modal_lideres_abierto, set_modal_lideres_abierto] = useState<boolean>(false);
  const [modal_socioeconomica_abierto, set_modal_socioeconomica_abierto] = useState<boolean>(false);
  const [semaforo_socioeconomico, set_semaforo_socioeconomico] = useState<"verde" | "amarillo" | "rojo">("verde");

  // Estados del panel de configuración de matriz ponderada (Admin)
  const [panel_ponderacion_abierto, set_panel_ponderacion_abierto] = useState(false);
  const [ponderacion_temporal, set_ponderacion_temporal] = useState<Record<string, number>>({
    liderazgo: 20,
    academica: 20,
    mentor: 20,
    practicas: 20,
    socioeconomica: 20,
  });

  // Estados del modal Habilitar Nuevo Semestre (Admin)
  const [modal_nuevo_semestre_abierto, set_modal_nuevo_semestre_abierto] = useState(false);
  const [nombre_nuevo_semestre, set_nuevo_semestre_nombre] = useState("Semestre I · 2027");
  const [fecha_inicio_semestre, set_fecha_inicio_semestre] = useState("2027-01-15");
  const [fecha_fin_semestre, set_fecha_fin_semestre] = useState("2027-06-30");

  // Suma total de las 5 ponderaciones en edición
  const suma_ponderaciones = Object.values(ponderacion_temporal).reduce((a, b) => a + b, 0);
  const ponderaciones_validas = suma_ponderaciones === 100;

  // Cálculo matemático ponderado: Suma(Puntaje * Ponderacion / 100)
  const calificacion_total = modulos.reduce((acc, m) => {
    return acc + (m.puntaje_obtenido * m.ponderacion_porcentaje) / 100;
  }, 0);

  // Umbral contractual obligatorio (>= 75 puntos en área académica)
  const puntaje_academico = modulos.find((m) => m.clave === "academica")?.puntaje_obtenido ?? 0;
  const cumple_meta_contractual = puntaje_academico >= 75;

  const manejarPuntajeCambio = (id: number, nuevo_valor: number) => {
    const valor_limpio = Math.min(Math.max(nuevo_valor || 0, 0), 100);
    set_modulos((prev) =>
      prev.map((m) => (m.id === id ? { ...m, puntaje_obtenido: valor_limpio, estado: "completado" } : m))
    );
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

    toast.success("Ponderaciones actualizadas exitosamente (Suma exacta del 100%).");
    set_panel_ponderacion_abierto(false);
  };

  const manejarHabilitarNuevoSemestre = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ponderaciones_validas) {
      toast.error(`Las ponderaciones asignadas deben sumar 100%. Actual: ${suma_ponderaciones}%.`);
      return;
    }

    toast.success(
      `Nuevo período "${nombre_nuevo_semestre}" habilitado del ${fecha_inicio_semestre} al ${fecha_fin_semestre} con ponderación base del 20%.`,
      {
        description: "Se habilitó la recepción de expedientes, formularios F-03 y autoevaluaciones.",
      }
    );
    set_modal_nuevo_semestre_abierto(false);
  };

  const manejarMentorGuardado = (puntaje_20: number) => {
    set_modulos((prev) =>
      prev.map((m) =>
        m.clave === "mentor"
          ? { ...m, puntaje_obtenido: Math.round((puntaje_20 / 20) * 100), estado: "completado" }
          : m
      )
    );
  };

  const manejarBienestarGuardado = (puntaje_20: number, semaforo: "verde" | "amarillo" | "rojo") => {
    set_semaforo_socioeconomico(semaforo);
    set_modulos((prev) =>
      prev.map((m) =>
        m.clave === "socioeconomica"
          ? { ...m, puntaje_obtenido: Math.round((puntaje_20 / 20) * 100), estado: "completado" }
          : m
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. CABECERA CON CITA BÍBLICA INSTITUCIONAL DESTACADA (Tarjeta Devocional Diaconal) */}
      <Card className="border-[#E5E7EB] bg-gradient-to-r from-[#035683] via-[#09477e] to-[#035683] text-white rounded-2xl shadow-md overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#00ABBD]/20 via-transparent to-transparent pointer-events-none" />
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FFB600]/20 border border-[#FFB600]/30 flex items-center justify-center shrink-0 text-[#FFB600]">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#FFB600] text-[#035683] font-bold text-xs uppercase px-2.5 py-0.5">
                    Cita Bíblica Institucional
                  </Badge>
                  <span className="text-xs text-[#00ABBD] font-mono font-semibold">
                    Colosenses 3:23-24 (RVR1960)
                  </span>
                </div>
                <blockquote className="text-sm md:text-base font-serif italic text-white/95 leading-relaxed pt-1">
                  &ldquo;Y todo lo que hagáis, hacedlo de corazón, como para el Señor y no para los hombres; sabiendo que del Señor recibiréis la recompensa de la herencia, porque a Cristo el Señor servís.&rdquo;
                </blockquote>
                <p className="text-xs text-[#00ABBD] font-medium flex items-center gap-1.5 pt-0.5">
                  <HeartHandshake className="w-3.5 h-3.5" />
                  La evaluación integral en BUMAND mide el compromiso eclesial, excelencia académica (≥ 75 pts), acompañamiento de mentores y servicio diaconal.
                </p>
              </div>
            </div>

            {/* Acciones Exclusivas de Administrador en Cabecera */}
            {es_admin && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => set_panel_ponderacion_abierto(!panel_ponderacion_abierto)}
                  className="h-9 px-3 bg-white/10 hover:bg-white/20 text-white border-white/25 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <Settings className="w-3.5 h-3.5 text-[#FFB600]" />
                  Matriz Ponderada
                </Button>

                <Dialog open={modal_nuevo_semestre_abierto} onOpenChange={set_modal_nuevo_semestre_abierto}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="h-9 px-3 bg-[#00ABBD] hover:bg-[#00ABBD]/90 text-[#035683] font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                      Habilitar Nuevo Semestre
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    showCloseButton={false}
                    className="sm:max-w-[480px] p-0 overflow-hidden bg-white rounded-2xl border-[#E5E7EB] shadow-2xl"
                  >
                    <DialogHeader className="p-6 pb-4 border-b border-[#E5E7EB] bg-[#F8F9FA]">
                      <DialogTitle className="text-base font-bold text-[#035683] flex items-center gap-2">
                        <CalendarPlus className="w-5 h-5 text-[#00ABBD]" />
                        Habilitar Nuevo Período Semestral
                      </DialogTitle>
                      <DialogDescription className="text-xs text-muted-foreground">
                        Exclusivo Administrador: Apertura de ciclo de evaluación con base al 20%.
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={manejarHabilitarNuevoSemestre} className="flex flex-col">
                      <DialogBody className="p-6 space-y-4">
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold">Nombre del Período</Label>
                          <Input
                            value={nombre_nuevo_semestre}
                            onChange={(e) => set_nuevo_semestre_nombre(e.target.value)}
                            required
                            className="h-9 text-xs border-[#E5E7EB]"
                            placeholder="Ej. Semestre I · 2027"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs font-semibold">Fecha de Inicio</Label>
                            <Input
                              type="date"
                              value={fecha_inicio_semestre}
                              onChange={(e) => set_fecha_inicio_semestre(e.target.value)}
                              required
                              className="h-9 text-xs border-[#E5E7EB]"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs font-semibold">Fecha de Cierre</Label>
                            <Input
                              type="date"
                              value={fecha_fin_semestre}
                              onChange={(e) => set_fecha_fin_semestre(e.target.value)}
                              required
                              className="h-9 text-xs border-[#E5E7EB]"
                            />
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 border border-[#E5E7EB] rounded-xl text-xs space-y-1">
                          <p className="font-bold text-[#035683]">Ponderación Base Configurada:</p>
                          <p className="text-muted-foreground">
                            5 Áreas (1. Iglesia F-03, 2. Académica Meta ≥75, 3. Mentor QR, 4. Escuela de Líderes, 5. Socioeconómica) con base del 20% cada una (Total: 100%).
                          </p>
                        </div>
                      </DialogBody>

                      <DialogFooter className="p-4 border-t border-[#E5E7EB] bg-[#F8F9FA] flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => set_modal_nuevo_semestre_abierto(false)}
                          className="h-9 text-xs rounded-xl"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          className="h-9 bg-[#035683] hover:bg-[#035683]/90 text-white font-bold rounded-xl text-xs"
                        >
                          Confirmar y Habilitar
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 2. PANEL DE CONFIGURACIÓN DE MATRIZ PONDERADA (ADMINISTRADOR) */}
      {es_admin && panel_ponderacion_abierto && (
        <Card className="border-[#00ABBD] bg-white rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="bg-[#00ABBD]/10 pb-3 border-b border-[#00ABBD]/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-bold text-[#035683] flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#00ABBD]" />
                  Configuración de Matriz Ponderada (5 Ejes Flexibles)
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Ajuste la distribución porcentual para cada una de las 5 áreas. Valor base: 20% cada una.
                </CardDescription>
              </div>

              {/* Indicador Dinámico de Suma */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Suma Total:</span>
                <Badge
                  className={`font-mono text-xs font-bold px-2.5 py-0.5 ${
                    ponderaciones_validas
                      ? "bg-emerald-600 text-white"
                      : "bg-rose-600 text-white animate-pulse"
                  }`}
                >
                  {suma_ponderaciones}% / 100%
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { clave: "liderazgo", label: "1. Iglesia (F-03)", rol: "Pastor de la Congregación" },
                { clave: "academica", label: "2. Académica (≥75 Pts)", rol: "Estudiante / Kárdex" },
                { clave: "mentor", label: "3. Mentor (QR)", rol: "Supervisor Diaconía" },
                { clave: "practicas", label: "4. Esc. Líderes", rol: "Coordinación" },
                { clave: "socioeconomica", label: "5. Socioeconómica", rol: "Trabajo Social" },
              ].map((item) => (
                <div key={item.clave} className="p-3 rounded-xl border border-[#E5E7EB] bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-[#035683]">{item.label}</Label>
                    <span className="font-mono text-xs font-bold text-[#035683]">
                      {ponderacion_temporal[item.clave]}%
                    </span>
                  </div>
                  <Slider
                    min={5}
                    max={50}
                    step={1}
                    value={[ponderacion_temporal[item.clave]]}
                    onValueChange={(val) => {
                      const v = Array.isArray(val) ? val[0] : (val as unknown as number);
                      set_ponderacion_temporal((prev) => ({ ...prev, [item.clave]: v }));
                    }}
                    className="cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="truncate pr-1">{item.rol}</span>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={ponderacion_temporal[item.clave]}
                      onChange={(e) => {
                        const num = parseInt(e.target.value, 10) || 0;
                        set_ponderacion_temporal((prev) => ({ ...prev, [item.clave]: num }));
                      }}
                      className="w-14 h-7 text-xs text-center font-mono border-[#E5E7EB]"
                    />
                  </div>
                </div>
              ))}
            </div>

            {!ponderaciones_validas && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  Validación requerida: La suma debe ser exactamente <strong>100%</strong> para aplicar los cambios. Actualmente suma <strong>{suma_ponderaciones}%</strong> (diferencia: {100 - suma_ponderaciones}%).
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E7EB]/60">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  set_ponderacion_temporal({
                    liderazgo: 20,
                    academica: 20,
                    mentor: 20,
                    practicas: 20,
                    socioeconomica: 20,
                  })
                }
                className="h-9 text-xs rounded-xl border-[#E5E7EB]"
              >
                Restablecer Base 20%
              </Button>
              <Button
                size="sm"
                disabled={!ponderaciones_validas}
                onClick={manejarGuardarPonderaciones}
                className="h-9 px-4 bg-[#035683] hover:bg-[#035683]/90 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                Guardar Ponderaciones
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2.5 TABLA OFICIAL DE CRITERIOS DE EVALUACIÓN SEMESTRAL (23.jpeg) */}
      <CriteriosEvaluacionTabla />

      {/* 3. RESUMEN SUPERIOR DE RENDIMIENTO Y META CONTRACTUAL (4 TARJETAS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tarjeta 1: Calificación Ponderada Total */}
        <Card className="border-[#E5E7EB] bg-gradient-to-br from-[#035683] to-[#035683] text-white rounded-xl shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-mono text-[#00ABBD] uppercase font-bold">
                Calificación Ponderada Final
              </p>
              <h3 className="text-3xl font-display font-bold text-[#FFB600]">
                {calificacion_total.toFixed(1)} / 100
              </h3>
              <p className="text-xs text-white/90 font-medium">
                {calificacion_total >= 70
                  ? "Aprobación óptima (70 - 100 pts)"
                  : calificacion_total >= 51
                  ? "Aprobación Condicionada (51 - 69 pts)"
                  : "Reprobó y debe abandonar el programa (0 - 50 pts)"}
              </p>
            </div>
            <div className="p-3 bg-white/10 rounded-xl">
              <Award className="w-8 h-8 text-[#FFB600]" />
            </div>
          </CardContent>
        </Card>

        {/* Tarjeta 2: Meta Contractual Académica (>= 75 Pts) */}
        <Card className="border-[#E5E7EB] bg-white rounded-xl shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-mono text-muted-foreground uppercase font-bold">
                Meta Contractual (≥ 75 Pts)
              </p>
              <h3 className="text-3xl font-display font-bold text-[#035683]">
                {puntaje_academico.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">pts</span>
              </h3>
              <div className="pt-0.5">
                {cumple_meta_contractual ? (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-[11px] py-0.5">
                    <CheckCircle className="w-3 h-3 mr-1" /> Meta Cumplida (≥ 75 pts)
                  </Badge>
                ) : (
                  <Badge className="bg-rose-100 text-rose-800 border-rose-300 font-bold text-[11px] py-0.5">
                    <AlertTriangle className="w-3 h-3 mr-1" /> En Observación (&lt; 75 pts)
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Reglamento BUMAND: Mínimo 75 pts
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        {/* Tarjeta 3: Módulos Evaluados */}
        <Card className="border-[#E5E7EB] bg-white rounded-xl shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-mono text-muted-foreground uppercase font-bold">
                Módulos Evaluados
              </p>
              <h3 className="text-3xl font-display font-bold text-[#035683]">
                {modulos.filter((m) => m.estado === "completado").length} / 5
              </h3>
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> 100% de los 5 ejes completados
              </p>
            </div>
            <div className="p-3 bg-[#00ABBD]/10 rounded-xl">
              <Sparkles className="w-8 h-8 text-[#00ABBD]" />
            </div>
          </CardContent>
        </Card>

        {/* Tarjeta 4: Firma de Conformidad */}
        <Card className="border-[#E5E7EB] bg-white rounded-xl shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-mono text-muted-foreground uppercase font-bold">
                Firma de Conformidad
              </p>
              <div className="mt-1">
                {firma_supervisor ? (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-xs py-1">
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Tutor Firmante
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 font-bold text-xs py-1">
                    Firma Pendiente
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Acreditación semestral diaconal
              </p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl">
              <PenTool className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. MATRIZ DETALLADA DE LOS 5 MÓDULOS PONDERADOS */}
      <Card className="border-[#E5E7EB] shadow-sm bg-white rounded-xl">
        <CardHeader className="pb-3 border-b border-[#E5E7EB]/60">
          <CardTitle className="text-lg font-bold font-display text-[#035683]">
            Matriz de Evaluación Integral por Competencias (5 Ejes Institucionales)
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Estructura canónica del programa BUMAND: Iglesia F-03, Académica (≥ 75 pts), Mentor vía QR, Escuela de Líderes y Estudio Socioeconómico.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {modulos.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-xl border border-[#E5E7EB]/60 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#035683]">{m.nombre}</span>
                  <Badge variant="outline" className="font-mono text-[10px] border-[#00ABBD] text-[#035683]">
                    Peso: {m.ponderacion_porcentaje}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#00ABBD]" />
                  Evaluador: <strong className="text-[#1E293B]">{m.evaluador_rol}</strong>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">Nota (0-100):</span>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={m.puntaje_obtenido}
                    onChange={(e) => manejarPuntajeCambio(m.id, parseInt(e.target.value, 10))}
                    className="w-20 h-9 text-center font-mono font-bold text-sm border-[#E5E7EB]"
                  />
                </div>

                <div className="w-28 text-right font-mono text-xs">
                  <p className="text-muted-foreground text-[10px]">Aporte Final</p>
                  <p className="font-bold text-[#035683]">
                    +{((m.puntaje_obtenido * m.ponderacion_porcentaje) / 100).toFixed(1)} pts
                  </p>
                </div>

                {/* Acciones interactivas para cada una de las 5 áreas */}
                {m.clave === "liderazgo" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => set_modal_f03_abierto(true)}
                    className="h-9 px-3 border-[#00ABBD] text-[#035683] hover:bg-[#00ABBD]/10 text-xs font-bold flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Ver F-03
                  </Button>
                )}

                {m.clave === "academica" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => set_modal_academica_abierto(true)}
                    className="h-9 px-3 border-[#00ABBD] text-[#035683] hover:bg-[#00ABBD]/10 text-xs font-bold flex items-center gap-1.5"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    Récord (≥75)
                  </Button>
                )}

                {m.clave === "mentor" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => set_modal_qr_abierto(true)}
                    className="h-9 px-3 border-[#00ABBD] text-[#035683] hover:bg-[#00ABBD]/10 text-xs font-bold flex items-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    Código QR
                  </Button>
                )}

                {m.clave === "practicas" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => set_modal_lideres_abierto(true)}
                    className="h-9 px-3 border-[#00ABBD] text-[#035683] hover:bg-[#00ABBD]/10 text-xs font-bold flex items-center gap-1.5"
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    Viernes y Multas
                  </Button>
                )}

                {m.clave === "socioeconomica" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => set_modal_socioeconomica_abierto(true)}
                    className="h-9 px-3 border-[#00ABBD] text-[#035683] hover:bg-[#00ABBD]/10 text-xs font-bold flex items-center gap-1.5"
                  >
                    <HeartHandshake className="w-3.5 h-3.5" />
                    Socioeconómica (26P)
                  </Button>
                )}
              </div>
            </div>
          ))}

          {/* Sección de Firma Digital */}
          <div className="mt-6 pt-4 border-t border-[#E5E7EB]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-[#035683]">Acreditación con Firma Digital</h4>
              <p className="text-xs text-muted-foreground">
                El tutor o supervisor responsable debe asentar su rúbrica para cerrar la evaluación semestral.
              </p>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="h-10 px-5 bg-[#035683] hover:bg-[#035683]/90 text-white font-bold rounded-xl flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-[#FFB600]" />
                  {firma_supervisor ? "Modificar Firma" : "Firmar Evaluación"}
                </Button>
              </DialogTrigger>
              <DialogContent showCloseButton={false} className="sm:max-w-[460px] max-h-[90vh] p-0 border-none bg-transparent shadow-none">
                <FirmaDigital
                  alFirmar={(b64) => {
                    set_firma_supervisor(b64);
                    toast.success("Firma registrada exitosamente", {
                      description: "La evaluación ha sido acreditada formalmente.",
                    });
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* ============================================================== */}
      {/* MODAL 1: FORMULARIO PASTORAL F-03 (3 SECCIONES CANÓNICAS)      */}
      {/* ============================================================== */}
      <Dialog open={modal_f03_abierto} onOpenChange={set_modal_f03_abierto}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl bg-white border border-[#E5E7EB] shadow-2xl"
        >
          <DialogHeader className="p-5 pb-3 border-b border-[#E5E7EB] bg-[#F8F9FA] shrink-0">
            <DialogTitle className="font-display text-lg text-[#035683]">
              Módulo 1 · Formulario Pastoral F-03
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Evaluación del compromiso eclesial y testimonio ministerial del becario.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="p-6 space-y-4 flex-1 overflow-y-auto">
            <FormularioF03
              becario_id={1}
              nombre_becario_inicial="María Catunta Laime"
              alEnviarExito={() => set_modal_f03_abierto(false)}
            />
          </DialogBody>
          <DialogFooter className="p-4 border-t border-[#E5E7EB] bg-[#F8F9FA] flex justify-end shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => set_modal_f03_abierto(false)}
              className="text-xs border-[#E5E7EB] rounded-xl"
            >
              Cerrar Formulario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* MODAL 2: AUTOEVALUACIÓN ACADÉMICA (RÉCORD + META ≥ 75 PTS)     */}
      {/* ============================================================== */}
      <Dialog open={modal_academica_abierto} onOpenChange={set_modal_academica_abierto}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl bg-white border border-[#E5E7EB] shadow-2xl"
        >
          <DialogHeader className="p-5 pb-3 border-b border-[#E5E7EB] bg-[#F8F9FA] shrink-0">
            <DialogTitle className="font-display text-lg text-[#035683]">
              Módulo 2 · Autoevaluación Académica (Récord + Historial)
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Supervisión de excelencia académica y cumplimiento de la meta contractual obligatoria (≥ 75 pts).
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="p-6 space-y-5 flex-1 overflow-y-auto">
            {/* Banner de Meta Contractual */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-800">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">
                    Meta Contractual Vigente (≥ 75 Pts): CUMPLIDA
                  </h4>
                  <p className="text-xs text-emerald-700">
                    Promedio registrado: <strong className="font-mono text-sm">{puntaje_academico.toFixed(1)} / 100 pts</strong> (Supera el umbral mínimo por {(puntaje_academico - 75).toFixed(1)} pts).
                  </p>
                </div>
              </div>
              <Badge className="bg-emerald-600 text-white font-mono text-xs px-3 py-1 self-start sm:self-auto">
                Acreditación Vigente
              </Badge>
            </div>

            {/* Ficha de Asignaturas Cursadas */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#035683] flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#00ABBD]" />
                Historial de Materias Cursadas · Semestre Actual
              </h4>
              <div className="border border-[#E5E7EB] rounded-xl overflow-hidden bg-white">
                <table className="w-full text-xs">
                  <thead className="bg-[#F8F9FA] border-b border-[#E5E7EB] text-[#035683] font-bold">
                    <tr>
                      <th className="py-2.5 px-3 text-left">Código / Materia</th>
                      <th className="py-2.5 px-3 text-center">Docente</th>
                      <th className="py-2.5 px-3 text-center">Nota Final</th>
                      <th className="py-2.5 px-3 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]/60">
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">SIS-311 · Programación III</td>
                      <td className="py-2.5 px-3 text-center text-muted-foreground">Ing. Carlos Vargas</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-[#035683]">85 pts</td>
                      <td className="py-2.5 px-3 text-center">
                        <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Aprobada</Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">SIS-312 · Base de Datos II</td>
                      <td className="py-2.5 px-3 text-center text-muted-foreground">Lic. Marlene Quispe</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-[#035683]">88 pts</td>
                      <td className="py-2.5 px-3 text-center">
                        <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Aprobada</Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">MAT-313 · Cálculo Numérico</td>
                      <td className="py-2.5 px-3 text-center text-muted-foreground">Ing. Roberto Blanco</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-[#035683]">82 pts</td>
                      <td className="py-2.5 px-3 text-center">
                        <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Aprobada</Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">TEO-102 · Liderazgo y Ética Diaconal</td>
                      <td className="py-2.5 px-3 text-center text-muted-foreground">Pr. Juan Ramos</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-[#035683]">95 pts</td>
                      <td className="py-2.5 px-3 text-center">
                        <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Sobresaliente</Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Documento de Respaldo */}
            <div className="p-3.5 bg-slate-50 border border-[#E5E7EB] rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#035683]/10 rounded-lg text-[#035683]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#035683]">Record_Academico_S2_2026_Oficial.pdf</p>
                  <p className="text-[11px] text-muted-foreground">Sellado y legalizado por Kárdex Universitario · 1.4 MB</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.success("Descargando récord académico en formato PDF.")}
                className="text-xs h-8 px-3 border-[#00ABBD] text-[#035683] rounded-lg"
              >
                <Download className="w-3.5 h-3.5 mr-1" /> Descargar
              </Button>
            </div>
          </DialogBody>
          <DialogFooter className="p-4 border-t border-[#E5E7EB] bg-[#F8F9FA] flex justify-end shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => set_modal_academica_abierto(false)}
              className="text-xs border-[#E5E7EB] rounded-xl"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* MODAL 3: EVALUACIÓN DEL MENTOR (18 ESCALA 1-10 + 3 ABIERTAS)  */}
      {/* ============================================================== */}
      <FormularioMentorModal
        abierto={modal_qr_abierto}
        alCambiarAbierto={set_modal_qr_abierto}
        becario_id={1}
        nombre_becario="María Catunta Laime"
        unidad_agencia_inicial="Jefatura de Planificación, Control y Presupuesto"
        alGuardarExito={manejarMentorGuardado}
      />

      {/* ============================================================== */}
      {/* MODAL 4: ESCUELA DE LÍDERES (VIERNES Y CONTROL DE MULTAS)       */}
      {/* ============================================================== */}
      <Dialog open={modal_lideres_abierto} onOpenChange={set_modal_lideres_abierto}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl bg-white border border-[#E5E7EB] shadow-2xl"
        >
          <DialogHeader className="p-5 pb-3 border-b border-[#E5E7EB] bg-[#F8F9FA] shrink-0">
            <DialogTitle className="font-display text-lg text-[#035683]">
              Módulo 4 · Escuela de Líderes (Viernes y Control de Multas)
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Sesiones obligatorias de formación diaconal (Viernes 18:30 a 20:30).
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="p-6 space-y-5 flex-1 overflow-y-auto">
            {/* Escala oficial de multas */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#035683] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#00ABBD]" />
                Escala Institucional de Multas por Impuntualidad (Viernes)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-center">
                  <span className="text-muted-foreground text-[10px] block">1 a 10 min</span>
                  <span className="font-mono font-bold text-amber-900 text-sm">Bs 10.00</span>
                </div>
                <div className="p-3 rounded-xl border border-orange-200 bg-orange-50 text-center">
                  <span className="text-muted-foreground text-[10px] block">11 a 30 min</span>
                  <span className="font-mono font-bold text-orange-900 text-sm">Bs 20.00</span>
                </div>
                <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-center">
                  <span className="text-muted-foreground text-[10px] block">31 a 60 min</span>
                  <span className="font-mono font-bold text-rose-900 text-sm">Bs 30.00</span>
                </div>
                <div className="p-3 rounded-xl border border-red-300 bg-red-100 text-center">
                  <span className="text-muted-foreground text-[10px] block">&gt; 60 min / Falta</span>
                  <span className="font-mono font-bold text-red-950 text-sm">Bs 50.00</span>
                </div>
              </div>
            </div>

            {/* Historial de la Estudiante */}
            <div className="p-4 rounded-xl border border-[#E5E7EB] bg-slate-50 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#035683]">Historial del Semestre Actual:</span>
                <Badge className="bg-emerald-100 text-emerald-800 font-mono text-[10px]">
                  94% Asistencia Cumplida
                </Badge>
              </div>
              <div className="space-y-1.5 text-muted-foreground">
                <div className="flex justify-between py-1 border-b border-[#E5E7EB]/60">
                  <span>Sesiones realizadas en el semestre:</span>
                  <strong className="text-slate-800 font-mono">16 sesiones</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E5E7EB]/60">
                  <span>Asistencias puntuales:</span>
                  <strong className="text-emerald-700 font-mono">15 sesiones</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E5E7EB]/60">
                  <span>Retrasos registrados:</span>
                  <strong className="text-amber-700 font-mono">1 retraso (14 min el 08/08/2026)</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span>Total multas liquidadas:</span>
                  <strong className="text-emerald-800 font-mono">Bs 20.00 (Cancelado en caja)</strong>
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogFooter className="p-4 border-t border-[#E5E7EB] bg-[#F8F9FA] flex justify-end shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => set_modal_lideres_abierto(false)}
              className="text-xs border-[#E5E7EB] rounded-xl"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* ============================================================== */}
      {/* MODAL 5: CUESTIONARIO DE BIENESTAR UNIVERSITARIO (26 PREGUNTAS)*/}
      {/* ============================================================== */}
      <CuestionarioBienestarModal
        abierto={modal_socioeconomica_abierto}
        alCambiarAbierto={set_modal_socioeconomica_abierto}
        becario_id={1}
        nombre_becario="María Catunta Laime"
        alGuardarExito={manejarBienestarGuardado}
      />

      {/* ============================================================== */}
      {/* 5. SÁBANA CONSOLIDADA SEMESTRAL (21 BECARIOS, NOTAS CETI Y PDF) */}
      {/* ============================================================== */}
      <div className="pt-4">
        <SabanaConsolidadoSemestral />
      </div>
    </div>
  );
}
