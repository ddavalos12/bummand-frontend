"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";

interface Evaluacion {
  id: number;
  tipo: string;
  semestre: string;
  estado: string;
  puntuacion?: number;
  creado_en?: string;
}

export function ListaEvaluaciones() {
  const [evaluaciones, set_evaluaciones] = useState<Evaluacion[]>([]);
  const [cargando, set_cargando] = useState(true);
  const { usuario, token } = usarAutenticacion();

  useEffect(() => {
    if (!usuario || !token) return;

    const becario_id = usuario.becario_id || 1; 
    const url_base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    
    fetch(`${url_base}/evaluaciones/becario/${becario_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((respuesta) => {
        if (!respuesta.ok) throw new Error("Error obteniendo evaluaciones");
        return respuesta.json();
      })
      .then((datos) => {
        set_evaluaciones(Array.isArray(datos) ? datos : []);
      })
      .catch((error) => {
        console.error("Error cargando evaluaciones:", error);
      })
      .finally(() => {
        set_cargando(false);
      });
  }, [usuario, token]);

  if (cargando) return <p className="text-muted-foreground text-sm">Cargando módulos de evaluación...</p>;

  if (evaluaciones.length === 0) {
    return <p className="text-muted-foreground text-sm">No tienes evaluaciones asignadas.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {evaluaciones.map((ev, indice) => (
        <Card key={ev.id} className="border border-[#E3DCCB]">
          <CardHeader className="pb-2 flex flex-row items-start gap-4 space-y-0">
            <div className="w-8 h-8 rounded-lg bg-[#0A5CA0] text-[#F8C766] font-mono font-bold flex items-center justify-center shrink-0">
              0{indice + 1}
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
