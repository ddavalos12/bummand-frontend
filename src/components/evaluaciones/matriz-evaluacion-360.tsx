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
  DialogTrigger,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { FormularioF03 } from "./formulario-f03";
import { FirmaDigital } from "./firma-digital";
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
  Lock,
} from "lucide-react";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import { toast } from "sonner";

export interface ModuloPonderado {
  id: number;
  clave: "academica" | "liderazgo" | "practicas" | "mentor" | "socioeconomica";
  nombre: string;
  evaluador_rol: string;
  ponderacion_porcentaje: number;
  puntaje_obtenido: number; // 0 - 100
  estado: "completado" | "pendiente";
}

// 5 Áreas con ponderación base del 20% cada una
const MODULOS_INICIALES_BASE_20: ModuloPonderado[] = [
  {
    id: 1,
    clave: "academica",
    nombre: "Área Académica (Autoevaluación)",
    evaluador_rol: "Estudiante Becario",
    ponderacion_porcentaje: 20,
    puntaje_obtenido: 90,
    estado: "completado",
  },
  {
    id: 2,
    clave: "liderazgo",
    nombre: "Área Liderazgo en la Iglesia (Formulario F-03)",
    evaluador_rol: "Pastor de la Congregación",
    ponderacion_porcentaje: 20,
    puntaje_obtenido: 95,
    estado: "completado",
  },
  {
    id: 3,
    clave: "practicas",
    nombre: "Área Prácticas en Sede (Cumplimiento de Horas)",
    evaluador_rol: "Responsable de Agencia",
    ponderacion_porcentaje: 20,
    puntaje_obtenido: 88,
    estado: "completado",
  },
  {
    id: 4,
    clave: "mentor",
    nombre: "Área Mentor (Acompañamiento Formativo)",
    evaluador_rol: "Supervisor Diaconía",
    ponderacion_porcentaje: 20,
    puntaje_obtenido: 92,
    estado: "completado",
  },
  {
    id: 5,
    clave: "socioeconomica",
    nombre: "Área Socioeconómica (Situación Familiar)",
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

  // Estados del panel de configuración de matriz ponderada (Admin)
  const [panel_ponderacion_abierto, set_panel_ponderacion_abierto] = useState(false);
  const [ponderacion_temporal, set_ponderacion_temporal] = useState<Record<string, number>>({
    academica: 20,
    liderazgo: 20,
    practicas: 20,
    mentor: 20,
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

  return (
    <div className="space-y-6">
      {/* 1. CABECERA CON CITA BÍBLICA INSTITUCIONAL DESTACADA (Tarjeta Devocional Diaconal) */}
      <Card className="border-[#E3DCCB] bg-gradient-to-r from-[#063A6B] via-[#09477e] to-[#063A6B] text-white rounded-2xl shadow-md overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#17B4C4]/20 via-transparent to-transparent pointer-events-none" />
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F8C766]/20 border border-[#F8C766]/30 flex items-center justify-center shrink-0 text-[#F8C766]">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#F8C766] text-[#063A6B] font-bold text-xs uppercase px-2.5 py-0.5">
                    Cita Bíblica Institucional
                  </Badge>
                  <span className="text-xs text-[#7FE0E6] font-mono font-semibold">
                    Colosenses 3:23-24 (RVR1960)
                  </span>
                </div>
                <blockquote className="text-sm md:text-base font-serif italic text-white/95 leading-relaxed pt-1">
                  &ldquo;Y todo lo que hagáis, hacedlo de corazón, como para el Señor y no para los hombres; sabiendo que del Señor recibiréis la recompensa de la herencia, porque a Cristo el Señor servís.&rdquo;
                </blockquote>
                <p className="text-xs text-[#7FE0E6] font-medium flex items-center gap-1.5 pt-0.5">
                  <HeartHandshake className="w-3.5 h-3.5" />
                  La evaluación integral 360° en BUMAND mide el compromiso ético, excelencia académica y vocación de servicio diaconal.
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
                  <Settings className="w-3.5 h-3.5 text-[#F8C766]" />
                  Matriz Ponderada
                </Button>

                <Dialog open={modal_nuevo_semestre_abierto} onOpenChange={set_modal_nuevo_semestre_abierto}>
                  {/* @ts-ignore */}
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="h-9 px-3 bg-[#17B4C4] hover:bg-[#17B4C4]/90 text-[#063A6B] font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                      Habilitar Nuevo Semestre
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    showCloseButton={false}
                    className="sm:max-w-[480px] p-0 overflow-hidden bg-white rounded-2xl border-[#E3DCCB] shadow-2xl"
                  >
                    <DialogHeader className="p-6 pb-4 border-b border-[#E3DCCB] bg-[#F8F9FA]">
                      <DialogTitle className="text-base font-bold text-[#063A6B] flex items-center gap-2">
                        <CalendarPlus className="w-5 h-5 text-[#17B4C4]" />
                        Habilitar Nuevo Período Semestral
                      </DialogTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Exclusivo Administrador: Apertura de ciclo de evaluación 360° con base al 20%.
                      </CardDescription>
                    </DialogHeader>

                    <form onSubmit={manejarHabilitarNuevoSemestre} className="p-6 space-y-4">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Nombre del Período</Label>
                        <Input
                          value={nombre_nuevo_semestre}
                          onChange={(e) => set_nuevo_semestre_nombre(e.target.value)}
                          required
                          className="h-9 text-xs border-[#E3DCCB]"
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
                            className="h-9 text-xs border-[#E3DCCB]"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold">Fecha de Cierre</Label>
                          <Input
                            type="date"
                            value={fecha_fin_semestre}
                            onChange={(e) => set_fecha_fin_semestre(e.target.value)}
                            required
                            className="h-9 text-xs border-[#E3DCCB]"
                          />
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 border border-[#E3DCCB] rounded-xl text-xs space-y-1">
                        <p className="font-bold text-[#063A6B]">Ponderación Base Configurada:</p>
                        <p className="text-muted-foreground">
                          5 Áreas (Académica, Liderazgo, Prácticas, Mentor, Socioeconómica) con base del 20% cada una (Total: 100%).
                        </p>
                      </div>

                      <DialogFooter className="pt-2 flex justify-end gap-2">
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
                          className="h-9 bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold rounded-xl text-xs"
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
        <Card className="border-[#17B4C4] bg-white rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="bg-[#17B4C4]/10 pb-3 border-b border-[#17B4C4]/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-bold text-[#063A6B] flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#17B4C4]" />
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
                { clave: "academica", label: "Académica (Autoev.)", rol: "Becario" },
                { clave: "liderazgo", label: "Liderazgo (F-03)", rol: "Pastor" },
                { clave: "practicas", label: "Prácticas Sede", rol: "Agencia" },
                { clave: "mentor", label: "Mentor Formativo", rol: "Supervisor" },
                { clave: "socioeconomica", label: "Socioeconómica", rol: "Trab. Social" },
              ].map((item) => (
                <div key={item.clave} className="p-3 rounded-xl border border-[#E3DCCB] bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-[#063A6B]">{item.label}</Label>
                    <span className="font-mono text-xs font-bold text-[#063A6B]">
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
                    <span>{item.rol}</span>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={ponderacion_temporal[item.clave]}
                      onChange={(e) => {
                        const num = parseInt(e.target.value, 10) || 0;
                        set_ponderacion_temporal((prev) => ({ ...prev, [item.clave]: num }));
                      }}
                      className="w-14 h-7 text-xs text-center font-mono border-[#E3DCCB]"
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

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E3DCCB]/60">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  set_ponderacion_temporal({
                    academica: 20,
                    liderazgo: 20,
                    practicas: 20,
                    mentor: 20,
                    socioeconomica: 20,
                  })
                }
                className="h-9 text-xs rounded-xl border-[#E3DCCB]"
              >
                Restablecer Base 20%
              </Button>
              <Button
                size="sm"
                disabled={!ponderaciones_validas}
                onClick={manejarGuardarPonderaciones}
                className="h-9 px-4 bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                Guardar Ponderaciones
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3. RESUMEN SUPERIOR DE RENDIMIENTO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-[#E3DCCB] bg-gradient-to-br from-[#063A6B] to-[#04284d] text-white rounded-xl shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-mono text-[#7FE0E6] uppercase font-bold">
                Calificación 360° Ponderada
              </p>
              <h3 className="text-3xl font-display font-bold text-[#F8C766]">
                {calificacion_total.toFixed(1)} / 100
              </h3>
              <p className="text-xs text-white/70">
                {calificacion_total >= 90
                  ? "Rendimiento Sobresaliente"
                  : calificacion_total >= 80
                  ? "Rendimiento Muy Bueno"
                  : "En Observación"}
              </p>
            </div>
            <div className="p-3 bg-white/10 rounded-xl">
              <Award className="w-8 h-8 text-[#F8C766]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E3DCCB] bg-white rounded-xl shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-mono text-muted-foreground uppercase font-bold">
                Módulos Evaluados
              </p>
              <h3 className="text-3xl font-display font-bold text-[#063A6B]">
                {modulos.filter((m) => m.estado === "completado").length} / 5
              </h3>
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> 100% de los 5 ejes completados
              </p>
            </div>
            <div className="p-3 bg-[#17B4C4]/10 rounded-xl">
              <Sparkles className="w-8 h-8 text-[#17B4C4]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E3DCCB] bg-white rounded-xl shadow-sm">
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
                Validación para acreditación semestral
              </p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl">
              <PenTool className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. MATRIZ DETALLADA DE LOS 5 MÓDULOS PONDERADOS */}
      <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-xl">
        <CardHeader className="pb-3 border-b border-[#E3DCCB]/60">
          <CardTitle className="text-lg font-bold font-display text-[#063A6B]">
            Matriz de Evaluación Integral por Competencias (5 Ejes Flexibles)
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Basado en la estructura del proyecto de grado y el formulario eclesiástico oficial F-03.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {modulos.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-xl border border-[#E3DCCB]/60 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#063A6B]">{m.nombre}</span>
                  <Badge variant="outline" className="font-mono text-[10px] border-[#17B4C4] text-[#063A6B]">
                    Peso: {m.ponderacion_porcentaje}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#17B4C4]" />
                  Evaluador: <strong className="text-[#1E293B]">{m.evaluador_rol}</strong>
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">Nota (0-100):</span>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={m.puntaje_obtenido}
                    onChange={(e) => manejarPuntajeCambio(m.id, parseInt(e.target.value, 10))}
                    className="w-20 h-9 text-center font-mono font-bold text-sm border-[#E3DCCB]"
                  />
                </div>

                <div className="w-28 text-right font-mono text-xs">
                  <p className="text-muted-foreground text-[10px]">Aporte Final</p>
                  <p className="font-bold text-[#063A6B]">
                    +{((m.puntaje_obtenido * m.ponderacion_porcentaje) / 100).toFixed(1)} pts
                  </p>
                </div>

                {m.clave === "liderazgo" && (
                  <Dialog>
                    {/* @ts-ignore */}
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9 px-3 border-[#17B4C4] text-[#063A6B] hover:bg-[#17B4C4]/10 text-xs font-bold flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Ver F-03
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] max-h-[90vh] p-0 border-none bg-transparent shadow-none">
                      <FormularioF03 becario_id={1} />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          ))}

          {/* Sección de Firma Digital */}
          <div className="mt-6 pt-4 border-t border-[#E3DCCB]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-[#063A6B]">Acreditación con Firma Digital</h4>
              <p className="text-xs text-muted-foreground">
                El tutor o supervisor responsable debe asentar su rúbrica para cerrar la evaluación semestral.
              </p>
            </div>

            <Dialog>
              {/* @ts-ignore */}
              <DialogTrigger asChild>
                <Button className="h-10 px-5 bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold rounded-xl flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-[#F8C766]" />
                  {firma_supervisor ? "Modificar Firma" : "Firmar Evaluación"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[460px] max-h-[90vh] p-0 border-none bg-transparent shadow-none">
                <FirmaDigital
                  alFirmar={(b64) => {
                    set_firma_supervisor(b64);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
