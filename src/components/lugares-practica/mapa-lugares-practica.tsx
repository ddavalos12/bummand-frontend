"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Plus, Navigation, ShieldCheck, Crosshair, Check } from "lucide-react";

interface SedePractica {
  id: number;
  nombre: string;
  direccion: string;
  latitud: number;
  longitud: number;
  radio_tolerancia_m: number;
  becarios_asignados: number;
}

const SEDES_INICIALES: SedePractica[] = [
  {
    id: 1,
    nombre: "Oficina Central - Bloque A",
    direccion: "Av. Juan Pablo II #2540, El Alto",
    latitud: -16.500053,
    longitud: -68.173455,
    radio_tolerancia_m: 80,
    becarios_asignados: 12,
  },
  {
    id: 2,
    nombre: "Oficina Central - Bloque B",
    direccion: "Av. Juan Pablo II #2542, El Alto",
    latitud: -16.499912,
    longitud: -68.173204,
    radio_tolerancia_m: 60,
    becarios_asignados: 8,
  },
  {
    id: 3,
    nombre: "Agencia Juan Pablo II",
    direccion: "Ceja de El Alto, cruce Villa Esperanza",
    latitud: -16.50231,
    longitud: -68.16892,
    radio_tolerancia_m: 100,
    becarios_asignados: 5,
  },
  {
    id: 4,
    nombre: "Agencia La Paz Central",
    direccion: "Calle Mercado esq. Socabaya, La Paz",
    latitud: -16.49652,
    longitud: -68.13421,
    radio_tolerancia_m: 100,
    becarios_asignados: 4,
  },
];

export function MapaLugaresPractica() {
  const [sedes, set_sedes] = useState<SedePractica[]>(SEDES_INICIALES);
  const [sede_seleccionada, set_sede_seleccionada] = useState<SedePractica>(SEDES_INICIALES[0]);
  const [radio_editado, set_radio_editado] = useState(SEDES_INICIALES[0].radio_tolerancia_m);
  const [modal_abierto, set_modal_abierto] = useState(false);
  const [nombre_sede, set_nombre_sede] = useState("");
  const [dir_sede, set_dir_sede] = useState("");
  const [lat_nueva, set_lat_nueva] = useState("-16.500000");
  const [lng_nueva, set_lng_nueva] = useState("-68.170000");
  const [radio_nuevo, set_radio_nuevo] = useState("80");

  const manejarSeleccionarSede = (sede: SedePractica) => {
    set_sede_seleccionada(sede);
    set_radio_editado(sede.radio_tolerancia_m);
  };

  const manejarActualizarRadio = () => {
    set_sedes((prev) =>
      prev.map((s) => (s.id === sede_seleccionada.id ? { ...s, radio_tolerancia_m: radio_editado } : s))
    );
    set_sede_seleccionada((prev) => ({ ...prev, radio_tolerancia_m: radio_editado }));
  };

  const manejarCrearSede = (e: React.FormEvent) => {
    e.preventDefault();
    const nueva: SedePractica = {
      id: sedes.length + 1,
      nombre: nombre_sede,
      direccion: dir_sede,
      latitud: parseFloat(lat_nueva),
      longitud: parseFloat(lng_nueva),
      radio_tolerancia_m: parseInt(radio_nuevo, 10) || 80,
      becarios_asignados: 0,
    };
    set_sedes([nueva, ...sedes]);
    set_sede_seleccionada(nueva);
    set_radio_editado(nueva.radio_tolerancia_m);
    set_nombre_sede("");
    set_dir_sede("");
    set_modal_abierto(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Columna Izquierda: Lista de Sedes */}
      <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-xl lg:col-span-1 flex flex-col">
        <CardHeader className="pb-3 border-b border-[#E3DCCB]/60">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold font-display text-[#063A6B]">
                Sedes de Práctica
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Geocercas activas Diaconía FRIF-IFD
              </CardDescription>
            </div>

            <Dialog open={modal_abierto} onOpenChange={set_modal_abierto}>
              {/* @ts-ignore */}
              <DialogTrigger asChild>
                <Button size="sm" className="h-9 px-3 bg-[#17B4C4] hover:bg-[#17B4C4]/90 text-[#063A6B] font-bold rounded-lg text-xs flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Nueva Sede
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[420px] bg-white rounded-2xl border-[#E3DCCB]">
                <DialogHeader>
                  <DialogTitle className="text-base font-bold text-[#063A6B]">
                    Registrar Nueva Sede / Sucursal
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={manejarCrearSede} className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Nombre de la Sede</Label>
                    <Input
                      placeholder="Ej. Sucursal Villa Adela"
                      value={nombre_sede}
                      onChange={(e) => set_nombre_sede(e.target.value)}
                      required
                      className="h-9 border-[#E3DCCB]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Dirección</Label>
                    <Input
                      placeholder="Av. Ladislao Cabrera"
                      value={dir_sede}
                      onChange={(e) => set_dir_sede(e.target.value)}
                      required
                      className="h-9 border-[#E3DCCB]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Latitud</Label>
                      <Input
                        value={lat_nueva}
                        onChange={(e) => set_lat_nueva(e.target.value)}
                        required
                        className="h-9 font-mono text-xs border-[#E3DCCB]"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Longitud</Label>
                      <Input
                        value={lng_nueva}
                        onChange={(e) => set_lng_nueva(e.target.value)}
                        required
                        className="h-9 font-mono text-xs border-[#E3DCCB]"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Radio de Tolerancia (metros)</Label>
                    <Input
                      type="number"
                      value={radio_nuevo}
                      onChange={(e) => set_radio_nuevo(e.target.value)}
                      required
                      className="h-9 font-mono text-xs border-[#E3DCCB]"
                    />
                  </div>
                  <div className="pt-2 flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => set_modal_abierto(false)}
                      className="h-9 border-[#E3DCCB]"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="h-9 bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold"
                    >
                      Guardar Sede
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-3 space-y-2 overflow-y-auto max-h-[480px]">
          {sedes.map((s) => (
            <div
              key={s.id}
              onClick={() => manejarSeleccionarSede(s)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                sede_seleccionada.id === s.id
                  ? "bg-[#17B4C4]/10 border-[#17B4C4] shadow-sm"
                  : "bg-white border-[#E3DCCB]/60 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#063A6B]">{s.nombre}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.direccion}</p>
                </div>
                <Badge variant="outline" className="font-mono text-[10px] border-[#E3DCCB] text-[#063A6B]">
                  {s.radio_tolerancia_m} m
                </Badge>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                <span>{s.latitud.toFixed(4)}, {s.longitud.toFixed(4)}</span>
                <span className="text-[#063A6B] font-semibold">{s.becarios_asignados} becarios</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Columna Derecha: Mapa Interactivo y Configuración de Geocerca */}
      <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-xl lg:col-span-2 flex flex-col">
        <CardHeader className="pb-3 border-b border-[#E3DCCB]/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-bold font-display text-[#063A6B] flex items-center gap-2">
                <Navigation className="w-5 h-5 text-[#17B4C4]" />
                Geocerca Interactiva: {sede_seleccionada.nombre}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Perímetro de validación GPS mediante la fórmula de Haversine para marcación de ingreso/salida.
              </CardDescription>
            </div>
            <Badge className="bg-[#063A6B] text-[#F8C766] font-mono text-xs px-3 py-1 self-start sm:self-auto">
              Radio: {radio_editado} metros
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 flex-1 flex flex-col gap-6">
          {/* Visualizador de Radar / Geocerca */}
          <div className="relative w-full h-64 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-[#E3DCCB]">
            {/* Grilla de radar */}
            <div className="absolute inset-0 bg-[radial-gradient(#17B4C4_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
            
            {/* Círculo concéntrico exterior (Radio) */}
            <div
              className="absolute rounded-full border-2 border-[#17B4C4] bg-[#17B4C4]/15 transition-all duration-300 animate-pulse"
              style={{
                width: `${Math.min(radio_editado * 2.2, 230)}px`,
                height: `${Math.min(radio_editado * 2.2, 230)}px`,
              }}
            />

            {/* Círculo medio */}
            <div
              className="absolute rounded-full border border-dashed border-[#F8C766]/60"
              style={{
                width: `${Math.min(radio_editado * 1.4, 150)}px`,
                height: `${Math.min(radio_editado * 1.4, 150)}px`,
              }}
            />

            {/* Marcador central de la sede */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#063A6B] border-2 border-white shadow-lg flex items-center justify-center text-white">
                <MapPin className="w-5 h-5 text-[#F8C766]" />
              </div>
              <span className="mt-1 px-2 py-0.5 bg-black/75 text-white text-[10px] font-mono rounded backdrop-blur-sm">
                Lat: {sede_seleccionada.latitud} | Lng: {sede_seleccionada.longitud}
              </span>
            </div>

            {/* Simulación de punto de becario */}
            <div className="absolute top-12 right-20 flex items-center gap-1 z-10">
              <div className="w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-emerald-400/30" />
              <span className="text-[10px] font-mono text-emerald-300 bg-black/60 px-1.5 py-0.5 rounded">
                GPS Becario (En rango)
              </span>
            </div>
          </div>

          {/* Controles de Ajuste de Geocerca */}
          <div className="p-4 bg-muted/30 rounded-xl border border-[#E3DCCB]/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-[#063A6B] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Calibración del Perímetro de Tolerancia
                </h4>
                <p className="text-xs text-muted-foreground">
                  Ajusta la tolerancia para amortiguar el error atmosférico de GPS en dispositivos móviles (estándar: 50m a 100m).
                </p>
              </div>
              <Button
                size="sm"
                onClick={manejarActualizarRadio}
                className="h-9 px-4 bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold rounded-lg text-xs flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Guardar Ajuste
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="range"
                min="20"
                max="200"
                step="5"
                value={radio_editado}
                onChange={(e) => set_radio_editado(parseInt(e.target.value, 10))}
                className="flex-1 accent-[#17B4C4] h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="w-24">
                <Input
                  type="number"
                  value={radio_editado}
                  onChange={(e) => set_radio_editado(parseInt(e.target.value, 10) || 50)}
                  className="h-9 font-mono text-xs text-center border-[#E3DCCB]"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
