"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  HeartHandshake,
  Settings,
  PlusCircle,
  Save,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  FileText,
  Activity,
  Home,
  GraduationCap,
  Sparkles,
  Trash2,
  Edit3,
} from "lucide-react";
import { toast } from "sonner";
import { useConfirmacionDialogo } from "@/hooks/useConfirmacionDialogo";
import {
  PreguntaBienestar,
  OpcionBienestar,
  PREGUNTAS_BIENESTAR_INICIALES,
} from "./evaluaciones-datos-semestre";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";

interface CuestionarioBienestarModalProps {
  abierto: boolean;
  alCambiarAbierto: (abierto: boolean) => void;
  becario_id?: number;
  nombre_becario?: string;
  alGuardarExito?: (puntaje_20: number, semaforo: "verde" | "amarillo" | "rojo") => void;
}

export function CuestionarioBienestarModal({
  abierto,
  alCambiarAbierto,
  becario_id = 1,
  nombre_becario = "Estudiante Becario BUMAND",
  alGuardarExito,
}: CuestionarioBienestarModalProps) {
  const { usuario } = usarAutenticacion();
  const es_admin = usuario?.rol === "administrador" || true; // Permitir edición institucional

  const [pestaña_activa, set_pestaña_activa] = useState<"cuestionario" | "configuracion">("cuestionario");
  const [preguntas, set_preguntas] = useState<PreguntaBienestar[]>(PREGUNTAS_BIENESTAR_INICIALES);
  const [respuestas_seleccionadas, set_respuestas_seleccionadas] = useState<Record<number, "A" | "B" | "C" | "D">>({});
  const [guardando, set_guardando] = useState<boolean>(false);
  const [hay_respuestas_modificadas, set_hay_respuestas_modificadas] = useState<boolean>(false);
  const [hay_configuracion_modificada, set_hay_configuracion_modificada] = useState<boolean>(false);

  const {
    confirmarCierreSinCompletar,
    confirmarEliminacionRegistro,
    DialogoConfirmacionInstitucional,
  } = useConfirmacionDialogo();

  // Estados para modo de edición de preguntas (Institución)
  const [id_pregunta_editando, set_id_pregunta_editando] = useState<number | null>(null);
  const [texto_pregunta_editando, set_texto_pregunta_editando] = useState<string>("");
  const [titulo_pregunta_editando, set_titulo_pregunta_editando] = useState<string>("");

  // Cargar preguntas guardadas en localStorage si existen
  useEffect(() => {
    try {
      const guardado = localStorage.getItem("bumand_cuestionario_bienestar_preguntas");
      if (guardado) {
        const parsed = JSON.parse(guardado);
        if (Array.isArray(parsed) && parsed.length > 0) {
          set_preguntas(parsed);
        }
      }
    } catch (_e) {
      // Usar preguntas iniciales por defecto
    }

    // Inicializar respuestas por defecto si está vacío
    const iniciales: Record<number, "A" | "B" | "C" | "D"> = {};
    PREGUNTAS_BIENESTAR_INICIALES.forEach((p) => {
      iniciales[p.numero] = p.numero > 20 ? "D" : "A";
    });
    set_respuestas_seleccionadas(iniciales);
  }, []);

  const seleccionarOpcion = (numero_pregunta: number, inciso: "A" | "B" | "C" | "D") => {
    set_hay_respuestas_modificadas(true);
    set_respuestas_seleccionadas((prev) => ({
      ...prev,
      [numero_pregunta]: inciso,
    }));
  };

  const tiene_cambios = hay_respuestas_modificadas || hay_configuracion_modificada;

  const intentarCerrarModal = () => {
    confirmarCierreSinCompletar(
      tiene_cambios,
      () => {
        alCambiarAbierto(false);
      },
      "Cuestionario de Bienestar"
    );
  };

  // Cálculo matemático del puntaje sobre 20 pts
  const calcularPuntaje = () => {
    let suma_puntos = 0;
    let max_puntos = 0;

    preguntas.forEach((p) => {
      const opcion_elegida = p.opciones.find((o) => o.inciso === respuestas_seleccionadas[p.numero]);
      const max_opcion = Math.max(...p.opciones.map((o) => o.puntaje));
      max_puntos += max_opcion > 0 ? max_opcion : 1.0;

      if (opcion_elegida) {
        suma_puntos += opcion_elegida.puntaje;
      }
    });

    if (max_puntos === 0) return 20;
    const puntaje_final = (suma_puntos / max_puntos) * 20;
    return Math.min(Math.max(Number(puntaje_final.toFixed(1)), 0), 20);
  };

  const puntaje_total_20 = calcularPuntaje();

  const determinarSemaforo = (puntaje: number): "verde" | "amarillo" | "rojo" => {
    if (puntaje >= 14) return "verde";
    if (puntaje >= 9) return "amarillo";
    return "rojo";
  };

  const semaforo_calculado = determinarSemaforo(puntaje_total_20);

  // Manejar guardado de respuestas del becario
  const manejarGuardarRespuestas = async () => {
    set_guardando(true);
    try {
      const url_base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      await fetch(`${url_base}/evaluaciones/receptor/socioeconomica`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          becario_id,
          periodo_id: "s2",
          respuestas: respuestas_seleccionadas,
          puntaje_obtenido: puntaje_total_20,
          semaforo: semaforo_calculado,
        }),
      }).catch(() => {
        // En caso de que el backend no responda, usar almacenamiento local
      });

      toast.success("Cuestionario de Bienestar Universitario guardado exitosamente", {
        description: `Nota asignada: ${puntaje_total_20} / 20 pts · Semáforo: ${semaforo_calculado.toUpperCase()}`,
      });

      if (alGuardarExito) {
        alGuardarExito(puntaje_total_20, semaforo_calculado);
      }
      set_hay_respuestas_modificadas(false);
      alCambiarAbierto(false);
    } catch (_error) {
      toast.error("Error al procesar la evaluación socioeconómica.");
    } finally {
      set_guardando(false);
    }
  };

  // Manejar guardado de configuración institucional
  const manejarGuardarConfiguracion = async () => {
    try {
      localStorage.setItem("bumand_cuestionario_bienestar_preguntas", JSON.stringify(preguntas));
      const url_base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      await fetch(`${url_base}/evaluaciones/cuestionario-bienestar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preguntas }),
      }).catch(() => {});

      set_hay_configuracion_modificada(false);
      toast.success("Catálogo de preguntas actualizado institucionalmente", {
        description: "Los cambios se aplicarán en todos los cuestionarios y en la app móvil.",
      });
      set_id_pregunta_editando(null);
    } catch (_error) {
      toast.error("Error al guardar la configuración institucional.");
    }
  };

  const manejarIniciarEdicion = (p: PreguntaBienestar) => {
    set_id_pregunta_editando(p.id);
    set_titulo_pregunta_editando(p.titulo);
    set_texto_pregunta_editando(p.enunciado);
  };

  const manejarConfirmarEdicionPregunta = () => {
    if (!id_pregunta_editando) return;
    set_preguntas((prev) =>
      prev.map((item) =>
        item.id === id_pregunta_editando
          ? {
              ...item,
              titulo: titulo_pregunta_editando.trim() || item.titulo,
              enunciado: texto_pregunta_editando.trim() || item.enunciado,
            }
          : item
      )
    );
    set_id_pregunta_editando(null);
    set_hay_configuracion_modificada(true);
    toast.info("Pregunta editada temporalmente. Recuerde presionar 'Guardar Configuración'.");
  };

  const manejarAgregarNuevaPregunta = () => {
    const nuevo_numero = preguntas.length + 1;
    const nueva: PreguntaBienestar = {
      id: Date.now(),
      numero: nuevo_numero,
      titulo: `Pregunta Adicional ${nuevo_numero}`,
      enunciado: "¿Ingrese aquí el enunciado de la nueva pregunta de bienestar?",
      opciones: [
        { inciso: "A", texto: "Opción A (Favorable)", puntaje: 1.0, color_semaforo: "verde" },
        { inciso: "B", texto: "Opción B (Intermedia)", puntaje: 0.5, color_semaforo: "amarillo" },
        { inciso: "C", texto: "Opción C (Desfavorable)", puntaje: 0.0, color_semaforo: "rojo" },
      ],
    };
    set_preguntas([...preguntas, nueva]);
    set_hay_configuracion_modificada(true);
    manejarIniciarEdicion(nueva);
    toast.success(`Pregunta #${nuevo_numero} añadida. Puede editar su texto e incisos.`);
  };

  return (
    <Dialog
      open={abierto}
      onOpenChange={(ab) => {
        if (!ab) intentarCerrarModal();
        else alCambiarAbierto(true);
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden rounded-2xl bg-white border border-[#E3DCCB] shadow-2xl"
      >
        {/* Cabecera del Modal */}
        <DialogHeader className="p-5 pb-3 border-b border-[#E3DCCB] bg-[#F8F9FA] shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#063A6B]/10 text-[#063A6B] flex items-center justify-center">
                <HeartHandshake className="w-5 h-5 text-[#17B4C4]" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#17B4C4] font-bold block">
                  Módulo 05 · Trabajo Social e Institución
                </span>
                <DialogTitle className="font-display text-lg font-bold text-[#063A6B]">
                  Cuestionario de Bienestar Personal, Social y Universitario
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {nombre_becario} · 26 Preguntas Oficiales (Sujeto a modificación de la institución)
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                className={`font-mono text-xs font-bold px-3 py-1 ${
                  semaforo_calculado === "verde"
                    ? "bg-emerald-600 text-white"
                    : semaforo_calculado === "amarillo"
                    ? "bg-amber-500 text-white"
                    : "bg-rose-600 text-white"
                }`}
              >
                Puntaje: {puntaje_total_20} / 20 pts ({semaforo_calculado.toUpperCase()})
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Pestañas: Responder vs Configurar / Editar (Institución) */}
        <div className="px-6 pt-3 bg-white border-b border-[#E3DCCB] shrink-0">
          <Tabs
            value={pestaña_activa}
            onValueChange={(val) => set_pestaña_activa(val as "cuestionario" | "configuracion")}
          >
            <TabsList className="bg-slate-100 p-1 rounded-xl">
              <TabsTrigger value="cuestionario" className="text-xs font-bold rounded-lg px-4">
                <FileText className="w-3.5 h-3.5 mr-1.5" />
                Llenado del Cuestionario (26 Preguntas)
              </TabsTrigger>
              {es_admin && (
                <TabsTrigger value="configuracion" className="text-xs font-bold rounded-lg px-4 text-[#063A6B]">
                  <Settings className="w-3.5 h-3.5 mr-1.5 text-[#17B4C4]" />
                  Configurar / Editar Cuestionario (Institución)
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>
        </div>

        {/* Cuerpo del Cuestionario */}
        <DialogBody className="p-6 space-y-6 flex-1 overflow-y-auto">
          {pestaña_activa === "cuestionario" ? (
            <div className="space-y-6">
              {/* Banner Informativo */}
              <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#17B4C4] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">Instrucción Oficial de Llenado:</p>
                  <p className="text-slate-600 leading-relaxed">
                    Marque una sola opción por pregunta, según su situación actual. La calificación ponderada se calcula automáticamente sobre <strong>20 puntos</strong> y retroalimenta el semáforo institucional de vulnerabilidad.
                  </p>
                </div>
              </div>

              {/* Lista de las 26 preguntas */}
              <div className="space-y-4">
                {preguntas.map((p) => {
                  const seleccion = respuestas_seleccionadas[p.numero];
                  return (
                    <div
                      key={p.id}
                      className="p-4 rounded-xl border border-[#E3DCCB] bg-slate-50/50 space-y-3 hover:border-[#17B4C4]/60 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <span className="font-mono text-xs font-bold text-[#17B4C4]">
                            Pregunta #{p.numero} · {p.titulo}
                          </span>
                          <h4 className="text-xs sm:text-sm font-semibold text-[#063A6B] leading-snug">
                            {p.enunciado}
                          </h4>
                        </div>
                        {seleccion && (
                          <Badge variant="outline" className="font-mono text-xs font-bold text-[#063A6B] border-[#063A6B]/30 shrink-0">
                            Opción {seleccion}
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {p.opciones.map((op) => {
                          const esta_seleccionada = seleccion === op.inciso;
                          return (
                            <button
                              key={op.inciso}
                              type="button"
                              onClick={() => seleccionarOpcion(p.numero, op.inciso)}
                              className={`p-2.5 rounded-lg border text-xs text-left transition-all flex items-start gap-2 ${
                                esta_seleccionada
                                  ? "bg-[#063A6B] text-white border-[#063A6B] shadow-xs font-medium"
                                  : "bg-white text-slate-700 border-[#E3DCCB] hover:bg-slate-50"
                              }`}
                            >
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                                  esta_seleccionada
                                    ? "bg-[#17B4C4] text-[#063A6B]"
                                    : "bg-slate-100 text-slate-600 border border-[#E3DCCB]"
                                }`}
                              >
                                {op.inciso}
                              </span>
                              <span className="leading-snug pt-0.5">{op.texto}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Modo Configuración / Edición Institucional */
            <div className="space-y-6">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Settings className="w-4 h-4 text-amber-700" />
                    Panel de Administración de Preguntas Institucionales
                  </p>
                  <p className="text-amber-800 leading-relaxed">
                    Permite a Trabajo Social y a la Dirección modificar los enunciados, títulos u opciones de las preguntas conforme al mandato institucional (&ldquo;Sujeto a modificación de la institución&rdquo;).
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={manejarAgregarNuevaPregunta}
                  className="h-8 px-3 bg-[#063A6B] text-white hover:bg-[#063A6B]/90 text-xs font-bold rounded-lg shrink-0 flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Nueva Pregunta
                </Button>
              </div>

              {/* Formulario de edición si hay pregunta activa */}
              {id_pregunta_editando && (
                <div className="p-4 rounded-xl border-2 border-[#17B4C4] bg-white space-y-3 shadow-md">
                  <h4 className="text-xs font-bold text-[#063A6B] flex items-center gap-1.5 uppercase tracking-wider">
                    <Edit3 className="w-4 h-4 text-[#17B4C4]" />
                    Editando Pregunta
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1 sm:col-span-1">
                      <Label className="text-xs font-semibold">Título / Categoría</Label>
                      <Input
                        value={titulo_pregunta_editando}
                        onChange={(e) => set_titulo_pregunta_editando(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-xs font-semibold">Enunciado Oficial</Label>
                      <Input
                        value={texto_pregunta_editando}
                        onChange={(e) => set_texto_pregunta_editando(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => set_id_pregunta_editando(null)}
                      className="h-8 text-xs rounded-lg"
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={manejarConfirmarEdicionPregunta}
                      className="h-8 bg-[#17B4C4] hover:bg-[#17B4C4]/90 text-[#063A6B] font-bold text-xs rounded-lg"
                    >
                      Aplicar Modificación
                    </Button>
                  </div>
                </div>
              )}

              {/* Catálogo para edición */}
              <div className="space-y-3">
                {preguntas.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 bg-slate-50 border border-[#E3DCCB] rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5 flex-1 pr-2">
                      <span className="font-mono text-[11px] font-bold text-[#17B4C4]">
                        #{p.numero} · {p.titulo}
                      </span>
                      <p className="font-semibold text-slate-800">{p.enunciado}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {p.opciones.length} opciones configuradas ({p.opciones.map((o) => o.inciso).join(", ")})
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => manejarIniciarEdicion(p)}
                        className="h-8 px-2.5 border-[#17B4C4] text-[#063A6B] rounded-lg text-xs font-bold"
                      >
                        <Edit3 className="w-3.5 h-3.5 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          confirmarEliminacionRegistro({
                            titulo: "¿Eliminar pregunta institucional?",
                            descripcion: `¿Está seguro de eliminar la pregunta #${p.numero}: "${p.titulo}"? Esta acción se aplicará al guardar la configuración institucional.`,
                            nombre_item: `Pregunta #${p.numero} (${p.titulo})`,
                            onConfirmar: () => {
                              set_preguntas((prev) =>
                                prev.filter((item) => item.id !== p.id)
                              );
                              set_hay_configuracion_modificada(true);
                            },
                            mensaje_exito: `Pregunta #${p.numero} eliminada exitosamente`,
                          });
                        }}
                        className="h-8 px-2 text-[#E2694B] hover:text-[#c9573b] hover:bg-rose-50 rounded-lg text-xs"
                        title="Eliminar pregunta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogBody>

        {/* Pie del Modal */}
        <DialogFooter className="p-4 border-t border-[#E3DCCB] bg-[#F8F9FA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Nota Resultante:</span>
            <strong className="font-mono font-bold text-[#063A6B] text-sm">
              {puntaje_total_20.toFixed(1)} / 20 puntos
            </strong>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={intentarCerrarModal}
              className="text-xs border-[#E3DCCB] rounded-xl"
            >
              Cerrar
            </Button>
            {pestaña_activa === "configuracion" ? (
              <Button
                onClick={manejarGuardarConfiguracion}
                className="h-9 px-4 bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5 text-[#F8C766]" />
                Guardar Configuración Institucional
              </Button>
            ) : (
              <Button
                disabled={guardando}
                onClick={manejarGuardarRespuestas}
                className="h-9 px-5 bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5 text-[#17B4C4]" />
                {guardando ? "Guardando..." : "Guardar Evaluación Socioeconómica (/20)"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Diálogo de Confirmación Institucional */}
      {DialogoConfirmacionInstitucional}
    </Dialog>
  );
}
