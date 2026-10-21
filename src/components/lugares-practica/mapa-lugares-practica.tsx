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
  Trash2,
  KeyRound,
  Sparkles,
} from "lucide-react";
import { VisorGoogleMapsGeocerca } from "./visor-google-maps-geocerca";
import { SelectorUbicacionGoogleMaps } from "./selector-ubicacion-google-maps";
import { useGoogleMaps } from "@/hooks/use-google-maps";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import { useConfirmacionDialogo } from "@/hooks/useConfirmacionDialogo";
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

  // Integración de Google Maps API (SDK y clave)
  const { clave_api, guardarClaveApi } = useGoogleMaps();
  const [modal_clave_abierto, set_modal_clave_abierto] = useState(false);
  const [clave_input, set_clave_input] = useState(clave_api);

  // Formulario nueva sede
  const [nombre_sede, set_nombre_sede] = useState("");
  const [dir_sede, set_dir_sede] = useState("");
  const [lat_nueva, set_lat_nueva] = useState("-16.500000");
  const [lng_nueva, set_lng_nueva] = useState("-68.170000");
  const [radio_nuevo, set_radio_nuevo] = useState("80");
  const [incluir_bloque_b, set_incluir_bloque_b] = useState(true);

  const {
    confirmarCierreSinCompletar,
    confirmarEliminacionRegistro,
    DialogoConfirmacionInstitucional,
  } = useConfirmacionDialogo();

  const tiene_cambios_sede =
    nombre_sede.trim() !== "" ||
    dir_sede.trim() !== "";

  const intentarCerrarModalSede = () => {
    confirmarCierreSinCompletar(
      tiene_cambios_sede,
      () => {
        set_modal_abierto(false);
        set_nombre_sede("");
        set_dir_sede("");
      },
      "Registro de Sede y Geocerca"
    );
  };

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
              <Dialog
                open={modal_abierto}
                onOpenChange={(ab) => {
                  if (!ab) intentarCerrarModalSede();
                  else set_modal_abierto(true);
                }}
              >
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
                  className="sm:max-w-[560px] max-h-[92vh] flex flex-col p-0 overflow-hidden bg-white rounded-2xl border-[#E3DCCB] shadow-2xl"
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

                      {/* Selector interactivo con Google Maps API dentro del Dialog */}
                      <SelectorUbicacionGoogleMaps
                        latitud={parseFloat(lat_nueva) || -16.500053}
                        longitud={parseFloat(lng_nueva) || -68.173455}
                        radio_tolerancia_m={parseInt(radio_nuevo, 10) || 80}
                        alCambiarUbicacion={(lat, lng) => {
                          set_lat_nueva(lat.toFixed(6));
                          set_lng_nueva(lng.toFixed(6));
                        }}
                      />

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
                        onClick={intentarCerrarModalSede}
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
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge variant="outline" className="font-mono text-[10px] border-[#E3DCCB] text-[#063A6B]">
                    {s.radio_tolerancia_m} m
                  </Badge>
                  {es_admin && sedes.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmarEliminacionRegistro({
                          titulo: "¿Eliminar sede institucional?",
                          descripcion: `¿Está seguro de eliminar la sede "${s.nombre}" (${s.direccion}) y sus geocercas asociadas?`,
                          nombre_item: s.nombre,
                          onConfirmar: () => {
                            const nuevas = sedes.filter((item) => item.id !== s.id);
                            set_sedes(nuevas);
                            if (sede_seleccionada.id === s.id && nuevas.length > 0) {
                              manejarSeleccionarSede(nuevas[0]);
                            }
                          },
                          mensaje_exito: `Sede "${s.nombre}" eliminada exitosamente`,
                        });
                      }}
                      className="h-6 w-6 p-0 text-[#E2694B] hover:text-[#c9573b] hover:bg-rose-50 rounded-lg text-xs"
                      title="Eliminar sede"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
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
          {/* Visor interactivo oficial de Google Maps API con Geocerca satelital */}
          <VisorGoogleMapsGeocerca
            sede={sede_seleccionada}
            bloque_activo={bloque_activo}
            radio_tolerancia_m={radio_editado}
            alSeleccionarBloque={(blq) => set_bloque_activo(blq)}
            alAbrirAjusteClave={() => set_modal_clave_abierto(true)}
          />

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

      {/* Modal de Configuración de Clave API de Google Maps */}
      <Dialog open={modal_clave_abierto} onOpenChange={set_modal_clave_abierto}>
        <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden bg-white rounded-2xl border-[#E3DCCB] shadow-2xl">
          <DialogHeader className="p-6 pb-4 border-b border-[#E3DCCB] bg-slate-50">
            <DialogTitle className="text-base font-bold text-[#063A6B] flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#17B4C4]" />
              Configuración de Google Maps API Key
            </DialogTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Integración geodésica satelital para validación biométrica de sedes y bloques.
            </CardDescription>
          </DialogHeader>

          <DialogBody className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#122029]">
                Google Maps API Key (JavaScript API)
              </Label>
              <Input
                placeholder="AIzaSy..."
                value={clave_input}
                onChange={(e) => set_clave_input(e.target.value)}
                className="h-10 font-mono text-xs border-[#E3DCCB]"
              />
              <p className="text-[11px] text-muted-foreground">
                Puede configurarse de forma permanente en la variable de entorno{" "}
                <code className="text-[#063A6B] font-bold">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>{" "}
                de su archivo <code>.env.local</code>.
              </p>
            </div>

            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#17B4C4]" />
                Modo de Desarrollo y Evaluación
              </p>
              <p className="text-[11px] text-blue-800">
                Si deja este campo vacío, Google Maps funcionará en modo de evaluación/desarrollo local. Para producción institucional, asigne su clave con los servicios <em>Maps JavaScript API</em> y <em>Places API</em> habilitados en Google Cloud Console.
              </p>
            </div>
          </DialogBody>

          <DialogFooter className="p-4 px-6 border-t border-[#E3DCCB] bg-slate-50 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => set_modal_clave_abierto(false)}
              className="h-9 border-[#E3DCCB] rounded-xl text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                guardarClaveApi(clave_input);
                set_modal_clave_abierto(false);
                toast.success("Clave de Google Maps actualizada.");
              }}
              className="h-9 bg-[#063A6B] hover:bg-[#063A6B]/90 text-white font-bold rounded-xl text-xs shadow-sm"
            >
              Guardar Clave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmación Institucional */}
      {DialogoConfirmacionInstitucional}
    </div>
  );
}
