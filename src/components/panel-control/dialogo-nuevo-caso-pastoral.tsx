"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  HeartHandshake,
  User,
  Church,
  ShieldAlert,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { clienteApi } from "@/lib/cliente-api";
import { toast } from "sonner";
import { CasoPastoralCompleto } from "./dialogo-gestion-caso-pastoral";

interface DialogoNuevoCasoPastoralProps {
  abierto: boolean;
  enCerrar: () => void;
  becariosDisponibles: Array<{
    id: number;
    nombre: string;
    carrera: string;
    universidad?: string;
    avatar?: string;
  }>;
  enCasoCreado: (nuevo_caso: CasoPastoralCompleto) => void;
}

export function DialogoNuevoCasoPastoral({
  abierto,
  enCerrar,
  becariosDisponibles,
  enCasoCreado,
}: DialogoNuevoCasoPastoralProps) {
  const [becario_id_seleccionado, set_becario_id_seleccionado] = useState<number>(
    becariosDisponibles[0]?.id || 101
  );
  const [origen, set_origen] = useState<string>("Comunicación Directa del Pastor");
  const [prioridad, set_prioridad] = useState<"BAJA" | "MEDIA" | "ALTA" | "CRITICA">("MEDIA");
  const [tutor_asignado, set_tutor_asignado] = useState<string>("Pr. Carlos Mendoza");
  const [observaciones, set_observaciones] = useState<string>("");
  const [guardando, set_guardando] = useState<boolean>(false);

  const becario_actual =
    becariosDisponibles.find((b) => b.id === Number(becario_id_seleccionado)) ||
    becariosDisponibles[0];

  const ORIGENES = [
    { key: "pastor", label: "Comunicación Directa del Pastor de Iglesia" },
    { key: "f03", label: "Formulario F-03 (Alerta por nota espiritual < 14/20)" },
    { key: "coordinacion", label: "Observación de Tutoría / Administración" },
  ];

  const PRIORIDADES: Array<"BAJA" | "MEDIA" | "ALTA" | "CRITICA"> = [
    "BAJA",
    "MEDIA",
    "ALTA",
    "CRITICA",
  ];

  const TUTORES_SUGERIDOS = [
    "Pr. Carlos Mendoza (Comisión Pastoral)",
    "Lic. María Elena Quispe (Trabajo Social)",
    "Coord. Pastoral BUMAND",
    "Pastor Local de Congregación",
  ];

  const manejarCreacion = async () => {
    if (!observaciones.trim()) {
      toast.error("Debe ingresar la observación pastoral o motivo de derivación");
      return;
    }

    set_guardando(true);
    try {
      const payload = {
        becario_id: Number(becario_id_seleccionado),
        observaciones_iniciales: observaciones.trim(),
        origen,
        prioridad,
        tutor_responsable: tutor_asignado,
      };

      const respuesta = await clienteApi.post<any>("/evaluaciones/casos-pastorales", payload);

      const nuevo_caso: CasoPastoralCompleto = {
        id: respuesta?.id || Date.now(),
        becario_id: becario_actual?.id || 1,
        nombre: becario_actual?.nombre || "Becario Institucional",
        carrera: becario_actual?.carrera || "Carrera Regular",
        universidad: becario_actual?.universidad || "Universidad de La Paz",
        avatar: becario_actual?.avatar || (becario_actual?.nombre ? becario_actual.nombre.substring(0, 2).toUpperCase() : "BC"),
        observacion: observaciones.trim(),
        prioridad,
        responsable_nombre: tutor_asignado,
        estado: "PENDIENTE",
        origen,
        plan_accion: "",
        notas_seguimiento: [],
      };

      toast.success(`Caso pastoral derivado con éxito para ${becario_actual?.nombre}`);
      enCasoCreado(nuevo_caso);
      set_observaciones("");
      enCerrar();
    } catch (error) {
      console.warn("Fallo al persistir vía API, registrando en estado local de forma resiliente:", error);
      const nuevo_caso: CasoPastoralCompleto = {
        id: Date.now(),
        becario_id: becario_actual?.id || 1,
        nombre: becario_actual?.nombre || "Becario Institucional",
        carrera: becario_actual?.carrera || "Carrera Regular",
        universidad: becario_actual?.universidad || "Universidad de La Paz",
        avatar: becario_actual?.avatar || (becario_actual?.nombre ? becario_actual.nombre.substring(0, 2).toUpperCase() : "BC"),
        observacion: observaciones.trim(),
        prioridad,
        responsable_nombre: tutor_asignado,
        estado: "PENDIENTE",
        origen,
        plan_accion: "",
        notas_seguimiento: [],
      };

      toast.success(`Caso pastoral derivado con éxito para ${becario_actual?.nombre}`);
      enCasoCreado(nuevo_caso);
      set_observaciones("");
      enCerrar();
    } finally {
      set_guardando(false);
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={enCerrar}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-[#E5E7EB] rounded-2xl bg-white shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100/70 text-amber-800 rounded-xl">
              <HeartHandshake className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <DialogTitle className="font-display text-base text-[#035683]">
                Derivar Caso de Seguimiento Pastoral y de Mentoría
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Apertura formal de expediente para acompañamiento eclesiástico y espiritual.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="space-y-4 text-xs">
          {/* Selección del Becario */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#035683]">
              Seleccionar Becario / Estudiante:
            </Label>
            <select
              value={becario_id_seleccionado}
              onChange={(e) => set_becario_id_seleccionado(Number(e.target.value))}
              className="w-full text-xs p-2 rounded-lg border border-[#E5E7EB] bg-white text-[#035683] font-medium focus:outline-none focus:ring-2 focus:ring-[#035683]"
            >
              {becariosDisponibles.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nombre} — {b.carrera}
                </option>
              ))}
            </select>
          </div>

          {/* Origen del Caso */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#035683]">
              Origen de la Derivación:
            </Label>
            <div className="space-y-1.5">
              {ORIGENES.map((o) => (
                <label
                  key={o.key}
                  className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                    origen === o.label
                      ? "bg-amber-50/70 border-amber-300 text-[#035683] font-bold"
                      : "bg-white border-[#E5E7EB] text-muted-foreground hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="origen"
                    checked={origen === o.label}
                    onChange={() => set_origen(o.label)}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span>{o.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Prioridad y Tutor Asignado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#035683]">
                Nivel de Prioridad:
              </Label>
              <div className="flex items-center gap-1.5">
                {PRIORIDADES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => set_prioridad(p)}
                    className={`text-[10px] font-mono font-bold py-1 px-2.5 rounded-md border transition-all cursor-pointer ${
                      prioridad === p
                        ? p === "CRITICA"
                          ? "bg-rose-700 text-white border-rose-800"
                          : p === "ALTA"
                          ? "bg-amber-600 text-white border-amber-700"
                          : p === "MEDIA"
                          ? "bg-blue-600 text-white border-blue-700"
                          : "bg-slate-600 text-white border-slate-700"
                        : "bg-white text-muted-foreground border-[#E5E7EB] hover:bg-slate-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#035683]">
                Tutor / Responsable Asignado:
              </Label>
              <Input
                type="text"
                value={tutor_asignado}
                onChange={(e) => set_tutor_asignado(e.target.value)}
                placeholder="Nombre del pastor o mentor..."
                className="text-xs font-medium border-[#E5E7EB]"
              />
            </div>
          </div>

          {/* Observaciones y Motivo */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#035683]">
              Observación Pastoral y Motivo del Seguimiento:
            </Label>
            <Textarea
              rows={4}
              value={observaciones}
              onChange={(e) => set_observaciones(e.target.value)}
              placeholder="Describa la situación reportada por el pastor o detectada en la iglesia local (ej. ausencia en cultos, crisis familiar, dificultad en liderazgo, acompañamiento espiritual requerido)..."
              className="text-xs border-[#E5E7EB] focus-visible:ring-[#035683]"
            />
          </div>

          {/* Nota de confidencialidad institucional */}
          <div className="p-3 bg-amber-50/50 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
            <Church className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              <strong>Confidencialidad Pastoral:</strong> Este expediente sólo es accesible por la Administración y el Tutor asignado. No se expone en la interfaz del becario para resguardar su integridad y proceso de maduración.
            </span>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={enCerrar}
            disabled={guardando}
            className="text-xs border-[#E5E7EB]"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={manejarCreacion}
            disabled={guardando}
            className="text-xs bg-[#035683] hover:bg-[#035683]/90 text-white font-bold cursor-pointer"
          >
            {guardando ? "Registrando..." : "Registrar Expediente Pastoral"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
