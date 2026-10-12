"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import {
  MapPin,
  Plus,
  Navigation,
  ShieldCheck,
  Check,
  Building,
  Lock,
  Layers,
  Info,
} from "lucide-react";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import { toast } from "sonner";

export interface BloqueSede {
  id: string;
  nombre: string;
  descripcion: string;
  latitud: number;
  longitud: number;
}

export interface SedePractica {
  id: number;
  nombre: string;
  direccion: string;
  latitud: number;
  longitud: number;
  radio_tolerancia_m: number;
  becarios_asignados: number;
  bloques: BloqueSede[];
}

const SEDES_INICIALES: SedePractica[] = [
  {
    id: 1,
    nombre: "Oficina Central El Alto",
    direccion: "Av. Juan Pablo II #2540, El Alto",
    latitud: -16.500053,
    longitud: -68.173455,
    radio_tolerancia_m: 80,
    becarios_asignados: 20,
    bloques: [
      {
        id: "bloque-a",
        nombre: "Bloque A (Administración Central)",
        descripcion: "Pisos 1 al 4, Gerencia de Créditos y Dirección General",
        latitud: -16.500053,
        longitud: -68.173455,
      },
      {
        id: "bloque-b",
        nombre: "Bloque B (Auditorio y Capacitación)",
        descripcion: "Centro de Cómputo, Aulas BUMAND y Auditorio Pastoral",
        latitud: -16.499912,
        longitud: -68.173204,
      },
    ],
  },
  {
    id: 2,
    nombre: "Agencia Juan Pablo II",
    direccion: "Ceja de El Alto, cruce Villa Esperanza",
    latitud: -16.50231,
    longitud: -68.16892,
    radio_tolerancia_m: 100,
    becarios_asignados: 5,
    bloques: [
      {
        id: "bloque-unico",
        nombre: "Bloque A (Plataforma y Cajas)",
        descripcion: "Atención al cliente y asesoría financiera",
        latitud: -16.50231,
        longitud: -68.16892,
      },
    ],
  },
  {
    id: 3,
    nombre: "Agencia La Paz Central",
    direccion: "Calle Mercado esq. Socabaya, La Paz",
    latitud: -16.49652,
    longitud: -68.13421,
    radio_tolerancia_m: 90,
    becarios_asignados: 4,
    bloques: [
      {
        id: "bloque-a",
        nombre: "Bloque A (Operaciones Urbanas)",
        descripcion: "Plataforma central y área contable",
        latitud: -16.49652,
        longitud: -68.13421,
      },
    ],
  },
  {
    id: 4,
    nombre: "Sucursal Villa Adela",
    direccion: "Plaza Bolivia, Av. Ladislao Cabrera #100",
    latitud: -16.52512,
    longitud: -68.18954,
    radio_tolerancia_m: 75,
    becarios_asignados: 3,
    bloques: [
      {
        id: "bloque-a",
        nombre: "Bloque A (Agencia y Servicios)",
        descripcion: "Cajas y asesoría de microcrédito",
        latitud: -16.52512,
        longitud: -68.18954,
      },
    ],
  },
];

export function MapaLugaresPractica() {
  const { usuario } = usarAutenticacion();
  const es_admin = usuario?.rol === "administrador";

  const [sedes, set_sedes] = useState<SedePractica[]>(SEDES_INICIALES);
  const [sede_seleccionada, set_sede_seleccionada] = useState<SedePractica>(SEDES_INICIALES[0]);
  const [bloque_activo, set_bloque_activo] = useState<BloqueSede>(SEDES_INICIALES[0].bloques[0]);
  const [radio_editado, set_radio_editado] = useState(SEDES_INICIALES[0].radio_tolerancia_m);
  const [modal_abierto, set_modal_abierto] = useState(false);

  // Formulario nueva sede
  const [nombre_sede, set_nombre_sede] = useState("");
  const [dir_sede, set_dir_sede] = useState("");
  const [lat_nueva, set_lat_nueva] = useState("-16.500000");
  const [lng_nueva, set_lng_nueva] = useState("-68.170000");
  const [radio_nuevo, set_radio_nuevo] = useState("80");
  const [incluir_bloque_b, set_incluir_bloque_b] = useState(true);

  const manejarSeleccionarSede = (sede: SedePractica) => {
    set_sede_seleccionada(sede);
    set_bloque_activo(sede.bloques[0] || {
      id: "bloque-a",
      nombre: "Bloque A",
      descripcion: "Área general",
      latitud: sede.latitud,
      longitud: sede.longitud,
    });
    set_radio_editado(sede.radio_tolerancia_m);
  };

  const manejarActualizarRadio = () => {
    if (!es_admin) {
      toast.error("Permiso denegado: Solo el Administrador puede modificar parámetros de geocerca.");
      return;
    }
    set_sedes((prev) =>
      prev.map((s) => (s.id === sede_seleccionada.id ? { ...s, radio_tolerancia_m: radio_editado } : s))
    );
    set_sede_seleccionada((prev) => ({ ...prev, radio_tolerancia_m: radio_editado }));
    toast.success(`Geocerca actualizada: Radio calibrado a ${radio_editado} metros.`);
  };

  const manejarCrearSede = (e: React.FormEvent) => {
    e.preventDefault();
    if (!es_admin) {
      toast.error("Permiso denegado: Solo el Administrador puede crear sedes y bloques.");
      return;
    }

    const lat = parseFloat(lat_nueva);
    const lng = parseFloat(lng_nueva);
    const radio = parseInt(radio_nuevo, 10) || 80;

    const bloques_generados: BloqueSede[] = [
      {
        id: "bloque-a",
        nombre: "Bloque A (Principal)",
        descripcion: "Oficinas y operaciones centrales",
        latitud: lat,
        longitud: lng,
      },
    ];

    if (incluir_bloque_b) {
      bloques_generados.push({
        id: "bloque-b",
        nombre: "Bloque B (Auditorio / Servicios)",
        descripcion: "Salas de reuniones y formación",
        latitud: lat + 0.00014,
        longitud: lng + 0.00025,
      });
    }

    const nueva: SedePractica = {
      id: sedes.length + 1,
      nombre: nombre_sede,
      direccion: dir_sede,
      latitud: lat,
      longitud: lng,
      radio_tolerancia_m: radio,
      becarios_asignados: 0,
      bloques: bloques_generados,
    };

    set_sedes([nueva, ...sedes]);
    manejarSeleccionarSede(nueva);
    set_nombre_sede("");
    set_dir_sede("");
    set_modal_abierto(false);
    toast.success(`Sede "${nueva.nombre}" registrada con ${bloques_generados.length} bloque(s).`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Columna Izquierda: Lista de Sedes */}
      <Card className="border-[#E3DCCB] shadow-sm bg-white rounded-xl lg:col-span-1 flex flex-col">
        <CardHeader className="pb-3 border-b border-[#E3DCCB]/60">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold font-display text-[#063A6B]">
                Sedes y Bloques
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Geocercas activas Diaconía FRIF-IFD
              </CardDescription>
            </div>

            {es_admin ? (
              <Dialog open={modal_abierto} onOpenChange={set_modal_abierto}>
                {/* @ts-ignore */}
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="h-9 px-3 bg-[#17B4C4] hover:bg-[#17B4C4]/90 text-[#063A6B] font-bold rounded-lg text-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Nueva Sede
                  </Button>
                </DialogTrigger>
                <DialogContent
                  showCloseButton={false}
                  className="sm:max-w-[460px] max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white rounded-2xl border-[#E3DCCB] shadow-2xl"
                >
                  <DialogHeader className="p-6 pb-4 border-b border-[#E3DCCB] shrink-0 bg-white">
                    <DialogTitle className="text-base font-bold text-[#063A6B] flex items-center gap-2">
                      <Building className="w-5 h-5 text-[#17B4C4]" />
                      Registrar Sede y Bloques Institucionales
                    </DialogTitle>
                  </DialogHeader>

                  <form onSubmit={manejarCrearSede} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                    <DialogBody className="p-6 space-y-3 overflow-y-auto flex-1 min-h-0">
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
                          <Label className="text-xs font-semibold">Latitud WGS84</Label>
                          <Input
                            value={lat_nueva}
                            onChange={(e) => set_lat_nueva(e.target.value)}
                            required
                            className="h-9 font-mono text-xs border-[#E3DCCB]"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold">Longitud WGS84</Label>
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
                      <div className="p-3 bg-slate-50 border border-[#E3DCCB] rounded-xl text-xs space-y-2">
                        <Label className="font-semibold text-[#063A6B] flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-[#17B4C4]" />
                          Estructura de Bloques
                        </Label>
                        <label className="flex items-center gap-2 cursor-pointer text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={incluir_bloque_b}
                            onChange={(e) => set_incluir_bloque_b(e.target.checked)}
                            className="rounded border-[#E3DCCB] text-[#063A6B]"
                          />
                          <span>Configurar automáticamente Bloque A y Bloque B</span>
                        </label>
                      </div>
                    </DialogBody>

                    <DialogFooter className="p-4 px-6 border-t border-[#E3DCCB] bg-[#F8F9FA]/90 shrink-0 mt-auto flex sm:justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => set_modal_abierto(false)}
                        className="h-9 border-[#E3DCCB] rounded-xl hover:bg-slate-100"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        className="h-9 bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold rounded-xl shadow-sm"
                      >
                        Guardar Sede y Bloques
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            ) : (
              <Badge variant="outline" className="text-[11px] text-amber-700 border-amber-300 bg-amber-50 gap-1">
                <Lock className="w-3 h-3" /> Solo Admin
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-3 space-y-2 overflow-y-auto max-h-[500px]">
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

              {/* Lista compacta de bloques de la sede */}
              <div className="mt-2 flex flex-wrap gap-1">
                {s.bloques.map((blq) => (
                  <span
                    key={blq.id}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-[#063A6B] font-medium"
                  >
                    {blq.nombre.split(" ")[0]} {blq.nombre.split(" ")[1]}
                  </span>
                ))}
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
                Geocerca: {sede_seleccionada.nombre}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Perímetro geodésico Haversine para validación biométrica de ingreso y salida.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-[#063A6B] text-[#F8C766] font-mono text-xs px-3 py-1">
                Radio: {radio_editado} m
              </Badge>
              {!es_admin && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-xs">
                  Modo Consulta
                </Badge>
              )}
            </div>
          </div>

          {/* Selector de Bloques de la Sede Seleccionada */}
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pt-2 border-t border-[#E3DCCB]/40">
            <span className="text-xs font-semibold text-[#063A6B] flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#17B4C4]" />
              Bloque:
            </span>
            {sede_seleccionada.bloques.map((blq) => (
              <Button
                key={blq.id}
                size="sm"
                variant={bloque_activo.id === blq.id ? "default" : "outline"}
                onClick={() => set_bloque_activo(blq)}
                className={`h-7 px-2.5 text-xs rounded-lg ${
                  bloque_activo.id === blq.id
                    ? "bg-[#063A6B] text-white"
                    : "border-[#E3DCCB] text-[#063A6B]"
                }`}
              >
                {blq.nombre}
              </Button>
            ))}
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

            {/* Marcador central del Bloque activo */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#063A6B] border-2 border-white shadow-lg flex items-center justify-center text-white">
                <MapPin className="w-5 h-5 text-[#F8C766]" />
              </div>
              <span className="mt-1 px-2 py-0.5 bg-black/75 text-white text-[10px] font-mono rounded backdrop-blur-sm">
                {bloque_activo.nombre}: {bloque_activo.latitud.toFixed(6)}, {bloque_activo.longitud.toFixed(6)}
              </span>
            </div>

            {/* Simulación de punto de becario */}
            <div className="absolute top-12 right-20 flex items-center gap-1 z-10">
              <div className="w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-emerald-400/30" />
              <span className="text-[10px] font-mono text-emerald-300 bg-black/60 px-1.5 py-0.5 rounded">
                GPS Becario (En rango de Bloque)
              </span>
            </div>
          </div>

          {/* Controles de Ajuste de Geocerca (Solo editable por Administrador) */}
          <div className="p-4 bg-muted/30 rounded-xl border border-[#E3DCCB]/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-[#063A6B] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Calibración del Perímetro de Tolerancia
                  {!es_admin && (
                    <Badge variant="outline" className="text-[10px] text-amber-700 border-amber-300">
                      Solo Administrador
                    </Badge>
                  )}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Ajusta la tolerancia para amortiguar el error atmosférico de GPS en dispositivos móviles (estándar: 50m a 100m).
                </p>
              </div>

              {es_admin && (
                <Button
                  size="sm"
                  onClick={manejarActualizarRadio}
                  className="h-9 px-4 bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold rounded-lg text-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Guardar Ajuste
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Slider
                min={20}
                max={200}
                step={5}
                disabled={!es_admin}
                value={[radio_editado]}
                onValueChange={(val) =>
                  es_admin && set_radio_editado(Array.isArray(val) ? val[0] : (val as unknown as number))
                }
                className={`flex-1 ${es_admin ? "cursor-pointer" : "opacity-60 cursor-not-allowed"}`}
              />
              <div className="w-24">
                <Input
                  type="number"
                  disabled={!es_admin}
                  value={radio_editado}
                  onChange={(e) =>
                    es_admin && set_radio_editado(parseInt(e.target.value, 10) || 50)
                  }
                  className="h-9 font-mono text-xs text-center border-[#E3DCCB] disabled:bg-slate-100 disabled:opacity-75"
                />
              </div>
            </div>

            {!es_admin && (
              <p className="text-[11px] text-amber-800 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                La calibración de radios y la creación de sedes o bloques requieren perfil de Administrador Institucional.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
