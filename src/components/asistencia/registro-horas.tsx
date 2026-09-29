"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SeleccionadorFechaHora } from "@/components/ui/seleccionador-fecha";
import { MapPin, CheckCircle2, Clock } from "lucide-react";

export function RegistroHoras() {
  const [fecha_entrada, set_fecha_entrada] = useState<Date | undefined>(new Date());
  const [hora_entrada, set_hora_entrada] = useState<string>("08:00");
  
  const [fecha_salida, set_fecha_salida] = useState<Date | undefined>(new Date());
  const [hora_salida, set_hora_salida] = useState<string>("17:00");

  const [cargando, set_cargando] = useState(false);
  const [registrado, set_registrado] = useState(false);

  const manejarRegistro = async () => {
    set_cargando(true);
    // Simular API
    setTimeout(() => {
      set_cargando(false);
      set_registrado(true);
    }, 1500);
  };

  if (registrado) {
    return (
      <Card className="border-[#E3DCCB] shadow-sm bg-white overflow-hidden text-center py-10">
        <div className="flex flex-col items-center justify-center space-y-4">
          <CheckCircle2 className="w-16 h-16 text-[#17B4C4]" />
          <h3 className="font-display font-bold text-2xl text-[#063A6B]">¡Asistencia Registrada!</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Tus horas de práctica han sido registradas correctamente en el sistema.
          </p>
          <Button 
            variant="outline" 
            onClick={() => set_registrado(false)}
            className="mt-4 rounded-xl border-[#E3DCCB] font-bold"
          >
            Registrar Otro Día
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-[#E3DCCB] shadow-sm bg-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#F8C766]/10 rounded-bl-[100px] pointer-events-none" />
      <CardHeader>
        <CardTitle className="font-display text-[#063A6B] flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#E2694B]" />
          Registro de Horas
        </CardTitle>
        <CardDescription>Declara tus horas de entrada y salida de prácticas.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="font-bold text-[#122029]">Entrada</Label>
          <SeleccionadorFechaHora 
            fecha={fecha_entrada} 
            alCambiar={set_fecha_entrada}
            hora={hora_entrada}
            alCambiarHora={set_hora_entrada}
          />
        </div>

        <div className="space-y-3">
          <Label className="font-bold text-[#122029]">Salida</Label>
          <SeleccionadorFechaHora 
            fecha={fecha_salida} 
            alCambiar={set_fecha_salida}
            hora={hora_salida}
            alCambiarHora={set_hora_salida}
          />
        </div>

        <div className="bg-[#E3F9FA] p-4 rounded-xl border border-[#17B4C4]/20 flex items-start gap-3">
          <MapPin className="w-5 h-5 text-[#17B4C4] shrink-0 mt-0.5" />
          <div className="text-sm text-[#063A6B]">
            <span className="font-bold block mb-1">Geolocalización Activa</span>
            Tu ubicación actual se adjuntará al registro como comprobante de asistencia.
          </div>
        </div>

        <Button 
          onClick={manejarRegistro}
          disabled={cargando || !fecha_entrada || !fecha_salida}
          className="w-full h-12 rounded-xl font-bold bg-[#063A6B] hover:bg-[#063A6B]/90 text-white text-md"
        >
          {cargando ? "Procesando..." : "Registrar Asistencia"}
        </Button>
      </CardContent>
    </Card>
  );
}
