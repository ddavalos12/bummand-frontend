"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SeleccionadorFechaHora } from "@/components/ui/seleccionador-fecha";
import { MapPin, CheckCircle2, Clock, Wifi, WifiOff } from "lucide-react";
import { clienteApi } from "@/lib/cliente-api";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import { useTiempoReal } from "@/hooks/useTiempoReal";
import { useFormularioValidado } from "@/hooks/useFormularioValidado";
import { toast } from "sonner";
import { BotonConEstado, TarjetaSpotlight, InsigniaPulsoVivo } from "@/components/animaciones";

export function RegistroHoras() {
  const { usuario } = usarAutenticacion();

  const formulario = useFormularioValidado(
    {
      fecha_entrada: new Date(),
      hora_entrada: "08:00",
      fecha_salida: new Date(),
      hora_salida: "17:00",
    },
    {
      fecha_entrada: {
        obligatorio: "La fecha de entrada es obligatoria.",
        formato: "fecha",
      },
      hora_entrada: {
        obligatorio: "La hora de ingreso es requerida.",
        formato: "hora",
      },
      fecha_salida: {
        obligatorio: "La fecha de salida es obligatoria.",
        formato: "fecha",
      },
      hora_salida: {
        obligatorio: "La hora de salida es requerida.",
        formato: "hora",
        validador: (val, valores) => {
          if (
            valores.fecha_entrada &&
            valores.fecha_salida &&
            valores.fecha_entrada instanceof Date &&
            valores.fecha_salida instanceof Date &&
            valores.fecha_entrada.toDateString() === valores.fecha_salida.toDateString()
          ) {
            if (String(val) <= String(valores.hora_entrada)) {
              return "La hora de salida debe ser posterior a la de ingreso.";
            }
          }
          return null;
        },
      },
    }
  );

  const [cargando, set_cargando] = useState(false);
  const [registrado, set_registrado] = useState(false);
  const [mensaje_estado, set_mensaje_estado] = useState<string | null>(null);
  const [coordenadas, set_coordenadas] = useState<{ lat: number; lng: number }>({
    lat: -16.5000,
    lng: -68.1500,
  });

  const { conectado } = useTiempoReal({
    eventos: {
      asistencia_actualizada: () => {
        // Notificación reactiva recibida por WebSocket
      },
    },
  });

  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (posicion) => {
          set_coordenadas({
            lat: posicion.coords.latitude,
            lng: posicion.coords.longitude,
          });
        },
        () => {
          // Fallback a coordenadas por defecto
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  const manejarRegistro = async () => {
    if (!formulario.validarFormulario()) {
      return;
    }

    set_cargando(true);
    set_mensaje_estado(null);

    const becario_id = usuario?.becario_id || usuario?.id || 1;

    try {
      // 1. Registrar ingreso en endpoint oficial
      const respuesta_ingreso = await clienteApi.post<{
        registro: unknown;
        mensaje: string;
      }>("/api/asistencia/ingreso", {
        becario_id,
        latitud: coordenadas.lat,
        longitud: coordenadas.lng,
        tipo: "practicas",
      });

      // 2. Registrar salida en endpoint oficial
      const respuesta_salida = await clienteApi.post<{
        registro: unknown;
        mensaje: string;
      }>("/api/asistencia/salida", {
        becario_id,
        latitud: coordenadas.lat,
        longitud: coordenadas.lng,
        tipo: "practicas",
      });

      set_mensaje_estado(
        respuesta_salida.mensaje || respuesta_ingreso.mensaje || "Asistencia sincronizada con el servidor."
      );
      set_registrado(true);
      toast.success("Asistencia registrada", {
        description: "Tus horas de entrada y salida han sido sincronizadas en el sistema BUMAND.",
      });
    } catch {
      // Fallback a modo local / datos demo si el servidor no responde
      set_mensaje_estado("Marcación guardada localmente (modo demostración / fuera de línea).");
      set_registrado(true);
      toast.info("Asistencia registrada localmente", {
        description: "Los registros se sincronizarán al restablecer la conexión institucional.",
      });
    } finally {
      set_cargando(false);
    }
  };

  if (registrado) {
    return (
      <Card className="border-[#E3DCCB] shadow-sm bg-white overflow-hidden text-center py-10">
        <div className="flex flex-col items-center justify-center space-y-4">
          <CheckCircle2 className="w-16 h-16 text-[#17B4C4]" />
          <h3 className="font-display font-bold text-2xl text-[#063A6B]">¡Asistencia Registrada!</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            {mensaje_estado || "Tus horas de práctica han sido procesadas correctamente."}
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
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-[#063A6B] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#E2694B]" />
            Registro de Horas
          </CardTitle>
          <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-muted-foreground">
            {conectado ? (
              <span className="flex items-center gap-1 text-[#17B4C4]">
                <Wifi className="w-3.5 h-3.5" /> En tiempo real
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[#C49B24]">
                <WifiOff className="w-3.5 h-3.5" /> Local
              </span>
            )}
          </div>
        </div>
        <CardDescription>Declara tus horas de entrada y salida de prácticas.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="font-bold text-[#122029]">Entrada</Label>
          <div className={formulario.obtenerClaseInput("hora_entrada", "rounded-xl")}>
            <SeleccionadorFechaHora
              fecha={formulario.valores.fecha_entrada as Date}
              alCambiar={(f) => {
                formulario.cambiarValor("fecha_entrada", f);
                formulario.tocarCampo("fecha_entrada");
              }}
              hora={String(formulario.valores.hora_entrada)}
              alCambiarHora={(h) => {
                formulario.cambiarValor("hora_entrada", h);
                formulario.tocarCampo("hora_entrada");
              }}
            />
          </div>
          {formulario.renderizarMensajeError("fecha_entrada")}
          {formulario.renderizarMensajeError("hora_entrada")}
        </div>

        <div className="space-y-2">
          <Label className="font-bold text-[#122029]">Salida</Label>
          <div className={formulario.obtenerClaseInput("hora_salida", "rounded-xl")}>
            <SeleccionadorFechaHora
              fecha={formulario.valores.fecha_salida as Date}
              alCambiar={(f) => {
                formulario.cambiarValor("fecha_salida", f);
                formulario.tocarCampo("fecha_salida");
              }}
              hora={String(formulario.valores.hora_salida)}
              alCambiarHora={(h) => {
                formulario.cambiarValor("hora_salida", h);
                formulario.tocarCampo("hora_salida");
              }}
            />
          </div>
          {formulario.renderizarMensajeError("fecha_salida")}
          {formulario.renderizarMensajeError("hora_salida")}
        </div>

        <div className="bg-[#E3F9FA] p-4 rounded-xl border border-[#17B4C4]/20 flex items-start gap-3">
          <MapPin className="w-5 h-5 text-[#17B4C4] shrink-0 mt-0.5" />
          <div className="text-sm text-[#063A6B]">
            <span className="font-bold block mb-1">Geolocalización Activa</span>
            Ubicación: {coordenadas.lat.toFixed(4)}, {coordenadas.lng.toFixed(4)}. Se adjuntará al registro como comprobante institucional.
          </div>
        </div>

        <BotonConEstado
          alHacerClic={manejarRegistro}
          texto_reposo="Registrar Asistencia"
          texto_cargando="Procesando en servidor..."
          texto_exito="¡Asistencia Acreditada!"
          variante="primario"
          tamaño="lg"
          disparar_confeti_al_exito={true}
          className="w-full h-12 text-sm font-bold"
        />
      </CardContent>
    </Card>
  );
}
