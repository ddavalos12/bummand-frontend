"use client";

import { useState, useEffect, useCallback } from "react";
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
  Loader2,
} from "lucide-react";
import { VisorGoogleMapsGeocerca } from "./visor-google-maps-geocerca";
import { SelectorUbicacionGoogleMaps } from "./selector-ubicacion-google-maps";
import { useGoogleMaps } from "@/hooks/use-google-maps";
import { usarAutenticacion } from "@/contextos/autenticacion-contexto";
import { useConfirmacionDialogo } from "@/hooks/useConfirmacionDialogo";
import { clienteApi } from "@/lib/cliente-api";
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

function mapearLugarPractica(lugar: any, conteo_becarios: Map<number, number>): SedePractica {
  const lat = Number(lugar.latitud) || -16.500054;
  const lng = Number(lugar.longitud) || -68.173455;
  const radio = Number(lugar.radio_tolerancia_m ?? lugar.radioToleranciaM ?? 60) || 60;
  const nombres_bloques: string[] = Array.isArray(lugar.bloques) && lugar.bloques.length > 0
    ? lugar.bloques
    : ["Bloque A (Administración Central)"];

  const bloques: BloqueSede[] = nombres_bloques.map((nombre_blq, idx) => ({
    id: `bloque-${idx + 1}`,
    nombre: nombre_blq,
    descripcion: idx === 0 ? (lugar.direccion || lugar.nombre) : `${lugar.nombre} · ${nombre_blq}`,
    latitud: idx === 0 ? lat : Number((lat + idx * 0.00014).toFixed(6)),
    longitud: idx === 0 ? lng : Number((lng + idx * 0.00025).toFixed(6)),
  }));

  return {
    id: Number(lugar.id),
    nombre: lugar.nombre || `Sede #${lugar.id}`,
    direccion: lugar.direccion || "",
    latitud: lat,
    longitud: lng,
    radio_tolerancia_m: radio,
    becarios_asignados: conteo_becarios.get(Number(lugar.id)) || 0,
    bloques,
  };
}

export function MapaLugaresPractica() {
  const { usuario } = usarAutenticacion();
  const es_admin = usuario?.rol === "administrador";

  const [sedes, set_sedes] = useState<SedePractica[]>([]);
  const [cargando_sedes, set_cargando_sedes] = useState<boolean>(true);
  const [sede_seleccionada, set_sede_seleccionada] = useState<SedePractica | null>(null);
  const [bloque_activo, set_bloque_activo] = useState<BloqueSede | null>(null);
  const [radio_editado, set_radio_editado] = useState<number>(60);
  const [modal_abierto, set_modal_abierto] = useState(false);

  const cargarSedesDesdeBd = useCallback(async (id_preferido?: number) => {
    set_cargando_sedes(true);
    try {
      const [lugares, becarios] = await Promise.all([
        clienteApi.get<any[]>("/api/lugares-practica"),
        clienteApi.get<any[]>("/api/becarios").catch(() => []),
      ]);

      const conteo = new Map<number, number>();
      if (Array.isArray(becarios)) {
        for (const b of becarios) {
          const lp_id = Number(b.lugar_practica_id || b.lugar_practica?.id || 0);
          if (lp_id > 0) conteo.set(lp_id, (conteo.get(lp_id) || 0) + 1);
        }
      }

      if (Array.isArray(lugares)) {
        const mapeadas = lugares.map((l) => mapearLugarPractica(l, conteo));
        set_sedes(mapeadas);
        if (mapeadas.length > 0) {
          const objetivo =
            (id_preferido ? mapeadas.find((s) => s.id === id_preferido) : null) ||
            mapeadas[0];
          set_sede_seleccionada(objetivo);
          set_bloque_activo(objetivo.bloques[0] || null);
          set_radio_editado(objetivo.radio_tolerancia_m);
        } else {
          set_sede_seleccionada(null);
          set_bloque_activo(null);
        }
      }
    } catch {
      toast.error("No se pudieron cargar las sedes desde la base de datos.");
    } finally {
      set_cargando_sedes(false);
    }
  }, []);

  useEffect(() => {
    cargarSedesDesdeBd();
  }, [cargarSedesDesdeBd]);

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

  const manejarActualizarRadio = async () => {
    if (!es_admin || !sede_seleccionada) {
      toast.error("Permiso denegado: Solo el Administrador puede modificar parámetros de geocerca.");
      return;
    }
    try {
      await clienteApi.put(`/api/lugares-practica/${sede_seleccionada.id}`, {
        radio_tolerancia_m: radio_editado,
      });
      set_sedes((prev) =>
        prev.map((s) => (s.id === sede_seleccionada.id ? { ...s, radio_tolerancia_m: radio_editado } : s))
      );
      set_sede_seleccionada((prev) => (prev ? { ...prev, radio_tolerancia_m: radio_editado } : prev));
      toast.success(`Geocerca actualizada en base de datos: Radio calibrado a ${radio_editado} metros.`);
    } catch {
      toast.error("No se pudo actualizar el radio de geocerca en la base de datos.");
    }
  };

  const manejarCrearSede = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!es_admin) {
      toast.error("Permiso denegado: Solo el Administrador puede crear sedes y bloques.");
      return;
    }

    const lat = parseFloat(lat_nueva);
    const lng = parseFloat(lng_nueva);
    const radio = parseInt(radio_nuevo, 10) || 80;
    const bloques_nombres = incluir_bloque_b
      ? ["Bloque A (Principal)", "Bloque B (Auditorio / Servicios)"]
      : ["Bloque A (Principal)"];

    try {
      const creada = await clienteApi.post<any>("/api/lugares-practica", {
        nombre: nombre_sede.trim(),
        direccion: dir_sede.trim(),
        latitud: lat,
        longitud: lng,
        radio_tolerancia_m: radio,
        bloques: bloques_nombres,
      });
      await cargarSedesDesdeBd(creada?.id);
      set_nombre_sede("");
      set_dir_sede("");
      set_modal_abierto(false);
      toast.success(`Sede "${nombre_sede.trim()}" registrada en base de datos.`);
    } catch {
      toast.error("No se pudo registrar la sede en la base de datos.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Columna Izquierda: Lista de Sedes */}
      <Card className="border-[#E5E7EB] shadow-sm bg-white rounded-xl lg:col-span-1 flex flex-col">
        <CardHeader className="pb-3 border-b border-[#E5E7EB]/60">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold font-display text-[#035683]">
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
                    className="h-9 px-3 bg-[#00ABBD] hover:bg-[#00ABBD]/90 text-[#035683] font-bold rounded-lg text-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Nueva Sede
                  </Button>
                </DialogTrigger>
                <DialogContent
                  showCloseButton={false}
                  className="sm:max-w-[560px] max-h-[92vh] flex flex-col p-0 overflow-hidden bg-white rounded-2xl border-[#E5E7EB] shadow-2xl"
                >
                  <DialogHeader className="p-6 pb-4 border-b border-[#E5E7EB] shrink-0 bg-white">
                    <DialogTitle className="text-base font-bold text-[#035683] flex items-center gap-2">
                      <Building className="w-5 h-5 text-[#00ABBD]" />
                      Registrar Sede y Bloques Institucionales
                    </DialogTitle>
                  </DialogHeader>

                  <form onSubmit={manejarCrearSede} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                    <DialogBody className="p-6 space-y-3 overflow-y-auto flex-1 min-h-0">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Nombre de la Sede</Label>
                        <Input
                          placeholder="Ej. Oficina Central Bloque B"
                          value={nombre_sede}
                          onChange={(e) => set_nombre_sede(e.target.value)}
                          required
                          className="h-9 border-[#E5E7EB]"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Dirección</Label>
                        <Input
                          placeholder="Av. Ladislao Cabrera"
                          value={dir_sede}
                          onChange={(e) => set_dir_sede(e.target.value)}
                          required
                          className="h-9 border-[#E5E7EB]"
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
                            className="h-9 font-mono text-xs border-[#E5E7EB]"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold">Longitud WGS84</Label>
                          <Input
                            value={lng_nueva}
                            onChange={(e) => set_lng_nueva(e.target.value)}
                            required
                            className="h-9 font-mono text-xs border-[#E5E7EB]"
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
                          className="h-9 font-mono text-xs border-[#E5E7EB]"
                        />
                      </div>
                      <div className="p-3 bg-slate-50 border border-[#E5E7EB] rounded-xl text-xs space-y-2">
                        <Label className="font-semibold text-[#035683] flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-[#00ABBD]" />
                          Estructura de Bloques
                        </Label>
                        <label className="flex items-center gap-2 cursor-pointer text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={incluir_bloque_b}
                            onChange={(e) => set_incluir_bloque_b(e.target.checked)}
                            className="rounded border-[#E5E7EB] text-[#035683]"
                          />
                          <span>Configurar automáticamente Bloque A y Bloque B</span>
                        </label>
                      </div>
                    </DialogBody>

                    <DialogFooter className="p-4 px-6 border-t border-[#E5E7EB] bg-[#F8F9FA]/90 shrink-0 mt-auto flex sm:justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={intentarCerrarModalSede}
                        className="h-9 border-[#E5E7EB] rounded-xl hover:bg-slate-100"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        className="h-9 bg-[#035683] hover:bg-[#035683]/90 text-white font-bold rounded-xl shadow-sm"
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
          {cargando_sedes ? (
            <div className="py-10 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-[#00ABBD]" />
              <span>Cargando sedes desde la base de datos...</span>
            </div>
          ) : sedes.length === 0 ? (
            <div className="py-10 text-center text-xs text-muted-foreground">
              No hay sedes registradas en la base de datos.
            </div>
          ) : (
            sedes.map((s) => (
            <div
              key={s.id}
              onClick={() => manejarSeleccionarSede(s)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                sede_seleccionada?.id === s.id
                  ? "bg-[#00ABBD]/10 border-[#00ABBD] shadow-sm"
                  : "bg-white border-[#E5E7EB]/60 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#035683]">{s.nombre}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.direccion}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge variant="outline" className="font-mono text-[10px] border-[#E5E7EB] text-[#035683]">
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
                          onConfirmar: async () => {
                            await clienteApi.delete(`/api/lugares-practica/${s.id}`);
                            await cargarSedesDesdeBd();
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
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-[#035683] font-medium"
                  >
                    {blq.nombre.split(" ")[0]} {blq.nombre.split(" ")[1]}
                  </span>
                ))}
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                <span>{s.latitud.toFixed(4)}, {s.longitud.toFixed(4)}</span>
                <span className="text-[#035683] font-semibold">{s.becarios_asignados} becarios</span>
              </div>
            </div>
          )))}
        </CardContent>
      </Card>

      {/* Columna Derecha: Mapa Interactivo y Configuración de Geocerca */}
      <Card className="border-[#E5E7EB] shadow-sm bg-white rounded-xl lg:col-span-2 flex flex-col">
        {!sede_seleccionada || !bloque_activo ? (
          <CardContent className="p-10 text-center text-xs text-muted-foreground flex-1 flex items-center justify-center">
            {cargando_sedes
              ? "Sincronizando visor geodésico con la base de datos..."
              : "Seleccione o registre una sede para configurar su geocerca."}
          </CardContent>
        ) : (
        <>
        <CardHeader className="pb-3 border-b border-[#E5E7EB]/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-bold font-display text-[#035683] flex items-center gap-2">
                <Navigation className="w-5 h-5 text-[#00ABBD]" />
                Geocerca: {sede_seleccionada.nombre}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Perímetro geodésico Haversine para validación biométrica de ingreso y salida.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-[#035683] text-[#FFB600] font-mono text-xs px-3 py-1">
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
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pt-2 border-t border-[#E5E7EB]/40">
            <span className="text-xs font-semibold text-[#035683] flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#00ABBD]" />
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
                    ? "bg-[#035683] text-white"
                    : "border-[#E5E7EB] text-[#035683]"
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
          <div className="p-4 bg-muted/30 rounded-xl border border-[#E5E7EB]/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-[#035683] flex items-center gap-2">
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
                  className="h-9 px-4 bg-[#035683] hover:bg-[#035683]/90 text-white font-bold rounded-lg text-xs flex items-center gap-1.5"
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
                  className="h-9 font-mono text-xs text-center border-[#E5E7EB] disabled:bg-slate-100 disabled:opacity-75"
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
        </>
        )}
      </Card>

      {/* Modal de Configuración de Clave API de Google Maps */}
      <Dialog open={modal_clave_abierto} onOpenChange={set_modal_clave_abierto}>
        <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden bg-white rounded-2xl border-[#E5E7EB] shadow-2xl">
          <DialogHeader className="p-6 pb-4 border-b border-[#E5E7EB] bg-slate-50">
            <DialogTitle className="text-base font-bold text-[#035683] flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#00ABBD]" />
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
                className="h-10 font-mono text-xs border-[#E5E7EB]"
              />
              <p className="text-[11px] text-muted-foreground">
                Puede configurarse de forma permanente en la variable de entorno{" "}
                <code className="text-[#035683] font-bold">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>{" "}
                de su archivo <code>.env.local</code>.
              </p>
            </div>

            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#00ABBD]" />
                Modo de Desarrollo y Evaluación
              </p>
              <p className="text-[11px] text-blue-800">
                Si deja este campo vacío, Google Maps funcionará en modo de evaluación/desarrollo local. Para producción institucional, asigne su clave con los servicios <em>Maps JavaScript API</em> y <em>Places API</em> habilitados en Google Cloud Console.
              </p>
            </div>
          </DialogBody>

          <DialogFooter className="p-4 px-6 border-t border-[#E5E7EB] bg-slate-50 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => set_modal_clave_abierto(false)}
              className="h-9 border-[#E5E7EB] rounded-xl text-xs"
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
              className="h-9 bg-[#035683] hover:bg-[#035683]/90 text-white font-bold rounded-xl text-xs shadow-sm"
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
