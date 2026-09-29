"use client";

import { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * @component FirmaDigital
 * @description Permite al supervisor firmar electrónicamente una evaluación aprobada. 
 * Soporta firmas táctiles (móvil) y con ratón. El resultado se puede exportar en base64.
 */
export function FirmaDigital({ alFirmar }: { alFirmar: (firma_base64: string) => void }) {
  const lienzo_ref = useRef<HTMLCanvasElement>(null);
  const [dibujando, set_dibujando] = useState(false);
  const [tiene_firma, set_tiene_firma] = useState(false);

  // Inicializar contexto del lienzo para trazos suaves
  useEffect(() => {
    const lienzo = lienzo_ref.current;
    if (lienzo) {
      const contexto = lienzo.getContext("2d");
      if (contexto) {
        contexto.lineJoin = "round";
        contexto.lineCap = "round";
        contexto.lineWidth = 2.5;
        contexto.strokeStyle = "#063A6B";
      }
    }
  }, []);

  const obtenerCoordenadas = (e: React.MouseEvent | React.TouchEvent) => {
    const lienzo = lienzo_ref.current;
    if (!lienzo) return { x: 0, y: 0 };
    
    const rect = lienzo.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: (e as React.MouseEvent).clientX - rect.left,
        y: (e as React.MouseEvent).clientY - rect.top,
      };
    }
  };

  const iniciarDibujo = (e: React.MouseEvent | React.TouchEvent) => {
    set_dibujando(true);
    const { x, y } = obtenerCoordenadas(e);
    const contexto = lienzo_ref.current?.getContext("2d");
    if (contexto) {
      contexto.beginPath();
      contexto.moveTo(x, y);
    }
  };

  const dibujar = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dibujando) return;
    const { x, y } = obtenerCoordenadas(e);
    const contexto = lienzo_ref.current?.getContext("2d");
    if (contexto) {
      contexto.lineTo(x, y);
      contexto.stroke();
      set_tiene_firma(true);
    }
  };

  const terminarDibujo = () => {
    set_dibujando(false);
  };

  const limpiarLienzo = () => {
    const lienzo = lienzo_ref.current;
    if (lienzo) {
      const contexto = lienzo.getContext("2d");
      contexto?.clearRect(0, 0, lienzo.width, lienzo.height);
      set_tiene_firma(false);
    }
  };

  const manejarGuardado = () => {
    if (lienzo_ref.current && tiene_firma) {
      const base64 = lienzo_ref.current.toDataURL("image/png");
      alFirmar(base64);
    }
  };

  return (
    <Card className="border-[#E3DCCB] shadow-sm w-full max-w-md mx-auto">
      <CardHeader className="pb-4 border-b border-[#E3DCCB]">
        <CardTitle className="font-display text-[#063A6B] text-lg">
          Firma Electrónica
        </CardTitle>
        <CardDescription className="text-muted-foreground text-[12px]">
          Firme dentro del recuadro para validar el documento.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="border-2 border-dashed border-[#C9E5E4] rounded-xl bg-[#F6F2E9] overflow-hidden flex justify-center items-center touch-none">
          <canvas
            ref={lienzo_ref}
            width={350}
            height={150}
            onMouseDown={iniciarDibujo}
            onMouseMove={dibujar}
            onMouseUp={terminarDibujo}
            onMouseOut={terminarDibujo}
            onTouchStart={iniciarDibujo}
            onTouchMove={dibujar}
            onTouchEnd={terminarDibujo}
            className="cursor-crosshair w-full"
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={limpiarLienzo}
            className="flex-1 font-bold text-[#5B6D77] border-[#E3DCCB] rounded-xl"
          >
            Limpiar
          </Button>
          <Button 
            onClick={manejarGuardado}
            disabled={!tiene_firma}
            className="flex-1 font-bold bg-[#17B4C4] hover:bg-[#17B4C4]/90 text-[#063A6B] rounded-xl"
          >
            Aprobar y Firmar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
