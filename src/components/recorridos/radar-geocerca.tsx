"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

/**
 * @component RadarGeocerca
 * @description Simula el radar de geocerca del módulo de recorridos. 
 * Realiza un escaneo visual de ubicación y luego permite confirmar la llegada/salida 
 * de una entidad de Diaconía o Iglesia. Usa las animaciones del prototipo legacy.
 */
export function RadarGeocerca({ alMarcarLlegada }: { alMarcarLlegada?: (ubicacion: string) => void }) {
  const [detectando, set_detectando] = useState(true);
  const [ubicacion, set_ubicacion] = useState<string | null>(null);

  useEffect(() => {
    // Simula la detección de GPS tras 3 segundos
    const temporizador = setTimeout(() => {
      set_detectando(false);
      set_ubicacion("Iglesia Central");
    }, 3000);
    return () => clearTimeout(temporizador);
  }, []);

  return (
    <div className="w-full">
      {/* Caja visual del radar */}
      <div 
        className="relative h-[180px] rounded-2xl overflow-hidden mb-4"
        style={{
          background: `linear-gradient(rgba(15,48,74,0.94), rgba(15,48,74,0.94)),
                       repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255,255,255,0.05) 20px),
                       repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(255,255,255,0.05) 20px)`,
          backgroundColor: '#063A6B'
        }}
      >
        {/* Anillo discontinuo fijo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130px] h-[130px] rounded-full border border-dashed border-[#7FE0E6]/30" />
        
        {detectando ? (
          <>
            {/* Anillos animados */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-[#7FE0E6] opacity-0 animate-ping" style={{ animationDuration: '2.6s', animationDelay: '0s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-[#7FE0E6] opacity-0 animate-ping" style={{ animationDuration: '2.6s', animationDelay: '0.7s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-[#7FE0E6] opacity-0 animate-ping" style={{ animationDuration: '2.6s', animationDelay: '1.4s' }} />
          </>
        ) : (
          /* Marcador cuando se detecta */
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full w-4 h-4 bg-[#F5A623] rounded-t-full rounded-bl-full -rotate-45 shadow-[0_0_0_4px_rgba(245,166,35,0.2)]" />
        )}

        <div className="absolute bottom-2.5 left-2.5 font-mono text-[10px] text-[#7FE0E6] bg-black/30 px-2 py-1 rounded-md">
          {detectando ? "ESCANEANDO PERÍMETRO..." : "COORDENADAS FIJADAS"}
        </div>
      </div>

      {/* Área de acción */}
      <div>
        <h4 className="font-bold text-[14.5px] text-[#122029]">
          {detectando ? "Buscando ubicación..." : ubicacion}
        </h4>
        <p className="text-[12px] text-muted-foreground mb-4">
          {detectando 
            ? "Asegúrate de tener el GPS activado." 
            : "Estás dentro del perímetro permitido (150m)."}
        </p>

        <div className="flex gap-2">
          <Button 
            disabled={detectando}
            onClick={() => alMarcarLlegada && alMarcarLlegada(ubicacion || "")}
            className="flex-1 h-11 bg-[#17B4C4] hover:bg-[#17B4C4]/90 text-[#063A6B] font-bold rounded-xl"
          >
            Marcar Llegada
          </Button>
          <Button 
            variant="outline"
            disabled={detectando}
            className="flex-1 h-11 border-[#E3DCCB] text-[#5B6D77] font-bold rounded-xl"
          >
            Marcar Salida
          </Button>
        </div>
      </div>
    </div>
  );
}
