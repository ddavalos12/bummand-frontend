"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  ListPlus,
  RefreshCw,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { clienteApi } from "@/lib/cliente-api";
import { toast } from "sonner";

export interface PreguntaItem {
  id?: number;
  cuestionario_id?: number;
  numero_orden: number;
  seccion: string;
  titulo?: string;
  enunciado: string;
  tipo_pregunta: string;
  opciones?: Array<{
    inciso: string;
    texto: string;
    puntaje: number;
    semaforo?: string;
  }>;
  peso_puntos: number;
  obligatoria: boolean;
  activa: boolean;
}

export interface CuestionarioItem {
  id: number;
  codigo: string;
  titulo: string;
  descripcion?: string;
  tipo_evaluador: string;
  modulo_id?: number | null;
  activo: boolean;
  preguntas?: PreguntaItem[];
}

export function GestionCuestionarios() {
  const [cuestionarios, set_cuestionarios] = useState<CuestionarioItem[]>([]);
  const [cargando, set_cargando] = useState<boolean>(true);
  const [cuestionario_expandido_id, set_cuestionario_expandido_id] = useState<number | null>(null);

  // Modales
  const [modal_cuestionario_abierto, set_modal_cuestionario_abierto] = useState<boolean>(false);
  const [editando_cuestionario, set_editando_cuestionario] = useState<CuestionarioItem | null>(null);
  const [formulario_cuestionario, set_formulario_cuestionario] = useState({
    codigo: "",
    titulo: "",
    descripcion: "",
    tipo_evaluador: "becario",
    modulo_id: 1,
    activo: true,
  });

  const [modal_pregunta_abierto, set_modal_pregunta_abierto] = useState<boolean>(false);
  const [cuestionario_objetivo_id, set_cuestionario_objetivo_id] = useState<number | null>(null);
  const [formulario_pregunta, set_formulario_pregunta] = useState<PreguntaItem>({
    numero_orden: 1,
    seccion: "General",
    titulo: "",
    enunciado: "",
    tipo_pregunta: "likert",
    peso_puntos: 1.0,
    obligatoria: true,
    activa: true,
  });

  const cargarCuestionarios = async () => {
    try {
      set_cargando(true);
      const datos = await clienteApi.get<CuestionarioItem[]>("/api/evaluaciones/cuestionarios");
      if (Array.isArray(datos)) {
        set_cuestionarios(datos);
        if (datos.length > 0 && cuestionario_expandido_id === null) {
          set_cuestionario_expandido_id(datos[0].id);
        }
      }
    } catch {
      toast.error("No se pudo cargar el catálogo de cuestionarios");
    } finally {
      set_cargando(false);
    }
  };

  useEffect(() => {
    cargarCuestionarios();
  }, []);

  const abrirNuevoCuestionario = () => {
    set_editando_cuestionario(null);
    set_formulario_cuestionario({
      codigo: `CUEST_${Date.now().toString().slice(-4)}`,
      titulo: "",
      descripcion: "",
      tipo_evaluador: "becario",
      modulo_id: 1,
      activo: true,
    });
    set_modal_cuestionario_abierto(true);
  };

  const guardarCuestionario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formulario_cuestionario.codigo || !formulario_cuestionario.titulo) {
      toast.error("El código y el título del cuestionario son obligatorios");
      return;
    }

    try {
      if (editando_cuestionario) {
        await clienteApi.put(`/api/evaluaciones/cuestionarios/${editando_cuestionario.id}`, formulario_cuestionario);
        toast.success("Cuestionario actualizado con éxito");
      } else {
        await clienteApi.post("/api/evaluaciones/cuestionarios", formulario_cuestionario);
        toast.success("Nuevo cuestionario registrado con éxito");
      }
      set_modal_cuestionario_abierto(false);
      await cargarCuestionarios();
    } catch (err: any) {
      toast.error(err.message || "Error al guardar el cuestionario");
    }
  };

  const eliminarCuestionario = async (id: number, titulo: string) => {
    if (!confirm(`¿Estás seguro de eliminar el cuestionario "${titulo}" y todas sus preguntas?`)) {
      return;
    }
    try {
      await clienteApi.delete(`/api/evaluaciones/cuestionarios/${id}`);
      toast.success("Cuestionario eliminado");
      await cargarCuestionarios();
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar cuestionario");
    }
  };

  const abrirNuevaPregunta = (cuestionario_id: number, preguntas_actuales: PreguntaItem[] = []) => {
    set_cuestionario_objetivo_id(cuestionario_id);
    const nuevo_orden = preguntas_actuales.length + 1;
    set_formulario_pregunta({
      numero_orden: nuevo_orden,
      seccion: "Dimensión General",
      titulo: `Pregunta ${nuevo_orden}`,
      enunciado: "",
      tipo_pregunta: "likert",
      peso_puntos: 1.0,
      obligatoria: true,
      activa: true,
    });
    set_modal_pregunta_abierto(true);
  };

  const guardarPregunta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuestionario_objetivo_id || !formulario_pregunta.enunciado) {
      toast.error("El enunciado de la pregunta es obligatorio");
      return;
    }

    try {
      await clienteApi.post(
        `/api/evaluaciones/cuestionarios/${cuestionario_objetivo_id}/preguntas`,
        formulario_pregunta
      );
      toast.success("Pregunta agregada con éxito al cuestionario");
      set_modal_pregunta_abierto(false);
      await cargarCuestionarios();
    } catch (err: any) {
      toast.error(err.message || "Error al guardar la pregunta");
    }
  };

  const eliminarPregunta = async (id: number) => {
    if (!confirm("¿Eliminar este reactivo de evaluación?")) return;
    try {
      await clienteApi.delete(`/api/evaluaciones/preguntas/${id}`);
      toast.success("Pregunta eliminada");
      await cargarCuestionarios();
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar la pregunta");
    }
  };

  const sembrarCuestionariosBase = async () => {
    try {
      await clienteApi.post("/api/evaluaciones/cuestionarios/sembrar", {});
      toast.success("Cuestionarios base sembrados exitosamente");
      await cargarCuestionarios();
    } catch {
      toast.error("Error al sembrar cuestionarios base");
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera y Barra de Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div>
          <h2 className="text-base font-bold text-[#035683] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#00ABBD]" />
            Catálogo Dinámico de Cuestionarios y Evaluaciones
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gestión institucional de instrumentos, reactivos, preguntas Likert y criterios de evaluación.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={sembrarCuestionariosBase}
            className="h-9 px-3 border-[#E5E7EB] text-[#035683] hover:bg-slate-50 rounded-xl font-bold text-xs gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#00ABBD]" />
            Sembrar Base
          </Button>

          <Button
            size="sm"
            onClick={abrirNuevoCuestionario}
            className="h-9 px-3.5 bg-[#035683] hover:bg-[#035683]/90 text-white rounded-xl font-bold text-xs gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#FFB600]" />
            Nuevo Cuestionario
          </Button>
        </div>
      </div>

      {/* Listado de Cuestionarios */}
      {cargando ? (
        <Card className="border-[#E5E7EB] p-10 text-center text-slate-400">
          <p className="text-sm">Cargando cuestionarios institucionales...</p>
        </Card>
      ) : cuestionarios.length === 0 ? (
        <Card className="border-[#E5E7EB] p-12 text-center text-slate-500 bg-white rounded-2xl">
          <HelpCircle className="w-10 h-10 mx-auto text-amber-500 mb-3" />
          <p className="text-sm font-bold text-[#035683]">No existen cuestionarios configurados</p>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Puedes crear un instrumento nuevo desde cero o utilizar el botón &quot;Sembrar Base&quot; para restaurar los cuestionarios normativos.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {cuestionarios.map((item) => {
            const esta_expandido = cuestionario_expandido_id === item.id;
            const lista_preguntas = item.preguntas || [];

            return (
              <Card
                key={item.id}
                className="border-[#E5E7EB] shadow-xs bg-white rounded-2xl overflow-hidden transition-all"
              >
                <CardHeader className="p-4 sm:p-5 bg-[#FBFBFA] border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#035683]/10 text-[#035683] flex items-center justify-center font-bold text-sm shrink-0">
                      <FileText className="w-5 h-5 text-[#035683]" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-sm font-bold text-[#0F172A]">
                          {item.titulo}
                        </CardTitle>
                        <Badge variant="outline" className="font-mono text-[10px] uppercase font-bold text-[#00808E] border-[#00ABBD]/40 bg-[#00ABBD]/10">
                          {item.codigo}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] text-slate-600 bg-slate-100 border-slate-200">
                          Rol: {item.tipo_evaluador}
                        </Badge>
                        {item.modulo_id && (
                          <Badge variant="outline" className="text-[10px] text-amber-800 bg-amber-50 border-amber-200">
                            Pilar {item.modulo_id}
                          </Badge>
                        )}
                      </div>
                      {item.descripcion && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {item.descripcion}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Badge className="bg-slate-200 text-[#035683] text-xs font-mono font-bold px-2 py-0.5">
                      {lista_preguntas.length} preguntas
                    </Badge>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => abrirNuevaPregunta(item.id, lista_preguntas)}
                      className="h-8 px-2.5 text-xs font-bold border-[#E5E7EB] text-[#035683] hover:bg-slate-100 rounded-xl gap-1"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#00ABBD]" />
                      <span className="hidden sm:inline">Agregar Pregunta</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => eliminarCuestionario(item.id, item.titulo)}
                      className="h-8 w-8 p-0 text-rose-500 hover:bg-rose-50 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => set_cuestionario_expandido_id(esta_expandido ? null : item.id)}
                      className="h-8 w-8 p-0 text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      {esta_expandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardHeader>

                {esta_expandido && (
                  <CardContent className="p-4 sm:p-5 space-y-3 bg-white">
                    {lista_preguntas.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs">
                        Este cuestionario aún no tiene preguntas agregadas.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {lista_preguntas.map((p, idx) => (
                          <div
                            key={p.id || idx}
                            className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs font-bold text-[#035683]">
                                  #{p.numero_orden}
                                </span>
                                <Badge variant="outline" className="text-[10px] bg-white text-slate-600 border-slate-200">
                                  {p.seccion}
                                </Badge>
                                <span className="text-xs font-semibold text-slate-800">
                                  {p.titulo}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 italic">
                                &ldquo;{p.enunciado}&rdquo;
                              </p>
                              {p.opciones && p.opciones.length > 0 && (
                                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                  {p.opciones.map((opc, opc_idx) => (
                                    <span
                                      key={opc_idx}
                                      className="text-[10px] font-mono px-2 py-0.5 bg-white border border-slate-200 rounded-md text-slate-600"
                                    >
                                      [{opc.inciso}] {opc.texto} ({opc.puntaje} pts)
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {p.id && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => eliminarPregunta(p.id!)}
                                className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal: Crear / Editar Cuestionario */}
      <Dialog open={modal_cuestionario_abierto} onOpenChange={set_modal_cuestionario_abierto}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl bg-white border border-[#E5E7EB]">
          <DialogHeader className="p-5 pb-3 border-b border-[#E5E7EB] bg-[#F8F9FA]">
            <DialogTitle className="font-display text-base text-[#035683] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#00ABBD]" />
              {editando_cuestionario ? "Editar Cuestionario" : "Nuevo Cuestionario Institucional"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define el código mnemónico, título reglamentario y evaluador objetivo.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={guardarCuestionario} className="p-5 space-y-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Código Único (Mnemónico)</Label>
              <Input
                value={formulario_cuestionario.codigo}
                onChange={(e) => set_formulario_cuestionario({ ...formulario_cuestionario, codigo: e.target.value })}
                placeholder="EJ: BIENESTAR_2026, F03_PASTORAL"
                className="font-mono text-xs rounded-xl uppercase"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Título Oficial</Label>
              <Input
                value={formulario_cuestionario.titulo}
                onChange={(e) => set_formulario_cuestionario({ ...formulario_cuestionario, titulo: e.target.value })}
                placeholder="Nombre del formulario o evaluación"
                className="text-xs rounded-xl"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Descripción / Instrucciones</Label>
              <Textarea
                value={formulario_cuestionario.descripcion}
                onChange={(e) => set_formulario_cuestionario({ ...formulario_cuestionario, descripcion: e.target.value })}
                placeholder="Detalle o propósito de este cuestionario..."
                className="text-xs rounded-xl min-h-[70px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Evaluador Destino</Label>
                <Select
                  value={formulario_cuestionario.tipo_evaluador}
                  onValueChange={(val) => set_formulario_cuestionario({ ...formulario_cuestionario, tipo_evaluador: val || "becario" })}
                >
                  <SelectTrigger className="text-xs rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="becario">Estudiante / Becario</SelectItem>
                    <SelectItem value="pastor">Pastor de la Iglesia</SelectItem>
                    <SelectItem value="supervisor">Supervisor / Mentor</SelectItem>
                    <SelectItem value="social">Trabajo Social</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Módulo Asociado (1-5)</Label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={formulario_cuestionario.modulo_id}
                  onChange={(e) => set_formulario_cuestionario({ ...formulario_cuestionario, modulo_id: Number(e.target.value) })}
                  className="text-xs rounded-xl"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => set_modal_cuestionario_abierto(false)}
                className="text-xs font-bold rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#035683] hover:bg-[#035683]/90 text-white font-bold text-xs rounded-xl"
              >
                Guardar Cuestionario
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Agregar Pregunta */}
      <Dialog open={modal_pregunta_abierto} onOpenChange={set_modal_pregunta_abierto}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl bg-white border border-[#E5E7EB]">
          <DialogHeader className="p-5 pb-3 border-b border-[#E5E7EB] bg-[#F8F9FA]">
            <DialogTitle className="font-display text-base text-[#035683] flex items-center gap-2">
              <ListPlus className="w-4 h-4 text-[#00ABBD]" />
              Agregar Pregunta / Criterio al Cuestionario
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define el orden, la sección temática y el enunciado del criterio evaluativo.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={guardarPregunta} className="p-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1 col-span-1">
                <Label className="text-xs font-semibold text-slate-700">Orden (#)</Label>
                <Input
                  type="number"
                  min={1}
                  value={formulario_pregunta.numero_orden}
                  onChange={(e) => set_formulario_pregunta({ ...formulario_pregunta, numero_orden: Number(e.target.value) })}
                  className="text-xs rounded-xl font-mono"
                  required
                />
              </div>

              <div className="space-y-1 col-span-2">
                <Label className="text-xs font-semibold text-slate-700">Sección / Dimensión</Label>
                <Input
                  value={formulario_pregunta.seccion}
                  onChange={(e) => set_formulario_pregunta({ ...formulario_pregunta, seccion: e.target.value })}
                  placeholder="Ej: Dimensión Académica, Espiritual"
                  className="text-xs rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Título Corto</Label>
              <Input
                value={formulario_pregunta.titulo}
                onChange={(e) => set_formulario_pregunta({ ...formulario_pregunta, titulo: e.target.value })}
                placeholder="Ej: Rendimiento en materias troncales"
                className="text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Enunciado Completo de la Pregunta</Label>
              <Textarea
                value={formulario_pregunta.enunciado}
                onChange={(e) => set_formulario_pregunta({ ...formulario_pregunta, enunciado: e.target.value })}
                placeholder="¿Con qué regularidad logras cumplir con...?"
                className="text-xs rounded-xl min-h-[80px]"
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => set_modal_pregunta_abierto(false)}
                className="text-xs font-bold rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#035683] hover:bg-[#035683]/90 text-white font-bold text-xs rounded-xl"
              >
                Guardar Pregunta
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
