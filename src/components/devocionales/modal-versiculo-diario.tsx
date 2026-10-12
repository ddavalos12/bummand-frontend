"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Sparkles, HeartHandshake } from "lucide-react";
import { BordeLuminoso } from "@/components/animaciones";

export interface VersiculoBiblicoWeb {
  cita: string;
  libro: string;
  capitulo: number;
  versiculo: number;
  texto: string;
  version: string;
  tema: string;
  reflexion_diaconal: string;
}

const VERSICULO_RESPALDO: VersiculoBiblicoWeb = {
  cita: "Filipenses 4:13",
  libro: "Filipenses",
  capitulo: 4,
  versiculo: 13,
  texto: "Todo lo puedo en Cristo que me fortalece.",
  version: "Reina-Valera 1960 (RVR60)",
  tema: "Fortaleza y Servicio",
  reflexion_diaconal:
    "En cada labor y apoyo formativo dentro de Diaconía, Cristo es quien renueva nuestras capacidades para servir con excelencia.",
};

interface PropiedadesModalVersiculo {
  abierto: boolean;
  alCambiarAbierto: (abierto: boolean) => void;
  alIrADevocionales?: (cita: string, texto: string) => void;
}

export function ModalVersiculoDiario({
  abierto,
  alCambiarAbierto,
  alIrADevocionales,
}: PropiedadesModalVersiculo) {
  const [versiculo, set_versiculo] = useState<VersiculoBiblicoWeb>(VERSICULO_RESPALDO);
  const [cargando, set_cargando] = useState(false);

  useEffect(() => {
    if (!abierto) return;

    const cargarVersiculo = async () => {
      set_cargando(true);
      try {
        const url_base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
        const respuesta = await fetch(`${url_base}/biblia/versiculo-diario`);
        if (respuesta.ok) {
          const datos = await respuesta.json();
          if (datos && datos.cita) {
            set_versiculo(datos);
          }
        }
      } catch (_) {
        // En caso de desconexión, se conserva VERSICULO_RESPALDO
      } finally {
        set_cargando(false);
      }
    };

    cargarVersiculo();
  }, [abierto]);

  const cerrarYGuardar = () => {
    alCambiarAbierto(false);
  };

  const irADevocionalesYEnviar = () => {
    alCambiarAbierto(false);
    if (alIrADevocionales) {
      alIrADevocionales(versiculo.cita, versiculo.texto);
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={alCambiarAbierto}>
      <DialogContent showCloseButton={false} className="max-w-lg p-0 overflow-hidden border border-[#E3DCCB] bg-white shadow-2xl rounded-2xl">
        {/* Cabecera institucional Diaconía */}
        <div className="bg-gradient-to-r from-[#17B4C4] to-[#122029] p-6 text-white text-center relative overflow-hidden">
          <div className="w-12 h-12 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-3 shadow-inner">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-white mb-1">
            Versículo del Día
          </DialogTitle>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge className="bg-white/20 hover:bg-white/30 text-white text-[11px] font-medium border-none px-2.5 py-0.5">
              {versiculo.version}
            </Badge>
            <Badge className="bg-[#F8C766]/30 text-[#FFF9E6] text-[11px] font-semibold border-none px-2.5 py-0.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#F8C766]" />
              {versiculo.tema}
            </Badge>
          </div>
        </div>

        {/* Contenido del versículo y reflexión */}
        <div className="p-6 space-y-4">
          <div className="text-center space-y-2">
            <div className="inline-block bg-[#17B4C4]/10 text-[#0E7A85] text-xs font-bold px-3 py-1 rounded-full border border-[#17B4C4]/20">
              {versiculo.cita}
            </div>
            <p className="text-base font-serif italic text-[#122029] leading-relaxed px-3 font-medium">
              «{versiculo.texto}»
            </p>
          </div>

          <div className="bg-[#F8F9FA] rounded-xl p-4 border border-[#E9ECEF] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0E7A85]">
              <HeartHandshake className="w-4 h-4" />
              <span>Reflexión Diaconal Institucional</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {versiculo.reflexion_diaconal}
            </p>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex sm:flex-row justify-end gap-2.5">
          <Button
            variant="outline"
            onClick={cerrarYGuardar}
            className="border-slate-200 text-slate-700 hover:bg-slate-100 text-xs h-9 px-4 rounded-xl"
          >
            Comenzar Jornada
          </Button>
          <Button
            onClick={irADevocionalesYEnviar}
            className="bg-[#17B4C4] hover:bg-[#128E9B] text-white text-xs h-9 px-4 rounded-xl font-semibold"
          >
            Ir a mis Devocionales
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
