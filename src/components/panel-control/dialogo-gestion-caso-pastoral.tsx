"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  HeartHandshake,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  Plus,
  Calendar,
  Sparkles,
  BookOpen,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";

export interface NotaSeguimientoUI {
  fecha: string;
  autor: string;
  rol_autor: string;
  contenido: string;
  acuerdos?: string;
}

export interface CasoPastoralCompleto {
  id: number;
  becario_id: number;
  nombre: string;
  avatar: string;
  carrera: string;
  universidad: string;
  observacion: string;
  origen?: string;
  plan_accion?: string;
  estado: "PENDIENTE" | "EN_TUTORIA" | "RESUELTO";
  prioridad: "ALTA" | "MEDIA" | "BAJA" | "CRITICA";
  responsable_nombre?: string;
  tutor_asignado?: string;
  notas_seguimiento?: NotaSeguimientoUI[];
  conclusion_resolucion?: string;
}

interface DialogoGestionCasoPastoralProps {
  caso: CasoPastoralCompleto | null;
  abierto: boolean;
  alCerrar: () => void;
  alActualizar: (caso_actualizado: CasoPastoralCompleto) => void;
}

export function DialogoGestionCasoPastoral({
  caso,
  abierto,
  alCerrar,
  alActualizar,
}: DialogoGestionCasoPastoralProps) {
  const [plan_accion, set_plan_accion] = useState<string>("");
  const [responsable, set_responsable] = useState<string>("");
  const [prioridad, set_prioridad] = useState<"ALTA" | "MEDIA" | "BAJA" | "CRITICA">("ALTA");
  const [estado, set_estado] = useState<"PENDIENTE" | "EN_TUTORIA" | "RESUELTO">("PENDIENTE");
  const [nueva_nota_texto, set_nueva_nota_texto] = useState<string>("");
  const [nuevos_acuerdos, set_nuevos_acuerdos] = useState<string>("");
  const [mostrar_modo_resolver, set_mostrar_modo_resolver] = useState<boolean>(false);
  const [conclusion_resolucion, set_conclusion_resolucion] = useState<string>("");
  const [guardando, set_guardando] = useState<boolean>(false);

  useEffect(() => {
    if (caso) {
      set_plan_accion(caso.plan_accion || "");
      set_responsable(caso.responsable_nombre || "Pr. Juan Ramos (Tutor Pastoral)");
      set_prioridad(caso.prioridad || "ALTA");
      set_estado(caso.estado || "PENDIENTE");
      set_mostrar_modo_resolver(false);
      set_conclusion_resolucion(caso.conclusion_resolucion || "");
      set_nueva_nota_texto("");
      set_nuevos_acuerdos("");
    }
  }, [caso]);

  if (!caso) return null;

  const guardarCambios = () => {
    set_guardando(true);
    const actualizado: CasoPastoralCompleto = {
      ...caso,
      plan_accion,
      responsable_nombre: responsable,
      prioridad,
      estado,
    };
    alActualizar(actualizado);
    toast.success("Expediente pastoral actualizado correctamente.");
    set_guardando(false);
  };

  const agregarNota = () => {
    if (!nueva_nota_texto.trim()) {
      toast.error("Ingresa una nota o descripción de la sesión de acompañamiento.");
      return;
    }

    const nueva: NotaSeguimientoUI = {
      fecha: new Date().toISOString().split("T")[0],
      autor: responsable || "Tutor Pastoral",
      rol_autor: "Acompañamiento Pastoral",
      contenido: nueva_nota_texto.trim(),
      acuerdos: nuevos_acuerdos.trim() || undefined,
    };

    const notas_actuales = caso.notas_seguimiento || [];
    const nuevo_estado = estado === "PENDIENTE" ? "EN_TUTORIA" : estado;

    const actualizado: CasoPastoralCompleto = {
      ...caso,
      estado: nuevo_estado,
      notas_seguimiento: [nueva, ...notas_actuales],
      plan_accion,
      responsable_nombre: responsable,
    };

    set_estado(nuevo_estado);
    alActualizar(actualizado);
    set_nueva_nota_texto("");
    set_nuevos_acuerdos("");
    toast.success("Nueva nota de seguimiento registrada en la bitácora pastoral.");
  };

  const darPorResuelto = () => {
    if (!conclusion_resolucion.trim()) {
      toast.error("Por favor ingresa la conclusión o motivo de superación del caso.");
      return;
    }

    const actualizado: CasoPastoralCompleto = {
      ...caso,
      estado: "RESUELTO",
      conclusion_resolucion: conclusion_resolucion.trim(),
      notas_seguimiento: [
        {
          fecha: new Date().toISOString().split("T")[0],
          autor: "Coordinación Pastoral",
          rol_autor: "Auditoría Pastoral",
          contenido: `Caso marcado como Superado/Resuelto: ${conclusion_resolucion.trim()}`,
        },
        ...(caso.notas_seguimiento || []),
      ],
    };

    alActualizar(actualizado);
    toast.success("Caso pastoral dado por superado exitosamente.", {
      description: "El expediente ha sido archivado como resuelto en el Kardex institucional.",
    });
    alCerrar();
  };

  return (
    <Dialog open={abierto} onOpenChange={(open) => !open && alCerrar()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto border-[#E3DCCB] bg-white p-6 rounded-2xl shadow-xl">
        <DialogHeader className="border-b border-[#E3DCCB]/60 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#063A6B]/10 rounded-xl text-[#063A6B]">
                <HeartHandshake className="w-5 h-5 text-[#17B4C4]" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-[#063A6B] font-display">
                  Gestión y Mentoría de Caso Pastoral
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Coordinación Ministerial y Acompañamiento Espiritual Diaconía FRIF-IFD
                </DialogDescription>
              </div>
            </div>
            <Badge
              variant="outline"
              className={
                estado === "RESUELTO"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-bold"
                  : estado === "EN_TUTORIA"
                  ? "bg-cyan-50 text-[#0E7A85] border-[#17B4C4]/40 font-bold"
                  : "bg-amber-50 text-amber-800 border-amber-300 font-bold"
              }
            >
              {estado === "RESUELTO" ? "Superado / Resuelto" : estado === "EN_TUTORIA" ? "En Tutoría Activa" : "Pendiente de Asignación"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-3 text-xs">
          {/* Tarjeta de Datos del Becario y Observación del Pastor */}
          <div className="p-4 bg-amber-50/50 border border-amber-200/80 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Avatar className="w-9 h-9 border border-[#E3DCCB]">
                  <AvatarFallback className="bg-[#063A6B] text-[#F8C766] font-bold text-xs">
                    {caso.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold text-sm text-[#063A6B]">{caso.nombre}</h4>
                  <p className="text-[11px] text-muted-foreground">
                    {caso.universidad} · {caso.carrera}
                  </p>
                </div>
              </div>
              <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px] font-mono font-bold">
                Prioridad: {prioridad}
              </Badge>
            </div>

            <div className="p-3 bg-white border border-amber-200/60 rounded-lg">
              <p className="text-[10px] font-mono font-bold uppercase text-amber-800 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Observación Registrada en Formulario Pastoral F-03:
              </p>
              <p className="text-xs text-[#1E293B] italic leading-relaxed">
                "{caso.observacion}"
              </p>
            </div>
          </div>

          {/* Formulario de Asignación de Tutor y Plan de Acción */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#063A6B]">Tutor / Pastor Asignado</Label>
              <Input
                value={responsable}
                onChange={(e) => set_responsable(e.target.value)}
                placeholder="Nombre del pastor o mentor responsable"
                className="h-8 text-xs bg-slate-50 border-[#E3DCCB]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#063A6B]">Nivel de Prioridad Pastoral</Label>
              <select
                value={prioridad}
                onChange={(e) => set_prioridad(e.target.value as any)}
                className="w-full h-8 px-2.5 rounded-lg border border-[#E3DCCB] bg-slate-50 text-xs text-[#1E293B]"
              >
                <option value="ALTA">Alta (Intervención Inmediata)</option>
                <option value="MEDIA">Media (Acompañamiento Regular)</option>
                <option value="BAJA">Baja (Seguimiento Preventivo)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-[#063A6B]">
                Plan de Acción y Acuerdos de Compromiso
              </Label>
              <span className="text-[10px] text-muted-foreground font-mono">
                Puntaje eclesiástico oficial F-03
              </span>
            </div>
            <Textarea
              value={plan_accion}
              onChange={(e) => set_plan_accion(e.target.value)}
              placeholder="Describe los pasos acordados: e.g. '3 sesiones de mentoría de discipulado, integración al grupo juvenil, asignación de rol en ministerio de mayordomía'..."
              rows={3}
              className="text-xs bg-white border-[#E3DCCB] resize-none"
            />
          </div>

          {/* Modo Resolver Caso / Conclusión */}
          {mostrar_modo_resolver ? (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Conclusión de Superación del Caso
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => set_mostrar_modo_resolver(false)}
                  className="h-6 px-2 text-[10px] text-emerald-700 hover:bg-emerald-100"
                >
                  Cancelar
                </Button>
              </div>
              <p className="text-[11px] text-emerald-700">
                Al resolver el caso, el becario será acreditado con visto bueno y el caso saldrá de la lista de prioritarios activos.
              </p>
              <Textarea
                value={conclusion_resolucion}
                onChange={(e) => set_conclusion_resolucion(e.target.value)}
                placeholder="Escribe la conclusión formal: e.g. 'El becario completó sus 3 reuniones de consejería, asumió rol en alabanza y su pastor convalidó asistencia regular.'..."
                rows={2}
                className="text-xs bg-white border-emerald-300"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={darPorResuelto}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Confirmar Caso Superado
                </Button>
              </div>
            </div>
          ) : (
            estado !== "RESUELTO" && (
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-[#E3DCCB] rounded-xl">
                <div>
                  <p className="font-semibold text-xs text-[#063A6B]">¿El becario ha superado la observación?</p>
                  <p className="text-[11px] text-muted-foreground">
                    Da por concluido el acompañamiento con visto bueno de la coordinación.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => set_mostrar_modo_resolver(true)}
                  className="h-8 text-xs border-emerald-500 text-emerald-700 hover:bg-emerald-50 font-bold gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Dar por Superado
                </Button>
              </div>
            )
          )}

          {/* Sección de Bitácora y Notas Fechadas de Seguimiento */}
          <div className="space-y-3 pt-2 border-t border-[#E3DCCB]/60">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-xs text-[#063A6B] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#17B4C4]" />
                Bitácora de Sesiones y Notas de Acompañamiento
              </h5>
              <Badge variant="outline" className="text-[10px] font-mono">
                {(caso.notas_seguimiento || []).length} registros
              </Badge>
            </div>

            {/* Formulario rápido para añadir nota */}
            <div className="p-3 bg-slate-50 border border-[#E3DCCB] rounded-xl space-y-2">
              <Label className="text-[11px] font-semibold text-[#063A6B]">
                Registrar Nueva Sesión / Entrevista Pastoral
              </Label>
              <Textarea
                value={nueva_nota_texto}
                onChange={(e) => set_nueva_nota_texto(e.target.value)}
                placeholder="Observaciones de la reunión con el becario..."
                rows={2}
                className="text-xs bg-white border-[#E3DCCB] resize-none"
              />
              <Input
                value={nuevos_acuerdos}
                onChange={(e) => set_nuevos_acuerdos(e.target.value)}
                placeholder="Compromisos o tareas acordadas para la próxima fecha..."
                className="h-7 text-xs bg-white border-[#E3DCCB]"
              />
              <div className="flex justify-end pt-1">
                <Button
                  size="sm"
                  onClick={agregarNota}
                  className="h-7 px-3 text-xs bg-[#063A6B] text-white hover:bg-[#063A6B]/90 font-bold gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#F8C766]" />
                  Añadir a Bitácora
                </Button>
              </div>
            </div>

            {/* Listado de Notas Previas */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {(!caso.notas_seguimiento || caso.notas_seguimiento.length === 0) ? (
                <p className="text-center text-[11px] text-muted-foreground py-3 italic">
                  Aún no se han registrado notas en la bitácora de este caso pastoral.
                </p>
              ) : (
                caso.notas_seguimiento.map((nota, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-slate-200 bg-white text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="font-bold text-[#063A6B]">{nota.autor} ({nota.rol_autor})</span>
                      <span className="font-mono">{nota.fecha}</span>
                    </div>
                    <p className="text-slate-700 leading-snug">{nota.contenido}</p>
                    {nota.acuerdos && (
                      <p className="text-[11px] text-[#0E7A85] font-medium pt-0.5">
                        <span className="font-bold">Compromiso:</span> {nota.acuerdos}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-[#E3DCCB]/60 pt-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={alCerrar}
            className="text-xs"
          >
            Cerrar
          </Button>
          <Button
            size="sm"
            onClick={guardarCambios}
            disabled={guardando}
            className="bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold text-xs gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#17B4C4]" />
            Guardar Plan y Expediente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
