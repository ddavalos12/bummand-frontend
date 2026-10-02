"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { FormularioF03 } from "./formulario-f03";
import { FirmaDigital } from "./firma-digital";
import { Award, CheckCircle, FileText, PenTool, Sparkles, TrendingUp, Users } from "lucide-react";

interface ModuloPonderado {
  id: number;
  nombre: string;
  evaluador_rol: string;
  ponderacion_porcentaje: number;
  puntaje_obtenido: number; // 0 - 100
  estado: "completado" | "pendiente";
}

const MODULOS_INICIALES: ModuloPonderado[] = [
  {
    id: 1,
    nombre: "Liderazgo en la Iglesia (Formulario F-03)",
    evaluador_rol: "Pastor de la Congregación",
    ponderacion_porcentaje: 25,
    puntaje_obtenido: 92,
    estado: "completado",
  },
  {
    id: 2,
    nombre: "Autoevaluación Académica",
    evaluador_rol: "Estudiante Becario",
    ponderacion_porcentaje: 20,
    puntaje_obtenido: 88,
    estado: "completado",
  },
  {
    id: 3,
    nombre: "Evaluación del Mentor / Prácticas",
    evaluador_rol: "Supervisor Diaconía",
    ponderacion_porcentaje: 25,
    puntaje_obtenido: 95,
    estado: "completado",
  },
  {
    id: 4,
    nombre: "Evaluación Escuela de Líderes",
    evaluador_rol: "Facilitador Pastoral",
    ponderacion_porcentaje: 15,
    puntaje_obtenido: 85,
    estado: "pendiente",
  },
  {
    id: 5,
    nombre: "Evaluación Socioeconómica",
    evaluador_rol: "Trabajador Social",
    ponderacion_porcentaje: 15,
    puntaje_obtenido: 90,
    estado: "completado",
  },
];

export function MatrizEvaluacion360() {
  const [modulos, set_modulos] = useState<ModuloPonderado[]>(MODULOS_INICIALES);
  const [firma_supervisor, set_firma_supervisor] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      {/* Resumen Superior de Rendimiento */}
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
                <TrendingUp className="w-3.5 h-3.5" /> 80% del ciclo completado
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

      {/* Matriz Detallada de 5 Módulos */}
      <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-xl">
        <CardHeader className="pb-3 border-b border-[#E3DCCB]/60">
          <CardTitle className="text-lg font-bold font-display text-[#063A6B]">
            Matriz de Evaluación Integral por Competencias (5 Ejes)
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

                {m.id === 1 && (
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
                    <DialogContent className="sm:max-w-[500px] p-0 border-none bg-transparent shadow-none">
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
              <DialogContent className="sm:max-w-[460px] p-0 border-none bg-transparent shadow-none">
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
