"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";

/**
 * @component FormularioF03
 * @description Formulario digitalizado para la evaluación F-03 del supervisor pastoral. 
 * Contiene una lista de checklist (preguntas de evaluación) con botones de opción tipo "Pills" 
 * y recolecta información cualitativa para ser enviada al backend de NestJS.
 */
export function FormularioF03({ becario_id, alEnviarExito }: { becario_id: number; alEnviarExito?: () => void }) {
  const [respuestas, set_respuestas] = useState<Record<string, string>>({});
  const [comentarios, set_comentarios] = useState("");
  const [cargando, set_cargando] = useState(false);

  const preguntas = [
    { id: "p1", text: "¿Demuestra puntualidad en sus asignaciones?" },
    { id: "p2", text: "¿Cumple con responsabilidad las tareas delegadas?" },
    { id: "p3", text: "¿Mantiene una actitud de servicio y disposición?" },
    { id: "p4", text: "¿Trabaja en equipo eficazmente?" }
  ];

  const manejarCambioOpcion = (id_pregunta: string, valor: string) => {
    set_respuestas(prev => ({ ...prev, [id_pregunta]: valor }));
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    set_cargando(true);

    try {
      const carga_util = {
        becario_id: becario_id,
        tipo: "f-03",
        semestre: "2026-1", // Esto idealmente viene del contexto global
        respuestas,
        comentarios,
      };

      const respuesta = await fetch(`http://localhost:3000/evaluaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(carga_util)
      });

      if (!respuesta.ok) throw new Error("Error enviando evaluación");
      
      alert("Evaluación F-03 enviada correctamente al sistema BUMAND.");
      if (alEnviarExito) alEnviarExito();
    } catch (error) {
      console.error(error);
      alert("Hubo un error al enviar. El servidor puede estar apagado.");
    } finally {
      set_cargando(false);
    }
  };

  return (
    <Card className="border-[#E3DCCB] shadow-sm">
      <CardHeader className="border-b border-[#E3DCCB] pb-4 mb-4">
        <CardTitle className="font-display font-bold text-lg text-[#063A6B]">
          Evaluación Pastoral (F-03)
        </CardTitle>
        <CardDescription className="text-[12px] text-muted-foreground font-mono mt-1">
          Complete el checklist de competencias del becario.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={manejarEnvio} className="space-y-6">
          <div className="space-y-6">
            {preguntas.map((p) => (
              <div key={p.id} className="space-y-3">
                <Label className="text-[12.5px] font-semibold text-[#122029]">
                  {p.text}
                </Label>
                <RadioGroup 
                  onValueChange={(val) => manejarCambioOpcion(p.id, val)}
                  className="flex flex-wrap gap-2"
                >
                  {["Siempre", "Casi Siempre", "A veces", "Nunca"].map((opt) => (
                    <div key={opt}>
                      <RadioGroupItem value={opt} id={`${p.id}-${opt}`} className="peer sr-only" />
                      <Label
                        htmlFor={`${p.id}-${opt}`}
                        className="flex items-center justify-center px-4 py-2 text-[11.5px] bg-white border-1.5 border-[#E3DCCB] rounded-full cursor-pointer hover:bg-muted peer-data-[state=checked]:border-[#17B4C4] peer-data-[state=checked]:bg-[#E3F9FA] peer-data-[state=checked]:text-[#122029] peer-data-[state=checked]:font-bold transition-all"
                      >
                        {opt}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </div>

          <div className="space-y-3 mt-6 pt-4 border-t border-[#E3DCCB]">
            <Label className="text-[12.5px] font-semibold text-[#122029]">Comentarios Adicionales</Label>
            <Input 
              value={comentarios} 
              onChange={(e) => set_comentarios(e.target.value)}
              placeholder="Describa el progreso cualitativo..."
              className="font-body text-[14px]"
            />
          </div>

          <Button 
            type="submit" 
            disabled={cargando || Object.keys(respuestas).length < preguntas.length}
            className="w-full h-11 rounded-xl bg-[#17B4C4] hover:bg-[#17B4C4]/90 text-[#063A6B] font-bold"
          >
            {cargando ? "Guardando..." : "Finalizar Evaluación"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

