"use client";

import React, { useState } from "react";
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
import {
  QrCode,
  CheckCircle,
  FileText,
  UserCheck,
  Building,
  Calendar,
  Sparkles,
  HelpCircle,
  Clock,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { useConfirmacionDialogo } from "@/hooks/useConfirmacionDialogo";
import {
  PREGUNTAS_MENTOR_ESCALA,
  PREGUNTAS_ABIERTAS_MENTOR,
} from "./evaluaciones-datos-semestre";

interface FormularioMentorModalProps {
  abierto: boolean;
  alCambiarAbierto: (abierto: boolean) => void;
  becario_id?: number;
  nombre_becario?: string;
  unidad_agencia_inicial?: string;
  alGuardarExito?: (puntaje_20: number) => void;
}

export function FormularioMentorModal({
  abierto,
  alCambiarAbierto,
  becario_id = 1,
  nombre_becario = "Ruddy Flores Tapia",
  unidad_agencia_inicial = "Jefatura de Planificación, Control y Presupuesto",
  alGuardarExito,
}: FormularioMentorModalProps) {
  // Datos de Cabecera Oficial
  const [mentor_nombre, set_mentor_nombre] = useState<string>("Mildrette Rojas Soliz");
  const [unidad_agencia, set_unidad_agencia] = useState<string>(unidad_agencia_inicial);
  const [semestre_gestion, set_semestre_gestion] = useState<string>("Semestre II · 2026");
  const [fecha_evaluacion, set_fecha_evaluacion] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );

  // Bloque 1: Calificaciones de las 18 preguntas en escala 1-10
  const [calificaciones_18, set_calificaciones_18] = useState<Record<number, number>>({
    1: 10,
    2: 10,
    3: 10,
    4: 10,
    5: 10,
    6: 10,
    7: 10,
    8: 9,
    9: 10,
    10: 10,
    11: 10,
    12: 10,
    13: 10,
    14: 9,
    15: 9,
    16: 9,
    17: 10,
    18: 10,
  });

  // Bloque 2: Preguntas Abiertas 19 al 21
  const [respuestas_abiertas, set_respuestas_abiertas] = useState<Record<number, string>>({
    19: "Excelente apoyo muy agradecida, alta disposición de servicio.",
    20: "En todas las tareas de digitalización y análisis cumplió con lo encomendado.",
    21: "Que exista la opción de apoyo en periodos de vacaciones universitarias.",
  });

  const [puntajes_abiertos, set_puntajes_abiertos] = useState<Record<number, number>>({
    19: 3.33,
    20: 3.33,
    21: 3.34,
  });

  const [guardando, set_guardando] = useState<boolean>(false);
  const [qr_visible, set_qr_visible] = useState<boolean>(false);
  const [hay_modificaciones, set_hay_modificaciones] = useState<boolean>(false);

  const {
    confirmarCierreSinCompletar,
    DialogoConfirmacionInstitucional,
  } = useConfirmacionDialogo();

  // Manejador para escala 1-10
  const asignarNotaPregunta = (numero: number, valor: number) => {
    set_hay_modificaciones(true);
    set_calificaciones_18((prev) => ({
      ...prev,
      [numero]: valor,
    }));
  };

  // Cálculos matemáticos oficiales
  const suma_18 = Object.values(calificaciones_18).reduce((a, b) => a + b, 0);
  const promedio_18_sobre_10 = Number((suma_18 / 18).toFixed(2));

  const suma_abiertas_sobre_10 = Number(
    (
      (puntajes_abiertos[19] || 0) +
      (puntajes_abiertos[20] || 0) +
      (puntajes_abiertos[21] || 0)
    ).toFixed(2)
  );

  const nota_final_sobre_20 = Number(
    Math.min(promedio_18_sobre_10 + suma_abiertas_sobre_10, 20).toFixed(1)
  );

  const intentarCerrarModal = () => {
    confirmarCierreSinCompletar(
      hay_modificaciones,
      () => {
        alCambiarAbierto(false);
      },
      "Evaluación del Mentor"
    );
  };

  const manejarGuardarEvaluacionMentor = async () => {
    set_guardando(true);
    try {
      const url_base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      await fetch(`${url_base}/evaluaciones/receptor/mentor-qr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          becario_id,
          periodo_id: "s2",
          mentor_nombre,
          unidad_agencia,
          semestre_gestion,
          fecha: fecha_evaluacion,
          calificaciones_1_18: calificaciones_18,
          promedio_bloque_1: promedio_18_sobre_10,
          respuestas_abiertas,
          puntajes_abiertos,
          total_bloque_2: suma_abiertas_sobre_10,
          nota_final_20: nota_final_sobre_20,
        }),
      }).catch(() => {});

      toast.success("Evaluación del Mentor guardada exitosamente", {
        description: `Nota Oficial: ${nota_final_sobre_20} / 20 Puntos asignada al becario.`,
      });

      set_hay_modificaciones(false);
      if (alGuardarExito) {
        alGuardarExito(nota_final_sobre_20);
      }
      alCambiarAbierto(false);
    } catch (_error) {
      toast.error("Error al asentar la evaluación del mentor.");
    } finally {
      set_guardando(false);
    }
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
        className="sm:max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden rounded-2xl bg-white border border-[#E5E7EB] shadow-2xl"
      >
        {/* Cabecera del Formulario Oficial */}
        <DialogHeader className="p-5 pb-3 border-b border-[#E5E7EB] bg-[#F8F9FA] shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#035683]/10 text-[#035683] flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-[#00ABBD]" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#00ABBD] font-bold block">
                  Módulo 03 · Evaluación del Becario por el Mentor
                </span>
                <DialogTitle className="font-display text-lg font-bold text-[#035683]">
                  Evaluación del Becario por el Mentor (18 Escala 1-10 + 3 Abiertas)
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Programa BUMAND · Puntaje total 20 puntos · Formato estructurado análogo a la iglesia
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => set_qr_visible(!qr_visible)}
                className="h-8 px-2.5 border-[#00ABBD] text-[#035683] rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <QrCode className="w-3.5 h-3.5" />
                {qr_visible ? "Ocultar QR" : "Ver Código QR"}
              </Button>
              <Badge className="bg-[#035683] text-white font-mono text-xs font-bold px-3 py-1">
                NOTA FINAL: {nota_final_sobre_20} / 20 PUNTOS
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Cuerpo del Formulario */}
        <DialogBody className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Panel Desplegable de Código QR */}
          {qr_visible && (
            <div className="p-4 bg-slate-50 border border-dashed border-[#00ABBD] rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-xs">
              <div className="w-24 h-24 bg-white border border-[#E5E7EB] rounded-xl flex items-center justify-center shadow-xs shrink-0 p-2">
                <svg viewBox="0 0 100 100" className="w-full h-full text-[#035683]" fill="currentColor">
                  <path d="M10 10h30v30h-30zM15 15v20h20v-20zM20 20h10v10h-10zM60 10h30v30h-30zM65 15v20h20v-20zM70 20h10v10h-10zM10 60h30v30h-30zM15 65v20h20v-20zM20 70h10v10h-10zM50 15h5v5h-5zM50 25h5v5h-5zM50 35h5v5h-5zM45 50h10v10h-10zM60 50h10v5h-10zM75 50h15v5h-15zM60 60h5v15h-5zM70 65h15v5h-15zM80 75h10v15h-10zM50 70h5v15h-5zM60 85h15v5h-15z" />
                </svg>
              </div>
              <div className="space-y-1 text-center sm:text-left flex-1">
                <Badge className="bg-[#00ABBD] text-[#035683] font-bold text-[10px]">
                  Enlace QR para Smartphone del Mentor
                </Badge>
                <p className="font-semibold text-slate-800">
                  Escanee este código QR para abrir el formulario directamente en el teléfono del supervisor diaconal.
                </p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  https://bumand.bo/evaluar/mentor?becario={becario_id}&sem=2026-2
                </p>
              </div>
            </div>
          )}

          {/* 1. CABECERA INSTITUCIONAL */}
          <div className="p-4 bg-slate-50 border border-[#E5E7EB] rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-[#035683] uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#00ABBD]" />
              Datos Generales de la Evaluación
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground">Nombre del Becario:</Label>
                <Input value={nombre_becario} disabled className="h-8 text-xs bg-white font-medium" />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground">Mentor Evaluador(a):</Label>
                <Input
                  value={mentor_nombre}
                  onChange={(e) => {
                    set_mentor_nombre(e.target.value);
                    set_hay_modificaciones(true);
                  }}
                  className="h-8 text-xs bg-white"
                  placeholder="Nombre y apellido"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground">Unidad o Agencia:</Label>
                <Input
                  value={unidad_agencia}
                  onChange={(e) => {
                    set_unidad_agencia(e.target.value);
                    set_hay_modificaciones(true);
                  }}
                  className="h-8 text-xs bg-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground">Semestre / Fecha:</Label>
                <div className="grid grid-cols-2 gap-1">
                  <Input
                    value={semestre_gestion}
                    onChange={(e) => {
                      set_semestre_gestion(e.target.value);
                      set_hay_modificaciones(true);
                    }}
                    className="h-8 text-[11px] bg-white font-mono"
                  />
                  <Input
                    type="date"
                    value={fecha_evaluacion}
                    onChange={(e) => {
                      set_fecha_evaluacion(e.target.value);
                      set_hay_modificaciones(true);
                    }}
                    className="h-8 text-[11px] bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. BLOQUE 1: PREGUNTAS 1 AL 18 (ESCALA 1 AL 10 = 10 PUNTOS) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#E5E7EB] gap-1">
              <div>
                <h4 className="text-sm font-bold text-[#035683] flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#00ABBD]" />
                  Bloque 1: Preguntas 1 al 18 (Escala del 1 al 10)
                </h4>
                <p className="text-xs text-muted-foreground">
                  Marque una sola opción en cada pregunta. 1 = valoración más baja, 10 = la mejor. Las 18 calificaciones se promedian para obtener un máximo de <strong>10 puntos</strong>.
                </p>
              </div>
              <Badge variant="outline" className="font-mono text-xs font-bold text-[#035683] border-[#035683]/30 self-start sm:self-auto">
                Promedio Bloque 1: {promedio_18_sobre_10} / 10 pts
              </Badge>
            </div>

            <div className="space-y-3">
              {PREGUNTAS_MENTOR_ESCALA.map((pm) => {
                const calif = calificaciones_18[pm.numero] || 10;
                return (
                  <div
                    key={pm.numero}
                    className="p-3 bg-white border border-[#E5E7EB] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#00ABBD]/50 transition-colors"
                  >
                    <div className="space-y-0.5 flex-1 pr-2">
                      <span className="font-mono text-[11px] font-bold text-[#00ABBD]">
                        #{pm.numero}
                      </span>
                      <p className="text-xs font-semibold text-slate-800 leading-snug">
                        {pm.enunciado}
                      </p>
                    </div>

                    {/* Selector interactivo de 1 a 10 */}
                    <div className="flex items-center gap-1 shrink-0">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => asignarNotaPregunta(pm.numero, num)}
                          className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all ${
                            calif === num
                              ? "bg-[#035683] text-white shadow-xs scale-105"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. BLOQUE 2: PREGUNTAS ABIERTAS 19 AL 21 (MÁXIMO 10 PUNTOS) */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#E5E7EB] gap-1">
              <div>
                <h4 className="text-sm font-bold text-[#035683] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#00ABBD]" />
                  Bloque 2: Preguntas Abiertas 19 al 21 (Máximo 10 Puntos)
                </h4>
                <p className="text-xs text-muted-foreground">
                  Escriba su respuesta cualitativa y asigne el puntaje correspondiente a cada pregunta abierta.
                </p>
              </div>
              <Badge variant="outline" className="font-mono text-xs font-bold text-[#035683] border-[#035683]/30 self-start sm:self-auto">
                Total Bloque 2: {suma_abiertas_sobre_10} / 10 pts
              </Badge>
            </div>

            <div className="space-y-4">
              {PREGUNTAS_ABIERTAS_MENTOR.map((pa) => {
                const respuesta = respuestas_abiertas[pa.numero] || "";
                const puntaje = puntajes_abiertos[pa.numero] ?? pa.puntaje_maximo;
                return (
                  <div
                    key={pa.numero}
                    className="p-4 bg-slate-50 border border-[#E5E7EB] rounded-xl space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="font-mono text-[11px] font-bold text-[#00ABBD]">
                          Pregunta #{pa.numero}
                        </span>
                        <p className="text-xs font-semibold text-[#035683] leading-snug">
                          {pa.enunciado}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Label className="text-[11px] text-muted-foreground">Puntaje:</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max={pa.puntaje_maximo}
                          value={puntaje}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            set_hay_modificaciones(true);
                            set_puntajes_abiertos((prev) => ({
                              ...prev,
                              [pa.numero]: Math.min(Math.max(val, 0), pa.puntaje_maximo),
                            }));
                          }}
                          className="w-16 h-8 text-xs font-mono font-bold text-center bg-white"
                        />
                        <span className="text-xs text-muted-foreground font-mono">
                          / {pa.puntaje_maximo} pts
                        </span>
                      </div>
                    </div>

                    <Textarea
                      rows={2}
                      value={respuesta}
                      onChange={(e) => {
                        const val = e.target.value;
                        set_hay_modificaciones(true);
                        set_respuestas_abiertas((prev) => ({
                          ...prev,
                          [pa.numero]: val,
                        }));
                      }}
                      placeholder="Escriba aquí la apreciación del mentor..."
                      className="text-xs bg-white border-[#E5E7EB]"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. RESUMEN DE CÁLCULO DE LA NOTA FINAL */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1 text-emerald-900">
              <span className="font-bold block">Desglose Oficial del Cálculo (Reglamento BUMAND):</span>
              <p className="font-mono">
                Preguntas 1 al 18: {suma_18} ÷ 18 = <strong>{promedio_18_sobre_10} / 10 pts</strong>
              </p>
              <p className="font-mono">
                Preguntas 19 al 21: suma asignada = <strong>{suma_abiertas_sobre_10} / 10 pts</strong>
              </p>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-emerald-800 uppercase tracking-wider block font-bold">
                Calificación Definitiva Mentor
              </span>
              <span className="font-mono text-2xl font-bold text-[#035683]">
                {nota_final_sobre_20} <span className="text-xs font-normal text-slate-600">/ 20 Pts</span>
              </span>
            </div>
          </div>
        </DialogBody>

        {/* Pie del Formulario */}
        <DialogFooter className="p-4 border-t border-[#E5E7EB] bg-[#F8F9FA] flex justify-end gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={intentarCerrarModal}
            className="text-xs border-[#E5E7EB] rounded-xl"
          >
            Cancelar
          </Button>
          <Button
            disabled={guardando}
            onClick={manejarGuardarEvaluacionMentor}
            className="h-9 px-5 bg-[#035683] hover:bg-[#035683]/90 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
          >
            <CheckCircle className="w-3.5 h-3.5 text-[#00ABBD]" />
            {guardando ? "Guardando..." : "Asentar Calificación (/20 Puntos)"}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Diálogo de Confirmación Institucional */}
      {DialogoConfirmacionInstitucional}
    </Dialog>
  );
}
