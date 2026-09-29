"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usarAutenticacion } from "@/context/AutenticacionContexto";

interface Evaluacion {
  id: number;
  tipo: string;
  semestre: string;
  estado: string;
  puntuacion?: number;
  createdAt: string;
}

export function EvaluacionList() {
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const { usuario, token } = usarAutenticacion();

  useEffect(() => {
    if (!usuario || !token) return;

    // Obtener el ID del becario asociado al usuario logueado
    const becario_id = usuario.becario_id || 1; 
    
    fetch(`http://localhost:3000/evaluaciones/becario/${becario_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((respuesta) => {
        if (!respuesta.ok) throw new Error("Error obteniendo evaluaciones");
        return respuesta.json();
      })
      .then((datos) => {
        setEvaluaciones(Array.isArray(datos) ? datos : []);
      })
      .catch((error) => {
        console.error("Error cargando evaluaciones:", error);
      })
      .finally(() => {
        setCargando(false);
      });
  }, [usuario, token]);

  if (cargando) return <p className="text-muted-foreground text-sm">Cargando módulos de evaluación...</p>;

  if (evaluaciones.length === 0) {
    return <p className="text-muted-foreground text-sm">No tienes evaluaciones asignadas.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {evaluaciones.map((ev, index) => (
        <Card key={ev.id} className="border border-[#E3DCCB]">
          <CardHeader className="pb-2 flex flex-row items-start gap-4 space-y-0">
            <div className="w-8 h-8 rounded-lg bg-[#0A5CA0] text-[#F8C766] font-mono font-bold flex items-center justify-center shrink-0">
              0{index + 1}
            </div>
            <div className="flex-1">
              <CardTitle className="font-display font-bold text-sm">
                {ev.tipo === "f-03" ? "Formulario Pastoral F-03" : "Autoevaluación Académica"}
              </CardTitle>
              <p className="text-[11px] text-muted-foreground font-mono mt-1">Semestre: {ev.semestre}</p>
            </div>
            <div>
              <Badge
                variant="outline"
                className={`border-none ${
                  ev.estado === "aprobado"
                    ? "bg-[#3FA66B]/10 text-[#3FA66B]"
                    : ev.estado === "borrador"
                    ? "bg-[#D99B2B]/10 text-[#D99B2B]"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {ev.estado.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {ev.puntuacion && (
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-display font-bold text-2xl text-[#063A6B]">{ev.puntuacion}</span>
                <span className="font-mono text-[11px] text-[#8A9BA4]">/ 10 pts</span>
              </div>
            )}
            {!ev.puntuacion && (
              <div className="mt-2 text-[12px] font-medium text-muted-foreground italic">
                Pendiente de calificación
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

